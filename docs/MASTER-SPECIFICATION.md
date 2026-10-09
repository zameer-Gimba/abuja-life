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



## Core Life-Simulation Experience — Product Requirements

This section captures the intended player journey and the interaction patterns observed in the user's reference game. Use the patterns as category-level inspiration, but keep Abuja Life's interface, writing, game systems, art, names and implementation original.

### 1. Character creation and onboarding

Onboarding is a guided sequence, not one long form. Save progress between steps so a player can go back without losing choices.

1. **Gender / character model:** select the character model. The rendered model must match the choice.
2. **Skin tone:** choose from a respectful range of Nigerian skin-tone presets.
3. **Hair:** choose hairstyle and hair color from authored presets, including natural styles.
4. **Life dream / aspiration:** choose what the character hopes to become. Examples include technology professional, entrepreneur, creative, public-service career, professional, skilled trade, or community builder. Dreams shape starter goals and suggested opportunities; they must not lock the player out of other careers.
5. **Personality and interests:** multi-select applicable traits such as tech-minded, hustler, social butterfly, calm, ambitious, creative, sporty, or family-oriented. Traits affect dialogue, social responses and recommended activities, not the player's worth or access to core features.
6. **Background:** choose Rich Man Pikin or Poor Man Pikin, with clear explanations of starting resources and trade-offs.
7. **World entry:** ask whether the player lives in Abuja/FCT.
   - **Yes:** ask them to choose the closest area/district, with a searchable list, common aliases, nearby landmarks and a map-based confirmation option. Do not require exact GPS permission.
   - **No:** ask about preferred lifestyle, interests and starting budget/resources, then recommend a suitable Abuja starting district. The player can accept or change the recommendation.
8. **Language preference:** English is the default for the first playable version. Keep dialogue content structured so Nigerian Pidgin and Hausa can be added as selectable options after the English experience is reliable.

Every choice should be editable later in Settings where appropriate. Changes to physical appearance are applied deliberately and saved; the model and outfit never randomly change between scenes.

### 2. Abuja-first location selection

Abuja is the launch world's primary focus. Do not automatically drop every player into one neighbourhood just because the game recommends Abuja. Ask Abuja residents where they live or what area they consider home, then use that answer to choose a plausible initial home and nearby travel suggestions.

- Use one normalized location database with canonical district/location IDs, display names, aliases, coordinates or map anchors, and searchable keywords.
- Support common variants and nearby-area descriptions, and ask a brief clarification when a phrase could match multiple places. Never silently resolve an ambiguous residence to a random district.
- A player can search by location name, landmark, district or alias, or choose from the in-game map. The map selection and text search must resolve to the same canonical location ID.
- If a person lives outside Abuja, offer a recommended starting area based on preferences and game background. Explain that this is a game recommendation, not a claim about their real address.
- Lagos and Port Harcourt can be considered as future separate worlds; do not dilute the Abuja-first MVP by pretending those worlds already exist.
- Initial place catalogue should include Wuse 2 and Aminu Kano Crescent, Gwarinpa, Maitama, Asokoro, Central Area, Guzape, Jabi, Kubwa, Nyanya, Mararaba and key civic, recreation and transport landmarks, including Nnamdi Azikiwe International Airport, Aso Rock, National Assembly, Eagle Square, National Mosque, National Christian Centre and Millennium Park.

### 3. Persistent navigation: Map and Phone

Map and Phone are global game surfaces, available persistently from the home UI, street scenes and venues. Their entry points should remain discoverable as the player changes locations.

**Map**
- View the district and nearby places, choose a destination, inspect its name/category and confirm the trip.
- Support searching and browsing recommended places. Results include useful local aliases and should not require the player to know a venue's exact spelling.
- The selected destination becomes the single source of truth for the travel flow; Map and Phone navigation must not create conflicting destinations.

