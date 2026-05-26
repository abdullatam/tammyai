# Emotional Intelligence (EQ) Architecture

Tammy tracks user psychology across sessions to provide non-generic, highly personalized interactions.

## Emotional Threads

Instead of just storing chat history, Tammy creates **Emotional Threads**.

When a user discusses a stressful project, Tammy opens a thread.
The thread tracks:
- **Trigger:** What caused the emotion (e.g., "Investor meeting").
- **Valence:** Positive (1) to Negative (-1).
- **Arousal:** High (1) to Low (0).
- **Status:** `open`, `resolved`, or `avoiding`.

## The Mirror Moment

If a user repeatedly abandons difficult topics (flagged as `avoiding`), the Mirror Moment unlocks. This is an LLM-generated hard-truth summary that confronts the user's avoidance patterns.

## Founder DNA
A background cron job periodically analyzes recent sessions against standard psychological frameworks to determine:
- Risk Tolerance
- Leadership Style
- Communication Vector

These traits are stored in MongoDB and dynamically injected into the system prompt to adjust Tammy's tone.
