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
    "alternatives": [],
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
    "verify": "Pull-up prerequisite (8-15 strict pull-ups, secondary sources) still to be added.",
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
  }
];
