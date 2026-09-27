# Node manifest (Phase 1.2-1.4)

The planned MVP nodes: **88 nodes** across 12 branches. Content authors write each node as a
block in `content/progressions/<branch>.yaml` (field guide: `content/progressions/README.md`).
Ids are final: never rename them. `order`, `og_level` and prerequisites are the plan; an author may
adjust them with a source, but must keep the check (`npm run progressions:check`) green and note the
change here.

- **Prerequisites:** `id` = hard at level 5 (Proficient); `id (rec.)` = recommended at level 5.
  Ids in *italics* are in another branch (cross-branch gates, PLAN 1.3).
- **Equipment:** "or" separates options (one YAML line each), `+` joins tags needed together (Home = floor, wall, bar,
  parallettes, bands; Park = Home + dip_bars).
- **OG:** 0 = foundation (below OG2 level 1). Levels marked "verify"/inferred need a `verify:` note.
- Nodes marked WRITTEN already exist as the example in their file.

## h_push

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `wall_push_up` | Wall push-up | 0 | reps | — | wall | WRITTEN (example) |
| 20 | `incline_push_up` | Incline push-up | 0 | reps | `wall_push_up` | box or bar or dip_bars or parallettes | hands on a raised surface |
| 30 | `knee_push_up` | Knee push-up | 0 | reps | `incline_push_up` | floor |  |
| 40 | `push_up` | Push-up | 1 | reps | `knee_push_up` | floor or parallettes | OG2 anchor level 1 |
| 50 | `diamond_push_up` | Diamond push-up | 2 | reps | `push_up` | floor |  |
| 60 | `elevated_one_arm_push_up` | Elevated one-arm push-up | 5 | reps | `diamond_push_up` | box or bar or dip_bars | OG2 incline/elevated OA PU [5] |
| 70 | `archer_push_up` | Archer push-up | 6 | reps | `diamond_push_up` | floor or parallettes | OG2 [6] |
| 80 | `pseudo_planche_push_up` | Pseudo planche push-up | 6 | reps | `diamond_push_up`, *`planche_lean`* (rec.) | floor or parallettes | floor PPPU level inferred from RTO 40° PPPU [~6]; verify |

## v_push

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `support_hold` | Support hold | 0 | hold_s | — | dip_bars or parallettes or rings | WRITTEN (example) |
| 20 | `pike_push_up` | Pike push-up | 1 | reps | *`push_up`* (rec.) | floor or parallettes | OG2 pike HeSPU [1] |
| 30 | `dip_negative` | Dip negative | 2 | eccentric_s | `support_hold` | dip_bars or rings | trial needs reps (lowerings per set) |
| 40 | `elevated_pike_push_up` | Elevated pike push-up | 2 | reps | `pike_push_up` | floor or box or parallettes | feet on a chair/box; OG2 [2] |
| 50 | `parallel_bar_dip` | Parallel bar dip | 3 | reps | `dip_negative` | dip_bars | Park only (Home has no dip bars); OG2 PB dips [3] |
| 60 | `wall_headstand_push_up` | Wall headstand push-up | 4 | reps | `elevated_pike_push_up`, *`wall_handstand`* | wall | OG2 wall HeSPU [4] |
| 70 | `wall_handstand_push_up` | Wall handstand push-up (full range) | 5 | reps | `wall_headstand_push_up` | wall + parallettes | OG2 [5] |
| 80 | `freestanding_handstand_push_up` | Freestanding handstand push-up | 7 | reps | `wall_handstand_push_up`, *`freestanding_handstand`* | floor or parallettes | OG2 [~6-7]; verify |

