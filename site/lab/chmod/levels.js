// levels.js — the chmod trainer curriculum. Each level hands you a file with a
// starting permission mode and a target mode; you write a single `chmod`
// argument that transforms one into the other. The engine applies your argument
// for real, so any argument that lands on the target counts — octal or symbolic.
//
// Each level is self-contained:
//   id       stable slug (also the localStorage key suffix)
//   group    section label for the level rail
//   title    short human name
//   teach    the concept, one or two sentences (backticks render as <code>)
//   task     the imperative goal for THIS level
//   name     the file (or directory) name, for flavour
//   dir      true if the target is a directory (matters for `X`)
//   start    starting mode, as an octal string
//   target   target mode, as an octal string
//   solution a reference chmod argument. The GOAL is `target`; any argument that
//            turns `start` into `target` is accepted.
//   hint     a nudge that reveals the shape without giving the answer
//   starter  what to prefill the box with (defaults to "")

window.CHMOD_LEVELS = [
  // ---- Octal ----
  {
    id: "octal-basics",
    group: "Octal",
    title: "Read the octal",
    teach:
      "A mode is three digits: one each for the owner (user), group and others. Each digit sums read = 4, write = 2, execute = 1. So `6` is read+write, `4` is read-only, `7` is all three.",
    task: "Set typical file permissions: read+write for the owner, read-only for everyone else.",
    name: "notes.txt",
    dir: false,
    start: "000",
    target: "644",
    solution: "644",
    hint: "Owner wants 4+2 = 6, group and others just 4. Three digits.",
    starter: "",
  },

  // ---- Symbolic: add & remove ----
  {
    id: "make-exec",
    group: "Add & remove",
    title: "Make it executable",
    teach:
      "Symbolic mode reads like a sentence: `who op what`. `a+x` means 'for all, add execute'. It flips just the execute bits and leaves the rest alone.",
    task: "Make the deploy script runnable by everyone, without touching its other bits.",
    name: "deploy.sh",
    dir: false,
    start: "644",
    target: "755",
    solution: "a+x",
    hint: "Add (`+`) execute (`x`) for all (`a`). `755` works too, but symbolic is tidier here.",
    starter: "",
  },
  {
    id: "owner-exec",
    group: "Add & remove",
    title: "Only the owner",
    teach:
      "The 'who' can be `u` (user/owner), `g` (group), `o` (others), or `a` (all). `u+x` adds execute for just the owner.",
    task: "Let only the owner run this tool — group and others shouldn't gain execute.",
    name: "backup",
    dir: false,
    start: "644",
    target: "744",
    solution: "u+x",
    hint: "Add execute, but scope the 'who' to `u`.",
    starter: "",
  },
  {
    id: "remove-write",
    group: "Add & remove",
    title: "Take write away",
    teach:
      "`-` removes bits, and you can stack the 'who' letters: `go` means group and others together. `go-w` strips write from both.",
    task: "This file is wide open at 777. Remove write access from the group and others.",
    name: "shared.log",
    dir: false,
    start: "777",
    target: "755",
    solution: "go-w",
    hint: "Remove (`-`) write (`w`) from group+others (`go`).",
    starter: "",
  },
  {
    id: "group-write",
    group: "Add & remove",
    title: "Let the group edit",
    teach:
      "Adding is symmetric to removing. `g+w` grants the group write access on top of whatever it already has.",
    task: "Give the group write access so teammates can edit this config.",
    name: "team.conf",
    dir: false,
    start: "644",
    target: "664",
    solution: "g+w",
    hint: "Add write for the group.",
    starter: "",
  },

  // ---- Set exactly ----
  {
    id: "set-exact",
    group: "Set exactly",
    title: "Set, don't add",
    teach:
      "`=` sets a 'who' to EXACTLY the listed perms, clearing anything else it had. `a=r` makes every class read-only in one stroke.",
    task: "Lock this down to read-only for everyone — no write, no execute.",
    name: "release.tar",
    dir: false,
    start: "777",
    target: "444",
    solution: "a=r",
    hint: "Use `=` (not `-`) to set all classes to just read.",
    starter: "",
  },
  {
    id: "private",
    group: "Set exactly",
    title: "Make it private",
    teach:
      "`=` with no perms clears a class entirely. `go=` wipes every bit from group and others, leaving only the owner's access.",
    task: "Make this secrets file private — the owner keeps rw, everyone else gets nothing.",
    name: "secrets.env",
    dir: false,
    start: "644",
    target: "600",
    solution: "go=",
    hint: "Set group and others to nothing with an empty `=`. (`600` works too.)",
    starter: "",
  },
  {
    id: "combine",
    group: "Set exactly",
    title: "Combine clauses",
    teach:
      "Chain clauses with commas and they apply left to right. `u+x,g=rx` adds owner execute, then sets the group to exactly read+execute.",
    task: "From owner-only rw, give the owner execute and make the group read+execute — others stay locked out.",
    name: "run-report",
    dir: false,
    start: "600",
    target: "750",
    solution: "u+x,g+rx",
    hint: "Two clauses separated by a comma: one for `u`, one for `g`.",
    starter: "",
  },

  // ---- Special bits ----
  {
    id: "sticky",
    group: "Special bits",
    title: "The sticky bit",
    teach:
      "A directory with the sticky bit (`t`) lets anyone create files but only lets each owner delete their own — this is how `/tmp` stays safe. It shows as `t` in the others-execute slot.",
    task: "Add the sticky bit to this world-writable shared directory.",
    name: "/srv/tmp",
    dir: true,
    start: "777",
    target: "1777",
    solution: "+t",
    hint: "Add (`+`) the sticky bit (`t`). (`1777` works too.)",
    starter: "",
  },
  {
    id: "setuid",
    group: "Special bits",
    title: "The setuid bit",
    teach:
      "Setuid (`u+s`) makes a program run as its owner rather than the caller — the mechanism behind `passwd`. It shows as `s` in the owner-execute slot.",
    task: "Set the setuid bit on this owner-executable helper.",
    name: "chsh",
    dir: false,
    start: "755",
    target: "4755",
    solution: "u+s",
    hint: "Add the setuid bit for the user: `u+s`. (`4755` works too.)",
    starter: "",
  },
  {
    id: "conditional-x",
    group: "Special bits",
    title: "Conditional execute",
    teach:
      "`X` (capital) adds execute only where it makes sense: on directories, or on files that are already executable. `a+X` on a directory makes it traversable without marking every plain file executable.",
    task: "Make this directory enterable for everyone using the safe, conditional execute.",
    name: "assets/",
    dir: true,
    start: "644",
    target: "755",
    solution: "a+X",
    hint: "Use a capital `X` instead of `x`. On a directory it behaves like `+x`.",
    starter: "",
  },
];
