// GENERATED FILE - DO NOT EDIT.
// Source: content/progressions/*.yaml. Rebuild with `npm run progressions:build`.
import type { ExerciseNode } from '@/domain/types';

export const GENERATED_NODES: readonly ExerciseNode[] = [
  {
    "id": "wall_push_up",
    "branch": "h_push",
    "name": "Wall push-up",
    "description": "A push-up done standing, with the hands on a wall instead of the floor. You lean in towards the wall and press back out; the more upright you stand, the easier it is.",
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
    "description": "A push-up with the hands raised on a box, bench, bar or parallettes while the feet stay on the floor. The body forms a slanted plank, which makes it lighter than a floor push-up.",
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
    "description": "A push-up on the floor with the knees down instead of the toes. The body stays straight from head to knees, so the arms lift less of your weight.",
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
    "description": "The classic push-up: a straight-body plank on hands and toes, lowered until the chest nears the floor and pressed back up. Trains the chest, shoulders and triceps.",
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
    "description": "A push-up with the hands close together under the chest, thumbs and index fingers touching in a diamond shape. The narrow hands shift the work onto the triceps.",
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
    "description": "A one-arm push-up with the working hand on a raised surface and the other arm behind the back or at the side. The feet are wide for balance; lowering the surface makes it harder.",
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
    "description": "A wide push-up where you lower towards one hand while the other arm stays out straight to the side. It is a step between a two-arm and a one-arm push-up.",
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
    "description": "A push-up with the hands back by the waist, fingers turned out, and the shoulders leaning forward past the hands. It looks like a push-up tipped forward and builds strength for the planche.",
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
    "description": "Holding yourself up on straight arms above dip bars, parallettes or rings, feet off the ground. It is the top position of a dip and the base for most pushing skills.",
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
    "description": "A push-up from an upside-down V, hips high and legs straight, lowering the head towards the floor in front of the hands. It moves the push overhead, like a handstand push-up with the feet on the floor.",
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
    "description": "Only the lowering half of a dip: start up on straight arms on the bars and sink down slowly until the shoulders are below the elbows. You step or jump back up instead of pressing.",
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
    "description": "A pike push-up with the feet up on a box or chair, so the hips sit higher over the hands. More of your weight is on the arms, which brings it closer to a handstand push-up.",
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
    "description": "From a support hold on two parallel bars, bend the arms to lower the body until the shoulders dip below the elbows, then press back up. A key strength move for chest, shoulders and triceps.",
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
    "description": "A dip on top of a single bar: the bar sits at the hips, the chest leans over it and the body lowers until the bar meets the upper belly. It is the finishing push of the bar muscle-up.",
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
    "description": "Upside down in a handstand against a wall, you bend the arms until the head touches the floor and press back up. The range ends at the head, so it is the shorter version of the handstand push-up.",
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
    "description": "A handstand push-up against the wall with the hands on parallettes, so the head can sink below hand level. You lower until the shoulders are near the hands and press back to straight arms.",
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
    "description": "A handstand push-up with no wall: from a balanced handstand you lower the head towards the floor and press back up while staying on balance. It joins handstand balance with strong overhead pressing.",
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
    "description": "Simply hanging from a bar or rings with straight arms and the feet off the ground. It builds grip and gets the shoulders used to carrying your weight overhead.",
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
    "description": "From a dead hang, the arms stay straight while the shoulder blades pull down and lift the body a few centimetres. It teaches the first part of every pull-up.",
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
    "description": "A pull-up where a jump from the floor or a box helps you get the chin over the bar, followed by a slow lowering. The legs give only as much help as you need.",
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
    "description": "Only the lowering half of a pull-up: start with the chin over the bar and lower yourself slowly to a full hang. It builds pull-up strength before you can pull all the way up.",
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
    "description": "Hanging from a bar or rings, you pull the body up until the chin is over the bar and lower back to straight arms. The basic test of upper-body pulling strength.",
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
    "description": "A higher, more explosive pull-up where the chest touches the bar instead of only the chin clearing it. It builds the pulling height needed for the muscle-up.",
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
    "description": "A wide-grip pull-up where you pull towards one hand while the other arm stays almost straight along the bar. One arm does most of the work, a step towards the one-arm chin-up.",
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
    "description": "Get the chin over the bar with both hands, let go with one and lower yourself slowly on the other arm, palm facing you. It is the lowering half of the one-arm chin-up.",
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
    "description": "Pulling your whole body up with one arm until the chin is over the bar, palm facing you, the other hand free. One of the hardest pulling feats in calisthenics.",
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
    "description": "A row with a resistance band anchored in front of you at chest height: you pull the band towards the lower ribs and let it back out. It trains the upper back with no bar needed.",
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
    "description": "Holding rings or a low bar with the feet on the floor and the body leaning back at a slant, you pull the chest up to the hands. The more upright you stand, the easier it is.",
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
    "description": "Hanging below a bar or rings with the body straight and almost parallel to the floor, heels on the ground, you pull the chest up to the hands. Also called an inverted or Australian row.",
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
    "description": "A row with the hands wide, pulling towards one hand while the other arm stays straight out to the side. It loads one arm at a time, a step towards the one-arm row.",
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
    "description": "From a tuck front lever, knees pulled in and the body horizontal under the bar, you pull the bar to the lower chest and lower back to straight arms. A row in the front-lever position.",
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
    "description": "A row with only one hand on the ring or bar, feet spread wide on the floor for balance. You pull the chest to the hand without letting the body twist open.",
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
    "description": "Hanging below a bar on straight arms with the back facing the floor and the body horizontal, knees tucked to the chest. The first hold of the front lever.",
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
    "description": "A tuck front lever with the hips opened and the back flat, thighs at about a right angle to the body. The longer shape makes the horizontal hold harder.",
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
    "description": "A front lever with one leg straight out in line with the body and the other tucked in. It sits between the advanced tuck and the straddle.",
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
    "description": "A front lever with both legs straight and spread wide, the body horizontal below the bar. The wide legs shorten the lever compared with the full version.",
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
    "description": "Hanging below a bar or rings on straight arms with the whole body rigid and horizontal, face up and legs together. An iconic straight-arm pulling skill.",
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
    "description": "Hanging from rings or a bar with the arms behind you and the body turned upside down past vertical, so the front of the shoulders is stretched. It prepares the shoulders for the back lever.",
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
    "description": "From a hang, tuck the knees and roll the body backwards through the arms into a German hang, then roll back out. A slow rotation that takes the shoulders through a big range.",
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
    "description": "Hanging on straight arms below rings or a bar, face down with the body horizontal and the knees tucked to the chest. The first hold of the back lever.",
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
    "description": "A tuck back lever with the hips opened and the back flat, thighs at about a right angle to the body. The longer shape loads the shoulders and arms more.",
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
    "description": "A back lever with the legs straight and spread wide, the body horizontal and face down below the rings or bar. The step before the full back lever.",
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
    "description": "Hanging below rings or a bar on straight arms, face down, with the whole body straight and horizontal behind the hands. A classic straight-arm gymnastics hold.",
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
    "description": "Holding yourself up between two rings with the arms straight out to the sides in a T, the body hanging vertically below. One of the hardest rings strength holds.",
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
    "description": "From a push-up position with straight arms, you lean the shoulders forward past the hands and hold. It teaches the forward lean and wrist load of the planche.",
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
    "description": "Balancing on straight arms with the knees resting on the outside of the arms and the feet off the floor. A bridge between the bent-arm crow and the tuck planche.",
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
    "description": "Balancing on straight arms with the knees tucked to the chest and the feet off the floor, hips at shoulder height. The body floats like a ball above the hands; the first true planche hold.",
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
    "description": "A tuck planche with the back flat and the hips pushed back level with the shoulders, knees still bent. It stretches the shape out towards a full planche.",
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
    "description": "Balancing on straight arms with the body horizontal above the floor and the legs straight and spread wide. An advanced planche hold; the wide legs make it a little easier than the full version.",
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
    "description": "Holding the whole body straight and horizontal above the floor, legs together, supported only by straight arms. The goal of the planche branch and an elite skill.",
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
    "description": "With the hands on the floor and the feet up on a wall, the body forms an L with the hips above the shoulders. A first upside-down position on the way to the handstand.",
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
    "description": "A handstand kicked up with your back to a wall, so the heels rest on it for balance. It builds the strength and comfort to hold your weight upside down.",
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
    "description": "A handstand facing the wall: you walk the feet up the wall until chest and toes face it, hands close to it. It teaches the straight, stacked handstand line.",
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
    "description": "Squatting with the hands on the floor and the knees resting on the bent elbows, you tip forward until the feet lift and balance on the hands. Also called the crow.",
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
    "description": "Balancing upside down on your hands with no wall, body straight and stacked over the wrists. The core balance skill of calisthenics.",
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
    "description": "From a handstand with the heels on the wall, you open the legs wide and lower them slowly to the floor. The lowering half of a straddle press.",
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
    "description": "From a wide straddle stand with the hands on the floor, you lift the hips over the shoulders and the legs up into a handstand without jumping. A strength and compression skill.",
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
    "description": "Balancing upside down on a single straight arm. An elite balance skill that builds on years of handstand practice.",
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
    "description": "Lying on your back with the lower back pressed into the floor and the arms and legs held straight just above it, the body curved like a shallow banana. The base body shape for most calisthenics skills.",
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
    "description": "Lying on one side and lifting the hips off the floor so the body is a straight line, held up by the forearm and the side of the bottom foot. It trains the sides of the trunk.",
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
    "description": "Sitting between parallettes, bars or with the hands on the floor, you press up on straight arms and lift the hips while the heels stay on the floor. The first step to the L-sit.",
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
    "description": "Supported on straight arms with the hips lifted and the knees pulled up to the chest, feet off the floor. An L-sit with bent legs.",
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
    "description": "Hanging from a bar, you bring the knees up towards the chest by curling the pelvis, then lower them slowly. It trains the abs and hip flexors.",
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
    "description": "Supported on straight arms with the legs held straight out in front, level with the floor, so the body forms an L. A classic core and compression hold.",
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
    "description": "Hanging from a bar, you lift the legs as straight as you can until the toes touch the bar, then lower them. A hard hanging core exercise.",
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
    "description": "Like the L-sit, but the legs are straight and spread wide with the hands on the floor between them. It needs more compression and hip flexibility than the L-sit.",
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
    "description": "Supported on straight arms with the legs raised well above horizontal, so the body forms a V. A big step past the L-sit.",
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
    "description": "Supported on straight arms with the hands behind the hips, the hips lifted high and the straight legs folded up towards the face. An elite compression and shoulder-flexibility hold.",
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
    "description": "A squat holding on to something sturdy in front of you, like a door frame or pole, to help with balance and depth. It teaches the squat pattern before the free version.",
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
    "description": "Standing with the feet shoulder-width apart, you sit the hips down until the thighs are at least parallel to the floor and stand back up. The basic leg exercise.",
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
    "description": "A squat all the way down, hips well below the knees and the heels flat on the floor. It builds leg strength through the full range and ankle and hip mobility.",
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
    "description": "Standing in a long stance with one foot forward and the back heel up, you lower straight down until the back knee nearly touches the floor. A single-leg-focused squat.",
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
    "description": "A split squat with the rear foot raised on a chair or box behind you. More of the load goes onto the front leg.",
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
    "description": "A one-leg squat holding a door frame or pole lightly, with the other leg straight out in front. The hands help as little as possible.",
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
    "description": "Squatting all the way down and back up on one leg while the other leg is held straight out in front off the floor. It needs strength, balance and mobility.",
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
    "description": "Kneeling with the heels held down, you lower the straight body forward towards the floor as slowly as you can and catch yourself with the hands. It builds strong hamstrings.",
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
    "description": "Hanging from a bar with straight arms, you swing between an arched and a hollow body shape. The controlled swing is the engine of the kipping muscle-up.",
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
    "description": "Only the lowering half of a muscle-up: from support on top of the bar you lower through the dip, then slowly through the transition into a hang. It teaches the path over the bar.",
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
    "description": "A muscle-up on a bar that uses a kip swing for momentum: you pull the bar towards the hips, bring the chest over it and press out to straight arms on top.",
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
    "description": "Balancing the body horizontally on the hands, with the bent elbows dug into the hips as a support. A balance skill that looks impressive but needs more technique than strength.",
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
    "description": "Holding on to a vertical pole with both arms straight, top hand pulling and bottom hand pushing, the body held sideways off the ground with the knees tucked. The first step to the human flag.",
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
    "description": "A human flag with the legs straight and spread wide, the body held sideways and level off a vertical pole. The step before the full flag.",
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
    "description": "Holding the whole body straight and sideways, parallel to the ground, off a vertical pole with straight arms. A famous strength and show skill.",
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
    "description": "A muscle-up on a bar with no swing: from a still dead hang you pull explosively, turn the wrists over the bar and press to support on top. It takes much more strength than the kipping version.",
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
    "description": "A short routine on hands and knees that moves the wrists through several hand positions, fingers forward, sideways and back. It warms up the wrists before handstand and planche work.",
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
    "description": "Holding a band wide with straight arms, you lift it in one arc from in front of the hips over the head to behind you and back. A shoulder mobility drill; nothing actually dislocates.",
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
    "description": "Sitting with the legs straight and together, you fold the upper body forward from the hips towards the legs. It stretches the hamstrings for the L-sit, compression and press work.",
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
    "description": "Sitting with the hands behind you and the knees bent, you push the hips up until the body is flat like a table top. A gentle bridge that opens the shoulders and hips.",
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
    "description": "Lying on your back, you push up on hands and feet until the arms and legs are straight and the body forms an arch. Also called a wheel; it opens the shoulders and spine.",
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
  },
  {
    "id": "tuck_rock",
    "branch": "acrobatics",
    "name": "Tuck rock",
    "description": "Sitting in a tight ball, you rock back onto the shoulder blades and forward again onto the feet. The rolling shape behind every roll and breakfall.",
    "chainOrder": 10,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 5,
      "max": 10
    },
    "trial": {
      "sets": 3,
      "target": 10
    },
    "prerequisites": [],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Sit in a tight ball, knees to the chest, chin tucked in.",
      "Rock back onto the shoulder blades and forward again onto the feet.",
      "Hands by the ears, palms up (\"pizza hands\"), ready for the backward roll; the head never touches the floor."
    ],
    "sourceUrls": [
      "https://www.nrgq.co.uk/wp-content/uploads/2018/12/Foundation_Teaching-Progressions-FORWARD-ROLL-_-VARIATIONS.pdf",
      "https://www.pinngym.com/favorite-backward-roll-progressions"
    ],
    "verify": "The first step of both the forward and the backward roll (NRG, Pinn \"rock and roll\"); no source gives a rep standard, so the 3 x 10 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "back_breakfall",
    "branch": "acrobatics",
    "name": "Back breakfall (ushiro ukemi)",
    "description": "A judo fall backwards: you sit down low, roll back on a rounded back and slap the floor with both arms to spread the impact. Teaches you to fall backwards without hitting the head.",
    "chainOrder": 20,
    "ogLevel": 0,
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
        "nodeId": "tuck_rock",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_rock",
    "cues": [
      "Chin to the chest, eyes on your belt; the head never touches the floor.",
      "Sit the hips down close to the heels and roll back on a rounded back.",
      "Slap the floor with both whole arms at about 45 degrees from the body, palms down.",
      "Build up from lying, to sitting, to squatting, to standing; stay low until it is easy."
    ],
    "sourceUrls": [
      "https://judocanada.org/wp-content/uploads/2023/07/Guide-Chutes_2023_EN.pdf",
      "https://www.judo-encyclopedia.com/judo_encyclopedia/ukemi-waza/"
    ],
    "verify": "Judo Canada teaches it first, in stages from lying to standing; OG level 0 is assumed and the 3 x 10 trial is a placeholder (judo practises falls every session, not to a rep standard).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "forward_roll",
    "branch": "acrobatics",
    "name": "Forward roll",
    "description": "From a squat with the hands on the floor, you tuck the chin and roll forward over the back of the shoulders into a squat again. The classic somersault.",
    "chainOrder": 30,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 6
    },
    "trial": {
      "sets": 3,
      "target": 6
    },
    "prerequisites": [
      {
        "nodeId": "tuck_rock",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_rock",
    "cues": [
      "Squat, hands shoulder-width on the floor, hips high.",
      "Tuck the chin to the chest and roll onto the back of the head and shoulders, never the top of the head.",
      "Stay in a tight ball and reach forward to stand up without pushing off the floor behind you."
    ],
    "sourceUrls": [
      "https://www.nrgq.co.uk/wp-content/uploads/2018/12/Foundation_Teaching-Progressions-FORWARD-ROLL-_-VARIATIONS.pdf"
    ],
    "verify": "OG level 1 is inferred; the 3 x 6 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "side_breakfall",
    "branch": "acrobatics",
    "name": "Side breakfall (yoko ukemi)",
    "description": "A judo fall to the side: one leg swings across, you sit down and land on your side while one arm slaps the floor. Teaches you to fall sideways safely.",
    "chainOrder": 40,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 6,
      "max": 10
    },
    "trial": {
      "sets": 3,
      "target": 10
    },
    "prerequisites": [
      {
        "nodeId": "back_breakfall",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "back_breakfall",
    "cues": [
      "Alternate sides; count every fall as one rep.",
      "Swing one leg across the body and sit down close to the heel of the standing leg.",
      "Land on the side, not the back; slap with the whole arm on the falling side at about 45 degrees.",
      "Chin tucked, head up off the floor; legs apart, never crossed."
    ],
    "sourceUrls": [
      "https://judocanada.org/wp-content/uploads/2023/07/Guide-Chutes_2023_EN.pdf",
      "https://www.judo-encyclopedia.com/judo_encyclopedia/ukemi-waza/"
    ],
    "verify": "Judo Canada teaches it second, after the back breakfall; OG level 1 is inferred and the 3 x 10 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "forward_shoulder_roll",
    "branch": "acrobatics",
    "name": "Forward shoulder roll (zenpo kaiten ukemi)",
    "description": "A judo forward roll that goes diagonally over one arm and shoulder to the opposite hip, so the head never touches the floor. It turns a forward fall into a roll back to your feet.",
    "chainOrder": 50,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 4,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "side_breakfall",
        "minLevel": 5,
        "kind": "hard",
        "note": "The roll ends in a side breakfall."
      },
      {
        "nodeId": "forward_roll",
        "minLevel": 5,
        "kind": "recommended"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "side_breakfall",
    "cues": [
      "Alternate sides; count every roll as one rep.",
      "Roll diagonally along the arm and the back of the shoulder to the opposite hip; the head stays off the floor.",
      "Chin in, look towards the far shoulder; keep the leading arm round like a wheel.",
      "Start from kneeling, then from standing, then walking; slap the floor with the free arm as you finish."
    ],
    "sourceUrls": [
      "https://judocanada.org/wp-content/uploads/2023/07/Guide-Chutes_2023_EN.pdf",
      "https://gmb.io/tumbling/",
      "https://www.judo-encyclopedia.com/judo_encyclopedia/ukemi-waza/"
    ],
    "verify": "Judo Canada teaches it third (kneeling, standing, on the move); OG level 1 is inferred and the 3 x 8 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "backward_shoulder_roll",
    "branch": "acrobatics",
    "name": "Backward shoulder roll",
    "description": "A roll backwards over one shoulder instead of over the head, ending on the knees or feet. A gentler way to roll backwards that keeps the neck free.",
    "chainOrder": 60,
    "ogLevel": 1,
    "metric": "reps",
    "workingRange": {
      "min": 4,
      "max": 8
    },
    "trial": {
      "sets": 3,
      "target": 8
    },
    "prerequisites": [
      {
        "nodeId": "forward_shoulder_roll",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "back_breakfall",
        "minLevel": 5,
        "kind": "recommended"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "back_breakfall",
    "cues": [
      "Alternate sides; count every roll as one rep.",
      "Sit back, turn the head away and roll over the back of one shoulder, not the neck.",
      "Tuck the head under the other arm; walk the knees or feet around to finish."
    ],
    "sourceUrls": [
      "https://gmb.io/tumbling/"
    ],
    "verify": "GMB teaches it after the forward shoulder roll; OG level 1 is inferred and the 3 x 8 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "bunny_hop_cartwheel",
    "branch": "acrobatics",
    "name": "Bunny-hop cartwheel",
    "description": "Standing sideways to a line, you place both hands on it and hop both feet together over to the other side. A small, low cartwheel that teaches putting weight on the hands.",
    "chainOrder": 70,
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
        "nodeId": "wall_plank",
        "minLevel": 5,
        "kind": "hard",
        "note": "Comfortable taking your weight on straight arms with the hips over the shoulders."
      },
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
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Stand sideways to a line, put both hands down on it and hop both feet over to the other side.",
      "Arms straight, weight on the hands; fingers turned sideways to the line.",
      "Lift the hips a little higher with every hop; sequence foot, hand, hand, foot, foot."
    ],
    "sourceUrls": [
      "https://www.nrgq.co.uk/wp-content/uploads/2018/12/Foundation_Teaching-Progressions-CARTWHEELS.pdf",
      "https://gmb.io/tumbling/"
    ],
    "verify": "NRG: \"early attempts may just be bunny-hopping around from 2 feet to 2 feet\"; GMB starts from hands-on-the-ground cartwheels. OG level 1 is inferred; the 3 x 10 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "backward_roll",
    "branch": "acrobatics",
    "name": "Backward roll",
    "description": "From a squat, you roll backwards over the back with the hands by the ears, push through the hands and land on the feet. The backwards somersault.",
    "chainOrder": 80,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 6
    },
    "trial": {
      "sets": 3,
      "target": 6
    },
    "prerequisites": [
      {
        "nodeId": "forward_roll",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "push_up",
        "minLevel": 5,
        "kind": "recommended",
        "note": "The arms have to push the body over the head, off the neck."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "tuck_rock",
    "cues": [
      "Hands by the ears, palms up, like holding a pizza tray; chin tucked in.",
      "Rock back; the hands and the back of the head touch the floor together.",
      "Push hard through the hands so the neck carries no weight, and land on the feet, not the knees.",
      "Learn it down a slope first; stop if you feel pressure in the neck."
    ],
    "sourceUrls": [
      "https://www.pinngym.com/favorite-backward-roll-progressions",
      "https://recgympros.com/drills-for-teaching-back-rolls/"
    ],
    "verify": "OG level 2 is inferred; the 3 x 6 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "cartwheel",
    "branch": "acrobatics",
    "name": "Cartwheel",
    "description": "From standing, you turn sideways onto one hand, then the other, the legs passing wide overhead, and land one foot after the other along a line. A wheel-like turn through a side handstand.",
    "chainOrder": 90,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 6
    },
    "trial": {
      "sets": 3,
      "target": 6
    },
    "prerequisites": [
      {
        "nodeId": "bunny_hop_cartwheel",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "wall_handstand",
        "minLevel": 5,
        "kind": "hard",
        "note": "Kicking up to a handstand against the wall comes before the cartwheel (GymnasticsHQ)."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "bunny_hop_cartwheel",
    "cues": [
      "Start sideways to a line, arms up by the ears, one leg lifted in the direction of travel.",
      "Lunge in and down; place hand, hand on the line, fingers turned sideways.",
      "Legs split wide and pass through vertical; land foot, foot close to the hands, arms up."
    ],
    "sourceUrls": [
      "https://www.nrgq.co.uk/wp-content/uploads/2018/12/Foundation_Teaching-Progressions-CARTWHEELS.pdf",
      "https://gymnasticshq.com/how-to-do-a-cartwheel/",
      "https://gmb.io/tumbling/"
    ],
    "verify": "Not levelled in OG2 (2 inferred, next to the wall handstand); the 3 x 6 trial is a placeholder. NRG notes narrow side splits and tight shoulders make it harder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "quarter_turn_cartwheel",
    "branch": "acrobatics",
    "name": "Cartwheel with a quarter turn (front to back)",
    "description": "A cartwheel that starts facing along the line and turns a quarter on the second hand, so you land facing back the way you came. The bridge from the cartwheel to the round-off.",
    "chainOrder": 100,
    "ogLevel": 2,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 6
    },
    "trial": {
      "sets": 3,
      "target": 6
    },
    "prerequisites": [
      {
        "nodeId": "cartwheel",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "cartwheel",
    "cues": [
      "Start facing along the line, not sideways.",
      "First hand as in the cartwheel; turn the second hand in so its fingers point back.",
      "Finish facing where you started from, usually in a lunge."
    ],
    "sourceUrls": [
      "https://www.nrgq.co.uk/wp-content/uploads/2018/12/Foundation_Teaching-Progressions-CARTWHEELS.pdf"
    ],
    "verify": "NRG calls it the prerequisite of the round-off; OG level 2 is inferred and the 3 x 6 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "one_handed_cartwheel",
    "branch": "acrobatics",
    "name": "One-handed cartwheel",
    "description": "A cartwheel done on a single hand, the free arm sweeping out to the side. The legs pass over the top with only one hand on the floor.",
    "chainOrder": 110,
    "ogLevel": 3,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 6
    },
    "trial": {
      "sets": 3,
      "target": 6
    },
    "prerequisites": [
      {
        "nodeId": "cartwheel",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "cartwheel",
    "cues": [
      "Place one hand, fingers sideways; the free arm sweeps down in front and out to the side.",
      "Legs swing straight over the top with a tight torso.",
      "First foot lands close to the hand; lift the chest quickly.",
      "Stepping stone - put the second hand on top of the first as you go over."
    ],
    "sourceUrls": [
      "https://www.nrgq.co.uk/wp-content/uploads/2018/12/Developmental_Teaching-Progressions-ONE-HANDED-CARTWHEEL.pdf",
      "https://gymnasticshq.com/how-to-do-a-cartwheel/"
    ],
    "verify": "NRG: it needs the strength to hold the body on one arm; OG level 3 is inferred and the 3 x 6 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "round_off",
    "branch": "acrobatics",
    "name": "Round-off",
    "description": "Like a cartwheel, but the legs snap together above the hands and you land on both feet at once, facing back the way you came. The entry to most tumbling passes.",
    "chainOrder": 120,
    "ogLevel": 3,
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
        "nodeId": "quarter_turn_cartwheel",
        "minLevel": 5,
        "kind": "hard",
        "note": "A good, straight front-to-back cartwheel with correct hand placement (NRG)."
      },
      {
        "nodeId": "wall_handstand",
        "minLevel": 5,
        "kind": "hard",
        "note": "A strong, straight kick to handstand (NRG)."
      },
      {
        "nodeId": "hollow_hold",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Good body tension and a dished exit."
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility",
      "explosive"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "quarter_turn_cartwheel",
    "cues": [
      "Step in with the arms by the ears, lunge deep and reach far forward.",
      "Second hand turns to point backwards; head stays between the arms.",
      "Snap the legs together after vertical and push hard through the shoulders.",
      "Land on both feet facing back, in a dished (hollow) shape, not a pike."
    ],
    "sourceUrls": [
      "https://www.nrgq.co.uk/wp-content/uploads/2018/12/Developmental_Teaching-Progressions-ROUND-OFF.pdf"
    ],
    "verify": "OG level 3 is inferred; the 3 x 5 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "aerial_cartwheel",
    "branch": "acrobatics",
    "name": "Aerial cartwheel",
    "description": "A cartwheel with no hands: a strong kick throws the body sideways through the air and you land one foot after the other. An advanced acrobatic skill.",
    "chainOrder": 130,
    "ogLevel": 6,
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
        "nodeId": "round_off",
        "minLevel": 5,
        "kind": "hard",
        "note": "Teaches the push off the legs."
      },
      {
        "nodeId": "one_handed_cartwheel",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": true,
    "patterns": [
      "balance",
      "mobility",
      "explosive"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "regressionId": "one_handed_cartwheel",
    "legendary": true,
    "cues": [
      "Learn it with a coach and on a soft mat first, ideally off a raised surface.",
      "Drill needle kicks and fast, close cartwheels before taking the hands away.",
      "Drive hard with the back leg and lift the chest; the legs do the work, not the arms."
    ],
    "sourceUrls": [
      "https://gymnasticshq.com/how-to-do-an-aerial-cartwheel/",
      "https://en.wikipedia.org/wiki/Aerial_cartwheel"
    ],
    "verify": "Not levelled in OG2; 6 (FIG A range) is inferred. The 3 x 3 trial is a placeholder. The sources advise a spotter and mats, which this app cannot check.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  }
];
