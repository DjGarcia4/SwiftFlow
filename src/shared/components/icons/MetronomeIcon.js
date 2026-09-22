import { h } from "vue";

// A metronome, for the pacer. Heroicons has none; drawn in its outline
// style like the keyboard and the ghost.
const MetronomeIcon = (props, { attrs }) =>
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
      h("path", {
        "stroke-linejoin": "round",
        d: "M9.75 3.75h4.5L18 20.25H6L9.75 3.75Z",
      }),
      h("path", { "stroke-linecap": "round", d: "M12 16.5 16.5 7.5M7.5 16.5h9" }),
    ]
  );

export default MetronomeIcon;
