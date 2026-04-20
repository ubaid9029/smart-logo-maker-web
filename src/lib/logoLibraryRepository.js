"use client";

import { createClient } from './supabaseClient';
import {
  getFavoriteLogoKey,
  notifyFavoriteLogosChanged,
} from './favoriteLogosStorage';

const LOGO_LIBRARY_TABLE = 'favorite_logos';
const LOGO_LIBRARY_CACHE_KEY = 'logo-library-designs:db-cache:v1';
const AUTH_REQUIRED_ERROR_CODE = 'AUTH_REQUIRED';
const LOGO_LIBRARY_UPGRADE_REQUIRED_CODE = 'LOGO_LIBRARY_UPGRADE_REQUIRED';
const LOGO_LIBRARY_CACHE_TTL_MS = 45 * 1000;
export const LOGO_LIBRARY_UPGRADE_SQL_PATH = 'supabase/logo_library_upgrade.sql';

let logoLibraryMemoryCache = {
  userId: null,
  logos: [],
  fetchedAt: 0,
};
let resolveSupabaseUserPromise = null;
let logoLibraryFetchPromise = null;
let logoLibraryFetchPromiseUserId = null;

const isMissingTableError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' || message.includes('favorite_logos') || message.includes('does not exist');
};

export const isSupabaseAuthSessionMissingError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.name === 'AuthSessionMissingError' || message.includes('auth session missing');
};

const createAuthRequiredError = () => {
  const error = new Error('Sign in is required to manage your logo library.');
  error.code = AUTH_REQUIRED_ERROR_CODE;
  return error;
};

export const isAuthRequiredError = (error) => error?.code === AUTH_REQUIRED_ERROR_CODE;

const isMissingLibraryStatusColumnsError = (error) => {
  const message = String(error?.message || '').toLowerCase();

  return (
    message.includes('is_favorite') ||
    message.includes('favorited_at') ||
    message.includes('is_saved') ||
    message.includes('saved_at')
  );
};

export const getLogoLibraryUpgradeMessage = (purpose = 'Favorites, Saved, and Downloads') => (
  `Run ${LOGO_LIBRARY_UPGRADE_SQL_PATH} so ${purpose} can work correctly.`
);

const createLogoLibraryUpgradeRequiredError = () => {
  const error = new Error(`Logo library upgrade is required. ${getLogoLibraryUpgradeMessage('Favorites, Saved, and Downloads pages')}`);
  error.code = LOGO_LIBRARY_UPGRADE_REQUIRED_CODE;
  return error;
};

export const isLogoLibraryUpgradeRequiredError = (error) => error?.code === LOGO_LIBRARY_UPGRADE_REQUIRED_CODE;

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

const resolveFavoriteStatusFromRow = (row) => {
  if (typeof row?.is_favorite === 'boolean') {
    return row.is_favorite;
  }

  return true;
};

export const filterLogoLibraryItems = (logos, filter = 'all') => {
  const safeLogos = Array.isArray(logos) ? logos.filter(Boolean) : [];

  if (filter === 'favorites') {
    return safeLogos.filter((item) => item.isFavorite);
  }

  if (filter === 'saved') {
    return safeLogos.filter((item) => item.isSaved);
  }

  if (filter === 'downloads') {
    return safeLogos.filter((item) => item.isDownloaded);
  }

  return safeLogos;
};

export const getLogoLibraryCounts = (logos) => {
  const safeLogos = Array.isArray(logos) ? logos : [];

  return {
    favorites: safeLogos.filter((item) => item?.isFavorite).length,
    saved: safeLogos.filter((item) => item?.isSaved).length,
    downloads: safeLogos.filter((item) => item?.isDownloaded).length,
  };
};

