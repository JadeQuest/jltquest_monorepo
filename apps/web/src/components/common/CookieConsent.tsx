'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check, Lock, Settings } from 'lucide-react';
import { setCookie, hasConsentBeenGiven, saveConsentForIp } from '@/lib/authCookie';

interface CookieConsentModalProps {
  initialOpen?: boolean;
}

export const CookieConsentModal: React.FC<CookieConsentModalProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [showDetails, setShowDetails] = useState(false);

  // Preference Toggles
  const [preferences, setPreferences] = useState({
    essential: true, // Always true & locked
    performance: true,
    functional: true,
    marketing: false,
  });

  useEffect(() => {
    if (initialOpen) {
      setIsOpen(true);
      return;
    }

    // 1. Immediately check if consent has already been saved on this browser
    if (hasConsentBeenGiven()) {
      return;
    }

    // 2. Schedule popup display after first paint without blocking FCP/LCP
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [initialOpen]);

  useEffect(() => {
    // Listen for custom event to re-open modal on-demand (e.g. from footer link)
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('open-cookie-modal', handleOpenEvent);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-cookie-modal', handleOpenEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      performance: true,
      functional: true,
      marketing: true,
    });
    saveConsentForIp(true);
    setCookie('jlt_cookie_prefs', JSON.stringify({ essential: true, performance: true, functional: true, marketing: true }), { days: 365 });
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    saveConsentForIp(true);
    setCookie('jlt_cookie_prefs', JSON.stringify(preferences), { days: 365 });
    setIsOpen(false);
  };

  const handleDeclineOptional = () => {
    const minimal = { essential: true, performance: false, functional: false, marketing: false };
    setPreferences(minimal);
    saveConsentForIp(false);
    setCookie('jlt_cookie_prefs', JSON.stringify(minimal), { days: 365 });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 sm:right-6 z-[99999] w-[90vw] sm:w-[350px] select-none font-gilroyRegular animate-fade-up">
      {/* Compact Bottom-Right Floating Glass Pill Card */}
      <div className="relative w-full glass-panel bg-[#0E061F]/90 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-white/15 flex flex-col gap-3 text-white backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg glass-btn flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,162,141,0.3)]">
              <Cookie className="w-3.5 h-3.5 text-[#FFA28D]" />
            </div>
            <h3 className="font-gilroyBold text-xs sm:text-sm text-white tracking-tight">
              Cookie Consent
            </h3>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            type="button"
            className="w-7 h-7 rounded-md bg-white/5 border border-white/10 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact Description */}
        <p className="text-gray-300 text-[11px] leading-relaxed font-gilroyRegular">
          We use cookies to maintain your login session and enable 120 FPS graphics acceleration.
        </p>

        {/* Detailed Preferences Toggle (Expandable) */}
        {showDetails && (
          <div className="flex flex-col gap-2 pt-1 animate-fade-in text-[11px] border-t border-white/10">
            <div className="glass-pill p-2 rounded-lg flex items-center justify-between border border-white/10 bg-white/5">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-gilroyBold text-[11px] text-white">Essential Cookies</span>
              </div>
              <span className="text-[9px] font-gilroyBold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                Required
              </span>
            </div>

            <div className="glass-pill p-2 rounded-lg flex items-center justify-between border border-white/10 bg-white/5">
              <span className="font-gilroyBold text-[11px] text-white">120 FPS Performance</span>
              <input
                type="checkbox"
                checked={preferences.performance}
                onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                className="w-3.5 h-3.5 accent-[#FFA28D] cursor-pointer rounded"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={handleAcceptAll}
            type="button"
            className="flex-1 glass-btn py-2 px-3 rounded-xl font-gilroyBold text-white text-[11px] text-center tracking-wide shadow-[0_0_15px_rgba(54,12,159,0.5)] flex items-center justify-center gap-1.5 group hover:shadow-[0_0_20px_rgba(255,162,141,0.5)] transition-all duration-300 cursor-pointer"
          >
            <span>Accept All</span>
            <Check className="w-3 h-3 text-[#FFA28D] group-hover:scale-110 transition-transform duration-200" />
          </button>

          {showDetails ? (
            <button
              onClick={handleSavePreferences}
              type="button"
              className="glass-btn px-3 py-2 rounded-xl font-gilroyBold text-white text-[11px] cursor-pointer transition-all duration-300"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleDeclineOptional}
              type="button"
              className="glass-pill px-2.5 py-2 rounded-xl font-gilroyMedium text-gray-300 hover:text-white text-[11px] cursor-pointer transition-all duration-300"
            >
              Essential Only
            </button>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            type="button"
            className="glass-btn p-2 rounded-xl text-gray-300 hover:text-[#00F0FF] transition-all cursor-pointer shadow-sm"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>

        {/* GDPR Notice Footer */}
        <div className="flex items-center justify-between text-[9px] text-gray-500 font-gilroyRegular pt-0.5 border-t border-white/5">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-2.5 h-2.5" /> GDPR Compliant
          </span>
          <span>SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentModal;
