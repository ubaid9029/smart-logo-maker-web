"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit3, Bookmark, Download, Loader2, X } from 'lucide-react';
import { useSelector } from "react-redux";
import DownloadDialog from '../../components/DownloadDialog';
import { EDITOR_FONT_FAMILIES } from '../../components/Editor/editorConstants';
import {
  buildPdfBlobFromJpegBytes,
  canvasToBlob,
  getDownloadBaseName,
  renderSvgToCanvas,
  triggerBlobDownload,
} from '../../lib/downloadAssets';
import { buildEditableLogoPayload, buildLogoCardSvg, svgToDataUri } from '../../lib/logoSvg';

const INDUSTRY_LABELS = {
  1: 'Technology',
  2: 'Finance',
  3: 'Health',
  4: 'Education',
  5: 'Food',
  6: 'Retail',
  7: 'Fashion',
  8: 'Travel',
  9: 'Real Estate',
  10: 'Sports',
  11: 'Marketing',
  12: 'Construction',
};

const EDITED_LOGO_STORAGE_PREFIX = 'edited-logo:';
const EDITED_LOGO_SESSION_PREFIX = 'edited-logo-session:';

const hashString = (value) => {
  const input = String(value || '');
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
};

const buildResultsEditScope = (formData, results) => hashString(JSON.stringify({
  name: typeof formData?.name === 'string' ? formData.name.trim() : '',
  slogan: typeof formData?.slogan === 'string' ? formData.slogan.trim() : '',
  industryId: formData?.industryId || '',
  resultItems: (Array.isArray(results) ? results : []).map((item, index) => ({
    id: item?.id || index + 1,
    logoName: item?.logo_name || '',
    backgroundColor: item?.background_color || '',
    logoUrl: item?.logo_url || item?.thumbnail_url || '',
    iconNormal: item?.icon_normal || '',
  })),
}));

const buildEditedLogoStorageKey = (editScopeKey, designId) => (
  editScopeKey
    ? `${EDITED_LOGO_STORAGE_PREFIX}${editScopeKey}:${designId}`
    : `${EDITED_LOGO_STORAGE_PREFIX}${designId}`
);

const buildEditedLogoSessionKey = (editScopeKey, designId) => (
  editScopeKey
    ? `${EDITED_LOGO_SESSION_PREFIX}${editScopeKey}:${designId}`
    : `${EDITED_LOGO_SESSION_PREFIX}${designId}`
);

const resolvePayloadTextTemplate = (item = {}, fallback = {}) => {
  const fill = item?.style?.fillColor || item?.fill || fallback?.style?.fillColor || fallback?.fill || '#1A1A1A';

  return {
    text: typeof item?.text === 'string' ? item.text : (fallback?.text || ''),
    fontSize: Number(item?.fontSize || fallback?.fontSize || 46),
    align: item?.align || fallback?.align || 'center',
    fill,
    fontFamily: item?.fontFamily || fallback?.fontFamily || 'Arial',
    fontUrl: item?.fontUrl || fallback?.fontUrl || null,
    fontStyle: item?.fontStyle || fallback?.fontStyle || 'bold',
    letterSpacing: Number(item?.letterSpacing ?? fallback?.letterSpacing ?? 0),
    style: {
      fillColor: fill,
      outlineColor: item?.style?.outlineColor || fallback?.style?.outlineColor || '#111827',
      outlineWidth: Number(item?.style?.outlineWidth ?? fallback?.style?.outlineWidth ?? 0),
      applyColorOverrides: Boolean(item?.style?.applyColorOverrides ?? fallback?.style?.applyColorOverrides ?? false),
      rotateX: Number(item?.style?.rotateX ?? fallback?.style?.rotateX ?? 0),
      rotateY: Number(item?.style?.rotateY ?? fallback?.style?.rotateY ?? 0),
      rotateZ: Number(item?.style?.rotateZ ?? fallback?.style?.rotateZ ?? 0),
    },
  };
};

const getPreferredPayloadTextSource = (textItems = []) => (
  textItems.find((item) => item?.id === 'brand-name') || textItems[0] || null
);

