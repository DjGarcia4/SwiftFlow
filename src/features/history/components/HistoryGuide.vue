<template>
  <!--
    Where you are in the history. On a wide screen, the chapters down the
    side, the one being read lit up, with how far along the page you are;
    on a phone, a strip of them under the nav. Either way one tap (or its
    number key) takes you to any of them.
  -->
  <!-- The nav itself sticks: it's the one sitting in the page's column -->
  <nav
    ref="guide"
    :aria-label="t('history.chapters.nav')"
    class="sticky top-0 z-30 lg:top-6 lg:z-auto lg:self-start"
  >
    <!-- Wide screens: down the side, along for the whole page -->
    <div class="hidden lg:block">
      <p
        class="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-pencil-gray"
      >
        {{ t("history.chapters.nav") }}
      </p>
      <ol class="space-y-0.5">
        <li v-for="(chapter, index) in chapters" :key="chapter.id">
          <a
            :href="`#${chapter.id}`"
            class="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition-[background-color,color] duration-200"
            :class="
              active === chapter.id
                ? 'bg-primary-tint text-primary'
                : 'text-pencil-gray hover:bg-faded-gray/20 hover:text-charcoal'
            "
            :aria-current="active === chapter.id ? 'location' : undefined"
            :aria-keyshortcuts="String(index + 1)"
            @click.prevent="go(chapter.id)"
          >
            <span
              class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[11px] transition-colors duration-200"
              :class="
                active === chapter.id
                  ? 'bg-primary text-white'
                  : isRead(index)
                    ? 'bg-success-tint text-success-dark'
                    : 'bg-faded-gray/30'
              "
              aria-hidden="true"
              >{{ index + 1 }}</span
            >
            <span class="flex-1 truncate">{{ chapter.title }}</span>
            <KeyHint :id="`chapter:${index + 1}`" small />
          </a>
        </li>
      </ol>
      <!-- How far down the page -->
      <div
        class="mt-4 h-1.5 overflow-hidden rounded-full bg-faded-gray/30"
        aria-hidden="true"
      >
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-300 ease-smooth"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="mt-1.5 text-[11px] font-bold text-pencil-gray">
        {{ t("history.chapters.position", activeIndex + 1, chapters.length) }}
      </p>
    </div>

    <!-- Phones and narrow windows: a strip that stays under the nav -->
    <div
      class="lg:hidden -mx-4 mb-6 border-b-2 border-faded-gray bg-paper-white/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6"
    >
      <ol ref="strip" class="flex gap-1.5 overflow-x-auto">
        <li v-for="(chapter, index) in chapters" :key="chapter.id" class="flex-shrink-0">
          <a
            :href="`#${chapter.id}`"
            :data-strip-chapter="chapter.id"
            class="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1 text-xs font-extrabold transition-[background-color,border-color,color] duration-200"
            :class="
              active === chapter.id
                ? 'border-primary bg-primary text-white'
                : 'border-faded-gray text-pencil-gray'
            "
            :aria-current="active === chapter.id ? 'location' : undefined"
            @click.prevent="go(chapter.id)"
          >
            <span aria-hidden="true">{{ index + 1 }}</span>
            {{ chapter.title }}
          </a>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { t } from "@/shared/i18n";
import KeyHint from "@/features/command-palette/components/KeyHint.vue";
import { useHotkey } from "@/features/command-palette/hotkeys";
import { scrollerOf, scrollToElement } from "@/shared/utils/scrollTo";

const props = defineProps({
  // [{ id, title }], in page order; each id is a HistoryChapter's
  chapters: { type: Array, required: true },
});

const active = ref(props.chapters[0]?.id ?? null);
const activeIndex = computed(() =>
  Math.max(
    0,
    props.chapters.findIndex((chapter) => chapter.id === active.value)
  )
);
const isRead = (index) => index < activeIndex.value;
const progress = ref(0);

// Under the strip on a phone; with a little air on a wide screen, where
// the list sits beside the page instead of over it
const guide = ref(null);
const go = (id) => {
  active.value = id;
  const wide = window.matchMedia?.("(min-width: 1024px)").matches;
  const offset = wide ? 24 : (guide.value?.getBoundingClientRect().height ?? 0) + 12;
  scrollToElement(document.getElementById(id), { offset });
};

// 1 to 7 go straight to a chapter, shown beside each in the list
props.chapters.forEach((chapter, index) =>
  useHotkey(`chapter:${index + 1}`, {
    key: String(index + 1),
    label: () => t("history.chapters.goTo", chapter.title),
    run: () => go(chapter.id),
  })
);

// The page scrolls inside the app's own box, not the window
let scroller = null;

// The chapter being read: the last one whose top has passed a third of
// the way down the screen
const update = () => {
  const line = window.innerHeight / 3;
  let current = props.chapters[0]?.id ?? null;
  for (const chapter of props.chapters) {
    const top = document.getElementById(chapter.id)?.getBoundingClientRect().top;
    if (top !== undefined && top <= line) current = chapter.id;
  }
  // At the very bottom, the last chapter even if it's short
  if (scroller) {
    const { scrollTop, scrollHeight, clientHeight } = scroller;
    const room = scrollHeight - clientHeight;
    progress.value = room > 0 ? Math.round((scrollTop / room) * 100) : 100;
    if (room > 0 && scrollTop >= room - 4) current = props.chapters.at(-1)?.id ?? current;
  }
  active.value = current;
};

// The strip keeps the lit chapter in view as you go -- sideways only: a
// scrollIntoView here would also move the page, and cut short the scroll
// to the chapter just picked
const strip = ref(null);
watch(active, async (id) => {
  await nextTick();
  const list = strip.value;
  const item = list?.querySelector(`[data-strip-chapter="${id}"]`);
  if (!list || !item || !list.clientWidth) return;
  list.scrollTo({
    left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2,
    behavior: "smooth",
  });
});

let frame = 0;
const onScroll = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(update);
};

onMounted(() => {
  scroller = scrollerOf(document.getElementById(props.chapters[0]?.id));
  (scroller ?? window).addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
});
onUnmounted(() => {
  cancelAnimationFrame(frame);
  (scroller ?? window).removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
});
</script>