const buildLibraryLogoRow = (userId, design, options = {}, existingLogo = null) => {
  const nowIso = new Date().toISOString();
  const nextFavoriteKey = existingLogo?.favoriteRowKey || getFavoriteLogoKey(design);
  const nextIsFavorite = resolveBooleanStatus(
    options.isFavorite,
    resolveBooleanStatus(design?.isFavorite, resolveBooleanStatus(existingLogo?.isFavorite, false))
  );
  const nextIsSaved = resolveBooleanStatus(
    options.isSaved,
    resolveBooleanStatus(design?.isSaved, resolveBooleanStatus(existingLogo?.isSaved, false))
  );
  const markDownloaded = Boolean(options.markDownloaded);
  const nextIsDownloaded = resolveBooleanStatus(
    options.isDownloaded,
    markDownloaded || resolveBooleanStatus(
      design?.isDownloaded,
      resolveBooleanStatus(existingLogo?.isDownloaded, Boolean(design?.downloadedAt || existingLogo?.downloadedAt))
    )
  );
  const favoritedAt = nextIsFavorite
    ? (
      toIsoTimestamp(options.favoritedAt) ||
      toIsoTimestamp(design?.favoritedAt) ||
      toIsoTimestamp(existingLogo?.favoritedAt) ||
      nowIso
    )
    : null;
  const savedAt = nextIsSaved
    ? (
      toIsoTimestamp(options.savedAt) ||
      toIsoTimestamp(design?.savedAt) ||
      toIsoTimestamp(existingLogo?.savedAt) ||
      nowIso
    )
    : null;
  const downloadedAt = nextIsDownloaded
    ? (
      (markDownloaded ? nowIso : null) ||
      toIsoTimestamp(options.downloadedAt) ||
      toIsoTimestamp(design?.downloadedAt) ||
      toIsoTimestamp(existingLogo?.downloadedAt) ||
      nowIso
    )
    : null;

  return {
    user_id: userId,
    favorite_key: nextFavoriteKey,
    design_id: design?.designId ? String(design.designId) : (design?.id ? String(design.id) : (existingLogo?.designId ? String(existingLogo.designId) : null)),
    logo_name: typeof design?.name === 'string' && design.name.trim()
      ? design.name
      : (existingLogo?.name || 'Logo Design'),
    business_name: typeof design?.businessName === 'string' && design.businessName.trim()
      ? design.businessName
      : (existingLogo?.businessName || 'Brand'),
    slogan: typeof design?.slogan === 'string'
      ? design.slogan
      : (existingLogo?.slogan || ''),
    industry_label: typeof design?.industryLabel === 'string' && design.industryLabel.trim()
      ? design.industryLabel
      : (existingLogo?.industryLabel || 'Brand identity'),
    theme_color: typeof design?.themeColor === 'string' && design.themeColor.trim()
      ? design.themeColor
      : (existingLogo?.themeColor || '#111827'),
    background_color: typeof design?.backgroundColor === 'string' && design.backgroundColor.trim()
      ? design.backgroundColor
      : (existingLogo?.backgroundColor || '#ffffff'),
    svg_markup: typeof design?.svgMarkup === 'string'
      ? design.svgMarkup
      : (existingLogo?.svgMarkup || null),
    fallback_url: typeof design?.fallbackUrl === 'string'
      ? design.fallbackUrl
      : (existingLogo?.fallbackUrl || null),
    editable_payload: design?.editablePayload && typeof design.editablePayload === 'object'
      ? design.editablePayload
      : (existingLogo?.editablePayload || null),
    preview_data_url: typeof design?.previewDataUrl === 'string'
      ? design.previewDataUrl
      : (design?.previewDataUrl === null ? null : (existingLogo?.previewDataUrl || null)),
    is_favorite: nextIsFavorite,
    favorited_at: favoritedAt,
    is_saved: nextIsSaved,
    saved_at: savedAt,
    is_downloaded: nextIsDownloaded,
    downloaded_at: downloadedAt,
  };
};

