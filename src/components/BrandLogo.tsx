import React from 'react';

/**
 * The single canonical Vial Foundry brand implementation.
 *
 * Every surface - navbar, footer, age gate, checkout, admin, email, favicon -
 * renders the identity through this component or through the approved files in
 * /public/brand. Never re-create the wordmark with a browser font and never
 * draw the monogram by hand anywhere else in the app.
 *
 * Lockups are served as the approved SVG artwork so the wordmark is always the
 * real outlines. The monogram is inlined below because it is the one variant
 * that has to inherit `currentColor` (buttons, badges, dark sections).
 */

/** Approved VF monogram, authored in a 1000 x 841 box (157:132 aspect). */
const MARK_V =
  'M5 0L257 0L232 37.8L409 475.9L409 819.8L405 829L83 84.1Q56 42 5 0Z';
const MARK_F =
  'M680 0L1000 0L942 121.9L648 121.9L600 161.4L570 227L886 227' +
  'L828 349.8L672 350.6L660 369.9L660 724.7' +
  'C660 769.3 618 840.8 556 840.8C496 840.8 452 812.2 452 733.2' +
  'L452 417L527 417L527 438.9L481 475.9L481 728.1' +
  'A47 39.5 0 0 0 575 728.1' +
  'L575 458.2C576 424.6 589 401.9 600 393.5L600 380.1' +
  'C599 371.6 597 367.4 594 366.6L458 363.2L630 21Z';

export const MARK_ASPECT = 1000 / 841;

export type BrandLogoVariant = 'horizontal' | 'stacked' | 'mark';
export type BrandLogoTone = 'midnight' | 'white' | 'black';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** Rendered height in pixels. Width follows the lockup's own ratio. */
  height?: number;
  tone?: BrandLogoTone;
  className?: string;
  /** Decorative instances (next to a visible wordmark) should pass true. */
  decorative?: boolean;
}

const LOCKUPS: Record<
  Exclude<BrandLogoVariant, 'mark'>,
  Record<BrandLogoTone, { src: string; ratio: number }>
> = {
  horizontal: {
    midnight: { src: '/brand/logo-horizontal.svg', ratio: 676.19 / 100 },
    white: { src: '/brand/logo-white.svg', ratio: 676.19 / 100 },
    black: { src: '/brand/logo-black.svg', ratio: 676.19 / 100 },
  },
  stacked: {
    midnight: { src: '/brand/logo-stacked.svg', ratio: 537.6 / 222 },
    white: { src: '/brand/logo-stacked-white.svg', ratio: 537.6 / 222 },
    black: { src: '/brand/logo-black.svg', ratio: 676.19 / 100 },
  },
};

const ALT = 'Vial Foundry — Research Peptides';

/** The monogram on its own, inheriting the current text colour. */
export const BrandMark: React.FC<{ className?: string; title?: string }> = ({
  className = '',
  title,
}) => (
  <svg
    viewBox="0 0 1000 841"
    className={className}
    fill="currentColor"
    role={title ? 'img' : 'presentation'}
    aria-hidden={title ? undefined : true}
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d={MARK_V} />
    <path d={MARK_F} />
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  height = 34,
  tone = 'midnight',
  className = '',
  decorative = false,
}) => {
  if (variant === 'mark') {
    return (
      <BrandMark
        className={className}
        title={decorative ? undefined : ALT}
      />
    );
  }

  const { src, ratio } = LOCKUPS[variant][tone];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={decorative ? '' : ALT}
      aria-hidden={decorative || undefined}
      width={Math.round(height * ratio)}
      height={height}
      style={{ height, width: 'auto' }}
      className={className}
      draggable={false}
    />
  );
};

export default BrandLogo;
