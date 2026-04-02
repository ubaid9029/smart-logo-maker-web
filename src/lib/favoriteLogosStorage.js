const LEGACY_FAVORITE_LOGOS_STORAGE_KEY = 'favorite-logo-designs:v1';
const FAVORITE_LOGOS_STORAGE_KEY = 'favorite-logo-designs:v2';
export const FAVORITE_LOGOS_UPDATED_EVENT = 'favorite-logo-designs:updated';
const FAVORITE_LOGO_RUNTIME_PREFIX = 'favorite-logo-runtime:v1:';
const MAX_FAVORITE_LOGOS = 24;

export const notifyFavoriteLogosChanged = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(FAVORITE_LOGOS_UPDATED_EVENT));
};

export const getFavoriteLogoKey = (logo) => {
  const businessName = typeof logo?.businessName === 'string' ? logo.businessName.trim().toLowerCase() : 'brand';
  const designId = logo?.designId || logo?.id || logo?.favoriteId || 'design';
  return `${businessName}:${designId}`;
};

const buildRuntimeStorageKey = (favoriteId) => `${FAVORITE_LOGO_RUNTIME_PREFIX}${favoriteId}`;

const saveFavoriteLogoRuntime = (logo) => {
  if (typeof window === 'undefined' || !logo?.editablePayload || typeof logo.editablePayload !== 'object') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      buildRuntimeStorageKey(getFavoriteLogoKey(logo)),
      JSON.stringify({ editablePayload: logo.editablePayload })
    );
  } catch {
  }
};

export const loadFavoriteLogoRuntime = (favoriteId) => {
  if (typeof window === 'undefined' || !favoriteId) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(buildRuntimeStorageKey(favoriteId));
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : null;
  } catch {
    return null;
  }
};

const sanitizeFavoriteLogo = (logo) => {
  if (!logo || typeof logo !== 'object') {
    return null;
  }

  return {
    favoriteId: getFavoriteLogoKey(logo),
    favoriteRowKey: typeof logo.favoriteRowKey === 'string' ? logo.favoriteRowKey : null,
    id: logo.id ?? logo.designId ?? null,
    designId: logo.designId ?? logo.id ?? null,
    name: typeof logo.name === 'string' ? logo.name : 'Logo Design',
    businessName: typeof logo.businessName === 'string' ? logo.businessName : 'Brand',
    slogan: typeof logo.slogan === 'string' ? logo.slogan : '',
    industryLabel: typeof logo.industryLabel === 'string' ? logo.industryLabel : 'Brand identity',
    themeColor: typeof logo.themeColor === 'string' ? logo.themeColor : '#111827',
    backgroundColor: typeof logo.backgroundColor === 'string' ? logo.backgroundColor : '#ffffff',
    svgMarkup: typeof logo.svgMarkup === 'string' ? logo.svgMarkup : null,
    fallbackUrl: typeof logo.fallbackUrl === 'string' ? logo.fallbackUrl : null,
    savedAt: Number.isFinite(Number(logo.savedAt)) ? Number(logo.savedAt) : Date.now(),
    downloadedAt: Number.isFinite(Number(logo.downloadedAt)) ? Number(logo.downloadedAt) : null,
  };
};

const readFavoriteLogosFromKey = (storageKey) => {
  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return [];
  }

  const parsedValue = JSON.parse(rawValue);
  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.map((item) => sanitizeFavoriteLogo(item)).filter(Boolean);
};

export const loadFavoriteLogos = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const currentFavorites = readFavoriteLogosFromKey(FAVORITE_LOGOS_STORAGE_KEY);
    if (currentFavorites.length > 0) {
      if (window.localStorage.getItem(LEGACY_FAVORITE_LOGOS_STORAGE_KEY)) {
        window.localStorage.removeItem(LEGACY_FAVORITE_LOGOS_STORAGE_KEY);
      }
      return currentFavorites;
    }

    const legacyFavorites = readFavoriteLogosFromKey(LEGACY_FAVORITE_LOGOS_STORAGE_KEY);
    if (legacyFavorites.length === 0) {
      return [];
    }

    window.localStorage.removeItem(LEGACY_FAVORITE_LOGOS_STORAGE_KEY);
    window.localStorage.setItem(FAVORITE_LOGOS_STORAGE_KEY, JSON.stringify(legacyFavorites));
    return legacyFavorites;
  } catch {
    return [];
  }
};

