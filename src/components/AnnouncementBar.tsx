'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { FREE_STANDARD_SHIPPING_THRESHOLD_CENTS } from '../lib/manual-orders/shipping.mjs';
import { Tag, Check, Clock } from 'lucide-react';

interface BannerCampaign {
  code: string;
  name?: string;
  message: string;
  cta: string;
  discountRateBps?: number;
  fixedDiscountCents?: number;
  firstOrderOnly?: boolean;
  endsAt?: string | null;
}

export const AnnouncementBar: React.FC = () => {
  const { appliedPromo, applyPromoCode, setIsCartOpen } = useCart();
  const [campaign, setCampaign] = useState<BannerCampaign | null>({
    code: 'FOUNDRY20',
    message: '20% OFF YOUR FIRST ORDER · CODE FOUNDRY20',
    cta: 'APPLY OFFER',
    discountRateBps: 2000,
    firstOrderOnly: true,
    endsAt: null,
  });
  const [applying, setApplying] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Fetch live active campaign from server
  useEffect(() => {
    let mounted = true;
    fetch('/api/promotions')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.success && data.banner) {
          setCampaign(data.banner);
        } else if (data.success && !data.banner) {
          setCampaign(null);
        }
      })
      .catch(() => {
        /* keep default fallback */
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Real countdown timer ONLY if legitimate endsAt timestamp exists
  useEffect(() => {
    if (!campaign?.endsAt) {
      setTimeLeft(null);
      return;
    }

    const target = new Date(campaign.endsAt).getTime();
    if (isNaN(target)) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        // Expired! Remove banner automatically
        setTimeLeft(null);
        setCampaign(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [campaign?.endsAt]);

  const isCurrentPromoApplied = useMemo(() => {
    if (!campaign || !appliedPromo) return false;
    return appliedPromo.code.toUpperCase() === campaign.code.toUpperCase();
  }, [campaign, appliedPromo]);

  const handleApplyOffer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!campaign || isCurrentPromoApplied) {
      setIsCartOpen(true);
      return;
    }
    setApplying(true);
    const res = await applyPromoCode(campaign.code);
    setApplying(false);
    if (res.success) {
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 3000);
    }
  };

  // If no campaign is active or expired, fall back to free standard shipping notice
  if (!campaign) {
    return (
      <div className="bg-brand-ink text-slate-300 text-[10px] sm:text-[11px] font-mono tracking-wider py-1.5 text-center border-b border-brand-graphite/40">
        <span>FREE STANDARD SHIPPING ${FREE_STANDARD_SHIPPING_THRESHOLD_CENTS / 100}+</span>
      </div>
    );
  }

  return (
    <div className="bg-brand-ink text-white text-[11px] font-mono py-1.5 px-3 border-b border-brand-graphite/40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center relative gap-2 sm:gap-4">
        {/* Desktop Message */}
        <div className="hidden sm:flex items-center space-x-2 tracking-wider">
          <Tag className="w-3 h-3 text-brand-teal flex-shrink-0" />
          <span className="font-semibold text-slate-200">{campaign.message}</span>

          {timeLeft && (
            <span className="inline-flex items-center space-x-1 ml-2 text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              <Clock className="w-2.5 h-2.5" />
              <span>
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </span>
          )}
        </div>

        {/* Mobile Message */}
        <div className="sm:hidden flex items-center space-x-1.5 text-[10px] tracking-wide truncate">
          <Tag className="w-2.5 h-2.5 text-brand-teal flex-shrink-0" />
          <span className="font-semibold text-slate-200 truncate">
            FIRST ORDER: 20% OFF · {campaign.code}
          </span>
        </div>

        {/* 1-Click Action Button */}
        <div>
          <button
            onClick={handleApplyOffer}
            disabled={applying}
            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider transition-all duration-150 shadow-2xs ${
              isCurrentPromoApplied || justApplied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-brand-teal hover:bg-brand-teal/90 text-white border border-brand-teal/60 hover:scale-[1.02]'
            }`}
          >
            {isCurrentPromoApplied || justApplied ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-300 stroke-[3]" />
                <span>Applied</span>
              </>
            ) : (
              <span>{applying ? 'Applying...' : campaign.cta || 'Apply Offer'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
