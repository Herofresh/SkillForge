import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { boundsOf, type MapFocus, type MapLayout, type MapState } from '@/domain/treeMap';
import {
  clampPan,
  fitBox,
  zoomAround,
  type Size,
  type Viewport,
  type ZoomLimits,
} from '@/lib/viewport';

import { Colors, Spacing } from '../../theme';
import { PixelButton } from '../../ui';

import { MapCanvas } from './MapCanvas';
import { MapNode } from './MapNode';

type Props = {
  layout: MapLayout;
  state: MapState;
  /** What "Focus" centers on (`mapFocus`); the map also opens there. */
  focus: { kind: MapFocus; ids: string[] };
  /** Node ids the user added or changed (PLAN 4.7): the quill mark. */
  customized: ReadonlySet<string>;
  onOpen: (nodeId: string) => void;
  /** The screen-reader-friendly path: back to the branch columns. */
  onSwitchToList: () => void;
};

/** Closest zoom: a node fills about a third of a phone's width. */
const MAX_SCALE = 2;
/** Farthest zoom never goes below this even for a huge tree. */
const FLOOR_SCALE = 0.2;
/** The zoom the map opens and focuses at stays readable: names are legible down to here. */
const FOCUS_LIMITS: ZoomLimits = { minScale: 0.6, maxScale: 1.2 };
const FOCUS_PADDING = Spacing.xl;
/** Double tap and the zoom buttons multiply the zoom by this. */
const ZOOM_STEP = 2;
const BUTTON_ZOOM_STEP = 1.5;
/** Camera moves are short and linear (they follow the finger's intent, not a celebration). */
const CAMERA_MS = 180;

/**
 * The tree map (PLAN 5.1): a pan + pinch-zoom canvas (react-native-gesture-handler + Reanimated,
 * transforms on the UI thread only, so nothing re-renders while moving) over the laid-out tree.
 * Double tap zooms in around the finger (or back out when already close); tapping a node opens
 * it. Controls: Focus (goals, else what's trainable now), zoom out / in, and "List" back to the
 * columns. Opens on the focus once it knows its size.
 */
