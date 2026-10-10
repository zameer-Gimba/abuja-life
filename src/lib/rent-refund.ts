const DAY_MS = 24 * 60 * 60 * 1000;
const RENTAL_TERM_DAYS = 365;

export type RentalLease = {
  annualRent: bigint | null;
  createdAt: Date;
};

export function calculateUnusedRentCredit(
  leases: RentalLease[],
  now: Date = new Date(),
): bigint {
  return leases.reduce((credit, lease) => {
    if (lease.annualRent === null || lease.annualRent <= 0n) return credit;
    const elapsedDays = Math.floor(Math.max(0, now.getTime() - lease.createdAt.getTime()) / DAY_MS);
    const remainingDays = Math.max(0, RENTAL_TERM_DAYS - Math.min(RENTAL_TERM_DAYS, elapsedDays));
    if (remainingDays === 0) return credit;
    return credit + (lease.annualRent * BigInt(remainingDays)) / BigInt(RENTAL_TERM_DAYS);
  }, 0n);
}
