// data.js — content for the personal site UI kit. Topical to Fatih's domains
// (Linux, operating systems, software engineering). Demo content for the kit.

window.SITE = {
  name: "Fatih Aktas",
  role: "Software Engineer",
  focus: "Healthcare Tech · AI",
  location: "Toronto, Canada",
  intro:
    "I'm a computer engineer who likes systems that are simple on the outside and honest on the inside. I build software, run a few too many servers, and write about what breaks along the way.",
  social: {
    github: "https://github.com/aktasfatih",
    linkedin: "https://www.linkedin.com/in/fatih-aktas/",
    x: "https://twitter.com/moreincode",
    stackoverflow: "https://stackoverflow.com/users/5027899/fatih-akta%c5%9f",
    email: "hello@aktasfatih.com",
  },
  projects: [
    {
      name: "Planning Poker",
      url: "https://planning-poker.app/",
      tagline: "Free, real-time planning poker for agile teams — no signup, live estimation, with Jira/Linear import and Slack/Teams reminders.",
      tags: ["real-time", "agile", "saas"],
    },
  ],
  experience: [
    { role: "M.S. Computer Science", org: "Georgia Tech", period: "2024 — 2026", note: "Graduate study in CS with an AI specialization — 4.0 GPA, plus information security and software development." },
    { role: "Software Engineer", org: "Lumnion", period: "2021 — 2022", note: "AI-powered risk & exposure tooling for insurance, plus OpenStreetMap data pipelines and fuzzy entity resolution over messy real-world data. JavaScript & Python." },
    { role: "B.Sc. Computer Engineering", org: "University of Alberta", period: "2016 — 2021", note: "Iron Ring earned. Edmonton winters survived." },
    { role: "Web Developer", org: "BLV", period: "2018", note: "PHP/MySQL content management — optimized queries, static page generation, and hardening against SQLi, XSS & CSRF." },
  ],
};

// LAB — small interactive apps I build to learn (and to teach). Each entry is a
// card in the ~/lab grid on the landing page; the button opens the app. Adding
// one is a single object here + a folder under site/lab/<slug>/.
//   status: "live" | "wip"
window.LAB = [
  {
    slug: "jq",
    title: "jq trainer",
    blurb: "Learn jq interactively — type real filters against sample JSON and watch them run. Twelve levels from the identity dot to aggregations, checked by real jq in WebAssembly.",
    tags: ["jq", "JSON", "WASM"],
    status: "live",
    href: "lab/jq/",
    cta: "Play",
  },
  {
    slug: "regex",
    title: "regex trainer",
    blurb: "Learn regular expressions interactively — type real patterns against sample text and watch them match live. Seventeen levels from a bare literal to capture groups and flags, run by your browser's native RegExp.",
    tags: ["regex", "text", "RegExp"],
    status: "live",
    href: "lab/regex/",
    cta: "Play",
  },
];
