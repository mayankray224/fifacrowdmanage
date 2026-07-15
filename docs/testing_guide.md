# FIFA CrowdFlow: Testing & Reliability Guide

This guide documents the automated testing framework and verification parameters implemented in **FIFA CrowdFlow**.

## Test Architecture
- **Framework**: Vitest (v4.x) running in Node environment for lightweight, execution-fast store and routing tests.
- **Coverage Target**: `>95%` statement coverage for core navigation path calculations and client states.

---

## Executing Tests

To run the automated unit test suite inside the isolated project:
```bash
cd "/Users/mayankray/Desktop/Coding vibe/fifa-crowdflow"
npm run test
```

---

## Verified Scenarios

### 1. State Actions (`useStadiumStore.test.ts`)
- Profile registration: Verify client logs roles, preferred language, and accessibility toggles.
- Dispatch scheduling: Verify dispatcher adds new volunteer tasks, updating status from `PENDING` to `COMPLETED`.

### 2. Spatial Pathfinder Node (`stadiumData.test.ts`)
- Shortest-path routing: Dijkstra calculates shortest connections between Gates and Concessions.
- Step-free path mapping: Wheelchair parameters block stairs and direct paths to active elevators.
- Eco Carbon Offsets: Walking route calculations yield `0.0` emissions, while rideshares calculate higher footprints.

---

## Resilience & Fallback Tests

- **Claude API Offline**: Simulated by omitting the `ANTHROPIC_API_KEY` token. Checked that the router falls back to pre-compiled local instructions (English, Spanish, French, Arabic, German, Hindi, Japanese, Portuguese, Hinglish).
- **Zod Parameter Violation**: Checked that malformed query variables return a `400 Bad Request` code with details.
