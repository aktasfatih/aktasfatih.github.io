// levels.js — the regex trainer curriculum. A gentle ramp from a bare literal
// to capture groups and flags. The engine is the browser's own RegExp, so any
// pattern the user types runs for real.
//
// Each level is self-contained:
//   id       stable slug (also the localStorage key suffix)
//   group    section label for the level rail
//   title    short human name
//   teach    the concept, one or two sentences (backticks render as <code>)
//   task     the imperative goal for THIS level
//   text     the subject string the pattern is run against
//   solution a reference pattern. The GOAL is the set of matches produced by
//            running this pattern (with `g` forced on) over `text`, so ANY
//            pattern that reproduces the same matches counts as correct.
//   flags    solution flags, minus the always-on `g` (e.g. "i", "m", "")
//   hint     a nudge that reveals the shape without giving the answer
//   starter  what to prefill the pattern box with (defaults to "")
//
// Keeping the data here (not in game.jsx) means adding a lesson is a one-object
// edit — same spirit as window.LAB on the landing page.

window.REGEX_LEVELS = [
  // ---- Literals ----
  {
    id: "literal",
    group: "Literals",
    title: "Match a literal",
    teach:
      "Most characters in a pattern match themselves. `cat` finds the letters c-a-t anywhere — even inside a bigger word. With the global scan on, every occurrence lights up.",
    task: "Highlight every run of the letters `cat` — inside other words counts too.",
    text: "cat scatter category cats concatenate",
    solution: "cat",
    flags: "",
    hint: "Just type the three letters you want to find. No magic characters needed.",
    starter: "",
  },
  {
    id: "dot",
    group: "Literals",
    title: "The wildcard dot",
    teach:
      "`.` matches any single character (except a newline). So `c.t` matches `cat`, `cot`, `c7t`, `c!t` — a c, then anything, then a t.",
    task: "Match every three-character c-something-t token.",
    text: "cat cot cut c9t c#t cart",
    solution: "c.t",
    flags: "",
    hint: "A c, a dot for the middle, then a t. `cart` is four chars, so it won't fully match.",
    starter: "c",
  },
  {
    id: "escape",
    group: "Literals",
    title: "Escape a metacharacter",
    teach:
      "Since `.` is special, matching a literal dot needs a backslash: `\\.`. The same trick escapes any metacharacter — `\\*`, `\\(`, `\\?`.",
    task: "Match only the real version number `3.14` — not `3x14` or `3-14`.",
    text: "pi is 3.14, not 3x14 or 3-14",
    solution: "3\\.14",
    flags: "",
    hint: "A bare `3.14` would also match `3x14`. Escape the dot so it means a literal period.",
    starter: "3.14",
  },

  // ---- Character classes ----
  {
    id: "class",
    group: "Character classes",
    title: "A set of characters",
    teach:
      "`[ ]` matches any ONE character listed inside. `[bcr]at` matches `bat`, `cat` or `rat` — the bracket stands in for a single slot.",
    task: "Match the words that end in `at` and start with b, c or r.",
    text: "bat cat rat mat sat pat",
    solution: "[bcr]at",
    flags: "",
    hint: "List the three allowed first letters inside `[...]`, then follow with `at`.",
    starter: "[]at",
  },
  {
    id: "range",
    group: "Character classes",
    title: "Ranges inside a class",
    teach:
      "Inside `[ ]`, a dash makes a range: `[a-z]` is any lowercase letter, `[0-9]` any digit. Combine them: `[A-Za-z0-9]`.",
    task: "Match every uppercase-letter-then-digit label, like `A1` — skip the lowercase `c3`.",
    text: "seats A1, B2, c3, D4, e5",
    solution: "[A-Z][0-9]",
    flags: "",
    hint: "One class for the capital letter `[A-Z]`, a second for the digit `[0-9]`.",
    starter: "",
  },
  {
    id: "negate",
    group: "Character classes",
    title: "Negate a class",
    teach:
      "A `^` as the FIRST character inside the brackets flips it: `[^ ]` matches anything that is NOT a space. Handy for 'any character except…'.",
    task: "Match each `b?g` token where the middle is anything but a space.",
    text: "b_g b0g bxg b g bag",
    solution: "b[^ ]g",
    flags: "",
    hint: "`b`, then a class that excludes the space with a leading `^`, then `g`.",
    starter: "b[ ]g",
  },

  // ---- Quantifiers ----
  {
    id: "star",
    group: "Quantifiers",
    title: "Zero or more with *",
    teach:
      "`*` repeats the previous item zero or more times. `ab*c` matches `ac` (zero b's), `abc`, `abbc`, `abbbc`… but not `axc`.",
    task: "Match `a`, any number of `b`s, then `c` — including the no-b case `ac`.",
    text: "ac abc abbc abbbc axc",
    solution: "ab*c",
    flags: "",
    hint: "Put the `*` right after the `b` so it repeats just the b.",
    starter: "abc",
  },
  {
    id: "plus",
    group: "Quantifiers",
    title: "One or more with +",
    teach:
      "`+` is like `*` but demands at least one. `ab+c` matches `abc` and `abbc`, but NOT `ac` — there has to be a b.",
    task: "Match the same shape as before, but this time `ac` should be left out.",
    text: "ac abc abbc abbbc axc",
    solution: "ab+c",
    flags: "",
    hint: "Swap the `*` for a `+` so at least one b is required.",
    starter: "ab*c",
  },
  {
    id: "optional",
    group: "Quantifiers",
    title: "Optional with ?",
    teach:
      "`?` makes the previous item optional — zero or one. `colou?r` matches both the American `color` and the British `colour`.",
    task: "Match both spellings — `color` and `colour` — but not `colonr`.",
    text: "color colour colonr colouur",
    solution: "colou?r",
    flags: "",
    hint: "Mark the `u` as optional with a `?`. Note `colouur` has two u's, so it won't match.",
    starter: "colour",
  },
  {
    id: "bounded",
    group: "Quantifiers",
    title: "Counted repeats {n,m}",
    teach:
      "`{n,m}` sets exact bounds: `x{2,3}` means two or three x's. `{4}` is exactly four, `{2,}` is two or more. Quantifiers are greedy — they grab as many as allowed.",
    task: "Match runs of two or three `x`s. (Greedy: `xxxx` yields one `xxx`.)",
    text: "x xx xxx xxxx",
    solution: "x{2,3}",
    flags: "",
    hint: "Follow `x` with `{2,3}`. The lone `x` is too short to match.",
    starter: "x",
  },
  {
    id: "lazy",
    group: "Quantifiers",
    title: "Greedy vs. lazy",
    teach:
      "By default `.+` is greedy and grabs as much as it can. Add a `?` to make it lazy — `.+?` stops at the first chance. That's how you match one tag at a time instead of the whole line.",
    task: "Match each `<tag>` on its own, not one giant span from the first `<` to the last `>`.",
    text: "<b>hi</b> <i>yo</i>",
    solution: "<.+?>",
    flags: "",
    hint: "`<.+>` is greedy and swallows too much. Make the `+` lazy with a trailing `?`.",
    starter: "<.+>",
  },

  // ---- Anchors ----
  {
    id: "anchor",
    group: "Anchors",
    title: "Anchor to line start",
    teach:
      "`^` matches the start of the text, and `$` the end. With the `m` (multiline) flag, they anchor to the start/end of every line — perfect for scanning logs.",
    task: "Match only the lines that begin with `error`. You'll need the `m` flag.",
    text: "error: disk full\nok: all clear\nerror: timeout\nwarn: high load",
    solution: "^error",
    flags: "m",
    hint: "Put `^` before `error`, and type `m` in the flags box so `^` sees each line.",
    starter: "error",
  },
  {
    id: "boundary",
    group: "Anchors",
    title: "Word boundaries",
    teach:
      "`\\b` matches a word boundary — the edge between a word character and a non-word one. `\\bcat\\b` matches the standalone word `cat` but skips `category` or `scatter`.",
    task: "Match `cat` only as a whole word — not inside `category`, `scatter`, or `cats`.",
    text: "a cat, the category, some scatter, two cats, one cat.",
    solution: "\\bcat\\b",
    flags: "",
    hint: "Wrap the word: `\\b` before and `\\b` after `cat`.",
    starter: "cat",
  },

  // ---- Shorthand classes ----
  {
    id: "shorthand",
    group: "Shorthand",
    title: "\\d \\w \\s",
    teach:
      "Shorthands save typing: `\\d` is a digit `[0-9]`, `\\w` a word char `[A-Za-z0-9_]`, `\\s` whitespace. Uppercase negates — `\\D` is a non-digit.",
    task: "Match every run of one or more digits in the order line.",
    text: "Order #4021 shipped 2024-11-03 via truck 7",
    solution: "\\d+",
    flags: "",
    hint: "`\\d` for a digit, `+` to grab the whole run.",
    starter: "\\d",
  },

  // ---- Groups & flags ----
  {
    id: "alternation",
    group: "Groups & flags",
    title: "Alternation with |",
    teach:
      "`|` means OR, and `( )` groups a slice of the pattern so the `|` only spans what you intend. `(GET|POST)` matches either verb.",
    task: "Match every `GET` or `POST` method in the request log.",
    text: "GET /a  POST /b  PUT /c  DELETE /d  GET /e",
    solution: "GET|POST",
    flags: "",
    hint: "Put the two alternatives on either side of a `|`. Grouping with `(...)` is optional here.",
    starter: "GET",
  },
  {
    id: "capture",
    group: "Groups & flags",
    title: "Capture groups",
    teach:
      "Parentheses also CAPTURE — the text matched inside `( )` is pulled out as a group you can read back. `(\\d{4})-\\d{2}-\\d{2}` captures just the year from a date.",
    task: "Match each ISO date and capture the four-digit year in group 1.",
    text: "shipped 2024-11-03, delivered 2025-01-20",
    solution: "(\\d{4})-\\d{2}-\\d{2}",
    flags: "",
    hint: "Wrap the year part `\\d{4}` in parentheses; keep matching the `-\\d{2}-\\d{2}` tail.",
    starter: "\\d{4}-\\d{2}-\\d{2}",
  },
  {
    id: "insensitive",
    group: "Groups & flags",
    title: "Case-insensitive flag",
    teach:
      "Flags tune the whole match. The `i` flag makes it case-insensitive, so one small pattern catches every casing of a word.",
    task: "Match every spelling of `error`, whatever the case — but not `ok`.",
    text: "Error ERROR error erRor ok",
    solution: "error",
    flags: "i",
    hint: "Keep the pattern as plain `error` and add an `i` in the flags box.",
    starter: "error",
  },
];