## v_pull

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `dead_hang` | Dead hang | 0 | hold_s | — | bar or rings | WRITTEN (example) |
| 20 | `scapular_pull` | Scapular pull | 0 | reps | `dead_hang` | bar or rings |  |
| 30 | `jump_pull_up` | Jumping pull-up | 1 | reps | `scapular_pull` | bar | OG2 [1]; cue: band-assisted is fine too |
| 40 | `pull_up_negative` | Pull-up negative | 2 | eccentric_s | `jump_pull_up` | bar or rings | OG2 [2]; trial needs reps |
| 50 | `pull_up` | Pull-up | 2 | reps | `pull_up_negative` | bar or rings | OG2 [~2]; regression: pull_up_negative |
| 60 | `chest_to_bar_pull_up` | Chest-to-bar pull-up | 4 | reps | `pull_up` | bar | unlevelled in OG2 (sits near L-pull-up [4]); verify |
| 70 | `archer_pull_up` | Archer pull-up | 6 | reps | `chest_to_bar_pull_up` | bar or rings | OG2 [~6] |
| 80 | `one_arm_chin_up_negative` | One-arm chin-up negative | 7 | eccentric_s | `archer_pull_up` | bar | OG2 OAC negatives [~7]; trial needs reps |
| 90 | `one_arm_chin_up` | One-arm chin-up | 9 | reps | `one_arm_chin_up_negative` | bar | **legendary**; OG2 [9] |

## h_pull

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `band_row` | Band row | 0 | reps | — | bands | Home option (band anchored to a door or bar); alternatives: incline_row |
| 20 | `incline_row` | Incline row | 0 | reps | — | rings or bar | WRITTEN (example); add alternatives: [band_row] |
| 30 | `horizontal_row` | Horizontal row | 2 | reps | `incline_row` | rings or bar | OG2 [2] |
| 40 | `archer_row` | Archer row | 4 | reps | `horizontal_row` | rings or bar | OG2 [4] |
| 50 | `tuck_front_lever_row` | Tuck front lever row | 5 | reps | `archer_row` (rec.), *`tuck_front_lever`* | bar or rings | OG2 FL rows tuck [5]; bent-arm, straight_arm: false |
| 60 | `straddle_one_arm_row` | Straddle one-arm row | 6 | reps | `archer_row` | rings or bar | OG2 [6] |

## front_lever

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `tuck_front_lever` | Tuck front lever | 4 | hold_s | *`pull_up`*, *`hollow_hold`*, *`dead_hang`* | bar or rings | WRITTEN (example); ADD pull_up (L5, hard) and remove its verify note |
| 20 | `advanced_tuck_front_lever` | Advanced tuck front lever | 4 | hold_s | `tuck_front_lever` | bar or rings | OG2 [~4] |
| 30 | `one_leg_front_lever` | One-leg front lever | 6 | hold_s | `advanced_tuck_front_lever` | bar or rings | OG2 [~6] |
| 40 | `straddle_front_lever` | Straddle front lever | 6 | hold_s | `one_leg_front_lever` | bar or rings | OG2 [6] |
| 50 | `front_lever` | Front lever | 7 | hold_s | `straddle_front_lever` | bar or rings | OG2 anchor [7] |

## back_lever

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `german_hang` | German hang | 1 | hold_s | *`dead_hang`* | rings or bar | WRITTEN (example) |
| 20 | `skin_the_cat` | Skin the cat | 2 | reps | `german_hang` | rings or bar | OG2 [2] |
| 30 | `tuck_back_lever` | Tuck back lever | 2 | hold_s | `skin_the_cat` | rings or bar | OG2 [~2] |
| 40 | `advanced_tuck_back_lever` | Advanced tuck back lever | 4 | hold_s | `tuck_back_lever` | rings or bar | OG2 [4] |
| 50 | `straddle_back_lever` | Straddle back lever | 5 | hold_s | `advanced_tuck_back_lever` | rings or bar | OG2 [5] |
| 60 | `back_lever` | Back lever | 6 | hold_s | `straddle_back_lever` | rings or bar | OG2 [~6] |
| 70 | `iron_cross` | Iron cross | 10 | hold_s | `back_lever`, *`support_hold`*, *`front_lever`* (rec.) | rings | **legendary**; OG2 [10]; elbow tendinitis risk (stevenlow.org/ironcross) |

