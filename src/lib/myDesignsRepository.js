"use client";

import { createClient } from './supabaseClient';
import {
  getFavoriteLogoKey,
  notifyFavoriteLogosChanged,
} from './favoriteLogosStorage';

const DESIGNS_TABLE = 'designs';
const DESIGNS_CACHE_KEY = 'my-designs:db-cache:v1';
const AUTH_REQUIRED_ERROR_CODE = 'AUTH_REQUIRED';
const DESIGNS_CACHE_TTL_MS = 45 * 1000;

let designsMemoryCache = {
  userId: null,
  designs: [],
  fetchedAt: 0,
};
let resolveSupabaseUserPromise = null;
let designsFetchPromise = null;
let designsFetchPromiseUserId = null;

const resolveDesignIdentityKey = (design) => (
  (typeof design?.favoriteId === 'string' && design.favoriteId.trim())
  || (typeof design?.favoriteRowKey === 'string' && design.favoriteRowKey.trim())
  || (typeof design?.id === 'string' && design.id.trim())
  || null
);

const dedupeDesignList = (designs) => {
  const safeDesigns = Array.isArray(designs) ? designs.filter(Boolean) : [];
  const map = new Map();

  for (const design of safeDesigns) {
    const key = resolveDesignIdentityKey(design);
    if (!key) {
      continue;
    }

    const existing = map.get(key);
    if (!existing) {
      map.set(key, design);
      continue;
    }

    // Keep the newest copy if duplicates slip in (can happen during optimistic + realtime updates).
    const existingUpdatedAt = typeof existing?.updatedAt === 'number' ? existing.updatedAt : -1;
    const nextUpdatedAt = typeof design?.updatedAt === 'number' ? design.updatedAt : -1;
    map.set(key, nextUpdatedAt >= existingUpdatedAt ? design : existing);
  }

  // Preserve incoming order (minus duplicates).
  const result = [];
  const seen = new Set();
  for (const design of safeDesigns) {
    const key = resolveDesignIdentityKey(design);
    if (!key || seen.has(key)) continue;
    const resolved = map.get(key);
    if (resolved) {
      seen.add(key);
      result.push(resolved);
    }
  }

  return result;
};

const hashString = (value) => {
  const input = String(value || '');
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
};

const normalizeDesignJson = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return {};

  const trimmed = value.trim();
  if (!trimmed) return {};

  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const toIsoTimestamp = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    const parsedTime = Date.parse(normalized);
    if (Number.isNaN(parsedTime)) {
      return null;
    }

    return new Date(parsedTime).toISOString();
  }

  return null;
};

const toTimestampNumber = (value, fallback = null) => {
  const isoValue = toIsoTimestamp(value);
  if (!isoValue) {
    return fallback;
  }

  const parsedTime = Date.parse(isoValue);
  return Number.isNaN(parsedTime) ? fallback : parsedTime;
};

const resolveBooleanStatus = (value, fallback = false) => (
  typeof value === 'boolean' ? value : fallback
);

const createAuthRequiredError = () => {
  const error = new Error('Sign in is required to manage your designs.');
  error.code = AUTH_REQUIRED_ERROR_CODE;
  return error;
};

export const isAuthRequiredError = (error) => error?.code === AUTH_REQUIRED_ERROR_CODE;

export const isSupabaseAuthSessionMissingError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.name === 'AuthSessionMissingError' || message.includes('auth session missing');
};

// Kept for backward-compat with existing UI flows. No schema upgrade is required for the designs table.
export const getLogoLibraryUpgradeMessage = (purpose = 'My Designs') => (
  `${purpose} requires the public.${DESIGNS_TABLE} table to exist and be accessible for the signed-in user.`
);
export const isLogoLibraryUpgradeRequiredError = () => false;

const getDesignKey = (design, existingJson = null) => (
  (typeof design?.favoriteId === 'string' && design.favoriteId.trim()) ||
  (typeof existingJson?.designKey === 'string' && existingJson.designKey.trim()) ||
  getFavoriteLogoKey(design)
);

