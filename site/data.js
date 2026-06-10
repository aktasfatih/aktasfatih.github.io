// data.js — content for the personal site UI kit. Topical to Fatih's domains
// (Linux, operating systems, software engineering). Demo content for the kit.

window.SITE = {
  name: "Fatih Aktas",
  role: "Software Engineer",
  location: "Toronto, Canada",
  intro:
    "I'm a computer engineer who likes systems that are simple on the outside and honest on the inside. I build software, run a few too many servers, and write about what breaks along the way.",
  social: {
    github: "https://github.com/aktasfatih",
    linkedin: "https://www.linkedin.com/in/fatih-aktas/",
    x: "https://twitter.com/moreincode",
    stackoverflow: "https://stackoverflow.com/users/5027899/fatih-akta%c5%9f",
    email: "akfatih2@gmail.com",
  },
  posts: [
    {
      slug: "reading-systemd-journals",
      title: "Reading systemd journals like a human",
      date: "2024-11-03",
      readtime: 6,
      tags: ["linux", "systemd"],
      excerpt:
        "journalctl is the most useful tool I ignored for years. A small field guide to following, filtering, and finally not fearing your logs.",
      featured: true,
    },
    {
      slug: "what-the-page-fault",
      title: "What the page fault?",
      date: "2024-08-18",
      readtime: 9,
      tags: ["operating-systems", "memory"],
      excerpt:
        "A page fault is not an error — it's the kernel doing its job. Walking through demand paging the way I wish someone had walked me through it.",
      featured: true,
    },
    {
      slug: "the-cost-of-a-context-switch",
      title: "The quiet cost of a context switch",
      date: "2024-05-29",
      readtime: 7,
      tags: ["operating-systems", "performance"],
      excerpt:
        "Threads feel free until your profiler says otherwise. Measuring what it actually costs to put one task down and pick another up.",
      featured: true,
    },
    {
      slug: "dotfiles-that-survive",
      title: "Dotfiles that survive a laptop change",
      date: "2024-02-11",
      readtime: 5,
      tags: ["tooling", "workflow"],
      excerpt:
        "I've reinstalled my setup more times than I'd like to admit. Here's the small, boring system that finally made it painless.",
      featured: false,
    },
    {
      slug: "grep-is-a-lifestyle",
      title: "grep is a lifestyle",
      date: "2023-12-02",
      readtime: 4,
      tags: ["tooling", "linux"],
      excerpt:
        "Half of debugging is knowing where to look. The other half is grep. A love letter to the command I type most.",
      featured: false,
    },
  ],
  experience: [
    { role: "Software Engineer", org: "Lumnion", period: "2022 — Now", note: "Backend & infrastructure for data-heavy products." },
    { role: "Software Developer", org: "Freelance & contract", period: "2020 — 2022", note: "Web platforms, automation, a lot of Linux." },
    { role: "B.Sc. Computer Engineering", org: "University of Alberta", period: "2015 — 2020", note: "Iron Ring earned. Edmonton winters survived." },
  ],
};
