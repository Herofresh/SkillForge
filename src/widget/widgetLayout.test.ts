import { WIDGET_DEEP_LINK, type WidgetView } from '@/domain/widget';

import {
  companionLayout,
  lineHeightDp,
  measureWidgetNode,
  placeWidgetNodes,
  splitLine,
  textWidthDp,
  widgetLayout,
  widgetSizes,
  type WidgetLayout,
  type WidgetNode,
} from './widgetLayout';

/** Long texts and numbers: the widest a hero's widget gets. */
const longView: WidgetView = {
  kind: 'hero',
  deepLink: WIDGET_DEEP_LINK,
  trainedToday: false,
  status: 'Not yet today',
  streak: 123,
  level: 47,
  rank: 'Apprentice',
  heroClass: { id: 'warrior', title: 'Grand Templar' },
  topAttributes: [
    { attribute: 'mobility', value: 120 },
    { attribute: 'balance', value: 99 },
    { attribute: 'core', value: 70 },
  ],
  companion: {
    loadout: {},
    weapon: { classId: 'warrior', upgraded: false },
    look: {},
    mood: 'sad',
    moodTitle: 'Missing you',
  },
};

/** A first-week hero: short texts, one attribute. */
const shortView: WidgetView = {
  ...longView,
  trainedToday: true,
  status: 'Trained today',
  streak: 1,
  level: 1,
  rank: 'Novice',
  heroClass: { id: 'recruit', title: 'Recruit' },
  topAttributes: [{ attribute: 'pull', value: 8 }],
};

const emptyView: WidgetView = { kind: 'empty', deepLink: WIDGET_DEEP_LINK };

/**
 * Widget sizes (dp) launchers report: the Pixel 8 Pro emulator's 4-column grid (1–4 cells wide,
 * 1–3 rows) and a 5-column grid with shorter rows. The small widget goes up to 2 rows
 * (`maxResizeHeight` 300 dp), the companion widget is at least 300 × 110 dp.
 */
const SMALL_SIZES: readonly (readonly [number, number])[] = [
  [186, 115], // 2 × 1 on the Pixel 8 Pro emulator
  [292, 118],
  [395, 115], // default 4 × 1 on the Pixel 8 Pro emulator
  [190, 250],
  [292, 250],
  [395, 250],
  [150, 100],
  [228, 100],
  [306, 100],
  [384, 100],
  [228, 210],
  [306, 210],
  [384, 210],
];
const COMPANION_SIZES: readonly (readonly [number, number])[] = [
  [395, 115],
  [395, 250], // default 4 × 2 on the Pixel 8 Pro emulator
  [395, 380],
  [306, 210],
  [384, 210],
  [384, 320],
];

/** The texts of a tree, in order. */
function texts(node: WidgetNode): string[] {
  if (node.type === 'text') return [node.text];
  if (node.type === 'box') return node.children.flatMap(texts);
  return [];
}

/** Every leaf placed inside the widget's inner box (no clipped text, icon or sprite). */
function expectInside(layout: WidgetLayout) {
  const { width, height } = layout.inner;
  for (const leaf of placeWidgetNodes(layout.root, 0, 0, width, height)) {
    expect(leaf.x).toBeGreaterThanOrEqual(0);
    expect(leaf.y).toBeGreaterThanOrEqual(0);
    expect(leaf.x + leaf.width).toBeLessThanOrEqual(width + 0.001);
    expect(leaf.y + leaf.height).toBeLessThanOrEqual(height + 0.001);
  }
}

describe('font metrics', () => {
  it('measures text with the fonts advance widths', () => {
    // The 6.6b screenshot: "Trained today" at 30 sp is about 152 dp wide.
    expect(textWidthDp('Trained today', 'pixel', 30)).toBeCloseTo(153.3, 0);
    expect(textWidthDp('STREAK', 'caps', 10)).toBeCloseTo(42.5, 1);
    expect(lineHeightDp('pixel', 20)).toBe(20);
    expect(lineHeightDp('caps', 10)).toBe(13);
  });

  it('counts an unknown character as a full em, never narrower', () => {
    expect(textWidthDp('✓', 'pixel', 10)).toBe(10);
  });
});

describe('widgetSizes', () => {
  it('is the compact 6.6 layout at scale 1', () => {
    expect(widgetSizes(1)).toEqual({
      scale: 1,
      icon: 24,
      smallIcon: 16,
      status: 20,
      number: 24,
      rank: 20,
      attribute: 16,
      label: 10,
      gap: 6,
      padding: 10,
    });
  });

  it('keeps icons on whole 12 x 12 grid cells and stops growing the padding', () => {
    for (const scale of [0.6, 0.9, 1.25, 1.5, 2, 3]) {
      expect(widgetSizes(scale).icon % 12).toBe(0);
    }
    expect(widgetSizes(1.5).icon).toBe(36);
    expect(widgetSizes(3).padding).toBe(15);
  });
});

describe('splitLine', () => {
  it('splits at the last space', () => {
    expect(splitLine('Not yet today')).toEqual(['Not yet', 'today']);
    expect(splitLine('Single')).toEqual(['Single']);
  });
});

