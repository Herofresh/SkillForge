# Progression files: guide for coaches and contributors

These files are the **exercise progressions** of SkillForge: which exercises exist, in which order
they get harder, what "good enough to move on" means, and which exercises unlock which. You don't need
to be a programmer to read or change them.

- There is **one file per branch** (progression family), for example `v_pull.yaml` for pull-ups.
- Each exercise is one block (a **node**) starting with `- id:`.
- Lines starting with `#` are comments. Write whatever helps the next reader; the app ignores them.
- The app never reads these files directly. A build step checks them and turns them into app data
  (see [Checking your changes](#checking-your-changes)).

| File | Branch |
|---|---|
| `h_push.yaml` | Horizontal push (push-ups) |
| `v_push.yaml` | Vertical push (dips, handstand push-ups) |
| `v_pull.yaml` | Vertical pull (pull-ups) |
| `h_pull.yaml` | Horizontal pull (rows) |
| `front_lever.yaml` | Front lever |
| `back_lever.yaml` | Back lever and rings strength |
| `planche.yaml` | Planche |
| `handstand.yaml` | Handstand and balance |
| `core.yaml` | Core and compression |
| `legs.yaml` | Legs |
| `dynamic.yaml` | Muscle-up, elbow lever, human flag |
| `flexibility.yaml` | Flexibility: stretches and yoga poses (splits, pancake, pigeon, lotus, bridge) |
| `acrobatics.yaml` | Acrobatics: rolls, judo breakfalls, cartwheel to aerial |
| `mobility.yaml` | Mobility: active joint range (CARs, ankle, hips, thoracic spine, overhead squat) |

## A complete example

```yaml
  - id: pull_up                       # permanent name, lowercase_with_underscores
    name: Pull-up                     # what people see in the app
    description: Hanging from a bar or rings, you pull the body up until the chin is over the bar and lower back to straight arms.
    order: 50                         # position in the branch (easiest = smallest)
    og_level: 2                       # difficulty 0-17 (Overcoming Gravity 2 scale)
    metric: reps                      # reps | hold_s | eccentric_s | load_xbw
    working_range: { min: 5, max: 8 } # what a normal training set looks like
    trial: { sets: 3, target: 8 }     # the standard to pass before moving on
    prerequisites:                    # what must be learned first (optional)
      - node: pull_up_negative
        level: 5
      - node: hollow_hold
        level: 5
        kind: recommended             # only a warning, does not lock
        note: Helps keep the body line.
    straight_arm: false               # optional, default false
    skill: false                      # optional, default false
    patterns: [vertical_pull]
    trains: [pull, core]              # optional, rarely needed: replaces what patterns imply
    equipment:                        # each line is ONE way to do it
      - bar
      - rings
    alternatives: [band_pull_up]      # optional: same work with other equipment
    regression: pull_up_negative      # optional: the easier fallback
    cues:                             # optional: short coaching cues
      - Start from a dead hang, arms fully straight.
      - Pull until the chin is over the bar.
    sources:                          # required: where the standard comes from
      - https://redditbwf.github.io/wiki/recommended_routine.html
    verify: OG2 level is inferred.    # optional: anything that still needs checking
    review:
      status: draft                   # draft | coach_reviewed
      notes: ""                       # reviewer comments
```

## Fields

**Required**

| Field | Meaning | Allowed values |
|---|---|---|
| `id` | Permanent name of the exercise. **Never rename it** once released: people's saved progress points to it. | lowercase letters, digits and `_`, e.g. `tuck_front_lever`. Don't start with `user_` (reserved for users' own nodes). |
| `name` | Name shown in the app. | any text |
| `description` | What the exercise is and what it looks like, for someone who has never seen it. The app shows it on the skill page and in the info sheet ("i") in the tree and during training. Not the cues: how to do it well goes in `cues`. | 1–3 short plain sentences, at most 300 characters. Put it in quotes if it contains a `:` or `#`. |
| `order` | Position in the branch, easiest first. Must be different for every node in the file. Only used for ordering, so changing it is safe. | a positive number. Use steps of 10 (10, 20, 30…) so you can put a new node in between (e.g. 25). |
| `og_level` | Difficulty on the Overcoming Gravity 2 scale. Must never go **down** as `order` goes up. | whole number 0–17. `0` = foundation exercise, easier than OG level 1 (e.g. wall push-up). |
| `metric` | What is measured. | `reps` (repetitions), `hold_s` (seconds held), `eccentric_s` (seconds of one slow lowering), `load_xbw` (total load as a multiple of bodyweight, e.g. 1.2) |
| `working_range` | The normal training range per set, in the metric. | `{ min: 5, max: 8 }`, with min ≤ max. Reps are whole numbers. |
| `trial` | The standard to pass before moving on (unlocks the next level). `sets` × `target`. | `{ sets: 3, target: 8 }`. For `eccentric_s` and `load_xbw` also give `reps` per set: `{ sets: 3, reps: 3, target: 5 }` = 3 sets of 3 lowerings of 5 s. The target must be at least `working_range.min`. |
| `patterns` | Movement patterns (used to plan balanced workouts). | one or more of `horizontal_push`, `vertical_push`, `vertical_pull`, `horizontal_pull`, `straight_arm_push`, `straight_arm_pull`, `squat`, `hinge`, `core`, `balance`, `mobility`, `explosive` |
| `equipment` | What you need. **Each line is one option**; join things needed together with `+`. | `floor`, `wall`, `bar`, `dip_bars`, `parallettes`, `bands`, `rings`, `pole`, `box`. Example: `- bar` and `- rings` = bar **or** rings; `- floor + wall` = floor **and** wall. |
| `sources` | Links to where the standard comes from. Don't invent thresholds. | one or more `https://` links |

**Optional**

| Field | Meaning | Default |
|---|---|---|
| `prerequisites` | Exercises that must reach `level` first. `level` is the node level 1–10 in the app; **5 = Proficient** (trial passed), which is the usual choice. `kind: hard` locks the node until met; `kind: recommended` only shows a warning. `note` explains why. A prerequisite can be in another file (use its `id`). | none, `kind: hard` |
| `straight_arm` | `true` for straight-arm strength work (planche, levers, German hang). The app then recommends slowing down to protect tendons: its suggested workouts respect the tendon safeguards, and the user gets a warning when they go beyond them (ADR-010, ADR-023). **Required `true` in `front_lever`, `back_lever` and `planche`.** | `false` |
| `trains` | The character attributes ("base stats") the exercise pays into: `push`, `pull`, `core`, `legs`, `balance`, `mobility`. Normally you leave it out and the app derives it from `patterns` (see below). Set it only when that is wrong for this exercise, e.g. `trains: [core, push]` for an L-sit, which is a support hold on straight arms. It **replaces** the derived list, so name every attribute. The review sheet marks overrides with *. | derived from `patterns` |
| `skill` | `true` for balance and lever skills, `false` for plain strength exercises. | `false` |
| `alternatives` | Ids of exercises that train the same thing with other equipment. | none |
| `regression` | Id of the easier exercise to fall back to. | none |
| `legendary` | `true` for elite teaser skills shown as a locked silhouette. | `false` |
| `cues` | Short coaching cues, one per line. | none |
| `verify` | Anything uncertain that still needs checking, e.g. "OG2 level inferred". It shows as ⚠ on the review sheet; the app shows it only in development builds, so put any safety advice for the user in `cues` (ADR-064). | none |
| `review` | `status: draft` or `status: coach_reviewed`, plus `notes` for reviewer comments. | `status: draft` |

## What an exercise trains (attributes)

Every exercise someone trains raises the character attributes it trains, and harder exercises
(higher `og_level`) and more-trained ones (higher level in the app) raise them more. Which
attributes an exercise trains comes from its `patterns`:

| Pattern | Attributes |
|---|---|
| `horizontal_push`, `vertical_push` | push |
| `horizontal_pull`, `vertical_pull` | pull |
| `straight_arm_push` | push, core |
| `straight_arm_pull` | pull, core |
| `squat`, `hinge` | legs |
| `core` | core |
| `balance` | balance |
| `mobility` | mobility |
| `explosive` | nothing on its own (add the pattern it trains, e.g. `vertical_pull`) |

So a planche (`straight_arm_push`) trains push and core, a front lever (`straight_arm_pull`) pull
and core. If the result is wrong for one exercise, give it a `trains:` line. If the mapping itself
is wrong for many exercises, it lives in one place: `PATTERN_ATTRIBUTES` in
`src/domain/character.ts`. Every exercise must train at least one attribute; the check tells you
if one doesn't.

## Common changes

- **Add an exercise:** copy a similar block, give it a new `id`, pick an `order` between its
  neighbours (e.g. 25 between 20 and 30), set `og_level` so it doesn't drop below the node before it,
  and add `prerequisites`. If the next exercise should now require the new one, change its
  `prerequisites` too.
- **Change the order of a progression:** change the `order` numbers and the `prerequisites` so they
  match. The check tells you if `og_level` now goes down.
- **Change a standard:** edit `working_range` or `trial`, update `sources`, and remove the `verify`
  note if it's now settled.
- **Coach sign-off:** set `review.status: coach_reviewed` and put the coach's remarks in
  `review.notes`.
- **Remove an exercise:** ask first. Its `id` may already be in people's saved progress.

## Checking your changes

You need [Node.js](https://nodejs.org) and, once, `npm install` in the project folder. Then:

| Command | What it does |
|---|---|
| `npm run progressions:check` | Checks all files and tells you exactly what is wrong. Changes nothing. |
| `npm run progressions:build` | Checks, then regenerates the app data and the review sheet. **Run this after every edit and commit the changed files.** |
| `npm run progressions:review` | Regenerates only the review sheet `docs/review/progression-matrix.md`. |

Problems are reported as file, exercise id and a plain sentence, for example:

```
content/progressions/v_pull.yaml: pull_up: prerequisite 'dead_hangg' does not exist
```

The automated tests fail if the YAML has a problem or if you forgot to run the build, so a broken
change can't slip into the app.

## For coaches: the review sheet

`docs/review/progression-matrix.md` shows every branch as a table (order, OG level, standards,
prerequisites, what it trains, equipment, sources, ⚠ open questions, review status) with an empty
**Coach notes** column. Please also check the **Trains** column. It's generated from these files, so don't edit it directly: write your notes on a copy or
printout, or as comments on the pull request, and a contributor copies them into `review.notes`.

## Users' own progressions

People can also add, change or hide exercises inside the app without touching these files (a "user
overlay"). Their custom exercises use the same fields plus a `branch:` line, and their ids start with
`user_`. Exercises people made before descriptions existed may have no `description` yet; add one
before copying such a block here. They can export them as YAML and send them in as a suggestion; a contributor then copies the
blocks into the right file here (dropping the `branch:` line and the `user_` prefix).
