"use client";

import { useGameClock } from "./use-game-clock";

export default function GameClockLabel() {
  const clock = useGameClock(1_000, true);
  return (
    <span title={clock.error || "Game time advances faster than real time"}>
      Day {clock.dayNumber} · {clock.time} · {clock.period}
    </span>
  );
}
