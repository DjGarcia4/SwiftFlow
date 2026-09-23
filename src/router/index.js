import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/historial",
      name: "history",
      component: () => import("@/views/HistoryView.vue"),
      meta: { title: "Historial" },
    },
    {
      path: "/sobre",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
      meta: {
        title: "Qué es SwiftFlow",
        description:
          "Un test de mecanografía en español que te dice en qué fallás, por qué, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.",
      },
    },
    // Anything else (a mistyped or old link) lands on the test
    { path: "/:rest(.*)*", redirect: "/" },
  ],
});

// Each page names itself in the tab and in shared links
const DEFAULT_DESCRIPTION =
  "Practicá mecanografía en español: tus teclas débiles, tus palabras difíciles y un entrenamiento hecho para vos.";

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · SwiftFlow` : "SwiftFlow";
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", to.meta.description ?? DEFAULT_DESCRIPTION);
});

export default router;
