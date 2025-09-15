import React, { useEffect, useRef, useState } from "react";

const PROJECTS = [
  {
    title: "Logistics Dashboard",
    desc: "C#/.NET MVC dashboard for shipment tracking and analytics. Includes user management and CSV export.",
    github: "https://github.com/heejunhua/logistics-dashboard",
    demo: "#",
    tags: ["C#", ".NET MVC", "SQL"],
  },
  {
    title: "Inventory API",
    desc: "RESTful .NET API for realtime inventory management with optimistic concurrency and unit tests.",
    github: "https://github.com/heejunhua/inventory-api",
    demo: "#",
    tags: [".NET", "API", "Swagger"],
  },
  {
    title: "Portfolio (This Site)",
    desc: "React + Tailwind portfolio demonstrating UI/UX, animations and smooth navigation.",
    github: "https://github.com/heejunhua/portfolio",
    demo: "https://heejunhua-portfolio.vercel.app",
    tags: ["React", "Tailwind", "UX"],
  },
];

export default function App() {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const titles = ["💻 C#/.NET Developer", "🌐 Full-Stack Developer", "🎯 UI/UX Enthusiast"];
  const [titleIndex, setTitleIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [formMessage, setFormMessage] = useState(null);
  const FORM_ENDPOINT = process.env.REACT_APP_FORM_ENDPOINT || "";

  const addSectionRef = (el) => {
    if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el);
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const scrollToIndex = (index) => {
    const sections = sectionRefs.current;
    index = clamp(index, 0, sections.length - 1);
    if (isScrolling.current || !sections[index]) return;
    isScrolling.current = true;

    sections[index].scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      isScrolling.current = false;
      setActiveIndex(index);
      try {
        const id = sections[index].id;
        if (id) history.replaceState(null, "", `#${id}`);
      } catch (e) {}
    }, 750);
  };

  const goNext = () => scrollToIndex(activeIndex + 1);
  const goPrev = () => scrollToIndex(activeIndex - 1);

  useEffect(() => {
    const t = setInterval(() => {
      setTitleIndex((p) => (p + 1) % titles.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
      if (isScrolling.current) return;
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      if (e.deltaY > 0) goNext();
      else goPrev();
    };

    const onTouchStart = (e) => {
      if (!e.touches) return;
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (isScrolling.current) return;
      const endY = (e.changedTouches && e.changedTouches[0].clientY) || 0;
      const diff = touchStartY.current - endY;
      const threshold = 50;
      if (diff > threshold) goNext();
      else if (diff < -threshold) goPrev();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeIndex]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add("section-visible");
            const idx = sectionRefs.current.indexOf(el);
            if (idx !== -1) setActiveIndex(idx);
          } else {
            el.classList.remove("section-visible");
          }
        });
      },
      { threshold: 0.55 }
    );

    sectionRefs.current.forEach((s) => s && obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);

    if (!formState.email || !formState.message) {
      setFormMessage({ type: "error", text: "Please include an email and a message." });
      return;
    }

    if (FORM_ENDPOINT) {
      try {
        const payload = new FormData();
        payload.append("name", formState.name);
        payload.append("email", formState.email);
        payload.append("message", formState.message);

        const res = await fetch(FORM_ENDPOINT, { method: "POST", body: payload });
        if (res.ok) {
          setFormMessage({ type: "success", text: "Message sent — thank you!" });
          setFormState({ name: "", email: "", message: "" });
        } else {
          const text = await res.text();
          setFormMessage({ type: "error", text: "Failed to send message. " + text });
        }
      } catch (err) {
        setFormMessage({ type: "error", text: "Failed to send message. Try mailto fallback." });
      }
    } else {
      const mailto = `mailto:heejunhua@example.com?subject=${encodeURIComponent(
        "Portfolio contact from " + (formState.name || "Visitor")
      )}&body=${encodeURIComponent(formState.message + "\n\nFrom: " + formState.email)}`;
      window.location.href = mailto;
      setFormMessage({ type: "info", text: "Opening mail client..." });
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-gray-50 text-gray-900 font-sans"
    >
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-4 bg-white/70 backdrop-blur-md shadow-md rounded-b-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold select-none">
              HJ
            </div>
            <div>
              <div className="text-sm text-gray-600 select-none">Hee Jun Hua</div>
              <div className="text-xs text-gray-500 select-none">C#/.NET • Full-Stack</div>
            </div>
          </div>

          {/* desktop links */}
          <nav className="hidden md:flex items-center gap-6">
            {["intro", "about", "education", "work", "contact", "projects"].map(
              (id, i) => (
                <button
                  key={id}
                  onClick={() => {
                    setMobileOpen(false);
                    scrollToIndex(i);
                  }}
                  className={`text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded ${
                    activeIndex === i
                      ? "text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              )
            )}
          </nav>

          {/* mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="p-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="#374151"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* mobile menu with smooth slide down */}
        <div
          className={`md:hidden bg-white/90 backdrop-blur-md shadow-lg overflow-hidden transition-max-height duration-300 ease-in-out ${
            mobileOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
            {[
              "intro",
              "about",
              "projects",
              "education",
              "work",
              "contact"
            ].map((id, i) => (
              <button
                key={id}
                onClick={() => {
                  setMobileOpen(false);
                  scrollToIndex(i);
                }}
                className="text-left w-full px-4 py-3 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* RIGHT DOT NAV */}
      <div className="hidden md:flex fixed right-6 top-1/2 transform -translate-y-1/2 flex-col gap-3 z-40">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to section ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              activeIndex === i ? "bg-indigo-600 scale-125" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* UP / DOWN controls (bottom center) */}
      <div className="hidden md:flex fixed left-1/2 transform -translate-x-1/2 bottom-6 z-40 flex gap-4">
        <button
          onClick={goPrev}
          aria-label="Previous section"
          className="w-12 h-12 rounded-xl bg-white/90 shadow grid place-items-center hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M7 15l5-5 5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={goNext}
          aria-label="Next section"
          className="w-12 h-12 rounded-xl bg-indigo-600 shadow grid place-items-center hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg
            className="w-5 h-5 text-white transform rotate-180"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M7 15l5-5 5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* MAIN SECTIONS */}
      <main className="pt-16">
        {/* Intro */}
        <section
          ref={(el) => addSectionRef(el)}
          id="intro"
          className="h-screen pt-16 flex flex-col justify-center items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-center relative px-6 overflow-hidden"
        >
          {/* decorative blobs */}
          <div className="absolute -left-8 -top-16 w-72 h-72 rounded-full bg-pink-400/30 blur-3xl animate-float1 pointer-events-none" />
          <div className="absolute -right-8 bottom-[-10%] w-80 h-80 rounded-full bg-indigo-400/30 blur-3xl animate-float2 pointer-events-none" />

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 reveal">
              Hi, I’m <span className="text-yellow-300">Hee Jun Hua</span> 👋
            </h1>

            <div className="h-10 md:h-12 overflow-hidden flex items-center justify-center mb-6">
              <span
                key={titleIndex}
                className="text-lg md:text-2xl font-medium animate-title"
              >
                {titles[titleIndex]}
              </span>
            </div>

            <p
              className="mx-auto text-light mb-4 reveal text-center"
              style={{ maxWidth: "800px", lineHeight: "1.6" }}
            >
              I’m a <strong>software developer</strong> passionate about{" "}
              <span className="text-yellow-300 font-semibold">learning</span> and{" "}
              <span className="text-yellow-300 font-semibold">growing</span> through challenges.
              <br />
              I tackle projects with a <strong>problem-solving mindset</strong> and a strong focus on{" "}
              <span className="text-yellow-300 font-semibold">adaptability</span>.
              <br />
              I love{" "}
              <span className="text-yellow-300 font-semibold">exploring new technologies</span> and building{" "}
              <strong>practical solutions</strong> that make an impact.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button
                onClick={() => scrollToIndex(2)}
                className="px-6 py-3 bg-yellow-300 text-indigo-900 font-semibold rounded-full shadow hover:scale-105 transition reveal w-full sm:w-auto"
              >
                View Projects
              </button>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToIndex(4);
                }}
                className="text-sm underline text-white/90 hover:text-white"
              >
                Contact me
              </a>
            </div>
          </div>
        </section>

        {/* About */}
        <section
          ref={(el) => addSectionRef(el)}
          id="about"
          className="h-screen pt-16 flex items-center justify-center bg-white text-gray-900 px-6"
        >
          <div className="max-w-5xl grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-2xl shadow-lg reveal">
              <h2 className="text-3xl font-bold text-indigo-600 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed">
                I’m a practical software developer with a degree in Software
                Systems Development. My work centers on enterprise & logistics
                systems, building reliable APIs, and crafting interfaces that
                make complex workflows simple.
              </p>

              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                <li>• C# / .NET</li>
                <li>• React / Tailwind</li>
                <li>• REST APIs</li>
                <li>• SQL / EF Core</li>
                <li>• Azure DevOps</li>
                <li>• Unit & Integration Tests</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl shadow-lg bg-white reveal">
              <h3 className="mb-3 font-semibold text-lg">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-indigo-50">
                  <div className="text-2xl font-bold text-indigo-600">2+</div>
                  <div className="text-xs text-gray-600 mt-1">Years experience</div>
                </div>
                <div className="p-4 rounded-lg bg-indigo-50">
                  <div className="text-2xl font-bold text-indigo-600">5+</div>
                  <div className="text-xs text-gray-600 mt-1">Projects</div>
                </div>
                <div className="p-4 rounded-lg bg-indigo-50">
                  <div className="text-2xl font-bold text-indigo-600">100%</div>
                  <div className="text-xs text-gray-600 mt-1">Team player</div>
                  </div>
                <div className="p-4 rounded-lg bg-indigo-50">
                  <div className="text-2xl font-bold text-indigo-600">
                    TARUMT
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Alma mater</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section
          ref={(el) => (sectionRefs.current[2] = el)}
          id="education"
          className="h-screen pt-16 flex flex-col justify-center items-center bg-gray-100 text-center px-6"
        >
          <h3 className="text-5xl font-bold text-indigo-600 mb-12 animate-fadeIn">
            Education
          </h3>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:scale-105 transition transform duration-500 animate-slideUp">
              <h4 className="text-xl md:text-2xl font-semibold text-indigo-600">
                Bachelor of IT (Software Systems Development)
              </h4>
              <p className="text-gray-600 mt-3 text-lg">
                Tunku Abdul Rahman University (TARUMT)
              </p>
              <p className="text-gray-500 mt-2 italic">Graduated 2024</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:scale-105 transition transform duration-500 animate-slideUp delay-200">
              <h4 className="text-xl md:text-2xl font-semibold text-indigo-600">
                Diploma in Information Technology
              </h4>
              <p className="text-gray-600 mt-3 text-lg">
                Tunku Abdul Rahman University (TARUMT)
              </p>
              <p className="text-gray-500 mt-2 italic">Graduated 2022</p>
            </div>
          </div>
        </section>

        {/* Work */}
        <section
          ref={(el) => addSectionRef(el)}
          id="work"
          className="h-screen pt-16 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6"
        >
          <div className="max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6 reveal">Experience</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-2xl p-6 reveal">
                <h4 className="font-semibold text-lg">
                  IT Programmer — Cheng Hua (Full-time)
                </h4>
                <p className="text-sm mt-2 text-white/90">
                  Working on automation, backend APIs and internal tools for
                  logistics and manufacturing systems. Focus on stability,
                  monitoring and iterative improvements.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 reveal">
                <h4 className="font-semibold text-lg">Previous Internships</h4>
                <p className="text-sm mt-2 text-white/90">
                  Frontend & backend roles across small teams — gained practical
                  experience with version control, CI/CD, and delivering
                  features quickly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          ref={(el) => addSectionRef(el)}
          id="contact"
          className="h-screen pt-16 flex items-center justify-center bg-gray-900 text-white px-6"
        >
          <div className="max-w-3xl w-full">
            <h2 className="text-3xl font-bold mb-4 reveal">Get in touch</h2>
            <p className="text-gray-300 mb-6 reveal">
              Interested in collaborating or want to chat about a role? Fill the
              form or use the email link.
            </p>

            <form onSubmit={handleFormSubmit} className="grid gap-4">
              <input
                className="p-3 rounded-lg bg-white/5 border border-white/10 placeholder:text-white/60 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Your name"
                value={formState.name}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, name: e.target.value }))
                }
              />
              <input
                className="p-3 rounded-lg bg-white/5 border border-white/10 placeholder:text-white/60 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Email address"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, email: e.target.value }))
                }
                required
              />
              <textarea
                className="p-3 rounded-lg bg-white/5 border border-white/10 placeholder:text-white/60 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition min-h-[120px]"
                placeholder="Message"
                value={formState.message}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, message: e.target.value }))
                }
                required
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 rounded-lg shadow hover:bg-indigo-500 transition w-full sm:w-auto"
                >
                  Send
                </button>
                <a
                  href="mailto:heejunhua@example.com"
                  className="text-sm text-white/80 underline text-center sm:text-left"
                >
                  Or open mail client
                </a>
              </div>

              {formMessage && (
                <div
                  className={`text-sm mt-2 ${
                    formMessage.type === "success"
                      ? "text-green-400"
                      : formMessage.type === "error"
                      ? "text-rose-400"
                      : "text-yellow-300"
                  }`}
                >
                  {formMessage.text}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Projects */}
        <section
          ref={(el) => addSectionRef(el)}
          id="projects"
          className="h-screen pt-16 flex items-center justify-center bg-gray-50 px-6"
        >
          <div className="max-w-6xl w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold text-indigo-600 reveal">
                Projects
              </h2>
              <p className="text-sm text-gray-600 max-w-md">
                Small, focused projects showing practical problem solving.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PROJECTS.map((p) => (
                <article
                  key={p.title}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition reveal"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <div className="text-xs text-gray-500">
                      {p.tags.join(" · ")}
                    </div>
                  </div>

                  <p className="text-gray-600 mt-3">{p.desc}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-2 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                    >
                      GitHub
                    </a>
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                      Demo
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}