const mapLogoLibraryRow = (row) => ({
  favoriteId: getFavoriteLogoKey({
    businessName: row.business_name || 'Brand',
    designId: row.design_id || row.id,
    favoriteId: row.favorite_key,
  }),
  favoriteRowKey: row.favorite_key,
  id: row.design_id || row.id,
  designId: row.design_id || row.id,
  name: row.logo_name || 'Logo Design',
  businessName: row.business_name || 'Brand',
  slogan: row.slogan || '',
  industryLabel: row.industry_label || 'Brand identity',
  themeColor: row.theme_color || '#111827',
  backgroundColor: row.background_color || '#ffffff',
  svgMarkup: row.svg_markup || null,
  editablePayload: row.editable_payload && typeof row.editable_payload === 'object' ? row.editable_payload : null,
  previewDataUrl: row.preview_data_url || null,
  fallbackUrl: row.fallback_url || null,
  isFavorite: resolveFavoriteStatusFromRow(row),
  isSaved: Boolean(row.is_saved),
  isDownloaded: Boolean(row.is_downloaded || row.downloaded_at),
  favoritedAt: toTimestampNumber(row.favorited_at, toTimestampNumber(row.created_at, Date.now())),
  savedAt: toTimestampNumber(row.saved_at, null),
  downloadedAt: toTimestampNumber(row.downloaded_at, null),
  updatedAt: toTimestampNumber(row.updated_at, Date.now()),
});

const buildCanonicalFavoriteKeyFromRow = (row) => getFavoriteLogoKey({
  businessName: row?.business_name || 'Brand',
  designId: row?.design_id || row?.id,
  favoriteId: row?.favorite_key,
});

const dedupeLogoLibraryItems = (logos) => {
  const nextLogos = Array.isArray(logos) ? logos : [];
  const dedupedLogos = [];
  const seenKeys = new Set();

  nextLogos.forEach((item) => {
    const itemKey = item?.favoriteId || item?.favoriteRowKey;
    if (!itemKey || seenKeys.has(itemKey)) {
      return;
    }

    seenKeys.add(itemKey);
    dedupedLogos.push(item);
  });

  return dedupedLogos;
};

const readLogoLibraryCache = () => {
  if (typeof window === 'undefined') {
    return { userId: null, logos: [], fetchedAt: 0 };
  }

  try {
    const rawValue = window.sessionStorage.getItem(LOGO_LIBRARY_CACHE_KEY);
    if (!rawValue) {
      return { userId: null, logos: [], fetchedAt: 0 };
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== 'object') {
      return { userId: null, logos: [], fetchedAt: 0 };
    }

    return {
      userId: typeof parsedValue.userId === 'string' ? parsedValue.userId : null,
      logos: Array.isArray(parsedValue.logos) ? parsedValue.logos : [],
      fetchedAt: typeof parsedValue.fetchedAt === 'number' && Number.isFinite(parsedValue.fetchedAt)
        ? parsedValue.fetchedAt
        : 0,
    };
  } catch {
    return { userId: null, logos: [], fetchedAt: 0 };
  }
};

const writeLogoLibraryCache = (userId, logos, options = {}) => {
  const fetchedAt = typeof options.fetchedAt === 'number' && Number.isFinite(options.fetchedAt)
    ? options.fetchedAt
    : Date.now();

  logoLibraryMemoryCache = {
    userId: typeof userId === 'string' ? userId : null,
    logos: dedupeLogoLibraryItems(Array.isArray(logos) ? logos : []),
    fetchedAt,
  };

  if (typeof window === 'undefined') {
    return logoLibraryMemoryCache.logos;
  }

  try {
    window.sessionStorage.setItem(
      LOGO_LIBRARY_CACHE_KEY,
      JSON.stringify({
        userId: logoLibraryMemoryCache.userId,
        logos: logoLibraryMemoryCache.logos,
        fetchedAt: logoLibraryMemoryCache.fetchedAt,
      })
    );
  } catch {
  }

  return logoLibraryMemoryCache.logos;
};

