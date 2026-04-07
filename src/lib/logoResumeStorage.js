const EDITOR_RESUME_STORAGE_KEY = 'logo-editor-resume:v1';

const clampCreateStep = (value) => Math.max(1, Math.min(4, Number(value) || 1));

export const hasCreateDraft = (formData) => {
  if (!formData || typeof formData !== 'object') {
    return false;
  }

  return Boolean(
    String(formData?.name || '').trim() ||
    String(formData?.slogan || '').trim() ||
    formData?.industryId !== null && formData?.industryId !== undefined ||
    String(formData?.fontId || '').trim() ||
    String(formData?.colorId || '').trim()
  );
};

export const deriveCreateResumeStep = (formData, explicitStep) => {
  const normalizedExplicitStep = clampCreateStep(explicitStep);

  if (normalizedExplicitStep > 1) {
    return normalizedExplicitStep;
  }

  if (String(formData?.colorId || '').trim()) {
    return 4;
  }

  if (String(formData?.fontId || '').trim()) {
    return 3;
  }

  if (formData?.industryId !== null && formData?.industryId !== undefined) {
    return 2;
  }

  return 1;
};

export const loadEditorResumeDraft = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(EDITOR_RESUME_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== 'object' || !parsedValue.designId) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};

export const saveEditorResumeDraft = (draft) => {
  if (typeof window === 'undefined' || !draft || typeof draft !== 'object' || !draft.designId) {
    return null;
  }

  const nextDraft = {
    designId: String(draft.designId),
    editScopeKey: draft.editScopeKey || '',
    payloadKey: draft.payloadKey || '',
    favoriteId: draft.favoriteId || '',
    initialIndustryLabel: draft.initialIndustryLabel || 'Brand identity',
    initialLogoName: draft.initialLogoName || 'Logo Design',
    initialBusinessValue: draft.initialBusinessValue || 'Brand',
    initialSloganValue: draft.initialSloganValue || '',
    sourceContext: draft.sourceContext || 'results',
    returnMode: draft.returnMode || 'push',
    returnTo: draft.returnTo || '/results',
    sourceImageUrl: draft.sourceImageUrl || '',
    isFavorite: Boolean(draft.isFavorite),
    isSaved: Boolean(draft.isSaved),
    isDownloaded: Boolean(draft.isDownloaded),
    updatedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(EDITOR_RESUME_STORAGE_KEY, JSON.stringify(nextDraft));
  } catch {
  }

  return nextDraft;
};

export const clearEditorResumeDraft = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(EDITOR_RESUME_STORAGE_KEY);
  } catch {
  }
};
