/**
 * Pan/zoom math for a zoomable canvas (the Tree tab's map, PLAN 5.1). A viewport maps a content
 * point `p` to the screen as `p × scale + translate`. Pure; the functions are worklets so gesture
 * callbacks can call them on the UI thread (the `'worklet'` directive is a plain string in Node).
 */

export interface Viewport {
  scale: number;
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoomLimits {
  minScale: number;
  maxScale: number;
}

const clampTo = (value: number, min: number, max: number): number => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

export function clampScale(scale: number, limits: ZoomLimits): number {
  'worklet';
  return clampTo(scale, limits.minScale, limits.maxScale);
}

/**
 * Keeps at least half the screen on the content: the content may slide until its edge reaches the
 * middle of the screen, never further.
 */
export function clampPan(viewport: Viewport, content: Size, screen: Size): Viewport {
  'worklet';
  const clampAxis = (offset: number, contentLength: number, screenLength: number): number =>
    clampTo(offset, screenLength / 2 - contentLength * viewport.scale, screenLength / 2);
  return {
    scale: viewport.scale,
    x: clampAxis(viewport.x, content.width, screen.width),
    y: clampAxis(viewport.y, content.height, screen.height),
  };
}

/** Zooms to `scale` (clamped) around the screen point `focal`, which stays where it is. */
export function zoomAround(
  viewport: Viewport,
  focal: { x: number; y: number },
  scale: number,
  limits: ZoomLimits,
): Viewport {
  'worklet';
  const next = clampScale(scale, limits);
  const ratio = next / viewport.scale;
  return {
    scale: next,
    x: focal.x - (focal.x - viewport.x) * ratio,
    y: focal.y - (focal.y - viewport.y) * ratio,
  };
}

/**
 * The viewport that shows `box` (content coordinates) with `padding` around it: as large as fits,
 * within the zoom limits. When the box doesn't fit even at the smallest zoom, its top-left corner
 * is shown instead of its middle (on both axes, so a tall narrow box sits at the left edge rather
 * than floating in the middle), so the start of it is in view.
 */
export function fitBox(box: Box, screen: Size, limits: ZoomLimits, padding: number): Viewport {
  const room = {
    width: Math.max(screen.width - 2 * padding, 1),
    height: Math.max(screen.height - 2 * padding, 1),
  };
  const fit = Math.min(room.width / Math.max(box.width, 1), room.height / Math.max(box.height, 1));
  const scale = clampScale(fit, limits);
  const overflows = box.width * scale > room.width || box.height * scale > room.height;
  const axis = (start: number, length: number, screenLength: number) =>
    overflows ? padding - start * scale : screenLength / 2 - (start + length / 2) * scale;
  return {
    scale,
    x: axis(box.x, box.width, screen.width),
    y: axis(box.y, box.height, screen.height),
  };
}
