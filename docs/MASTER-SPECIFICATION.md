# Abuja Life — Master Specification

## Identity

**Name:** Abuja Life  
**Tagline:** The Capital Has Levels.  
**Currency:** Game Naira (₦)  
**World:** Fictionalized Abuja/FCT life simulation.

Abuja Life is inspired by the life-simulation category and Abuja itself. Its world structure, nomenclature, writing, mechanics, presentation, and data organization are independently developed for Abuja.

## Character backgrounds

- **Rich Man Pikin** — higher starting resources, Aura and Connection; premium access.
- **Poor Man Pikin** — lower starting resources with stronger early Hustle/Street Sense progression.

Background is part of character creation and is persistent.

## Core attributes

Aura, Steez, Composure, Hustle, Intelligence, Driving Skill, Street Sense, Connection, Health and Happiness.

## World model

FCT → Area/District → Location → Venue/Building → Activity.

The initial location dataset will incorporate the 69 Abuja places identified in the reference research while using an independently designed organization and adding Abuja-specific locations and venues from ongoing research.

## Political system

The fictional in-game hierarchy is:

1. Abuja President
2. FCT Governor
3. FCT Chairman
4. Party and election roles

Political gameplay is fictional and does not represent the actual Nigerian governmental structure.

**Election cycle:** 4 game months.

Political systems will include eligibility, parties, tickets, campaigning, representatives, voting, counting, declaration, office tenure and privileges.

## Economy

Game Naira has no real-world cash value.

The economy will cover employment, housing, transport, education, businesses, property, vehicles, advertising and political campaigning.

## Production principles

- Server-authoritative money, ownership, votes and paid items.
- Never trust client-submitted balances or election results.
- Secrets remain server-side/environment-only.
- Use validation, authorization, rate limiting, audit logging and database constraints.
- Scale infrastructure according to measured demand.

## MVP

The first playable vertical slice is:

Guidelines → Registration → Background → Character → Abuja map → movement → dashboard → one job → earn Game Naira → spend Game Naira → persist state.

Advanced multiplayer, full elections, comprehensive 3D, real-money top-ups and the complete location/activity catalogue follow after the core loop works.

## Email

One ZeptoMail account will support transactional email such as verification, OTP, password recovery and selected security/account notifications.

## Disclaimer direction

Abuja Life is fictional entertainment software inspired by Abuja/FCT. Real locations, institutions, businesses, organizations and political structures may be adapted, simplified or fictionalized. Their appearance does not imply endorsement, sponsorship or affiliation. Political offices and election mechanics are game systems and are not representations of actual governmental processes. Game Naira has no cash value.


## Vehicle & Driving Vertical Slice
- Vehicle ownership is persistent player state: type, name, fuel, condition, value.
- Vehicle purchases are server-authoritative and recorded in the transaction ledger.
- Vehicle ownership supports vehicle-required jobs and future driving progression.
- Fuel and maintenance are recurring Game Naira expenses.
- Vehicle purchase converts cash into an owned asset; the current net-worth model therefore does not subtract the purchase price from net worth.
- Real-world driving/drifting is not instructional; Abuja Drifters is represented as fictional game progression and events.

## Persistent 3D World Foundation

### Visual direction
- The game world uses a stable, authored 3D/isometric environment. Do not generate a new character, outfit, house, or district layout every time a camera angle or scene changes.
- Character identity and wardrobe are persisted on the Player record using stable preset IDs and appearance fields.
- Starting homes are background-specific: Poor Man Pikin starts in a shared single room in Nyanya with two stationary dummy roommates; Rich Man Pikin starts in a Guzape mansion scene with a driveway/garage slot.
- Roommates are non-player scene actors. They must never be mistaken for, overwrite, or control the player character.
- Outfit keys change only through an explicit wardrobe purchase/equip action; changing location must not change clothes.
- Character presets use authored Nigerian appearance options, including natural hair styles and a range of brown skin tones. Do not infer wealth, personality, or role from skin tone. The starter defaults are only defaults, not the limit of the eventual character creator.
- Height, body type, hairstyle, skin tone, and hair color are stable saved attributes. Scene changes may not alter them.

### District art direction
Districts load an explicit world profile from `src/constants/world.ts`. Maitama and Central Area use higher-end diplomatic/civic architecture, broader roads and formal landscaping. Commercial and planned residential districts use their own profiles. Kubwa and Nyanya use mixed suburban density, while Mararaba uses a denser peri-urban roadside-commerce profile. These are stylized game-art directions, not claims that every real street is uniform.

### Asset consistency contract
1. Each scene uses stable model, material, outfit and environment IDs.
2. Camera movement changes only the view, never the underlying model or outfit.
3. Appearance randomness, where introduced, is generated once at character creation and saved as `appearanceSeed`; never reroll per render.
4. The scene registry and persisted preset IDs are the source of truth.
5. Audio is location/state-aware and has a mute/volume control; ambience changes by scene instead of looping one generic track everywhere.
6. A first playable slice must prove home interior, player movement, interaction, home exit, district transition and saved identity before broadening the map.

### Gender and character representation
- Gender is selected at character creation and stored persistently.
- The first character presets are distinct authored male and female adult character models; a female selection must resolve to a clearly female character model, not reuse the male silhouette with a different label.
- Gender, body proportions, height, skin tone, hair style/color and outfit are independent persisted appearance attributes. They remain stable when travelling or changing camera angle.
- Nigerian appearance options should include a thoughtful range of brown skin tones and locally plausible natural hairstyles. Avoid treating any single look as the only Nigerian look or using skin tone as a proxy for status.

### Population, time and nightlife
- Pedestrian counts, NPC types, lighting and ambient sound are controlled by the district profile and in-game time, using stable spawn points and deterministic placement.
- Maitama and Asokoro's quieter residential/diplomatic streets should have sparse foot traffic, security presence and occasional vehicles rather than crowds on every road.
- Commercial districts such as Central Area and Wuse 2 can be busier, while Nyanya, Kubwa and Mararaba have their own distinct street activity and density patterns.
- Wuse 2 around Aminu Kano Crescent has a fictional nightlife corridor, including adult nightlife workers as non-explicit ambient NPCs, club patrons, venue staff and drivers. They are contextual background characters, not explicit sexual content or a sexual-service mechanic in the initial build.
- Include a fictional Wuse 2 nightclub with its own interior, opening hours, crowd profile, lighting and audio profile. All game audio has player-accessible mute and volume controls.
- These are authored fictional game representations of real areas, not assertions that every street or resident behaves identically.

