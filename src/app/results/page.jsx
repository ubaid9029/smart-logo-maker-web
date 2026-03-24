"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit3, Bookmark, Loader2, ShoppingCart, X } from 'lucide-react';
import { useSelector } from "react-redux";
import DownloadDialog from '../../components/DownloadDialog';
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
    '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid meet">',
    `<image href="${imageUrl}" x="0" y="0" width="700" height="500" preserveAspectRatio="xMidYMid meet" />`,
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
      const storageKey = `${EDITED_LOGO_STORAGE_PREFIX}${editScopeKey}:${designId}`;

      try {
        const rawValue = window.localStorage.getItem(storageKey);
        if (rawValue) {
          nextSavedEdits[designId] = JSON.parse(rawValue);
        }
      } catch {
        // Ignore invalid saved edits and keep the original design visible.
      }
    });

    setSavedEdits(nextSavedEdits);
  }, [editScopeKey, results]);

  const logos = useMemo(() => {
    const businessName = typeof formData?.name === 'string' && formData.name.trim() ? formData.name.trim() : 'BRAND';
    const slogan = typeof formData?.slogan === 'string' ? formData.slogan.trim() : '';
    const industryLabel = INDUSTRY_LABELS[formData?.industryId] || 'Brand identity';
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
      const savedPreviewDataUrl = savedEdit?.previewDataUrl || null;
      const mergedEditablePayload = savedEdit?.editablePayload || editablePayload;
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
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(payloadKey, JSON.stringify(design.editablePayload || null));
    }

    const params = new URLSearchParams({
      img: design.svgDataUri || design.fallbackUrl || '',
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
    <div className="mt-20 min-h-screen bg-pink-50 w-full pb-20 pt-10">
      <div className="max-w-6xl mx-auto p-8 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900">Designs for {formData?.name || "Brand"}</h1>
          <button onClick={() => router.push('/create')} className="flex items-center gap-2 bg-white px-6 py-2.5 rounded-xl border shadow-sm font-bold">
            <ChevronLeft size={20} /> Change Info
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {logos.map((design) => (
            <motion.div key={design.id} className="group bg-white p-4 rounded-[2.5rem] shadow-md relative border border-transparent hover:border-pink-200 transition-all">
              <div className="w-full aspect-[7/5] relative rounded-[2rem] overflow-hidden bg-slate-50 mb-4">
                {design.svgMarkup ? (
                  <InlineSvgPreview svgMarkup={design.svgMarkup} alt={design.name} />
                ) : design.fallbackUrl ? (
                  <img src={design.fallbackUrl} alt={design.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                    No preview
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <div className="flex gap-2 px-2 w-full justify-center">
                    <button onClick={() => setSelectedDesign(design)} className="bg-white text-sky-500 p-3 rounded-full shadow-md"><Bookmark size={16} /></button>
                    <button onClick={() => handleEditOnCanva(design)} className="bg-white text-emerald-500 p-3 rounded-full shadow-md"><Edit3 size={16} /></button>
                    <button onClick={() => setDownloadDesign(design)} className="bg-orange-500 text-white p-3 rounded-full shadow-md"><ShoppingCart size={16} /></button>
                  </div>
                </div>
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
              className="bg-white p-6 md:p-8 rounded-[3rem] max-w-lg w-full relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedDesign(null)}
                className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 transition-colors rounded-full z-10"
              >
                <X size={24} />
              </button>

              <div className="w-full aspect-[7/5] rounded-[2rem] overflow-hidden bg-slate-50 mb-6 border border-slate-100">
                {selectedDesign.svgMarkup ? (
                  <InlineSvgPreview svgMarkup={selectedDesign.svgMarkup} alt={selectedDesign.name} />
                ) : selectedDesign.fallbackUrl ? (
                  <img src={selectedDesign.fallbackUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : null}
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedDesign.name}</h2>
                <p className="text-slate-500 font-medium mt-1">{selectedDesign.industryLabel}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleEditOnCanva(selectedDesign)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  <Edit3 size={18} />
                  Edit Design
                </button>

                <button
                  onClick={() => setDownloadDesign(selectedDesign)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#E02424] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-orange-200"
                >
                  <ShoppingCart size={18} />
                  Buy Now
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
