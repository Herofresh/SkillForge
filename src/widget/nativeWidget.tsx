// The library calls these components as plain functions to build its tree; the React Compiler's
// memo hooks would break that ("Invalid hook call"), so it stays off for this file.
'use no memo';

/**
 * The home-screen widgets themselves (PLAN 6.6, ADR-055): the layout tree of `widgetLayout.ts`
 * turned into the library's widget primitives, the background task that draws a widget when
 * Android asks (added, resized, the 30-minute update), and the redraw the app requests after its
 * data changed. This file imports `react-native-android-widget` statically, so only
 * `widgetModule.ts` may load it, after checking the native module exists.
 *
 * Look (docs/DESIGN.md → Home-screen widget): a stone panel with the pixel frame lines, Jersey 15
 * for numbers and the status, Silkscreen for the small labels, pixel icons as SVG strings. What
 * goes where at which size is decided in `widgetLayout.ts` (PLAN 6.12, ADR-062).
 */
import {
  FlexWidget,
  registerWidgetTaskHandler,
  requestWidgetUpdate,
  SvgWidget,
  TextWidget,
  type ColorProp,
  type FlexWidgetStyle,
  type WidgetTaskHandlerProps,
} from 'react-native-android-widget';

import type { ReactNode } from 'react';

import { Colors, FontFamily, PIXEL } from '@/components/theme';
import { iconSvg } from '@/components/ui/icons';
import { companionColors } from '@/data/companion';
import { widgetView, type WidgetView } from '@/domain/widget';
import { gridSvg, parsePixelGrid } from '@/lib/pixelGrid';
import { currentTime } from '@/lib/time';

import {
  companionLayout,
  widgetLayout,
  type WidgetAlign,
  type WidgetJustify,
  type WidgetLayout,
  type WidgetNode,
} from './widgetLayout';
import { readWidgetSnapshot } from './widgetStorage';

/**
 * The widgets' names in app.json (`react-native-android-widget` plugin → `widgets[].name`). The
 * small one keeps the 6.6 name, so a widget placed before 6.10 stays placed and keeps working;
 * the large one is new (PLAN 6.10, ADR-059).
 */
export const WIDGET_NAME = 'SkillForge';
export const COMPANION_WIDGET_NAME = 'SkillForgeCompanion';

/** Theme colors are plain strings; the library wants them typed as hex. */
const color = (value: string): ColorProp => value as ColorProp;

type HeroCompanion = NonNullable<Extract<WidgetView, { kind: 'hero' }>['companion']>;

/**
 * The companion sprite's rows (the layout's trimmed mood frame) as a crisp SVG string, `widthDp`
 * wide, in the companion's colors. Only the sprite's pixels are painted: the background stays
 * transparent, so it stands on the widget.
 */
export function companionSvg(
  companion: HeroCompanion,
  rows: readonly string[],
  widthDp: number,
): string {
  const colors = companionColors(companion.look);
  return gridSvg(parsePixelGrid(rows), widthDp, (role) => colors[role]);
}

const ALIGN: Readonly<Record<WidgetAlign, FlexWidgetStyle['alignItems']>> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};
const JUSTIFY: Readonly<Record<WidgetJustify, FlexWidgetStyle['justifyContent']>> = {
  start: 'flex-start',
  center: 'center',
  'space-between': 'space-between',
  'space-evenly': 'space-evenly',
};

/** How a child sits in its parent: the gap before it, and filling the parent's cross axis. */
interface Placement {
  parent?: 'row' | 'column';
  first: boolean;
  gap: number;
}

function placementStyle({ parent, first, gap }: Placement): FlexWidgetStyle {
  if (!parent || first || gap === 0) return {};
  return parent === 'row' ? { marginLeft: gap } : { marginTop: gap };
}

/** One node of the layout tree as widget primitives (see `WidgetBox` for the flex rules). */
function Node({
  node,
  view,
  placement,
}: {
  node: WidgetNode;
  view: WidgetView;
  placement: Placement;
}): ReactNode {
  const margin = placementStyle(placement);
  switch (node.type) {
    case 'text':
      return (
        <TextWidget
          text={node.text}
          maxLines={1}
          truncate="END"
          allowFontScaling={false}
          style={{
            ...margin,
            fontFamily: node.font === 'pixel' ? FontFamily.pixel : FontFamily.caps,
            fontSize: node.size,
            color: color(node.color),
          }}
        />
      );
    case 'icon':
      return (
        <SvgWidget
          svg={iconSvg(node.name, node.size)}
          style={{ ...margin, width: node.size, height: node.size }}
        />
      );
    case 'sprite': {
      if (view.kind !== 'hero' || !view.companion) return null;
      const width = node.rows[0].length * node.pixel;
      return (
        <SvgWidget
          svg={companionSvg(view.companion, node.rows, width)}
          style={{ ...margin, width, height: node.rows.length * node.pixel }}
        />
      );
    }
    case 'box': {
      const root = placement.parent === undefined;
      const stretch = node.stretch === true;
      const fillWidth = root || (stretch && placement.parent === 'column');
      const fillHeight = root || (stretch && placement.parent === 'row');
      return (
        <FlexWidget
          style={{
            ...margin,
            flexDirection: node.direction,
            alignItems: ALIGN[node.align],
            justifyContent: JUSTIFY[node.justify],
            ...(fillWidth ? { width: 'match_parent' } : {}),
            ...(fillHeight ? { height: 'match_parent' } : {}),
          }}>
          {node.children.map((child, index) => (
            <Node
              key={index}
              node={child}
              view={view}
              placement={{ parent: node.direction, first: index === 0, gap: node.gap }}
            />
          ))}
        </FlexWidget>
      );
    }
  }
}

