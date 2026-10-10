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
  receivedAtMs: number;
};

export function useGameClock(tickIntervalMs = 1_000, listenForExternalUpdates = false) {
  const [anchor, setAnchor] = useState<ClockAnchor>({
    minuteOfDay: DEFAULT_GAME_MINUTE_OF_DAY,
    dayNumber: 1,
    serverNow: "",
    receivedAtMs: 0,
  });
  const [nowMs, setNowMs] = useState(0);
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

      // Monotonic browser time avoids clock drift when the device's date/time is incorrect.
      const receivedAtMs = performance.now();
      setAnchor({
        minuteOfDay: data.minuteOfDay,
        dayNumber: data.dayNumber,
        serverNow: data.serverNow,
        receivedAtMs,
      });
      setNowMs(receivedAtMs);
      setLoaded(true);
      setError("");
    } catch {
      setError("In-game time is temporarily unavailable.");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => setNowMs(performance.now()), tickIntervalMs);
    const handleExternalUpdate = () => { void refresh(); };
    if (listenForExternalUpdates) {
      window.addEventListener("game-clock-updated", handleExternalUpdate);
    }

    return () => {
      window.clearInterval(interval);
      if (listenForExternalUpdates) {
        window.removeEventListener("game-clock-updated", handleExternalUpdate);
      }
    };
  }, [refresh, tickIntervalMs, listenForExternalUpdates]);

  const current = useMemo(() => {
    const elapsed = Math.floor(
      Math.max(0, nowMs - anchor.receivedAtMs) / REAL_MS_PER_GAME_MINUTE,
    );
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