const buildContentHash = (design = {}) => hashString(JSON.stringify({
  businessName: design.businessName || null,
  slogan: design.slogan || null,
  industryLabel: design.industryLabel || null,
  themeColor: design.themeColor || null,
  backgroundColor: design.backgroundColor || null,
  svgMarkup: typeof design.svgMarkup === 'string' ? design.svgMarkup : null,
  previewDataUrl: typeof design.previewDataUrl === 'string' ? design.previewDataUrl : null,
  editablePayload: design.editablePayload && typeof design.editablePayload === 'object' ? design.editablePayload : null,
}));

const readDesignsCache = () => {
  if (typeof window === 'undefined') {
    return { userId: null, designs: [], fetchedAt: 0 };
  }

  try {
    const rawValue = window.sessionStorage.getItem(DESIGNS_CACHE_KEY);
    if (!rawValue) {
      return { userId: null, designs: [], fetchedAt: 0 };
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== 'object') {
      return { userId: null, designs: [], fetchedAt: 0 };
    }

    return {
      userId: typeof parsedValue.userId === 'string' ? parsedValue.userId : null,
      designs: Array.isArray(parsedValue.designs) ? parsedValue.designs : [],
      fetchedAt: typeof parsedValue.fetchedAt === 'number' && Number.isFinite(parsedValue.fetchedAt)
        ? parsedValue.fetchedAt
        : 0,
    };
  } catch {
    return { userId: null, designs: [], fetchedAt: 0 };
  }
};

const writeDesignsCache = (userId, designs, options = {}) => {
  const fetchedAt = typeof options.fetchedAt === 'number' && Number.isFinite(options.fetchedAt)
    ? options.fetchedAt
    : Date.now();

  designsMemoryCache = {
    userId: typeof userId === 'string' ? userId : null,
    designs: dedupeDesignList(designs),
    fetchedAt,
  };

  if (typeof window === 'undefined') {
    return designsMemoryCache.designs;
  }

  try {
    window.sessionStorage.setItem(
      DESIGNS_CACHE_KEY,
      JSON.stringify({
        userId: designsMemoryCache.userId,
        designs: designsMemoryCache.designs,
        fetchedAt: designsMemoryCache.fetchedAt,
      })
    );
  } catch {
  }

  return designsMemoryCache.designs;
};

const clearDesignsCache = () => writeDesignsCache(null, []);

export const peekLogoLibraryCache = (userId, filter = 'all') => {
  const safeUserId = typeof userId === 'string' ? userId : null;
  if (!safeUserId) {
    return [];
  }

  const cached = readDesignsCache();
  const baseDesigns = cached.userId === safeUserId ? cached.designs : [];
  return filterLogoLibraryItems(baseDesigns, filter);
};

export const peekFavoriteLogosCache = (userId) => peekLogoLibraryCache(userId, 'favorites');
export const peekSavedLogosCache = (userId) => peekLogoLibraryCache(userId, 'saved');
export const peekDownloadedLogosCache = (userId) => peekLogoLibraryCache(userId, 'downloads');

export const filterLogoLibraryItems = (designs, filter = 'all') => {
  const safeDesigns = Array.isArray(designs) ? designs.filter(Boolean) : [];

  if (filter === 'favorites') {
    return safeDesigns.filter((item) => item.isFavorite);
  }
  if (filter === 'saved') {
    return safeDesigns.filter((item) => item.isSaved);
  }
  if (filter === 'downloads') {
    return safeDesigns.filter((item) => item.isDownloaded);
  }

  return safeDesigns;
};

export const getLogoLibraryCounts = (designs) => {
  const safeDesigns = Array.isArray(designs) ? designs : [];
  return {
    favorites: safeDesigns.filter((item) => item?.isFavorite).length,
    saved: safeDesigns.filter((item) => item?.isSaved).length,
    downloads: safeDesigns.filter((item) => item?.isDownloaded).length,
  };
};

const isDesignsCacheFresh = (userId, maxAge = DESIGNS_CACHE_TTL_MS) => (
  designsMemoryCache.userId === userId &&
  (Date.now() - designsMemoryCache.fetchedAt) < maxAge
);

