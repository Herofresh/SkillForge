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
 * for numbers and the status, Silkscreen for the small labels, pixel icons as SVG strings. The
 * sizes scale with the widget (`widgetSizes`, PLAN 6.6b).
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
import { Palette } from '@/components/palette';
import { AttributeColors, Colors, FontFamily, PIXEL, RankColors } from '@/components/theme';
import { iconSvg, type IconName } from '@/components/ui/icons';
import { HERO_CLASS_BY_ID } from '@/data/classes';
import { widgetView, type WidgetView } from '@/domain/widget';
import { currentTime } from '@/lib/time';

import { readWidgetSnapshot } from './widgetStorage';

/** The widget's name in app.json (`react-native-android-widget` plugin → `widgets[].name`). */
export const WIDGET_NAME = 'SkillForge';
/** From this width (dp) on, the widget shows the rank and the top attributes next to the status. */
export const WIDGET_WIDE_MIN_DP = 220;

/**
 * The scale 1 layout (the compact one) fits this width and height (dp); a bigger widget scales its
 * type, icons and gaps up by the smaller of the two ratios, so the content fills the 4 × 2 size.
 */
const BASE_WIDTH_DP = 260;
const BASE_HEIGHT_DP = 140;
/** Largest scale, and the step it is rounded down to (keeps sizes on whole sp / dp values). */
const MAX_SCALE = 2;
const SCALE_STEP = 0.25;
/** Icons are 12 × 12 grids: their size stays a multiple of this so every grid cell is whole dp. */
const ICON_GRID = 12;
/** Scale-1 sizes: icons and gaps in dp, type in sp. */
const BASE = {
  icon: 24,
  status: 20,
  number: 24,
  rank: 20,
  attribute: 16,
  label: 10,
  gap: 6,
  padding: 10,
} as const;

/** Font sizes (sp), icon sizes and gaps (dp) of the widget at one scale. */
export interface WidgetSizes {
  scale: number;
  icon: number;
  smallIcon: number;
  status: number;
  number: number;
  rank: number;
  attribute: number;
  label: number;
  gap: number;
  padding: number;
}

/**
 * The sizes for a widget of `widthDp` × `heightDp`. Narrow widgets (only the status column) keep
 * the compact scale-1 layout; from `WIDGET_WIDE_MIN_DP` on, the scale grows with the widget, in
 * `SCALE_STEP`s up to `MAX_SCALE`.
 */
export function widgetSizes(widthDp: number, heightDp: number): WidgetSizes {
  const fit = Math.min(widthDp / BASE_WIDTH_DP, heightDp / BASE_HEIGHT_DP);
  const stepped = Math.floor(fit / SCALE_STEP) * SCALE_STEP;
  const scale = widthDp < WIDGET_WIDE_MIN_DP ? 1 : Math.min(MAX_SCALE, Math.max(1, stepped));
  const sized = (base: number) => Math.round(base * scale);
  const icon = Math.max(BASE.icon, Math.floor((BASE.icon * scale) / ICON_GRID) * ICON_GRID);
  return {
    scale,
    icon,
    smallIcon: Math.round((icon * 2) / 3),
    status: sized(BASE.status),
    number: sized(BASE.number),
    rank: sized(BASE.rank),
    attribute: sized(BASE.attribute),
    label: sized(BASE.label),
    gap: sized(BASE.gap),
    padding: sized(BASE.padding),
  };
}

/** Theme colors are plain strings; the library wants them typed as hex. */
const color = (value: string): ColorProp => value as ColorProp;

type HeroView = Extract<WidgetView, { kind: 'hero' }>;

function Icon({ name, size }: { name: IconName; size: number }) {
  return <SvgWidget svg={iconSvg(name, size)} style={{ width: size, height: size }} />;
}

