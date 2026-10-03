import type { ReactElement, ReactNode } from 'react';
import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';

import { WIDGET_DEEP_LINK, type WidgetView } from '@/domain/widget';

import {
  COMPANION_WIDGET_NAME,
  registerWidgetTask,
  SkillForgeCompanionWidget,
  SkillForgeWidget,
} from './nativeWidget';
import { companionLayout, widgetLayout } from './widgetLayout';

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

const boxes = (node: ReactNode) => primitives(node).filter((entry) => entry.type === 'FlexWidget');

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
  it('shows status, streak, level, rank and top attributes on a 4 x 2 widget', () => {
    const shown = texts(<SkillForgeWidget view={hero} widthDp={395} heightDp={250} />);
    expect(shown).toEqual(
      expect.arrayContaining(['Trained today', '3', '7', 'Apprentice', 'PULL', '12', 'CORE', '4']),
    );
  });

  it('keeps to status, streak and level when slim', () => {
    const shown = texts(<SkillForgeWidget view={hero} widthDp={150} heightDp={100} />);
    expect(shown).toEqual(expect.arrayContaining(['3', '7']));
    expect(shown.join(' ')).toContain('Trained');
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
    const shown = texts(<SkillForgeWidget view={view} widthDp={395} heightDp={118} />);
    expect(shown).toEqual(expect.arrayContaining(['SkillForge', 'OPEN THE APP TO BEGIN']));
  });
});

describe('SkillForgeWidget draws its layout (PLAN 6.12)', () => {
  it('draws the layout texts in dp sizes the system font scale cannot grow', () => {
    const layout = widgetLayout(hero, 395, 118);
    const drawn = primitives(<SkillForgeWidget view={hero} widthDp={395} heightDp={118} />).filter(
      (entry) => entry.type === 'TextWidget',
    );
    expect(drawn.length).toBeGreaterThan(0);
    for (const entry of drawn) expect(entry.props.allowFontScaling).toBe(false);
    const status = drawn.find((entry) => entry.props.text === hero.status);
    expect(status?.props.style).toMatchObject({ fontSize: layout.sizes.status });
  });

  it('pads the frame as the layout says and lets the root box fill it', () => {
    const layout = widgetLayout(hero, 395, 250);
    const [, frame, root] = boxes(<SkillForgeWidget view={hero} widthDp={395} heightDp={250} />);
    expect(frame.props.style).toMatchObject({ padding: layout.padding });
    expect(root.props.style).toMatchObject({ width: 'match_parent', height: 'match_parent' });
  });

  it('spreads the rows over the height (space-evenly)', () => {
    const justify = boxes(<SkillForgeWidget view={hero} widthDp={395} heightDp={250} />).map(
      (entry) => (entry.props.style as { justifyContent?: string }).justifyContent,
    );
    expect(justify).toContain('space-evenly');
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
  /** The one SVG that is not a 12 x 12 icon. */
  const spriteOf = (tree: ReactNode) =>
    primitives(tree).find(
      (entry) =>
        entry.type === 'SvgWidget' && !String(entry.props.svg).includes('viewBox="0 0 12 12"'),
    );

  it('draws the companion next to status, mood, streak, level, rank and class', () => {
    const tree = <SkillForgeCompanionWidget view={withCompanion} widthDp={395} heightDp={250} />;
    expect(texts(tree)).toEqual(
      expect.arrayContaining(['Trained today', 'FIRED UP', '3', '7', 'Apprentice', 'WARRIOR']),
    );
    const pixel = companionLayout(withCompanion, 395, 250).spritePixel ?? 0;
    expect(pixel).toBeGreaterThanOrEqual(2);
    const sprite = spriteOf(tree);
    const [, columns, rows] = /viewBox="0 0 (\d+) (\d+)"/.exec(String(sprite?.props.svg)) ?? [];
    expect(sprite?.props.style).toMatchObject({
      width: Number(columns) * pixel,
      height: Number(rows) * pixel,
    });
  });

  it('draws the sprite on a transparent background, straight on the widget', () => {
    const sprite = spriteOf(
      <SkillForgeCompanionWidget view={withCompanion} widthDp={395} heightDp={380} />,
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
    const tree = <SkillForgeCompanionWidget view={hero} widthDp={395} heightDp={250} />;
    expect(texts(tree)).toEqual(expect.arrayContaining(['Trained today', 'Apprentice']));
    expect(spriteOf(tree)).toBeUndefined();
  });

  it('has its own name, different from the small widget placed since 6.6', () => {
    expect(COMPANION_WIDGET_NAME).not.toBe('SkillForge');
  });
});
