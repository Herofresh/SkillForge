/**
 * The companion's data (PLAN 6.10 / 6.13, ADR-059 / ADR-061): bodies, hair styles, accessories,
 * class weapons, animations and colours, and the sprite frames they make together. One source of
 * truth for the Character tab, the Train summary, the home-screen widget and the preview scripts.
 */
import {
  DEFAULT_COMPANION_BODY,
  loadoutDrawOrder,
  type CompanionLoadout,
} from '@/domain/companion';
import {
  finishSprite,
  mirrorPart,
  SpriteCanvas,
  spriteRows,
  type Legend,
  type Point,
  type SpriteCell,
  type SpritePart,
} from '@/lib/sprite';

import { ACCESSORY_ART, GEAR_LEGEND, WEAPON_ART, type AccessoryArt, type PlacedPart } from './art';
import {
  armPlacement,
  BODY_LEGEND,
  BODY_SHAPES,
  faceCells,
  FIST,
  GROUND_Y,
  HAIR_STYLE_BY_ID,
  LEG_PARTS,
  REGIONS,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  TORSO_WIDTH,
  type BodyFrame,
  type BodyShape,
  type HairStyle,
} from './body';
import { companionRole, SHINY_MATERIALS, type CompanionLook } from './looks';
import { COMPANION_ANIMATIONS, type CompanionAnimation, type SpriteFrame } from './moods';

export { ACCESSORIES, ACCESSORY_BY_ID, type Accessory } from './accessories';
export { ACCESSORY_ART, WEAPON_ART } from './art';
export {
  BODY_SHAPES,
  HAIR_STYLES,
  SPRITE_HEIGHT,
  SPRITE_SIZE,
  SPRITE_WIDTH,
  type BodyShape,
  type HairStyle,
} from './body';
export * from './looks';
export { COMPANION_ANIMATIONS, type CompanionAnimation } from './moods';
export { CLASS_WEAPONS, weaponFor, type ClassWeapon } from './weapons';

/** The class weapon to draw: the worn class and whether it shows its tier III look. */
export interface WeaponChoice {
  classId: string;
  upgraded: boolean;
}

/** What the companion wears. */
export interface CompanionOutfit {
  loadout: CompanionLoadout;
  /** Absent: empty hands. */
  weapon?: WeaponChoice;
}

/** The ground shadow under the feet. */
const GROUND = { centre: { x: 16, y: GROUND_Y + 1.4 }, rx: 9, ry: 1.2 };

/** How far right of the torso box a planted weapon's grip stands when no hand rests on it. */
const PLANT_DX = 15;
/** Where a shield leans on the ground (left of the torso box). */
const SHIELD_GROUND_DX = -8;

const at = (box: Point, placed: { dx: number; dy: number }): Point => ({
  x: box.x + placed.dx,
  y: box.y + placed.dy,
});

const widthOf = (part: SpritePart) => Math.max(...part.rows.map((row) => row.length));

/** The body shape and hair style a look asks for (unknown ids = the defaults). */
export function companionBody(look: CompanionLook = {}): { shape: BodyShape; hair: HairStyle } {
  const shape = BODY_SHAPES[look.body ?? DEFAULT_COMPANION_BODY] ?? BODY_SHAPES.man;
  const hair =
    HAIR_STYLE_BY_ID.get(look.hairStyle ?? '') ??
    (HAIR_STYLE_BY_ID.get(shape.defaultHair) as HairStyle);
  return { shape, hair };
}

/** A legend whose materials are swapped (a weapon's tier III look). */
function swapped(legend: Legend, swaps: Readonly<Record<string, string>>): Legend {
  return Object.fromEntries(
    Object.entries(legend).map(([char, cell]) => [
      char,
      'material' in cell && swaps[cell.material]
        ? { ...cell, material: swaps[cell.material] }
        : cell,
    ]),
  );
}

/** Flips a part top to bottom (a sword held or planted point down). */
const flipPart = (part: SpritePart): SpritePart => ({ rows: [...part.rows].reverse() });

/**
 * Draws a part whose lower half sways sideways by `sway` pixels (a cloak, long hair): the rows
 * below the middle move, so the hem swings while the shoulders stay put.
 */
function drawSwaying(
  canvas: SpriteCanvas,
  part: SpritePart,
  origin: Point,
  legend: Legend,
  sway: number,
) {
  const length = part.rows.length;
  part.rows.forEach((row, index) => {
    const offset = index >= length * 0.75 ? sway * 2 : index >= length * 0.45 ? sway : 0;
    canvas.draw({ rows: [row] }, { x: origin.x + offset, y: origin.y + index }, legend);
  });
}

