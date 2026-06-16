#!/usr/bin/env node
/**
 * Maps exercises in src/data/exercises.json to GIF URLs from
 * https://github.com/hasaneyldrm/exercises-dataset
 *
 * No API key required. GIFs are served via jsDelivr CDN.
 *
 * Usage (from unleashed-app/):
 *   npm run map-exercises
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXERCISES_PATH = path.join(__dirname, '../src/data/exercises.json')
const DATASET_URL =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json'
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main'

/** Best-match dataset IDs for Unleashed program exercises */
const MANUAL_DATASET_IDS = {
  pull_ups: '0652',
  chin_ups: '1326',
  close_grip_chin_ups: '1327',
  high_pull_ups: '0652',
  half_pull_ups: '0652',
  australian_pull_ups: '0499',
  australian_chin_ups: '0499',
  scapular_pulls: '0688',
  trx_y_pulls: '1017',
  push_ups: '0662',
  triceps_push_ups: '1701',
  pike_push_ups: '1296',
  push_ups_bottom_pause: '0662',
  push_ups_half_handstand: '0471',
  dips_parallel_bars: '0251',
  bar_dips: '0814',
  dip_negatives: '0251',
  tricep_extension: '0061',
  handstand_wall: '3302',
  handstand_push_ups: '0471',
  handstand_push_ups_wall: '0471',
  muscle_ups: '0631',
  elbow_plank: '0464',
  high_plank: '0662',
  high_plank_elbow_plank_combo: '0464',
  l_sit_parallel_bars: '3419',
  hanging_knee_raises: '0472',
  squats: '1685',
  slow_squats_legs_together: '1685',
  barbell_squats: '0043',
  jump_squat: '0514',
  jump_squats: '0514',
  lunges: '3470',
  walking_lunges: '1460',
  box_jump: '1374',
  deadlift: '0032',
  burpee: '1160',
  dead_hang: '0652',
  dead_hang_scapular: '0688',
  dead_hang_squeezed: '0688',
  chin_over_bar_hold: '1326',
  chin_over_bar_hang: '1326',
  shoulder_blade_squeeze_hang: '0688',
  front_lever_closed: '3296',
  front_lever_30_deg: '3296',
  body_lift_front_lever: '3296',
  closed_planche: '3301',
  cardio: '0685',
  morning_cardio: '0685',
  running: '0685',
  stretching: '1405',
  foam_rolling: '2208',
  warmup_roller: '2208',
}

const SEARCH_ALIASES = {
  pull_ups: 'pull-up',
  chin_ups: 'chin-up',
  push_ups: 'push-up',
  australian_pull_ups: 'inverted row',
  dead_hang: 'pull-up',
  foam_rolling: 'roller stretch',
  warmup_roller: 'roller stretch',
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function toInstructions(entry) {
  if (Array.isArray(entry.instruction_steps?.en)) return entry.instruction_steps.en
  if (typeof entry.instructions?.en === 'string') {
    return entry.instructions.en
      .split(/\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.endsWith('.') ? s : `${s}.`))
  }
  return undefined
}

function gifUrl(entry) {
  if (!entry?.gif_url) return null
  return `${CDN_BASE}/${entry.gif_url}`
}

function findMatch(exercise, dataset, byId) {
  const manualId = MANUAL_DATASET_IDS[exercise.id]
  if (manualId && byId.has(manualId)) {
    return { entry: byId.get(manualId), confidence: 'manual' }
  }

  const queries = [normalize(exercise.name), SEARCH_ALIASES[exercise.id]].filter(Boolean)
  for (const q of queries) {
    const exact = dataset.find((d) => normalize(d.name) === q)
    if (exact) return { entry: exact, confidence: 'exact' }

    const contains = dataset.find(
      (d) => normalize(d.name).includes(q) || q.includes(normalize(d.name)),
    )
    if (contains) return { entry: contains, confidence: 'fuzzy' }
  }

  return null
}

async function main() {
  console.log('Fetching exercises-dataset...')
  const res = await fetch(DATASET_URL)
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`)
  const dataset = await res.json()

  const byId = new Map(dataset.map((e) => [e.id, e]))
  const data = JSON.parse(fs.readFileSync(EXERCISES_PATH, 'utf8'))

  let mapped = 0
  let pending = 0

  for (const exercise of data.exercises) {
    const result = findMatch(exercise, dataset, byId)

    if (result?.entry) {
      const { entry, confidence } = result
      exercise.media = {
        source: 'exercises-dataset',
        dataset_id: entry.id,
        dataset_name: entry.name,
        gif_url: gifUrl(entry),
        thumbnail_url: entry.image ? `${CDN_BASE}/${entry.image}` : null,
        match_confidence: confidence,
        instructions: toInstructions(entry),
      }
      mapped++
      console.log(`✓ ${exercise.name} → ${entry.name} (${entry.id})`)
    } else {
      exercise.media = { source: 'pending', gif_url: null, match_confidence: 'manual' }
      pending++
      console.log(`✗ ${exercise.name} — no match`)
    }
  }

  fs.writeFileSync(EXERCISES_PATH, JSON.stringify(data, null, 2))

  // Sync root Exercises.json (preserve media only)
  const rootPath = path.join(__dirname, '../../Exercises.json')
  if (fs.existsSync(rootPath)) {
    const root = JSON.parse(fs.readFileSync(rootPath, 'utf8'))
    const mediaById = Object.fromEntries(data.exercises.map((e) => [e.id, e.media]))
    root.exercises = root.exercises.map((e) => ({ ...e, media: mediaById[e.id] ?? e.media }))
    fs.writeFileSync(rootPath, JSON.stringify(root, null, 2))
    console.log(`\nSynced media to ${rootPath}`)
  }

  console.log(`\nDone. Mapped: ${mapped}, Pending: ${pending}`)
  console.log(`Source: ${DATASET_URL}`)
  console.log(`CDN: ${CDN_BASE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
