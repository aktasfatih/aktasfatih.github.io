// levels.js — the cron trainer curriculum. A gentle ramp from `* * * * *` to
// the day-of-month / day-of-week OR quirk. The engine parses each of the five
// fields and computes the upcoming fire times, so any expression that fires on
// the same schedule counts as correct.
//
// Each level is self-contained:
//   id       stable slug (also the localStorage key suffix)
//   group    section label for the level rail
//   title    short human name
//   teach    the concept, one or two sentences (backticks render as <code>)
//   task     the imperative goal for THIS level
//   solution a reference 5-field cron expression. The GOAL is the list of
//            upcoming fire times that expression produces, so ANY expression
//            that fires on the same schedule counts as correct.
//   hint     a nudge that reveals the shape without giving the answer
//   starter  what to prefill the box with (defaults to "* * * * *")
//
// Fields are: minute hour day-of-month month day-of-week.

window.CRON_LEVELS = [
  // ---- Basics ----
  {
    id: "every-minute",
    group: "Basics",
    title: "The five fields",
    teach:
      "A cron line has five fields: `minute hour day-of-month month day-of-week`. A `*` in a field means 'every value'. So `* * * * *` fires every single minute.",
    task: "Fire once every minute — the busiest schedule there is.",
    solution: "* * * * *",
    hint: "Five stars, one per field. It's already the starting point.",
    starter: "* * * * *",
  },
  {
    id: "hourly",
    group: "Basics",
    title: "Top of the hour",
    teach:
      "Pin a field to a number to fix it. `0` in the minute field means 'at minute zero' — the top of the hour. Leave the rest as `*`.",
    task: "Fire once an hour, exactly on the hour (at :00).",
    solution: "0 * * * *",
    hint: "Set the minute field to `0`, keep the other four as `*`.",
    starter: "* * * * *",
  },
  {
    id: "daily-time",
    group: "Basics",
    title: "A specific time each day",
    teach:
      "Fix both minute and hour to schedule a daily job. `30 3 * * *` is 03:30 every day. Hours run 0–23 (24-hour clock).",
    task: "Fire every day at 03:30 in the morning.",
    solution: "30 3 * * *",
    hint: "Minute `30`, hour `3`, and `*` for the three date/day fields.",
    starter: "0 0 * * *",
  },

  // ---- Steps, lists & ranges ----
  {
    id: "step-minutes",
    group: "Steps, lists & ranges",
    title: "Every N with a step",
    teach:
      "A step `*/n` means 'every nth value'. `*/15` in the minute field fires at :00, :15, :30, :45. Steps save you from spelling out a list.",
    task: "Fire every 15 minutes, around the clock.",
    solution: "*/15 * * * *",
    hint: "Use `*/15` in the minute field. (`0,15,30,45` works too.)",
    starter: "* * * * *",
  },
  {
    id: "list-hours",
    group: "Steps, lists & ranges",
    title: "A list of values",
    teach:
      "A comma makes a list: `9,17` in the hour field means 'at 9 and at 17'. Combine with a fixed minute for exact times.",
    task: "Fire twice a day, at 09:00 and again at 17:00.",
    solution: "0 9,17 * * *",
    hint: "Minute `0`, and an hour list `9,17`.",
    starter: "0 0 * * *",
  },
  {
    id: "range-hours",
    group: "Steps, lists & ranges",
    title: "A range of values",
    teach:
      "A dash makes an inclusive range: `9-17` covers every hour from 9 through 17. Great for business-hours jobs.",
    task: "Fire on the hour, every hour from 09:00 through 17:00.",
    solution: "0 9-17 * * *",
    hint: "Minute `0`, hour range `9-17`.",
    starter: "0 9 * * *",
  },
  {
    id: "every-2-hours",
    group: "Steps, lists & ranges",
    title: "Step across hours",
    teach:
      "Steps work in any field. `*/2` in the hour field fires every other hour: 0, 2, 4, … 22. Pair it with minute `0` to stay on the hour.",
    task: "Fire every two hours, on the hour (00:00, 02:00, 04:00 …).",
    solution: "0 */2 * * *",
    hint: "Minute `0`, hour `*/2`.",
    starter: "0 * * * *",
  },

  // ---- Days & dates ----
  {
    id: "weekdays",
    group: "Days & dates",
    title: "Only on weekdays",
    teach:
      "The fifth field is day-of-week, 0–6 with 0 = Sunday. A range `1-5` is Monday through Friday. `0 9 * * 1-5` is 09:00 on weekdays.",
    task: "Fire at 09:00, Monday through Friday only.",
    solution: "0 9 * * 1-5",
    hint: "Minute `0`, hour `9`, `*` for the date fields, and `1-5` for the weekday.",
    starter: "0 9 * * *",
  },
  {
    id: "sunday",
    group: "Days & dates",
    title: "A single weekday",
    teach:
      "Pin the day-of-week field to one number to run weekly. `0` is Sunday (and `7` is Sunday too, on most crons).",
    task: "Fire at midnight every Sunday.",
    solution: "0 0 * * 0",
    hint: "Minute `0`, hour `0`, weekday `0`.",
    starter: "0 0 * * *",
  },
  {
    id: "monthly",
    group: "Days & dates",
    title: "Day of the month",
    teach:
      "The third field is day-of-month, 1–31. `0 0 1 * *` fires at midnight on the 1st of every month — a classic for monthly reports.",
    task: "Fire at midnight on the 1st of every month.",
    solution: "0 0 1 * *",
    hint: "Minute `0`, hour `0`, day-of-month `1`.",
    starter: "0 0 * * *",
  },
  {
    id: "yearly",
    group: "Days & dates",
    title: "Once a year",
    teach:
      "The fourth field is the month, 1–12. Fix the month and the day-of-month together for an annual job. `0 0 1 1 *` is midnight on January 1st.",
    task: "Fire at midnight on New Year's Day — January 1st.",
    solution: "0 0 1 1 *",
    hint: "Minute `0`, hour `0`, day `1`, month `1`.",
    starter: "0 0 1 * *",
  },
  {
    id: "dom-or-dow",
    group: "Days & dates",
    title: "The day-of-month / day-of-week quirk",
    teach:
      "When BOTH the day-of-month and day-of-week fields are restricted, cron fires when EITHER matches — not both. `0 0 1 * 1` runs on the 1st of the month AND on every Monday.",
    task: "Fire at midnight on the 1st of the month, and also on every Monday.",
    solution: "0 0 1 * 1",
    hint: "Minute `0`, hour `0`, day-of-month `1`, and weekday `1` (Monday).",
    starter: "0 0 1 * *",
  },
];
