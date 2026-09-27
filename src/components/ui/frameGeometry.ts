/**
 * Geometry of a stepped ("notched") pixel frame. A frame is a stack of layers (outer line, inner
 * line, fill), each drawn as the same staircase-cornered shape inset a little further. A shape with
 * `steps` corner steps of `step` dp is the union of `steps + 1` rects, each inset horizontally by
 * `(steps - i) × step` and vertically by `i × step`, so every corner loses a staircase of squares.
 */

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

/** The rects (as absolute-position insets) that draw one notched shape inside `base`. */
export function notchedRects(base: Insets, step: number, steps: number): Insets[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const x = (steps - i) * step;
    const y = i * step;
    return {
      top: base.top + y,
      bottom: base.bottom + y,
      left: base.left + x,
      right: base.right + x,
    };
  });
}

/** `insets` moved `by` dp further in on every side. */
export function inset(insets: Insets, by: number): Insets {
  return {
    top: insets.top + by,
    right: insets.right + by,
    bottom: insets.bottom + by,
    left: insets.left + by,
  };
}