/** Whether the screen-left hand can carry a shield in this frame. */
const leftHandFree = (body: BodyFrame) =>
  body.arms[0] !== 'cross' && body.arms[0] !== 'salute' && body.legs !== 'kneel';

/** A shield leaning on the ground left of the hero. */
function drawOnGround(canvas: SpriteCanvas, part: SpritePart, body: BodyFrame, legend: Legend) {
  canvas.draw(
    part,
    { x: body.torso.x + SHIELD_GROUND_DX, y: GROUND_Y + 1 - part.rows.length },
    legend,
  );
}

function drawWeapon(
  canvas: SpriteCanvas,
  frame: SpriteFrame,
  weapon: WeaponChoice,
  shape: BodyShape,
) {
  const art = WEAPON_ART[weapon.classId] ?? WEAPON_ART.recruit;
  const legend = weapon.upgraded ? swapped(GEAR_LEGEND, art.upgrade) : GEAR_LEGEND;
  const marks = weapon.upgraded ? (art.upgradeMarks ?? []) : [];
  const body = frame.body;
  const right = armPlacement(body, 1, shape);
  const left = armPlacement(body, -1, shape);
  const pointDown = frame.weapon !== 'held' && art.plant !== 'upright';
  const part = pointDown ? flipPart(art.part) : art.part;
  const height = art.part.rows.length;
  const width = widthOf(art.part);
  const grip = pointDown ? { x: art.grip.x, y: height - 1 - art.grip.y } : art.grip;
  const draw = (origin: Point, mirror: boolean) => {
    canvas.draw(part, origin, legend, mirror);
    for (const mark of marks) {
      const x = mirror ? width - 1 - mark.x : mark.x;
      const y = pointDown ? height - 1 - mark.y : mark.y;
      canvas.set(origin.x + x, origin.y + y, { fixed: mark.fixed });
    }
  };
  const hold = (hand: Point, mirror: boolean) => {
    const gripX = mirror ? width - 1 - grip.x : grip.x;
    draw({ x: hand.x - gripX, y: hand.y - grip.y }, mirror);
    canvas.draw(FIST, { x: hand.x - (mirror ? 0 : 1), y: hand.y - 1 }, BODY_LEGEND);
  };
  if (frame.weapon === 'planted') {
    // Standing on the ground beside the hero; a hanging hand rests on it.
    const resting = body.arms[1] === 'down';
    const gripX = resting ? right.hand.x : body.torso.x + PLANT_DX;
    const top = GROUND_Y + 1 - height;
    const lean = art.plantMirror === true;
    draw({ x: gripX - (lean ? width - 1 - grip.x : grip.x), y: top }, lean);
    if (art.twin) {
      const mirrorX = 2 * body.torso.x + TORSO_WIDTH - 1 - gripX;
      draw({ x: mirrorX - (width - 1 - grip.x), y: top }, true);
    }
    if (resting && right.hand.y >= top) {
      canvas.draw(FIST, { x: right.hand.x - 1, y: right.hand.y - 1 }, BODY_LEGEND);
    }
    if (art.offHand) drawOnGround(canvas, art.offHand, body, legend);
    return;
  }
  hold(right.hand, false);
  if (art.twin) hold(left.hand, true);
  if (art.offHand) {
    if (leftHandFree(body)) canvas.draw(art.offHand, at(left.hand, art.offHand), legend);
    else drawOnGround(canvas, art.offHand, body, legend);
  }
}

/** Repaints regions for body and hand accessories (a chainmail torso, leather forearms). */
function recolor(canvas: SpriteCanvas, body: BodyFrame, arts: readonly AccessoryArt[]) {
  for (const art of arts) {
    const change = art.recolor;
    if (!change) continue;
    canvas.map((cell, x, y): SpriteCell | undefined => {
      if (!('material' in cell)) return undefined;
      const material = change.regions[cell.region];
      if (!material) return undefined;
      const patterned =
        change.pattern !== undefined &&
        (cell.region === REGIONS.torso || cell.region === REGIONS.sleeve) &&
        change.pattern(x - body.torso.x, y - body.torso.y);
      return patterned
        ? { material, region: cell.region, tone: 'shadow' }
        : { material, region: cell.region };
    });
  }
}

function drawShoulders(canvas: SpriteCanvas, body: BodyFrame, shape: BodyShape, part: PlacedPart) {
  const width = widthOf(part);
  const y = body.torso.y + 1 + part.dy;
  const leftX = body.torso.x - 3 + shape.armInset + part.dx;
  const rightX = body.torso.x + TORSO_WIDTH + 3 - shape.armInset - width - part.dx;
  canvas.draw(part, { x: leftX, y }, GEAR_LEGEND);
  canvas.draw(mirrorPart(part), { x: rightX, y }, GEAR_LEGEND);
}

