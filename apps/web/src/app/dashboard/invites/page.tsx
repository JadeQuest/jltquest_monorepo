'use client';

import React, { useState } from 'react';
import { useInvites } from '@/hooks/useInvites';
import { Users, Copy, Check, Gift, Star, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { JLTLoader } from '@/components/common/JLTLoader';

export default function InvitesPage() {
  const { invites, isLoading, redeemInvite, isRedeeming } = useInvites();
  const [redeemInput, setRedeemInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const inviteData = (invites as any) || {};
  const inviteCode = inviteData.inviteCode || 'LOADING...';
  const totalInvited = inviteData.totalInvited || 0;
  const gpEarned = inviteData.gpEarnedFromInvites || 0;

  const handleCopyCode = () => {
    if (!inviteData.inviteCode) return;
    navigator.clipboard.writeText(inviteData.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!inviteData.inviteCode) return;
    const url = `${window.location.origin}/?ref=${inviteData.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    try {
      setStatusMsg(null);
      const res = await redeemInvite(redeemInput.trim());
      setStatusMsg({
        type: 'success',
        text: `Success! You earned +${res.inviteeGpAwarded || 150} GP for redeeming code ${redeemInput.trim()}`,
      });
      setRedeemInput('');
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to redeem invite code.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto animate-fade-in select-none">
      {/* Top Banner */}
      <div className="daily-card-panel p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-white font-gilroyBold text-2xl sm:text-3xl tracking-tight">Invites & Squads</h1>
              <p className="text-purple-300 font-gilroyMedium text-sm">
                Invite your squad and earn 150 GP + 75 XP for every successful referral!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="flex-1 md:flex-initial p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
            <span className="text-xs text-purple-300 font-gilroyMedium">Total Squad</span>
            <span className="text-2xl font-gilroyBold text-white mt-1">{totalInvited}</span>
          </div>
          <div className="flex-1 md:flex-initial p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
            <span className="text-xs text-purple-300 font-gilroyMedium">Referral GP Earned</span>
            <span className="text-2xl font-gilroyBold text-amber-400 mt-1">+{gpEarned} GP</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: My Invite Code & Sharing */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          <div className="daily-card-panel p-6 flex flex-col gap-5 border border-white/10 shadow-xl">
            <h2 className="text-white font-gilroyBold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Your Personal Invite Code
            </h2>
            <p className="text-gray-400 font-gilroyMedium text-sm leading-relaxed">
              Share your unique code with friends to start earning GP and XP together as soon as they sign up.
            </p>

            {/* Code Box */}
            <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/30 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-purple-300 font-gilroyMedium">Your Referral Code</span>
                <span className="text-xl sm:text-2xl font-gilroyBold text-amber-400 tracking-wider font-mono">
                  {isLoading ? '...' : inviteCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="glass-btn px-4 py-2.5 rounded-xl text-white font-gilroyBold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_#7B2CBF]"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Direct Link Share Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-3.5 px-6 rounded-xl font-gilroyBold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 text-white"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <UserPlus className="w-5 h-5 text-purple-300" />}
              <span>{copiedLink ? 'Referral Link Copied to Clipboard!' : 'Copy Direct Referral Link'}</span>
            </button>
          </div>

          {/* Referral Reward Tiers Info */}
          <div className="daily-card-panel p-6 flex flex-col gap-4 border border-white/10 shadow-xl">
            <h3 className="text-white font-gilroyBold text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Referral Reward Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-1">
                <span className="text-amber-400 font-gilroyBold text-sm">+150 GP & +75 XP</span>
                <span className="text-gray-400 font-gilroyMedium text-xs">Per direct friend who redeems your code</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-1">
                <span className="text-[#00F0FF] font-gilroyBold text-sm">+1,000 GP Bonus</span>
                <span className="text-gray-400 font-gilroyMedium text-xs">Upon reaching 5 successful squad invites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Redeem Code Input */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          <div className="daily-card-panel p-6 flex flex-col gap-5 border border-white/10 shadow-xl">
            <h2 className="text-white font-gilroyBold text-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00F0FF]" />
              Redeem Friend's Invite Code
            </h2>
            <p className="text-gray-400 font-gilroyMedium text-sm leading-relaxed">
              Were you invited by a friend? Enter their referral code below to claim your welcome bonus GP instantly!
            </p>

            <form onSubmit={handleRedeem} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="e.g. JLT_9A8B7C"
                  value={redeemInput}
                  onChange={(e) => setRedeemInput(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-gilroyMedium border ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isRedeeming || !redeemInput.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-gilroyBold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !redeemInput.trim()
                    ? 'bg-black/40 text-gray-500 border border-white/10 cursor-not-allowed'
                    : 'glass-btn text-white shadow-[0_0_20px_#7B2CBF]'
                }`}
              >
                {isRedeeming ? (
                  <JLTLoader variant="inline" size="sm" text="Redeeming Code..." />
                ) : (
                  'Redeem Referral Code'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
