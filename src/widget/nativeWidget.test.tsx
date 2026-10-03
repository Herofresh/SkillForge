import type { ReactElement, ReactNode } from 'react';
import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';

import { WIDGET_DEEP_LINK, type WidgetView } from '@/domain/widget';

import { registerWidgetTask, SkillForgeWidget, WIDGET_WIDE_MIN_DP } from './nativeWidget';

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
    const shown = texts(<SkillForgeWidget view={hero} widthDp={WIDGET_WIDE_MIN_DP} />);
    expect(shown).toEqual(
      expect.arrayContaining(['Trained today', '3', '7', 'Apprentice', 'PULL', '12', 'CORE', '4']),
    );
  });

  it('keeps to status, streak and level when narrow', () => {
    const shown = texts(<SkillForgeWidget view={hero} widthDp={WIDGET_WIDE_MIN_DP - 1} />);
    expect(shown).toEqual(expect.arrayContaining(['Trained today', '3', '7']));
    expect(shown).not.toContain('Apprentice');
  });

  it('opens the Train tab when tapped', () => {
    const [root] = primitives(<SkillForgeWidget view={hero} widthDp={300} />);
    expect(root.props).toMatchObject({
      clickAction: 'OPEN_URI',
      clickActionData: { uri: 'skillforge://train' },
    });
  });

  it('asks to open the app before the first snapshot', () => {
    const view: WidgetView = { kind: 'empty', deepLink: WIDGET_DEEP_LINK };
    expect(texts(<SkillForgeWidget view={view} widthDp={300} />)).toContain(
      'OPEN THE APP TO BEGIN',
    );
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
