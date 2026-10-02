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
    "id": "ring_push_up",
    "branch": "h_push",
    "name": "Ring push-up",
    "description": "A push-up with the hands on rings hanging a few centimetres above the floor. The rings move freely, so the chest and shoulders also have to hold them steady.",
    "chainOrder": 55,
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
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "push_up",
    "cues": [
      "Rings low, just above the floor; body straight from head to heels.",
      "Keep the rings close to the body as you lower; do not let them drift apart.",
      "Press up to straight arms and push the rings away at the top."
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
    "id": "straddle_one_arm_push_up",
    "branch": "h_push",
    "name": "Straddle one-arm push-up",
    "description": "A push-up on one arm on the floor, the feet spread wide for balance and the free hand behind the back. The first one-arm push-up from the floor.",
    "chainOrder": 75,
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
        "nodeId": "elevated_one_arm_push_up",
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
    "regressionId": "elevated_one_arm_push_up",
    "cues": [
      "Feet wide apart, hand under the chest, free hand behind the back.",
      "Keep the hips and shoulders square to the floor; do not twist open.",
      "Lower until the chest is near the hand, then press back up."
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
    "id": "one_arm_push_up",
    "branch": "h_push",
    "name": "One-arm push-up",
    "description": "A push-up on one arm with the feet close together and the whole body straight, without twisting. The classic one-arm push-up.",
    "chainOrder": 90,
    "ogLevel": 8,
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
        "nodeId": "straddle_one_arm_push_up",
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
    "regressionId": "straddle_one_arm_push_up",
    "cues": [
      "Feet together or only slightly apart, body in one straight line.",
      "Squeeze the glutes and brace so the hips do not rotate.",
      "Lower until the chest is near the hand, then press back up."
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
    "id": "ring_dip",
    "branch": "v_push",
    "name": "Ring dip",
    "description": "A dip between two rings. From a straight-arm support you lower until the shoulders are below the elbows and press back up, while keeping the rings steady at your sides.",
    "chainOrder": 65,
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
        "nodeId": "dip_negative",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "support_hold",
        "minLevel": 5,
        "kind": "hard",
        "note": "A steady ring support hold (3 x 30 s) first."
      },
      {
        "nodeId": "parallel_bar_dip",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Parallel bar dips (3 x 8) make the first ring dips much easier."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_push"
    ],
    "equipment": [
      [
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "dip_negative",
    "cues": [
      "Start in a ring support, arms straight, rings close to the body.",
      "Lower until the shoulders are just below the elbows; keep the rings from drifting out.",
      "Press back up to straight arms and turn the rings slightly out at the top."
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
    "description": "A handstand push-up against the wall with the hands raised on parallettes, so the head can travel below hand level. It is the full-range version of the wall headstand push-up, which stops when the head touches the floor.",
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
    "id": "l_pull_up",
    "branch": "v_pull",
    "name": "L-sit pull-up",
    "description": "A pull-up with the legs held straight out in front in an L, hips at a right angle. It adds a core hold to every rep.",
    "chainOrder": 55,
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
      },
      {
        "nodeId": "l_sit",
        "minLevel": 5,
        "kind": "recommended",
        "note": "An L-sit hold helps keep the legs up."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "vertical_pull",
      "core"
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
    "regressionId": "pull_up",
    "cues": [
      "Hang with the legs straight out in front, toes pointed, hips at 90 degrees.",
      "Pull until the chin is over the bar without letting the legs drop.",
      "Lower to straight arms with the L still held."
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
    "id": "wide_row",
    "branch": "h_pull",
    "name": "Wide row",
    "description": "A horizontal row with the hands much wider than the shoulders, pulling the chest up to the bar or rings. The wide grip puts more of the work on the upper back.",
    "chainOrder": 35,
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
      "Hands about twice shoulder width, body straight from head to heels.",
      "Pull the chest up between the hands, elbows pointing out.",
      "Lower all the way to straight arms."
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
    "id": "advanced_tuck_front_lever_row",
    "branch": "h_pull",
    "name": "Advanced tuck front lever row",
    "description": "A row in the advanced tuck front lever, back flat and hips open, pulling the bar to the lower chest and lowering back to straight arms. The next step after the tuck front lever row.",
    "chainOrder": 55,
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
        "nodeId": "tuck_front_lever_row",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "advanced_tuck_front_lever",
        "minLevel": 5,
        "kind": "hard",
        "note": "Hold the advanced tuck front lever (3 x 30 s) before rowing in it."
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
    "regressionId": "tuck_front_lever_row",
    "cues": [
      "Start in an advanced tuck front lever, back flat, arms straight.",
      "Pull the bar to the lower chest while the body stays level.",
      "Lower back to straight arms without dropping the hips."
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
    "id": "one_arm_row",
    "branch": "h_pull",
    "name": "One-arm row",
    "description": "A row on one arm with the feet together, pulling the chest to the hand while the body stays square instead of twisting open. The end of the one-arm row path.",
    "chainOrder": 70,
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
        "nodeId": "straddle_one_arm_row",
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
    "regressionId": "straddle_one_arm_row",
    "cues": [
      "Feet together, one hand on the ring or bar, body straight.",
      "Keep the hips and shoulders square; the free arm may reach to the side for balance.",
      "Pull the chest to the hand, then lower to a straight arm under control."
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
    "id": "straddle_front_lever_row",
    "branch": "h_pull",
    "name": "Straddle front lever row",
    "description": "A row in the straddle front lever, legs straight and wide, pulling the bar to the body and lowering back to straight arms while staying level. An advanced lever row.",
    "chainOrder": 80,
    "ogLevel": 8,
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
        "nodeId": "advanced_tuck_front_lever_row",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "straddle_front_lever",
        "minLevel": 5,
        "kind": "hard",
        "note": "Hold the straddle front lever (3 x 15 s) before rowing in it."
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
    "regressionId": "advanced_tuck_front_lever_row",
    "cues": [
      "Start in a straddle front lever, legs straight and wide.",
      "Pull the bar towards the hips while the body stays horizontal.",
      "Lower back to straight arms without dropping the hips."
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
    "id": "tuck_front_lever_raise",
    "branch": "front_lever",
    "name": "Tuck front lever raise",
    "description": "From a hang on straight arms, you raise the tucked body up into a tuck front lever and lower it back down without bending the arms. A moving drill for the pull-down strength of the lever.",
    "chainOrder": 15,
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
        "nodeId": "tuck_front_lever",
        "minLevel": 5,
        "kind": "hard",
        "note": "A steady tuck front lever hold comes first."
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
      "Start from a dead hang with the knees tucked.",
      "Keep the arms locked and press the bar down towards the hips to lift the body.",
      "Pause level with the floor, then lower slowly; no swinging."
    ],
    "sourceUrls": [
      "https://rangeofmotion.net.au/front-lever-exercise-improvement-program",
      "https://fitnessvolt.com/front-lever-raises-guide/"
    ],
    "verify": "Not on the OG2 chart or the BWF chart; level 4 (next to the tuck hold) and the RR rep standard 3 x 8 are inferred.",
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
    "id": "tuck_ice_cream_maker",
    "branch": "front_lever",
    "name": "Tuck ice cream maker",
    "description": "Starting at the top of a pull-up, you straighten the arms while tipping back into a tuck front lever, then pull back up to the top. It links bent-arm pulling to the lever position.",
    "chainOrder": 25,
    "ogLevel": 5,
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
        "nodeId": "tuck_front_lever",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "pull_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_pull",
      "vertical_pull"
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
    "regressionId": "tuck_front_lever",
    "cues": [
      "Start at the top of a pull-up with the knees tucked.",
      "Push the bar away and lean back until the arms are straight and the body is level.",
      "Pull back up to the top along the same path, then lower to a hang."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://calisthenics-parks.com/skills/206-en-ice-cream-makers"
    ],
    "verify": "Not on the OG2 chart; the BWF chart puts the tuck ice cream maker in its intermediate band next to the tuck front lever row (OG2 5). Level 5 and the 3 x 5 standard (Steven Low's strength rule) are inferred.",
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
    "id": "half_lay_front_lever",
    "branch": "front_lever",
    "name": "Half-lay front lever",
    "description": "A front lever with the hips open and the legs together, the knees bent so the shins hang down. Longer than the straddle and shorter than the full lever.",
    "chainOrder": 45,
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
      "Legs together, knees bent, hips fully open in line with the body.",
      "Body level with the floor; squeeze the glutes so the hips do not pike.",
      "Arms locked, shoulders pulled down."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://en.wikipedia.org/wiki/Front_lever",
      "https://antranik.org/ssc/"
    ],
    "verify": "OG2 prints the half-lay / one-leg front lever at 7 and the full lever at 8; the dataset has the full lever at 7 (PLAN 1.6), so 7 keeps the order.",
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
    "id": "front_lever_to_inverted",
    "branch": "front_lever",
    "name": "Front lever to inverted hang",
    "description": "From a front lever, you pull the straight body up on straight arms until it hangs upside down, then lower it back to the lever. A dynamic front lever skill.",
    "chainOrder": 60,
    "ogLevel": 9,
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
        "nodeId": "front_lever",
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
    "regressionId": "front_lever",
    "cues": [
      "Start in a full front lever, body straight and arms locked.",
      "Press the bar towards the hips to rotate the body up to an inverted hang.",
      "Lower back to the lever under control and hold it briefly."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 level 9 is printed; the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "hanging_pull_to_inverted",
    "branch": "front_lever",
    "name": "Hanging pull to inverted hang",
    "description": "From a dead hang, you pull the straight body up on straight arms, through the front lever, all the way to an inverted hang, and lower back down. The hardest front lever pull in the tree.",
    "chainOrder": 70,
    "ogLevel": 10,
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
        "nodeId": "front_lever_to_inverted",
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
    "regressionId": "front_lever_to_inverted",
    "cues": [
      "Start from a still dead hang, body straight, no swing.",
      "Keep the arms locked and the body rigid as it passes the front lever.",
      "Lower slowly the same way."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 level 10 is printed; the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
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
    "id": "one_leg_back_lever",
    "branch": "back_lever",
    "name": "One-leg back lever",
    "description": "A back lever with one leg straight in line with the body and the other knee bent, face down below the rings or bar. It sits between the straddle and the full back lever.",
    "chainOrder": 55,
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
      "One leg straight out in line with the body, the other knee bent.",
      "Squeeze the glutes; keep the hips from sagging below the shoulders.",
      "Switch the straight leg between sets."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://antranik.org/ssc/"
    ],
    "verify": "OG2 prints the half-lay / one-leg back lever at 6. The BWF chart lists it before the straddle and notes that the straddle is easier for some people; here it follows the OG2 level.",
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
    "id": "back_lever_pullout",
    "branch": "back_lever",
    "name": "Back lever pullout",
    "description": "From a back lever, you pull the straight body back up to an inverted hang with straight arms, without piking or bending the arms. It trains control on the way out of the lever.",
    "chainOrder": 65,
    "ogLevel": 8,
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
        "nodeId": "back_lever",
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
    "regressionId": "back_lever",
    "cues": [
      "Start in a full back lever, body straight.",
      "Keep the arms locked and press the hands down to rotate up to an inverted hang.",
      "Move slowly; stop at any pain in the biceps or elbows."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 level 8 is printed; the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "german_hang_pullout",
    "branch": "back_lever",
    "name": "German hang pullout",
    "description": "From a German hang, you pull with straight arms up through the back lever to an inverted hang. A long straight-arm pull through the full shoulder range.",
    "chainOrder": 67,
    "ogLevel": 9,
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
        "nodeId": "back_lever_pullout",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "german_hang",
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
    "regressionId": "back_lever_pullout",
    "cues": [
      "Start from a relaxed German hang, arms straight.",
      "Pull through the back lever without bending the arms or piking.",
      "Finish in an inverted hang and come out slowly."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 level 9 is printed; the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
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
    "id": "tuck_planche_push_up",
    "branch": "planche",
    "name": "Tuck planche push-up",
    "description": "From a tuck planche, you bend the arms to lower the chest towards the floor and press back up while the feet stay off the floor. Push-ups in the planche position.",
    "chainOrder": 45,
    "ogLevel": 6,
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
        "nodeId": "tuck_planche",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "pseudo_planche_push_up",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Builds the bent-arm strength in the forward lean."
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push",
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
    "regressionId": "tuck_planche",
    "cues": [
      "Start in a tuck planche with the shoulders past the hands.",
      "Lower with the elbows close to the body; keep the hips at shoulder height.",
      "Press back to straight arms and push the floor away."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 level 6 is printed; the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
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
    "id": "advanced_tuck_planche_push_up",
    "branch": "planche",
    "name": "Advanced tuck planche push-up",
    "description": "A planche push-up from the advanced tuck, with the back flat and the hips level with the shoulders. The longer shape makes each press much harder.",
    "chainOrder": 53,
    "ogLevel": 8,
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
        "nodeId": "advanced_tuck_planche",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "tuck_planche_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push",
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
    "regressionId": "tuck_planche_push_up",
    "cues": [
      "Start in an advanced tuck planche, back flat.",
      "Lower until the chest is near hand height without dropping the hips.",
      "Press back up with the shoulders leaning past the hands."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 prints it at 8, above the straddle planche (8 on the chart, 7 in the dataset); the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "half_lay_planche",
    "branch": "planche",
    "name": "Half-lay planche",
    "description": "A planche with the hips open and the legs together, the knees bent, so the body is level from the shoulders to the knees. It sits between the straddle and the full planche.",
    "chainOrder": 56,
    "ogLevel": 9,
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
    "cues": [
      "Legs together, knees bent, hips fully open in line with the body.",
      "Arms locked, shoulders protracted and well past the hands.",
      "Squeeze the glutes; no sag or pike at the hips."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://antranik.org/ssc/"
    ],
    "verify": "OG2 prints the half-lay / one-leg planche at 9 (straddle 8, full 11 on the chart; 7 and 10 in the dataset, PLAN 1.6).",
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
    "id": "straddle_planche_push_up",
    "branch": "planche",
    "name": "Straddle planche push-up",
    "description": "A push-up held in a straddle planche, legs straight and wide, lowering the chest towards the floor and pressing back up without touching down. An advanced planche strength move.",
    "chainOrder": 70,
    "ogLevel": 10,
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
        "nodeId": "straddle_planche",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "advanced_tuck_planche_push_up",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": true,
    "isSkill": true,
    "patterns": [
      "straight_arm_push",
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
    "regressionId": "advanced_tuck_planche_push_up",
    "cues": [
      "Start in a straddle planche, legs straight and wide.",
      "Lower with the body staying level; the feet never touch the floor.",
      "Press back to straight arms and protract the shoulders."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 level 10 is printed; the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
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
    "id": "chest_to_wall_shoulder_taps",
    "branch": "handstand",
    "name": "Chest-to-wall shoulder taps",
    "description": "In a chest-to-wall handstand, you shift the weight onto one hand and lift the other to tap its shoulder, then switch sides. It teaches the weight shifts used to balance freely.",
    "chainOrder": 35,
    "ogLevel": 3,
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
        "nodeId": "chest_to_wall_handstand",
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
    "regressionId": "chest_to_wall_handstand",
    "cues": [
      "Walk up into a chest-to-wall handstand, body straight, hands close to the wall.",
      "Shift the weight onto one hand before lifting the other; keep the hips still.",
      "Tap the shoulder lightly, put the hand back, then switch."
    ],
    "sourceUrls": [
      "https://www.12minuteathlete.com/stronger-handstand/",
      "https://gmb.io/freestanding-handstand/"
    ],
    "verify": "Not on the OG2 chart or the BWF chart; level 3 (between the chest-to-wall handstand and the freestanding handstand) and the 3 x 8 taps per side are inferred.",
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
    "id": "ring_shoulder_stand",
    "branch": "handstand",
    "name": "Ring shoulder stand",
    "description": "Balancing upside down on rings with bent arms, the shoulders low next to the rings and the body straight above them. A first inverted hold on rings, before the ring handstand.",
    "chainOrder": 55,
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
        "nodeId": "support_hold",
        "minLevel": 5,
        "kind": "hard",
        "note": "A steady ring support hold first."
      },
      {
        "nodeId": "chest_to_wall_handstand",
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
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "chest_to_wall_handstand",
    "cues": [
      "Rings low; roll up from a tuck with the arms bent and the elbows in.",
      "Keep the rings pressed against the body and the shoulders close to them.",
      "Extend the legs straight up and come down the way you went up."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 level 5 is printed; the 3 x 30 s hold standard is the RR hold rule.",
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
    "id": "elevated_straddle_press",
    "branch": "handstand",
    "name": "Elevated straddle press",
    "description": "A straddle press to handstand that starts with the feet on a raised surface, so the hips start higher. The step between the wall eccentric and the press from the floor.",
    "chainOrder": 65,
    "ogLevel": 6,
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
        "box"
      ]
    ],
    "alternatives": [],
    "regressionId": "wall_straddle_press_eccentric",
    "cues": [
      "Feet wide on the raised surface, hands on the floor in front of it.",
      "Lean the shoulders over the hands until the feet float off.",
      "Lift the hips over the shoulders, then bring the legs together."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://stevenlow.org/the-fundamentals-of-bodyweight-strength-training/"
    ],
    "verify": "OG2 level 6 is printed; the 3 x 5 rep standard is a placeholder (Steven Low's strength rule).",
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
    "id": "single_leg_deadlift",
    "branch": "legs",
    "name": "Single-leg deadlift",
    "description": "Standing on one leg, you hinge at the hip and lower the chest towards the floor while the free leg reaches back, then stand up tall. A balance and hamstring exercise with no equipment.",
    "chainOrder": 15,
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
    "prerequisites": [],
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
      "Soft knee on the standing leg; the back stays flat.",
      "Push the hips back and let the free leg rise in line with the body.",
      "Stand up by squeezing the glute of the standing leg."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/hinge"
    ],
    "verify": "Not on the OG2 chart; the BWF chart and the BWF wiki put the one-leg deadlift at the start of the hinge path. Level 1 and the RR rep standard 3 x 8 are inferred.",
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
    "id": "beginner_shrimp_squat",
    "branch": "legs",
    "name": "Beginner shrimp squat",
    "description": "A one-leg squat with the other leg bent behind you: you lower until the back knee and toes touch the floor together and stand up again. The first step of the shrimp squat path.",
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
        "nodeId": "bulgarian_split_squat",
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
      "Bend the free leg behind you; reach the arms forward for balance.",
      "Lower slowly until the back knee and toes touch the floor.",
      "Stand up through the front heel; knee in line with the toes."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/squat"
    ],
    "verify": "Not on the OG2 chart; level 3 (next to the Bulgarian split squat) is inferred.",
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
    "id": "intermediate_shrimp_squat",
    "branch": "legs",
    "name": "Intermediate shrimp squat",
    "description": "A shrimp squat in which only the back knee touches the floor at the bottom, the toes stay up. Harder than the beginner version because the leg works through a deeper range.",
    "chainOrder": 65,
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
        "nodeId": "beginner_shrimp_squat",
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
    "regressionId": "beginner_shrimp_squat",
    "cues": [
      "Free leg bent behind you, toes kept off the floor.",
      "Lower until only the knee touches the floor, softly.",
      "Stand up without the back foot pushing off."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/squat"
    ],
    "verify": "Not on the OG2 chart; level 4 (next to the pistol squat) is inferred.",
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
    "id": "nordic_curl",
    "branch": "legs",
    "name": "Nordic curl",
    "description": "Kneeling with the heels anchored, you lower the straight body towards the floor using the hamstrings and pull yourself back up without pushing off with the hands. The full nordic curl.",
    "chainOrder": 90,
    "ogLevel": 5,
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
        "nodeId": "nordic_curl_negative",
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
    "regressionId": "nordic_curl_negative",
    "cues": [
      "Knees on a pad, heels anchored, body straight from knees to head.",
      "Lower slowly with the hips extended; do not bend at the waist.",
      "Pull back up with the hamstrings; catch yourself with the hands only if needed."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/hinge"
    ],
    "verify": "Not on the OG2 chart; level 5 (above the negative at 4) and the 3 x 5 standard are inferred.",
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
    "id": "ring_muscle_up",
    "branch": "dynamic",
    "name": "Ring muscle-up",
    "description": "On rings with a false grip, you pull up high, turn the wrists over the rings and press out to a straight-arm support. The classic rings muscle-up.",
    "chainOrder": 35,
    "ogLevel": 5,
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
      },
      {
        "nodeId": "ring_dip",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Ring dips make the press-out after the transition much easier."
      },
      {
        "nodeId": "kipping_muscle_up",
        "minLevel": 5,
        "kind": "recommended",
        "note": "A bar muscle-up teaches the transition first."
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
        "rings"
      ]
    ],
    "alternatives": [],
    "regressionId": "muscle_up_negative",
    "cues": [
      "Set a false grip, the wrist over the ring.",
      "Pull the rings to the lower chest, then lean forward over them.",
      "Turn through to a deep dip and press out to straight arms."
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
    "id": "elbow_lever",
    "branch": "dynamic",
    "name": "Elbow lever",
    "description": "Balancing the body horizontally on the hands, with the bent elbows dug into the hips as a support. A balance skill that usually follows the frog stand.",
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
    "id": "advanced_tuck_human_flag",
    "branch": "dynamic",
    "name": "Advanced tuck human flag",
    "description": "A human flag with the hips open and the back flat, knees still bent, the body held sideways off a vertical pole. It sits between the tuck and the straddle flag.",
    "chainOrder": 55,
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
      "From the tuck, open the hips so the back is flat and the thighs point away.",
      "Top hand pulls, bottom hand pushes; both arms stay straight.",
      "Keep the body level with the floor."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Overcoming-Gravity-2nd-Edition-Exercise-Charts.pdf",
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf"
    ],
    "verify": "OG2 prints tuck 5, advanced tuck 6, straddle 7, full 8; the dataset has straddle and full at 6 (PLAN 1.6), so 6 keeps the order. The 5-15 s range and 3 x 15 s trial follow the other flags.",
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
    "id": "butterfly_stretch",
    "branch": "flexibility",
    "name": "Butterfly stretch",
    "description": "Sitting upright with the soles of the feet together and the knees falling out to the sides, you let the inner thighs open. Called bound angle pose (baddha konasana) in yoga; it opens the groin and hips.",
    "chainOrder": 15,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 15,
      "max": 45
    },
    "trial": {
      "sets": 3,
      "target": 45
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
      "Sit tall on the sitting bones; put a cushion under the hips if the back rounds.",
      "Hold the ankles, not the toes, and draw the heels in as far as is comfortable.",
      "Let the knees sink by relaxing; press them down gently with the elbows, never bounce."
    ],
    "sourceUrls": [
      "https://en.wikipedia.org/wiki/Baddha_Konasana",
      "https://gmb.io/hip-mobility/"
    ],
    "verify": "OG level 0 is assumed. The trial uses the top of GMB's 15-45 s stretch hold; no source sets a pass standard, and a range goal (knees near the floor) may suit better than a time.",
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
    "id": "half_split",
    "branch": "flexibility",
    "name": "Half split",
    "description": "Kneeling on one knee with the front leg straight out in front and the heel on the floor, you hinge forward from the hips over the front leg. Called ardha hanumanasana in yoga; it stretches the hamstrings on the way to the front split.",
    "chainOrder": 32,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 15,
      "max": 45
    },
    "trial": {
      "sets": 3,
      "target": 45
    },
    "prerequisites": [
      {
        "nodeId": "pike_fold",
        "minLevel": 5,
        "kind": "hard"
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
    "regressionId": "pike_fold",
    "cues": [
      "Back knee under the hip, front heel on the floor, front toes pointing up.",
      "Hinge from the hips with a long, flat back; reach the chest towards the toes.",
      "Hold each side; use blocks or books under the hands if the floor is too far."
    ],
    "sourceUrls": [
      "https://gmb.io/splits/",
      "https://en.wikipedia.org/wiki/Hanumanasana"
    ],
    "verify": "GMB's front split routine uses hamstring hinges like this one but does not name the pose. OG level 0 is assumed; the trial uses the top of GMB's 15-45 s hold.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "pigeon_pose",
    "branch": "flexibility",
    "name": "Pigeon pose",
    "description": "The front leg is folded across in front of you with the shin on the floor, the back leg stretched long behind, and the hips sink towards the floor. A deep hip opener from yoga (kapota means dove or pigeon) and the first step towards the king pigeon.",
    "chainOrder": 35,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 15,
      "max": 45
    },
    "trial": {
      "sets": 3,
      "target": 45
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
      "Keep the hips square to the front; pad under the front hip if it floats high.",
      "Front foot flexed to protect the knee; ease off at any pain in the knee.",
      "Stay upright on the hands, or walk them forward to fold over the front leg."
    ],
    "sourceUrls": [
      "https://en.wikipedia.org/wiki/Eka_Pada_Rajakapotasana",
      "https://gmb.io/hip-mobility/"
    ],
    "verify": "OG level 0 is assumed. The trial uses the top of GMB's 15-45 s stretch hold; no source sets a pass standard.",
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
    "id": "frog_stretch",
    "branch": "flexibility",
    "name": "Frog stretch",
    "description": "On hands or forearms and knees, the knees slide wide apart with the shins parallel and the feet turned out, and the hips sink back between them. A weight-bearing stretch for the inner thighs and the middle split.",
    "chainOrder": 42,
    "ogLevel": 1,
    "metric": "hold_s",
    "workingRange": {
      "min": 15,
      "max": 45
    },
    "trial": {
      "sets": 3,
      "target": 45
    },
    "prerequisites": [
      {
        "nodeId": "butterfly_stretch",
        "minLevel": 5,
        "kind": "hard"
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
    "regressionId": "butterfly_stretch",
    "cues": [
      "Knees in line with the hips, ankles in line with the knees; pad under the knees.",
      "Rock the hips slowly back and forward, then hold where the stretch builds.",
      "Keep the back flat; widen the knees only a little at a time."
    ],
    "sourceUrls": [
      "https://gmb.io/hip-mobility/",
      "https://gmb.io/splits/"
    ],
    "verify": "Part of GMB's hip routine and middle split routine. OG level 1 is inferred (a deeper stretch than the butterfly); the trial uses the top of GMB's 15-45 s hold.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "couch_stretch",
    "branch": "flexibility",
    "name": "Couch stretch",
    "description": "Kneeling in a lunge with the back knee close to a wall or couch and the back shin running up it, you lift the chest until the front of the hip and thigh are stretched. A strong hip flexor and quad stretch, used before the front split and the king pigeon.",
    "chainOrder": 44,
    "ogLevel": 1,
    "metric": "hold_s",
    "workingRange": {
      "min": 30,
      "max": 60
    },
    "trial": {
      "sets": 3,
      "target": 60
    },
    "prerequisites": [
      {
        "nodeId": "pigeon_pose",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Open hips make the upright position easier to reach."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Start in a low lunge with the hands on the floor and the back knee a little away from the wall.",
      "Squeeze the glutes and tuck the pelvis under before lifting the chest.",
      "Move the knee closer to the wall only when upright feels easy; it should not hurt."
    ],
    "sourceUrls": [
      "https://www.garagegymreviews.com/couch-stretch",
      "https://www.active.com/triathlon/articles/the-stretch-that-could-be-the-key-to-saving-your-knees"
    ],
    "verify": "Popularised by Kelly Starrett; the guides give 30-60 s or 1-2 min holds, so the 3 x 60 s trial is a placeholder. OG level 1 is inferred.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "half_lotus",
    "branch": "flexibility",
    "name": "Half lotus",
    "description": "Sitting cross-legged, one foot rests high on the opposite thigh with its sole turned up while the other leg stays folded under. Called ardha padmasana in yoga; the step before the full lotus.",
    "chainOrder": 46,
    "ogLevel": 1,
    "metric": "hold_s",
    "workingRange": {
      "min": 30,
      "max": 60
    },
    "trial": {
      "sets": 3,
      "target": 60
    },
    "prerequisites": [
      {
        "nodeId": "butterfly_stretch",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "pigeon_pose",
        "minLevel": 5,
        "kind": "recommended",
        "note": "The lotus needs a lot of outward hip rotation; the pigeon trains it."
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
    "regressionId": "butterfly_stretch",
    "cues": [
      "Turn the whole thigh out from the hip first, then lift the foot with the hands.",
      "Never force it from the knee; stop at any pinch inside the knee.",
      "Sit on a cushion so the knees can drop below the hips."
    ],
    "sourceUrls": [
      "https://en.wikipedia.org/wiki/Lotus_position",
      "https://en.wikipedia.org/wiki/Baddha_Konasana"
    ],
    "verify": "The lotus is one of the yoga poses that most often injures the knee (Wikipedia: the medial meniscus); OG level 1 and the 3 x 60 s trial are inferred placeholders.",
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
    "id": "pancake",
    "branch": "flexibility",
    "name": "Pancake",
    "description": "Sitting with the legs straight and spread wide, you fold the upper body forward from the hips towards the floor between the legs. Called upavistha konasana in yoga; it stretches the inner thighs and hamstrings together.",
    "chainOrder": 60,
    "ogLevel": 2,
    "metric": "hold_s",
    "workingRange": {
      "min": 15,
      "max": 45
    },
    "trial": {
      "sets": 3,
      "target": 45
    },
    "prerequisites": [
      {
        "nodeId": "pike_fold",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "frog_stretch",
        "minLevel": 5,
        "kind": "hard"
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
    "regressionId": "pike_fold",
    "cues": [
      "Sit on a cushion if the pelvis tips back; knees and toes point up.",
      "Tilt the pelvis forward and lead with the chest, not the head.",
      "Press the heels into the floor while folding, then relax deeper."
    ],
    "sourceUrls": [
      "https://gmb.io/splits/",
      "https://en.wikipedia.org/wiki/Paschimottanasana"
    ],
    "verify": "Part of GMB's side split routine. OG level 2 is inferred; the trial uses the top of GMB's 15-45 s hold, and a range goal (chest towards the floor) may suit better than a time.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "front_split",
    "branch": "flexibility",
    "name": "Front split",
    "description": "One leg stretched straight forward and the other straight back, with the hips square and sinking to the floor. Called hanumanasana in yoga; blocks under the hands or hips support the way down.",
    "chainOrder": 70,
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
        "nodeId": "half_split",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "couch_stretch",
        "minLevel": 5,
        "kind": "hard"
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
    "regressionId": "half_split",
    "cues": [
      "Square the hips to the front; the back knee points down, not out.",
      "Slide down slowly with hands or blocks beside the hips to take weight.",
      "Hold at a strong but calm stretch; flat on the floor comes over months."
    ],
    "sourceUrls": [
      "https://gmb.io/splits/",
      "https://en.wikipedia.org/wiki/Hanumanasana",
      "https://en.wikipedia.org/wiki/Splits_(gymnastics)"
    ],
    "verify": "No source gives a pass time; the trial follows the general RR 3 x 30 s hold rule (with or without blocks is the user's call). OG level 3 is inferred, kept modest because flexibility counts towards the rank median.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "lotus",
    "branch": "flexibility",
    "name": "Lotus",
    "description": "Sitting cross-legged with each foot resting high on the opposite thigh, soles turned up. The classic yoga meditation seat (padmasana); it needs very open hips.",
    "chainOrder": 80,
    "ogLevel": 3,
    "metric": "hold_s",
    "workingRange": {
      "min": 30,
      "max": 60
    },
    "trial": {
      "sets": 3,
      "target": 60
    },
    "prerequisites": [
      {
        "nodeId": "half_lotus",
        "minLevel": 5,
        "kind": "hard"
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
    "regressionId": "half_lotus",
    "cues": [
      "Set the first foot in half lotus, then rotate the second thigh out from the hip.",
      "Lift the second foot over with the hands; never lever it in with the knee.",
      "Switch which leg goes on top between sets."
    ],
    "sourceUrls": [
      "https://en.wikipedia.org/wiki/Lotus_position"
    ],
    "verify": "Wikipedia notes about 115 degrees of outward hip rotation is needed and warns of meniscus injury from forcing it. OG level 3 and the 3 x 60 s trial are inferred placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "one_leg_wheel",
    "branch": "flexibility",
    "name": "One-leg wheel",
    "description": "From a full bridge, one leg lifts and points straight up while the arms and the other leg hold the arch. Called eka pada urdhva dhanurasana in yoga; the next bridge step on the BWF chart.",
    "chainOrder": 90,
    "ogLevel": 3,
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
        "nodeId": "full_bridge",
        "minLevel": 5,
        "kind": "hard"
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
    "regressionId": "full_bridge",
    "cues": [
      "Shift the weight over the standing foot and the hands before lifting the leg.",
      "Keep the shoulders pushed over the hands while the leg rises.",
      "Lower the leg slowly; switch legs between sets."
    ],
    "sourceUrls": [
      "https://www.calisthenics-101.co.uk/wp-content/uploads/2020/05/Bodyweight-Fitness-Progressions-Version-5.4.pdf",
      "https://en.wikipedia.org/wiki/Chakrasana"
    ],
    "verify": "The BWF chart lists the one-leg bridge after the full and decline bridge without a standard; OG level 3 and the 3 x 15 s trial are inferred.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "middle_split",
    "branch": "flexibility",
    "name": "Middle split",
    "description": "Both legs stretched straight out to the sides, with the hips sinking to the floor between them. Also called a side or straddle split (samakonasana in yoga).",
    "chainOrder": 100,
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
        "nodeId": "pancake",
        "minLevel": 5,
        "kind": "hard"
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
    "regressionId": "pancake",
    "cues": [
      "Tilt the pelvis forward and keep the knees and toes pointing up or forward.",
      "Take weight on the hands or forearms and slide the feet apart a little at a time.",
      "Stop at any pain in the hip joint or the inside of the knee."
    ],
    "sourceUrls": [
      "https://gmb.io/splits/",
      "https://en.wikipedia.org/wiki/Splits_(gymnastics)"
    ],
    "verify": "No source gives a pass time; the trial follows the general RR 3 x 30 s hold rule. OG level 4 is inferred (harder for most adults than the front split), kept modest because flexibility counts towards the rank median.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "king_pigeon",
    "branch": "flexibility",
    "name": "King pigeon",
    "description": "From pigeon pose, the back knee bends and both hands reach back over the head to hold the back foot, with the chest lifted in a deep backbend. Called eka pada rajakapotasana in yoga, the king of the pigeon poses.",
    "chainOrder": 110,
    "ogLevel": 4,
    "metric": "hold_s",
    "workingRange": {
      "min": 5,
      "max": 20
    },
    "trial": {
      "sets": 3,
      "target": 20
    },
    "prerequisites": [
      {
        "nodeId": "pigeon_pose",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "couch_stretch",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "full_bridge",
        "minLevel": 5,
        "kind": "hard"
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
      ],
      [
        "bands"
      ]
    ],
    "alternatives": [],
    "regressionId": "pigeon_pose",
    "cues": [
      "Start with a strap or band around the back foot and walk the hands down it.",
      "Lift the chest and lengthen the spine before bending back.",
      "Elbows point up; come out slowly the way you went in.",
      "Front foot flexed to protect the knee, as in pigeon pose; ease off at any pain in the knee."
    ],
    "sourceUrls": [
      "https://en.wikipedia.org/wiki/Eka_Pada_Rajakapotasana",
      "https://www.garagegymreviews.com/couch-stretch"
    ],
    "verify": "No source gives a pass time; the 3 x 20 s trial is a placeholder (yoga holds poses for a few breaths). OG level 4 is inferred. The prerequisites (pigeon for the hips, couch stretch for the quad, full bridge for the backbend) are our synthesis.",
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
  },
  {
    "id": "cat_cow",
    "branch": "mobility",
    "name": "Cat-cow",
    "description": "On hands and knees, you slowly round the whole back up towards the ceiling (cat) and then let it sink into an arch with the chest forward (cow). A gentle warm-up that moves the spine through flexion and extension.",
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
      "Hands under the shoulders, knees under the hips.",
      "Move one segment at a time, from the tailbone up to the head and back.",
      "Breathe out as you round, in as you arch; slow and smooth."
    ],
    "sourceUrls": [
      "https://en.wikipedia.org/wiki/Bitilasana"
    ],
    "verify": "A yoga warm-up with no rep standard; OG level 0 and the 3 x 12 trial (like wrist prep) are placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "ankle_rocks",
    "branch": "mobility",
    "name": "Knee-to-wall ankle rocks",
    "description": "Standing in a short lunge facing a wall, you rock the front knee forward over the toes to touch the wall while the heel stays down. It trains ankle dorsiflexion for deep squats and pistols.",
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
        "wall"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Front heel stays flat; the knee travels over the middle toes, not inwards.",
      "Move the foot back a little once the knee touches the wall easily.",
      "Test: toe to wall at 12.5 cm or more with the knee touching counts as normal range."
    ],
    "sourceUrls": [
      "https://www.physiotutors.com/wiki/weight-bearing-lunge-test",
      "https://library.theprehabguys.com/vimeo-video/knee-to-wall-ankle-dorsiflexion-assessment"
    ],
    "verify": "The weight-bearing lunge test calls 12.5 cm toe-to-wall normal (Physiotutors), but the app has no distance metric, so the trial counts controlled reps; 3 x 12 is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "hip_cars",
    "branch": "mobility",
    "name": "Hip CARs",
    "description": "Standing on one leg (or on hands and knees), you draw the biggest slow circle you can with the other knee, keeping the rest of the body still. Controlled articular rotations from Functional Range Conditioning; they keep the hip's full range under your control.",
    "chainOrder": 30,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5
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
      "Brace the whole body so only the hip moves; hold a wall if balance is the limit.",
      "Go slowly and make the circle as large as you can control.",
      "Circle forward, then backward, on each side."
    ],
    "sourceUrls": [
      "https://library.theprehabguys.com/intro-to-frc/"
    ],
    "verify": "FRC describes how to do CARs but gives no rep standard; OG level 0 and the 3 x 5 trial are placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "shoulder_cars",
    "branch": "mobility",
    "name": "Shoulder CARs",
    "description": "Standing tall with one arm straight, you move it in the biggest slow circle you can, forward, up past the ear, behind and back down, without twisting the body. Controlled articular rotations for the shoulder.",
    "chainOrder": 40,
    "ogLevel": 0,
    "metric": "reps",
    "workingRange": {
      "min": 3,
      "max": 5
    },
    "trial": {
      "sets": 3,
      "target": 5
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
      "Make a fist and tense the whole body so the ribs and hips stay still.",
      "Turn the palm as the arm passes overhead so the circle stays smooth.",
      "Slow is the point; circle both ways on each side."
    ],
    "sourceUrls": [
      "https://library.theprehabguys.com/intro-to-frc/"
    ],
    "verify": "FRC describes how to do CARs but gives no rep standard; OG level 0 and the 3 x 5 trial are placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "open_book",
    "branch": "mobility",
    "name": "Open book",
    "description": "Lying on your side with the knees bent and both arms straight in front, you lift the top arm up and over to the other side, letting the chest turn while the knees stay together. It mobilises the upper back in rotation.",
    "chainOrder": 50,
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
    "prerequisites": [
      {
        "nodeId": "cat_cow",
        "minLevel": 5,
        "kind": "hard"
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
    "cues": [
      "Keep the knees stacked and on the floor so the turn comes from the upper back.",
      "Follow the hand with your eyes; breathe out as you open.",
      "Pause where it stretches, then close the book slowly."
    ],
    "sourceUrls": [
      "https://us.physitrack.com/home-exercise-video/thoracic-rotation-in-side-lying"
    ],
    "verify": "A physiotherapy exercise with no rep standard; OG level 0 and the 3 x 12 trial are placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "wall_angel",
    "branch": "mobility",
    "name": "Wall angel",
    "description": "Standing with the head, back and arms against a wall, arms bent like a goal post, you slide the arms up overhead and back down without anything leaving the wall. It trains overhead shoulder and upper back mobility.",
    "chainOrder": 60,
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
    "prerequisites": [
      {
        "nodeId": "shoulder_cars",
        "minLevel": 5,
        "kind": "hard"
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "equipment": [
      [
        "wall"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Feet a hand's width from the wall; keep the lower back from arching off it.",
      "Elbows, wrists and the backs of the hands stay touching the wall.",
      "Slide only as high as you can without losing contact."
    ],
    "sourceUrls": [
      "https://squatuniversity.com/2016/07/29/the-squat-fix-screening-overhead-mobility/"
    ],
    "verify": "Squat University uses the start position as a pass/fail screen (everything flat on the wall); the 3 x 12 trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "hip_90_90_switch",
    "branch": "mobility",
    "name": "90/90 hip switch",
    "description": "Sitting with both knees bent to 90 degrees, one leg in front and one to the side, you swing both knees over to the other side without using the hands. It trains inward and outward hip rotation.",
    "chainOrder": 70,
    "ogLevel": 0,
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
        "nodeId": "hip_cars",
        "minLevel": 5,
        "kind": "hard"
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
    "cues": [
      "Sit tall; lean back on the hands at first, then take them away.",
      "Lift the knees and rotate from the hips, keeping the feet roughly in place.",
      "Pause in each 90/90 position with the chest over the front shin."
    ],
    "sourceUrls": [
      "https://health.clevelandclinic.org/90-90-stretch/",
      "https://library.theprehabguys.com/vimeo-video/90-90-hip-lift-off/"
    ],
    "verify": "Cleveland Clinic gives 20-60 s holds for the static 90/90 and warns against it with hip impingement or knee problems; the 3 x 10 switches trial is a placeholder.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "deep_squat_hold",
    "branch": "mobility",
    "name": "Deep squat hold",
    "description": "Resting at the bottom of a squat, hips low between the heels and the feet flat, the arms relaxed in front. A resting position rather than a lift; it opens the ankles, hips and lower back.",
    "chainOrder": 80,
    "ogLevel": 0,
    "metric": "hold_s",
    "workingRange": {
      "min": 30,
      "max": 60
    },
    "trial": {
      "sets": 3,
      "target": 60
    },
    "prerequisites": [
      {
        "nodeId": "ankle_rocks",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "squat",
        "minLevel": 5,
        "kind": "recommended",
        "note": "The bodyweight squat teaches the way down and back up."
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
    "cues": [
      "Feet a little wider than the hips and turned out; heels stay down.",
      "Press the knees out with the elbows and let the back relax.",
      "Hold a door frame or a post at first if you tip backwards."
    ],
    "sourceUrls": [
      "https://antranik.org/the-30-minutes-a-day-squat-challenge/"
    ],
    "verify": "Ido Portal's squat challenge accumulates 30 minutes a day in this position (via Antranik), not a set standard; the 3 x 60 s trial and OG level 0 are placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "cossack_squat",
    "branch": "mobility",
    "name": "Cossack squat",
    "description": "From a wide stance, you sink sideways into a deep squat over one leg while the other stays straight with the toes pointing up, then shift across to the other side. Strength and mobility for the hips, inner thighs and ankles.",
    "chainOrder": 90,
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
        "nodeId": "deep_squat_hold",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "hip_90_90_switch",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Hip rotation helps the bent leg stay in line."
      }
    ],
    "straightArm": false,
    "isSkill": false,
    "patterns": [
      "mobility"
    ],
    "trains": [
      "mobility",
      "legs"
    ],
    "equipment": [
      [
        "floor"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Bent-leg heel stays flat and the knee follows the toes.",
      "Chest up; hold the hands in front as a counterweight.",
      "Go only as deep as you can control, and shift across slowly."
    ],
    "sourceUrls": [
      "https://gmb.io/splits/"
    ],
    "verify": "Part of GMB's side split routine; OG level 1 and the 3 x 8 trial are inferred (rep range from the RR strength rule).",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "three_point_bridge",
    "branch": "mobility",
    "name": "Three-point bridge",
    "description": "From sitting with the hands behind you, you lift the hips and turn onto one hand and both feet, reaching the other arm over the head so the chest opens to the ceiling. A rotating bridge that mobilises the upper back and shoulders.",
    "chainOrder": 100,
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
        "nodeId": "open_book",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "table_bridge",
        "minLevel": 5,
        "kind": "recommended",
        "note": "The table bridge teaches the hip lift."
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
    "cues": [
      "Push the hips high and squeeze the glutes as you turn.",
      "Reach the free arm long over the head and look under it.",
      "Hold 5-10 s at the top, then sit back down and switch sides."
    ],
    "sourceUrls": [
      "https://gmb.io/shoulder-mobility/"
    ],
    "verify": "GMB's shoulder routine holds it 5-10 s each side, alternating; OG level 1 and the 3 x 8 trial are inferred placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  },
  {
    "id": "overhead_squat",
    "branch": "mobility",
    "name": "Overhead squat",
    "description": "A bodyweight squat to full depth with the arms held straight overhead, often holding a broomstick or a band wide. It checks ankles, hips, upper back and shoulders together, a common movement screen.",
    "chainOrder": 110,
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
        "nodeId": "deep_squat_hold",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "wall_angel",
        "minLevel": 5,
        "kind": "hard"
      },
      {
        "nodeId": "shoulder_dislocate",
        "minLevel": 5,
        "kind": "recommended",
        "note": "Open shoulders keep the arms from drifting forward."
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
      ],
      [
        "bands"
      ]
    ],
    "alternatives": [],
    "cues": [
      "Arms stay in line with the ears all the way down; don't let them drift forward.",
      "Heels down, knees out over the toes, chest up.",
      "Clasp the hands behind the head instead if the arms are the limit."
    ],
    "sourceUrls": [
      "https://passport.world.rugby/conditioning-for-rugby/introduction-to-conditioning-youth/functional-screening/progressing-the-overhead-squat/"
    ],
    "verify": "World Rugby screens the shape (upright torso, arms overhead, depth, no compensations) without a rep standard; OG level 1 and the 3 x 8 trial are placeholders.",
    "review": {
      "status": "draft"
    },
    "source": "core"
  }
];