const clearLogoLibraryCache = () => writeLogoLibraryCache(null, []);

const resolveLogoLibraryCacheState = (userId) => {
  const memoryUserIdMatches = userId && logoLibraryMemoryCache.userId === userId;
  if (memoryUserIdMatches) {
    return {
      userId: logoLibraryMemoryCache.userId,
      logos: dedupeLogoLibraryItems(logoLibraryMemoryCache.logos),
      fetchedAt: logoLibraryMemoryCache.fetchedAt || 0,
    };
  }

  const cachedValue = readLogoLibraryCache();
  if (userId && cachedValue.userId === userId) {
    logoLibraryMemoryCache = {
      userId: cachedValue.userId,
      logos: dedupeLogoLibraryItems(cachedValue.logos),
      fetchedAt: cachedValue.fetchedAt || 0,
    };

    return {
      userId: logoLibraryMemoryCache.userId,
      logos: logoLibraryMemoryCache.logos,
      fetchedAt: logoLibraryMemoryCache.fetchedAt,
    };
  }

  return {
    userId: typeof userId === 'string' ? userId : null,
    logos: [],
    fetchedAt: 0,
  };
};

const isLogoLibraryCacheFresh = (userId, maxAge = LOGO_LIBRARY_CACHE_TTL_MS) => {
  if (!userId) {
    return false;
  }

  const cacheState = resolveLogoLibraryCacheState(userId);
  if (!cacheState.fetchedAt) {
    return false;
  }

  return (Date.now() - cacheState.fetchedAt) <= maxAge;
};

export const peekLogoLibraryCache = (userId, filter = 'all') => {
  return filterLogoLibraryItems(resolveLogoLibraryCacheState(userId).logos, filter);
};

export const peekFavoriteLogosCache = (userId) => peekLogoLibraryCache(userId, 'favorites');
export const peekSavedLogosCache = (userId) => peekLogoLibraryCache(userId, 'saved');
export const peekDownloadedLogosCache = (userId) => peekLogoLibraryCache(userId, 'downloads');

const replaceLogoLibraryItemInList = (logos, nextLogo) => {
  const currentLogos = Array.isArray(logos) ? logos : [];
  const nextFavoriteId = nextLogo?.favoriteId;
  const nextFavoriteRowKey = nextLogo?.favoriteRowKey;

  if (!nextFavoriteId) {
    return dedupeLogoLibraryItems(currentLogos);
  }

  const filteredLogos = currentLogos.filter((item) => {
    if (!item) {
      return false;
    }

    return item.favoriteId !== nextFavoriteId && item.favoriteRowKey !== nextFavoriteRowKey;
  });

  return dedupeLogoLibraryItems([nextLogo, ...filteredLogos]);
};

const removeLogoLibraryItemFromList = (logos, favoriteKey) => {
  const currentLogos = Array.isArray(logos) ? logos : [];
  return dedupeLogoLibraryItems(
    currentLogos.filter((item) => item?.favoriteId !== favoriteKey && item?.favoriteRowKey !== favoriteKey)
  );
};

const updateLogoLibraryCache = (userId, updater) => {
  const previousLogos = peekLogoLibraryCache(userId);
  const nextLogos = dedupeLogoLibraryItems(updater(Array.isArray(previousLogos) ? previousLogos : []));

  writeLogoLibraryCache(userId, nextLogos);
  notifyFavoriteLogosChanged();

  return {
    previousLogos,
    nextLogos,
  };
};

const restoreLogoLibraryCache = (userId, logos) => {
  writeLogoLibraryCache(userId, dedupeLogoLibraryItems(logos));
  notifyFavoriteLogosChanged();
};

