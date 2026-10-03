import type { ReactElement, ReactNode } from 'react';
import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';

import { WIDGET_DEEP_LINK, type WidgetView } from '@/domain/widget';

import {
  registerWidgetTask,
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
    // Pixel 8 Pro, 4 x 2 cells: about 336 x 214 dp → width allows 1.52, height 1.53.
    expect(widgetSizes(336, 214)).toMatchObject({
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
    expect(widgetSizes(300, 182).icon).toBe(24); // scale 1.25 → 30 dp would blur the grid
    const huge = widgetSizes(2000, 2000);
    expect(huge.scale).toBe(2);
    expect(huge.icon).toBe(48);
  });
});

describe('SkillForgeWidget sizes', () => {
  it('draws the status larger on the default 4 x 2 widget than on the minimum one', () => {
    const big = fontSizeOf(
      <SkillForgeWidget view={hero} widthDp={336} heightDp={214} />,
      hero.status,
    );
    const small = fontSizeOf(
      <SkillForgeWidget view={hero} widthDp={WIDGET_WIDE_MIN_DP} heightDp={110} />,
      hero.status,
    );
    expect(big?.fontSize).toBe(30);
    expect(small?.fontSize).toBe(20);
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