**Phone**
- The Phone is an in-game interaction hub, not a decorative mockup. Build its apps in stages and show only apps that work in the current release.
- The first working set should include Contacts, Calls, Map/navigation and a ride-hailing interface using fictional in-game services. A ride request accepts a destination from search or suggestions and lets the player review available transport options, fare and travel time before confirming.
- Contact actions include call family (for example, the player's mother), view known characters, save a new contact, and exchange/save contact details with another consenting player or NPC when that interaction is available.
- Persist contacts and call/event history where relevant. A contact may be an NPC or a registered player; label that distinction clearly.
- Never imply that a call or message reached a real-world phone number. Phone communications are in-game only unless a future feature explicitly says otherwise.

### 4. Travel loop: destination to street to arrival

Travel should feel like moving through a living city, rather than teleporting between unrelated screens.

1. Pick a destination on the Map or through the Phone's ride app.
2. Confirm destination and transport mode, see the Game Naira fare, and accept or cancel.
3. Transition to a street-side pickup scene with the chosen vehicle. Show the player's stable avatar boarding or entering it.
4. Travel through a continuous or convincing route scene with moving traffic, road markings, streetlights, buildings, shops, pedestrians and district-specific props. Use designed road segments and transitions; do not regenerate a different city for every frame.
5. Arrive at the destination, show the player exit, and load that destination's outdoor/venue scene.
6. Present actions that belong to the place: explore, enter a venue, interact socially, browse services or leave.

For the MVP, a well-authored route segment and believable scene transition is acceptable; avoid claiming a fully navigable real-world street grid until it exists. Travel fare, chosen destination and arrival state must stay consistent.

### 5. Social encounters, dialogue and identity

- Populate spaces with a combination of clearly distinguished ambient NPCs and actual registered players when multiplayer presence is implemented. Never fabricate a live-user count or present bots as actual online players.
- Use a persistent visible marker (for example, a crown) for the locally controlled human player if it helps players identify their avatar. Define separate visual conventions for NPCs and other real players so a crown does not falsely imply that every nearby character is the user.
- NPCs can initiate a short story or comment, and players can choose responses such as greet, gist, crack a joke, compliment an outfit or offer a venue-appropriate item. Dialogue reactions should be stateful: an NPC may laugh at a suitable joke, react neutrally, or dislike a response. Do not make every option succeed every time.
- Personality traits, relationship level, location, current activity and language preference can influence dialogue. Keep authored dialogue in a content system so Hausa and Pidgin variants can be added without duplicating game logic.
- English is the MVP default. Avoid pretending the game supports a language before reviewed dialogue exists in that language.
- Make it obvious which characters are scripted NPCs, simulated players, and actual registered players. NPC labels may use fictional names/handles, but must not be misrepresented as real people.

### 6. Wuse 2, Aminu Kano Crescent and nightlife detail

Wuse 2 and Aminu Kano Crescent are priority places because they contribute specific Abuja identity and lively night-time street activity. Build recognizable street segments with roadside businesses, traffic, pedestrians, venue entrances, signage and time-of-day variation. This corridor should not be reduced to a generic nightclub scene.

Nightlife workers can appear as adult background NPCs, with non-explicit dialogue and contextual presence. Do not implement explicit sexual dialogue, sexualized animation, or a sexual-service negotiation/purchase mechanic. Interactions may remain non-explicit (for example, a brief greeting, ignore/leave, or continue to a nearby venue), while the district still feels authentic through ambient characters, businesses, music, vehicles and crowd behaviour. All character portrayal should avoid graphic or demeaning treatment.

### 7. Functional quality bar and implementation order

The game should not advertise every Phone app as functional until it is wired through to game state. Implement and test one complete vertical path at a time:

1. Guided onboarding with saved choices and Abuja residence/recommendation logic.
2. Persistent avatar and background-specific home.
3. Global Map and Phone access, with canonical destination search.
4. One complete ride request → pickup/boarding → street travel → arrival loop.
5. A small set of functional locations and context-aware actions.
6. NPC identity, dialogue choices, reactions and contact saving.
7. Day/night population, moving vehicles, district-specific architecture and location-aware ambient audio.
8. Additional apps, languages, districts and more complex social or multiplayer behaviour after the core loop is stable.

Acceptance tests must cover saved onboarding choices, map/phone persistence across scenes, ambiguous place handling, correct fares and destination, stable character/outfit identity while travelling, truthful NPC-versus-player labels, contact persistence, and graceful handling when a feature is not yet available.
