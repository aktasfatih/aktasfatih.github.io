// Icons.jsx — curated stroke icons (Lucide-style: 24×24, stroke 2, round)
// plus single-path brand glyphs (Simple Icons style). Self-contained so the
// kit needs no icon-font dependency.

const Svg = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" {...props}>{props.children}</svg>
);

const ArrowRight = (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Svg>;
const ArrowUpRight = (p) => <Svg {...p}><path d="M7 17 17 7M7 7h10v10"/></Svg>;
const Mail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Svg>;
const MapPin = (p) => <Svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></Svg>;
const Rss = (p) => <Svg {...p}><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></Svg>;
const Clock = (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Svg>;
const Calendar = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Svg>;
const Terminal = (p) => <Svg {...p}><path d="m5 8 4 4-4 4M12 16h6"/><rect x="2" y="3" width="20" height="18" rx="2"/></Svg>;
const Search = (p) => <Svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Svg>;

// Brand glyphs (filled, single path)
const Github = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/>
  </svg>
);
const LinkedIn = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/>
  </svg>
);
const XCom = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor" aria-hidden="true">
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.3L17.61 20.65Z"/>
  </svg>
);
const StackOverflow = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor" aria-hidden="true">
    <path d="M17.36 20.2v-5.38h1.79V22H3.5v-7.18h1.79v5.38h12.07ZM6.77 14.32l.37-1.76 8.79 1.85-.37 1.76-8.79-1.85Zm1.16-4.21.76-1.61 8.14 3.79-.76 1.62-8.14-3.8Zm2.26-3.99 1.15-1.38 6.9 5.76-1.15 1.37-6.9-5.75ZM14.64 2l5.35 7.21-1.44 1.07L13.2 3.07 14.64 2ZM6.59 18.41h8.95v1.79H6.59v-1.79Z"/>
  </svg>
);

Object.assign(window, {
  SiteIcons: {
    ArrowRight, ArrowUpRight, Mail, MapPin, Rss, Clock, Calendar, Terminal, Search,
    Github, LinkedIn, XCom, StackOverflow,
  },
});
