// sections.jsx — Work, About, Contact, Footer
const { IconButton } = window.FatihAktasDesignSystem_e4dcbf;

function Cmd({ path, cmd }) {
  return (
    <div className="cmd reveal"><span className="p">~/fatih&nbsp;$&nbsp;</span><span className="c">{cmd}</span>&nbsp;{path}</div>
  );
}

/* ---------------- Work ---------------- */
function Work() {
  const S = window.SITE;
  return (
    <section className="section" id="work">
      <div className="wrap">
        <Cmd cmd="cat" path="work.log" />
        <div className="section__head reveal">
          <div>
            <h2 className="section__title">Where I've <span className="accent">been</span></h2>
            <p className="section__lede">Backend, infrastructure, and a steady diet of Linux — from Edmonton winters to Toronto.</p>
          </div>
        </div>
        <div className="work">
          {S.experience.map((e, i) => (
            <div className="tl reveal" data-d={String((i % 4) + 1)} key={i}>
              <div className="tl__period">
                {e.period.includes("Now")
                  ? <span>{e.period.replace("Now", "")}<span className="now">now</span></span>
                  : e.period}
              </div>
              <div>
                <h3 className="tl__role">{e.role}</h3>
                <div className="tl__org">{e.org}</div>
                <p className="tl__note">{e.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
function About() {
  const S = window.SITE;
  return (
    <section className="section" id="about">
      <div className="wrap">
        <Cmd cmd="cat" path="about.md" />
        <div className="about__grid">
          <div className="reveal">
            <h2 className="section__title" style={{ marginBottom: "var(--space-5)" }}>The longer <span className="accent">story</span></h2>
            <div className="about__bio">
              <p>I'm a computer engineer who likes systems that are <b>simple on the outside and honest on the inside</b>. Most of my favourite work happens a layer or two below the surface — where the kernel, the filesystem, and the network quietly decide whether your day goes well.</p>
              <p>I studied Computer Engineering at the <b>University of Alberta</b> (Iron Ring earned, Edmonton winters survived), and these days I build backend and infrastructure for data-heavy products out of Toronto. I run more servers than strictly necessary, mostly so I have something to write about when they break.</p>
              <p>When something breaks at 3 a.m., I try to understand it well enough to explain it over coffee. That's most of what the writing is.</p>
            </div>
          </div>
          <div className="facts reveal" data-d="1">
            <div className="facts__title">~/fatih/about.yml</div>
            <div className="fact"><span className="fact__k">name</span><span className="fact__v">{S.name}</span></div>
            <div className="fact"><span className="fact__k">role</span><span className="fact__v"><span className="ac">{S.role}</span></span></div>
            <div className="fact"><span className="fact__k">based</span><span className="fact__v">{S.location}</span></div>
            <div className="fact"><span className="fact__k">degree</span><span className="fact__v">M.S. CS · B.Sc. CompE</span></div>
            <div className="fact"><span className="fact__k">school</span><span className="fact__v">Georgia Tech · UAlberta</span></div>
            <div className="fact"><span className="fact__k">stack</span><span className="fact__v">Go · Node.js · Python · Cloud</span></div>
            <div className="fact"><span className="fact__k">oss</span><span className="fact__v">WordPress Gutenberg</span></div>
            <div className="fact"><span className="fact__k">langs</span><span className="fact__v">English · French</span></div>
            <div className="fact"><span className="fact__k">awards</span><span className="fact__v">UAlberta scholarships</span></div>
            <div className="fact"><span className="fact__k">editor</span><span className="fact__v">nvim</span></div>
            <div className="fact"><span className="fact__k">status</span><span className="fact__v"><span className="ac">open to interesting work</span></span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
function Contact() {
  const I = window.SiteIcons;
  const S = window.SITE;
  return (
    <section className="section" id="contact">
      <div className="wrap">
        <Cmd cmd="./" path="contact.sh" />
        <div className="contact reveal">
          <div className="contact__inner">
            <h2>Get in <span className="accent">touch</span></h2>
            <p className="contact__lede">Have a systems problem worth chewing on, or just want to say hi? My inbox is open.</p>
            <div className="contact__prompt">
              <span className="p">$</span> mail <a href={"mailto:" + S.social.email}>{S.social.email}</a>
            </div>
            <div className="contact__socials">
              <IconButton label="GitHub" variant="outline" as="a" href={S.social.github} target="_blank"><I.Github size={18} /></IconButton>
              <IconButton label="X" variant="outline" as="a" href={S.social.x} target="_blank"><I.XCom size={17} /></IconButton>
              <IconButton label="LinkedIn" variant="outline" as="a" href={S.social.linkedin} target="_blank"><I.LinkedIn size={18} /></IconButton>
              <IconButton label="Stack Overflow" variant="outline" as="a" href={S.social.stackoverflow} target="_blank"><I.StackOverflow size={18} /></IconButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  const I = window.SiteIcons;
  const S = window.SITE;
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div className="footer__left">
          <div className="footer__cmd"><span className="p">~/fatih $</span> echo "thanks for scrolling"</div>
          <div className="footer__note">© {year} {S.name} · aktasfatih.com · built in a terminal, mostly · {S.location}</div>
        </div>
        <div className="footer__social">
          <IconButton label="GitHub" variant="ghost" as="a" href={S.social.github} target="_blank"><I.Github size={18} /></IconButton>
          <IconButton label="X" variant="ghost" as="a" href={S.social.x} target="_blank"><I.XCom size={17} /></IconButton>
          <IconButton label="LinkedIn" variant="ghost" as="a" href={S.social.linkedin} target="_blank"><I.LinkedIn size={18} /></IconButton>
          <IconButton label="Email" variant="ghost" as="a" href={"mailto:" + S.social.email}><I.Mail size={18} /></IconButton>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Work, About, Contact, Footer, Cmd });
