#!/usr/bin/env node
/**
 * Maps exercises in src/data/exercises.json to WorkoutX GIF URLs.
 *
 * Usage:
 *   WORKOUTX_API_KEY=wx_your_key node scripts/map-workoutx.mjs
 *   # or from unleashed-app folder:
 *   npm run map-exercises
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXERCISES_PATH = path.join(__dirname, '../src/data/exercises.json')
const API_KEY = process.env.WORKOUTX_API_KEY || process.env.VITE_WORKOUTX_API_KEY
const BASE = 'https://api.workoutxapp.com/v1'

const MANUAL_ALIASES = {
  australian_pull_ups: 'inverted row',
  australian_chin_ups: 'inverted row',
  half_pull_ups: 'pull up',
  high_pull_ups: 'pull up',
  close_grip_chin_ups: 'chin up',
  push_ups_bottom_pause: 'push up',
  push_ups_half_handstand: 'pike push up',
  dip_negatives: 'dip',
  dead_hang_scapular: 'dead hang',
  dead_hang_squeezed: 'dead hang',
  chin_over_bar_hang: 'chin up',
  shoulder_blade_squeeze_hang: 'scapular pull',
  high_plank_elbow_plank_combo: 'plank',
  slow_squats_legs_together: 'squat',
  triceps_push_ups: 'push up',
  handstand_push_ups_wall: 'handstand push up',
  warmup_roller: 'foam roll',
  foam_rolling: 'foam roll',
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

async function searchExercise(name) {
  const res = await fetch(`${BASE}/exercises/name/${encodeURIComponent(name)}`, {
    headers: { 'X-WorkoutX-Key': API_KEY },
  })
  if (!res.ok) return null
  const json = await res.json()
  const list = Array.isArray(json) ? json : json.data ?? []
  return list[0] ?? null
}

function pickBestMatch(exercise, candidates) {
  if (!candidates?.length) return null
  const target = normalize(exercise.name)
  const exact = candidates.find((c) => normalize(c.name) === target)
  if (exact) return { match: exact, confidence: 'exact' }
  const fuzzy = candidates[0]
  return { match: fuzzy, confidence: 'fuzzy' }
}

async function mapExercise(exercise) {
  const queries = [
    exercise.name,
    MANUAL_ALIASES[exercise.id],
  ].filter(Boolean)

  for (const q of queries) {
    const result = await searchExercise(q)
    if (!result) continue
    const list = Array.isArray(result) ? result : [result]
    const picked = pickBestMatch(exercise, list)
    if (picked?.match) {
      return {
        source: 'workoutx',
        workoutx_id: picked.match.id,
        gif_url: picked.match.gifUrl ?? `${BASE}/gifs/${picked.match.id}`,
        match_confidence: picked.confidence,
        instructions: picked.match.instructions,
      }
    }
  }

  return {
    source: 'pending',
    gif_url: null,
    match_confidence: 'manual',
  }
}

async function main() {
  if (!API_KEY) {
    console.error('Set WORKOUTX_API_KEY or VITE_WORKOUTX_API_KEY environment variable.')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(EXERCISES_PATH, 'utf8'))
  let mapped = 0
  let pending = 0

  for (const exercise of data.exercises) {
    process.stdout.write(`Mapping: ${exercise.name}... `)
    const media = await mapExercise(exercise)
    exercise.media = media
    if (media.gif_url) {
      mapped++
      console.log(`✓ ${media.gif_url}`)
    } else {
      pending++
      console.log('✗ no match')
    }
    await new Promise((r) => setTimeout(r, 350))
  }

  fs.writeFileSync(EXERCISES_PATH, JSON.stringify(data, null, 2))
  console.log(`\nDone. Mapped: ${mapped}, Pending: ${pending}`)
  console.log(`Updated: ${EXERCISES_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