## planche

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `planche_lean` | Planche lean | 2 | hold_s | *`push_up`*, *`wrist_prep`*, *`support_hold`* | floor or parallettes | WRITTEN (example); ADD push_up (L5, hard) |
| 20 | `straight_arm_frog_stand` | Straight-arm frog stand | 4 | hold_s | `planche_lean`, *`frog_stand`* | floor or parallettes | OG2 [4] |
| 30 | `tuck_planche` | Tuck planche | 5 | hold_s | `straight_arm_frog_stand`, *`pseudo_planche_push_up`* (rec.), *`wall_handstand`* (rec.) | floor or parallettes | OG2 anchor [5] |
| 40 | `advanced_tuck_planche` | Advanced tuck planche | 6 | hold_s | `tuck_planche` | floor or parallettes | OG2 [6] |
| 50 | `straddle_planche` | Straddle planche | 7 | hold_s | `advanced_tuck_planche` | floor or parallettes | OG2 [7] |
| 60 | `full_planche` | Full planche | 10 | hold_s | `straddle_planche` | floor or parallettes | **legendary**; OG2 [~10] |

## handstand

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `wall_plank` | Wall plank | 0 | hold_s | *`wrist_prep`* (rec.) | wall | WRITTEN (example) |
| 20 | `wall_handstand` | Wall handstand (back to wall) | 1 | hold_s | `wall_plank`, *`pike_push_up`* (rec.) | wall | OG2 [1-2] |
| 30 | `chest_to_wall_handstand` | Chest-to-wall handstand | 2 | hold_s | `wall_handstand` | wall | unlevelled; GMB gate 3 x 20-30 s before freestanding |
| 40 | `frog_stand` | Frog stand (crow) | 3 | hold_s | *`wrist_prep`* | floor or parallettes | OG2 [3]; bent-arm balance |
| 50 | `freestanding_handstand` | Freestanding handstand | 4 | hold_s | `chest_to_wall_handstand` | floor | OG2 [4-5]; verify |
| 60 | `wall_straddle_press_eccentric` | Wall straddle press eccentric | 5 | eccentric_s | `chest_to_wall_handstand`, *`l_sit`* (rec.) | wall | OG2 [5]; trial needs reps |
| 70 | `straddle_press_to_handstand` | Straddle press to handstand | 7 | reps | `wall_straddle_press_eccentric`, `freestanding_handstand`, *`straddle_l_sit`* | floor or parallettes | OG2 standing straddle press [7] |
| 80 | `one_arm_handstand` | One-arm handstand | 10 | hold_s | `freestanding_handstand` | floor | **legendary**; OG2 [10]; gate ~60 s freestanding (GMB) |

## core

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `hollow_hold` | Hollow body hold | 0 | hold_s | — | floor | WRITTEN (example) |
| 20 | `side_plank` | Side plank | 0 | hold_s | — | floor | gate for the human flag (60-90 s) |
| 30 | `foot_supported_l_sit` | Foot-supported L-sit | 0 | hold_s | *`support_hold`* | parallettes or dip_bars or floor |  |
| 40 | `tuck_l_sit` | Tuck L-sit | 1 | hold_s | `foot_supported_l_sit` | parallettes or dip_bars or floor | OG2 [1] |
| 50 | `hanging_knee_raise` | Hanging knee raise | 1 | reps | *`dead_hang`* | bar | unlevelled; verify |
| 60 | `l_sit` | L-sit | 2 | hold_s | `tuck_l_sit` | parallettes or dip_bars or floor | OG2 anchor [~2] |
| 70 | `toes_to_bar` | Toes-to-bar | 3 | reps | `hanging_knee_raise`, `hollow_hold` (rec.) | bar | unlevelled; verify |
| 80 | `straddle_l_sit` | Straddle L-sit | 4 | hold_s | `l_sit` | parallettes or floor | OG2 [4] |
| 90 | `v_sit` | V-sit | 6 | hold_s | `straddle_l_sit` | parallettes or floor | OG2 45° V [6] |
| 100 | `manna` | Manna | 13 | hold_s | `v_sit`, *`german_hang`* (rec.), *`pike_fold`* (rec.) | parallettes or floor | **legendary**; OG2 [13] |