const mergeEditablePayload = (basePayload, savedPayload) => {
  if (!savedPayload || typeof savedPayload !== 'object') {
    return basePayload;
  }

  const baseTextItems = Array.isArray(basePayload?.textItems) ? basePayload.textItems : [];
  const savedTextItems = Array.isArray(savedPayload?.textItems) ? savedPayload.textItems : [];
  const baseTextItemMap = new Map(baseTextItems.map((item) => [item?.id, item]));
  const mergedTextItems = (savedTextItems.length ? savedTextItems : baseTextItems).map((item) => {
    const baseItem = baseTextItemMap.get(item?.id);
    if (!baseItem) {
      return item;
    }

    const mergedTemplate = resolvePayloadTextTemplate(item, baseItem);

    return {
      ...baseItem,
      ...item,
      fill: mergedTemplate.fill,
      fontFamily: mergedTemplate.fontFamily,
      fontUrl: baseItem?.fontUrl || item?.fontUrl || null,
      fontStyle: mergedTemplate.fontStyle,
      align: mergedTemplate.align,
      letterSpacing: mergedTemplate.letterSpacing,
      style: mergedTemplate.style,
    };
  });
  const mergedTextTemplate = resolvePayloadTextTemplate(
    savedPayload?.textTemplate || getPreferredPayloadTextSource(mergedTextItems) || {},
    basePayload?.textTemplate || getPreferredPayloadTextSource(baseTextItems) || {}
  );

  return {
    ...basePayload,
    ...savedPayload,
    fontFamily: savedPayload.fontFamily || mergedTextTemplate.fontFamily || basePayload?.fontFamily,
    textColor: savedPayload.textColor || mergedTextTemplate.fill || basePayload?.textColor,
    textTemplate: {
      ...mergedTextTemplate,
      fontUrl: basePayload?.textTemplate?.fontUrl || mergedTextTemplate.fontUrl || null,
    },
    logoItems: Array.isArray(savedPayload.logoItems) && savedPayload.logoItems.length
      ? savedPayload.logoItems
      : basePayload?.logoItems,
    textItems: mergedTextItems.length ? mergedTextItems : baseTextItems,
  };
};

const normalizeLogoUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const nextValue = value.trim();
  if (/^https?:\/\//i.test(nextValue) || nextValue.startsWith('data:') || nextValue.startsWith('/')) {
    return nextValue;
  }
  return `https:${nextValue}`;
};

const getNameIconAsset = (item) => {
  if (item?.icon_normal) return item.icon_normal;
  if (Array.isArray(item?.name_icon?.list) && item.name_icon.list.length > 0) {
    if (typeof item?.icon_index === 'number' && item.name_icon.list[item.icon_index]) {
      return item.name_icon.list[item.icon_index];
    }
    return item.name_icon.list[0];
  }
  return item?.name_icon || null;
};

const InlineSvgPreview = ({ svgMarkup, alt }) => {
  if (!svgMarkup) return null;
  return (
    <div
      aria-label={alt}
      className="w-full h-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
};

const buildRasterSvgMarkup = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="250" viewBox="40 40 620 420" preserveAspectRatio="xMidYMid meet">',
    `<image href="${imageUrl}" x="0" y="0" width="700" height="500" preserveAspectRatio="none" />`,
    '</svg>',
  ].join('');
};