const mapDesignRow = (row) => {
  const json = normalizeDesignJson(row?.design_json);
  const status = json.status || json.statuses || {};
  const timestamps = json.timestamps || {};
  const designKey = typeof json.designKey === 'string' && json.designKey.trim()
    ? json.designKey.trim()
    : null;
  const imagePathFromJson = typeof json.imagePath === 'string'
    ? json.imagePath
    : (typeof json.image_path === 'string' ? json.image_path : null);

  return {
    favoriteId: designKey || getFavoriteLogoKey({
      businessName: json.businessName || row?.user_id || 'brand',
      id: row?.id,
    }),
    favoriteRowKey: row?.id || null,
    id: row?.id || null,
    designId: row?.id || null,
    name: json.name || 'Logo Design',
    businessName: json.businessName || 'Brand',
    slogan: json.slogan || '',
    industryLabel: json.industryLabel || 'Brand identity',
    themeColor: json.themeColor || '#111827',
    backgroundColor: json.backgroundColor || '#ffffff',
    svgMarkup: typeof json.svgMarkup === 'string' ? json.svgMarkup : null,
    editablePayload: json.editablePayload && typeof json.editablePayload === 'object' ? json.editablePayload : null,
    previewDataUrl: typeof json.previewDataUrl === 'string' ? json.previewDataUrl : null,
    fallbackUrl: typeof json.fallbackUrl === 'string' ? json.fallbackUrl : null,
    isFavorite: resolveBooleanStatus(status.isFavorite ?? json.isFavorite, false),
    isSaved: resolveBooleanStatus(status.isSaved ?? json.isSaved, false),
    isDownloaded: resolveBooleanStatus(status.isDownloaded ?? json.isDownloaded, false),
    favoritedAt: toTimestampNumber(timestamps.favoritedAt ?? json.favoritedAt, null),
    savedAt: toTimestampNumber(timestamps.savedAt ?? json.savedAt, null),
    downloadedAt: toTimestampNumber(timestamps.downloadedAt ?? json.downloadedAt, null),
    updatedAt: toTimestampNumber(row?.updated_at ?? json.updatedAt, Date.now()),
    imagePath: row?.image_path || imagePathFromJson || null,
    contentHash: typeof json.contentHash === 'string' ? json.contentHash : null,
    parentDesignKey: typeof json.parentDesignKey === 'string' ? json.parentDesignKey : null,
  };
};

const resolveSupabaseUser = async () => {
  if (resolveSupabaseUserPromise) {
    return resolveSupabaseUserPromise;
  }

  resolveSupabaseUserPromise = (async () => {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      if (isSupabaseAuthSessionMissingError(error)) {
        return { supabase, user: null };
      }
      throw error;
    }

    return { supabase, user: session?.user || null };
  })();

  try {
    return await resolveSupabaseUserPromise;
  } finally {
    resolveSupabaseUserPromise = null;
  }
};

const fetchDesignRowsForUser = async (supabase, userId) => {
  const response = await fetch('/api/designs');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch designs: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchDesignsForUser = async (supabase, userId) => {
  const rows = await fetchDesignRowsForUser(supabase, userId);
  const mapped = rows.map(mapDesignRow);
  return writeDesignsCache(userId, mapped);
};

export const loadLogoLibrary = async ({
  filter = 'all',
  forceRefresh = false,
  maxAge = DESIGNS_CACHE_TTL_MS,
} = {}) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    clearDesignsCache();
    return [];
  }

  const cachedDesigns = peekLogoLibraryCache(user.id);
  if (!forceRefresh && isDesignsCacheFresh(user.id, maxAge)) {
    return filterLogoLibraryItems(cachedDesigns, filter);
  }

  try {
    if (!forceRefresh && designsFetchPromise && designsFetchPromiseUserId === user.id) {
      const designs = await designsFetchPromise;
      return filterLogoLibraryItems(designs, filter);
    }

    const fetchPromise = fetchDesignsForUser(supabase, user.id);
    designsFetchPromise = fetchPromise;
    designsFetchPromiseUserId = user.id;

    const designs = await fetchPromise;
    return filterLogoLibraryItems(designs, filter);
  } finally {
    if (designsFetchPromiseUserId === user.id) {
      designsFetchPromise = null;
      designsFetchPromiseUserId = null;
    }
  }
};

