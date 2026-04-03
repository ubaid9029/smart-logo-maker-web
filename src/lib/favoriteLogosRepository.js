"use client";

import { createClient } from './supabaseClient';
import {
  getFavoriteLogoKey,
  notifyFavoriteLogosChanged,
} from './favoriteLogosStorage';

const FAVORITE_LOGOS_TABLE = 'favorite_logos';
const FAVORITE_LOGOS_CACHE_KEY = 'favorite-logo-designs:db-cache:v1';
const AUTH_REQUIRED_ERROR_CODE = 'AUTH_REQUIRED';

let favoriteLogosMemoryCache = {
  userId: null,
  logos: [],
};

const isMissingTableError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' || message.includes('favorite_logos') || message.includes('does not exist');
};

const isMissingAuthSessionError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.name === 'AuthSessionMissingError' || message.includes('auth session missing');
};

const createAuthRequiredError = () => {
  const error = new Error('Sign in is required to save favorite logos.');
  error.code = AUTH_REQUIRED_ERROR_CODE;
  return error;
};

export const isAuthRequiredError = (error) => error?.code === AUTH_REQUIRED_ERROR_CODE;

const buildFavoriteLogoRow = (userId, design, options = {}) => {
  const nowIso = new Date().toISOString();
  const downloadedAt = options.markDownloaded
    ? nowIso
    : (design?.downloadedAt ? new Date(design.downloadedAt).toISOString() : null);

  return {
    user_id: userId,
    favorite_key: getFavoriteLogoKey(design),
    design_id: design?.designId ? String(design.designId) : (design?.id ? String(design.id) : null),
    logo_name: typeof design?.name === 'string' ? design.name : 'Logo Design',
    business_name: typeof design?.businessName === 'string' ? design.businessName : 'Brand',
    slogan: typeof design?.slogan === 'string' ? design.slogan : '',
    industry_label: typeof design?.industryLabel === 'string' ? design.industryLabel : 'Brand identity',
    theme_color: typeof design?.themeColor === 'string' ? design.themeColor : '#111827',
    background_color: typeof design?.backgroundColor === 'string' ? design.backgroundColor : '#ffffff',
    svg_markup: typeof design?.svgMarkup === 'string' ? design.svgMarkup : null,
    fallback_url: typeof design?.fallbackUrl === 'string' ? design.fallbackUrl : null,
    editable_payload: design?.editablePayload && typeof design.editablePayload === 'object' ? design.editablePayload : null,
    preview_data_url: typeof design?.previewDataUrl === 'string' ? design.previewDataUrl : null,
    is_downloaded: Boolean(options.markDownloaded || design?.downloadedAt),
    downloaded_at: downloadedAt,
  };
};

const mapFavoriteLogoRow = (row) => ({
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
  savedAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
  downloadedAt: row.downloaded_at ? Date.parse(row.downloaded_at) : null,
});

const buildCanonicalFavoriteKeyFromRow = (row) => getFavoriteLogoKey({
  businessName: row?.business_name || 'Brand',
  designId: row?.design_id || row?.id,
  favoriteId: row?.favorite_key,
});

const dedupeFavoriteLogos = (logos) => {
  const nextLogos = Array.isArray(logos) ? logos : [];
  const dedupedLogos = [];
  const seenKeys = new Set();

  nextLogos.forEach((item) => {
    if (!item?.favoriteId || seenKeys.has(item.favoriteId)) {
      return;
    }

    seenKeys.add(item.favoriteId);
    dedupedLogos.push(item);
  });

  return dedupedLogos;
};

const readFavoriteLogosCache = () => {
  if (typeof window === 'undefined') {
    return { userId: null, logos: [] };
  }

  try {
    const rawValue = window.sessionStorage.getItem(FAVORITE_LOGOS_CACHE_KEY);
    if (!rawValue) {
      return { userId: null, logos: [] };
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== 'object') {
      return { userId: null, logos: [] };
    }

    return {
      userId: typeof parsedValue.userId === 'string' ? parsedValue.userId : null,
      logos: Array.isArray(parsedValue.logos) ? parsedValue.logos : [],
    };
  } catch {
    return { userId: null, logos: [] };
  }
};

