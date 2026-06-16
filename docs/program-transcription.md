# Program Transcription Reference

> **Status:** Starter scaffold in `src/data/program.json` (4 weeks).  
> Replace with full transcription from `Vitaliy_Fechuk_Unleashed_Beginner.pdf` when available.

## How to transcribe

1. Add the PDF to `docs/Vitaliy_Fechuk_Unleashed_Beginner.pdf`
2. For each week/day in the PDF, add an entry to `program.json` → `schedule`
3. Every `exercise_id` must exist in `Exercises.json`
4. Prescription formats:

| PDF | JSON |
|-----|------|
| 3×8 | `{ "sets": 3, "reps": 8 }` |
| 3×5-8 | `{ "sets": 3, "reps_min": 5, "reps_max": 8 }` |
| 30s hold × 3 | `{ "sets": 3, "duration_sec": 30 }` |
| 30 min cardio | `{ "duration_min": 30 }` |

## Current scaffold overview

| Week | Focus progression |
|------|-------------------|
| 1 | Australian pulls, basic push, squats, handstand wall |
| 2 | Half pull-ups, bar dips, walking lunges, L-sit |
| 3 | Pull-ups, HSPU wall, jump squats, front lever tuck |
| 4 | Chin-ups, muscle-up attempts, box jumps, front lever 30° |

## Verification checklist

- [ ] PDF added to `docs/`
- [ ] All weeks/days from PDF transcribed
- [ ] Every `exercise_id` resolves in Exercises.json
- [ ] Rest days and cardio days marked with correct `type`
- [ ] Sets/reps match PDF exactly
