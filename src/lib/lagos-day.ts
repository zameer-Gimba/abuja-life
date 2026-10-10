/**
 * Returns midnight at the start of the current calendar day in Abuja (Africa/Lagos),
 * expressed as a UTC Date for database comparisons. Nigeria uses UTC+1 year-round.
 */
export function getLagosDayStart(now: Date = new Date()): Date {
  const lagosOffsetMs = 60 * 60 * 1000;
  const lagosNow = new Date(now.getTime() + lagosOffsetMs);
  return new Date(
    Date.UTC(lagosNow.getUTCFullYear(), lagosNow.getUTCMonth(), lagosNow.getUTCDate()) -
      lagosOffsetMs,
  );
}
