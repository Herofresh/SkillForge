import type { ReactElement, ReactNode } from 'react';
import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';

import { SPRITE_HEIGHT, SPRITE_WIDTH } from '@/data/companion';
import { WIDGET_DEEP_LINK, type WidgetView } from '@/domain/widget';

import {
  COMPANION_WIDGET_NAME,
  companionScale,
  registerWidgetTask,
  SkillForgeCompanionWidget,
  SkillForgeWidget,
  WIDGET_WIDE_MIN_DP,
  widgetSizes,
} from './nativeWidget';

jest.mock('./widgetStorage', () => ({ readWidgetSnapshot: () => Promise.resolve(undefined) }));

interface Primitive {
  type: string;
  props: Record<string, unknown>;
}

/** Expands the widget like the library does: call components until only primitives are left. */
function primitives(node: ReactNode): Primitive[] {
  if (node === null || node === undefined || typeof node === 'boolean') return [];
  if (Array.isArray(node)) return node.flatMap(primitives);
  const element = node as ReactElement<Record<string, unknown>>;
  const type = element.type as ((props: unknown) => ReactNode) & { __name__?: string };
  if (type.__name__ === undefined) return primitives(type(element.props));
  const { children, ...props } = element.props;
  return [{ type: type.__name__, props }, ...primitives(children as ReactNode)];
}

const texts = (node: ReactNode) =>
  primitives(node)
    .filter((entry) => entry.type === 'TextWidget')
    .map((entry) => String(entry.props.text).trim());

const hero: WidgetView = {
  kind: 'hero',
  deepLink: WIDGET_DEEP_LINK,
  trainedToday: true,
  status: 'Trained today',
  streak: 3,
  level: 7,
  rank: 'Apprentice',
  topAttributes: [
    { attribute: 'pull', value: 12 },
    { attribute: 'core', value: 4 },
  ],
};

describe('SkillForgeWidget', () => {
  it('shows status, streak, level, rank and top attributes when wide', () => {
    const shown = texts(
      <SkillForgeWidget view={hero} widthDp={WIDGET_WIDE_MIN_DP} heightDp={110} />,
    );
    expect(shown).toEqual(
      expect.arrayContaining(['Trained today', '3', '7', 'Apprentice', 'PULL', '12', 'CORE', '4']),
    );
  });

  it('keeps to status, streak and level when narrow', () => {
    const shown = texts(
      <SkillForgeWidget view={hero} widthDp={WIDGET_WIDE_MIN_DP - 1} heightDp={110} />,
    );
    expect(shown).toEqual(expect.arrayContaining(['Trained today', '3', '7']));
    expect(shown).not.toContain('Apprentice');
  });

  it('opens the Train tab when tapped', () => {
    const [root] = primitives(<SkillForgeWidget view={hero} widthDp={300} heightDp={120} />);
    expect(root.props).toMatchObject({
      clickAction: 'OPEN_URI',
      clickActionData: { uri: 'skillforge://train' },
    });
  });

  it('asks to open the app before the first snapshot', () => {
    const view: WidgetView = { kind: 'empty', deepLink: WIDGET_DEEP_LINK };
    expect(texts(<SkillForgeWidget view={view} widthDp={300} heightDp={120} />)).toContain(
      'OPEN THE APP TO BEGIN',
    );
  });
});

/** The font size of the first TextWidget showing `text`. */
const fontSizeOf = (node: ReactNode, text: string) =>
  primitives(node).find((entry) => entry.type === 'TextWidget' && entry.props.text === text)?.props
    .style as { fontSize: number } | undefined;

describe('widgetSizes', () => {
  it('keeps the compact scale-1 sizes at the minimum and for narrow widgets', () => {
    expect(widgetSizes(WIDGET_WIDE_MIN_DP, 110)).toMatchObject({ scale: 1, icon: 24, status: 20 });
    expect(widgetSizes(160, 400)).toMatchObject({ scale: 1, icon: 24, number: 24, label: 10 });
  });

  it('scales the default 4 x 2 widget up by the tighter side, in quarter steps', () => {
    // Pixel 8 Pro emulator, 4 x 2 cells: about 395 x 250 dp → width allows 1.52, height 1.79.
    expect(widgetSizes(395, 250)).toMatchObject({
      scale: 1.5,
      icon: 36,
      smallIcon: 24,
      status: 30,
      number: 36,
      rank: 30,
      attribute: 24,
      label: 15,
    });
    // A wide but short widget is held back by its height.
    expect(widgetSizes(500, 150).scale).toBe(1);
  });

  it('keeps icons on whole 12 x 12 grid cells and stops at the maximum scale', () => {
    expect(widgetSizes(330, 182).icon).toBe(24); // scale 1.25 → 30 dp would blur the grid
    const huge = widgetSizes(2000, 2000);
    expect(huge.scale).toBe(2);
    expect(huge.icon).toBe(48);
  });
});