/** The pixel frame (DESIGN.md → Frames): an ink line, a stone-edge line, then the stone fill. */
function Frame({ view, layout }: { view: WidgetView; layout: WidgetLayout }) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: view.deepLink }}
      accessibilityLabel="Open SkillForge on the Train tab"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: color(Colors.ink),
        padding: PIXEL,
      }}>
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: color(Colors.surface),
          borderWidth: PIXEL,
          borderColor: color(Colors.border),
          padding: layout.padding,
        }}>
        <Node node={layout.root} view={view} placement={{ first: true, gap: 0 }} />
      </FlexWidget>
    </FlexWidget>
  );
}

/** The small widget: training status, streak and level, and as space allows rank and stats. */
export function SkillForgeWidget({
  view,
  widthDp,
  heightDp,
}: {
  view: WidgetView;
  widthDp: number;
  heightDp: number;
}) {
  return <Frame view={view} layout={widgetLayout(view, widthDp, heightDp)} />;
}

/**
 * The large widget (PLAN 6.10): the companion in its mood with status, mood, streak and level,
 * rank and class. Without a companion in the snapshot it draws the small widget's layout.
 */
export function SkillForgeCompanionWidget({
  view,
  widthDp,
  heightDp,
}: {
  view: WidgetView;
  widthDp: number;
  heightDp: number;
}) {
  return <Frame view={view} layout={companionLayout(view, widthDp, heightDp)} />;
}

/** The widget for `name` (the small or the large one). */
function WidgetFor({
  name,
  view,
  widthDp,
  heightDp,
}: {
  name: string;
  view: WidgetView;
  widthDp: number;
  heightDp: number;
}) {
  return name === COMPANION_WIDGET_NAME ? (
    <SkillForgeCompanionWidget view={view} widthDp={widthDp} heightDp={heightDp} />
  ) : (
    <SkillForgeWidget view={view} widthDp={widthDp} heightDp={heightDp} />
  );
}

/** The view as of now from the stored snapshot (the clock decides "today" and the streak). */
async function currentView(): Promise<WidgetView> {
  return widgetView(await readWidgetSnapshot(), currentTime());
}

async function handleWidgetTask({
  widgetInfo,
  widgetAction,
  renderWidget,
}: WidgetTaskHandlerProps) {
  // A click opens the deep link natively (OPEN_URI); a removed widget needs nothing drawn.
  if (widgetAction === 'WIDGET_CLICK' || widgetAction === 'WIDGET_DELETED') return;
  try {
    renderWidget(
      <WidgetFor
        name={widgetInfo.widgetName}
        view={await currentView()}
        widthDp={widgetInfo.width}
        heightDp={widgetInfo.height}
      />,
    );
  } catch {
    // A bad snapshot or layout must not leave the widget blank or crash the task (PLAN 7.0a).
    renderWidget(<FallbackWidget />);
  }
}

/** Text size (sp) of the fallback panel's name. */
const FALLBACK_TEXT_SIZE = 16;

/** A plain "SkillForge" panel that opens the app, drawn when the real widget can't be. */
function FallbackWidget() {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color(Colors.surface),
      }}>
      <TextWidget
        text="SkillForge"
        style={{ fontSize: FALLBACK_TEXT_SIZE, color: color(Colors.text) }}
      />
    </FlexWidget>
  );
}

/** Registers the background task Android runs to draw the widget (call once, at bundle start). */
export function registerWidgetTask(): void {
  registerWidgetTaskHandler(handleWidgetTask);
}

/** Redraws every placed SkillForge widget, small and large, from the stored snapshot. */
export async function redrawWidgets(): Promise<void> {
  const view = await currentView();
  for (const name of [WIDGET_NAME, COMPANION_WIDGET_NAME]) {
    await requestWidgetUpdate({
      widgetName: name,
      renderWidget: (info) => (
        <WidgetFor name={name} view={view} widthDp={info.width} heightDp={info.height} />
      ),
    });
  }
}