export const loadFavoriteLogos = async (options = {}) => loadLogoLibrary({ ...options, filter: 'favorites' });
export const loadSavedLogos = async (options = {}) => loadLogoLibrary({ ...options, filter: 'saved' });
export const loadDownloadedLogos = async (options = {}) => loadLogoLibrary({ ...options, filter: 'downloads' });

const findCachedDesignByKey = (userId, designKey) => {
  const current = peekLogoLibraryCache(userId);
  return current.find((item) => item?.favoriteId === designKey || item?.favoriteRowKey === designKey) || null;
};

const fetchDesignRowByKey = async (supabase, userId, designKey) => {
  const safeKey = typeof designKey === 'string' ? designKey.trim() : '';
  if (!safeKey) {
    return null;
  }

  // Preferred: server-side filter by JSON key.
  const { data, error } = await supabase
    .from(DESIGNS_TABLE)
    .select('id, user_id, image_path, design_json, created_at, updated_at')
    .eq('user_id', userId)
    .eq('design_json->>designKey', safeKey)
    .maybeSingle();

  if (!error) {
    return data || null;
  }

  // Fallback: fetch & filter client-side (safe for small libraries).
  const rows = await fetchDesignRowsForUser(supabase, userId);
  return rows.find((row) => normalizeDesignJson(row?.design_json)?.designKey === safeKey) || null;
};

const buildNextDesignJson = (existingJson, design, options = {}, designKey, parentDesignKey = null) => {
  const nowIso = new Date().toISOString();
  const nextContentHash = buildContentHash(design);
  const existingStatus = existingJson?.status || existingJson?.statuses || {};
  const existingTimestamps = existingJson?.timestamps || {};
  const resolvedImagePath = (() => {
    const direct = typeof design?.imagePath === 'string' ? design.imagePath : null;
    if (direct) return direct;

    const legacy = typeof design?.image_path === 'string' ? design.image_path : null;
    if (legacy) return legacy;

    const fallback = typeof design?.fallbackUrl === 'string' ? design.fallbackUrl.trim() : '';
    if (fallback) return fallback;

    const fromJson = typeof existingJson?.imagePath === 'string' ? existingJson.imagePath : null;
    if (fromJson) return fromJson;

    const fromLegacyJson = typeof existingJson?.image_path === 'string' ? existingJson.image_path : null;
    if (fromLegacyJson) return fromLegacyJson;

    const fallbackFromJson = typeof existingJson?.fallbackUrl === 'string' ? existingJson.fallbackUrl.trim() : '';
    if (fallbackFromJson) return fallbackFromJson;

    return null;
  })();

  const nextIsFavorite = resolveBooleanStatus(
    options.isFavorite,
    resolveBooleanStatus(design?.isFavorite, resolveBooleanStatus(existingStatus?.isFavorite ?? existingJson?.isFavorite, false))
  );
  const nextIsSaved = resolveBooleanStatus(
    options.isSaved,
    resolveBooleanStatus(design?.isSaved, resolveBooleanStatus(existingStatus?.isSaved ?? existingJson?.isSaved, false))
  );
  const markDownloaded = Boolean(options.markDownloaded);
  const nextIsDownloaded = resolveBooleanStatus(
    options.isDownloaded,
    markDownloaded || resolveBooleanStatus(design?.isDownloaded, resolveBooleanStatus(existingStatus?.isDownloaded ?? existingJson?.isDownloaded, false))
  );

  const favoritedAt = nextIsFavorite
    ? (toIsoTimestamp(options.favoritedAt) || toIsoTimestamp(design?.favoritedAt) || toIsoTimestamp(existingTimestamps?.favoritedAt ?? existingJson?.favoritedAt) || nowIso)
    : null;
  const savedAt = nextIsSaved
    ? (toIsoTimestamp(options.savedAt) || toIsoTimestamp(design?.savedAt) || toIsoTimestamp(existingTimestamps?.savedAt ?? existingJson?.savedAt) || nowIso)
    : null;
  const downloadedAt = nextIsDownloaded
    ? ((markDownloaded ? nowIso : null) || toIsoTimestamp(options.downloadedAt) || toIsoTimestamp(design?.downloadedAt) || toIsoTimestamp(existingTimestamps?.downloadedAt ?? existingJson?.downloadedAt) || nowIso)
    : null;

  return {
    ...(existingJson && typeof existingJson === 'object' ? existingJson : {}),
    schemaVersion: 1,
    designKey,
    parentDesignKey: parentDesignKey || existingJson?.parentDesignKey || null,
    name: (typeof design?.name === 'string' && design.name.trim()) ? design.name : (existingJson?.name || 'Logo Design'),
    businessName: (typeof design?.businessName === 'string' && design.businessName.trim()) ? design.businessName : (existingJson?.businessName || 'Brand'),
    slogan: typeof design?.slogan === 'string' ? design.slogan : (existingJson?.slogan || ''),
    industryLabel: (typeof design?.industryLabel === 'string' && design.industryLabel.trim()) ? design.industryLabel : (existingJson?.industryLabel || 'Brand identity'),
    themeColor: (typeof design?.themeColor === 'string' && design.themeColor.trim()) ? design.themeColor : (existingJson?.themeColor || '#111827'),
    backgroundColor: (typeof design?.backgroundColor === 'string' && design.backgroundColor.trim()) ? design.backgroundColor : (existingJson?.backgroundColor || '#ffffff'),
    imagePath: resolvedImagePath,
    image_path: resolvedImagePath,
    svgMarkup: typeof design?.svgMarkup === 'string' ? design.svgMarkup : (existingJson?.svgMarkup || null),
    previewDataUrl: typeof design?.previewDataUrl === 'string' ? design.previewDataUrl : (design?.previewDataUrl === null ? null : (existingJson?.previewDataUrl || null)),
    fallbackUrl: typeof design?.fallbackUrl === 'string' ? design.fallbackUrl : (existingJson?.fallbackUrl || null),
    editablePayload: design?.editablePayload && typeof design.editablePayload === 'object'
      ? design.editablePayload
      : (existingJson?.editablePayload || null),
    contentHash: nextContentHash,
    status: {
      isFavorite: nextIsFavorite,
      isSaved: nextIsSaved,
      isDownloaded: nextIsDownloaded,
    },
    timestamps: {
      favoritedAt,
      savedAt,
      downloadedAt,
      updatedAt: nowIso,
    },
  };
};

