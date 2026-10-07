// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | bigint): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount
  if (num >= 1_000_000_000) return `N${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `N${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `N${(num / 1_000).toFixed(1)}K`
  return `N${num.toLocaleString()}`
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 21) return "evening"
  return "night"
}

export function isFriday(): boolean {
  return new Date().getDay() === 5
}

export function isJumaatTime(): boolean {
  const now = new Date()
  return isFriday() && now.getHours() >= 14 && now.getHours() < 16
}

export function calcOneChanceRisk(area: string, time: string, transport: string): number {
  let risk = 0
  if (transport === "bus_stop") risk += 20
  if (time === "night") risk += 30
  if (["Nyanya", "Mararaba", "Berger", "Kubwa"].includes(area)) risk += 15
  return Math.min(risk, 85)
}

export function getBirthBackground(): "rich" | "poor" {
  return Math.random() > 0.5 ? "rich" : "poor"
}

export function getBackgroundLabel(background: string): string {
  return background === "rich" ? "Rich Man Pikin" : "Poor Man Pikin"
}

export function getStartingStats(background: string) {
  if (background === "rich") {
    return {
      walletBalance: BigInt(500_000),
      aura: 20,
      steez: 15,
      composure: 60,
      hustle: 5,
      intelligence: 15,
      connectLevel: 10,
      homeArea: "Maitama",
      housingType: "duplex",
      debt: BigInt(0),
    }
  }
  return {
    walletBalance: BigInt(60_000),
    aura: 0,
    steez: 0,
    composure: 40,
    hustle: 20,
    intelligence: 10,
    connectLevel: 0,
    homeArea: "Nyanya",
    housingType: "face-me",
    debt: BigInt(60_000), // LAPO-style starter loan
  }
}