describe('placeWidgetNodes', () => {
  const label = (value: string): WidgetNode => ({
    type: 'text',
    text: value,
    font: 'pixel',
    size: 10,
    color: '#ffffff',
  });

  it('spreads children evenly or to the edges and stretches across', () => {
    const icon: WidgetNode = { type: 'icon', name: 'flame', size: 10 };
    const evenly: WidgetNode = {
      type: 'box',
      direction: 'column',
      gap: 0,
      align: 'start',
      justify: 'space-evenly',
      children: [icon, icon],
    };
    expect(placeWidgetNodes(evenly, 0, 0, 50, 50).map((leaf) => leaf.y)).toEqual([10, 30]);
    const between: WidgetNode = { ...evenly, justify: 'space-between' };
    expect(placeWidgetNodes(between, 0, 0, 50, 50).map((leaf) => leaf.y)).toEqual([0, 40]);
    const right: WidgetNode = {
      type: 'box',
      direction: 'row',
      gap: 4,
      align: 'end',
      justify: 'space-between',
      children: [
        label('A'),
        {
          type: 'box',
          direction: 'column',
          gap: 0,
          align: 'end',
          justify: 'space-between',
          stretch: true,
          children: [icon, icon],
        },
      ],
    };
    const placed = placeWidgetNodes(right, 0, 0, 100, 60);
    expect(placed[0]).toMatchObject({ x: 0, y: 50 }); // aligned to the end (bottom)
    expect(placed.slice(1).map((leaf) => [leaf.x, leaf.y])).toEqual([
      [90, 0],
      [90, 50],
    ]);
  });
});

describe('the small widget layout (PLAN 6.12)', () => {
  it.each(SMALL_SIZES)(
    'fills at least 80 %% of the height at %i x %i dp, readable, nothing clipped',
    (width, height) => {
      for (const view of [longView, shortView]) {
        const layout = widgetLayout(view, width, height);
        expect(layout.fill).toBeGreaterThanOrEqual(0.8);
        expect(layout.sizes.scale).toBeGreaterThanOrEqual(0.9);
        expect(layout.content.width).toBeLessThanOrEqual(layout.inner.width);
        expect(layout.content.height).toBeLessThanOrEqual(layout.inner.height);
        expectInside(layout);
      }
    },
  );

  it('shows status, streak, level, rank, class and a stat on the default 4 x 1', () => {
    const layout = widgetLayout(longView, 395, 115);
    expect(layout.sizeClass).toBe('standard');
    expect(texts(layout.root)).toEqual(
      expect.arrayContaining(['Not yet today', '123', '47', 'Apprentice', 'GRAND TEMPLAR']),
    );
    expect(texts(layout.root)).toContain('MOBILITY');
  });

  it('keeps to status, streak and level when slim and short', () => {
    const layout = widgetLayout(longView, 186, 115);
    expect(layout.sizeClass).toBe('narrow');
    expect(texts(layout.root)).not.toContain('Apprentice');
  });

  it('reflows into more rows when resized taller, with bigger type', () => {
    const short = widgetLayout(longView, 395, 115);
    const tall = widgetLayout(longView, 395, 250);
    expect(tall.sizeClass).toBe('grid');
    expect(tall.sizes.scale).toBeGreaterThan(short.sizes.scale);
    expect(texts(tall.root)).toEqual(expect.arrayContaining(['Apprentice', 'MOBILITY', 'BALANCE']));
  });

  it('draws the first-run widget inside any size', () => {
    for (const [width, height] of SMALL_SIZES) {
      const layout = widgetLayout(emptyView, width, height);
      expect(texts(layout.root)).toContain('SkillForge');
      expectInside(layout);
    }
  });
});

describe('the companion widget layout (PLAN 6.12)', () => {
  const sprite = (layout: WidgetLayout) => {
    const find = (node: WidgetNode): WidgetNode | undefined =>
      node.type === 'sprite'
        ? node
        : node.type === 'box'
          ? node.children.map(find).find(Boolean)
          : undefined;
    const found = find(layout.root);
    return found ? measureWidgetNode(found) : undefined;
  };

  it.each(COMPANION_SIZES)(
    'fills at least 80 %% of the height at %i x %i dp, readable, nothing clipped',
    (width, height) => {
      for (const view of [longView, shortView]) {
        const layout = companionLayout(view, width, height);
        expect(layout.fill).toBeGreaterThanOrEqual(0.8);
        expect(layout.sizes.scale).toBeGreaterThanOrEqual(0.9);
        expectInside(layout);
      }
    },
  );

  it('puts a big sprite next to the column on the default 4 x 2', () => {
    const layout = companionLayout(longView, 395, 250);
    expect(layout.sizeClass).toBe('standard');
    expect(layout.spritePixel).toBeGreaterThanOrEqual(4);
    expect(layout.sizes.scale).toBeGreaterThanOrEqual(1);
    expect(texts(layout.root)).toEqual(
      expect.arrayContaining(['Not yet today', 'MISSING YOU', '123', '47', 'Apprentice']),
    );
    // Standing (happy), the sprite is trimmed to its painted pixels and takes most of the height.
    const happyView: WidgetView = {
      ...longView,
      companion: {
        loadout: {},
        weapon: { classId: 'warrior', upgraded: false },
        look: {},
        mood: 'happy',
        moodTitle: 'Fired up',
      },
    };
    const happy = companionLayout(happyView, 395, 250);
    expect(sprite(happy)?.height).toBeGreaterThanOrEqual(0.7 * happy.inner.height);
  });

  it('grows the sprite when the widget is resized taller', () => {
    const small = companionLayout(longView, 395, 250);
    const tall = companionLayout(longView, 395, 380);
    expect(tall.spritePixel ?? 0).toBeGreaterThan(small.spritePixel ?? 0);
  });

  it('stacks the sprite over the lines when the widget is slim and tall', () => {
    expect(['grid', 'tall']).toContain(companionLayout(longView, 228, 380).sizeClass);
  });

  it('falls back to the small layout without a companion in the snapshot', () => {
    const { companion: _companion, ...withoutCompanion } = longView as Extract<
      WidgetView,
      { kind: 'hero' }
    >;
    const layout = companionLayout(withoutCompanion, 395, 250);
    expect(sprite(layout)).toBeUndefined();
    expect(texts(layout.root)).toContain('Apprentice');
  });
});
