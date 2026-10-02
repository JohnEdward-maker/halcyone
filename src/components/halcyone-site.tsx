import { useEffect, useRef, useState } from "react";
import { Menu, Play, Search, X } from "lucide-react";

const CHAPTERS = [
  {
    n: "01",
    title: "The Blink",
    line: "She keeps the stolen hour in her eye.",
    src: "/media/blink.mp4",
    poster: "/media/blink.jpg",
  },
  {
    n: "02",
    title: "Meridian Below",
    line: "A city that exists only between midnight and dawn.",
    src: "/media/city.mp4",
    poster: "/media/city.jpg",
  },
  {
    n: "03",
    title: "The Instrument",
    line: "The map is a machine. It remembers who holds it.",
    src: "/media/instrument.mp4",
    poster: "/media/instrument.jpg",
  },
  {
    n: "04",
    title: "The Bridge",
    line: "Dawn is a closed door. She walks toward it anyway.",
    src: "/media/trailer.mp4",
    poster: "/media/city.jpg",
  },
] as const;

const CAST = [
  {
    name: "Amara Quill",
    role: "Halcyone Voss",
    src: "/media/hero.jpg",
  },
  {
    name: "Idris Okonkwo",
    role: "The Archivist",
    src: "/media/cast-idris.jpg",
  },
  {
    name: "Mira Chen",
    role: "Juniper Voss",
    src: "/media/cast-mira.jpg",
  },
  {
    name: "Calder Rhys",
    role: "Mayor Ell",
    src: "/media/cast-calder.jpg",
  },
] as const;

const DATES = ["Thu 14 May", "Fri 15 May", "Sat 16 May"] as const;
const TIMES = ["19:30", "21:10", "22:40"] as const;
const ROWS = ["A", "B", "C", "D", "E"] as const;
const TAKEN = new Set(["A3", "A4", "B2", "C6", "C7", "D1", "E5", "E8"]);

const INDEX = [
  { id: "top", label: "Poster" },
  { id: "reel", label: "Production" },
  { id: "story", label: "Story" },
  { id: "cast", label: "Cast" },
  { id: "release", label: "Release" },
] as const;

type Overlay = "search" | "ticket" | "trailer" | null;

function trackProgress(el: HTMLElement) {
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
  return scrolled / total;
}

