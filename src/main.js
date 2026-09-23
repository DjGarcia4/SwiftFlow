import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { revealDirective } from "@/shared/directives/reveal";
import { tiltDirective } from "@/shared/directives/tilt";
import { listenForInstall } from "@/shared/utils/pwaInstall";

// Before anything else: the browser offers installing just once, early
listenForInstall();
const app = createApp(App);
app.directive("reveal", revealDirective);
app.directive("tilt", tiltDirective);
app.use(router);
app.use(createPinia());
app.mount("#app");
