// The library calls these components as plain functions to build its tree; the React Compiler's
// memo hooks would break that ("Invalid hook call"), so it stays off for this file.
'use no memo';

/**
 * The home-screen widget itself (PLAN 6.6, ADR-055): its layout in the library's widget primitives,
 * the background task that draws it when Android asks (added, resized, the 30-minute update), and
 * the redraw the app requests after its data changed. This file imports `react-native-android-widget`
 * statically, so only `widgetModule.ts` may load it, after checking the native module exists.
 *
 * Look (docs/DESIGN.md → Home-screen widget): a stone panel with the pixel frame lines, Jersey 15
 * for numbers and the status, Silkscreen for the small labels, pixel icons as SVG strings.
 */
import {
  FlexWidget,
  registerWidgetTaskHandler,
  requestWidgetUpdate,
  SvgWidget,
  TextWidget,
  type ColorProp,
  type WidgetTaskHandlerProps,
} from 'react-native-android-widget';

import type { ReactNode } from 'react';

import { ATTRIBUTE_LABELS } from '@/components/node/AttributeChips';
import { AttributeColors, Colors, FontFamily, PIXEL, RankColors } from '@/components/theme';
import { iconSvg, type IconName } from '@/components/ui/icons';
import { widgetView, type WidgetView } from '@/domain/widget';
import { currentTime } from '@/lib/time';

import { readWidgetSnapshot } from './widgetStorage';

/** The widget's name in app.json (`react-native-android-widget` plugin → `widgets[].name`). */
export const WIDGET_NAME = 'SkillForge';
/** From this width (dp) on, the widget shows the rank and the top attributes next to the status. */
export const WIDGET_WIDE_MIN_DP = 220;

const ICON_PX = 24;
const SMALL_ICON_PX = 16;

/** Theme colors are plain strings; the library wants them typed as hex. */
const color = (value: string): ColorProp => value as ColorProp;

function Icon({ name, size = ICON_PX }: { name: IconName; size?: number }) {
  return <SvgWidget svg={iconSvg(name, size)} style={{ width: size, height: size }} />;
}

function PixelLabel({ text, tone = Colors.textMuted }: { text: string; tone?: string }) {
  return (
    <TextWidget
      text={text.toUpperCase()}
      style={{ fontFamily: FontFamily.caps, fontSize: 10, color: color(tone), letterSpacing: 0.05 }}
    />
  );
}

function PixelNumber({
  text,
  size,
  tone = Colors.text,
}: {
  text: string;
  size: number;
  tone?: string;
}) {
  return (
    <TextWidget
      text={text}
      maxLines={1}
      truncate="END"
      style={{ fontFamily: FontFamily.pixel, fontSize: size, color: color(tone) }}
    />
  );
}

/** The pixel frame (DESIGN.md → Frames): an ink line, a stone-edge line, then the stone fill. */
function Frame({ view, children }: { view: WidgetView; children: ReactNode }) {
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
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {children}
      </FlexWidget>
    </FlexWidget>
  );
}

function StatusColumn({ view }: { view: Extract<WidgetView, { kind: 'hero' }> }) {
  return (
    <FlexWidget style={{ flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name={view.trainedToday ? 'check' : 'hourglass'} />
        <TextWidget
          text={view.status}
          maxLines={1}
          truncate="END"
          style={{
            fontFamily: FontFamily.pixel,
            fontSize: 20,
            marginLeft: 6,
            color: color(view.trainedToday ? Colors.success : Colors.gold),
          }}
        />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <Icon name="flame" />
        <FlexWidget style={{ flexDirection: 'column', marginLeft: 6 }}>
          <PixelNumber text={String(view.streak)} size={24} tone={Colors.ember} />
          <PixelLabel text="Streak" />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', marginLeft: 14 }}>
          <PixelNumber text={String(view.level)} size={24} tone={Colors.goldLight} />
          <PixelLabel text="Level" />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

function HeroColumn({ view }: { view: Extract<WidgetView, { kind: 'hero' }> }) {
  return (
    <FlexWidget
      style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="shield" size={SMALL_ICON_PX} />
        <TextWidget
          text={view.rank}
          style={{
            fontFamily: FontFamily.pixel,
            fontSize: 20,
            marginLeft: 4,
            color: color(RankColors[view.rank]),
          }}
        />
      </FlexWidget>
      {view.topAttributes.length === 0 ? (
        <PixelLabel text="No stats yet" />
      ) : (
        view.topAttributes.map((entry) => (
          <FlexWidget
            key={entry.attribute}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <PixelLabel text={ATTRIBUTE_LABELS[entry.attribute]} />
            <TextWidget
              text={` ${entry.value}`}
              style={{
                fontFamily: FontFamily.pixel,
                fontSize: 16,
                color: color(AttributeColors[entry.attribute]),
              }}
            />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}

/** The whole widget for a view at a width (dp). */
export function SkillForgeWidget({ view, widthDp }: { view: WidgetView; widthDp: number }) {
  if (view.kind === 'empty') {
    return (
      <Frame view={view}>
        <Icon name="sword" />
        <FlexWidget style={{ flexDirection: 'column', flex: 1, marginLeft: 8 }}>
          <PixelNumber text="SkillForge" size={22} tone={Colors.gold} />
          <PixelLabel text="Open the app to begin" />
        </FlexWidget>
      </Frame>
    );
  }
  return (
    <Frame view={view}>
      <StatusColumn view={view} />
      {widthDp >= WIDGET_WIDE_MIN_DP ? <HeroColumn view={view} /> : null}
    </Frame>
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
  renderWidget(<SkillForgeWidget view={await currentView()} widthDp={widgetInfo.width} />);
}

/** Registers the background task Android runs to draw the widget (call once, at bundle start). */
export function registerWidgetTask(): void {
  registerWidgetTaskHandler(handleWidgetTask);
}

/** Redraws every placed SkillForge widget from the stored snapshot (after the app wrote it). */
export async function redrawWidgets(): Promise<void> {
  const view = await currentView();
  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: (info) => <SkillForgeWidget view={view} widthDp={info.width} />,
  });
}
