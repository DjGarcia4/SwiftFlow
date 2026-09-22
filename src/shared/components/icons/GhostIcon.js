import { h } from "vue";

// Heroicons has no ghost either; drawn in its outline style like the
// keyboard beside it.
const GhostIcon = (props, { attrs }) =>
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
        d: "M5.25 20.25V10.5a6.75 6.75 0 0 1 13.5 0v9.75l-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5-2.25-1.5-2.25 1.5Z",
      }),
      h("path", {
        "stroke-linecap": "round",
        "stroke-width": "2",
        d: "M9.75 10.5h.01M14.25 10.5h.01",
      }),
    ]
  );

export default GhostIcon;
