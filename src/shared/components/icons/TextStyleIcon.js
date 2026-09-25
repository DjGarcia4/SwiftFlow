import { h } from "vue";

// "Aa": a big and a small letter, for how the text looks. Drawn in
// Heroicons' outline style (24px grid, 1.5 stroke, round caps).
const TextStyleIcon = (props, { attrs }) =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      "stroke-width": "1.5",
      stroke: "currentColor",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      ...attrs,
    },
    [
      // The capital A
      h("path", { d: "M2.25 18.75 7.5 5.25l5.25 13.5M4.2 13.75h6.6" }),
      // The small a
      h("path", {
        d: "M21.75 12v6.75M21.75 14.4c0-1.6-1.2-2.4-2.6-2.4s-2.65.95-2.65 3.35 1.2 3.4 2.65 3.4 2.6-.95 2.6-2.55",
      }),
    ]
  );

export default TextStyleIcon;