const ResultsPage = () => {
  const router = useRouter();
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [downloadDesign, setDownloadDesign] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [savedEdits, setSavedEdits] = useState({});
  const { formData, results, status } = useSelector((state) => state.logo);
  const editScopeKey = useMemo(() => buildResultsEditScope(formData, results), [formData, results]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextSavedEdits = {};
    const items = Array.isArray(results) ? results : [];

    items.forEach((item, index) => {
      const designId = String(item?.id || index + 1);
      const storageKey = buildEditedLogoStorageKey(editScopeKey, designId);
      const sessionKey = buildEditedLogoSessionKey(editScopeKey, designId);
      let localSavedEdit = null;
      let sessionSavedEdit = null;

      try {
        const rawValue = window.localStorage.getItem(storageKey);
        if (rawValue) {
          localSavedEdit = JSON.parse(rawValue);
        }
      } catch {
        // Ignore invalid saved edits and keep the original design visible.
      }

      try {
        const rawSessionValue = window.sessionStorage.getItem(sessionKey);
        if (rawSessionValue) {
          sessionSavedEdit = JSON.parse(rawSessionValue);
        }
      } catch {
        // Ignore invalid session snapshots and keep the persistent version.
      }

      const localUpdatedAt = Number(localSavedEdit?.updatedAt || 0);
      const sessionUpdatedAt = Number(sessionSavedEdit?.updatedAt || 0);
      const primarySavedEdit = sessionUpdatedAt >= localUpdatedAt ? sessionSavedEdit : localSavedEdit;
      const secondarySavedEdit = primarySavedEdit === sessionSavedEdit ? localSavedEdit : sessionSavedEdit;

      const mergedSavedEdit = localSavedEdit || sessionSavedEdit
        ? {
            ...(secondarySavedEdit || {}),
            ...(primarySavedEdit || {}),
            editablePayload: primarySavedEdit?.editablePayload || secondarySavedEdit?.editablePayload || null,
            previewDataUrl: primarySavedEdit?.previewDataUrl || secondarySavedEdit?.previewDataUrl || null,
            previewVersion: Math.max(
              Number(localSavedEdit?.previewVersion || 0),
              Number(sessionSavedEdit?.previewVersion || 0)
            ),
            updatedAt: Math.max(localUpdatedAt, sessionUpdatedAt),
          }
        : null;

      if (mergedSavedEdit) {
        nextSavedEdits[designId] = mergedSavedEdit;
      }
    });

    setSavedEdits(nextSavedEdits);
  }, [editScopeKey, results]);

  const logos = useMemo(() => {
    const businessName = typeof formData?.name === 'string' && formData.name.trim() ? formData.name.trim() : 'BRAND';
    const slogan = typeof formData?.slogan === 'string' ? formData.slogan.trim() : '';
    const industryLabel = INDUSTRY_LABELS[formData?.industryId] || 'Brand identity';
    const preferredFontFamily = EDITOR_FONT_FAMILIES[formData?.fontId] || 'Arial';
    const items = Array.isArray(results) ? results : [];

    return items.map((item, index) => {
      const designId = String(item?.id || index + 1);
      const svgMarkup = buildLogoCardSvg(item, {
        businessName,
        slogan,
      });
      const editablePayload = buildEditableLogoPayload(item, {
        businessName,
        slogan,
        fontFamily: preferredFontFamily,
      });

      const iconAsset = getNameIconAsset(item);
      const fallbackUrl = normalizeLogoUrl(
        item?.logo_url ||
        item?.thumbnail_url ||
        iconAsset?.thumbnail_url ||
        iconAsset?.image_url ||
        iconAsset?.url
      );
      const savedEdit = savedEdits[designId] || null;
      const savedPreviewDataUrl = savedEdit?.previewVersion >= 8 ? savedEdit.previewDataUrl || null : null;
      const mergedEditablePayload = mergeEditablePayload(editablePayload, savedEdit?.editablePayload);
      const previewSvgMarkup = savedPreviewDataUrl ? buildRasterSvgMarkup(savedPreviewDataUrl) : svgMarkup;

      return {
        id: item?.id || index + 1,
        name: item?.logo_name || `${businessName} ${index + 1}`,
        businessName,
        slogan,
        industryLabel,
        themeColor: mergedEditablePayload?.textColor || item?.name_color || '#111827',
        backgroundColor: mergedEditablePayload?.bgColor || mergedEditablePayload?.backgroundColor || item?.background_color || '#ffffff',
        svgMarkup: previewSvgMarkup,
        svgDataUri: savedPreviewDataUrl || svgToDataUri(previewSvgMarkup),
        editablePayload: mergedEditablePayload,
        previewDataUrl: savedPreviewDataUrl,
        fallbackUrl,
      };
    });
  }, [formData, results, savedEdits]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-pink-50">
        <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
        <p className="text-slate-600 font-bold">Fetching your brand designs...</p>
      </div>
    );
  }

  const handleEditOnCanva = (design) => {
    const payloadKey = `logo-edit-${editScopeKey}-${design.id}`;
    const imageParam = design.fallbackUrl || '';

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(payloadKey, JSON.stringify(design.editablePayload || null));
    }

    const params = new URLSearchParams({
      img: imageParam,
      text: design.businessName,
      slogan: design.slogan || '',
      textColor: design.themeColor,
      bgColor: design.backgroundColor,
      name: design.name,
      designId: String(design.id),
      editScopeKey,
      payloadKey,
    });
    router.push(`/editor?${params.toString()}`);
  };

  const handleDownload = async (design, format) => {
    if (!design?.svgMarkup || !format) {
      return;
    }

    const safeBaseName = getDownloadBaseName(design.name || design.businessName || 'logo');

    setDownloadingFormat(format);

    try {
      if (format === 'svg') {
        triggerBlobDownload(new Blob([design.svgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
        return;
      }

      const { canvas, width, height } = await renderSvgToCanvas(design.svgMarkup, 4);

      if (format === 'png') {
        const blob = await canvasToBlob(canvas, 'image/png');
        triggerBlobDownload(blob, `${safeBaseName}.png`);
        return;
      }

      if (format === 'jpg') {
        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.jpg`);
        return;
      }

      if (format === 'webp') {
        const blob = await canvasToBlob(canvas, 'image/webp', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.webp`);
        return;
      }

      if (format === 'pdf') {
        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.98);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const pdfBlob = buildPdfBlobFromJpegBytes(jpegBytes, canvas.width || width, canvas.height || height);
        triggerBlobDownload(pdfBlob, `${safeBaseName}.pdf`);
      }
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="mt-16 min-h-screen w-full bg-pink-50 pb-14 pt-6 sm:mt-20 sm:pb-20 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex w-full flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl">
              Designs for {formData?.name || "Brand"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
              Review, edit, and download your generated logo concepts.
            </p>
          </div>
          <button
            onClick={() => router.push('/create?preserve=1')}
            className="brand-button-outline w-full gap-2 rounded-xl px-5 py-3 text-sm sm:w-auto"
          >
            <ChevronLeft size={18} /> Change Info
          </button>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5">
          {logos.map((design) => (
            <motion.div
              key={design.id}
              className="group relative rounded-[1.5rem] border border-transparent bg-white p-2.5 shadow-md transition-all hover:border-pink-200 sm:rounded-[1.9rem] sm:p-3"
            >
              <div className="relative aspect-[7/5] w-full overflow-hidden rounded-[1.15rem] bg-slate-50 sm:rounded-[1.5rem]">
                {design.svgMarkup ? (
                  <InlineSvgPreview svgMarkup={design.svgMarkup} alt={design.name} />
                ) : design.fallbackUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={design.fallbackUrl} alt={design.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                    No preview
                  </div>
                )}
                <div className="absolute inset-0 hidden items-end justify-center bg-black/20 pb-4 opacity-0 transition-opacity group-hover:opacity-100 sm:flex sm:pb-6">
                  <div className="flex w-full justify-center gap-2 px-2">
                    <button onClick={() => setSelectedDesign(design)} className="brand-icon-button h-11 w-11 p-0"><Bookmark size={16} /></button>
                    <button onClick={() => handleEditOnCanva(design)} className="brand-icon-button h-11 w-11 p-0"><Edit3 size={16} /></button>
                    <button onClick={() => setDownloadDesign(design)} className="brand-icon-button h-11 w-11 p-0"><Download size={16} /></button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-2 sm:hidden">
                  <button onClick={() => setSelectedDesign(design)} className="brand-icon-button h-11 w-11 p-0">
                    <Bookmark size={16} />
                  </button>
                  <button onClick={() => handleEditOnCanva(design)} className="brand-icon-button h-11 w-11 p-0">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setDownloadDesign(design)} className="brand-icon-button h-11 w-11 p-0">
                    <Download size={16} />
                  </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDesign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedDesign(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-[2rem] bg-white p-5 shadow-2xl sm:rounded-[3rem] sm:p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedDesign(null)}
                className="brand-icon-button absolute top-5 right-5 z-10 h-11 w-11 p-0"
              >
                <X size={24} />
              </button>

              <div className="mb-5 aspect-[7/5] w-full overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50 sm:mb-6 sm:rounded-[2rem]">
                {selectedDesign.svgMarkup ? (
                  <InlineSvgPreview svgMarkup={selectedDesign.svgMarkup} alt={selectedDesign.name} />
                ) : selectedDesign.fallbackUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedDesign.fallbackUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : null}
              </div>

              <div className="mb-6 text-center sm:mb-8">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{selectedDesign.name}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">{selectedDesign.industryLabel}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleEditOnCanva(selectedDesign)}
                  className="brand-button-outline flex-1 gap-2 rounded-2xl py-4"
                >
                  <Edit3 size={18} />
                  Edit Design
                </button>

                <button
                  onClick={() => setDownloadDesign(selectedDesign)}
                  className="brand-button-outline flex-1 gap-2 rounded-2xl py-4"
                >
                  <Download size={18} />
                  Download Logo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DownloadDialog
        open={Boolean(downloadDesign)}
        title={downloadDesign ? `Download ${downloadDesign.name}` : 'Download Logo'}
        subtitle="Choose the file type you want to export for this logo."
        downloadingFormat={downloadingFormat}
        onClose={() => {
          if (!downloadingFormat) {
            setDownloadDesign(null);
          }
        }}
        onDownload={(format) => handleDownload(downloadDesign, format)}
      />
    </div>
  );
};

export default ResultsPage;
