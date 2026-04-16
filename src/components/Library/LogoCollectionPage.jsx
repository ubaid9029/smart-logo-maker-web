"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Download, Edit3, Heart, Trash2 } from 'lucide-react';

import DownloadDialog from '../DownloadDialog';
import FloatingNotice from '../MainComponents/FloatingNotice';
import PremiumLoader from '../Shared/PremiumLoader';
import { openEditorWindowWithPayload, saveTemporaryEditorPayload } from '../../lib/editorPayloadStorage';
import { createClient } from '../../lib/supabaseClient';
import { loadFavoriteLogoRuntime, subscribeFavoriteLogos } from '../../lib/favoriteLogosStorage';
import {
  filterLogoLibraryItems,
  getLogoLibraryUpgradeMessage,
  isLogoLibraryUpgradeRequiredError,
  isSupabaseAuthSessionMissingError,
  loadLogoLibrary,
  loadDownloadedLogos,
  loadFavoriteLogos,
  loadSavedLogos,
  peekLogoLibraryCache,
  peekDownloadedLogosCache,
  peekFavoriteLogosCache,
  peekSavedLogosCache,
  deleteLibraryDesign,
  saveDownloadedLogo,
  subscribeLogoLibraryRealtime,
  toggleFavoriteLogo,
} from '../../lib/favoriteLogosRepository';
import {
  buildRasterImageSvgMarkup,
  buildWatermarkedSvgMarkup,
  buildPdfBlobFromJpegBytes,
  canvasToBlob,
  cropCanvasToLogicalArea,
  getDownloadBaseName,
  renderDataUrlToCanvas,
  renderSvgToCanvas,
  triggerBlobDownload,
} from '../../lib/downloadAssets';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARD_HEIGHT,
  CARD_WIDTH,
} from '../Editor/editorConstants';
import {
  injectBrandWatermarkIntoSvgMarkup,
} from '../../lib/watermarkConfig';

const EDITOR_CARD_EXPORT_AREA = {
  x: 40,
  y: 40,
  width: 620,
  height: 420,
};
const EDITOR_LOGICAL_CANVAS_SIZE = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
};

const COLLECTION_CONFIG = {
  all: {
    title: 'My Designs',
    headerDescription: 'All your logos in one place: favorites, saved edits, and downloads.',
    signInTitle: 'Sign in to view your designs',
    signInDescription: 'Sign in to access your full logo history and keep it synced across devices.',
    emptyTitle: 'No designs yet',
    emptyDescription: 'Generate a logo, then save, favorite, or download to see it here.',
    routePath: '/my-designs',
  },
  favorites: {
    title: 'Favorites',
    headerDescription: 'Keep your preferred logos handy, then continue editing or downloading from here.',
    signInTitle: 'Sign in to view your favorite logos',
    signInDescription: 'Sign in to access the logos you marked as favorites and continue editing them from one place.',
    emptyTitle: 'No favorites yet',
    emptyDescription: 'Add logos to Favorites from the results page and they will appear here.',
    routePath: '/favorites',
  },
  saved: {
    title: 'Saved',
    headerDescription: 'Edited logos you intentionally saved from the editor will appear here.',
    signInTitle: 'Sign in to view your saved logos',
    signInDescription: 'Sign in to access edited logos you saved from the editor and continue refining them.',
    emptyTitle: 'No saved logos yet',
    emptyDescription: 'Open any logo in the editor and press Save. The updated version will appear here.',
    routePath: '/saved',
  },
  downloads: {
    title: 'Downloads',
    headerDescription: 'Every logo you download from results, favorites, or the editor will be collected here.',
    signInTitle: 'Sign in to view your downloads',
    signInDescription: 'Sign in to keep a history of the logos you downloaded and reopen them whenever you need.',
    emptyTitle: 'No downloads yet',
    emptyDescription: 'Download any logo and it will be tracked here with its latest stored version.',
    routePath: '/downloads',
  },
};

const LOADERS = {
  all: loadLogoLibrary,
  favorites: loadFavoriteLogos,
  saved: loadSavedLogos,
  downloads: loadDownloadedLogos,
};