/** One frame of the companion as grid rows (`src/lib/pixelGrid.ts` format, role characters). */
export function companionFrame(
  frame: SpriteFrame,
  outfit: CompanionOutfit,
  look: CompanionLook = {},
): string[] {
  const { body } = frame;
  const { shape, hair } = companionBody(look);
  const sway = body.sway ?? 0;
  const arts = loadoutDrawOrder(outfit.loadout).flatMap((id) =>
    ACCESSORY_ART[id] ? [ACCESSORY_ART[id]] : [],
  );
  const hairHidden = arts.some((art) => art.hidesHair);
  const canvas = new SpriteCanvas(SPRITE_WIDTH, SPRITE_HEIGHT);
  for (const art of arts) {
    if (art.back) drawSwaying(canvas, art.back, at(body.torso, art.back), GEAR_LEGEND, sway);
  }
  for (const art of arts) {
    if (art.behindHead) canvas.draw(art.behindHead, at(body.head, art.behindHead), GEAR_LEGEND);
  }
  if (hair.back) drawSwaying(canvas, hair.back, at(body.head, hair.back), BODY_LEGEND, sway);
  canvas.draw(LEG_PARTS[body.legs], body.legsAt, BODY_LEGEND);
  canvas.draw(shape.torso, body.torso, BODY_LEGEND);
  const arms = ([-1, 1] as const).map((side) => ({ side, ...armPlacement(body, side, shape) }));
  for (const arm of arms) {
    if (!arm.overHead) canvas.draw(arm.part, arm.at, BODY_LEGEND, arm.side === 1);
  }
  for (const art of arts) {
    if (art.front) canvas.draw(art.front, at(body.torso, art.front), GEAR_LEGEND);
  }
  canvas.draw(shape.head, body.head, BODY_LEGEND);
  for (const cell of faceCells(body.face, shape)) {
    canvas.set(body.head.x + cell.x, body.head.y + cell.y, cell.cell);
  }
  if (hair.locks) canvas.draw(hair.locks, at(body.head, hair.locks), BODY_LEGEND);
  if (hair.top && !hairHidden) canvas.draw(hair.top, at(body.head, hair.top), BODY_LEGEND);
  for (const art of arts) if (art.head) canvas.draw(art.head, at(body.head, art.head), GEAR_LEGEND);
  for (const arm of arms) {
    if (arm.overHead) canvas.draw(arm.part, arm.at, BODY_LEGEND, arm.side === 1);
  }
  for (const art of arts) if (art.shoulders) drawShoulders(canvas, body, shape, art.shoulders);
  if (outfit.weapon && frame.weapon !== 'none') drawWeapon(canvas, frame, outfit.weapon, shape);
  const left = armPlacement(body, -1, shape);
  for (const art of arts) {
    if (!art.leftHand) continue;
    if (leftHandFree(body)) canvas.draw(art.leftHand, at(left.hand, art.leftHand), GEAR_LEGEND);
    else drawOnGround(canvas, art.leftHand, body, GEAR_LEGEND);
  }
  recolor(canvas, body, arts);
  const aura = arts.find((art) => art.glow);
  const sparkles = arts.flatMap((art) =>
    (art.sparkles ?? []).map((spark) => ({
      x: body.head.x + spark.x,
      y: body.head.y + spark.y,
      fixed: spark.fixed,
    })),
  );
  const finished = finishSprite(canvas, {
    shiny: SHINY_MATERIALS,
    ...(aura?.glow ? { glow: aura.glow } : {}),
    sparkles,
    shadow: { key: 'shadow', ...GROUND },
  });
  return spriteRows(finished, companionRole);
}

/** Every frame of an animation, each repeated for its hold (one entry per frame step). */
export function companionFrames(
  animation: CompanionAnimation,
  outfit: CompanionOutfit,
  look: CompanionLook = {},
): string[][] {
  return COMPANION_ANIMATIONS[animation].flatMap((frame) => {
    const rows = companionFrame(frame, outfit, look);
    return Array.from({ length: frame.hold }, () => rows);
  });
}

/** The still image of an animation (reduce motion, the home-screen widget): its first frame. */
export function companionStill(
  animation: CompanionAnimation,
  outfit: CompanionOutfit,
  look: CompanionLook = {},
): string[] {
  return companionFrame(COMPANION_ANIMATIONS[animation][0], outfit, look);
}