const replaceDesignInList = (designs, nextDesign) => {
  const safeDesigns = Array.isArray(designs) ? designs : [];
  const designKey = resolveDesignIdentityKey(nextDesign);
  if (!designKey) {
    return safeDesigns;
  }

  const index = safeDesigns.findIndex((item) => {
    if (!item) return false;
    if (item?.favoriteId && nextDesign?.favoriteId && item.favoriteId === nextDesign.favoriteId) return true;
    if (item?.favoriteRowKey && nextDesign?.favoriteRowKey && item.favoriteRowKey === nextDesign.favoriteRowKey) return true;
    if (item?.id && nextDesign?.id && item.id === nextDesign.id) return true;
    return resolveDesignIdentityKey(item) === designKey;
  });
  if (index === -1) {
    return [nextDesign, ...safeDesigns];
  }

  const copy = [...safeDesigns];
  copy[index] = nextDesign;
  return copy;
};

const removeDesignFromList = (designs, designKey) => {
  const safeDesigns = Array.isArray(designs) ? designs : [];
  const safeKey = typeof designKey === 'string' ? designKey : null;
  if (!safeKey) {
    return safeDesigns;
  }

  return safeDesigns.filter((item) => (
    item?.favoriteId !== safeKey &&
    item?.favoriteRowKey !== safeKey &&
    item?.id !== safeKey
  ));
};

const updateDesignsCache = (userId, updater, options = {}) => {
  const previous = peekLogoLibraryCache(userId);
  const next = updater(previous);
  return {
    previousDesigns: previous,
    nextDesigns: writeDesignsCache(userId, next, options),
  };
};

