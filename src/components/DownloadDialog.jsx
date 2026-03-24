"use client";

import { Download, Loader2, X } from 'lucide-react';
import { DOWNLOAD_FORMATS } from '../lib/downloadAssets';

export default function DownloadDialog({
  open,
  title,
  subtitle,
  downloadingFormat,
  onClose,
  onDownload,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              {downloadingFormat ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Download</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{title || 'Export Logo'}</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {subtitle || 'Choose the file type you want to download.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DOWNLOAD_FORMATS.map((format) => (
            <button
              key={format.id}
              onClick={() => onDownload(format.id)}
              disabled={Boolean(downloadingFormat)}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                downloadingFormat
                  ? 'cursor-not-allowed border-slate-200 bg-white/70 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold">{format.label}</p>
                <Download size={16} />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">{format.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