const writeFavoriteLogos = (logos) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const nextLogos = Array.isArray(logos)
    ? logos.map((item) => sanitizeFavoriteLogo(item)).filter(Boolean)
        .slice(0, MAX_FAVORITE_LOGOS)
    : [];

  try {
    window.localStorage.removeItem(LEGACY_FAVORITE_LOGOS_STORAGE_KEY);
  } catch {
  }

  let writableLogos = [...nextLogos];

  while (writableLogos.length >= 0) {
    try {
      window.localStorage.setItem(FAVORITE_LOGOS_STORAGE_KEY, JSON.stringify(writableLogos));
      notifyFavoriteLogosChanged();
      return writableLogos;
    } catch {
      if (writableLogos.length === 0) {
        break;
      }

      writableLogos = writableLogos.slice(0, -1);
    }
  }

  try {
    window.localStorage.setItem(FAVORITE_LOGOS_STORAGE_KEY, JSON.stringify([]));
  } catch {
  }

  notifyFavoriteLogosChanged();
  return [];
};

export const saveFavoriteLogo = (logo, options = {}) => {
  if (typeof window === 'undefined') {
    return [];
  }

  saveFavoriteLogoRuntime(logo);

  const nextLogo = sanitizeFavoriteLogo({
    ...logo,
    downloadedAt: options.markDownloaded ? Date.now() : logo?.downloadedAt ?? null,
    savedAt: Date.now(),
  });

  if (!nextLogo) {
    return loadFavoriteLogos();
  }

  const currentLogos = loadFavoriteLogos();
  const existingIndex = currentLogos.findIndex((item) => item.favoriteId === nextLogo.favoriteId);

  if (existingIndex >= 0) {
    const existingLogo = currentLogos[existingIndex];
    currentLogos[existingIndex] = {
      ...existingLogo,
      ...nextLogo,
      downloadedAt: options.markDownloaded
        ? Date.now()
        : (nextLogo.downloadedAt ?? existingLogo.downloadedAt ?? null),
      savedAt: Date.now(),
    };
  } else {
    currentLogos.unshift(nextLogo);
  }

  return writeFavoriteLogos(currentLogos);
};

export const removeFavoriteLogo = (favoriteId) => {
  if (typeof window !== 'undefined' && favoriteId) {
    try {
      window.sessionStorage.removeItem(buildRuntimeStorageKey(favoriteId));
    } catch {
    }
  }

  const currentLogos = loadFavoriteLogos();
  return writeFavoriteLogos(currentLogos.filter((item) => item.favoriteId !== favoriteId));
};

export const toggleFavoriteLogo = (logo) => {
  const favoriteId = getFavoriteLogoKey(logo);
  const currentLogos = loadFavoriteLogos();
  const exists = currentLogos.some((item) => item.favoriteId === favoriteId);

  if (exists) {
    return {
      favorites: writeFavoriteLogos(currentLogos.filter((item) => item.favoriteId !== favoriteId)),
      isFavorite: false,
    };
  }

  const nextFavorites = saveFavoriteLogo(logo);

  return {
    favorites: nextFavorites,
    isFavorite: nextFavorites.some((item) => item.favoriteId === favoriteId),
  };
};

export const subscribeFavoriteLogos = (callback) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleUpdate = () => {
    callback(loadFavoriteLogos());
  };

  window.addEventListener(FAVORITE_LOGOS_UPDATED_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(FAVORITE_LOGOS_UPDATED_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
};
