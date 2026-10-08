import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim().toLowerCase();
    const background = body.background === "rich" ? "rich" : "poor";

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3–20 characters using letters, numbers or underscores." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const existing = await db.player.findFirst({
      where: { OR: [{ username }, { email }] },
      select: { username: true, email: true },
    });

    if (existing) {
      return NextResponse.json({ error: existing.username === username ? "That username is already in use." : "That email is already in use." }, { status: 409 });
    }

    return NextResponse.json({
      error: "Account persistence is ready for the authentication adapter. Password storage will be enabled with the project's approved auth provider before production.",
      background,
      username,
      email,
    }, { status: 501 });
  } catch {
    return NextResponse.json({ error: "Unable to process the registration request." }, { status: 400 });
  }
}
