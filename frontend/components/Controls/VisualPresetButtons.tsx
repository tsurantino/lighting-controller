import React from 'react';
import { VisualPreset } from '../../types';

const visualIconBase = "w-8 h-8 mx-auto mb-1";
const VISUAL_ICONS: Record<VisualPreset, React.ReactNode> = {
  [VisualPreset.Grid]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>,
  [VisualPreset.Bracket]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><path d="M8 3H5a2 2 0 0 0-2 2v3m14-5h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3m14 5h3a2 2 0 0 0 2-2v-3"/></svg>,
  [VisualPreset.LBracket]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><path d="M14 3h7v7M3 10V3h7m11 4v7h-7M10 21v-7H3"/></svg>,
  [VisualPreset.SCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>,
  [VisualPreset.Cross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/></svg>,
  [VisualPreset.LCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>,
  [VisualPreset.SDblCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M11 5h2v14h-2V5zM5 8h14v2H5V8zm0 6h14v2H5v-2z" /></svg>,
  [VisualPreset.DblCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M10 4h4v16h-4V4zM4 7h16v2H4V7zm0 8h16v2H4v-2z"/></svg>,
  [VisualPreset.LDblCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M9 3h6v18H9V3zM3 6h18v2H3V6zm0 10h18v2H3v-2z"/></svg>,
  [VisualPreset.Cube]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><rect x="4" y="4" width="16" height="16" rx="1"/></svg>,
  [VisualPreset.FourCubes]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>,
  [VisualPreset.NineCubes]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={visualIconBase}><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
};

export interface VisualButtonProps {
  preset: VisualPreset;
  selectedPreset: VisualPreset;
  onSelect: (preset: VisualPreset) => void;
}

export const VisualButton: React.FC<VisualButtonProps> = ({ preset, selectedPreset, onSelect }) => (
  <button
    onClick={() => onSelect(preset)}
    className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
      ${selectedPreset === preset ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
  >
    {VISUAL_ICONS[preset]}
    <span className="text-xs font-medium">{preset}</span>
  </button>
);