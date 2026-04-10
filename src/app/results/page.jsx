"use client";
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit3, Heart, Download, Loader2, Sparkles } from 'lucide-react';
import { useSelector } from "react-redux";
import DownloadDialog from '../../components/DownloadDialog';
import FloatingNotice from '../../components/MainComponents/FloatingNotice';
import { EDITOR_FONT_FAMILIES } from '../../components/Editor/editorConstants';
import {
  buildWatermarkedSvgMarkup,
  buildPdfBlobFromJpegBytes,
  canvasToBlob,
  getDownloadBaseName,
  renderSvgToCanvas,
  triggerBlobDownload,
} from '../../lib/downloadAssets';
import { buildEditableLogoPayload, buildLogoCardSvg } from '../../lib/logoSvg';
import { openEditorWindowWithPayload, saveTemporaryEditorPayload } from '../../lib/editorPayloadStorage';
import { loadGeneratedResultsSnapshot, saveGeneratedResultsSnapshot } from '../../lib/generatedResultsStorage';
import {
  BRAND_WATERMARK_OPACITY,
  BRAND_WATERMARK_OVERLAY_INSET,
  BRAND_WATERMARK_OVERLAY_SCALE,
  BRAND_WATERMARK_PATTERN_STYLE,
  BRAND_WATERMARK_ROTATION,
} from '../../lib/watermarkConfig';
import {
  getLogoLibraryUpgradeMessage,
  isAuthRequiredError,
  isLogoLibraryUpgradeRequiredError,
  loadFavoriteLogos,
  peekFavoriteLogosCache,
  saveDownloadedLogo,
  toggleFavoriteLogo,
} from '../../lib/favoriteLogosRepository';
import { getFavoriteLogoKey, subscribeFavoriteLogos } from '../../lib/favoriteLogosStorage';
import { hasCreateDraft } from '../../lib/logoResumeStorage';
import { createClient } from '../../lib/supabaseClient';

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

const hasEditableGraphicLayer = (editablePayload) => (
  Array.isArray(editablePayload?.logoItems) &&
  editablePayload.logoItems.some((item) => (
    (typeof item?.imageUrl === 'string' && item.imageUrl.trim()) ||
    (typeof item?.src === 'string' && item.src.trim())
  ))
);

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

const toFavoriteIdSet = (logos) => new Set(
  (Array.isArray(logos) ? logos : [])
    .map((item) => item?.favoriteId)
    .filter(Boolean)
);

const ResultsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [downloadDesign, setDownloadDesign] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [persistedResults, setPersistedResults] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [authUser, setAuthUser] = useState(null);
  const [favoriteNotice, setFavoriteNotice] = useState(null);
  const [navigationKind] = useState(null);
  const { formData, results, status } = useSelector((state) => state.logo);
  const hasRecoverableDraft = hasCreateDraft(formData);
  const activeResults = Array.isArray(results) && results.length > 0 ? results : persistedResults;
  const editScopeKey = useMemo(() => buildResultsEditScope(formData, activeResults), [activeResults, formData]);
  const currentLocation = useMemo(() => {
    const query = searchParams?.toString();
    return `${pathname || '/results'}${query ? `?${query}` : ''}`;
  }, [pathname, searchParams]);


  useEffect(() => {
    const nextPersistedResults = loadGeneratedResultsSnapshot();
    if (nextPersistedResults.length > 0) {
      setPersistedResults(nextPersistedResults);
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(results) && results.length > 0) {
      saveGeneratedResultsSnapshot(results);
    }
  }, [results]);

  useEffect(() => {
    const supabase = createClient();

    const syncUserFromServer = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store',
        });
        const payload = await response.json();
        const nextUser = payload?.user || null;
        setAuthUser(nextUser);
        return nextUser;
      } catch {
        return null;
      }
    };

    const syncUserFromClient = async () => {
      const { data } = await supabase.auth.getSession();
      const nextUser = data?.session?.user || null;
      setAuthUser(nextUser);
      return nextUser;
    };

    const syncUser = async () => {
      const serverUser = await syncUserFromServer();
      if (serverUser) {
        return;
      }

      await syncUserFromClient();
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    const handleWindowFocus = () => {
      void syncUser();
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleWindowFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    if (!authUser?.id) {
      setFavoriteIds(new Set());
      return () => {};
    }

    const syncFavorites = async () => {
      const cachedFavorites = peekFavoriteLogosCache(authUser.id);
      if (cachedFavorites.length > 0) {
        setFavoriteIds(new Set(cachedFavorites.map((item) => item.favoriteId)));
      }

      try {
        const logos = await loadFavoriteLogos();
        setFavoriteIds(toFavoriteIdSet(logos));
      } catch (error) {
        if (!isLogoLibraryUpgradeRequiredError(error)) {
          console.error('Unable to load favorites:', error);
        }
        setFavoriteIds(new Set());
      }
    };

    const syncFavoritesFromCache = () => {
      setFavoriteIds(toFavoriteIdSet(peekFavoriteLogosCache(authUser.id)));
    };

    void syncFavorites();
    return subscribeFavoriteLogos(syncFavoritesFromCache);
  }, [authUser?.id]);
  const logos = useMemo(() => {
    const businessName = typeof formData?.name === 'string' && formData.name.trim() ? formData.name.trim() : 'BRAND';
    const slogan = typeof formData?.slogan === 'string' ? formData.slogan.trim() : '';
    const industryLabel = INDUSTRY_LABELS[formData?.industryId] || 'Brand identity';
    const preferredFontFamily = EDITOR_FONT_FAMILIES[formData?.fontId] || 'Arial';
    const items = Array.isArray(activeResults) ? activeResults : [];

    return items.map((item, index) => {
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

      return {
        id: item?.id || index + 1,
        name: item?.logo_name || `${businessName} ${index + 1}`,
        businessName,
        slogan,
        industryLabel,
        themeColor: editablePayload?.textColor || item?.name_color || '#111827',
        backgroundColor: editablePayload?.bgColor || editablePayload?.backgroundColor || item?.background_color || '#ffffff',
        svgMarkup,
        editablePayload,
        previewDataUrl: null,
        fallbackUrl,
        editorImageUrl: hasEditableGraphicLayer(editablePayload) ? fallbackUrl : '',
        favoriteId: getFavoriteLogoKey({ id: item?.id || index + 1, businessName }),
      };
    });
  }, [activeResults, formData]);


  if (status === 'loading') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-pink-50">
        <Loader2 className="animate-spin text-red-500 mb-4" size={48} />
        <p className="text-slate-600 font-bold">Fetching your brand designs...</p>
      </div>
    );
  }

  if (!logos.length) {
    if (navigationKind === 'back_forward' && hasRecoverableDraft) {
      return null;
    }

    return (
      <div className="mt-20 min-h-screen bg-pink-50 px-6 py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500">
            <Sparkles size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-500">Results</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Generate logos first to view results</h1>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Start from Create, generate your logo concepts, then you can review, favorite, edit, and download them here.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push('/create?fresh=1')}
              className="brand-button-primary w-full justify-center px-8 py-3 sm:w-auto"
            >
              Go To Create
            </button>
            <button
              onClick={() => router.push('/')}
              className="brand-button-outline w-full justify-center px-8 py-3 sm:w-auto"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const redirectToSignIn = () => {
    router.push(`/auth/signin?next=${encodeURIComponent(currentLocation)}`);
  };

  const handleFavoriteAuthRequired = () => {
    setFavoriteNotice({
      type: 'info',
      title: 'Sign In Required',
      message: 'Please sign in to save favorites and downloads to your profile.',
    });
    redirectToSignIn();
  };

  const handleEditOnCanva = (design) => {
    const payloadKey = `logo-edit-${editScopeKey}-${design.id}`;
    const imageParam = design.editorImageUrl || '';

    if (typeof window !== 'undefined') {
      saveTemporaryEditorPayload(payloadKey, design.editablePayload || null);
    }

    const params = new URLSearchParams({
      img: imageParam,
      text: design.businessName,
      slogan: design.slogan || '',
      textColor: design.themeColor,
      bgColor: design.backgroundColor,
      name: design.name,
      designId: String(design.id),
      favoriteId: design.favoriteId,
      industryLabel: design.industryLabel || '',
      isFavorite: favoriteIds.has(design.favoriteId) ? '1' : '0',
      isSaved: '0',
      isDownloaded: '0',
      sourceContext: 'results',
      editScopeKey,
      payloadKey,
      returnTo: '/my-designs',
      returnMode: 'push',
    });

    const editorUrl = `/editor?${params.toString()}`;
    if (typeof window !== 'undefined') {
      if (!openEditorWindowWithPayload(editorUrl, payloadKey, design.editablePayload || null)) {
        window.open(editorUrl, '_blank');
      }
      return;
    }

    router.push(editorUrl);
  };
  const handleDownload = async (design, format) => {
    if (!design?.svgMarkup || !format) {
      return;
    }

    if (!authUser) {
      handleFavoriteAuthRequired();
      setDownloadDesign(null);
      return;
    }

    void saveDownloadedLogo(design, {
      isFavorite: favoriteIds.has(design.favoriteId),
      isSaved: false,
    }).catch((error) => {
      if (isAuthRequiredError(error)) {
        handleFavoriteAuthRequired();
        setDownloadDesign(null);
        return;
      }

      setFavoriteNotice({
        type: 'info',
        title: isLogoLibraryUpgradeRequiredError(error) ? 'Database Upgrade Required' : 'Download Saved Locally Only',
        message: isLogoLibraryUpgradeRequiredError(error)
          ? getLogoLibraryUpgradeMessage('downloads can be tracked')
          : 'The file was downloaded, but we could not update your downloads history right now.',
      });
    });

    const safeBaseName = getDownloadBaseName(design.name || design.businessName || 'logo');

    setDownloadingFormat(format);

    try {
      const exportSvgMarkup = await buildWatermarkedSvgMarkup(design.svgMarkup);

      if (format === 'svg') {
        triggerBlobDownload(new Blob([exportSvgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
        setDownloadDesign(null);
        return;
      }

      const { canvas, width, height } = await renderSvgToCanvas(exportSvgMarkup, 4);

      if (format === 'png') {
        const blob = await canvasToBlob(canvas, 'image/png');
        triggerBlobDownload(blob, `${safeBaseName}.png`);
        setDownloadDesign(null);
        return;
      }

      if (format === 'jpg') {
        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.jpg`);
        setDownloadDesign(null);
        return;
      }

      if (format === 'webp') {
        const blob = await canvasToBlob(canvas, 'image/webp', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.webp`);
        setDownloadDesign(null);
        return;
      }

      if (format === 'pdf') {
        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.98);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const pdfBlob = buildPdfBlobFromJpegBytes(jpegBytes, canvas.width || width, canvas.height || height);
        triggerBlobDownload(pdfBlob, `${safeBaseName}.pdf`);
        setDownloadDesign(null);
      }
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleToggleFavorite = async (design) => {
    if (!authUser) {
      handleFavoriteAuthRequired();
      return;
    }

    const wasFavorite = favoriteIds.has(design.favoriteId);
    const optimisticFavoriteIds = new Set(favoriteIds);

    if (wasFavorite) {
      optimisticFavoriteIds.delete(design.favoriteId);
    } else {
      optimisticFavoriteIds.add(design.favoriteId);
    }

    setFavoriteIds(optimisticFavoriteIds);

    try {
      const nextState = await toggleFavoriteLogo(design);
      setFavoriteIds(toFavoriteIdSet(nextState.logos));
      setFavoriteNotice({
        type: nextState.isFavorite ? 'favorite' : 'info',
        title: nextState.isFavorite ? 'Added To Favorites' : 'Removed From Favorites',
        message: nextState.isFavorite
          ? `${design.name} is now saved in your favorites.`
          : `${design.name} has been removed from your favorites.`,
      });
    } catch (error) {
      setFavoriteIds(new Set(favoriteIds));

      if (isAuthRequiredError(error)) {
        handleFavoriteAuthRequired();
        return;
      }

      setFavoriteNotice({
        type: 'info',
        title: isLogoLibraryUpgradeRequiredError(error) ? 'Database Upgrade Required' : 'Unable To Update',
        message: isLogoLibraryUpgradeRequiredError(error)
          ? getLogoLibraryUpgradeMessage('Favorites can update')
          : 'We could not update this favorite right now. Please try again.',
      });
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
            onClick={() => router.push('/create?step=1')}
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
                  <Image
                    src={design.fallbackUrl}
                    alt={design.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                    No preview
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
                  <div
                    className="absolute"
                    style={{
                      ...BRAND_WATERMARK_PATTERN_STYLE,
                      inset: BRAND_WATERMARK_OVERLAY_INSET,
                      opacity: BRAND_WATERMARK_OPACITY,
                      transform: `rotate(${BRAND_WATERMARK_ROTATION}deg) scale(${BRAND_WATERMARK_OVERLAY_SCALE})`,
                    }}
                  />
                </div>
                <div className="absolute inset-0 z-10 hidden items-end justify-center bg-black/20 pb-4 opacity-0 transition-opacity group-hover:opacity-100 sm:flex sm:pb-6">
                  <div className="flex w-full justify-center gap-2 px-2">
                    <button
                      onClick={() => void handleToggleFavorite(design)}
                      className={`brand-icon-button h-11 w-11 p-0 ${favoriteIds.has(design.favoriteId) ? 'border-red-100 bg-white text-red-500 shadow-[0_10px_24px_rgba(239,68,68,0.18)]' : ''}`}
                    >
                      <Heart
                        size={16}
                        fill={favoriteIds.has(design.favoriteId) ? 'currentColor' : 'none'}
                        className={favoriteIds.has(design.favoriteId) ? 'text-red-500' : ''}
                      />
                    </button>
                    <button onClick={() => handleEditOnCanva(design)} className="brand-icon-button h-11 w-11 p-0"><Edit3 size={16} /></button>
                    <button onClick={() => authUser ? setDownloadDesign(design) : handleFavoriteAuthRequired()} className="brand-icon-button h-11 w-11 p-0"><Download size={16} /></button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-2 sm:hidden">
                <button
                  onClick={() => void handleToggleFavorite(design)}
                  className={`brand-icon-button h-11 w-11 p-0 ${favoriteIds.has(design.favoriteId) ? 'border-red-100 bg-white text-red-500 shadow-[0_10px_24px_rgba(239,68,68,0.18)]' : ''}`}
                >
                  <Heart size={16} fill={favoriteIds.has(design.favoriteId) ? 'currentColor' : 'none'} className={favoriteIds.has(design.favoriteId) ? 'text-red-500' : ''} />
                </button>
                <button onClick={() => handleEditOnCanva(design)} className="brand-icon-button h-11 w-11 p-0">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => authUser ? setDownloadDesign(design) : handleFavoriteAuthRequired()} className="brand-icon-button h-11 w-11 p-0">
                  <Download size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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

      <FloatingNotice notice={favoriteNotice} onClose={() => setFavoriteNotice(null)} />
    </div>
  );
};

export default ResultsPage;






















