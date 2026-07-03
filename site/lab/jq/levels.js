// levels.js — the jq trainer curriculum. A gentle ramp from `.` to `add`.
//
// Each level is self-contained:
//   id       stable slug (also the localStorage key suffix)
//   group    section label for the level rail
//   title    short human name
//   teach    the concept, one or two sentences (supports \n)
//   task     the imperative goal for THIS level
//   input    a JS value — serialized to JSON and fed to jq as stdin
//   solution a reference jq filter. The GOAL OUTPUT is computed by actually
//            running this through jq, so any filter that reproduces the same
//            stdout counts as correct (there's usually more than one way).
//   hint     a nudge that reveals the shape without giving the answer
//   starter  what to prefill the filter box with (defaults to ".")
//
// Keeping the data here (not in game.jsx) means adding a lesson is a one-object
// edit — same spirit as window.LAB on the landing page.

const PROFILE = { name: "fatih", role: "engineer", city: "Toronto" };
const NESTED = { user: { name: "fatih", city: "Toronto", country: "Canada" } };
const LANGS = { langs: ["go", "python", "rust", "c"] };

// A recurring "too many servers" dataset for the back half — on-brand, and
// rich enough to teach reshape / filter / aggregate without changing shape.
const FLEET = {
  servers: [
    { name: "db-01",    region: "yyz", cpu: 40, mem: 62 },
    { name: "web-01",   region: "yyz", cpu: 72, mem: 38 },
    { name: "cache-01", region: "sfo", cpu: 18, mem: 80 },
    { name: "web-02",   region: "sfo", cpu: 91, mem: 55 },
  ],
};

window.JQ_LEVELS = [
  // ---- Basics ----
  {
    id: "identity",
    group: "Basics",
    title: "The identity filter",
    teach:
      "jq reads JSON on stdin and runs a filter over it. The simplest filter is `.` — the identity. It hands the input straight back, unchanged.",
    task: "Echo the whole object back out untouched.",
    input: PROFILE,
    solution: ".",
    hint: "It's a single character, and it's already in the box.",
    starter: ".",
  },
  {
    id: "field",
    group: "Basics",
    title: "Reach into a field",
    teach:
      "Follow `.` with a key to pull that field out: `.name`. This is the bread and butter of jq.",
    task: "Extract just the person's role.",
    input: PROFILE,
    solution: ".role",
    hint: "`.` then the key you want.",
    starter: ".",
  },
  {
    id: "nested",
    group: "Basics",
    title: "Dig through nesting",
    teach:
      "Chain keys to descend into nested objects: `.a.b.c` walks down each level.",
    task: "Get the city the user lives in.",
    input: NESTED,
    solution: ".user.city",
    hint: "Start at `.user`, then go one deeper.",
    starter: ".",
  },

  // ---- Arrays ----
  {
    id: "index",
    group: "Arrays",
    title: "Index an array",
    teach:
      "Arrays are zero-indexed. `.langs[0]` is the first element; negative indices count from the end (`.langs[-1]`).",
    task: "Pull out the second language in the list.",
    input: LANGS,
    solution: ".langs[1]",
    hint: "Second element means index… not 2.",
    starter: ".langs",
  },
  {
    id: "iterate",
    group: "Arrays",
    title: "Iterate an array",
    teach:
      "`.[]` explodes an array into a stream of its elements — jq emits one result per item instead of one array.",
    task: "Emit each language on its own, as a stream.",
    input: LANGS,
    solution: ".langs[]",
    hint: "Append `[]` to the array to spread it.",
    starter: ".langs",
  },
  {
    id: "iterate-field",
    group: "Arrays",
    title: "Iterate, then reach in",
    teach:
      "Combine iteration with field access: `.servers[].name` streams the name of every server. `.servers[] | .name` does the same with an explicit pipe.",
    task: "List the name of every server.",
    input: FLEET,
    solution: ".servers[].name",
    hint: "Spread `.servers` with `[]`, then take `.name`.",
    starter: ".servers",
  },

  // ---- Reshape ----
  {
    id: "construct",
    group: "Reshape",
    title: "Build a new object",
    teach:
      "`{ }` constructs objects. `{name, cpu}` is shorthand for `{name: .name, cpu: .cpu}` — jq fills each value from the matching field.",
    task: "For each server, keep only its name and cpu.",
    input: FLEET,
    solution: ".servers[] | {name, cpu}",
    hint: "Iterate the servers, then pipe into `{name, cpu}`.",
    starter: ".servers[]",
  },
  {
    id: "select",
    group: "Reshape",
    title: "Filter with select()",
    teach:
      "`select(cond)` passes a value through only when `cond` is true, and drops it otherwise. Great for keeping the rows you care about.",
    task: "Keep only the servers running hot — cpu above 70.",
    input: FLEET,
    solution: ".servers[] | select(.cpu > 70)",
    hint: "Iterate, then `select(.cpu > 70)`.",
    starter: ".servers[]",
  },
  {
    id: "collect",
    group: "Reshape",
    title: "Collect a stream back up",
    teach:
      "Wrapping a stream in `[ ]` gathers it back into an array. `[.servers[].cpu]` turns a stream of numbers into one list. `map(.cpu)` is the idiomatic cousin.",
    task: "Produce an array of every server's cpu value.",
    input: FLEET,
    solution: "[.servers[].cpu]",
    hint: "Put the iterating filter inside `[ ... ]`.",
    starter: ".servers[].cpu",
  },

  // ---- Aggregate ----
  {
    id: "length",
    group: "Aggregate",
    title: "Count with length",
    teach:
      "`length` measures things: array size, string length, or number of object keys. Pipe an array into it to count.",
    task: "How many servers are in the fleet?",
    input: FLEET,
    solution: ".servers | length",
    hint: "Pipe the servers array into `length`.",
    starter: ".servers",
  },
  {
    id: "group",
    group: "Aggregate",
    title: "Group by a key",
    teach:
      "`group_by(f)` sorts by `f`, then buckets adjacent equal values into sub-arrays. The result is an array of groups.",
    task: "Bucket the servers by region.",
    input: FLEET,
    solution: ".servers | group_by(.region)",
    hint: "Pipe the servers into `group_by(.region)`.",
    starter: ".servers",
  },
  {
    id: "sum",
    group: "Aggregate",
    title: "Add it all up",
    teach:
      "`add` folds a stream or array into a single value — summing numbers, concatenating strings or arrays. Collect first, then add.",
    task: "Compute the total cpu across the whole fleet.",
    input: FLEET,
    solution: "[.servers[].cpu] | add",
    hint: "Collect the cpu values into an array, then pipe to `add`.",
    starter: "[.servers[].cpu]",
  },
];
