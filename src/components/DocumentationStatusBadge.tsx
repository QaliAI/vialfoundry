import React from 'react';
import { FileCheck, FileClock, FileX } from 'lucide-react';
import type { DocumentationStatus } from '../types';

interface Props {
  status: DocumentationStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const CONFIG: Record<
  DocumentationStatus,
  { label: string; icon: React.ElementType; tone: string }
> = {
  verified: {
    label: 'COA on file',
    icon: FileCheck,
    tone: 'text-brand-mineral border-brand-mineral/30 bg-brand-mineral/[0.06]',
  },
  pending: {
    label: 'COA pending',
    icon: FileClock,
    tone: 'text-brand-graphite border-brand-border bg-brand-canvas',
  },
  none: {
    label: 'No lot record',
    icon: FileX,
    tone: 'text-brand-steel border-brand-border bg-brand-canvas',
  },
};

/**
 * States what documentation actually exists for a lot. This is a factual status,
 * not a trust badge — 'pending' is displayed as plainly as 'on file'.
 */
export const DocumentationStatusBadge: React.FC<Props> = ({ status, size = 'sm', className = '' }) => {
  const { label, icon: Icon, tone } = CONFIG[status];
  const dims = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded border font-sans font-medium whitespace-nowrap ${tone} ${dims} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      {label}
    </span>
  );
};