const fetchLogoLibraryRowsForUser = async (supabase, userId) => {
  const response = await fetch('/api/library');
  if (!response.ok) {
    if (response.status === 404) return []; // Fallback for missing table/route
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch library: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const cleanupLogoLibraryRowsForUser = async (supabase, userId, rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return false;
  }

  const groups = new Map();

  rows.forEach((row) => {
    const canonicalKey = buildCanonicalFavoriteKeyFromRow(row);
    const existingGroup = groups.get(canonicalKey);

    if (!existingGroup) {
      groups.set(canonicalKey, {
        canonicalKey,
        rows: [row],
      });
      return;
    }

    existingGroup.rows.push(row);
  });

  let didMutate = false;
  const keysToDelete = new Set();

  for (const group of groups.values()) {
    const primaryRow = group.rows[0];

    if (group.rows.length === 1 && primaryRow.favorite_key === group.canonicalKey) {
      continue;
    }

    const mergedRow = group.rows.reduce((accumulator, row) => ({
      ...accumulator,
      is_favorite: resolveFavoriteStatusFromRow(accumulator) || resolveFavoriteStatusFromRow(row),
      favorited_at: accumulator.favorited_at || row.favorited_at || row.created_at || null,
      is_saved: Boolean(accumulator.is_saved || row.is_saved),
      saved_at: accumulator.saved_at || row.saved_at || null,
      is_downloaded: Boolean(accumulator.is_downloaded || row.is_downloaded || row.downloaded_at),
      downloaded_at: accumulator.downloaded_at || row.downloaded_at || null,
    }), {
      ...primaryRow,
      favorite_key: group.canonicalKey,
      is_favorite: resolveFavoriteStatusFromRow(primaryRow),
      favorited_at: primaryRow.favorited_at || primaryRow.created_at || null,
      is_saved: Boolean(primaryRow.is_saved),
      saved_at: primaryRow.saved_at || null,
      is_downloaded: Boolean(primaryRow.is_downloaded || primaryRow.downloaded_at),
      downloaded_at: primaryRow.downloaded_at || null,
    });

    const { error: upsertError } = await supabase
      .from(LOGO_LIBRARY_TABLE)
      .upsert(mergedRow, { onConflict: 'user_id,favorite_key' });

    if (upsertError) {
      if (isMissingLibraryStatusColumnsError(upsertError)) {
        throw createLogoLibraryUpgradeRequiredError();
      }
      throw upsertError;
    }

    group.rows.forEach((row) => {
      if (row.favorite_key && row.favorite_key !== group.canonicalKey) {
        keysToDelete.add(row.favorite_key);
      }
    });

    didMutate = true;
  }

  if (keysToDelete.size > 0) {
    const { error: deleteError } = await supabase
      .from(LOGO_LIBRARY_TABLE)
      .delete()
      .eq('user_id', userId)
      .in('favorite_key', Array.from(keysToDelete));

    if (deleteError) {
      throw deleteError;
    }

    didMutate = true;
  }

  return didMutate;
};

const fetchLogoLibraryForUser = async (supabase, userId) => {
  const rawRows = await fetchLogoLibraryRowsForUser(supabase, userId);
  const didCleanup = await cleanupLogoLibraryRowsForUser(supabase, userId, rawRows);
  const rows = didCleanup ? await fetchLogoLibraryRowsForUser(supabase, userId) : rawRows;

  return writeLogoLibraryCache(userId, dedupeLogoLibraryItems(rows.map(mapLogoLibraryRow)));
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

const upsertLogoLibraryEntry = async (design, options = {}) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const currentLogos = peekLogoLibraryCache(user.id);
  const targetFavoriteKey = getFavoriteLogoKey(design);
  const existingLogo = currentLogos.find((item) => item?.favoriteId === targetFavoriteKey || item?.favoriteRowKey === targetFavoriteKey) || null;
  const nextRow = buildLibraryLogoRow(user.id, design, options, existingLogo);
  const hasActiveStatuses = Boolean(nextRow.is_favorite || nextRow.is_saved || nextRow.is_downloaded);
  const optimisticLogo = hasActiveStatuses
    ? mapLogoLibraryRow({
        ...nextRow,
        id: existingLogo?.favoriteRowKey || nextRow.favorite_key,
        created_at: toIsoTimestamp(existingLogo?.updatedAt) || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    : null;
  const { previousLogos, nextLogos } = updateLogoLibraryCache(
    user.id,
    (logos) => (optimisticLogo
      ? replaceLogoLibraryItemInList(logos, optimisticLogo)
      : removeLogoLibraryItemFromList(logos, targetFavoriteKey))
  );

  const response = await fetch('/api/library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rowData: nextRow, favoriteKey: targetFavoriteKey }),
  });

  if (!response.ok) {
    restoreLogoLibraryCache(user.id, previousLogos);
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to sync library entry');
  }

  return nextLogos;
};

export const loadLogoLibrary = async ({
  filter = 'all',
  forceRefresh = false,
  maxAge = LOGO_LIBRARY_CACHE_TTL_MS,
} = {}) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    clearLogoLibraryCache();
    return [];
  }

  const cachedLogos = peekLogoLibraryCache(user.id);
  if (!forceRefresh && isLogoLibraryCacheFresh(user.id, maxAge)) {
    return filterLogoLibraryItems(cachedLogos, filter);
  }

  try {
    if (!forceRefresh && logoLibraryFetchPromise && logoLibraryFetchPromiseUserId === user.id) {
      const logos = await logoLibraryFetchPromise;
      return filterLogoLibraryItems(logos, filter);
    }

    const fetchPromise = fetchLogoLibraryForUser(supabase, user.id);
    logoLibraryFetchPromise = fetchPromise;
    logoLibraryFetchPromiseUserId = user.id;

    const logos = await fetchPromise;
    return filterLogoLibraryItems(logos, filter);
  } catch (error) {
    if (cachedLogos.length > 0 && !isLogoLibraryUpgradeRequiredError(error)) {
      if (!isMissingTableError(error) && !isSupabaseAuthSessionMissingError(error)) {
        console.error('Logo library repository error, using cache fallback:', error);
      }
      return filterLogoLibraryItems(cachedLogos, filter);
    }

    if (!isMissingTableError(error) && !isSupabaseAuthSessionMissingError(error) && !isLogoLibraryUpgradeRequiredError(error)) {
      console.error('Logo library repository error:', error);
    }
    throw error;
  } finally {
    if (logoLibraryFetchPromiseUserId === user.id) {
      logoLibraryFetchPromise = null;
      logoLibraryFetchPromiseUserId = null;
    }
  }
};

