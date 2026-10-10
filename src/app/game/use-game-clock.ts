"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_GAME_MINUTE_OF_DAY,
  REAL_MS_PER_GAME_MINUTE,
  advanceClock,
  formatGameTime,
  getDayPeriod,
  isNightTime,
} from "@/lib/game-clock-utils";

type ClockAnchor = {
  minuteOfDay: number;
  dayNumber: number;
  serverNow: string;
};

export function useGameClock() {
  const [anchor, setAnchor] = useState<ClockAnchor>({
    minuteOfDay: DEFAULT_GAME_MINUTE_OF_DAY,
    dayNumber: 1,
    serverNow: new Date().toISOString(),
  });
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/game/clock", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Clock unavailable");
      if (
        typeof data.minuteOfDay !== "number" ||
        typeof data.dayNumber !== "number" ||
        typeof data.serverNow !== "string"
      ) {
        throw new Error("Clock response was incomplete");
      }
      setAnchor({
        minuteOfDay: data.minuteOfDay,
        dayNumber: data.dayNumber,
        serverNow: data.serverNow,
      });
      setNowMs(Date.now());
      setLoaded(true);
      setError("");
    } catch {
      setError("In-game time is temporarily unavailable.");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const current = useMemo(() => {
    const anchorMs = Date.parse(anchor.serverNow);
    const elapsed = Number.isFinite(anchorMs)
      ? Math.floor(Math.max(0, nowMs - anchorMs) / REAL_MS_PER_GAME_MINUTE)
      : 0;
    return advanceClock(anchor, elapsed);
  }, [anchor, nowMs]);

  return {
    ...current,
    time: formatGameTime(current.minuteOfDay),
    period: getDayPeriod(current.minuteOfDay),
    isNight: isNightTime(current.minuteOfDay),
    loaded,
    error,
    refresh,
  };
}