const upsertDesignEntry = async (design, options = {}) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const baseKey = getDesignKey(design);
  const existingCached = findCachedDesignByKey(user.id, baseKey);
  const existingRow = await fetchDesignRowByKey(supabase, user.id, baseKey);
  const existingJson = normalizeDesignJson(existingRow?.design_json || existingCached?.designJson);
  const nextContentHash = buildContentHash(design);
  const existingHash = typeof existingJson?.contentHash === 'string' ? existingJson.contentHash : null;

  const shouldForkVersion = Boolean(options.createNewVersionOnChange && existingHash && existingHash !== nextContentHash);
  const forkKey = shouldForkVersion ? `${baseKey}:${nextContentHash}` : baseKey;
  const parentDesignKey = shouldForkVersion ? baseKey : null;

  const targetRow = shouldForkVersion
    ? await fetchDesignRowByKey(supabase, user.id, forkKey)
    : existingRow;
  const targetJson = normalizeDesignJson(targetRow?.design_json);
  const designKey = getDesignKey({ ...design, favoriteId: forkKey }, targetJson);
  const nextJson = buildNextDesignJson(targetJson, design, options, designKey, parentDesignKey);
  const hasActiveStatuses = Boolean(nextJson?.status?.isFavorite || nextJson?.status?.isSaved || nextJson?.status?.isDownloaded);
  const resolvedRowImagePath = typeof nextJson?.imagePath === 'string'
    ? nextJson.imagePath
    : (typeof design?.imagePath === 'string'
      ? design.imagePath
      : (targetRow?.image_path || existingRow?.image_path || null));

  const optimisticDesign = hasActiveStatuses
    ? mapDesignRow({
        id: targetRow?.id || existingRow?.id || existingCached?.favoriteRowKey || null,
        user_id: user.id,
        image_path: resolvedRowImagePath,
        design_json: nextJson,
        updated_at: new Date().toISOString(),
      })
    : null;

  const { previousDesigns, nextDesigns } = updateDesignsCache(
    user.id,
    (current) => (optimisticDesign
      ? replaceDesignInList(current, optimisticDesign)
      : removeDesignFromList(current, designKey)),
    { fetchedAt: Date.now() }
  );

  if (!hasActiveStatuses) {
    if (targetRow?.id) {
      const { error } = await supabase
        .from(DESIGNS_TABLE)
        .delete()
        .eq('user_id', user.id)
        .eq('id', targetRow.id);

      if (error) {
        writeDesignsCache(user.id, previousDesigns);
        throw error;
      }
    }

    notifyFavoriteLogosChanged();
    return nextDesigns;
  }

  const apiPayload = {
    id: targetRow?.id || existingRow?.id || existingCached?.favoriteRowKey || null,
    designJson: nextJson,
    imagePath: resolvedRowImagePath,
  };

  const response = await fetch('/api/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiPayload),
  });

  if (!response.ok) {
    writeDesignsCache(user.id, previousDesigns);
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to sync design to server');
  }

  const inserted = await response.json();
  if (inserted?.id) {
    const mappedInserted = mapDesignRow(inserted);
    writeDesignsCache(user.id, replaceDesignInList(nextDesigns, mappedInserted), { fetchedAt: Date.now() });
  }

  notifyFavoriteLogosChanged();
  return peekLogoLibraryCache(user.id);
};

