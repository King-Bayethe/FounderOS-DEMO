/**
 * Demo-mode money: sample month-to-date income per processor, a Stripe-style
 * balance, recent charges and 12 months of income per business. All figures
 * are fictional and shown with a "demo" label; a connected processor always
 * reports its real numbers instead.
 */
import type { BusinessSeries } from '@/lib/bank-statements';

/** Month-to-date income in USD per income-account id (see lib/finances). */
export const DEMO_INCOME_MTD: Record<string, number> = {
  stripe: 14_350,
  paypal: 1_180,
  'fanbasis-vantage': 9_500,
  'fanbasis-lc': 6_240,
  'wise-1': 2_400,
  'wise-2': 640,
};

export const DEMO_STRIPE = { available: 4_212.4, pending: 2_870 };

const HOUR = 3600;

/** Recent charges, newest first. `created` is unix seconds. */
export function demoRecentCharges(nowSec = Math.floor(Date.now() / 1000)) {
  return [
    { amount: 475_000, currency: 'usd', description: 'Northpeak Dental · AI intake build deposit (sample)', created: nowSec - 2 * HOUR },
    { amount: 260_000, currency: 'usd', description: 'Launchpad Cohort · Priya N. · payment 2 of 3 (sample)', created: nowSec - 9 * HOUR },
    { amount: 180_000, currency: 'usd', description: 'Ellison HVAC · monthly retainer (sample)', created: nowSec - 30 * HOUR },
    { amount: 680_000, currency: 'usd', description: 'Launchpad Cohort · Rafael C. · paid in full (sample)', created: nowSec - 52 * HOUR },
    { amount: 140_000, currency: 'usd', description: 'Haddad Law · invoice #1042, part 1 (sample)', created: nowSec - 75 * HOUR },
  ];
}

/** Twelve months of deposits per business, ending this month. */
export function demoBusinessSeries(now = new Date()): BusinessSeries[] {
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  const vantage = [18.2, 21.4, 19.8, 24.6, 27.1, 25.3, 29.8, 31.2, 28.4, 33.9, 36.5, 34.1];
  const cohort = [6.8, 7.4, 12.9, 8.1, 9.6, 15.2, 10.4, 11.8, 17.6, 12.2, 13.9, 19.4];
  const series = (business: string, k: number[], costShare: number): BusinessSeries => ({
    business,
    months: months.map((month, i) => {
      const creditsCents = Math.round(k[i] * 100_000);
      const debitsCents = Math.round(creditsCents * costShare);
      return { month, creditsCents, debitsCents, netCents: creditsCents - debitsCents };
    }),
  });
  return [series('Launchpad Cohort (sample)', cohort, 0.22), series('Vantage (sample)', vantage, 0.38)];
}
