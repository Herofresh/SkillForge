// GENERATED FILE - DO NOT EDIT.
// Source: content/progressions/*.yaml. Rebuild with `npm run progressions:build`.
import type { ExerciseNode } from '@/domain/types';

export const GENERATED_NODES: readonly ExerciseNode[] = [
  {
    "id": "wall_push_up",
    "branch": "h_push",
    "name": "Wall push-up",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Hands on the wall at chest height, a little wider than the shoulders.",
      "Body in one straight line from head to heels; squeeze the glutes.",
      "Elbows about 45 degrees from the body, not flared out.",
      "Lower until the chest nearly touches the wall, then press all the way back."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "incline_push_up",
    "branch": "h_push",
    "name": "Incline push-up",
    "chainOrder": 20,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "wall_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "box"
      ],
      [
        "bar"
      ],
      [
        "dip_bars"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "wall_push_up",
    "cues": [
      "Hands on a raised surface; the lower the surface, the harder it gets.",
      "Body in one straight line from head to heels.",
      "Lower the chest to the edge, elbows about 45 degrees from the body."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "knee_push_up",
    "branch": "h_push",
    "name": "Knee push-up",
    "chainOrder": 30,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "incline_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "incline_push_up",
    "cues": [
      "Knees on the floor, body straight from head to knees; do not pike the hips.",
      "Hands under the shoulders, elbows about 45 degrees from the body.",
      "Chest to the floor, then press until the arms are straight."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "push_up",
    "branch": "h_push",
    "name": "Push-up",
    "chainOrder": 40,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "knee_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "knee_push_up",
    "cues": [
      "Hands under the shoulders, body in one straight line; squeeze glutes and abs.",
      "Elbows about 45 degrees from the body.",
      "Chest to the floor (or between the parallettes), then lock the arms out."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "diamond_push_up",
    "branch": "h_push",
    "name": "Diamond push-up",
    "chainOrder": 50,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "push_up",
    "cues": [
      "Hands together under the chest, thumbs and index fingers forming a diamond.",
      "Keep the elbows close to the body as you lower.",
      "Body stays in one straight line; touch the chest to the hands."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "elevated_one_arm_push_up",
    "branch": "h_push",
    "name": "Elevated one-arm push-up",
    "chainOrder": 60,
    "ogLevel": 5,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "diamond_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "box"
      ],
      [
        "bar"
      ],
      [
        "dip_bars"
      ]
    ],
    "alternatives": [],
    "regressionId": "diamond_push_up",
    "cues": [
      "One hand on a raised surface, feet wide for balance.",
      "Keep the hips and shoulders square to the surface; do not twist.",
      "Lower the chest to the hand under control, elbow close to the body."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "archer_push_up",
    "branch": "h_push",
    "name": "Archer push-up",
    "chainOrder": 70,
    "ogLevel": 6,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "diamond_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "diamond_push_up",
    "cues": [
      "Hands very wide; lower toward one hand while the other arm stays straight.",
      "The bent arm does the work; the straight arm only helps a little.",
      "Body stays in one straight line from head to heels."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "pseudo_planche_push_up",
    "branch": "h_push",
    "name": "Pseudo planche push-up",
    "chainOrder": 80,
    "ogLevel": 6,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "diamond_push_up",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "planche_lean",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Get used to leaning forward on straight arms first (planche lean, 3 x 30 s)."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "diamond_push_up",
    "cues": [
      "Hands by the waist, fingers turned out; lean the shoulders past the hands.",
      "Keep the forward lean the whole time, also at the bottom.",
      "Push the floor away (round the upper back slightly) at the top of every rep."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://themovementathlete.com/planche-requirements/"
    ],
    "verify": "OG2 level inferred: OG2 lists the rings-turned-out 40 degree PPPU at about level 6; the floor version is placed at 6 too. Check with a coach.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "support_hold",
    "branch": "v_push",
    "name": "Support hold",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "dip_bars"
      ],
      [
        "parallettes"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Arms locked straight, hands by the hips.",
      "Push the shoulders down, away from the ears.",
      "Squeeze the glutes and point the toes; slight hollow body."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "verify": "OG2 puts ring support at level 1; the easier bar/parallettes support is set to 0. The RR may use a 60 s gate instead of 3 x 30 s.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "pike_push_up",
    "branch": "v_push",
    "name": "Pike push-up",
    "chainOrder": 20,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "push_up",
        "minLevel": 5,
        "kind": "recommended",
        "note": "A solid push-up (3 x 8) first builds the pressing base."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Hips high, body in an upside-down V; hands shoulder-width.",
      "Lower the head to a spot in front of the hands (head and hands form a triangle).",
      "Elbows point back, not out; press until the arms are straight."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "dip_negative",
    "branch": "v_push",
    "name": "Dip negative",
    "chainOrder": 30,
    "ogLevel": 2,
    "metric": "eccentric_s",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5,
      "reps": 3
    },
    "prerequisites": [
      {
        "nodeId": "support_hold",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "dip_bars"
      ],
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "support_hold",
    "cues": [
      "Start at the top of a support hold, arms straight.",
      "Lower slowly and evenly until the shoulders are just below the elbows.",
      "Step or jump back to the top; do not press up."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "verify": "OG2 levels the negative on dip bars/rings; the straight-bar option (Home profile) is our addition and is somewhat harder on the shoulders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "elevated_pike_push_up",
    "branch": "v_push",
    "name": "Elevated pike push-up",
    "chainOrder": 40,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "pike_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "box"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "pike_push_up",
    "cues": [
      "Feet on a chair or box, hips stacked as high over the hands as you can.",
      "Lower the head to a spot in front of the hands, elbows pointing back.",
      "The higher the feet, the harder it gets; press to straight arms."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "parallel_bar_dip",
    "branch": "v_push",
    "name": "Parallel bar dip",
    "chainOrder": 50,
    "ogLevel": 3,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "dip_negative",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "dip_bars"
      ]
    ],
    "alternatives": [
      "straight_bar_dip"
    ],
    "regressionId": "dip_negative",
    "cues": [
      "Start in a support hold, shoulders down.",
      "Lower until the shoulders are just below the elbows; lean slightly forward.",
      "Press back to straight arms without shrugging."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straight_bar_dip",
    "branch": "v_push",
    "name": "Straight bar dip",
    "chainOrder": 55,
    "ogLevel": 3,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "dip_negative",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "dip_bars"
      ]
    ],
    "alternatives": [
      "parallel_bar_dip"
    ],
    "regressionId": "dip_negative",
    "cues": [
      "Support on top of the bar, arms straight, bar at the hips.",
      "Lean the chest over the bar and lower until the bar touches the upper belly.",
      "Press back to straight arms; keep the legs slightly in front to balance."
    ],
    "sourceUrls": [
      "https://bodyproskills.com/articles/muscle-up-prerequisites/",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "Not in the OG2 chart printout; level 3 is copied from parallel bar dips. The 3 x 8 trial follows the RR rep rule. Added by the integrator so Home users have a dip (not in the original node manifest).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "wall_headstand_push_up",
    "branch": "v_push",
    "name": "Wall headstand push-up",
    "chainOrder": 60,
    "ogLevel": 4,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "elevated_pike_push_up",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "wall_handstand",
        "minLevel": 5,
        "kind": "hard",
        "note": "Hold a wall handstand calmly (3 x 30 s) before pressing upside down."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "regressionId": "elevated_pike_push_up",
    "cues": [
      "Kick up to a handstand facing away from the wall, hands a hand-length from it.",
      "Lower until the head touches the floor, with head and hands forming a triangle.",
      "Squeeze the glutes and abs so the back does not arch; press to straight arms."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "wall_handstand_push_up",
    "branch": "v_push",
    "name": "Wall handstand push-up (full range)",
    "chainOrder": 70,
    "ogLevel": 5,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "wall_headstand_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "wall",
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "wall_headstand_push_up",
    "cues": [
      "Hands on parallettes by the wall, so the head can go below the hands.",
      "Lower until the shoulders are near the hands, elbows pointing forward.",
      "Press all the way up and push the shoulders to the ears at the top."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "freestanding_handstand_push_up",
    "branch": "v_push",
    "name": "Freestanding handstand push-up",
    "chainOrder": 80,
    "ogLevel": 7,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "wall_handstand_push_up",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "freestanding_handstand",
        "minLevel": 5,
        "kind": "hard",
        "note": "You need a steady freestanding handstand (about 30-60 s) to press in balance."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "vertical_push",
      "balance"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "wall_handstand_push_up",
    "cues": [
      "Start from a steady freestanding handstand.",
      "Lower slowly with the fingers gripping the floor to keep balance.",
      "Keep the body tight and press straight up to lockout."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://gmb.io/freestanding-handstand/"
    ],
    "verify": "OG2 level: the chart puts freestanding HSPU at about 6-7; set to 7 here. The 3 x 8 trial is the RR rep standard and may be high for this skill. Check with a coach.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "dead_hang",
    "branch": "v_pull",
    "name": "Dead hang",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Full grip with the thumb wrapped around the bar.",
      "Arms straight; keep the shoulders gently engaged, not fully shrugged.",
      "Ribs down, legs together, no swinging."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "Not levelled in the OG2 chart (0 assumed); the 3 x 30 s gate follows the RR hold rule.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "scapular_pull",
    "branch": "v_pull",
    "name": "Scapular pull",
    "chainOrder": 20,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "dead_hang",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Hang with straight arms, then pull the shoulders down away from the ears.",
      "Arms stay straight the whole time; only the shoulder blades move.",
      "Pause at the top, then lower slowly back to a full hang."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb"
    ],
    "verify": "Not levelled in the OG2 chart (0 assumed).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "jump_pull_up",
    "branch": "v_pull",
    "name": "Jumping pull-up",
    "chainOrder": 30,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "scapular_pull",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Jump to bring the chin over the bar, using the legs only as much as needed.",
      "Lower yourself slowly to a full hang.",
      "A band-assisted pull-up is a fine substitute."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "pull_up_negative",
    "branch": "v_pull",
    "name": "Pull-up negative",
    "chainOrder": 40,
    "ogLevel": 2,
    "metric": "eccentric_s",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5,
      "reps": 3
    },
    "prerequisites": [
      {
        "nodeId": "jump_pull_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Start with the chin over the bar (jump or step up).",
      "Lower slowly and evenly until the arms are fully straight.",
      "Keep the body tight; do not drop through the last part."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "The 3 x 3 x 5 s trial is a placeholder based on the eccentric guidance, not a published standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "pull_up",
    "branch": "v_pull",
    "name": "Pull-up",
    "chainOrder": 50,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "pull_up_negative",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "pull_up_negative",
    "cues": [
      "Start from a dead hang, arms fully straight.",
      "Pull until the chin is clearly over the bar.",
      "No kipping; keep the legs still and the body slightly hollow."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "chest_to_bar_pull_up",
    "branch": "v_pull",
    "name": "Chest-to-bar pull-up",
    "chainOrder": 60,
    "ogLevel": 4,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "pull_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "pull_up",
    "cues": [
      "Pull hard and fast until the chest touches the bar.",
      "Drive the elbows down and back; lean back slightly at the top.",
      "Lower under control to a full hang."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://bodyproskills.com/articles/muscle-up-prerequisites/"
    ],
    "verify": "Not levelled in OG2 (placed next to the L-pull-up at level 4); 4 is inferred.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "archer_pull_up",
    "branch": "v_pull",
    "name": "Archer pull-up",
    "chainOrder": 70,
    "ogLevel": 6,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "chest_to_bar_pull_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "chest_to_bar_pull_up",
    "cues": [
      "Wide grip; pull towards one hand while the other arm stays nearly straight.",
      "Count reps per side and alternate sides.",
      "Lower slowly; do not let the working shoulder shrug up."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb"
    ],
    "verify": "OG2 gives archer/typewriter pull-ups as ~6 (approximate).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "one_arm_chin_up_negative",
    "branch": "v_pull",
    "name": "One-arm chin-up negative",
    "chainOrder": 80,
    "ogLevel": 7,
    "metric": "eccentric_s",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5,
      "reps": 3
    },
    "prerequisites": [
      {
        "nodeId": "archer_pull_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "archer_pull_up",
    "cues": [
      "Get the chin over the bar with both arms, then let go with one hand.",
      "Lower slowly with the palm facing you; fight the rotation.",
      "Stop the set when you can no longer control the bottom half."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "verify": "OG2 gives OAC negatives as ~7 (approximate); the 3 x 3 x 5 s trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "one_arm_chin_up",
    "branch": "v_pull",
    "name": "One-arm chin-up",
    "chainOrder": 90,
    "ogLevel": 9,
    "metric": "reps",
    "workingRange": {
      "min": 1,
      "max": 3
    },
    "trial": {
      "sets": 3,
      "target": 3
    },
    "prerequisites": [
      {
        "nodeId": "one_arm_chin_up_negative",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "one_arm_chin_up_negative",
    "legendary": true,
    "cues": [
      "Palm facing you; start from a full hang with the other hand free.",
      "Pull the chin over the bar without twisting away from it.",
      "Keep the free hand off the working arm and the bar."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://stevenlow.org/overcoming-gravity/"
    ],
    "verify": "The 1-3 rep range and 3 x 3 trial are placeholders (OG2 levels the skill, not a rep standard). A weighted pull-up of about 1.5 x bodyweight is a common extra gate.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "band_row",
    "branch": "h_pull",
    "name": "Band row",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_pull"
    ],
    "equipment": [
      [
        "bands"
      ]
    ],
    "alternatives": [
      "incline_row"
    ],
    "cues": [
      "Anchor the band at chest height (door anchor or bar); step back until it is tight.",
      "Pull the hands to the lower ribs, elbows close to the body.",
      "Squeeze the shoulder blades together, then return slowly."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "Not on the OG2 chart; level 0 and the 3 x 8 standard are placeholders. Band tension varies, so a coach should say how strong a band counts.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "incline_row",
    "branch": "h_pull",
    "name": "Incline row",
    "chainOrder": 20,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [
      "band_row"
    ],
    "cues": [
      "Feet on the floor, body straight and leaning back; the more upright, the easier.",
      "Pull the chest to the hands, elbows about 45 degrees from the body.",
      "Squeeze the shoulder blades together at the top, lower under control."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "horizontal_row",
    "branch": "h_pull",
    "name": "Horizontal row",
    "chainOrder": 30,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "incline_row",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "incline_row",
    "cues": [
      "Body horizontal, heels on the floor (or on a box), arms straight.",
      "Keep a straight line from head to heels; do not let the hips sag.",
      "Pull the chest to the hands, then lower all the way to straight arms."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "archer_row",
    "branch": "h_pull",
    "name": "Archer row",
    "chainOrder": 40,
    "ogLevel": 4,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "horizontal_row",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "horizontal_row",
    "cues": [
      "Hands wide; pull toward one hand while the other arm stays straight out.",
      "The bent arm does the work; the straight arm only helps a little.",
      "Body stays straight and does not twist."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "tuck_front_lever_row",
    "branch": "h_pull",
    "name": "Tuck front lever row",
    "chainOrder": 50,
    "ogLevel": 5,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "archer_row",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Archer rows (3 x 8 per side) build the pulling strength for lever rows."
      },
      {
        "nodeId": "tuck_front_lever",
        "minLevel": 5,
        "kind": "hard",
        "note": "Hold the tuck front lever (3 x 30 s) before rowing in it."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "archer_row",
    "cues": [
      "Start in a tuck front lever, arms straight, back flat.",
      "Pull the bar or rings to the lower chest while keeping the body horizontal.",
      "Lower back to straight arms without dropping the hips."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straddle_one_arm_row",
    "branch": "h_pull",
    "name": "Straddle one-arm row",
    "chainOrder": 60,
    "ogLevel": 6,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "archer_row",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "horizontal_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "archer_row",
    "cues": [
      "Feet wide apart for balance, one hand on the ring or bar.",
      "Keep the hips and shoulders square; do not rotate open.",
      "Pull the chest to the hand, then lower to a straight arm under control."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "tuck_front_lever",
    "branch": "front_lever",
    "name": "Tuck front lever",
    "chainOrder": 10,
    "ogLevel": 4,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "pull_up",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 8-15 strict pull-ups before front lever work."
      },
      {
        "nodeId": "dead_hang",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "hollow_hold",
        "minLevel": 5,
        "kind": "hard",
        "note": "A 30 s hollow hold is the common front lever gate."
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Arms locked straight; pull the bar down towards the hips.",
      "Shoulder blades pulled down and slightly back.",
      "Knees tucked to the chest, back rounded, hips level with the shoulders."
    ],
    "sourceUrls": [
      "https://www.calisthenics-corner.com/skills/front-lever/",
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "advanced_tuck_front_lever",
    "branch": "front_lever",
    "name": "Advanced tuck front lever",
    "chainOrder": 20,
    "ogLevel": 4,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "tuck_front_lever",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_front_lever",
    "cues": [
      "Open the hips so the thighs are about 90 degrees to the body.",
      "Flatten the back; no rounding like in the tuck.",
      "Keep the hips level with the shoulders, arms locked."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-corner.com/skills/front-lever/"
    ],
    "verify": "OG2 level ~4 is inferred from the chart layout.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "one_leg_front_lever",
    "branch": "front_lever",
    "name": "One-leg front lever",
    "chainOrder": 30,
    "ogLevel": 6,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "advanced_tuck_front_lever",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "advanced_tuck_front_lever",
    "cues": [
      "One leg straight out in line with the body, the other tucked.",
      "Squeeze the glutes; do not let the hips pike or sag.",
      "Switch the extended leg between sets."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-corner.com/skills/front-lever/"
    ],
    "verify": "OG2 level ~6 is inferred; OG2 lists the one-leg / half-lay FL next to the straddle FL, so the order of these two may be swapped.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straddle_front_lever",
    "branch": "front_lever",
    "name": "Straddle front lever",
    "chainOrder": 40,
    "ogLevel": 6,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "one_leg_front_lever",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "one_leg_front_lever",
    "cues": [
      "Legs straight and spread wide; the wider, the easier.",
      "Body in one line from shoulders to hips, parallel to the floor.",
      "Arms locked, shoulders pulled down."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "front_lever",
    "branch": "front_lever",
    "name": "Front lever",
    "chainOrder": 50,
    "ogLevel": 7,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "straddle_front_lever",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "bar"
      ],
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "straddle_front_lever",
    "cues": [
      "Legs together and straight, toes pointed.",
      "Whole body horizontal and rigid, a slight hollow.",
      "Arms locked; pull the bar towards the hips."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/",
      "https://en.wikipedia.org/wiki/Front_lever"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "german_hang",
    "branch": "back_lever",
    "name": "German hang",
    "chainOrder": 10,
    "ogLevel": 1,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "dead_hang",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": false,
    "patterns": [
      "straight_arm_pull",
      "mobility"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Go slowly; tuck the knees and rotate backwards from a tuck hang.",
      "Stop at a gentle stretch in the front of the shoulders, never at pain.",
      "Keep the arms straight and leave the same way you came in."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/connective-tissue-basics/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "skin_the_cat",
    "branch": "back_lever",
    "name": "Skin the cat",
    "chainOrder": 20,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "german_hang",
        "minLevel": 5,
        "kind": "hard",
        "note": "German hang comfortable for 30-60 s."
      }
    ],
    "straightArm": true,
    "isSkill": false,
    "patterns": [
      "straight_arm_pull",
      "mobility"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "german_hang",
    "cues": [
      "Tuck and roll back through into the German hang, then return.",
      "Move slowly and under control; no swinging.",
      "Arms stay straight the whole time."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "No source gives a rep standard; 3 x 8 is the RR default and may be high for this move.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "tuck_back_lever",
    "branch": "back_lever",
    "name": "Tuck back lever",
    "chainOrder": 30,
    "ogLevel": 2,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "skin_the_cat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "skin_the_cat",
    "cues": [
      "Enter from the skin the cat and stop with the body facing down.",
      "Knees tucked, hips level with the shoulders.",
      "Arms locked; keep the shoulders pressed down."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://antranik.org/connective-tissue-basics/"
    ],
    "verify": "OG2 level ~2 is inferred from the chart layout.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "advanced_tuck_back_lever",
    "branch": "back_lever",
    "name": "Advanced tuck back lever",
    "chainOrder": 40,
    "ogLevel": 4,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "tuck_back_lever",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_back_lever",
    "cues": [
      "Open the hips so the thighs are about 90 degrees to the body.",
      "Flat back, hips level with the shoulders.",
      "Arms locked; ease in, the biceps tendon takes the load."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://antranik.org/connective-tissue-basics/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straddle_back_lever",
    "branch": "back_lever",
    "name": "Straddle back lever",
    "chainOrder": 50,
    "ogLevel": 5,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "advanced_tuck_back_lever",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "advanced_tuck_back_lever",
    "cues": [
      "Legs straight and spread wide.",
      "Body in one line, parallel to the floor, glutes squeezed.",
      "Arms locked, shoulders pressed down."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "back_lever",
    "branch": "back_lever",
    "name": "Back lever",
    "chainOrder": 60,
    "ogLevel": 6,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "straddle_back_lever",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull"
    ],
    "equipment": [
      [
        "rings"
      ],
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "straddle_back_lever",
    "cues": [
      "Legs together and straight, toes pointed.",
      "Body straight and horizontal, no arch in the lower back.",
      "Arms locked; keep the chest from dropping below the hips."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "verify": "OG2 level ~6 is inferred from the chart layout.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "iron_cross",
    "branch": "back_lever",
    "name": "Iron cross",
    "chainOrder": 70,
    "ogLevel": 10,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "back_lever",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "support_hold",
        "minLevel": 5,
        "kind": "hard",
        "note": "A solid ring support hold (rings turned out) is needed first."
      },
      {
        "nodeId": "front_lever",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Build straight-arm strength slowly; the cross carries an elbow tendinitis risk."
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push"
    ],
    "equipment": [
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "back_lever",
    "legendary": true,
    "cues": [
      "Arms straight and out to the sides, body vertical below the rings.",
      "Press the rings down; keep the shoulders from shrugging up.",
      "Never rush it; stop at any elbow pain."
    ],
    "sourceUrls": [
      "https://stevenlow.org/ironcross/",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://en.wikipedia.org/wiki/Iron_cross_(gymnastics)"
    ],
    "verify": "The 3 x 15 s trial is a placeholder (advanced-hold rule); no source gives a cross standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "planche_lean",
    "branch": "planche",
    "name": "Planche lean",
    "chainOrder": 10,
    "ogLevel": 2,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "push_up",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 3 x 20 push-ups before planche work."
      },
      {
        "nodeId": "wrist_prep",
        "minLevel": 5,
        "kind": "hard",
        "note": "4-6 weeks of wrist prep before planche work."
      },
      {
        "nodeId": "support_hold",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Push-up position, fingers turned slightly out, arms locked.",
      "Push the floor away (shoulders protracted) and keep a slight hollow.",
      "Lean forward until the shoulders are past the hands; lean further to progress."
    ],
    "sourceUrls": [
      "https://themovementathlete.com/planche-requirements/",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/connective-tissue-basics/"
    ],
    "verify": "OG2 gives no level for the lean; 2 is inferred (below the level-3 frog stand).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straight_arm_frog_stand",
    "branch": "planche",
    "name": "Straight-arm frog stand",
    "chainOrder": 20,
    "ogLevel": 4,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "planche_lean",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "frog_stand",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push",
      "balance"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "planche_lean",
    "cues": [
      "Knees rest on the outside of the straight arms.",
      "Lean forward until the feet lift; arms stay locked.",
      "Push the floor away, back rounded."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://antranik.org/connective-tissue-basics/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "tuck_planche",
    "branch": "planche",
    "name": "Tuck planche",
    "chainOrder": 30,
    "ogLevel": 5,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "straight_arm_frog_stand",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "pseudo_planche_push_up",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Builds the forward lean strength for the planche."
      },
      {
        "nodeId": "wall_handstand",
        "minLevel": 5,
        "kind": "recommended",
        "note": "About 30 s wall handstand."
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "straight_arm_frog_stand",
    "cues": [
      "Knees tucked to the chest, feet off the floor, arms locked.",
      "Round the back and push the floor away.",
      "Hips at shoulder height; lean the shoulders past the hands."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://themovementathlete.com/planche-requirements/",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "advanced_tuck_planche",
    "branch": "planche",
    "name": "Advanced tuck planche",
    "chainOrder": 40,
    "ogLevel": 6,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "tuck_planche",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_planche",
    "cues": [
      "Flatten the back; hips move back and level with the shoulders.",
      "Knees stay bent but move away from the chest.",
      "Arms locked, shoulders protracted."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://antranik.org/connective-tissue-basics/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straddle_planche",
    "branch": "planche",
    "name": "Straddle planche",
    "chainOrder": 50,
    "ogLevel": 7,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "advanced_tuck_planche",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "advanced_tuck_planche",
    "cues": [
      "Legs straight and spread wide, body parallel to the floor.",
      "Arms locked, shoulders protracted and leaning past the hands.",
      "Squeeze the glutes; no sag in the hips."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "full_planche",
    "branch": "planche",
    "name": "Full planche",
    "chainOrder": 60,
    "ogLevel": 10,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "straddle_planche",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "straddle_planche",
    "legendary": true,
    "cues": [
      "Legs together and straight, whole body horizontal.",
      "Arms locked, shoulders well past the hands.",
      "Keep a slight hollow; no arch in the lower back."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "verify": "OG2 level ~10 is inferred from the chart layout.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "wall_plank",
    "branch": "handstand",
    "name": "Wall plank",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "wrist_prep",
        "minLevel": 5,
        "kind": "recommended"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "vertical_push"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Start in a push-up position with the feet against the wall.",
      "Walk the feet up the wall until the body forms an L (hips over the shoulders).",
      "Push tall through the shoulders; arms straight, head between the arms."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://gmb.io/handstand/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "wall_handstand",
    "branch": "handstand",
    "name": "Wall handstand (back to wall)",
    "chainOrder": 20,
    "ogLevel": 1,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "wall_plank",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "pike_push_up",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Builds the shoulder strength to hold bodyweight overhead."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "vertical_push"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "regressionId": "wall_plank",
    "cues": [
      "Kick up with your back to the wall, hands a hand-width from it.",
      "Arms locked, push tall through the shoulders.",
      "Ribs in, glutes squeezed; try to touch the wall only with the heels."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://gmb.io/handstand/"
    ],
    "verify": "OG2 gives level 1-2; 1 is used.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "chest_to_wall_handstand",
    "branch": "handstand",
    "name": "Chest-to-wall handstand",
    "chainOrder": 30,
    "ogLevel": 2,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "wall_handstand",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "vertical_push"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "regressionId": "wall_handstand",
    "cues": [
      "Walk the feet up the wall until the chest and toes face it, hands close to the wall.",
      "Straight line from wrists to toes; ribs in, no banana back.",
      "Shoulders pushed up by the ears, fingers active to balance."
    ],
    "sourceUrls": [
      "https://gmb.io/freestanding-handstand/",
      "https://gmb.io/handstand/",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "Not levelled in OG2 (2 inferred between wall HS and freestanding HS).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "frog_stand",
    "branch": "handstand",
    "name": "Frog stand (crow)",
    "chainOrder": 40,
    "ogLevel": 3,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "wrist_prep",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Hands shoulder-width apart, knees resting on the backs of the bent elbows.",
      "Lean forward slowly until the feet lift.",
      "Look slightly ahead, not straight down."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "freestanding_handstand",
    "branch": "handstand",
    "name": "Freestanding handstand",
    "chainOrder": 50,
    "ogLevel": 4,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "chest_to_wall_handstand",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 3 x 20-30 s chest-to-wall first (GMB)."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "vertical_push"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "chest_to_wall_handstand",
    "cues": [
      "Kick up gently and find the stack of wrists, shoulders, hips and feet.",
      "Balance with the fingers (press to stop falling over, relax to stop falling back).",
      "Learn to bail safely first (cartwheel out or step down)."
    ],
    "sourceUrls": [
      "https://gmb.io/freestanding-handstand/",
      "https://gmb.io/handstand/",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "verify": "OG2 gives level 4-5; 4 is used. GMB's common gate is about 60 s; the 3 x 30 s trial follows the RR hold rule.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "wall_straddle_press_eccentric",
    "branch": "handstand",
    "name": "Wall straddle press eccentric",
    "chainOrder": 60,
    "ogLevel": 5,
    "metric": "eccentric_s",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5,
      "reps": 3
    },
    "prerequisites": [
      {
        "nodeId": "chest_to_wall_handstand",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "l_sit",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Compression strength helps control the lowering."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "straight_arm_push",
      "core"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "regressionId": "chest_to_wall_handstand",
    "cues": [
      "From a handstand with the heels on the wall, open the legs wide.",
      "Lower the legs slowly to the floor, shoulders leaning forward over the hands.",
      "Arms stay straight; count the seconds of the lowering."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straddle_press_to_handstand",
    "branch": "handstand",
    "name": "Straddle press to handstand",
    "chainOrder": 70,
    "ogLevel": 7,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 6
    },
    "trial": {
      "sets": 3,
      "target": 5
    },
    "prerequisites": [
      {
        "nodeId": "wall_straddle_press_eccentric",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "freestanding_handstand",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "straddle_l_sit",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "straight_arm_push",
      "core"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "regressionId": "wall_straddle_press_eccentric",
    "cues": [
      "Start standing in a wide straddle, hands on the floor close to the feet.",
      "Shift the shoulders forward over the hands until the feet float.",
      "Lift the hips over the shoulders, then bring the legs together."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://stevenlow.org/the-fundamentals-of-bodyweight-strength-training/"
    ],
    "verify": "No rep standard in the sources; 3 x 5 follows Steven Low's strength rule (advance past 5-6 reps) and is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "one_arm_handstand",
    "branch": "handstand",
    "name": "One-arm handstand",
    "chainOrder": 80,
    "ogLevel": 10,
    "metric": "hold_s",
    "workingRange": {
      "min": 8,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "freestanding_handstand",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 60 s freestanding handstand first (GMB)."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "vertical_push"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "freestanding_handstand",
    "legendary": true,
    "cues": [
      "Shift the weight onto one hand while the body stays in one straight line.",
      "Open the legs to a straddle for balance at first.",
      "Balance through the fingers and the shoulder of the support arm."
    ],
    "sourceUrls": [
      "https://gmb.io/handstand/",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "verify": "The 3 x 15 s trial is a placeholder (advanced-hold rule); no source gives a one-arm HS standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "hollow_hold",
    "branch": "core",
    "name": "Hollow body hold",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Lower back pressed into the floor the whole time.",
      "Arms overhead and legs straight, both just off the floor.",
      "Make it easier by tucking the knees or bringing the arms to the sides."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://antranik.org/progressions/"
    ],
    "verify": "Not levelled in the OG2 chart; 0 is assumed.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "side_plank",
    "branch": "core",
    "name": "Side plank",
    "chainOrder": 20,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 60
    },
    "trial": {
      "sets": 3,
      "target": 60
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Elbow under the shoulder, body in one straight line from head to feet.",
      "Lift the hips; don't let them sag or pike back.",
      "Train both sides. Make it easier by resting on the bottom knee."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://bodyproskills.com/articles/human-flag-prerequisites/"
    ],
    "verify": "Not levelled in the OG2 chart; 0 is assumed. The 60 s target comes from the human flag gate (60-90 s side plank, secondary source), not from a side plank standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "foot_supported_l_sit",
    "branch": "core",
    "name": "Foot-supported L-sit",
    "chainOrder": 30,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "support_hold",
        "minLevel": 5,
        "kind": "hard",
        "note": "Hold a straight-arm support for 3 x 30 s first."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "trains": [
      "core",
      "push"
    ],
    "equipment": [
      [
        "parallettes"
      ],
      [
        "dip_bars"
      ],
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "support_hold",
    "cues": [
      "Arms locked, shoulders pushed down away from the ears.",
      "Heels stay on the floor and carry only as much weight as needed.",
      "Lift the hips off the floor and keep the chest up."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "Not levelled in the OG2 chart; 0 is assumed.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "tuck_l_sit",
    "branch": "core",
    "name": "Tuck L-sit",
    "chainOrder": 40,
    "ogLevel": 1,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "foot_supported_l_sit",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "trains": [
      "core",
      "push"
    ],
    "equipment": [
      [
        "parallettes"
      ],
      [
        "dip_bars"
      ],
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "foot_supported_l_sit",
    "cues": [
      "Arms locked, shoulders pushed down.",
      "Knees pulled up to the chest, feet off the floor.",
      "Keep the hips level with or slightly in front of the hands."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "hanging_knee_raise",
    "branch": "core",
    "name": "Hanging knee raise",
    "chainOrder": 50,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 8,
      "max": 12
    },
    "trial": {
      "sets": 3,
      "target": 12
    },
    "prerequisites": [
      {
        "nodeId": "dead_hang",
        "minLevel": 5,
        "kind": "hard",
        "note": "Hang from the bar for 3 x 30 s first."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Start from a still dead hang; no swinging.",
      "Curl the pelvis up and bring the knees to the chest.",
      "Lower slowly under control."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "Not levelled in the OG2 chart; level 1 is inferred. Uses the RR core range 3 x 8-12.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "l_sit",
    "branch": "core",
    "name": "L-sit",
    "chainOrder": 60,
    "ogLevel": 2,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "tuck_l_sit",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "trains": [
      "core",
      "push"
    ],
    "equipment": [
      [
        "parallettes"
      ],
      [
        "dip_bars"
      ],
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_l_sit",
    "cues": [
      "Legs straight and together, level with the floor.",
      "Lock the knees and point the toes.",
      "Arms locked, shoulders pushed down, chest up."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "OG2 places the L-sit at about level 2 (approximate anchor).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "toes_to_bar",
    "branch": "core",
    "name": "Toes-to-bar",
    "chainOrder": 70,
    "ogLevel": 3,
    "metric": "reps",
    "workingRange": {
      "min": 8,
      "max": 12
    },
    "trial": {
      "sets": 3,
      "target": 12
    },
    "prerequisites": [
      {
        "nodeId": "hanging_knee_raise",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "hollow_hold",
        "minLevel": 5,
        "kind": "recommended",
        "note": "A solid hollow body stops the swing."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "hanging_knee_raise",
    "cues": [
      "Start from a still dead hang, legs together.",
      "Keep the legs as straight as you can and touch the bar with the toes.",
      "Lower slowly; don't swing into the next rep."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "Not levelled in the OG2 chart; level 3 is inferred. Uses the RR core range 3 x 8-12.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straddle_l_sit",
    "branch": "core",
    "name": "Straddle L-sit",
    "chainOrder": 80,
    "ogLevel": 4,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "l_sit",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "core"
    ],
    "trains": [
      "core",
      "push"
    ],
    "equipment": [
      [
        "parallettes"
      ],
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "l_sit",
    "cues": [
      "Legs straight and wide, hands on the floor between the legs.",
      "Lean the shoulders forward over the hands to lift the hips.",
      "Squeeze the legs up; the heels must not touch the floor."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "The 3 x 30 s trial follows the general RR hold rule; there is no straddle-specific standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "v_sit",
    "branch": "core",
    "name": "V-sit",
    "chainOrder": 90,
    "ogLevel": 6,
    "metric": "hold_s",
    "workingRange": {
      "min": 5,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "straddle_l_sit",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "core"
    ],
    "trains": [
      "core",
      "push"
    ],
    "equipment": [
      [
        "parallettes"
      ],
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "straddle_l_sit",
    "cues": [
      "Legs straight and raised about 45 degrees above horizontal.",
      "Push the floor away and let the shoulders move back behind the hands.",
      "Keep the knees locked; drop back to a straddle L-sit if the legs sink."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/"
    ],
    "verify": "This is the OG2 45 degree V-sit [6]. The 3 x 15 s trial uses Antranik's ~15 s gate for advanced holds; there is no V-sit-specific standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "manna",
    "branch": "core",
    "name": "Manna",
    "chainOrder": 100,
    "ogLevel": 13,
    "metric": "hold_s",
    "workingRange": {
      "min": 3,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "v_sit",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "german_hang",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Needs a lot of shoulder extension; German hang comfortable for 30-60 s."
      },
      {
        "nodeId": "pike_fold",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Needs a deep pike to fold the legs up to the face."
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "core"
    ],
    "trains": [
      "core",
      "push"
    ],
    "equipment": [
      [
        "parallettes"
      ],
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "v_sit",
    "legendary": true,
    "cues": [
      "Hands behind the hips, arms locked.",
      "Push the shoulders back into extension and lift the hips high.",
      "Legs straight and folded up towards the face."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://antranik.org/ssc/"
    ],
    "verify": "OG2 gates the manna behind the 170 degree V-sit [8]. The V-sit stages between 45 and 170 degrees are not modelled yet, so the jump from v_sit [6] is large. The trial is a placeholder (~15 s advanced hold, Antranik).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "assisted_squat",
    "branch": "legs",
    "name": "Assisted squat",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "squat"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Hold something sturdy in front of you and use it only as much as needed.",
      "Feet shoulder width, toes slightly out, knees track over the toes.",
      "Sit down between the heels as deep as you can with a neutral back."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "squat",
    "branch": "legs",
    "name": "Bodyweight squat",
    "chainOrder": 20,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "assisted_squat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "squat"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "assisted_squat",
    "cues": [
      "Feet shoulder width, toes slightly out.",
      "Sit down until the thighs are at least parallel to the floor.",
      "Knees track over the toes, heels stay down, chest up."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "deep_squat",
    "branch": "legs",
    "name": "Deep squat",
    "chainOrder": 30,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "squat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "squat"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "squat",
    "cues": [
      "Go all the way down, hips well below the knees.",
      "Heels stay flat on the floor the whole time.",
      "Keep the back neutral at the bottom; stand up without bouncing."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "split_squat",
    "branch": "legs",
    "name": "Split squat",
    "chainOrder": 40,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "squat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "squat"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "squat",
    "cues": [
      "Long stance, one foot forward, back heel up.",
      "Lower straight down until the back knee almost touches the floor.",
      "Front knee tracks over the toes; torso stays upright."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb"
    ],
    "verify": "Order follows the RR squat progression; the OG2 level is inferred.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "bulgarian_split_squat",
    "branch": "legs",
    "name": "Bulgarian split squat",
    "chainOrder": 50,
    "ogLevel": 3,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "split_squat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "squat"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "box"
      ]
    ],
    "alternatives": [],
    "regressionId": "split_squat",
    "cues": [
      "Rear foot up on a chair or box behind you.",
      "Lower until the front thigh is about parallel to the floor.",
      "Push up through the whole front foot; keep the hips square."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb"
    ],
    "verify": "Order follows the RR squat progression; the OG2 level is inferred.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "assisted_pistol_squat",
    "branch": "legs",
    "name": "Assisted pistol squat",
    "chainOrder": 60,
    "ogLevel": 3,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "bulgarian_split_squat",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "deep_squat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "squat"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "bulgarian_split_squat",
    "cues": [
      "Stand on one leg and hold a door frame or pole lightly.",
      "Other leg straight out in front, off the floor.",
      "Squat all the way down and up, using the hands as little as possible."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb"
    ],
    "verify": "Order follows the RR squat progression; the OG2 level is inferred.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "pistol_squat",
    "branch": "legs",
    "name": "Pistol squat",
    "chainOrder": 70,
    "ogLevel": 4,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "assisted_pistol_squat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "squat"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "assisted_pistol_squat",
    "cues": [
      "Stand on one leg, other leg straight out in front.",
      "Squat all the way down with the heel flat; reach the arms forward for balance.",
      "Stand up without bouncing or letting the knee cave in."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "nordic_curl_negative",
    "branch": "legs",
    "name": "Nordic curl negative",
    "chainOrder": 80,
    "ogLevel": 4,
    "metric": "eccentric_s",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5,
      "reps": 3
    },
    "prerequisites": [
      {
        "nodeId": "squat",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "hinge"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Kneel with the heels anchored and the body straight from knees to head.",
      "Lower forward as slowly as you can, hips stay extended.",
      "Catch yourself with the hands and push back up to the start."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/"
    ],
    "verify": "The OG2 level is inferred. The trial follows Steven Low's eccentric guide (2-3 sets of 2-3 reps at 3-5 s); there is no Nordic-specific standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "kipping_swing",
    "branch": "dynamic",
    "name": "Kip swing",
    "chainOrder": 10,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 10
    },
    "trial": {
      "sets": 3,
      "target": 10
    },
    "prerequisites": [
      {
        "nodeId": "dead_hang",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "hollow_hold",
        "minLevel": 5,
        "kind": "recommended"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "explosive",
      "vertical_pull"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "cues": [
      "From a dead hang, push the chest through into an arch, then pull back into a hollow.",
      "Arms stay straight; the swing comes from the shoulders and hips, not the legs.",
      "Keep the swing small and controlled before making it bigger."
    ],
    "sourceUrls": [
      "https://wodprep.com/blog/bar-muscle-up-progression-pull-up/",
      "http://www.startbodyweight.com/2014/01/muscle-up-progression.html"
    ],
    "verify": "Not levelled in OG2 (the kip pull-up is level 2); 1 is inferred. The rep standard is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "muscle_up_negative",
    "branch": "dynamic",
    "name": "Muscle-up negative",
    "chainOrder": 20,
    "ogLevel": 3,
    "metric": "eccentric_s",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5,
      "reps": 3
    },
    "prerequisites": [
      {
        "nodeId": "kipping_swing",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "chest_to_bar_pull_up",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 10 strict pull-ups and 5 explosive chest-to-bar pull-ups."
      },
      {
        "nodeId": "straight_bar_dip",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 10-15 dips. The top of a bar muscle-up is a deep straight-bar dip, so this gate uses the straight-bar dip (which also works at home); parallel bar dips build the same base."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "vertical_pull",
      "vertical_push"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "chest_to_bar_pull_up",
    "cues": [
      "Start in the top support above the bar (jump or use a box).",
      "Lower through the dip, then slowly through the transition to a hang.",
      "Keep the bar close to the body the whole way down."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://stevenlow.org/prilepin-tables-for-bodyweight-strength-isometric-and-eccentric-exercises/",
      "https://bodyproskills.com/articles/muscle-up-prerequisites/",
      "https://wodprep.com/blog/bar-muscle-up-progression-pull-up/"
    ],
    "verify": "The 3 x 3 x 5 s trial is a placeholder; the pull-up and dip gates come from secondary coaching sites.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "kipping_muscle_up",
    "branch": "dynamic",
    "name": "Kipping muscle-up",
    "chainOrder": 30,
    "ogLevel": 4,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5
    },
    "prerequisites": [
      {
        "nodeId": "muscle_up_negative",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "vertical_pull",
      "vertical_push",
      "explosive"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "muscle_up_negative",
    "cues": [
      "Use the kip swing, then pull the bar towards the hips, not the chin.",
      "Bring the chest over the bar quickly and press out to straight arms.",
      "Both arms go over together; no chicken-wing (one arm at a time)."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://wodprep.com/blog/bar-muscle-up-progression-pull-up/",
      "http://www.startbodyweight.com/2014/01/muscle-up-progression.html"
    ],
    "verify": "The 3-5 rep range and 3 x 5 trial are placeholders, not a published standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "elbow_lever",
    "branch": "dynamic",
    "name": "Elbow lever",
    "chainOrder": 40,
    "ogLevel": 5,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "frog_stand",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "wrist_prep",
        "minLevel": 5,
        "kind": "recommended",
        "note": "The wrists carry the whole body in a bent position."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "core"
    ],
    "equipment": [
      [
        "floor"
      ],
      [
        "parallettes"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Hands close together, fingers turned out or back; elbows into the hips.",
      "Lean forward until the legs float, body straight and parallel to the floor.",
      "Squeeze the glutes and keep the elbows from sliding apart."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf"
    ],
    "verify": "The 3 x 30 s trial follows the RR hold rule, not an elbow-lever-specific standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "tuck_human_flag",
    "branch": "dynamic",
    "name": "Tuck human flag",
    "chainOrder": 50,
    "ogLevel": 5,
    "metric": "hold_s",
    "workingRange": {
      "min": 5,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "pull_up",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 10 strict pull-ups."
      },
      {
        "nodeId": "parallel_bar_dip",
        "minLevel": 5,
        "kind": "hard",
        "note": "About 10 dips."
      },
      {
        "nodeId": "side_plank",
        "minLevel": 5,
        "kind": "hard",
        "note": "A 60-90 s side plank."
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull",
      "straight_arm_push",
      "core"
    ],
    "equipment": [
      [
        "pole"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Top hand pulls, bottom hand pushes; both arms stay straight.",
      "Stack the shoulders over each other and tuck the knees to the chest.",
      "Keep the hips up at the level of the hands."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://bodyproskills.com/articles/human-flag-prerequisites/"
    ],
    "verify": "The 5-15 s range and 3 x 15 s trial are placeholders for an advanced hold.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "straddle_human_flag",
    "branch": "dynamic",
    "name": "Straddle human flag",
    "chainOrder": 60,
    "ogLevel": 6,
    "metric": "hold_s",
    "workingRange": {
      "min": 5,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "tuck_human_flag",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull",
      "straight_arm_push",
      "core"
    ],
    "equipment": [
      [
        "pole"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_human_flag",
    "cues": [
      "From the tuck, open the legs wide into a straddle.",
      "Body stays level with the floor; do not let the hips sag.",
      "Keep pushing hard with the bottom arm."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://bodyproskills.com/articles/human-flag-prerequisites/"
    ],
    "verify": "The 5-15 s range and 3 x 15 s trial are placeholders for an advanced hold.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "human_flag",
    "branch": "dynamic",
    "name": "Human flag",
    "chainOrder": 70,
    "ogLevel": 6,
    "metric": "hold_s",
    "workingRange": {
      "min": 5,
      "max": 15
    },
    "trial": {
      "sets": 3,
      "target": 15
    },
    "prerequisites": [
      {
        "nodeId": "straddle_human_flag",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull",
      "straight_arm_push",
      "core"
    ],
    "equipment": [
      [
        "pole"
      ]
    ],
    "alternatives": [],
    "regressionId": "straddle_human_flag",
    "cues": [
      "Legs together, body in one straight line parallel to the floor.",
      "Top arm pulls, bottom arm pushes, both locked straight.",
      "Squeeze the legs and glutes to stop the hips from dropping."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://bodyproskills.com/articles/human-flag-prerequisites/"
    ],
    "verify": "OG2 gives the full flag as ~6 (approximate); the hold standard is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "strict_bar_muscle_up",
    "branch": "dynamic",
    "name": "Strict bar muscle-up",
    "chainOrder": 80,
    "ogLevel": 7,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5
    },
    "prerequisites": [
      {
        "nodeId": "kipping_muscle_up",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "chest_to_bar_pull_up",
        "minLevel": 5,
        "kind": "hard",
        "note": "Strong, explosive chest-to-bar pull-ups."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "vertical_pull",
      "vertical_push"
    ],
    "equipment": [
      [
        "bar"
      ]
    ],
    "alternatives": [],
    "regressionId": "kipping_muscle_up",
    "cues": [
      "Start from a still dead hang; no swing or kip.",
      "Pull explosively low towards the hips, then turn the wrists over the bar.",
      "Press out to a straight-arm support with both arms together."
    ],
    "sourceUrls": [
      "https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/",
      "https://bodyproskills.com/articles/muscle-up-prerequisites/"
    ],
    "verify": "The 3-5 rep range and 3 x 5 trial are placeholders, not a published standard.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "wrist_prep",
    "branch": "flexibility",
    "name": "Wrist prep routine",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 8,
      "max": 12
    },
    "trial": {
      "sets": 3,
      "target": 12
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "On hands and knees, rock gently through each position (fingers forward, sideways, back).",
      "Palm and back-of-hand positions, then fist and fingertip support.",
      "Never push into sharp pain; the goal is warm, not strained."
    ],
    "sourceUrls": [
      "https://themovementathlete.com/planche-requirements/",
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "No sourced rep standard; the planche gate is 4-6 weeks of wrist prep (Movement Athlete). The trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "shoulder_dislocate",
    "branch": "flexibility",
    "name": "Band shoulder dislocate",
    "chainOrder": 20,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 8,
      "max": 12
    },
    "trial": {
      "sets": 3,
      "target": 12
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "equipment": [
      [
        "bands"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Hold the band wide with straight arms in front of the hips.",
      "Raise it overhead and behind you in one smooth arc, then back.",
      "Keep the elbows locked; widen the grip if you have to bend them."
    ],
    "sourceUrls": [
      "https://redditbwf.github.io/wiki/recommended_routine.html"
    ],
    "verify": "Warm-up staple in the RR shoulder band routine; no rep standard is sourced. The trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "pike_fold",
    "branch": "flexibility",
    "name": "Pike fold",
    "chainOrder": 30,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Sit with the legs straight and together, knees locked.",
      "Fold forward from the hips, not by rounding the upper back.",
      "Relax into it and breathe; reach for the toes or past them."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://antranik.org/progressions/"
    ],
    "verify": "Our synthesis (compression prep for the L-sit and manna); no sourced hold or range standard. A range standard (e.g. chest to knees) may suit better than a time.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "table_bridge",
    "branch": "flexibility",
    "name": "Table bridge",
    "chainOrder": 40,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Sit with hands behind you, fingers pointing to the feet, knees bent.",
      "Push the hips up until the body is flat like a table top.",
      "Knees over the ankles, shoulders over the wrists, head in line."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "Our synthesis; 0 is assumed and the 3 x 30 s trial follows the general RR hold rule.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "full_bridge",
    "branch": "flexibility",
    "name": "Full bridge",
    "chainOrder": 50,
    "ogLevel": 2,
    "metric": "hold_s",
    "workingRange": {
      "min": 10,
      "max": 30
    },
    "trial": {
      "sets": 3,
      "target": 30
    },
    "prerequisites": [
      {
        "nodeId": "table_bridge",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "shoulder_dislocate",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Open shoulders make it much easier to straighten the arms."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "table_bridge",
    "cues": [
      "Lie on your back, hands by the ears with fingers pointing to the feet.",
      "Push up until the arms and legs are straight.",
      "Push the shoulders over the hands; don't just bend the lower back."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "Our synthesis; the OG2 level 2 is inferred and the 3 x 30 s trial follows the general RR hold rule. The BWF chart has angled and head bridge steps in between that are not modelled.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  }
];