describe('SkillForgeWidget sizes', () => {
  it('draws the status larger on the default 4 x 2 widget than on the minimum one', () => {
    const big = fontSizeOf(
      <SkillForgeWidget view={hero} widthDp={395} heightDp={250} />,
      hero.status,
    );
    const small = fontSizeOf(
      <SkillForgeWidget view={hero} widthDp={WIDGET_WIDE_MIN_DP} heightDp={110} />,
      hero.status,
    );
    expect(big?.fontSize).toBe(30);
    expect(small?.fontSize).toBe(20);
  });

  it('spreads the status rows over the height only when scaled up', () => {
    const justify = (widthDp: number, heightDp: number) =>
      primitives(<SkillForgeWidget view={hero} widthDp={widthDp} heightDp={heightDp} />)
        .filter((entry) => entry.type === 'FlexWidget')
        .map((entry) => (entry.props.style as { justifyContent?: string }).justifyContent);
    expect(justify(395, 250)).toContain('space-evenly');
    expect(justify(WIDGET_WIDE_MIN_DP, 110)).not.toContain('space-evenly');
  });
});

describe('the widget task', () => {
  it('draws the first-run widget when Android asks and nothing is stored', async () => {
    registerWidgetTask();
    const handler = jest.mocked(registerWidgetTaskHandler).mock.calls[0][0];
    const renderWidget = jest.fn();
    await handler({
      widgetInfo: { widgetName: 'SkillForge', widgetId: 1, width: 300, height: 120 },
      widgetAction: 'WIDGET_UPDATE',
      renderWidget,
    } as unknown as Parameters<typeof handler>[0]);
    expect(texts(renderWidget.mock.calls[0][0])).toContain('SkillForge');
  });

  it('draws nothing for a click (the deep link opens natively)', async () => {
    registerWidgetTask();
    const handler = jest.mocked(registerWidgetTaskHandler).mock.calls[0][0];
    const renderWidget = jest.fn();
    await handler({
      widgetInfo: { widgetName: 'SkillForge', widgetId: 1, width: 300, height: 120 },
      widgetAction: 'WIDGET_CLICK',
      renderWidget,
    } as unknown as Parameters<typeof handler>[0]);
    expect(renderWidget).not.toHaveBeenCalled();
    expect(requestWidgetUpdate).not.toHaveBeenCalled();
  });
});

describe('SkillForgeCompanionWidget (PLAN 6.10)', () => {
  const withCompanion: WidgetView = {
    ...hero,
    heroClass: { id: 'warrior', title: 'Warrior' },
    companion: {
      loadout: { head: 'iron_helm' },
      weapon: { classId: 'warrior', upgraded: false },
      look: {},
      mood: 'happy',
      moodTitle: 'Fired up',
    },
  };

  it('draws the companion next to status, mood, streak, level, rank and class', () => {
    const tree = <SkillForgeCompanionWidget view={withCompanion} widthDp={395} heightDp={380} />;
    expect(texts(tree)).toEqual(
      expect.arrayContaining(['Trained today', 'FIRED UP', '3', '7', 'Apprentice', 'WARRIOR']),
    );
    const svgs = primitives(tree).filter((entry) => entry.type === 'SvgWidget');
    const sprite = svgs.find((entry) =>
      String(entry.props.svg).includes(`viewBox="0 0 ${SPRITE_WIDTH} ${SPRITE_HEIGHT}"`),
    );
    expect(sprite).toBeDefined();
    expect(sprite?.props.style).toMatchObject({
      width: SPRITE_WIDTH * 5,
      height: SPRITE_HEIGHT * 5,
    });
  });

  it('draws the sprite on a transparent background, straight on the widget', () => {
    const tree = <SkillForgeCompanionWidget view={withCompanion} widthDp={395} heightDp={380} />;
    const sprite = primitives(tree).find(
      (entry) =>
        entry.type === 'SvgWidget' &&
        String(entry.props.svg).includes(`0 0 ${SPRITE_WIDTH} ${SPRITE_HEIGHT}`),
    );
    expect(sprite?.props.style).not.toHaveProperty('backgroundColor');
    expect(String(sprite?.props.svg)).not.toMatch(/<rect/);
  });

  it('opens the Train tab when tapped', () => {
    const [root] = primitives(
      <SkillForgeCompanionWidget view={withCompanion} widthDp={395} heightDp={380} />,
    );
    expect(root.props).toMatchObject({ clickActionData: { uri: 'skillforge://train' } });
  });

  it('falls back to the small layout before the app wrote a companion', () => {
    const shown = texts(<SkillForgeCompanionWidget view={hero} widthDp={395} heightDp={380} />);
    expect(shown).toEqual(expect.arrayContaining(['Trained today', 'Apprentice']));
  });

  it('draws the sprite at a whole number of dp per pixel', () => {
    const sizes = { padding: 15 } as Parameters<typeof companionScale>[2];
    expect(companionScale(395, 380, sizes)).toBe(5);
    expect(companionScale(250, 180, sizes)).toBe(3);
    expect(companionScale(100, 60, sizes)).toBe(2);
  });

  it('has its own name, different from the small widget placed since 6.6', () => {
    expect(COMPANION_WIDGET_NAME).not.toBe('SkillForge');
  });
});