export function TreeMap({ layout, state, focus, customized, onOpen, onSwitchToList }: Props) {
  const reduceMotion = useReducedMotion();
  const [screen, setScreen] = useState<Size | undefined>();
  const opened = useRef(false);
  const scale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const screenW = useSharedValue(1);
  const screenH = useSharedValue(1);
  const minScale = useSharedValue(FLOOR_SCALE);
  const content = useMemo(() => ({ width: layout.width, height: layout.height }), [layout]);

  const limitsFor = useCallback(
    (size: Size): ZoomLimits => ({
      minScale: Math.min(
        Math.max(Math.min(size.width / layout.width, size.height / layout.height), FLOOR_SCALE),
        FOCUS_LIMITS.minScale,
      ),
      maxScale: MAX_SCALE,
    }),
    [layout],
  );

  const moveTo = useCallback(
    (target: Viewport, animate: boolean) => {
      if (animate && !reduceMotion) {
        const timing = { duration: CAMERA_MS, easing: Easing.linear };
        scale.set(withTiming(target.scale, timing));
        x.set(withTiming(target.x, timing));
        y.set(withTiming(target.y, timing));
      } else {
        scale.set(target.scale);
        x.set(target.x);
        y.set(target.y);
      }
    },
    [reduceMotion, scale, x, y],
  );

  const focusView = useCallback(
    (size: Size): Viewport => {
      const box = boundsOf(layout, focus.ids) ?? {
        x: 0,
        y: 0,
        width: layout.width,
        height: layout.height,
      };
      return clampPan(fitBox(box, size, FOCUS_LIMITS, FOCUS_PADDING), content, size);
    },
    [layout, focus, content],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const size = { width, height };
    setScreen(size);
    screenW.set(width);
    screenH.set(height);
    minScale.set(limitsFor(size).minScale);
    if (!opened.current) {
      opened.current = true;
      moveTo(focusView(size), false);
    }
  };

  const zoomBy = (factor: number) => {
    if (!screen) return;
    const center = { x: screen.width / 2, y: screen.height / 2 };
    const current = { scale: scale.get(), x: x.get(), y: y.get() };
    moveTo(
      clampPan(
        zoomAround(current, center, current.scale * factor, limitsFor(screen)),
        content,
        screen,
      ),
      true,
    );
  };

  const contentW = layout.width;
  const contentH = layout.height;
  const gesture = useMemo(() => {
    const limits = () => {
      'worklet';
      return { minScale: minScale.get(), maxScale: MAX_SCALE };
    };
    const apply = (next: Viewport) => {
      'worklet';
      const clamped = clampPan(
        next,
        { width: contentW, height: contentH },
        { width: screenW.get(), height: screenH.get() },
      );
      scale.set(clamped.scale);
      x.set(clamped.x);
      y.set(clamped.y);
    };
    const pan = Gesture.Pan()
      .averageTouches(true)
      .onChange((event) => {
        apply({ scale: scale.get(), x: x.get() + event.changeX, y: y.get() + event.changeY });
      });
    const pinch = Gesture.Pinch().onChange((event) => {
      apply(
        zoomAround(
          { scale: scale.get(), x: x.get(), y: y.get() },
          { x: event.focalX, y: event.focalY },
          scale.get() * event.scaleChange,
          limits(),
        ),
      );
    });
    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd((event) => {
        const current = { scale: scale.get(), x: x.get(), y: y.get() };
        const zoomIn = current.scale * ZOOM_STEP <= MAX_SCALE + 0.01;
        const target = zoomAround(
          current,
          { x: event.x, y: event.y },
          zoomIn ? current.scale * ZOOM_STEP : FOCUS_LIMITS.minScale,
          limits(),
        );
        const clamped = clampPan(
          target,
          { width: contentW, height: contentH },
          { width: screenW.get(), height: screenH.get() },
        );
        const timing = { duration: reduceMotion ? 0 : CAMERA_MS, easing: Easing.linear };
        scale.set(withTiming(clamped.scale, timing));
        x.set(withTiming(clamped.x, timing));
        y.set(withTiming(clamped.y, timing));
      });
    return Gesture.Race(Gesture.Simultaneous(pan, pinch), doubleTap);
  }, [contentW, contentH, minScale, reduceMotion, scale, screenH, screenW, x, y]);

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: scale.get() }],
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={gesture}>
        <View
          style={styles.viewport}
          onLayout={onLayout}
          testID="tree-map"
          accessibilityLabel="Skill tree map. Use Switch to list for the branch columns.">
          <Animated.View
            style={[styles.content, { width: layout.width, height: layout.height }, cameraStyle]}>
            <MapCanvas layout={layout} metEdges={state.metEdges} />
            {layout.nodes.map((place) => {
              const tile = state.tiles.get(place.id);
              return tile ? (
                <MapNode
                  key={place.id}
                  tile={tile}
                  place={place}
                  onOpen={onOpen}
                  custom={customized.has(place.id)}
                />
              ) : null;
            })}
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={styles.controls} pointerEvents="box-none">
        <PixelButton
          label="List"
          icon="scroll"
          variant="secondary"
          onPress={onSwitchToList}
          accessibilityLabel="Switch to list"
          accessibilityHint="Shows the tree as branch columns"
          testID="map-switch-to-list"
        />
        <View style={styles.spacer} pointerEvents="none" />
        <PixelButton
          label="−"
          variant="secondary"
          onPress={() => zoomBy(1 / BUTTON_ZOOM_STEP)}
          accessibilityLabel="Zoom out"
          testID="map-zoom-out"
        />
        <PixelButton
          label="+"
          variant="secondary"
          onPress={() => zoomBy(BUTTON_ZOOM_STEP)}
          accessibilityLabel="Zoom in"
          testID="map-zoom-in"
        />
        <PixelButton
          label={focus.kind === 'goals' ? 'Goals' : 'Focus'}
          icon="star"
          onPress={() => screen && moveTo(focusView(screen), true)}
          accessibilityLabel={
            focus.kind === 'goals' ? 'Focus goals' : 'Focus on what you can train'
          }
          testID="map-focus"
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  content: {
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: 'left top',
  },
  controls: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
