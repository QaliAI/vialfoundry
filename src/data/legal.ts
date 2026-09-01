export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const COMPANY = 'Vial Foundry';
const SITE = 'VialFoundry.com';
const UPDATED = 'August 15, 2026';
const CONTACT_EMAIL = 'support@vialfoundry.com';

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  'ruo-disclaimer': {
    slug: 'ruo-disclaimer',
    title: 'Research Use Only (RUO) Disclaimer',
    updated: UPDATED,
    intro: `All materials offered by ${COMPANY} are supplied exclusively for laboratory research and analytical development. This disclaimer governs the permitted use of every product sold through ${SITE}.`,
    sections: [
      {
        heading: 'Research Use Only',
        body: [
          `Every product sold by ${COMPANY} is intended solely for in-vitro laboratory research, analytical method development, and scientific study by qualified professionals.`,
          'Products are NOT drugs, dietary supplements, cosmetics, food, or medical devices. They are NOT intended to diagnose, treat, cure, or prevent any disease or condition.',
        ],
      },
      {
        heading: 'Not for Human or Animal Use',
        body: [
          'No product may be administered to humans or animals under any circumstance. Products are not for human or veterinary consumption, injection, inhalation, or topical application.',
          'By purchasing, you accept full responsibility for the safe, lawful, and appropriate handling of all materials in a controlled laboratory environment.',
        ],
      },
      {
        heading: 'Buyer Responsibility & Qualification',
        body: [
          'The buyer represents that they are a qualified researcher, institution, or business, are at least 18 years of age, and possess the training and facilities to handle research chemicals safely.',
          'The buyer is solely responsible for compliance with all applicable federal, state, provincial, and local laws and regulations governing the purchase, possession, use, storage, and disposal of research materials in their jurisdiction.',
        ],
      },
      {
        heading: 'No Warranty of Fitness',
        body: [
          `${COMPANY} makes no representation or warranty that any product is suitable for any particular purpose beyond laboratory research. Certificates of Analysis describe analytical characteristics only and are not a warranty of fitness for any applied use.`,
        ],
      },
      {
        heading: 'Assumption of Risk',
        body: [
          `By placing an order, you acknowledge and agree to this RUO Disclaimer in full and release ${COMPANY} from any liability arising from misuse of its products.`,
          `Questions may be directed to ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    updated: UPDATED,
    intro: `These Terms of Service ("Terms") govern your access to and use of ${SITE} and any products or services provided by ${COMPANY} ("we", "us"). By using this site or placing an order, you agree to these Terms.`,
    sections: [
      {
        heading: '1. Eligibility',
        body: [
          'You must be at least 18 years of age and a qualified researcher, institution, or business to use this site or purchase products. You must acknowledge our Research Use Only Disclaimer before ordering.',
        ],
      },
      {
        heading: '2. Products & Intended Use',
        body: [
          'All products are supplied for research use only, as described in our RUO Disclaimer, which is incorporated into these Terms by reference. Product descriptions, sequences, and analytical data are provided for informational purposes.',
        ],
      },
      {
        heading: '3. Orders, Inquiries & Pricing',
        body: [
          'Submitting items through our request/quote flow constitutes an order inquiry, not a completed sale. We reserve the right to accept, decline, or limit any order at our discretion.',
          'Prices are listed in USD and may change without notice. We are not liable for typographic errors in pricing or product data and may cancel affected orders.',
        ],
      },
      {
        heading: '4. Acceptable Use',
        body: [
          'You agree not to use our products or site in violation of any law or our Acceptable Use Policy, and not to resell products for any human, veterinary, or consumption purpose.',
        ],
      },
      {
        heading: '5. Limitation of Liability',
        body: [
          `To the maximum extent permitted by law, ${COMPANY} shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or misuse of its products or site. Our total liability shall not exceed the amount paid for the product giving rise to the claim.`,
        ],
      },
      {
        heading: '6. Indemnification',
        body: [
          `You agree to indemnify and hold harmless ${COMPANY}, its officers, and employees from any claims arising out of your misuse of products, violation of these Terms, or violation of any law.`,
        ],
      },
      {
        heading: '7. Governing Law & Changes',
        body: [
          'These Terms are governed by the laws of the United States and the state in which the company is organized, without regard to conflict-of-law provisions.',
          `We may update these Terms at any time; continued use of the site constitutes acceptance. Contact ${CONTACT_EMAIL} with questions.`,
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    updated: UPDATED,
    intro: `This Privacy Policy explains how ${COMPANY} collects, uses, and protects information you provide through ${SITE}.`,
    sections: [
      {
        heading: 'Information We Collect',
        body: [
          'We collect information you voluntarily provide: name, institution, email, shipping details, and the contents of inquiries or messages you send us.',
          'We automatically collect limited technical data (such as anonymized analytics) to operate and improve the site.',
        ],
      },
      {
        heading: 'How We Use Information',
        body: [
          'To process and respond to order inquiries, provide customer support, send documentation and batch updates you request, and comply with legal obligations.',
          'We do not sell your personal information to third parties.',
        ],
      },
      {
        heading: 'Data Storage & Security',
        body: [
          'Order inquiries and contact data are stored in a secured database with row-level security. We apply reasonable administrative and technical safeguards to protect your data.',
        ],
      },
      {
        heading: 'Email Communications',
        body: [
          'If you subscribe, we send batch availability and documentation updates. You may unsubscribe at any time using the link in our emails or by contacting us.',
        ],
      },
      {
        heading: 'Your Rights',
        body: [
          `You may request access to, correction of, or deletion of your personal data by emailing ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  shipping: {
    slug: 'shipping',
    title: 'Shipping & Cold Storage Policy',
    updated: UPDATED,
    intro: `This policy describes how ${COMPANY} packages, stores, and ships research materials.`,
    sections: [
      {
        heading: 'Handling & Cold Chain',
        body: [
          'Lyophilized research materials are stable at ambient temperature for standard transit windows. Where required, items are shipped with insulated packaging and cold packs to preserve integrity.',
          'Upon receipt, materials should be stored per the storage conditions listed on each product page (typically desiccated at -20°C).',
        ],
      },
      {
        heading: 'Processing Time',
        body: [
          'In-stock order inquiries are typically reviewed and dispatched within 1–2 business days after confirmation. You will receive tracking information once your order ships.',
        ],
      },
      {
        heading: 'Domestic & International',
        body: [
          'We ship to research institutions and businesses. International customers are responsible for import compliance, duties, and any local restrictions on research materials.',
        ],
      },
      {
        heading: 'Lost or Delayed Shipments',
        body: [
          `If your shipment is delayed or damaged in transit, contact ${CONTACT_EMAIL} promptly so we can assist with resolution or replacement.`,
        ],
      },
    ],
  },
  refunds: {
    slug: 'refunds',
    title: 'Returns & Replacement Policy',
    updated: UPDATED,
    intro: `Because research materials are sensitive to handling and storage, ${COMPANY} maintains a documentation-first replacement policy focused on product integrity.`,
    sections: [
      {
        heading: 'Quality Guarantee',
        body: [
          'Where we publish an analytical specification for a lot, that lot is warranted to meet it. If a product does not match a specification we published for it, we will replace it or issue a resolution. Documentation status for any lot can be checked before you order.',
        ],
      },
      {
        heading: 'Damaged or Incorrect Items',
        body: [
          `Report damaged, defective, or incorrect items within 7 days of delivery, with photos and the lot number, to ${CONTACT_EMAIL}. Verified issues are eligible for replacement.`,
        ],
      },
      {
        heading: 'Non-Returnable Items',
        body: [
          'For safety and integrity reasons, opened or reconstituted materials cannot be returned. Returns of unopened items may be considered on a case-by-case basis prior to shipment or before opening.',
        ],
      },
      {
        heading: 'Resolution Process',
        body: [
          'Approved resolutions may take the form of replacement product or a credit, at our discretion, once the issue is verified against batch records.',
        ],
      },
    ],
  },
  'acceptable-use': {
    slug: 'acceptable-use',
    title: 'Acceptable Use Policy',
    updated: UPDATED,
    intro: `This Acceptable Use Policy defines prohibited uses of ${COMPANY} products and ${SITE}.`,
    sections: [
      {
        heading: 'Prohibited Uses',
        body: [
          'You may not purchase, use, or resell any product for human or animal consumption, medical, clinical, veterinary, diagnostic, or therapeutic purposes.',
          'You may not use products in any manner that violates applicable law or regulation, or misrepresent products as approved for any consumption or medical use.',
        ],
      },
      {
        heading: 'Site Conduct',
        body: [
          'You may not attempt to gain unauthorized access to the site, its database, or admin systems, nor use automated systems to scrape or disrupt the service.',
        ],
      },
      {
        heading: 'Enforcement',
        body: [
          `We reserve the right to refuse service, cancel orders, and report unlawful activity. Violations may be reported to ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
};

export const LEGAL_SLUGS = Object.keys(LEGAL_DOCS);