const PEEKERS = {
  all: peekLogoLibraryCache,
  favorites: peekFavoriteLogosCache,
  saved: peekSavedLogosCache,
  downloads: peekDownloadedLogosCache,
};

const buildRasterSvgMarkup = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" preserveAspectRatio="xMidYMid meet">`,
    `<image href="${imageUrl}" x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" preserveAspectRatio="none" />`,
    '</svg>',
  ].join('');
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

const hasEditableGraphicLayer = (editablePayload) => (
  Array.isArray(editablePayload?.logoItems) &&
  editablePayload.logoItems.some((item) => (
    (typeof item?.imageUrl === 'string' && item.imageUrl.trim()) ||
    (typeof item?.src === 'string' && item.src.trim())
  ))
);

export default function LogoCollectionPage({ collectionType = 'favorites' }) {
  const config = COLLECTION_CONFIG[collectionType] || COLLECTION_CONFIG.all;
  const loadCollection = LOADERS[collectionType] || LOADERS.all;
  const peekCollection = PEEKERS[collectionType] || PEEKERS.all;
  const [authChecked, setAuthChecked] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [collectionLogos, setCollectionLogos] = useState([]);
  const [downloadDesign, setDownloadDesign] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [notice, setNotice] = useState(null);
  const authUserId = authUser?.id || null;
  const signInHref = `/auth/signin?next=${encodeURIComponent(config.routePath)}`;

  const dedupeCollectionLogos = useCallback((logos) => {
    const safeLogos = Array.isArray(logos) ? logos.filter(Boolean) : [];
    const seen = new Set();
    const result = [];

    for (const item of safeLogos) {
      const key = item?.favoriteId || item?.favoriteRowKey || item?.id || null;
      if (!key || seen.has(key)) {
        continue;
      }

      seen.add(key);
      result.push(item);
    }

    return result;
  }, []);

  const applyCollectionLogos = useCallback((logos) => {
    setCollectionLogos(dedupeCollectionLogos(logos));
  }, [dedupeCollectionLogos]);

  useEffect(() => {
    const supabase = createClient();

    const syncUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error && !isSupabaseAuthSessionMissingError(error)) {
        console.error('Unable to read auth user:', error);
      }

      const nextUser = data?.session?.user || null;
      const cachedLogos = peekCollection(nextUser?.id || null);
      if (cachedLogos.length > 0) {
        applyCollectionLogos(cachedLogos);
      }

      setAuthUser(nextUser);
      setAuthChecked(true);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, [applyCollectionLogos, peekCollection]);

  useEffect(() => {
    if (!authChecked) {
      return () => {};
    }

    if (!authUserId) {
      setCollectionLogos([]);
      return () => {};
    }

    const syncCollection = async () => {
      const cachedLogos = peekCollection(authUserId);
      if (cachedLogos.length > 0) {
        applyCollectionLogos(cachedLogos);
      }

      try {
        const nextLogos = await loadCollection();
        applyCollectionLogos(nextLogos);
      } catch (error) {
        console.error(`Unable to load ${collectionType} logos:`, error);
        if (isLogoLibraryUpgradeRequiredError(error)) {
          setNotice({
            type: 'info',
            title: 'Database Upgrade Required',
            message: getLogoLibraryUpgradeMessage('Favorites, Saved, and Downloads can load'),
          });
          applyCollectionLogos([]);
          return;
        }

        setNotice({
          type: 'info',
          title: 'Unable To Load Logos',
          message: 'We could not load this logo collection right now. Please try again.',
        });
      }
    };

    const syncCollectionFromCache = () => {
      applyCollectionLogos(peekCollection(authUserId));
    };

    void syncCollection();
    const unsubscribeLocal = subscribeFavoriteLogos(syncCollectionFromCache);
    const unsubscribeRealtime = subscribeLogoLibraryRealtime(syncCollectionFromCache);

    return () => {
      unsubscribeLocal();
      unsubscribeRealtime();
    };
  }, [applyCollectionLogos, authChecked, authUserId, collectionType, loadCollection, peekCollection]);

  const handleFavoriteToggle = async (design) => {
    const wasFavorite = Boolean(design?.isFavorite);

    setCollectionLogos((currentLogos) => (
      collectionType === 'favorites' && wasFavorite
        ? currentLogos.filter((item) => item.favoriteId !== design.favoriteId)
        : currentLogos.map((item) => (
            item.favoriteId === design.favoriteId
              ? { ...item, isFavorite: !wasFavorite }
              : item
          ))
    ));

    try {
      const nextState = await toggleFavoriteLogo(design);
      applyCollectionLogos(filterLogoLibraryItems(nextState.logos, collectionType));
      setNotice({
        type: nextState.isFavorite ? 'favorite' : 'info',
        title: nextState.isFavorite ? 'Added To Favorites' : 'Removed From Favorites',
        message: nextState.isFavorite
          ? `${design.name} is now saved in Favorites.`
          : `${design.name} has been removed from Favorites.`,
      });
    } catch (error) {
      console.error('Unable to update favorites state:', error);
      applyCollectionLogos(peekCollection(authUserId));
      setNotice({
        type: 'info',
        title: isLogoLibraryUpgradeRequiredError(error) ? 'Database Upgrade Required' : 'Unable To Update',
        message: isLogoLibraryUpgradeRequiredError(error)
          ? getLogoLibraryUpgradeMessage('Favorites, Saved, and Downloads can update')
          : 'We could not update the logo status right now. Please try again.',
      });
    }
  };

  const handleEdit = (design) => {
    const payloadKey = `library-logo-edit-${design.favoriteId}`;
    const runtimePayload = loadFavoriteLogoRuntime(design.favoriteId);
    const editablePayload = runtimePayload?.editablePayload || design.editablePayload || null;
    const imageParam = hasEditableGraphicLayer(editablePayload) ? (design.fallbackUrl || '') : '';

    if (typeof window !== 'undefined' && editablePayload) {
      saveTemporaryEditorPayload(payloadKey, editablePayload);
    }

    const params = new URLSearchParams({
      img: imageParam,
      text: design.businessName || 'Brand',
      slogan: design.slogan || '',
      textColor: design.themeColor || '#111827',
      bgColor: design.backgroundColor || '#ffffff',
      name: design.name || 'Logo Design',
      designId: String(design.designId || design.id || design.favoriteId),
      favoriteId: design.favoriteId,
      industryLabel: design.industryLabel || '',
      isFavorite: design.isFavorite ? '1' : '0',
      isSaved: design.isSaved ? '1' : '0',
      isDownloaded: design.isDownloaded ? '1' : '0',
      sourceContext: collectionType,
      returnTo: '/my-designs',
      returnMode: 'push',
      editScopeKey: design.favoriteId,
    });

    if (design.favoriteRowKey) {
      params.set('favoriteRowKey', design.favoriteRowKey);
    }

    if (editablePayload) {
      params.set('payloadKey', payloadKey);
    }

    const editorUrl = `/editor?${params.toString()}`;
    if (typeof window !== 'undefined') {
      if (!openEditorWindowWithPayload(editorUrl, payloadKey, editablePayload)) {
        window.open(editorUrl, '_blank');
      }
      return;
    }
  };

  const handleDelete = async (design) => {
    if (!design?.favoriteId) {
      return;
    }

    if (typeof window !== 'undefined') {
      const ok = window.confirm('Delete this design from My Designs? This cannot be undone.');
      if (!ok) {
        return;
      }
    }

    try {
      const nextLibraryLogos = await deleteLibraryDesign(design);
      applyCollectionLogos(filterLogoLibraryItems(nextLibraryLogos, collectionType));
      setNotice({
        type: 'info',
        title: 'Design Deleted',
        message: 'The design was removed from My Designs.',
      });
    } catch (error) {
      console.error('Unable to delete design:', error);
      setNotice({
        type: 'info',
        title: 'Unable To Delete',
        message: 'We could not delete this design right now. Please try again.',
      });
    }
  };

  const handleDownload = async (design, format) => {
    const currentSvgMarkup = design?.svgMarkup
      || (design?.previewDataUrl ? buildRasterSvgMarkup(design.previewDataUrl) : null);

    if (!currentSvgMarkup || !format) {
      return;
    }

    const persistDownloadPromise = saveDownloadedLogo(design, {
      isFavorite: design.isFavorite,
      isSaved: design.isSaved,
    });

    void persistDownloadPromise
      .then((nextLibraryLogos) => {
        applyCollectionLogos(filterLogoLibraryItems(nextLibraryLogos, collectionType));
      })
      .catch((error) => {
        console.error('Unable to store downloaded logo:', error);
        setNotice({
          type: 'info',
          title: isLogoLibraryUpgradeRequiredError(error) ? 'Database Upgrade Required' : 'Download Saved Locally Only',
          message: isLogoLibraryUpgradeRequiredError(error)
            ? getLogoLibraryUpgradeMessage('downloads can be tracked')
            : 'The file was downloaded, but we could not update your downloads history right now.',
        });
      });

    const refreshedDesign = {
      ...design,
      isDownloaded: true,
    };
    const refreshedSvgMarkup = refreshedDesign.svgMarkup
      || (refreshedDesign.previewDataUrl ? buildRasterSvgMarkup(refreshedDesign.previewDataUrl) : currentSvgMarkup);
    const safeBaseName = getDownloadBaseName(refreshedDesign.name || refreshedDesign.businessName || 'logo');
    setDownloadingFormat(format);

    try {
      if (refreshedDesign.previewDataUrl) {
        const { canvas } = await renderDataUrlToCanvas(refreshedDesign.previewDataUrl);
        const cardCanvas = cropCanvasToLogicalArea(canvas, EDITOR_CARD_EXPORT_AREA, EDITOR_LOGICAL_CANVAS_SIZE);

        if (refreshedDesign?.editablePayload?.watermarkEnabled !== false) {
          await applyWatermarkToCanvas(cardCanvas, {
            logicalWidth: EDITOR_CARD_EXPORT_AREA.width,
            logicalHeight: EDITOR_CARD_EXPORT_AREA.height,
          });
        }

        if (format === 'svg') {
          const svgMarkup = buildRasterImageSvgMarkup(cardCanvas.toDataURL('image/png'), cardCanvas.width, cardCanvas.height);
          triggerBlobDownload(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
          return;
        }

        if (format === 'png') {
          const blob = await canvasToBlob(cardCanvas, 'image/png');
          triggerBlobDownload(blob, `${safeBaseName}.png`);
          return;
        }

        if (format === 'jpg') {
          const blob = await canvasToBlob(cardCanvas, 'image/jpeg', 0.96);
          triggerBlobDownload(blob, `${safeBaseName}.jpg`);
          return;
        }

        if (format === 'webp') {
          const blob = await canvasToBlob(cardCanvas, 'image/webp', 0.96);
          triggerBlobDownload(blob, `${safeBaseName}.webp`);
          return;
        }

        if (format === 'pdf') {
          const jpegBlob = await canvasToBlob(cardCanvas, 'image/jpeg', 0.98);
          const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
          const pdfBlob = buildPdfBlobFromJpegBytes(jpegBytes, cardCanvas.width, cardCanvas.height);
          triggerBlobDownload(pdfBlob, `${safeBaseName}.pdf`);
          return;
        }
      }

      const exportSvgMarkup = refreshedDesign?.editablePayload?.watermarkEnabled === false
        ? refreshedSvgMarkup
        : await buildWatermarkedSvgMarkup(refreshedSvgMarkup);

      if (format === 'svg') {
        triggerBlobDownload(new Blob([exportSvgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
        return;
      }

      const { canvas, width, height } = await renderSvgToCanvas(exportSvgMarkup, 4);

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

  if (!authChecked) {
    return (
      <div className="mt-20 min-h-screen bg-pink-50 px-6">
        <PremiumLoader
          size="lg"
          text="Loading your profile workspace..."
          className="min-h-[calc(100vh-5rem)]"
        />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="mt-20 min-h-screen bg-pink-50 px-6 py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-500">{config.title}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{config.signInTitle}</h1>
          <p className="mt-3 text-sm font-medium text-slate-500">{config.signInDescription}</p>
          <Link
            href={signInHref}
            className="mt-6 inline-flex rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-8 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(255,0,122,0.22)]"
          >
            Go To Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen w-full bg-pink-50 pb-14 pt-6 sm:mt-20 sm:pb-20 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8 w-full">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-500">{config.title}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{config.title} Logos</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{config.headerDescription}</p>
        </div>

        {collectionLogos.length === 0 ? (
          <div className="w-full rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <Heart className="mx-auto mb-4 text-pink-500" size={36} />
            <h2 className="text-2xl font-black text-slate-900">{config.emptyTitle}</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">{config.emptyDescription}</p>
            <Link
              href="/create?fresh=1"
              className="mt-6 inline-flex rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-8 py-3 text-sm font-bold text-white"
            >
              Create Logos
            </Link>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5">
            {collectionLogos.map((design) => {
              const previewSvgMarkup = design.svgMarkup
                || (design.previewDataUrl ? buildRasterSvgMarkup(design.previewDataUrl) : null);
              const shouldApplyCardWatermark =
                design?.editablePayload?.watermarkEnabled !== false && !design.previewDataUrl;

              return (
                <div
                  key={design.favoriteId}
                  className="group relative rounded-[1.5rem] border border-transparent bg-white p-2.5 shadow-md transition-all hover:border-pink-200 sm:rounded-[1.9rem] sm:p-3"
                >
                  <div className="relative aspect-[7/5] w-full overflow-hidden rounded-[1.15rem] bg-slate-50 sm:rounded-[1.5rem]">
                    {previewSvgMarkup ? (
                      <InlineSvgPreview
                        svgMarkup={shouldApplyCardWatermark
                          ? injectBrandWatermarkIntoSvgMarkup(previewSvgMarkup)
                          : previewSvgMarkup}
                        alt={design.name}
                      />
                    ) : design.fallbackUrl ? (
                      <Image
                        src={design.fallbackUrl}
                        alt={design.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold">
                        No preview
                      </div>
                    )}

                    <div className="absolute inset-x-2 bottom-2 hidden items-center justify-center gap-2 sm:flex">
                      <button
                        onClick={() => void handleFavoriteToggle(design)}
                        className={`brand-icon-button h-11 w-11 p-0 ${design.isFavorite ? 'border-red-100 bg-white text-red-500 shadow-[0_10px_24px_rgba(239,68,68,0.18)]' : ''}`}
                      >
                        <Heart size={16} fill={design.isFavorite ? 'currentColor' : 'none'} className={design.isFavorite ? 'text-red-500' : ''} />
                      </button>
                      <button onClick={() => handleEdit(design)} className="brand-icon-button h-11 w-11 p-0">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setDownloadDesign(design)} className="brand-icon-button h-11 w-11 p-0">
                        <Download size={16} />
                      </button>
                      {collectionType === 'all' ? (
                        <button onClick={() => void handleDelete(design)} className="brand-icon-button h-11 w-11 p-0">
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-2 sm:hidden">
                    <button
                      onClick={() => void handleFavoriteToggle(design)}
                      className={`brand-icon-button h-11 w-11 p-0 ${design.isFavorite ? 'border-red-100 bg-white text-red-500 shadow-[0_10px_24px_rgba(239,68,68,0.18)]' : ''}`}
                    >
                      <Heart size={16} fill={design.isFavorite ? 'currentColor' : 'none'} className={design.isFavorite ? 'text-red-500' : ''} />
                    </button>
                    <button onClick={() => handleEdit(design)} className="brand-icon-button h-11 w-11 p-0">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setDownloadDesign(design)} className="brand-icon-button h-11 w-11 p-0">
                      <Download size={16} />
                    </button>
                    {collectionType === 'all' ? (
                      <button onClick={() => void handleDelete(design)} className="brand-icon-button h-11 w-11 p-0">
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      <FloatingNotice notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
