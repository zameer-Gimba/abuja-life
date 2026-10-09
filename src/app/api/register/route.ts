import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const background = body.background === "rich" ? "rich" : "poor";

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3–20 characters using letters, numbers or underscores." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be 8–128 characters." }, { status: 400 });
    }

    const existing = await db.player.findFirst({
      where: { OR: [{ username }, { email }] },
      select: { username: true, email: true },
    });

    if (existing) {
      return NextResponse.json({ error: existing.username === username ? "That username is already in use." : "That email is already in use." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const rich = background === "rich";
    const startingBalance = rich ? 500000n : 100000n;

    const player = await db.player.create({
      data: {
        username,
        email,
        displayName: username,
        passwordHash,
        gender: "unspecified",
        background,
        backgroundLabel: rich ? "Rich Man Pikin" : "Poor Man Pikin",
        currentArea: rich ? "Guzape" : "Nyanya",
        homeArea: rich ? "Guzape" : "Nyanya",
        homeSceneId: rich ? "guzape_mansion_v1" : "nyanya_shared_room_v1",
        characterPresetId: "nigerian_young_adult_v1",
        skinTone: "medium_brown",
        hairstyle: rich ? "low_fade_v1" : "low_cut_v1",
        hairColor: "black",
        bodyType: "average",
        heightCm: 170,
        appearanceSeed: 1,
        outfitTop: rich ? "polo_navy_v1" : "tee_cream_v1",
        outfitBottom: rich ? "chinos_sand_v1" : "jeans_dark_v1",
        outfitShoes: rich ? "sneakers_white_v1" : "sneakers_black_v1",
        outfitOuterwear: "none",
        aura: rich ? 15 : 0,
        hustle: rich ? 5 : 15,
        connectLevel: rich ? 10 : 0,
        walletBalance: startingBalance,
        totalNetWorth: startingBalance,
      },
      select: { id: true, username: true, email: true, background: true, backgroundLabel: true },
    });

    return NextResponse.json({ player }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create the account right now." }, { status: 500 });
  }
}
