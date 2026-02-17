# Noon Academy — Breakouts v2 Prototype

> **"Turning Breakouts into Real Peer Discussions"**
> A high-fidelity React Native (Expo) prototype demonstrating structured reasoning before voting.

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the Expo dev server
npx expo start

# 3. Scan the QR code with Expo Go (iOS/Android)
#    or press 'w' for web, 'i' for iOS simulator, 'a' for Android emulator
```

**Requirements:** Node.js 18+, Expo Go app on your phone (or a simulator).

---

## App Flow

```
LiveSessionScreen
      ↓  [Start Breakout]
BreakoutRoomScreen
  ├── Phase A: Independent Thinking (20 sec)
  ├── Phase B: Structured Discussion (30 sec)
  └── Phase C: Voting (20 sec)
      ↓  [auto-advance]
ResultsScreen
      ↓  [Back to LIVE class]
LiveSessionScreen
```

---

## How to Demo the Structured Discussion

### Full automated demo (hands-off):

1. Open the app → tap **"Start Breakout"**
2. **Phase A (20s):** Optionally tap an answer (try **A** — the wrong one)
3. **Phase B (30s):** Watch the group's answers appear on avatars. Observe peers posting reasoning messages automatically:
   - Sara (4.5s): explains why she picked A
   - Ahmed (9s): eliminates C
   - Lina (14s): gives the correct formula
   - Omar (24s, late/shy): realizes the mistake
4. Before the timer ends, type a message or tap **🎤 Speak** to contribute
5. Watch the contribution bar fill from `1/5 → 5/5`
6. **Phase C (20s):** Voting opens. Sara and Ahmed change their votes to B
7. Results screen shows **3/5 correct** with the "discussion helped" callout

### What to observe / highlight for stakeholders:

| Before (Breakouts v1) | After (Breakouts v2) |
|---|---|
| Vote immediately, no reasoning required | Must contribute once before voting |
| Silent rooms — 27% never speak | Contribution progress bar creates social accountability |
| Shallow messages: "A", "ok" | Guided prompt chips scaffold reasoning |
| No insight into why peers voted differently | Answer badges on avatars + chat bubbles reveal reasoning |
| Learning outcome not tracked | Results screen shows discussion impact (+2 changed answers) |

---

## Key Behaviors to Observe

### Social accountability (contribution bar)
The `2/5 contributed` bar makes silence visible. Students see that others are participating, which reduces the "bystander effect."

### Guided scaffolding (prompt chips)
Chips like *"I think it's __ because…"* lower the activation energy for writing. Students don't have to think of what to say — they only have to agree with a template.

### Late contributor (Omar, 24s)
Simulates a shy student who waits until just before the timer runs out. Shows that even reluctant participants eventually contribute when there's light social pressure.

### Peer answer change (Phase C)
Sara and Ahmed change their votes from A → B after hearing Lina's explanation. This demonstrates measurable learning impact from peer discussion.

### Silent risk flag
If nobody has contributed by the 8-second mark, an analytics event `silent_risk_flag` fires and a banner nudges the user to speak first.

---

## Analytics Events (console.log)

| Event | When fired |
|---|---|
| `session_screen_viewed` | LiveSession opens |
| `breakout_joined` | BreakoutRoom opens |
| `independent_answer_selected` | User taps an option in Phase A |
| `discussion_prompt_opened` | User taps a prompt chip |
| `contribution_submitted` | User sends a text/voice message |
| `peer_contribution_submitted` | Simulated peer contributes |
| `peer_vote_changed` | Simulated peer changes vote |
| `vote_changed` | User changes their own vote |
| `silent_risk_flag` | <2 contributors at 8s mark in Phase B |
| `breakout_completed` | Results screen is reached |
| `returned_to_live_session` | User taps "Back to LIVE class" |

---

## Project Structure

```
NoonDemo/
├── App.tsx                         # Root: fonts, navigation
├── app.json                        # Expo config
├── package.json
├── babel.config.js
├── tsconfig.json
├── README.md
└── src/
    ├── theme/
    │   └── index.ts                # Colors, typography, spacing, shadows
    ├── types/
    │   └── index.ts                # TypeScript interfaces & navigation types
    ├── data/
    │   └── session.ts              # Simulated question, participants, messages
    ├── components/
    │   ├── Avatar.tsx              # Circular avatar with option badge + checkmark
    │   ├── OptionButton.tsx        # A/B/C/D answer option with selection state
    │   ├── ChatBubble.tsx          # Animated chat message (local/peer)
    │   ├── ContributionBar.tsx     # Animated "X/5 contributed" progress bar
    │   ├── CountdownRing.tsx       # Circular countdown timer display
    │   ├── PromptChip.tsx          # Scrollable guided prompt chips
    │   ├── PhaseBar.tsx            # Think → Discuss → Vote step indicator
    │   └── NoonLogo.tsx            # Brand logo (text-based)
    └── screens/
        ├── LiveSessionScreen.tsx   # Entry: LIVE class lobby
        ├── BreakoutRoomScreen.tsx  # Core: 3-phase breakout experience
        └── ResultsScreen.tsx       # Outcome: score, explanation, impact
```

---

## Design System

| Token | Value |
|---|---|
| Background | `#f9f4f0` |
| Primary | `#26cd91` |
| Font | Inter (Regular / Medium / SemiBold / Bold) |
| Corner radius | 8 / 12 / 16 / 24px |
| Shadows | Soft, layered (sm / md / lg) |

---

## Product Hypothesis

> *"If we require structured reasoning before voting, students will engage more deeply and performance will improve."*

This prototype tests that hypothesis by:
1. Making silence visible (contribution bar)
2. Reducing friction (guided prompt chips)
3. Scaffolding reasoning (templates starting with "I think X because…")
4. Locking votes until contribution (light requirement, not a blocker)
5. Surfacing impact (results screen shows how discussion changed outcomes)
