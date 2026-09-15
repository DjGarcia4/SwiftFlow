// Pure math behind the mobile-keyboard-aware recentering in
// ParagraphToType.vue — extracted so the threshold/formula can be unit
// tested without a real device or a mocked `visualViewport` global.
//
// Most mobile browsers don't shrink the layout viewport ("100vh") when the
// on-screen keyboard opens, so content centered/sized with vh-based CSS
// stays centered against a height that no longer matches what's visible.
// The Visual Viewport API reports the real visible area — when it's
// meaningfully smaller than the full viewport (the keyboard is open), this
// returns inline styles to recenter/resize against that instead; otherwise
// an empty object, so the caller falls back to its plain CSS centering.
const KEYBOARD_INSET_THRESHOLD = 80; // px; ignores minor browser chrome show/hide
const MAX_HEIGHT_RATIO = 0.85;

// `topInset` is space that's always occupied at the top of the visible
// area regardless of the keyboard (the sticky Nav) — it's excluded from
// the area we center/size against, otherwise centering against the full
// visible height pushes the card's top (the wpm/streak stats row) up
// underneath the Nav once the keyboard eats enough of the screen.
export const computeKeyboardViewportStyle = ({
  innerHeight,
  visualViewport,
  topInset = 0,
}) => {
  const keyboardInset = innerHeight - visualViewport.height;
  if (keyboardInset < KEYBOARD_INSET_THRESHOLD) return {};

  const visibleTop = visualViewport.offsetTop + topInset;
  const visibleHeight = Math.max(0, visualViewport.height - topInset);

  return {
    top: `${visibleTop + visibleHeight / 2}px`,
    maxHeight: `${visibleHeight * MAX_HEIGHT_RATIO}px`,
  };
};
