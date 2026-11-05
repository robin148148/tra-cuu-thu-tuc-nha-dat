export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  copies: string;
  notes: string;
}

export interface TimelineStep {
  step: number;
  phase: string;
  title: string;
  agency: string;
  duration: string;
  description: string;
  warning: string;
}

export interface TaxAndFeesSummary {
  pitRate: string;
  registrationFeeRate: string;
  notaryFee: string;
  appraisalFee: string;
}

export interface Procedure {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  legalBasis: string[];
  processingTime: string;
  authority: string;
  checklist: ChecklistItem[];
  timeline: TimelineStep[];
  taxAndFeesSummary: TaxAndFeesSummary;
}

export interface LegalNewsItem {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName?: string;
  category: string;
  publishedDate: string;
  scrapedAt?: string;
}