## legs

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `assisted_squat` | Assisted squat | 0 | reps | — | floor | WRITTEN (example) |
| 20 | `squat` | Bodyweight squat | 1 | reps | `assisted_squat` | floor | OG2 parallel squat [1] |
| 30 | `deep_squat` | Deep squat | 2 | reps | `squat` | floor | OG2 full squat [2] |
| 40 | `split_squat` | Split squat | 2 | reps | `squat` | floor | RR order; level inferred |
| 50 | `bulgarian_split_squat` | Bulgarian split squat | 3 | reps | `split_squat` | floor or box | rear foot on a chair/box; level inferred |
| 60 | `assisted_pistol_squat` | Assisted pistol squat | 3 | reps | `bulgarian_split_squat`, `deep_squat` | floor | hold a door frame/pole; level inferred |
| 70 | `pistol_squat` | Pistol squat | 4 | reps | `assisted_pistol_squat` | floor | OG2 anchor [4] |
| 80 | `nordic_curl_negative` | Nordic curl negative | 4 | eccentric_s | `squat` | floor | feet anchored under something heavy; level inferred; trial needs reps |

## dynamic

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `kipping_swing` | Kip swing | 1 | reps | *`dead_hang`*, *`hollow_hold`* (rec.) | bar | WRITTEN (example) |
| 20 | `muscle_up_negative` | Muscle-up negative | 3 | eccentric_s | *`chest_to_bar_pull_up`*, *`parallel_bar_dip`*, `kipping_swing` | bar | OG2 MU negatives [3]; gate ~10 pull-ups, ~5 C2B, 10-15 dips; trial needs reps |
| 30 | `kipping_muscle_up` | Kipping muscle-up | 4 | reps | `muscle_up_negative` | bar | OG2 kipping MU [4] |
| 40 | `elbow_lever` | Elbow lever | 5 | hold_s | *`frog_stand`*, *`wrist_prep`* (rec.) | floor or parallettes | OG2 two-arm EL [5] |
| 50 | `tuck_human_flag` | Tuck human flag | 5 | hold_s | *`pull_up`*, *`parallel_bar_dip`*, *`side_plank`* | pole | OG2 [5]; gate 10 pull-ups, 10 dips, 60-90 s side plank; straight_arm: true |
| 60 | `straddle_human_flag` | Straddle human flag | 6 | hold_s | `tuck_human_flag` | pole | OG2 [6]; straight_arm: true |
| 70 | `human_flag` | Human flag | 6 | hold_s | `straddle_human_flag` | pole | OG2 [~6]; straight_arm: true |
| 80 | `strict_bar_muscle_up` | Strict bar muscle-up | 7 | reps | `kipping_muscle_up`, *`chest_to_bar_pull_up`* | bar | OG2 anchor [7] |

## flexibility

| order | id | name | OG | metric | prerequisites | equipment | notes |
|---|---|---|---|---|---|---|---|
| 10 | `wrist_prep` | Wrist prep routine | 0 | reps | — | floor | WRITTEN (example) |
| 20 | `shoulder_dislocate` | Band shoulder dislocate | 0 | reps | — | bands | warm-up staple (RR) |
| 30 | `pike_fold` | Pike fold | 0 | hold_s | — | floor | compression prep for L-sit/manna |
| 40 | `table_bridge` | Table bridge | 0 | hold_s | — | floor | BWF chart bridge chain |
| 50 | `full_bridge` | Full bridge | 2 | hold_s | `table_bridge`, `shoulder_dislocate` (rec.) | floor | level is our synthesis; verify |

