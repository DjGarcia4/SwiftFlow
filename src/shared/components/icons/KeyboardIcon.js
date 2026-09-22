import { h } from "vue";

// Heroicons has no keyboard, so this is one drawn in its outline style
// (24px grid, 1.5 stroke, round caps) to sit beside the others.
const KeyboardIcon = (props, { attrs }) =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      "stroke-width": "1.5",
      stroke: "currentColor",
      "aria-hidden": "true",
      ...attrs,
    },
    [
      h("rect", { x: "2.25", y: "6", width: "19.5", height: "12", rx: "2.25" }),
      h("path", {
        "stroke-linecap": "round",
        "stroke-width": "2",
        d: "M6 9.75h.01M9 9.75h.01M12 9.75h.01M15 9.75h.01M18 9.75h.01M7.5 12.75h.01M10.5 12.75h.01M13.5 12.75h.01M16.5 12.75h.01M8.25 15.25h7.5",
      }),
    ]
  );

export default KeyboardIcon;
