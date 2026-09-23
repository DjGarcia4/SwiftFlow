import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ActivityCalendar from "./ActivityCalendar.vue";
import { computeDailyActivity } from "@/features/history/utils/historyStats";

const activity = (days, now) => computeDailyActivity([], { days, now });

describe("ActivityCalendar", () => {
  it("keeps every row on the same weekday by padding the first week", () => {
    // 2026-03-12 is a Thursday, so a 3-day window starts on a Tuesday and
    // the first column needs two blanks above it
    const wrapper = mount(ActivityCalendar, {
      props: { activity: activity(3, new Date(2026, 2, 12)) },
    });

    // The blanks are the only cells with no styling of their own
    expect(wrapper.findAll('div[class="aspect-square w-full"]')).toHaveLength(2);
  });

  it("counts the days that were actually practiced", () => {
    const results = [{ date: new Date(2026, 2, 10, 9).toISOString() }];
    const wrapper = mount(ActivityCalendar, {
      props: {
        activity: computeDailyActivity(results, { days: 7, now: new Date(2026, 2, 12) }),
      },
    });

    expect(wrapper.text()).toContain("1 sesión en 1 día");
  });

  it("labels the months where they start, and only there", () => {
    // 91 days back from 12 March 2026 lands in December
    const wrapper = mount(ActivityCalendar, {
      props: { activity: activity(91, new Date(2026, 2, 12)) },
    });

    const months = wrapper
      .findAll("span")
      .map((span) => span.text())
      .filter((text) => /^[a-z]{3}$/.test(text));

    expect(months).toEqual(["ene", "feb", "mar"]);
  });

  it("drops the opening month's name when the next one starts too soon to fit both", () => {
    // 365 days back from 22 September 2026 opens on 22 September 2025: a
    // column and a half of September before October begins
    const wrapper = mount(ActivityCalendar, {
      props: { activity: activity(365, new Date(2026, 8, 22)) },
    });

    const months = wrapper
      .findAll("span")
      .map((span) => span.text())
      .filter((text) => /^[a-z]{3}$/.test(text));

    expect(months[0]).toBe("oct");
    expect(months.filter((m) => m === "sep")).toHaveLength(1);
  });

  it("labels Monday, Wednesday and Friday down the left", () => {
    const wrapper = mount(ActivityCalendar, {
      props: { activity: activity(21, new Date(2026, 2, 12)) },
    });

    expect(wrapper.text()).toContain("lun");
    expect(wrapper.text()).toContain("mié");
    expect(wrapper.text()).toContain("vie");
  });

  it("counts sessions, not only the days they happened on", () => {
    const day = new Date(2026, 2, 10, 9).toISOString();
    const wrapper = mount(ActivityCalendar, {
      props: {
        activity: computeDailyActivity([{ date: day }, { date: day }, { date: day }], {
          days: 7,
          now: new Date(2026, 2, 12),
        }),
      },
    });

    expect(wrapper.text()).toContain("3 sesiones en 1 día");
  });

  it("lays a year out in tracks that can't overflow their container", () => {
    const wrapper = mount(ActivityCalendar, {
      props: { activity: activity(365, new Date(2026, 2, 12)) },
    });

    const rows = wrapper.findAll('div[style*="grid-template-columns"]');
    // The month row and the grid row, on identical tracks so the names stay
    // over their weeks
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.attributes("style")).toContain("repeat(53, minmax(0, 1fr))");
    }
  });

  it("keeps a year to 53 columns whatever weekday it ends on", () => {
    for (let day = 10; day < 17; day++) {
      const wrapper = mount(ActivityCalendar, {
        props: { activity: activity(365, new Date(2026, 2, day)) },
      });

      expect(
        wrapper.find('div[style*="grid-template-columns"]').attributes("style")
      ).toContain("repeat(53,");
    }
  });

  it("renders nothing odd for an empty history", () => {
    const wrapper = mount(ActivityCalendar, { props: { activity: [] } });
    expect(wrapper.text()).toContain("0 sesiones en 0 días");
  });
});
