'use client';

import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative w-full py-12 px-6 bg-[#080411] border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center">
          <img src="/jltcolor.svg" alt="JLT Logo" className="w-14 h-14 object-contain" />
        </div>

        {/* Links */}
        <div className="flex items-center gap-8">
          {['Privacy Policy', 'Terms of Use', 'Support'].map((link) => (
            <button
              key={link}
              className="font-gilroyRegular text-gray-500 hover:text-gray-300 text-sm tracking-wide transition-colors duration-200"
            >
              {link}
            </button>
          ))}
        </div>

        {/* Copyright */}
        <p className="font-gilroyRegular text-gray-600 text-sm">
          © 2026 JLTQuest · A JaxMart Partner
        </p>
      </div>
    </footer>
  );
};
