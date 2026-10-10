import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const providedEmail = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const background = body.background === "rich" ? "rich" : "poor";
    const gender = body.gender === "female" ? "female" : body.gender === "male" ? "male" : "";

    if (!gender) {
      return NextResponse.json({ error: "Choose a male or female character." }, { status: 400 });
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3–20 characters using letters, numbers or underscores." }, { status: 400 });
    }
    if (providedEmail && (!providedEmail.includes("@") || !providedEmail.includes(".") || providedEmail.includes(" ") || providedEmail.length > 254)) {
      return NextResponse.json({ error: "Enter a valid email address or leave it blank for now." }, { status: 400 });
    }
    // Email is optional at signup; a reserved .invalid address is used until the player adds a real one.
    // This address cannot receive email and is not presented as the player real address.
    const email = providedEmail || `${username}@players.abujalife.invalid`;
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
        gender,
        background,
        backgroundLabel: rich ? "Rich Man Pikin" : "Poor Man Pikin",
        currentArea: rich ? "Guzape" : "Nyanya",
        homeArea: rich ? "Guzape" : "Nyanya",
        homeSceneId: rich ? "guzape_mansion_v1" : "nyanya_shared_room_v1",
        characterPresetId: gender === "female" ? "nigerian_female_young_adult_v1" : "nigerian_male_young_adult_v1",
        skinTone: "medium_brown",
        hairstyle: gender === "female" ? (rich ? "natural_twist_out_v1" : "natural_puff_v1") : (rich ? "low_fade_v1" : "low_cut_v1"),
        hairColor: "black",
        bodyType: gender === "female" ? "female_average_v1" : "male_average_v1",
        heightCm: gender === "female" ? 165 : 172,
        appearanceSeed: 1,
        outfitTop: gender === "female" ? (rich ? "blouse_lilac_v1" : "tee_rose_v1") : (rich ? "polo_navy_v1" : "tee_cream_v1"),
        outfitBottom: gender === "female" ? (rich ? "trousers_charcoal_v1" : "jeans_dark_v1") : (rich ? "chinos_sand_v1" : "jeans_dark_v1"),
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
