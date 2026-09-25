import { watch } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { t, locale } from "@/shared/i18n";

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
      meta: { page: "history" },
    },
    {
      path: "/curso",
      name: "course",
      component: () => import("@/views/CourseView.vue"),
      meta: { page: "course" },
    },
    {
      path: "/resumen",
      name: "summary",
      component: () => import("@/views/SummaryView.vue"),
      meta: { page: "summary" },
    },
    {
      path: "/sobre",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
      meta: { page: "about" },
    },
    // Anything else (a mistyped or old link) lands on the test
    { path: "/:rest(.*)*", redirect: "/" },
  ],
});

// Each page names itself in the tab and in shared links, in the language
// being used -- and again when the language changes
const nameThePage = (to) => {
  const page = to.meta.page;
  document.title = page ? `${t(`shared.pages.${page}.title`)} · SwiftFlow` : "SwiftFlow";
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      "content",
      t(page ? `shared.pages.${page}.description` : "shared.pages.default")
    );
};

router.afterEach(nameThePage);
watch(locale, () => nameThePage(router.currentRoute.value));

export default router;
