"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Edit3, Download, Loader2 } from 'lucide-react';

import DownloadDialog from '../../components/DownloadDialog';
import FloatingNotice from '../../components/MainComponents/FloatingNotice';
import { createClient } from '../../lib/supabaseClient';
import {
  loadFavoriteLogoRuntime,
  subscribeFavoriteLogos,
} from '../../lib/favoriteLogosStorage';
import {
  loadFavoriteLogos,
  peekFavoriteLogosCache,
  removeFavoriteLogo,
  saveFavoriteLogo,
} from '../../lib/favoriteLogosRepository';
import {
  buildPdfBlobFromJpegBytes,
  canvasToBlob,
  getDownloadBaseName,
  renderSvgToCanvas,
  triggerBlobDownload,
} from '../../lib/downloadAssets';

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

const isMissingAuthSessionError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.name === 'AuthSessionMissingError' || message.includes('auth session missing');
};

export default function FavoritesPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [downloadDesign, setDownloadDesign] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [favoriteNotice, setFavoriteNotice] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    const syncUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error && !isMissingAuthSessionError(error)) {
        console.error('Unable to read auth user:', error);
      }
      const cachedLogos = peekFavoriteLogosCache(data?.user?.id || null);
      if (cachedLogos.length > 0) {
        setFavorites(cachedLogos);
      }
      setAuthUser(data?.user || null);
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
  }, []);

  useEffect(() => {
    if (!authChecked) {
      return () => {};
    }

    if (!authUser) {
      setFavorites([]);
      return () => {};
    }

    const syncFavorites = async () => {
      const cachedFavorites = peekFavoriteLogosCache(authUser.id);
      if (cachedFavorites.length > 0) {
        setFavorites(cachedFavorites);
      }

      const nextFavorites = await loadFavoriteLogos();
      setFavorites(Array.isArray(nextFavorites) ? nextFavorites : []);
    };

    const syncFavoritesFromCache = () => {
      const cachedFavorites = peekFavoriteLogosCache(authUser.id);
      setFavorites(Array.isArray(cachedFavorites) ? cachedFavorites : []);
    };

    void syncFavorites();

    return subscribeFavoriteLogos(syncFavoritesFromCache);
  }, [authChecked, authUser?.id]);

  const handleRemoveFavorite = async (design) => {
    const previousFavorites = favorites;
    setFavorites(previousFavorites.filter((item) => item.favoriteId !== design.favoriteId));

    try {
      await removeFavoriteLogo(design.favoriteRowKey || design.favoriteId);
      setFavoriteNotice({
        type: 'info',
        title: 'Removed From Favorites',
        message: `${design.name} has been removed from your favorites.`,
      });
    } catch (error) {
      setFavorites(previousFavorites);
      console.error('Unable to remove favorite logo:', error);
      setFavoriteNotice({
        type: 'info',
        title: 'Unable To Update',
        message: 'We could not update favorites right now. Please try again.',
      });
    }
  };

  const handleEdit = (design) => {
    const payloadKey = `favorite-logo-edit-${design.favoriteId}`;
    const runtimePayload = loadFavoriteLogoRuntime(design.favoriteId);
    const editablePayload = runtimePayload?.editablePayload || design.editablePayload || null;

    if (typeof window !== 'undefined' && editablePayload) {
      window.sessionStorage.setItem(payloadKey, JSON.stringify(editablePayload));
    }

    const params = new URLSearchParams({
      img: design.fallbackUrl || '',
      text: design.businessName || 'Brand',
      slogan: design.slogan || '',
      textColor: design.themeColor || '#111827',
      bgColor: design.backgroundColor || '#ffffff',
      name: design.name || 'Logo Design',
      designId: String(design.designId || design.id || design.favoriteId),
      favoriteId: design.favoriteId,
      industryLabel: design.industryLabel || '',
      isFavorite: '1',
      sourceContext: 'favorites',
      returnTo: '/favorites',
      returnMode: 'push',
      editScopeKey: design.favoriteId,
    });

    if (design.favoriteRowKey) {
      params.set('favoriteRowKey', design.favoriteRowKey);
    }

    if (editablePayload) {
      params.set('payloadKey', payloadKey);
    }

    router.push(`/editor?${params.toString()}`);
  };

  const handleDownload = async (design, format) => {
    const currentSvgMarkup = design?.previewDataUrl
      ? buildRasterSvgMarkup(design.previewDataUrl)
      : design?.svgMarkup;

    if (!currentSvgMarkup || !format) {
      return;
    }

    const nextFavorites = await saveFavoriteLogo(design, { markDownloaded: true });
    const refreshedDesign = nextFavorites.find((item) => item.favoriteId === design.favoriteId) || design;
    const refreshedSvgMarkup = refreshedDesign?.previewDataUrl
      ? buildRasterSvgMarkup(refreshedDesign.previewDataUrl)
      : (refreshedDesign?.svgMarkup || currentSvgMarkup);
    const safeBaseName = getDownloadBaseName(refreshedDesign.name || refreshedDesign.businessName || 'logo');
    setDownloadingFormat(format);

    try {
      if (format === 'svg') {
        triggerBlobDownload(new Blob([refreshedSvgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
        return;
      }

      const { canvas, width, height } = await renderSvgToCanvas(refreshedSvgMarkup, 4);

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
      <div className="mt-20 min-h-screen flex items-center justify-center bg-pink-50 px-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-pink-600" size={42} />
          <p className="text-sm font-bold text-slate-600">Loading your profile workspace...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="mt-20 min-h-screen bg-pink-50 px-6 py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-500">Favorites</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Sign in to view your saved logos</h1>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Sign in to access your saved favorite logos, continue editing them, and download them from one place.
          </p>
          <Link
            href="/auth/signin?next=%2Ffavorites"
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
        {favorites.length === 0 ? (
          <div className="w-full rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <Heart className="mx-auto mb-4 text-pink-500" size={36} />
            <h2 className="text-2xl font-black text-slate-900">No favorites yet</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Save logos from the results page and they will show up here in the same card layout.
            </p>
            <Link
              href="/create"
              className="mt-6 inline-flex rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-8 py-3 text-sm font-bold text-white"
            >
              Create Logos
            </Link>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5">
            {favorites.map((design) => {
              const previewSvgMarkup = design.previewDataUrl
                ? buildRasterSvgMarkup(design.previewDataUrl)
                : design.svgMarkup;

              return (
              <div
                key={design.favoriteId}
                className="group relative rounded-[1.5rem] border border-transparent bg-white p-2.5 shadow-md transition-all hover:border-pink-200 sm:rounded-[1.9rem] sm:p-3"
              >
                <div className="relative aspect-[7/5] w-full overflow-hidden rounded-[1.15rem] bg-slate-50 sm:rounded-[1.5rem]">
                  {previewSvgMarkup ? (
                    <InlineSvgPreview svgMarkup={previewSvgMarkup} alt={design.name} />
                  ) : design.fallbackUrl ? (
                    <img src={design.fallbackUrl} alt={design.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold">
                      No preview
                    </div>
                  )}
                  <div className="absolute inset-0 hidden items-end justify-center bg-black/20 pb-4 opacity-0 transition-opacity group-hover:opacity-100 sm:flex sm:pb-6">
                    <div className="flex w-full justify-center gap-2 px-2">
                      <button
                        onClick={() => void handleRemoveFavorite(design)}
                        className="brand-icon-button h-11 w-11 p-0 border-red-100 bg-white text-red-500 shadow-[0_10px_24px_rgba(239,68,68,0.18)]"
                      >
                        <Heart size={16} fill="currentColor" className="text-red-500" />
                      </button>
                      <button onClick={() => handleEdit(design)} className="brand-icon-button h-11 w-11 p-0">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setDownloadDesign(design)} className="brand-icon-button h-11 w-11 p-0">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 sm:hidden">
                  <button
                    onClick={() => void handleRemoveFavorite(design)}
                    className="brand-icon-button h-11 w-11 p-0 border-red-100 bg-white text-red-500 shadow-[0_10px_24px_rgba(239,68,68,0.18)]"
                  >
                    <Heart size={16} fill="currentColor" className="text-red-500" />
                  </button>
                  <button onClick={() => handleEdit(design)} className="brand-icon-button h-11 w-11 p-0">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setDownloadDesign(design)} className="brand-icon-button h-11 w-11 p-0">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            )})}
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

      <FloatingNotice notice={favoriteNotice} onClose={() => setFavoriteNotice(null)} />
    </div>
  );
}


