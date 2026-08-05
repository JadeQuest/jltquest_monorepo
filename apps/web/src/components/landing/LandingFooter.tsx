'use client';

import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative w-full py-12 px-6 bg-[#080411] animated-border-t">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center">
          <img src="/jltcolor.svg" alt="JLT Logo" className="w-14 h-14 object-contain" />
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-modal'))}
            type="button"
            className="font-gilroyRegular text-gray-400 hover:text-[#FFA28D] text-sm tracking-wide transition-colors duration-200"
          >
            Cookie &amp; Privacy Preferences
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-modal'))}
            type="button"
            className="font-gilroyRegular text-gray-500 hover:text-gray-300 text-sm tracking-wide transition-colors duration-200"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            className="font-gilroyRegular text-gray-500 hover:text-gray-300 text-sm tracking-wide transition-colors duration-200"
          >
            Terms of Use
          </button>
        </div>

        {/* Copyright */}
        <p className="font-gilroyRegular text-gray-600 text-sm">
          © 2026 JLTQuest · A JaxMart Partner
        </p>
      </div>
    </footer>
  );
};
