import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LEGAL_DOCS, LEGAL_SLUGS } from '../../../data/legal';
import { LegalDocument } from '../../../components/LegalDocument';

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = LEGAL_DOCS[params.slug];
  if (!doc) return { title: 'Policy — Vial Foundry' };
  return {
    title: `${doc.title} — Vial Foundry`,
    description: doc.intro.slice(0, 155),
  };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = LEGAL_DOCS[params.slug];
  if (!doc) notFound();
  return <LegalDocument doc={doc} />;
}