const writeFavoriteLogosCache = (userId, logos) => {
  favoriteLogosMemoryCache = {
    userId: typeof userId === 'string' ? userId : null,
    logos: Array.isArray(logos) ? logos : [],
  };

  if (typeof window === 'undefined') {
    return favoriteLogosMemoryCache.logos;
  }

  try {
    window.sessionStorage.setItem(
      FAVORITE_LOGOS_CACHE_KEY,
      JSON.stringify({
        userId: favoriteLogosMemoryCache.userId,
        logos: favoriteLogosMemoryCache.logos,
      })
    );
  } catch {
  }

  return favoriteLogosMemoryCache.logos;
};

const clearFavoriteLogosCache = () => writeFavoriteLogosCache(null, []);

export const peekFavoriteLogosCache = (userId) => {
  const memoryUserIdMatches = userId && favoriteLogosMemoryCache.userId === userId;
  if (memoryUserIdMatches) {
    return favoriteLogosMemoryCache.logos;
  }

  const cachedValue = readFavoriteLogosCache();
  if (userId && cachedValue.userId === userId) {
    favoriteLogosMemoryCache = cachedValue;
    return cachedValue.logos;
  }

  return [];
};

const buildOptimisticFavoriteLogo = (userId, design, options = {}) => {
  const optimisticTimestamp = new Date().toISOString();
  const optimisticRow = buildFavoriteLogoRow(userId, design, options);

  return mapFavoriteLogoRow({
    ...optimisticRow,
    id: design?.designId || design?.id || optimisticRow.favorite_key,
    created_at: optimisticTimestamp,
    updated_at: optimisticTimestamp,
  });
};

const replaceFavoriteLogoInList = (logos, nextLogo) => {
  const currentLogos = Array.isArray(logos) ? logos : [];
  const nextFavoriteId = nextLogo?.favoriteId;
  const nextFavoriteRowKey = nextLogo?.favoriteRowKey;

  if (!nextFavoriteId) {
    return dedupeFavoriteLogos(currentLogos);
  }

  const filteredLogos = currentLogos.filter((item) => {
    if (!item) {
      return false;
    }

    return (
      item.favoriteId !== nextFavoriteId &&
      item.favoriteRowKey !== nextFavoriteRowKey
    );
  });

  return dedupeFavoriteLogos([nextLogo, ...filteredLogos]);
};

const updateFavoriteLogosCache = (userId, updater) => {
  const previousLogos = peekFavoriteLogosCache(userId);
  const nextLogos = dedupeFavoriteLogos(updater(Array.isArray(previousLogos) ? previousLogos : []));

  writeFavoriteLogosCache(userId, nextLogos);
  notifyFavoriteLogosChanged();

  return {
    previousLogos,
    nextLogos,
  };
};

const restoreFavoriteLogosCache = (userId, logos) => {
  writeFavoriteLogosCache(userId, dedupeFavoriteLogos(logos));
  notifyFavoriteLogosChanged();
};

