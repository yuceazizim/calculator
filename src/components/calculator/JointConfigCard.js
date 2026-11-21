/**
 * Welding Consumable Calculator (WCC)
 * Calculator Component: JointConfigCard
 * Windows 11 Fluent Joint Configuration, Live Cross-Section SVG Visualizer,
 * Custom Theme-Aware Pipe Picker Modal (Mobile Edge-to-Edge) & Batch Joint Quantity Multiplier
 * Supports: Single-V Butt, Double-V (X-Joint), Socket & Fillet Welds for Pipes and Plates
 * Mobile-First: Edge-to-Edge Flush Layout (rounded-none on mobile, rounded on desktop)
 * Standards: ASME B16.25 • ASME B16.11 • AWS D1.1 • EN ISO 9692-1
 * Pure JavaScript (.js only)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../i18n.js';
import {
  Layers,
  Info,
  Hash,
  Eye,
  ChevronDown,
  X,
  Search,
  Check,
} from 'lucide-react';

export default function JointConfigCard({
  jointType,
  setJointType,
  weldGeometry,
  setWeldGeometry,
  jointQuantity = '1',
  setJointQuantity,
  pipes = [],
  joints = [],
  selectedPipeId,
  handlePipeSelect,
  pipeOdMm,
  setPipeOdMm,
  wallThicknessMm,
  setWallThicknessMm,
  weldLengthMm,
  setWeldLengthMm,
  bevelAngleDeg,
  setBevelAngleDeg,
  rootGapMm,
  setRootGapMm,
  rootFaceMm,
  setRootFaceMm,
  capHeightMm,
  setCapHeightMm,
  filletSizeType,
  setFilletSizeType,
  filletSizeMm,
  setFilletSizeMm,
  filletSides,
  setFilletSides,
}) {
  const { t } = useTranslation();

  // Custom Fluent Pipe Picker Modal State
  const [isPipeModalOpen, setIsPipeModalOpen] = useState(false);
  const [pipeSearch, setPipeSearch] = useState('');

  const selectedPipe = useMemo(
    () => pipes.find((p) => p.id === selectedPipeId) || null,
    [pipes, selectedPipeId]
  );

  const filteredPipes = useMemo(() => {
    const q = pipeSearch.trim().toLowerCase();
    if (!q) return pipes;
    return pipes.filter((p) => (
      (p.nps || '').toLowerCase().includes(q) ||
      (p.schedule || '').toLowerCase().includes(q) ||
      String(p.outside_diameter_mm || '').includes(q) ||
      String(p.wall_thickness_mm || '').includes(q) ||
      (p.standard || '').toLowerCase().includes(q)
    ));
  }, [pipes, pipeSearch]);

  // Escape key & body scroll lock when Pipe Picker Modal is open
  useEffect(() => {
    if (!isPipeModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPipeModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPipeModalOpen]);

  const handleSelectPipeFromModal = (pipeId) => {
    handlePipeSelect(pipeId);
    setIsPipeModalOpen(false);
    setPipeSearch('');
  };

  // Apply standard groove preset from catalog
  const handleGroovePresetChange = (jointCode) => {
    if (!jointCode || !Array.isArray(joints)) return;
    const preset = joints.find((j) => j.joint_code === jointCode);
    if (!preset) return;

    if (jointCode === 'double_v_groove') {
      setWeldGeometry('double_v');
    } else {
      setWeldGeometry('butt');
    }

    setBevelAngleDeg(preset.default_bevel_angle_deg.toString());
    setRootGapMm(preset.default_root_gap_mm.toString());
    setRootFaceMm(preset.default_root_face_mm.toString());
    setCapHeightMm(preset.default_cap_height_mm.toString());
  };

  // Render live interactive engineering cross-section SVG
  const renderCrossSectionSvg = () => {
    const tVal = Math.max(3, Math.min(60, parseFloat(wallThicknessMm) || 12));
    const gVal = Math.max(0, Math.min(10, parseFloat(rootGapMm) || 2.5));
    const fVal = Math.max(0, Math.min(tVal * 0.6, parseFloat(rootFaceMm) || 1.6));
    const thetaVal = Math.max(0, Math.min(60, parseFloat(bevelAngleDeg) || 37.5));
    const cVal = Math.max(0, Math.min(8, parseFloat(capHeightMm) || 1.5));

    const cx = 180;
    const yTop = 36;
    const yBot = 112;
    const wallH = yBot - yTop; // 76px normalized wall thickness
    const scale = wallH / tVal;

    const gPx = Math.max(5, Math.min(28, gVal * scale * 0.95));
    const angleRad = (thetaVal * Math.PI) / 180.0;
    const cPx = Math.max(4, Math.min(16, cVal * scale * 1.1));

    if (weldGeometry === 'fillet') {
      const isDouble = filletSides === 'double';
      const legPx = Math.max(24, Math.min(54, (parseFloat(filletSizeMm) || 6) * 4.5));
      const yPlateTop = 104;
      const webHalfW = 14;

      return (
        <svg viewBox="0 0 360 150" className="w-full h-36 sm:h-40 select-none">
          <defs>
            <linearGradient id="weldFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0067c0" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* Horizontal Base Plate */}
          <rect
            x="45"
            y={yPlateTop}
            width="270"
            height="24"
            rx="2"
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400"
            strokeWidth="1.4"
          />

          {/* Vertical Web Plate */}
          <rect
            x={cx - webHalfW}
            y="24"
            width={webHalfW * 2}
            height={yPlateTop - 24}
            rx="2"
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400"
            strokeWidth="1.4"
          />

          {/* Right Side Fillet Weld */}
          <path
            d={`M ${cx + webHalfW},${yPlateTop} L ${cx + webHalfW},${yPlateTop - legPx} Q ${cx + webHalfW + legPx * 0.6},${yPlateTop - legPx * 0.6} ${cx + webHalfW + legPx},${yPlateTop} Z`}
            fill="url(#weldFillGrad)"
            stroke="#0054a6"
            strokeWidth="1.4"
          />

          {/* Left Side Fillet Weld (if Double) */}
          {isDouble && (
            <path
              d={`M ${cx - webHalfW},${yPlateTop} L ${cx - webHalfW},${yPlateTop - legPx} Q ${cx - webHalfW - legPx * 0.6},${yPlateTop - legPx * 0.6} ${cx - webHalfW - legPx},${yPlateTop} Z`}
              fill="url(#weldFillGrad)"
              stroke="#0054a6"
              strokeWidth="1.4"
            />
          )}

          {/* Throat / Leg Annotation */}
          <line
            x1={cx + webHalfW}
            y1={yPlateTop}
            x2={cx + webHalfW + legPx * 0.55}
            y2={yPlateTop - legPx * 0.45}
            stroke="#f59e0b"
            strokeWidth="1.6"
            strokeDasharray="3 2"
          />
          <text
            x={cx + webHalfW + legPx + 8}
            y={yPlateTop - legPx * 0.4}
            className="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold"
          >
            {filletSizeType === 'throat' ? `a = ${filletSizeMm || 6} mm` : `z = ${filletSizeMm || 6} mm`}
          </text>
          <text
            x={cx + webHalfW + legPx + 8}
            y={yPlateTop - legPx * 0.4 + 13}
            className="fill-slate-500 dark:fill-slate-400 text-[9px] font-semibold"
          >
            {isDouble ? '2x Fillet' : '1x Fillet'}
          </text>
        </svg>
      );
    }

    if (weldGeometry === 'socket') {
      const cxLeg = Math.max(3.2, 1.09 * tVal).toFixed(1);
      return (
        <svg viewBox="0 0 360 150" className="w-full h-36 sm:h-40 select-none">
          <defs>
            <linearGradient id="weldFillGradSocket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0067c0" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* Fitting Socket Hub (Left + Bottom Step) */}
          <path
            d="M 48,44 L 188,44 L 188,78 L 210,78 L 210,118 L 48,118 Z"
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400"
            strokeWidth="1.4"
          />

          {/* Inserted Pipe Wall (with 1.6mm expansion gap) */}
          <rect
            x="196"
            y="80"
            width="116"
            height="38"
            rx="1"
            className="fill-slate-200 dark:fill-slate-600 stroke-slate-500 dark:stroke-slate-400"
            strokeWidth="1.4"
          />

          {/* Socket Fillet Weld Bead */}
          <path
            d="M 188,80 L 188,44 Q 214,56 232,80 Z"
            fill="url(#weldFillGradSocket)"
            stroke="#0054a6"
            strokeWidth="1.4"
          />

          {/* Annotations */}
          <text x="198" y="48" className="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold">
            Cx = {cxLeg} mm (1.09×t)
          </text>
          <text x="200" y="62" className="fill-slate-500 dark:fill-slate-400 text-[9px] font-semibold">
            1.6 mm Expansion Gap
          </text>
          <text x="246" y="103" className="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold">
            t = {tVal} mm
          </text>
        </svg>
      );
    }

    if (weldGeometry === 'double_v') {
      const yMid = (yTop + yBot) / 2;
      const fPx = Math.max(4, Math.min(wallH * 0.34, fVal * scale));
      const halfBevelH = (wallH - fPx) / 2;
      const bevelRunPx = Math.min(54, Math.max(10, halfBevelH * Math.tan(angleRad)));

      const xLOuter = 44;
      const xROuter = 316;
      const xLGap = cx - gPx / 2;
      const xRGap = cx + gPx / 2;
      const xLTop = xLGap - bevelRunPx;
      const xRTop = xRGap + bevelRunPx;

      return (
        <svg viewBox="0 0 360 150" className="w-full h-36 sm:h-40 select-none">
          <defs>
            <linearGradient id="weldFillGradX" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0067c0" stopOpacity="0.90" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#0067c0" stopOpacity="0.90" />
            </linearGradient>
          </defs>

          {/* Left Base Metal (Double-V Bevel) */}
          <path
            d={`M ${xLOuter},${yTop} L ${xLTop},${yTop} L ${xLGap},${yMid - fPx / 2} L ${xLGap},${yMid + fPx / 2} L ${xLTop},${yBot} L ${xLOuter},${yBot} Z`}
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400"
            strokeWidth="1.4"
          />

          {/* Right Base Metal (Double-V Bevel) */}
          <path
            d={`M ${xROuter},${yTop} L ${xRTop},${yTop} L ${xRGap},${yMid - fPx / 2} L ${xRGap},${yMid + fPx / 2} L ${xRTop},${yBot} L ${xROuter},${yBot} Z`}
            className="fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400"
            strokeWidth="1.4"
          />

          {/* Weld Metal Fill + Both Caps */}
          <path
            d={`M ${xLTop - 5},${yTop} Q ${cx},${yTop - cPx * 1.9} ${xRTop + 5},${yTop} L ${xRTop},${yTop} L ${xRGap},${yMid - fPx / 2} L ${xRGap},${yMid + fPx / 2} L ${xRTop},${yBot} L ${xRTop + 5},${yBot} Q ${cx},${yBot + cPx * 1.9} ${xLTop - 5},${yBot} L ${xLTop},${yBot} L ${xLGap},${yMid + fPx / 2} L ${xLGap},${yMid - fPx / 2} L ${xLTop},${yTop} Z`}
            fill="url(#weldFillGradX)"
            stroke="#0054a6"
            strokeWidth="1.2"
          />

          {/* Dimension Labels */}
          <text x="52" y={yMid + 3} className="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold">
            t = {tVal} mm
          </text>
          <text x={cx} y="16" textAnchor="middle" className="fill-fluent-accent dark:fill-fluent-accent-dark text-[10px] font-bold">
            2θ = {(thetaVal * 2).toFixed(1)}° • c = {cVal} mm (2 Sides)
          </text>
          <text x={cx} y="142" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[9.5px] font-semibold">
            g = {gVal} mm • f = {fVal} mm • X-Joint
          </text>
        </svg>
      );
    }

    // Default: Single-V Butt Weld
    const fPx = Math.max(4, Math.min(wallH * 0.45, fVal * scale));
    const bevelRunPx = Math.min(68, Math.max(10, (wallH - fPx) * Math.tan(angleRad)));
    const xLOuter = 44;
    const xROuter = 316;
    const xLGap = cx - gPx / 2;
    const xRGap = cx + gPx / 2;
    const xLTop = xLGap - bevelRunPx;
    const xRTop = xRGap + bevelRunPx;
    const yLandTop = yBot - fPx;

    return (
      <svg viewBox="0 0 360 150" className="w-full h-36 sm:h-40 select-none">
        <defs>
          <linearGradient id="weldFillGradV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0067c0" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.68" />
          </linearGradient>
        </defs>

        {/* Left Base Metal */}
        <path
          d={`M ${xLOuter},${yTop} L ${xLTop},${yTop} L ${xLGap},${yLandTop} L ${xLGap},${yBot} L ${xLOuter},${yBot} Z`}
          className="fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400"
          strokeWidth="1.4"
        />

        {/* Right Base Metal */}
        <path
          d={`M ${xROuter},${yTop} L ${xRTop},${yTop} L ${xRGap},${yLandTop} L ${xRGap},${yBot} L ${xROuter},${yBot} Z`}
          className="fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400"
          strokeWidth="1.4"
        />

        {/* Weld Metal Fill + Top Cap + Root Penetration */}
        <path
          d={`M ${xLTop - 5},${yTop} Q ${cx},${yTop - cPx * 1.9} ${xRTop + 5},${yTop} L ${xRTop},${yTop} L ${xRGap},${yLandTop} L ${xRGap},${yBot} Q ${cx},${yBot + 9} ${xLGap},${yBot} L ${xLGap},${yLandTop} L ${xLTop},${yTop} Z`}
          fill="url(#weldFillGradV)"
          stroke="#0054a6"
          strokeWidth="1.2"
        />

        {/* Dimension Labels */}
        <text x="52" y={(yTop + yBot) / 2 + 3} className="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold">
          t = {tVal} mm
        </text>
        <text x={cx} y="16" textAnchor="middle" className="fill-fluent-accent dark:fill-fluent-accent-dark text-[10px] font-bold">
          2θ = {(thetaVal * 2).toFixed(1)}° • c = {cVal} mm
        </text>
        <text x={cx} y="142" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[9.5px] font-semibold">
          g = {gVal} mm • f = {fVal} mm
        </text>
      </svg>
    );
  };

  return (
    <>
      <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-6 transition-all duration-200">
        
        {/* 1. Card Header */}
        <div className="flex items-center gap-2.5 mb-3 sm:mb-4 border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5 sm:pb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/20 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {t('joint.title', 'Joint Configuration & Geometry')}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              {t('joint.subtitle', 'Select joint type and dimensional specifications')}
            </p>
          </div>
        </div>

        {/* 2. Primary Workpiece Selector: Pipe vs Plate */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setJointType('pipe');
              if (!['butt', 'double_v', 'socket', 'fillet'].includes(weldGeometry)) {
                setWeldGeometry('butt');
              }
            }}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-fluent border transition-all ${
              jointType === 'pipe'
                ? 'bg-fluent-accent text-white border-fluent-accent shadow-sm'
                : 'bg-white/60 dark:bg-[#333]/60 text-slate-700 dark:text-slate-300 border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            }`}
          >
            {t('joint.type_pipe', 'Pipe Butt Joint (Circumferential)')}
          </button>
          <button
            type="button"
            onClick={() => {
              setJointType('plate');
              if (weldGeometry === 'socket') setWeldGeometry('butt');
            }}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-fluent border transition-all ${
              jointType === 'plate'
                ? 'bg-fluent-accent text-white border-fluent-accent shadow-sm'
                : 'bg-white/60 dark:bg-[#333]/60 text-slate-700 dark:text-slate-300 border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            }`}
          >
            {t('joint.type_plate', 'Plate Butt Joint (Linear)')}
          </button>
        </div>

        {/* 3. Weld Geometry Segmented Control */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('joint.groove_type', 'Weld Joint Geometry')}
          </label>
          
          {jointType === 'pipe' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-fluent bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
              <button
                type="button"
                onClick={() => setWeldGeometry('butt')}
                className={`py-1.5 px-1.5 text-[11px] sm:text-xs font-semibold rounded-fluent transition-all text-center truncate ${
                  weldGeometry === 'butt'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('joint.geom_butt', 'Butt Weld (V)')}
              </button>
              <button
                type="button"
                onClick={() => setWeldGeometry('double_v')}
                className={`py-1.5 px-1.5 text-[11px] sm:text-xs font-semibold rounded-fluent transition-all text-center truncate ${
                  weldGeometry === 'double_v'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('joint.geom_double_v', 'Double-V (X)')}
              </button>
              <button
                type="button"
                onClick={() => setWeldGeometry('socket')}
                className={`py-1.5 px-1.5 text-[11px] sm:text-xs font-semibold rounded-fluent transition-all text-center truncate ${
                  weldGeometry === 'socket'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('joint.geom_socket', 'Socket Weld')}
              </button>
              <button
                type="button"
                onClick={() => setWeldGeometry('fillet')}
                className={`py-1.5 px-1.5 text-[11px] sm:text-xs font-semibold rounded-fluent transition-all text-center truncate ${
                  weldGeometry === 'fillet'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('joint.geom_fillet', 'Slip-On Fillet')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 p-1 rounded-fluent bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
              <button
                type="button"
                onClick={() => setWeldGeometry('butt')}
                className={`py-1.5 px-1.5 text-[11px] sm:text-xs font-semibold rounded-fluent transition-all text-center truncate ${
                  weldGeometry === 'butt'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('joint.geom_plate_butt', 'Single-V Butt')}
              </button>
              <button
                type="button"
                onClick={() => setWeldGeometry('double_v')}
                className={`py-1.5 px-1.5 text-[11px] sm:text-xs font-semibold rounded-fluent transition-all text-center truncate ${
                  weldGeometry === 'double_v'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('joint.geom_double_v', 'Double-V (X)')}
              </button>
              <button
                type="button"
                onClick={() => setWeldGeometry('fillet')}
                className={`py-1.5 px-1.5 text-[11px] sm:text-xs font-semibold rounded-fluent transition-all text-center truncate ${
                  weldGeometry === 'fillet'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('joint.geom_plate_fillet', 'Fillet T-Joint')}
              </button>
            </div>
          )}
        </div>

        {/* 3B. Live Dynamic Cross-Section SVG Visualizer */}
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-fluent bg-slate-50/90 dark:bg-[#1f1f1f]/80 border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <Eye className="w-3.5 h-3.5 text-fluent-accent flex-shrink-0" />
              <span>{t('joint.preview_title', 'Live Cross-Section Schematic')}</span>
            </div>
            {weldGeometry === 'double_v' && (
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 truncate">
                {t('joint.double_v_badge', 'X-Joint (~40-50% less filler)')}
              </span>
            )}
          </div>
          {renderCrossSectionSvg()}
        </div>

        {/* 4. Primary Dimensions */}
        {jointType === 'pipe' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('joint.pipe_select', 'Standard Pipe (ASME B36.10M)')}
              </label>
              <button
                type="button"
                onClick={() => setIsPipeModalOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isPipeModalOpen}
                className="fluent-input flex items-center justify-between gap-2 text-xs font-medium text-left cursor-pointer hover:border-fluent-accent/60 active:scale-[0.99]"
              >
                <span className="truncate text-slate-800 dark:text-slate-100">
                  {selectedPipe
                    ? `${selectedPipe.nps} (${selectedPipe.schedule}) - ${selectedPipe.outside_diameter_mm} ${t('units.mm', 'mm')}`
                    : t('joint.pipe_custom', 'Custom Dimensions')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('joint.outside_diameter', 'Outside Diameter (OD)')} ({t('units.mm', 'mm')})
              </label>
              <input
                type="number"
                step="0.01"
                value={pipeOdMm}
                onChange={(e) => setPipeOdMm(e.target.value)}
                className="fluent-input text-xs"
                placeholder="e.g. 60.33"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('joint.wall_thickness', 'Wall Thickness (t)')} ({t('units.mm', 'mm')})
              </label>
              <input
                type="number"
                step="0.01"
                value={wallThicknessMm}
                onChange={(e) => setWallThicknessMm(e.target.value)}
                className="fluent-input text-xs"
                placeholder="e.g. 3.91"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('joint.weld_length', 'Seam Length (L)')} ({t('units.mm', 'mm')})
              </label>
              <input
                type="number"
                step="1"
                value={weldLengthMm}
                onChange={(e) => setWeldLengthMm(e.target.value)}
                className="fluent-input text-xs"
                placeholder="e.g. 1000"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('joint.wall_thickness', 'Wall Thickness (t)')} ({t('units.mm', 'mm')})
              </label>
              <input
                type="number"
                step="0.01"
                value={wallThicknessMm}
                onChange={(e) => setWallThicknessMm(e.target.value)}
                className="fluent-input text-xs"
                placeholder="e.g. 16.00"
              />
            </div>
          </div>
        )}

        {/* 5. V-GROOVE & DOUBLE-V BUTT WELD DETAILS */}
        {(weldGeometry === 'butt' || weldGeometry === 'double_v') && (
          <div className="pt-2.5 sm:pt-3 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2.5">
            {Array.isArray(joints) && joints.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('joint.preset_label', 'Standard Groove Preset')}
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => handleGroovePresetChange(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="">{t('joint.preset_custom', '-- Custom Groove Angles --')}</option>
                  {joints.map((j) => (
                    <option key={j.id || j.joint_code} value={j.joint_code}>
                      {j.joint_name} (θ={j.default_bevel_angle_deg}°, g={j.default_root_gap_mm}mm, f={j.default_root_face_mm}mm)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 truncate">
                  {t('joint.bevel_angle', 'Bevel Angle (θ)')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={bevelAngleDeg}
                  onChange={(e) => setBevelAngleDeg(e.target.value)}
                  className="fluent-input text-xs"
                  placeholder="37.5"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 truncate">
                  {t('joint.root_gap', 'Root Gap (g)')} ({t('units.mm', 'mm')})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rootGapMm}
                  onChange={(e) => setRootGapMm(e.target.value)}
                  className="fluent-input text-xs"
                  placeholder="3.0"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 truncate">
                  {t('joint.root_face', 'Root Face (f)')} ({t('units.mm', 'mm')})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rootFaceMm}
                  onChange={(e) => setRootFaceMm(e.target.value)}
                  className="fluent-input text-xs"
                  placeholder="1.5"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 truncate">
                  {t('joint.cap_height', 'Cap Height (c)')} ({t('units.mm', 'mm')})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={capHeightMm}
                  onChange={(e) => setCapHeightMm(e.target.value)}
                  className="fluent-input text-xs"
                  placeholder="1.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. FILLET WELD DETAILS */}
        {weldGeometry === 'fillet' && (
          <div className="p-3 sm:p-3.5 rounded-fluent bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] pt-2.5 sm:pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('joint.fillet_basis', 'Dimension Basis')}
                </label>
                <select
                  value={filletSizeType}
                  onChange={(e) => setFilletSizeType(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="throat">{t('joint.fillet_throat_opt', 'Throat Thickness (a)')}</option>
                  <option value="leg">{t('joint.fillet_leg_opt', 'Leg Length (z / w)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {filletSizeType === 'throat'
                    ? t('joint.fillet_throat_label', 'Throat (a) Size')
                    : t('joint.fillet_leg_label', 'Leg (z) Size')}{' '}
                  ({t('units.mm', 'mm')})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={filletSizeMm}
                  onChange={(e) => setFilletSizeMm(e.target.value)}
                  className="fluent-input text-xs font-bold text-fluent-accent"
                  placeholder="e.g. 6.0"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('joint.fillet_sides', 'Fillet Sides')}
                </label>
                <select
                  value={filletSides}
                  onChange={(e) => setFilletSides(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="single">{t('joint.fillet_single', 'Single Fillet')}</option>
                  <option value="double">{t('joint.fillet_double', 'Double Fillet (T Joint)')}</option>
                </select>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {t('joint.fillet_note', 'Calculated per AWS D1.1 / EN 1090 with nominal 10% convexity reinforcement.')}
            </p>
          </div>
        )}

        {/* 7. SOCKET WELD DETAILS */}
        {weldGeometry === 'socket' && (
          <div className="p-3 sm:p-3.5 rounded-fluent bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 flex items-start gap-2 sm:gap-2.5">
            <Info className="w-4 h-4 text-fluent-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-300 space-y-1">
              <span className="font-bold">
                {t('joint.socket_title', 'ASME B16.11 & ASME B31.3 Socket Weld Mode:')}
              </span>
              <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed">
                {t('joint.socket_desc', 'Minimum socket leg length is calculated as Cx = 1.09 × t along the fitting hub circumference with 15% reinforcement crown.')}{' '}
                (Cx = {Math.max(3.2, 1.09 * parseFloat(wallThicknessMm || 0)).toFixed(2)} mm)
              </p>
            </div>
          </div>
        )}

        {/* 8. BATCH / PROJECT JOINT QUANTITY MULTIPLIER */}
        {setJointQuantity && (
          <div className="mt-3 sm:mt-4 p-3 rounded-fluent bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <Hash className="w-4 h-4 text-fluent-accent flex-shrink-0 mt-0.5" />
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  {t('joint.quantity_label', 'Joint Quantity (Project / Spool Count)')}
                </label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t('joint.quantity_hint', 'Calculate procurement totals for multiple identical welds (e.g. 500, 5,000, 15,000)')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 50, 500, 1000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setJointQuantity(preset.toString())}
                  className={`px-2 py-1 rounded text-[11px] font-bold border transition-all ${
                    parseInt(jointQuantity, 10) === preset
                      ? 'bg-fluent-accent text-white border-fluent-accent shadow-sm'
                      : 'bg-white/80 dark:bg-[#333] text-slate-600 dark:text-slate-300 border-black/[0.08] dark:border-white/[0.08] hover:border-fluent-accent/50'
                  }`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}

              <input
                type="number"
                min="1"
                max="1000000"
                value={jointQuantity}
                onChange={(e) => setJointQuantity(e.target.value)}
                className="fluent-input text-xs font-extrabold text-center text-fluent-accent dark:text-fluent-accent-dark w-24 py-1"
                placeholder="1"
              />
            </div>
          </div>
        )}

      </div>

      {/* Windows 11 Pro Fluent Full-Screen Edge-to-Edge (Mobile) / ContentDialog (Desktop) Pipe Picker Modal */}
      {isPipeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wcc-pipe-modal-title"
          onClick={() => setIsPipeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full sm:h-[min(82vh,640px)] sm:max-w-lg flex flex-col bg-[#f9f9f9] dark:bg-[#202020] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-fluent-lg border-0 sm:border sm:border-black/[0.1] sm:dark:border-white/[0.12] shadow-fluent-modal overflow-hidden"
          >
            {/* Modal Header with Top-Right Windows 11 Fluent Close Button */}
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white/90 dark:bg-[#2b2b2b]/90 border-b border-black/[0.08] dark:border-white/[0.08] flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3
                  id="wcc-pipe-modal-title"
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate"
                >
                  {t('joint.pipe_select', 'Standard Pipe (ASME B36.10M)')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fluent-accent/10 text-fluent-accent dark:bg-fluent-accent-dark/15 dark:text-fluent-accent-dark flex-shrink-0">
                  {filteredPipes.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPipeModalOpen(false)}
                aria-label={t('buttons.close', 'Close')}
                title={t('buttons.close', 'Close')}
                className="w-9 h-9 rounded-fluent flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] active:scale-95 transition-all flex-shrink-0"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Live Search Bar */}
            <div className="px-4 py-2.5 bg-white/60 dark:bg-[#252525]/80 border-b border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={pipeSearch}
                  onChange={(e) => setPipeSearch(e.target.value)}
                  placeholder={t('catalog.search_placeholder', 'Search NPS, Schedule, OD...')}
                  className="fluent-input pl-9 pr-9 py-2 text-xs sm:text-sm"
                />
                {pipeSearch && (
                  <button
                    type="button"
                    onClick={() => setPipeSearch('')}
                    aria-label={t('buttons.close', 'Close')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Options List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
              {/* Custom Dimensions Option (shown when search is empty or matches) */}
              {(!pipeSearch.trim() ||
                t('joint.pipe_custom', 'Custom Dimensions')
                  .toLowerCase()
                  .includes(pipeSearch.trim().toLowerCase())) && (
                <button
                  type="button"
                  onClick={() => handleSelectPipeFromModal('')}
                  className={`relative w-full px-3.5 py-3 rounded-fluent flex items-center justify-between gap-3 text-left transition-all ${
                    !selectedPipeId
                      ? 'bg-white dark:bg-[#323232] shadow-sm border border-black/[0.08] dark:border-white/[0.1]'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {!selectedPipeId && (
                    <span
                      aria-hidden="true"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-fluent-accent dark:bg-fluent-accent-dark"
                    />
                  )}
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white pl-1.5">
                    {t('joint.pipe_custom', 'Custom Dimensions')}
                  </span>
                  {!selectedPipeId && (
                    <Check className="w-4 h-4 text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0" />
                  )}
                </button>
              )}

              {/* Standard ASME Pipes */}
              {filteredPipes.length === 0 ? (
                <div className="py-12 px-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t('catalog.empty_search', 'No pipe dimensions matched your search.')}
                </div>
              ) : (
                filteredPipes.map((pipe) => {
                  const isSelected = pipe.id === selectedPipeId;
                  return (
                    <button
                      key={pipe.id}
                      type="button"
                      onClick={() => handleSelectPipeFromModal(pipe.id)}
                      className={`relative w-full px-3.5 py-2.5 sm:py-3 rounded-fluent flex items-center justify-between gap-3 text-left transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-[#323232] shadow-sm border border-black/[0.08] dark:border-white/[0.1]'
                          : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-transparent'
                      }`}
                    >
                      {isSelected && (
                        <span
                          aria-hidden="true"
                          className="absolute left-1 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-fluent-accent dark:bg-fluent-accent-dark"
                        />
                      )}

                      <div className="min-w-0 pl-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {pipe.nps}
                          </span>
                          <span className="text-xs font-semibold text-fluent-accent dark:text-fluent-accent-dark">
                            ({pipe.schedule})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          OD {pipe.outside_diameter_mm} {t('units.mm', 'mm')} • t = {pipe.wall_thickness_mm} {t('units.mm', 'mm')} • {pipe.standard}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}