function PixelLabel({
  text,
  size,
  tone = Colors.textMuted,
}: {
  text: string;
  size: number;
  tone?: string;
}) {
  return (
    <TextWidget
      text={text.toUpperCase()}
      style={{
        fontFamily: FontFamily.caps,
        fontSize: size,
        color: color(tone),
        letterSpacing: 0.05,
      }}
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
function Frame({
  view,
  sizes,
  children,
}: {
  view: WidgetView;
  sizes: WidgetSizes;
  children: ReactNode;
}) {
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
          padding: sizes.padding,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {children}
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * How a column places its two rows. Scaled up, the rows spread over the full height (the width
 * limits the scale, so a 4 × 2 widget has height to spare) and line up across both columns;
 * compact, they stay centred.
 */
function columnStyle(sizes: WidgetSizes) {
  return sizes.scale > 1
    ? ({ height: 'match_parent', justifyContent: 'space-evenly' } as const)
    : ({ justifyContent: 'center' } as const);
}

function StatusColumn({ view, sizes }: { view: HeroView; sizes: WidgetSizes }) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        flex: 1,
        ...columnStyle(sizes),
      }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name={view.trainedToday ? 'check' : 'hourglass'} size={sizes.icon} />
        <TextWidget
          text={view.status}
          maxLines={1}
          truncate="END"
          style={{
            fontFamily: FontFamily.pixel,
            fontSize: sizes.status,
            marginLeft: sizes.gap,
            color: color(view.trainedToday ? Colors.success : Colors.gold),
          }}
        />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: sizes.gap }}>
        <Icon name="flame" size={sizes.icon} />
        <FlexWidget style={{ flexDirection: 'column', marginLeft: sizes.gap }}>
          <PixelNumber text={String(view.streak)} size={sizes.number} tone={Colors.ember} />
          <PixelLabel text="Streak" size={sizes.label} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', marginLeft: sizes.gap * 2 }}>
          <PixelNumber text={String(view.level)} size={sizes.number} tone={Colors.goldLight} />
          <PixelLabel text="Level" size={sizes.label} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

/** The worn class's title (PLAN 6.9) under the rank, in the class color, one line at most. */
function ClassLabel({
  heroClass,
  sizes,
}: {
  heroClass: NonNullable<HeroView['heroClass']>;
  sizes: WidgetSizes;
}) {
  const classColor = HERO_CLASS_BY_ID.get(heroClass.id)?.color;
  return (
    <TextWidget
      text={heroClass.title.toUpperCase()}
      maxLines={1}
      truncate="END"
      style={{
        fontFamily: FontFamily.caps,
        fontSize: sizes.label,
        letterSpacing: 0.05,
        color: color(classColor ? Palette[classColor] : Colors.textMuted),
      }}
    />
  );
}

function HeroColumn({ view, sizes }: { view: HeroView; sizes: WidgetSizes }) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginLeft: sizes.gap * 2,
        ...columnStyle(sizes),
      }}>
      <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="shield" size={sizes.smallIcon} />
          <TextWidget
            text={view.rank}
            style={{
              fontFamily: FontFamily.pixel,
              fontSize: sizes.rank,
              marginLeft: Math.round((sizes.gap * 2) / 3),
              color: color(RankColors[view.rank]),
            }}
          />
        </FlexWidget>
        {view.heroClass ? <ClassLabel heroClass={view.heroClass} sizes={sizes} /> : null}
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
        {view.topAttributes.length === 0 ? (
          <PixelLabel text="No stats yet" size={sizes.label} />
        ) : (
          view.topAttributes.map((entry) => (
            <FlexWidget
              key={entry.attribute}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Math.round(sizes.gap / 3),
              }}>
              <PixelLabel text={ATTRIBUTE_LABELS[entry.attribute]} size={sizes.label} />
              <TextWidget
                text={` ${entry.value}`}
                style={{
                  fontFamily: FontFamily.pixel,
                  fontSize: sizes.attribute,
                  color: color(AttributeColors[entry.attribute]),
                }}
              />
            </FlexWidget>
          ))
        )}
      </FlexWidget>
    </FlexWidget>
  );
}

/** The whole widget for a view at a size (dp). */
export function SkillForgeWidget({
  view,
  widthDp,
  heightDp,
}: {
  view: WidgetView;
  widthDp: number;
  heightDp: number;
}) {
  const sizes = widgetSizes(widthDp, heightDp);
  if (view.kind === 'empty') {
    return (
      <Frame view={view} sizes={sizes}>
        <Icon name="sword" size={sizes.icon} />
        <FlexWidget style={{ flexDirection: 'column', flex: 1, marginLeft: sizes.gap }}>
          <PixelNumber text="SkillForge" size={sizes.number} tone={Colors.gold} />
          <PixelLabel text="Open the app to begin" size={sizes.label} />
        </FlexWidget>
      </Frame>
    );
  }
  return (
    <Frame view={view} sizes={sizes}>
      <StatusColumn view={view} sizes={sizes} />
      {widthDp >= WIDGET_WIDE_MIN_DP ? <HeroColumn view={view} sizes={sizes} /> : null}
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
  renderWidget(
    <SkillForgeWidget
      view={await currentView()}
      widthDp={widgetInfo.width}
      heightDp={widgetInfo.height}
    />,
  );
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
    renderWidget: (info) => (
      <SkillForgeWidget view={view} widthDp={info.width} heightDp={info.height} />
    ),
  });
}