const fetchFavoriteLogoRowsForUser = async (supabase, userId) => {
  const { data, error } = await supabase
    .from(FAVORITE_LOGOS_TABLE)
    .select(`
      id,
      favorite_key,
      design_id,
      logo_name,
      business_name,
      slogan,
      industry_label,
      theme_color,
      background_color,
      svg_markup,
      editable_payload,
      preview_data_url,
      fallback_url,
      downloaded_at,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
};

const cleanupFavoriteLogoRowsForUser = async (supabase, userId, rows) => {
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
        primaryRow: row,
        duplicateKeys: [],
      });
      return;
    }

    existingGroup.duplicateKeys.push(row.favorite_key);
  });

  let didMutate = false;
  const keysToDelete = new Set();

  for (const group of groups.values()) {
    const { canonicalKey, primaryRow, duplicateKeys } = group;

    duplicateKeys.forEach((key) => {
      if (key && key !== canonicalKey) {
        keysToDelete.add(key);
      }
    });

    if (primaryRow.favorite_key === canonicalKey) {
      continue;
    }

    const canonicalRow = {
      user_id: userId,
      favorite_key: canonicalKey,
      design_id: primaryRow.design_id ? String(primaryRow.design_id) : (primaryRow.id ? String(primaryRow.id) : null),
      logo_name: primaryRow.logo_name || 'Logo Design',
      business_name: primaryRow.business_name || 'Brand',
      slogan: primaryRow.slogan || '',
      industry_label: primaryRow.industry_label || 'Brand identity',
      theme_color: primaryRow.theme_color || '#111827',
      background_color: primaryRow.background_color || '#ffffff',
      svg_markup: primaryRow.svg_markup || null,
      fallback_url: primaryRow.fallback_url || null,
      editable_payload: primaryRow.editable_payload && typeof primaryRow.editable_payload === 'object' ? primaryRow.editable_payload : null,
      preview_data_url: primaryRow.preview_data_url || null,
      is_downloaded: Boolean(primaryRow.downloaded_at),
      downloaded_at: primaryRow.downloaded_at || null,
    };

    const { error: upsertError } = await supabase
      .from(FAVORITE_LOGOS_TABLE)
      .upsert(canonicalRow, { onConflict: 'user_id,favorite_key' });

    if (upsertError) {
      throw upsertError;
    }

    if (primaryRow.favorite_key && primaryRow.favorite_key !== canonicalKey) {
      keysToDelete.add(primaryRow.favorite_key);
    }

    didMutate = true;
  }

  if (keysToDelete.size > 0) {
    const { error: deleteError } = await supabase
      .from(FAVORITE_LOGOS_TABLE)
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

const fetchFavoriteLogosForUser = async (supabase, userId) => {
  const rawRows = await fetchFavoriteLogoRowsForUser(supabase, userId);
  const didCleanup = await cleanupFavoriteLogoRowsForUser(supabase, userId, rawRows);
  const rows = didCleanup ? await fetchFavoriteLogoRowsForUser(supabase, userId) : rawRows;

  return writeFavoriteLogosCache(userId, dedupeFavoriteLogos(rows.map(mapFavoriteLogoRow)));
};

const resolveSupabaseUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isMissingAuthSessionError(error)) {
      return { supabase, user: null };
    }
    throw error;
  }

  return { supabase, user: user || null };
};

export const loadFavoriteLogos = async () => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    clearFavoriteLogosCache();
    return [];
  }

  try {
    return await fetchFavoriteLogosForUser(supabase, user.id);
  } catch (error) {
    if (!isMissingTableError(error) && !isMissingAuthSessionError(error)) {
      console.error('Favorite logos repository error:', error);
    }
    throw error;
  }
};

export const saveFavoriteLogo = async (design, options = {}) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const row = buildFavoriteLogoRow(user.id, design, options);
  const optimisticLogo = buildOptimisticFavoriteLogo(user.id, design, options);
  const { previousLogos, nextLogos } = updateFavoriteLogosCache(
    user.id,
    (currentLogos) => replaceFavoriteLogoInList(currentLogos, optimisticLogo)
  );

  const { error } = await supabase
    .from(FAVORITE_LOGOS_TABLE)
    .upsert(row, { onConflict: 'user_id,favorite_key' });

  if (error) {
    restoreFavoriteLogosCache(user.id, previousLogos);
    throw error;
  }

  const legacyFavoriteKey = typeof design?.favoriteRowKey === 'string' && design.favoriteRowKey.trim()
    ? design.favoriteRowKey.trim()
    : (typeof design?.favoriteId === 'string' && design.favoriteId.trim() ? design.favoriteId.trim() : null);

  if (legacyFavoriteKey && legacyFavoriteKey !== row.favorite_key) {
    const { error: cleanupError } = await supabase
      .from(FAVORITE_LOGOS_TABLE)
      .delete()
      .eq('user_id', user.id)
      .eq('favorite_key', legacyFavoriteKey);

    if (cleanupError) {
      console.error('Unable to cleanup legacy favorite logo row:', cleanupError);
    }
  }
  return nextLogos;
};

export const removeFavoriteLogo = async (favoriteId) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const { previousLogos, nextLogos } = updateFavoriteLogosCache(
    user.id,
    (currentLogos) => currentLogos.filter((item) => item?.favoriteId !== favoriteId && item?.favoriteRowKey !== favoriteId)
  );

  const { error } = await supabase
    .from(FAVORITE_LOGOS_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('favorite_key', favoriteId);

  if (error) {
    restoreFavoriteLogosCache(user.id, previousLogos);
    throw error;
  }
  return nextLogos;
};

export const toggleFavoriteLogo = async (design) => {
  const { user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  const favoriteId = getFavoriteLogoKey(design);
  const cachedFavorites = peekFavoriteLogosCache(user.id);
  const existingRow = cachedFavorites.find((item) => item?.favoriteId === favoriteId || item?.favoriteRowKey === favoriteId);

  if (existingRow?.favoriteId) {
    const favorites = await removeFavoriteLogo(favoriteId);
    return {
      favorites,
      isFavorite: false,
    };
  }

  const favorites = await saveFavoriteLogo(design);
  return {
    favorites,
    isFavorite: favorites.some((item) => item.favoriteId === favoriteId),
  };
};

export const syncFavoriteLogoEdits = async ({ favoriteId, patch = {} }) => {
  const { supabase, user } = await resolveSupabaseUser();
  if (!user) {
    throw createAuthRequiredError();
  }

  if (!favoriteId) {
    return null;
  }

  const updatePayload = {};

  if (typeof patch.svgMarkup === 'string') {
    updatePayload.svg_markup = patch.svgMarkup;
  }

  if (typeof patch.previewDataUrl === 'string' || patch.previewDataUrl === null) {
    updatePayload.preview_data_url = patch.previewDataUrl;
  }

  if (patch.editablePayload && typeof patch.editablePayload === 'object') {
    updatePayload.editable_payload = patch.editablePayload;
  }

  if (typeof patch.themeColor === 'string') {
    updatePayload.theme_color = patch.themeColor;
  }

  if (typeof patch.backgroundColor === 'string') {
    updatePayload.background_color = patch.backgroundColor;
  }

  if (typeof patch.logoName === 'string') {
    updatePayload.logo_name = patch.logoName;
  }

  if (patch.markDownloaded) {
    updatePayload.is_downloaded = true;
    updatePayload.downloaded_at = new Date().toISOString();
  }

  if (Object.keys(updatePayload).length === 0) {
    return peekFavoriteLogosCache(user.id);
  }

  const { previousLogos, nextLogos } = updateFavoriteLogosCache(user.id, (currentLogos) => currentLogos.map((item) => {
    if (item?.favoriteId !== favoriteId && item?.favoriteRowKey !== favoriteId) {
      return item;
    }

    return {
      ...item,
      svgMarkup: typeof patch.svgMarkup === 'string' ? patch.svgMarkup : item.svgMarkup,
      previewDataUrl: typeof patch.previewDataUrl === 'string' || patch.previewDataUrl === null
        ? patch.previewDataUrl
        : item.previewDataUrl,
      editablePayload: patch.editablePayload && typeof patch.editablePayload === 'object'
        ? patch.editablePayload
        : item.editablePayload,
      themeColor: typeof patch.themeColor === 'string' ? patch.themeColor : item.themeColor,
      backgroundColor: typeof patch.backgroundColor === 'string' ? patch.backgroundColor : item.backgroundColor,
      name: typeof patch.logoName === 'string' ? patch.logoName : item.name,
      downloadedAt: patch.markDownloaded ? Date.now() : item.downloadedAt,
      savedAt: Date.now(),
    };
  }));

  const { error } = await supabase
    .from(FAVORITE_LOGOS_TABLE)
    .update(updatePayload)
    .eq('user_id', user.id)
    .eq('favorite_key', favoriteId);

  if (error) {
    restoreFavoriteLogosCache(user.id, previousLogos);
    throw error;
  }
  return nextLogos;
};

export const clearFavoriteLogosRepositoryCache = () => {
  clearFavoriteLogosCache();
};
