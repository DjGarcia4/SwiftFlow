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

    const columns = wrapper.findAll(".flex-col");
    expect(columns[0].findAll("div.h-3")).toHaveLength(5); // 2 blanks + 3 days
  });

  it("counts the days that were actually practiced", () => {
    const results = [{ date: new Date(2026, 2, 10, 9).toISOString() }];
    const wrapper = mount(ActivityCalendar, {
      props: {
        activity: computeDailyActivity(results, { days: 7, now: new Date(2026, 2, 12) }),
      },
    });

    expect(wrapper.text()).toContain("1 día de 7");
  });

  it("renders nothing odd for an empty history", () => {
    const wrapper = mount(ActivityCalendar, { props: { activity: [] } });
    expect(wrapper.text()).toContain("0 días de 0");
  });
});
