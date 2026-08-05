'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check, Lock, Settings } from 'lucide-react';
import { getCookieConsent, setCookieConsent, setCookie } from '@/lib/authCookie';

export const CookieConsentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Preference Toggles
  const [preferences, setPreferences] = useState({
    essential: true, // Always true & locked
    performance: true,
    functional: true,
    marketing: false,
  });

  useEffect(() => {
    // Show modal automatically if consent has not been saved yet
    const hasConsented = getCookieConsent();
    if (!hasConsented) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for custom event to re-open modal from anywhere (e.g., footer link)
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('open-cookie-modal', handleOpenEvent);
    return () => window.removeEventListener('open-cookie-modal', handleOpenEvent);
  }, []);

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      performance: true,
      functional: true,
      marketing: true,
    });
    setCookieConsent(true);
    setCookie('jlt_cookie_prefs', JSON.stringify({ essential: true, performance: true, functional: true, marketing: true }), { days: 365 });
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent(true);
    setCookie('jlt_cookie_prefs', JSON.stringify(preferences), { days: 365 });
    setIsOpen(false);
  };

  const handleDeclineOptional = () => {
    const minimal = { essential: true, performance: false, functional: false, marketing: false };
    setPreferences(minimal);
    setCookieConsent(false);
    setCookie('jlt_cookie_prefs', JSON.stringify(minimal), { days: 365 });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none font-gilroyRegular animate-fade-in">
      {/* Dark Overlay Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Popup Container */}
      <div className="relative w-full max-w-xl glass-panel animated-box-border bg-[#0E061F]/90 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10 border border-white/10 flex flex-col gap-6 text-white transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl glass-btn flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,162,141,0.4)]">
              <Cookie className="w-6 h-6 text-[#FFA28D]" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-gilroyBold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                Cookie &amp; Privacy Preferences
              </h3>
              <p className="font-gilroyRegular text-xs sm:text-sm text-gray-400">
                Control how cookies &amp; data optimization work for your quest sessions.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            type="button"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Description */}
        <p className="text-gray-300 text-sm leading-relaxed font-gilroyRegular">
          We use essential cookies to maintain your login session, prevent CSRF attacks, and enable hardware 60 FPS graphics acceleration. You can customize optional performance cookies below.
        </p>

        {/* Detailed Preferences Accordion / Toggle List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-gilroyBold text-xs uppercase tracking-wider text-purple-300">
              Cookie Categories
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              type="button"
              className="text-xs font-gilroyMedium text-[#00F0FF] hover:underline flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              {showDetails ? 'Hide Details' : 'Customize Toggles'}
            </button>
          </div>

          {/* Necessary Cookies Item */}
          <div className="glass-pill p-3.5 rounded-2xl flex items-center justify-between border border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-gilroyBold text-sm text-white">Essential &amp; Security</span>
                <span className="text-xs text-gray-400">Required for login, auth session &amp; anti-CSRF</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-gilroyBold flex items-center gap-1">
              <Check className="w-3 h-3" /> Always Active
            </span>
          </div>

          {/* Expandable Preferences list */}
          {showDetails && (
            <div className="flex flex-col gap-2.5 pt-1 animate-fade-in">
              {/* Performance Cookies */}
              <div className="glass-pill p-3.5 rounded-2xl flex items-center justify-between border border-white/10 bg-white/5">
                <div className="flex flex-col">
                  <span className="font-gilroyBold text-sm text-white">Performance &amp; 60 FPS</span>
                  <span className="text-xs text-gray-400">FPS frame metrics &amp; dynamic pre-loading</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.performance}
                  onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                  className="w-5 h-5 accent-[#FFA28D] cursor-pointer rounded"
                />
              </div>

              {/* Functional Cookies */}
              <div className="glass-pill p-3.5 rounded-2xl flex items-center justify-between border border-white/10 bg-white/5">
                <div className="flex flex-col">
                  <span className="font-gilroyBold text-sm text-white">Functional Preferences</span>
                  <span className="text-xs text-gray-400">Saves your mascot preferences &amp; sound toggles</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="w-5 h-5 accent-[#FFA28D] cursor-pointer rounded"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="glass-pill p-3.5 rounded-2xl flex items-center justify-between border border-white/10 bg-white/5">
                <div className="flex flex-col">
                  <span className="font-gilroyBold text-sm text-white">JaxMart Ecosystem Perks</span>
                  <span className="text-xs text-gray-400">Customized quest drops &amp; partner bonuses</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="w-5 h-5 accent-[#FFA28D] cursor-pointer rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handleAcceptAll}
            type="button"
            className="w-full sm:flex-1 glass-btn py-3 px-5 rounded-2xl font-gilroyBold text-white text-sm text-center tracking-wide shadow-lg hover:shadow-[0_0_25px_rgba(255,162,141,0.6)] transition-all hover:scale-[1.02]"
          >
            Accept All Cookies
          </button>

          {showDetails ? (
            <button
              onClick={handleSavePreferences}
              type="button"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 border border-white/20 font-gilroyBold text-white text-sm hover:bg-white/20 transition-all"
            >
              Save Selection
            </button>
          ) : (
            <button
              onClick={handleDeclineOptional}
              type="button"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 border border-white/10 font-gilroyMedium text-gray-400 hover:text-white hover:bg-white/10 text-sm transition-all"
            >
              Essential Only
            </button>
          )}
        </div>

        {/* GDPR Notice Footer */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-gilroyRegular pt-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> GDPR &amp; CCPA Compliant
          </span>
          <span>SSL 256-Bit Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentModal;
