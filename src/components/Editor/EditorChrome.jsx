"use client";

import React from 'react';
import { Download, Eye, Redo2, Save, Undo2 } from 'lucide-react';

export function DesktopToolRail({
  editorTools,
  activeTool,
  onToolSelect,
}) {
  return (
    <aside className="hidden h-full w-[132px] shrink-0 overflow-y-hidden border-r border-slate-200/80 bg-white/88 z-20 lg:flex lg:flex-col lg:items-center lg:px-2 lg:py-0">
      <div className="flex w-full flex-col items-stretch gap-4">
        {editorTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              title={tool.label}
              className={`brand-icon-button flex min-h-[88px] w-full flex-col items-center justify-center gap-0 rounded-[1.45rem] px-2 py-2 text-slate-600 transition-all ${isActive ? 'scale-[1.03]' : ''} ${isActive
                ? 'bg-slate-100 text-slate-900 ring-2 ring-slate-200'
                : 'hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <Icon size={19} />
              <span className="max-w-full whitespace-nowrap px-1 text-center text-[10px] font-extrabold uppercase leading-tight tracking-[0.02em]">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function MobileHeader({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  watermarkEnabled,
  onToggleWatermark,
  onPreview,
  onSave,
  onDownload,
  canSave,
  savingChanges,
}) {
  return (
    <div className="z-[100] shrink-0 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${!canUndo
              ? 'cursor-not-allowed bg-gray-50 text-slate-400'
              : 'bg-gray-50 text-gray-600'
              }`}
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${!canRedo
              ? 'cursor-not-allowed bg-gray-50 text-slate-400'
              : 'bg-gray-50 text-gray-600'
              }`}
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
          <label className="flex h-10 items-center gap-2 rounded-xl bg-gray-50 px-3 text-[12px] font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={watermarkEnabled !== false}
              onChange={(event) => onToggleWatermark?.(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-slate-600"
            />
            <span>Watermark</span>
          </label>
        </div>
        <h1 className="min-w-0 flex-1 text-center text-xl font-black tracking-tight text-slate-900">
          Logo Maker
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-all"
            title="Preview"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={onSave}
            disabled={!canSave || savingChanges}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${!canSave || savingChanges
              ? 'cursor-not-allowed bg-gray-50 text-slate-400'
              : 'bg-gray-50 text-gray-600'
              }`}
            title={savingChanges ? 'Saving...' : 'Save Design'}
            aria-busy={savingChanges ? 'true' : 'false'}
          >
            <Save size={18} />
          </button>
          <button
            onClick={onDownload}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-all"
            title="Download"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileBottomPanel({
  sidebarOpen,
  shouldShowDesktopSidebar,
  mobileContextBar,
  sidebarContent,
  mobileEditorTools,
  selectedCanvasItem,
  activeTool,
  onToolSelect,
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] lg:hidden">
      <div className="overflow-hidden border-t border-slate-200 bg-[#0f172a] shadow-[0_-10px_30px_rgba(15,23,42,0.18)]">
        <div
          className={`overflow-hidden bg-white/98 transition-all duration-300 ${sidebarOpen && shouldShowDesktopSidebar ? 'max-h-[56svh] border-b border-slate-200 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="max-h-[56svh] overflow-y-auto overflow-x-hidden px-2.5 pb-2 pt-2">
            {mobileContextBar && (
              <div className="-mx-2.5 mb-1.5 border-b border-slate-100 bg-white/96 px-2.5 pb-1.5">
                {mobileContextBar}
              </div>
            )}
            <div className="space-y-1.5 pb-1">
              {sidebarContent}
            </div>
          </div>
        </div>

        <div className="px-2 pb-[calc(0.3rem+env(safe-area-inset-bottom))] pt-1">
          <div className="flex items-stretch gap-1 overflow-x-auto pb-0.5">
            {mobileEditorTools.map((tool) => {
              const Icon = tool.icon;
              const isControlsTool = tool.id === 'controls';
              const isActive = isControlsTool
                ? Boolean(selectedCanvasItem && !activeTool)
                : activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool.id)}
                  title={tool.label}
                  aria-label={tool.label}
                  className={`relative flex min-h-[46px] min-w-[52px] flex-1 items-center justify-center rounded-2xl px-1.5 py-1.5 transition-all ${isActive ? 'scale-[1.06]' : ''} ${isActive
                    ? 'bg-white text-[#0f172a] shadow-md'
                    : 'text-white/88'
                    }`}
                >
                  {isActive ? (
                    <span className="absolute left-1/2 top-1.5 h-1 w-5 -translate-x-1/2 rounded-full bg-slate-500" />
                  ) : null}
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DesktopActionDock({
  className = '',
  onPreview,
  onSave,
  onDownload,
  canSave,
  savingChanges,
}) {
  return (
    <div className={`z-20 hidden w-full justify-center lg:flex ${className}`}>
      <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
        <button
          onClick={onPreview}
          className="brand-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all"
          title="Preview"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={onSave}
          disabled={!canSave || savingChanges}
          className={`brand-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all ${!canSave || savingChanges ? 'cursor-not-allowed opacity-60' : ''}`}
          title={savingChanges ? 'Saving...' : 'Save Design'}
          aria-busy={savingChanges ? 'true' : 'false'}
        >
          <Save size={15} />
        </button>
        <button
          onClick={onDownload}
          className="brand-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all"
          title="Download"
        >
          <Download size={15} />
        </button>
      </div>
    </div>
  );
}
