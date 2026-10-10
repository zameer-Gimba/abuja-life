"use client";

type GameClockLabelProps = {
  dayNumber: number;
  time: string;
  period: string;
};

export default function GameClockLabel({ dayNumber, time, period }: GameClockLabelProps) {
  return <span title="Game time advances faster than real time">Day {dayNumber} · {time} · {period}</span>;
}
