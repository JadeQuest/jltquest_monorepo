'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInvites } from '@/hooks/useInvites';
import { Users, Copy, Check, Gift, ShieldCheck, Sparkles, UserPlus, CheckCircle2, Ticket, Star } from 'lucide-react';
import { JLTLoader } from '@/components/common/JLTLoader';
import { createPortal } from 'react-dom';

export default function InvitesPage() {
  const searchParams = useSearchParams();
  const { invites, isLoading, redeemInvite, isRedeeming, claimMilestone, isClaimingMilestone } = useInvites();
  const [redeemInput, setRedeemInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<{ gpAwarded: number; xpAwarded: number; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'CODES' | 'SQUAD'>('CODES');

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setRedeemInput(refParam);
    }
  }, [searchParams]);

  const inviteData = (invites as any) || {};
  const inviteCode = inviteData.inviteCode || 'LOADING...';
  const totalInvited = inviteData.totalInvited || 0;
  const gpEarned = inviteData.gpEarnedFromInvites || 0;
  const hasRedeemed = !!inviteData.hasRedeemed;
  const milestoneClaims = inviteData.milestoneClaims || [];

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

  const handleClaimMilestone = async (count: number, level: number) => {
    try {
      setStatusMsg(null);
      const res = await claimMilestone({ inviteeCount: count, levelReached: level });
      setPopupData({
        gpAwarded: res.gpAwarded,
        xpAwarded: res.xpAwarded,
        message: `Milestone: ${count} Squad Member(s) reached Level ${level}!`
      });
      setShowPopup(true);
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to claim milestone.',
      });
    }
  };

  const hasClaimed = (count: number, level: number) => {
    return milestoneClaims.some((mc: any) => mc.inviteeCount === count && mc.levelReached === level);
  };

  const inviteesAtLevel = (level: number) => {
    return (inviteData.redemptions || []).filter((r: any) => (r.redeemedByUser?.level || 1) >= level).length;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2 mt-4 sm:mt-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-gilroyBold text-white tracking-tight">
              Invites
            </h1>
          </div>
          <p className="text-gray-400 font-gilroyMedium text-sm sm:text-base max-w-xl">
            Invite your squad and earn 100 GP for every successful referral!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
          <div className="flex flex-col items-center px-4 border-r border-white/10">
            <span className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider mb-1">Total Squad</span>
            <span className="text-xl font-gilroyBold text-white">{totalInvited}</span>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
          <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5 w-max">
            <button
              onClick={() => setActiveTab('CODES')}
              className={`
                group relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300
                ${activeTab === 'CODES' ? 'bg-purple-600/20 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}
              `}
            >
              {activeTab === 'CODES' && (
                <div className="absolute inset-0 rounded-xl border border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]" />
              )}
              <span className={`relative z-10 transition-colors ${activeTab === 'CODES' ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                <Ticket className="w-4 h-4" />
              </span>
              <span className="relative z-10 font-gilroyBold text-sm tracking-wide">
                Invite Codes
              </span>
            </button>

            <button
              onClick={() => setActiveTab('SQUAD')}
              className={`
                group relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300
                ${activeTab === 'SQUAD' ? 'bg-purple-600/20 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}
              `}
            >
              {activeTab === 'SQUAD' && (
                <div className="absolute inset-0 rounded-xl border border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]" />
              )}
              <span className={`relative z-10 transition-colors ${activeTab === 'SQUAD' ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                <Users className="w-4 h-4" />
              </span>
              <span className="relative z-10 font-gilroyBold text-sm tracking-wide">
                Your Squad
              </span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'CODES' ? (
        /* Invite Codes Section */
        <div className="grid grid-cols-12 gap-6 animate-fade-in-up">
          {/* Left Column: My Invite Code & Sharing */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <div className="daily-card-panel p-6 flex flex-col gap-5 border border-white/10 shadow-xl h-full">
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
            </div>
          </div>

          {/* Right Column: Redeem Code Input */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <div className="daily-card-panel p-6 flex flex-col gap-5 border border-white/10 shadow-xl h-full">
              <h2 className="text-white font-gilroyBold text-xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00F0FF]" />
                Redeem Friend's Invite Code
              </h2>
              <p className="text-gray-400 font-gilroyMedium text-sm leading-relaxed">
                Were you invited by a friend? Enter their referral code below to claim your welcome bonus GP instantly!
              </p>

              {hasRedeemed ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-gilroyBold text-base">Referral Bonus Claimed</span>
                    <p className="text-gray-400 font-gilroyMedium text-xs leading-relaxed">
                      You have already redeemed an invite code and received your welcome GP bonus on this account.
                    </p>
                  </div>
                </div>
              ) : (
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
                  <button
                    type="submit"
                    disabled={isRedeeming || !redeemInput.trim()}
                    className={`w-full py-3.5 px-6 rounded-xl font-gilroyBold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${!redeemInput.trim()
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
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Squad & Milestones Section */
        <div className="flex flex-col gap-6 animate-fade-in-up">
          {/* Milestones Panel */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 mt-2">
              <h2 className="text-white font-gilroyBold text-2xl flex items-center gap-2">
                Squad Milestones
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
              {[1, 5, 10].flatMap(count =>
                [6, 11, 16].map(level => {
                  const achieved = inviteesAtLevel(level);
                  const isEligible = achieved >= count;
                  const claimed = hasClaimed(count, level);
                  const gpReward = count * level * 20;
                  const xpReward = count * level * 10;

                  return (
                    <div key={`${count}-${level}`} className="daily-card-panel p-5 flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />

                      <div className="flex-grow flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-white font-gilroyBold text-lg font-bold tracking-tight">
                            Squad Lvl {level} ({count})
                          </h3>
                          <span className={`text-[10px] px-2 py-1 rounded-md ml-2 whitespace-nowrap font-gilroyMedium font-medium border ${claimed ? 'bg-black/40 text-gray-500 border-white/5' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
                            MILESTONE
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 font-gilroyMedium mb-4 leading-relaxed">
                          Have {count} of your invited squad member{count > 1 ? 's' : ''} reach Level {level} to claim this milestone reward.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
                          <div className="flex items-center text-[#FCD34D] font-gilroyBold text-sm font-semibold tracking-wide">
                            <Gift className="w-4 h-4 mr-1 opacity-80" />
                            +{gpReward} GP
                          </div>
                          <div className="flex items-center text-[#A78BFA] font-gilroyBold text-sm font-semibold tracking-wide">
                            <Star className="w-4 h-4 mr-1 opacity-80" />
                            +{xpReward} XP
                          </div>
                        </div>
                        <p className="text-xs font-gilroyMedium mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                          <span className={claimed ? "text-gray-500" : isEligible ? "text-emerald-400 font-gilroyBold" : "text-gray-500"}>
                            Progress
                          </span>
                          <span className={claimed ? "text-gray-500" : isEligible ? "text-emerald-400 font-gilroyBold" : "text-gray-400"}>
                            {achieved} / {count}
                          </span>
                        </p>
                      </div>

                      <div className="mt-5 relative z-10">
                        {claimed ? (
                          <button
                            className="w-full font-gilroyBold text-sm sm:text-base py-2.5 px-4 rounded-xl flex items-center justify-center bg-black/40 text-gray-500 border border-white/5 cursor-not-allowed"
                            disabled
                          >
                            Claimed
                          </button>
                        ) : isEligible ? (
                          <button
                            className="w-full font-gilroyBold text-sm sm:text-base py-2.5 px-4 rounded-xl flex items-center justify-center transition-all duration-300 glass-btn text-white hover:shadow-[0_0_15px_#7B2CBF] cursor-pointer"
                            disabled={isClaimingMilestone}
                            onClick={() => handleClaimMilestone(count, level)}
                          >
                            {isClaimingMilestone ? (
                              <JLTLoader variant="inline" size="sm" text="Claiming..." />
                            ) : (
                              'Claim Reward'
                            )}
                          </button>
                        ) : (
                          <button
                            className="w-full font-gilroyBold text-sm sm:text-base py-2.5 px-4 rounded-xl flex items-center justify-center bg-purple-900/20 text-purple-400/50 border border-purple-500/10 cursor-not-allowed"
                            disabled
                          >
                            Incomplete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Squad List */}
          <div className="daily-card-panel p-6 flex flex-col gap-6 border border-white/10 shadow-xl">
            <h2 className="text-white font-gilroyBold text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Your Invitee List
            </h2>

            {(!inviteData.redemptions || inviteData.redemptions.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-black/30 rounded-2xl border border-white/5">
                <UserPlus className="w-10 h-10 text-gray-500 mb-3" />
                <p className="text-gray-400 font-gilroyMedium text-sm">You haven't invited anyone to your squad yet.</p>
                <p className="text-gray-500 font-gilroyMedium text-xs mt-1">Share your code above to start building your squad!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {inviteData.redemptions.map((redemption: any) => {
                  const userLevel = redemption.redeemedByUser?.level || 1;
                  const displayName = redemption.redeemedByUser?.displayName;
                  const walletAddress = redemption.redeemedByUser?.walletAddress;
                  const fullWallet = walletAddress || 'Unknown Wallet';
                  const avatarUrl = redemption.redeemedByUser?.activeAvatarVariant?.imageUrl;

                  return (
                    <div key={redemption.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName || fullWallet} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-purple-400/50" />
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex flex-col flex-1 min-w-0 overflow-hidden pr-4">
                          {displayName ? (
                            <>
                              <span className="text-white font-gilroyBold text-base truncate" title={displayName}>
                                {displayName}
                              </span>
                              <div
                                className="flex items-center gap-1.5 mt-0.5 text-gray-400 hover:text-purple-300 transition-colors cursor-pointer group w-fit"
                                onClick={() => navigator.clipboard.writeText(walletAddress || '')}
                                title="Copy Wallet Address"
                              >
                                <span className="text-xs font-mono tracking-wide truncate">
                                  {fullWallet}
                                </span>
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                            </>
                          ) : (
                            <div
                              className="flex items-center gap-1.5 text-gray-300 hover:text-purple-300 transition-colors cursor-pointer group w-fit"
                              onClick={() => navigator.clipboard.writeText(walletAddress || '')}
                              title="Copy Wallet Address"
                            >
                              <span className="text-sm font-mono tracking-wide font-gilroyBold truncate">
                                {fullWallet}
                              </span>
                              <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Level Badge */}
                      <div className="shrink-0 flex items-center">
                        <div className="px-4 py-2 rounded-xl bg-black/50 border border-white/10 flex items-center gap-1.5">
                          <span className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">Level</span>
                          <span className="text-base font-gilroyBold text-white">{userLevel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showPopup && popupData && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center relative animate-fade-in shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl">
            <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">Reward Claimed!</h3>
            <p className="text-purple-200 font-gilroyMedium text-sm mb-6">
              {popupData.message}
            </p>
            <div className="flex gap-8 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-[#FCD34D] drop-shadow-[0_0_15px_#F59E0B]">
                  +{popupData.gpAwarded}
                </span>
                <span className="text-sm text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">GP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-[#A78BFA] drop-shadow-[0_0_15px_#7C3AED]">
                  +{popupData.xpAwarded}
                </span>
                <span className="text-sm text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">XP</span>
              </div>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#7B2CBF] hover:shadow-[0_0_25px_#7B2CBF] transition-shadow w-full"
            >
              Awesome
            </button>
          </div>
        </div>,
        document.body
      )}

      {statusMsg && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center relative animate-fade-in shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${statusMsg.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {statusMsg.type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>
            <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">
              {statusMsg.type === 'error' ? 'Oops!' : 'Success!'}
            </h3>
            <p className="text-purple-200 font-gilroyMedium text-sm mb-6">
              {statusMsg.text}
            </p>
            <button
              onClick={() => setStatusMsg(null)}
              className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#7B2CBF] hover:shadow-[0_0_25px_#7B2CBF] transition-shadow w-full"
            >
              Okay
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