export const loadFavoriteLogos = async (options = {}) => loadLogoLibrary({ ...options, filter: 'favorites' });
export const loadSavedLogos = async (options = {}) => loadLogoLibrary({ ...options, filter: 'saved' });
export const loadDownloadedLogos = async (options = {}) => loadLogoLibrary({ ...options, filter: 'downloads' });

export const saveFavoriteLogo = async (design, options = {}) => (
  upsertLogoLibraryEntry(design, {
    ...options,
    isFavorite: true,
    isDownloaded: Boolean(options.markDownloaded || options.isDownloaded || design?.isDownloaded),
  })
);

export const saveSavedLogo = async (design, options = {}) => (
  upsertLogoLibraryEntry(design, {
    ...options,
    isFavorite: resolveBooleanStatus(options.isFavorite, resolveBooleanStatus(design?.isFavorite, false)),
    isSaved: true,
    isDownloaded: resolveBooleanStatus(options.isDownloaded, resolveBooleanStatus(design?.isDownloaded, false)),
  })
);

export const saveDownloadedLogo = async (design, options = {}) => (
  upsertLogoLibraryEntry(design, {
    ...options,
    isFavorite: resolveBooleanStatus(options.isFavorite, resolveBooleanStatus(design?.isFavorite, false)),
    isSaved: resolveBooleanStatus(options.isSaved, resolveBooleanStatus(design?.isSaved, false)),
    isDownloaded: true,
    markDownloaded: true,
  })
);

