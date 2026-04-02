const GENERATED_RESULTS_STORAGE_KEY = 'generated-logo-results:v1';

const sanitizeTextSegment = (segment) => {
  if (!segment || typeof segment !== 'object') {
    return null;
  }

  return {
    color: typeof segment.color === 'string' ? segment.color : undefined,
    font_url: typeof segment.font_url === 'string' ? segment.font_url : undefined,
    name: typeof segment.name === 'string' ? segment.name : undefined,
    text: typeof segment.text === 'string' ? segment.text : undefined,
    size: Number.isFinite(Number(segment.size)) ? Number(segment.size) : undefined,
    path: typeof segment.path === 'string' ? segment.path : undefined,
    ratioObj: segment.ratioObj && typeof segment.ratioObj === 'object'
      ? {
          x1: Number.isFinite(Number(segment.ratioObj.x1)) ? Number(segment.ratioObj.x1) : undefined,
          y1: Number.isFinite(Number(segment.ratioObj.y1)) ? Number(segment.ratioObj.y1) : undefined,
          x2: Number.isFinite(Number(segment.ratioObj.x2)) ? Number(segment.ratioObj.x2) : undefined,
          y2: Number.isFinite(Number(segment.ratioObj.y2)) ? Number(segment.ratioObj.y2) : undefined,
        }
      : null,
    marginTop: Number.isFinite(Number(segment.marginTop)) ? Number(segment.marginTop) : undefined,
    marginLeft: Number.isFinite(Number(segment.marginLeft)) ? Number(segment.marginLeft) : undefined,
    align: typeof segment.align === 'string' ? segment.align : undefined,
    style: typeof segment.style === 'string' ? segment.style : null,
  };
};

const sanitizeTextSegmentList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((segment) => sanitizeTextSegment(segment))
    .filter(Boolean);
};

const sanitizeIconAsset = (asset) => {
  if (!asset || typeof asset !== 'object') {
    return null;
  }

  return {
    source_code: typeof asset.source_code === 'string' ? asset.source_code : null,
    svg_source_code: typeof asset.svg_source_code === 'string' ? asset.svg_source_code : null,
    thumbnail_url: typeof asset.thumbnail_url === 'string' ? asset.thumbnail_url : null,
    image_url: typeof asset.image_url === 'string' ? asset.image_url : null,
    url: typeof asset.url === 'string' ? asset.url : null,
    view_box: typeof asset.view_box === 'string' ? asset.view_box : null,
  };
};

const sanitizePersistedResultItem = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const sanitizedNameIconList = Array.isArray(item?.name_icon?.list)
    ? item.name_icon.list.map((entry) => sanitizeIconAsset(entry)).filter(Boolean)
    : [];
  const sanitizedNameIcon = item?.name_icon && typeof item.name_icon === 'object'
    ? {
        ...sanitizeIconAsset(item.name_icon),
        list: sanitizedNameIconList,
      }
    : null;

  return {
    id: item.id ?? null,
    logo_name: typeof item.logo_name === 'string' ? item.logo_name : '',
    slogan_name: typeof item.slogan_name === 'string' ? item.slogan_name : '',
    background_color: typeof item.background_color === 'string' ? item.background_color : '',
    name_color: typeof item.name_color === 'string' ? item.name_color : '',
    logo_url: typeof item.logo_url === 'string' ? item.logo_url : '',
    thumbnail_url: typeof item.thumbnail_url === 'string' ? item.thumbnail_url : '',
    icon_index: Number.isFinite(Number(item.icon_index)) ? Number(item.icon_index) : 0,
    font: {
      name: sanitizeTextSegmentList(item?.font?.name),
      slogan: sanitizeTextSegmentList(item?.font?.slogan),
    },
    icon_normal: sanitizeIconAsset(item.icon_normal),
    name_icon: sanitizedNameIcon,
  };
};

const sanitizePersistedResults = (results) => {
  if (!Array.isArray(results)) {
    return [];
  }

  return results
    .map((item) => sanitizePersistedResultItem(item))
    .filter(Boolean);
};

export const saveGeneratedResultsSnapshot = (results) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const nextResults = sanitizePersistedResults(results);
    window.sessionStorage.setItem(GENERATED_RESULTS_STORAGE_KEY, JSON.stringify(nextResults));
  } catch {
  }
};

export const loadGeneratedResultsSnapshot = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.sessionStorage.getItem(GENERATED_RESULTS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return sanitizePersistedResults(parsedValue);
  } catch {
    return [];
  }
};

export const clearGeneratedResultsSnapshot = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(GENERATED_RESULTS_STORAGE_KEY);
  } catch {
  }
};
