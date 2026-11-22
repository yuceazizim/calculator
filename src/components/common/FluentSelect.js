/**
 * Welding Consumable Calculator (WCC)
 * Common UI Component: FluentSelect
 * Windows 11 Pro Fluent Theme-Aware Select / ComboBox
 * - Mobile (< 640px): Portaled Theme-Aware Fluent Bottom Sheet
 * - Desktop (>= 640px): Portaled In-Place Windows 11 Fluent ComboBox Dropdown
 *   (Escapes backdrop-filter card stacking contexts so dropdowns never clip behind sibling cards)
 * Mobile-First & Pure JavaScript (.js only)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../i18n.js';
import { ChevronDown, Check, X } from 'lucide-react';

export default function FluentSelect({
  value,
  onChange,
  options = [],
  placeholder = '',
  label = '',
  disabled = false,
  className = '',
  align = 'left',
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const desktopDropdownRef = useRef(null);
  const mobileSheetRef = useRef(null);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  const updateDesktopPosition = useCallback(() => {
    if (!triggerRef.current || window.innerWidth < 640) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < 220 && spaceAbove > spaceBelow;

    const nextStyle = {
      position: 'fixed',
      minWidth: `${rect.width}px`,
      maxWidth: 'min(92vw, 26rem)',
      zIndex: 70,
    };

    if (openUpward) {
      nextStyle.bottom = `${Math.max(8, window.innerHeight - rect.top + 4)}px`;
    } else {
      nextStyle.top = `${rect.bottom + 4}px`;
    }

    if (align === 'right') {
      nextStyle.right = `${Math.max(8, window.innerWidth - rect.right)}px`;
    } else {
      nextStyle.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8))}px`;
    }

    setDropdownStyle(nextStyle);
  }, [align]);

  // Position tracking, outside click/touch, Escape key & mobile scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const isMobileViewport = window.innerWidth < 640;
    const prevOverflow = document.body.style.overflow;

    if (isMobileViewport) {
      document.body.style.overflow = 'hidden';
    } else {
      updateDesktopPosition();
    }

    const handleOutside = (e) => {
      const inContainer =
        containerRef.current && containerRef.current.contains(e.target);
      const inDesktopDropdown =
        desktopDropdownRef.current && desktopDropdownRef.current.contains(e.target);
      const inMobileSheet =
        mobileSheetRef.current && mobileSheetRef.current.contains(e.target);

      if (!inContainer && !inDesktopDropdown && !inMobileSheet) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleReposition = () => {
      if (window.innerWidth >= 640) {
        updateDesktopPosition();
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      if (isMobileViewport) {
        document.body.style.overflow = prevOverflow;
      }
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updateDesktopPosition]);

  const handleSelectOption = (opt) => {
    if (opt.disabled) return;
    if (onChange) {
      onChange(opt.value);
    }
    setIsOpen(false);
  };

  const renderOptionsList = () =>
    options.map((opt) => {
      const isSelected = String(opt.value) === String(value);
      return (
        <button
          key={String(opt.value)}
          type="button"
          role="option"
          aria-selected={isSelected}
          disabled={opt.disabled}
          onClick={() => handleSelectOption(opt)}
          className={`relative w-full px-3 py-2.5 sm:py-2 rounded-[6px] text-xs flex items-center justify-between gap-2.5 text-left transition-colors ${
            opt.disabled
              ? 'opacity-45 cursor-not-allowed text-slate-400 dark:text-slate-500'
              : isSelected
                ? 'bg-fluent-accent/[0.09] dark:bg-fluent-accent-dark/[0.15] text-slate-900 dark:text-white font-semibold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
          }`}
        >
          {isSelected && !opt.disabled && (
            <span
              aria-hidden="true"
              className="absolute left-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-fluent-accent dark:bg-fluent-accent-dark"
            />
          )}
          <span className="pl-1.5 leading-snug whitespace-normal break-words">
            {opt.label}
          </span>
          {isSelected && !opt.disabled && (
            <Check className="w-3.5 h-3.5 text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0" />
          )}
        </button>
      );
    });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Fluent Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`fluent-input flex items-center justify-between gap-2 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-fluent-accent ring-2 ring-fluent-accent/25'
            : 'hover:border-fluent-accent/60'
        } ${className}`}
      >
        <span className="truncate text-slate-800 dark:text-slate-100">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-fluent-accent dark:text-fluent-accent-dark' : ''
          }`}
        />
      </button>

      {/* Portaled Dropdown (Desktop) & Bottom Sheet (Mobile) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Desktop (>= 640px): Portaled Windows 11 Fluent ComboBox Dropdown */}
            {dropdownStyle && (
              <div
                ref={desktopDropdownRef}
                role="listbox"
                aria-label={label || placeholder}
                style={dropdownStyle}
                className="
                  hidden sm:flex sm:flex-col max-h-64
                  rounded-fluent-lg bg-white dark:bg-[#262626]
                  border border-black/[0.1] dark:border-white/[0.12]
                  shadow-fluent-flyout overflow-hidden
                "
              >
                <div className="overflow-y-auto p-1 space-y-0.5">
                  {renderOptionsList()}
                </div>
              </div>
            )}

            {/* Mobile (< 640px): Portaled Theme-Aware Fluent Bottom Sheet */}
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] sm:hidden animate-in fade-in duration-150"
              aria-hidden="true"
            />

            <div
              ref={mobileSheetRef}
              role="listbox"
              aria-label={label || placeholder}
              className="
                fixed inset-x-0 bottom-0 z-[70] max-h-[75vh] flex flex-col sm:hidden
                rounded-t-[16px] bg-[#f9f9f9] dark:bg-[#242424]
                border-t border-black/[0.1] dark:border-white/[0.12]
                shadow-fluent-modal overflow-hidden
              "
            >
              {/* Header with Title & Close (X) Button */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/95 dark:bg-[#2c2c2c]/95 border-b border-black/[0.08] dark:border-white/[0.08] flex-shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {label || placeholder}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={t('buttons.close', 'Close')}
                  title={t('buttons.close', 'Close')}
                  className="w-8 h-8 rounded-fluent flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] active:scale-95 transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Options List */}
              <div className="overflow-y-auto p-2 pb-5 space-y-0.5">
                {renderOptionsList()}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}