export const removeFavoriteLogo = async (favoriteId) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const currentLogos = peekLogoLibraryCache(user.id);
  const existingLogo = currentLogos.find((item) => item?.favoriteId === favoriteId || item?.favoriteRowKey === favoriteId) || null;

  if (!existingLogo) {
  const response = await fetch(`/api/library?favoriteKey=${favoriteId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete from library');
  }

  const nextLogos = removeLogoLibraryItemFromList(currentLogos, favoriteId);
  writeLogoLibraryCache(user.id, nextLogos);
  notifyFavoriteLogosChanged();
  return filterLogoLibraryItems(nextLogos, 'favorites');
  }

  const nextLogos = await upsertLogoLibraryEntry(existingLogo, {
    isFavorite: false,
    isSaved: existingLogo.isSaved,
    isDownloaded: existingLogo.isDownloaded,
  });

  return filterLogoLibraryItems(nextLogos, 'favorites');
};

export const toggleFavoriteLogo = async (design) => {
  const { user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const favoriteKey = getFavoriteLogoKey(design);
  const currentLogos = peekLogoLibraryCache(user.id);
  const existingLogo = currentLogos.find((item) => item?.favoriteId === favoriteKey || item?.favoriteRowKey === favoriteKey) || null;
  const nextIsFavorite = !Boolean(existingLogo?.isFavorite);
  const logos = await upsertLogoLibraryEntry(existingLogo || design, {
    isFavorite: nextIsFavorite,
    isSaved: resolveBooleanStatus(existingLogo?.isSaved, resolveBooleanStatus(design?.isSaved, false)),
    isDownloaded: resolveBooleanStatus(existingLogo?.isDownloaded, resolveBooleanStatus(design?.isDownloaded, false)),
  });

  return {
    logos,
    isFavorite: nextIsFavorite,
  };
};

export const syncFavoriteLogoEdits = async ({ favoriteId, patch = {} }) => {
  const { user } = await resolveSupabaseUser();
  if (!user || !favoriteId) {
    return null;
  }

  const currentLogos = peekLogoLibraryCache(user.id);
  const existingLogo = currentLogos.find((item) => item?.favoriteId === favoriteId || item?.favoriteRowKey === favoriteId) || null;
  if (!existingLogo) {
    return currentLogos;
  }

  const nextLogos = await upsertLogoLibraryEntry({
    ...existingLogo,
    svgMarkup: typeof patch.svgMarkup === 'string' ? patch.svgMarkup : existingLogo.svgMarkup,
    previewDataUrl: typeof patch.previewDataUrl === 'string' || patch.previewDataUrl === null
      ? patch.previewDataUrl
      : existingLogo.previewDataUrl,
    editablePayload: patch.editablePayload && typeof patch.editablePayload === 'object'
      ? patch.editablePayload
      : existingLogo.editablePayload,
    themeColor: typeof patch.themeColor === 'string' ? patch.themeColor : existingLogo.themeColor,
    backgroundColor: typeof patch.backgroundColor === 'string' ? patch.backgroundColor : existingLogo.backgroundColor,
    name: typeof patch.logoName === 'string' ? patch.logoName : existingLogo.name,
  }, {
    isFavorite: existingLogo.isFavorite,
    isSaved: existingLogo.isSaved,
    isDownloaded: patch.markDownloaded ? true : existingLogo.isDownloaded,
    markDownloaded: patch.markDownloaded,
  });

  return nextLogos;
};

export const clearFavoriteLogosRepositoryCache = () => {
  clearLogoLibraryCache();
  resolveSupabaseUserPromise = null;
  logoLibraryFetchPromise = null;
  logoLibraryFetchPromiseUserId = null;
};