export function HalcyoneSite() {
  const heroRef = useRef<HTMLElement>(null);
  const reelTrackRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
  const imaxRef = useRef(false);
  const overlayRef = useRef<Overlay>(null);
  const trailerRef = useRef<HTMLVideoElement>(null);

  const [overlay, setOverlay] = useState<Overlay>(null);
  const [imax, setImax] = useState(false);
  const [date, setDate] = useState<(typeof DATES)[number]>(DATES[1]);
  const [time, setTime] = useState<(typeof TIMES)[number]>(TIMES[1]);
  const [seat, setSeat] = useState<string | null>(null);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    imaxRef.current = imax;
    document.body.classList.toggle("imax", imax);
  }, [imax]);

  useEffect(() => {
    overlayRef.current = overlay;
    document.body.classList.toggle("lock", overlay !== null);
    if (overlay !== "trailer" && trailerRef.current) {
      trailerRef.current.pause();
    }
    if (overlay === "trailer") {
      const video = trailerRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => undefined);
      }
    }
  }, [overlay]);

  useEffect(() => {
    document.documentElement.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("in");
        }
      },
      { threshold: 0.18 },
    );
    nodes.forEach((node) => io.observe(node));

    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = heroRef.current;
      const poster = posterRef.current;
      const bar = barRef.current;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (hero && poster && !reduce) {
        const p = trackProgress(hero);
        const travel = 1 - Math.pow(1 - p, 1.4);
        const spread = imaxRef.current ? 18 : 13;
        const left = poster.querySelector<HTMLElement>("[data-hero='left']");
        const right = poster.querySelector<HTMLElement>("[data-hero='right']");
        const figure = poster.querySelector<HTMLElement>("[data-hero='figure']");
        const eclipse = poster.querySelector<HTMLElement>("[data-hero='eclipse']");
        const enter = hero.querySelector<HTMLElement>("[data-hero='enter']");
        const shift = (el: HTMLElement | null, x: number, y: number, opacity: number) => {
          if (!el) return;
          el.style.transform = `translate3d(${x}vw, ${y}vh, 0)`;
          el.style.opacity = String(opacity);
        };
        if (left) {
          left.style.transform = `translate3d(${-travel * spread}vw, 0, 0)`;
          left.querySelectorAll("i").forEach((letter, index) => {
            const weight = (4 - index) / 4;
            letter.style.transform = `translate3d(${-travel * weight * 4}vw, ${travel * (index - 1.5) * 2}vh, 0)`;
          });
        }
        if (right) {
          right.style.transform = `translate3d(${travel * spread}vw, 0, 0)`;
          right.querySelectorAll("i").forEach((letter, index) => {
            const weight = (index + 1) / 4;
            letter.style.transform = `translate3d(${travel * weight * 4}vw, ${travel * (1.5 - index) * 2}vh, 0)`;
          });
        }
        if (figure) {
          figure.style.transform = `translate3d(-50%, calc(-48% - ${travel * 7}vh), 0)`;
        }
        if (eclipse) {
          eclipse.style.transform = `translate3d(-50%, -50%, 0) scale(${0.8 + travel * 0.55})`;
        }
        shift(poster.querySelector("[data-hero='nav']"), 0, -travel * 4, Math.max(0, 1 - travel * 1.7));
        shift(poster.querySelector("[data-hero='names']"), 0, -travel * 5, Math.max(0, 1 - travel * 1.35));
        shift(poster.querySelector("[data-hero='mark']"), 0, -travel * 2.5, Math.max(0, 1 - travel * 1.5));
        shift(poster.querySelector("[data-hero='meta']"), 0, travel * 8, Math.max(0, 1 - travel * 1.45));
        shift(poster.querySelector("[data-hero='sprocket']"), 0, travel * 5, Math.max(0, 1 - travel * 1.2));
        const year = poster.querySelector<HTMLElement>("[data-hero='year']");
        if (year) {
          year.style.transform = `translate3d(${travel * 8}vw, -50%, 0)`;
          year.style.opacity = String(Math.max(0, 1 - travel * 1.4));
        }
        if (marqueeRef.current) {
          marqueeRef.current.style.transform = `translate3d(${-travel * 28}%, ${travel * 4}vh, 0)`;
          marqueeRef.current.style.opacity = String(Math.max(0, 1 - travel * 1.3));
        }
        if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - travel * 4));
        if (enter) {
          const reveal = Math.min(1, Math.max(0, (p - 0.5) / 0.5));
          const eased = reveal * reveal * (3 - 2 * reveal);
          enter.style.opacity = String(eased);
          const film = enter as HTMLVideoElement;
          if (eased > 0.04 && film.paused) film.play().catch(() => undefined);
          if (eased === 0 && !film.paused) film.pause();
        }
      }
      const reelTrack = reelTrackRef.current;
      const reel = reelRef.current;
      const narrow = window.matchMedia("(max-width: 860px)").matches;
      if (reelTrack && reel) {
        const rect = reelTrack.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!reduce && !narrow) {
          const rp = trackProgress(reelTrack);
          reel.style.transform = `translate3d(${-rp * 3 * 100}vw, 0, 0)`;
          const idx = Math.min(3, Math.round(rp * 3));
          if (indexRef.current) indexRef.current.textContent = `0${idx + 1}  /  04`;
        }
        const videos = reel.querySelectorAll("video");
        videos.forEach((video, i) => {
          let near = false;
          if (!narrow && !reduce) {
            const rp = trackProgress(reelTrack);
            near = inView && Math.abs(rp * 3 - i) < 0.85;
          } else {
            const box = video.getBoundingClientRect();
            near = box.top < window.innerHeight * 0.85 && box.bottom > window.innerHeight * 0.15;
          }
          const allow = near && overlayRef.current === null;
          if (allow && video.paused) video.play().catch(() => undefined);
          if (!allow && !video.paused) video.pause();
        });
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function go(id: string) {
    setOverlay(null);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function holdSeat() {
    if (!seat) return;
    setHeld(true);
  }

  return (
    <main>
      <div className="progress" ref={barRef} />

      <section className="hero-track" id="top" ref={heroRef}>
        <div className="hero-sticky">
          <div className="imax-bar top" />
          <div className="imax-bar bottom" />
          <video
            className="enter-film"
            data-hero="enter"
            src="/media/eye.mp4"
            poster="/media/eye.jpg"
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="poster-scale" ref={posterRef}>
            <header className="nav" data-hero="nav">
              <button className="brand" onClick={() => go("top")}>
                <span className="brand-mark" aria-hidden="true" />
                Atlas Reel
              </button>
              <nav className="nav-links" aria-label="Film">
                <button className="nav-link" onClick={() => go("cast")}>
                  Cast
                </button>
                <button className="nav-link" onClick={() => go("reel")}>
                  Production
                </button>
                <button className="nav-link" onClick={() => go("release")}>
                  Release
                </button>
                <button
                  className={imax ? "nav-link on" : "nav-link"}
                  onClick={() => setImax((value) => !value)}
                  aria-pressed={imax}
                >
                  Imax
                </button>
              </nav>
              <div className="nav-tools">
                <button className="nav-link" onClick={() => setOverlay("ticket")}>
                  Seat
                </button>
                <button className="icon-btn" aria-label="Index" onClick={() => setOverlay("search")}>
                  <Search size={18} />
                </button>
                <button className="menu-btn" aria-label="Open index" onClick={() => setOverlay("search")}>
                  <Menu size={18} />
                </button>
              </div>
            </header>

            <p className="chapter-mark" data-hero="mark">
              IV
            </p>
            <ul className="names" data-hero="names">
              <li>Amara Quill</li>
              <li>Idris Okonkwo</li>
              <li aria-hidden="true"> </li>
              <li>Mira Chen</li>
              <li>Calder Rhys</li>
            </ul>

            <div className="lockup">
              <div className="eclipse" data-hero="eclipse" aria-hidden="true" />
              <h1 className="wordmark">
                <span className="wing" data-hero="left" aria-hidden="true">
                  <i>H</i>
                  <i>A</i>
                  <i>L</i>
                  <i>C</i>
                </span>
                <span className="notch" aria-hidden="true" />
                <span className="wing" data-hero="right" aria-hidden="true">
                  <i>Y</i>
                  <i>O</i>
                  <i>N</i>
                  <i>E</i>
                </span>
                <span className="sr">Halcyone</span>
              </h1>
              <img
                className="figure"
                data-hero="figure"
                src="/media/hero.png"
                alt="Halcyone Voss, arms crossed in copper light"
              />
              <p className="year-tag" data-hero="year">
                2026
              </p>
            </div>

            <div className="sprocket" data-hero="sprocket" aria-hidden="true" />
            <div className="marquee" aria-hidden="true">
              <div className="marquee-track" ref={marqueeRef}>
                <span>She maps the city that only exists between midnight and dawn — Northglass Pictures — </span>
                <span>She maps the city that only exists between midnight and dawn — Northglass Pictures — </span>
                <span>She maps the city that only exists between midnight and dawn — Northglass Pictures — </span>
              </div>
            </div>
            <div className="meta" data-hero="meta">
              <div className="studio">
                <small>Production</small>
                <strong>Northglass</strong>
              </div>
              <div className="meta-pills">
                <button className="play-pill" onClick={() => setOverlay("trailer")}>
                  <Play size={14} aria-hidden="true" />
                  Teaser 0:06
                </button>
                <span className="pill">IV</span>
                <span className="pill">16+</span>
              </div>
              <button className="btn" onClick={() => setOverlay("ticket")}>
                Book a seat
              </button>
            </div>
          </div>
          <button className="scroll-hint" ref={hintRef} onClick={() => go("reel")}>
            Scroll
            <i />
          </button>
        </div>
      </section>

      <section className="reel-track" id="reel" ref={reelTrackRef}>
        <div className="reel-sticky">
          <div className="reel" ref={reelRef}>
            {CHAPTERS.map((chapter) => (
              <article className="panel" key={chapter.n}>
                <video
                  src={chapter.src}
                  poster={chapter.poster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="panel-scrim" />
                <div className="panel-copy">
                  <p className="kicker">{chapter.n}</p>
                  <h2>{chapter.title}</h2>
                  <p className="line">{chapter.line}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="reel-index" ref={indexRef}>
            01 / 04
          </p>
        </div>
      </section>

      <section className="story" id="story">
        <figure className="story-media reveal">
          <video
            src="/media/portrait.mp4"
            poster="/media/hero.jpg"
            muted
            loop
            playsInline
            autoPlay
          />
          <figcaption>Halcyone Voss — living portrait</figcaption>
        </figure>
        <div>
          <p className="kicker reveal">The story</p>
          <h2 className="reveal">She maps cities that forget themselves.</h2>
          <p className="lede reveal">
            Halcyone Voss drafts maps for places that slip out of time. Meridian Below appears when the clocks
            refuse the next minute. She is paid in hours, not money. One of them was hers.
          </p>
          <p className="reveal">
            On the night the canals rose, the instrument turned its rings toward her name. The city had started
            keeping a copy of the cartographer. Northglass Pictures follows her from the first blink to the bridge
            where dawn is locked.
          </p>
          <blockquote className="pull reveal">Between midnight and dawn, the map maps her back.</blockquote>
        </div>
      </section>

      <section className="cast" id="cast">
        <div className="cast-head">
          <div>
            <p className="kicker">Cast</p>
            <h2>Four names. One hour.</h2>
          </div>
          <button className="btn" onClick={() => setOverlay("trailer")}>
            Play teaser
          </button>
        </div>
        <ul className="cast-grid">
          {CAST.map((person) => (
            <li className="cast-card reveal" key={person.name}>
              <div className="frame">
                <img src={person.src} alt="" />
              </div>
              <h3>{person.name}</h3>
              <p>{person.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="release" id="release">
        <div>
          <p className="kicker">Opening night</p>
          <h2>May 14</h2>
          <p>Atlas Reel holds seats for the first three evenings. A preview hold — nothing is charged.</p>
          <button className="btn solid" onClick={() => setOverlay("ticket")}>
            Book a seat
          </button>
        </div>
        <div className="release-aside">
          <span>Northglass Pictures</span>
          <span>Chapter IV</span>
          <span>Meridian Cycle</span>
        </div>
      </section>

      <footer className="site-footer">
        <span>Atlas Reel</span>
        <span>Halcyone · 2026</span>
        <span>An original film</span>
        <p className="made-by">Made by Gawaform Studio</p>
      </footer>

      {overlay === "search" ? (
        <div className="overlay" onClick={() => setOverlay(null)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="index-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-head">
              <h2 id="index-title">Index</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setOverlay(null)}>
                <X size={18} />
              </button>
            </div>
            <ul className="index-list">
              {INDEX.map((item) => (
                <li key={item.id}>
                  <button onClick={() => go(item.id)}>{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {overlay === "ticket" ? (
        <div className="overlay" onClick={() => setOverlay(null)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-head">
              <h2 id="ticket-title">Seat</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setOverlay(null)}>
                <X size={18} />
              </button>
            </div>
            <p>Opening week at Atlas Reel. Pick a night, then a chair.</p>
            <div className="choices" role="group" aria-label="Date">
              {DATES.map((item) => (
                <button
                  key={item}
                  className={item === date ? "choice on" : "choice"}
                  onClick={() => {
                    setDate(item);
                    setHeld(false);
                  }}
                  aria-pressed={item === date}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="choices" role="group" aria-label="Time">
              {TIMES.map((item) => (
                <button
                  key={item}
                  className={item === time ? "choice on" : "choice"}
                  onClick={() => {
                    setTime(item);
                    setHeld(false);
                  }}
                  aria-pressed={item === time}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="seat-grid" role="group" aria-label="Seats">
              {ROWS.flatMap((row) =>
                [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                  const id = `${row}${n}`;
                  const taken = TAKEN.has(id);
                  return (
                    <button
                      key={id}
                      className={seat === id ? "seat on" : "seat"}
                      disabled={taken}
                      aria-label={taken ? `${id} taken` : `Seat ${id}`}
                      aria-pressed={seat === id}
                      onClick={() => {
                        setSeat(id);
                        setHeld(false);
                      }}
                    >
                      {id}
                    </button>
                  );
                }),
              )}
            </div>
            <button className="btn solid" disabled={!seat} onClick={holdSeat}>
              {seat ? `Hold ${seat}` : "Choose a seat"}
            </button>
            {held && seat ? (
              <div className="held">
                <strong>Held</strong>
                <p>
                  {seat} · {date} · {time}. A preview hold for Halcyone. Nothing is charged.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {overlay === "trailer" ? (
        <div className="overlay center" onClick={() => setOverlay(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trailer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2 id="trailer-title">Teaser</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setOverlay(null)}>
                <X size={18} />
              </button>
            </div>
            <video ref={trailerRef} src="/media/trailer.mp4" controls playsInline poster="/media/city.jpg" />
          </div>
        </div>
      ) : null}
    </main>
  );
}
