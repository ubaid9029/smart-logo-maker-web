"use client";

import { useMemo, useState } from 'react';
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
  const [selectedFormat, setSelectedFormat] = useState(DOWNLOAD_FORMATS[0]?.id || 'png');
  const activeFormat = useMemo(
    () => DOWNLOAD_FORMATS.find((format) => format.id === selectedFormat) || DOWNLOAD_FORMATS[0],
    [selectedFormat]
  );

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

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <label htmlFor="download-format" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              File Type
            </label>
            <select
              id="download-format"
              value={selectedFormat}
              onChange={(event) => setSelectedFormat(event.target.value)}
              disabled={Boolean(downloadingFormat)}
              className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-300"
            >
              {DOWNLOAD_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {activeFormat?.description || 'Choose the file type you want to download.'}
            </p>
          </div>

          <button
            onClick={() => activeFormat && onDownload(activeFormat.id)}
            disabled={Boolean(downloadingFormat) || !activeFormat}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
              downloadingFormat || !activeFormat
                ? 'cursor-not-allowed bg-slate-300 shadow-none'
                : 'bg-gradient-to-r from-[#FF6B00] via-[#E02424] to-[#C400FF] hover:opacity-95'
            }`}
          >
            {downloadingFormat ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span>{downloadingFormat ? 'Downloading...' : `Download ${activeFormat?.label || ''}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
