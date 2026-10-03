/**
 * The companion's data (PLAN 6.10, ADR-059): body parts, accessories, class weapons, animations and
 * colours, and the sprite frames they make together. One source of truth for the Character tab,
 * the Train summary, the home-screen widget and the preview scripts.
 */
import { loadoutDrawOrder, type CompanionLoadout } from '@/domain/companion';
import {
  finishSprite,
  mirrorPart,
  rotatePart,
  SpriteCanvas,
  spriteRows,
  type Legend,
  type Point,
  type SpriteCell,
} from '@/lib/sprite';

import { ACCESSORY_ART, GEAR_LEGEND, WEAPON_ART, type AccessoryArt, type PlacedPart } from './art';
import {
  armPlacement,
  BODY_LEGEND,
  faceCells,
  FIST,
  HEAD,
  LEG_PARTS,
  REGIONS,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  TORSO,
  type BodyFrame,
} from './body';
import { companionRole, SHINY_MATERIALS } from './looks';
import { COMPANION_ANIMATIONS, type CompanionAnimation, type SpriteFrame } from './moods';

export { ACCESSORIES, ACCESSORY_BY_ID, type Accessory } from './accessories';
export { ACCESSORY_ART, WEAPON_ART } from './art';
export { SPRITE_HEIGHT, SPRITE_WIDTH } from './body';
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
const GROUND = { centre: { x: 16, y: 37.6 }, rx: 8, ry: 1.3 };

const at = (box: Point, placed: PlacedPart): Point => ({
  x: box.x + placed.dx,
  y: box.y + placed.dy,
});

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

function drawWeapon(canvas: SpriteCanvas, frame: SpriteFrame, weapon: WeaponChoice) {
  const art = WEAPON_ART[weapon.classId] ?? WEAPON_ART.recruit;
  const legend = weapon.upgraded ? swapped(GEAR_LEGEND, art.upgrade) : GEAR_LEGEND;
  const marks = weapon.upgraded ? (art.upgradeMarks ?? []) : [];
  const right = armPlacement(frame.body, 1);
  const left = armPlacement(frame.body, -1);
  if (frame.weapon === 'ground') {
    const lying = rotatePart(art.part);
    const origin = { x: 19, y: SPRITE_HEIGHT - 2 - lying.rows.length };
    canvas.draw(lying, origin, legend);
    return;
  }
  const hold = (hand: Point, mirror: boolean) => {
    const width = Math.max(...art.part.rows.map((row) => row.length));
    const gripX = mirror ? width - 1 - art.grip.x : art.grip.x;
    const origin = { x: hand.x - gripX, y: hand.y - art.grip.y };
    canvas.draw(art.part, origin, legend, mirror);
    for (const mark of marks) {
      const x = mirror ? width - 1 - mark.x : mark.x;
      canvas.set(origin.x + x, origin.y + mark.y, { fixed: mark.fixed });
    }
    canvas.draw(FIST, { x: hand.x - (mirror ? 0 : 1), y: hand.y - 1 }, BODY_LEGEND);
  };
  hold(right.hand, false);
  if (art.twin) hold(left.hand, true);
  if (art.offHand) canvas.draw(art.offHand, at(left.hand, art.offHand), legend);
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

/** One frame of the companion as grid rows (`src/lib/pixelGrid.ts` format, role characters). */
export function companionFrame(frame: SpriteFrame, outfit: CompanionOutfit): string[] {
  const { body } = frame;
  const arts = loadoutDrawOrder(outfit.loadout).flatMap((id) =>
    ACCESSORY_ART[id] ? [ACCESSORY_ART[id]] : [],
  );
  const canvas = new SpriteCanvas(SPRITE_WIDTH, SPRITE_HEIGHT);
  for (const art of arts)
    if (art.back) canvas.draw(art.back, at(body.torso, art.back), GEAR_LEGEND);
  for (const art of arts) {
    if (art.behindHead) canvas.draw(art.behindHead, at(body.head, art.behindHead), GEAR_LEGEND);
  }
  canvas.draw(LEG_PARTS[body.legs], body.legsAt, BODY_LEGEND);
  canvas.draw(TORSO, body.torso, BODY_LEGEND);
  for (const side of [-1, 1] as const) {
    const arm = armPlacement(body, side);
    canvas.draw(arm.part, arm.at, BODY_LEGEND, side === 1);
  }
  for (const art of arts)
    if (art.front) canvas.draw(art.front, at(body.torso, art.front), GEAR_LEGEND);
  canvas.draw(HEAD, body.head, BODY_LEGEND);
  for (const cell of faceCells(body.face)) {
    canvas.set(body.head.x + cell.x, body.head.y + cell.y, { fixed: cell.key });
  }
  for (const art of arts) if (art.head) canvas.draw(art.head, at(body.head, art.head), GEAR_LEGEND);
  for (const art of arts) {
    if (art.shoulders) {
      const shoulder = { x: body.torso.x - 3, y: body.torso.y + 1 };
      canvas.draw(art.shoulders, at(shoulder, art.shoulders), GEAR_LEGEND);
      const width = Math.max(...art.shoulders.rows.map((row) => row.length));
      const mirrored = {
        x: body.torso.x + 13 - width - art.shoulders.dx,
        y: shoulder.y + art.shoulders.dy,
      };
      canvas.draw(mirrorPart(art.shoulders), mirrored, GEAR_LEGEND);
    }
  }
  if (outfit.weapon && frame.weapon !== 'none') drawWeapon(canvas, frame, outfit.weapon);
  const left = armPlacement(body, -1);
  for (const art of arts) {
    if (!art.leftHand) continue;
    // Sitting sadly, the shield leans on the ground beside the hero.
    const shieldAt =
      frame.weapon === 'ground'
        ? { x: 3, y: SPRITE_HEIGHT - 2 - art.leftHand.rows.length }
        : at(left.hand, art.leftHand);
    canvas.draw(art.leftHand, shieldAt, GEAR_LEGEND);
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
): string[][] {
  return COMPANION_ANIMATIONS[animation].flatMap((frame) => {
    const rows = companionFrame(frame, outfit);
    return Array.from({ length: frame.hold }, () => rows);
  });
}

/** The still image of an animation (reduce motion, the home-screen widget): its first frame. */
export function companionStill(animation: CompanionAnimation, outfit: CompanionOutfit): string[] {
  return companionFrame(COMPANION_ANIMATIONS[animation][0], outfit);
}