export const toggleFavoriteLogo = async (design) => {
  const { user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const key = getDesignKey(design);
  const current = peekLogoLibraryCache(user.id);
  const existing = current.find((item) => item?.favoriteId === key || item?.favoriteRowKey === key) || null;
  const nextIsFavorite = !Boolean(existing?.isFavorite);
  const designs = await upsertDesignEntry(existing || design, { isFavorite: nextIsFavorite });

  return {
    logos: designs,
    isFavorite: nextIsFavorite,
  };
};

export const saveDownloadedLogo = async (design, options = {}) => (
  upsertDesignEntry(design, {
    ...options,
    isFavorite: resolveBooleanStatus(options.isFavorite, resolveBooleanStatus(design?.isFavorite, false)),
    isSaved: resolveBooleanStatus(options.isSaved, resolveBooleanStatus(design?.isSaved, false)),
    isDownloaded: true,
    markDownloaded: true,
  })
);

export const saveSavedLogo = async (design, options = {}) => (
  upsertDesignEntry(design, {
    ...options,
    isFavorite: resolveBooleanStatus(options.isFavorite, resolveBooleanStatus(design?.isFavorite, false)),
    isSaved: true,
    isDownloaded: resolveBooleanStatus(options.isDownloaded, resolveBooleanStatus(design?.isDownloaded, false)),
  })
);

export const removeFavoriteLogo = async (favoriteId) => {
  const { user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const safeKey = typeof favoriteId === 'string' ? favoriteId : '';
  const current = peekLogoLibraryCache(user.id);
  const existing = current.find((item) => item?.favoriteId === safeKey || item?.favoriteRowKey === safeKey) || null;

  if (!existing) {
    return filterLogoLibraryItems(current, 'favorites');
  }

  const nextDesigns = await upsertDesignEntry(existing, {
    isFavorite: false,
    isSaved: existing.isSaved,
    isDownloaded: existing.isDownloaded,
  });

  return filterLogoLibraryItems(nextDesigns, 'favorites');
};

export const deleteLibraryDesign = async (design) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const rowId = typeof design?.favoriteRowKey === 'string' ? design.favoriteRowKey : (typeof design?.id === 'string' ? design.id : null);
  const key = getDesignKey(design);
  const { previousDesigns, nextDesigns } = updateDesignsCache(
    user.id,
    (items) => removeDesignFromList(items, key),
    { fetchedAt: Date.now() }
  );

  const response = await fetch(`/api/designs?id=${rowId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    writeDesignsCache(user.id, previousDesigns);
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete design from server');
  }

  notifyFavoriteLogosChanged();
  return nextDesigns;
};

export const clearFavoriteLogosRepositoryCache = () => {
  clearDesignsCache();
  resolveSupabaseUserPromise = null;
  designsFetchPromise = null;
  designsFetchPromiseUserId = null;
};

export const subscribeLogoLibraryRealtime = (callback = null, options = {}) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const debounceMs = typeof options.debounceMs === 'number' && Number.isFinite(options.debounceMs)
    ? Math.max(0, options.debounceMs)
    : 250;
  const minRefreshGapMs = typeof options.minRefreshGapMs === 'number' && Number.isFinite(options.minRefreshGapMs)
    ? Math.max(0, options.minRefreshGapMs)
    : 1500;

  let isActive = true;
  let channel = null;
  let supabase = null;
  let refreshTimer = null;
  let lastRefreshAt = 0;

  const scheduleRefresh = () => {
    if (!isActive) return;

    const now = Date.now();
    if (minRefreshGapMs > 0 && lastRefreshAt && (now - lastRefreshAt) < minRefreshGapMs) {
      return;
    }

    if (refreshTimer) {
      return;
    }

    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;
      if (!isActive) return;

      lastRefreshAt = Date.now();
      // Re-fetch the library so other tabs/devices show changes immediately.
      void loadLogoLibrary({ maxAge: 0 })
        .then(() => {
          notifyFavoriteLogosChanged();
          if (typeof callback === 'function') {
            callback();
          }
        })
        .catch((error) => {
          // Realtime is optional; failures should never break the UI.
          console.warn('Logo library realtime refresh failed:', error);
        });
    }, debounceMs);
  };

  const setup = async () => {
    try {
      const resolved = await resolveSupabaseUser();
      if (!isActive) return;

      supabase = resolved.supabase;
      const userId = resolved.user?.id || null;
      if (!userId) {
        return;
      }

      const channelName = `designs-realtime:${userId}:${Math.random().toString(36).slice(2)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: DESIGNS_TABLE,
            filter: `user_id=eq.${userId}`,
          },
          () => scheduleRefresh()
        )
        .subscribe();
    } catch (error) {
      console.warn('Unable to subscribe to logo library realtime updates:', error);
    }
  };

  void setup();

  return () => {
    isActive = false;

    if (refreshTimer) {
      window.clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    if (channel) {
      try {
        channel.unsubscribe();
      } catch {
      }

      if (supabase?.removeChannel) {
        try {
          supabase.removeChannel(channel);
        } catch {
        }
      }
    }
  };
};
