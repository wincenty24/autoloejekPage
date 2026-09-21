document.querySelectorAll(".site-header").forEach((header, index) => {
  const navigation = header.querySelector("nav");
  if (!navigation) return;

  const mobile = window.matchMedia("(max-width:760px)");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "navigation-toggle";
  toggle.textContent = "Menu";
  navigation.id ||= `site-navigation-${index}`;
  toggle.setAttribute("aria-controls", navigation.id);

  const setOpen = open => {
    toggle.setAttribute("aria-expanded", String(open));
    navigation.hidden = mobile.matches && !open;
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  header.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !mobile.matches || navigation.hidden) return;
    setOpen(false);
    toggle.focus();
  });
  mobile.addEventListener("change", () => {
    const focusWillHide = mobile.matches && navigation.contains(document.activeElement);
    if (!mobile.matches && document.activeElement === toggle) navigation.querySelector("a")?.focus();
    setOpen(!mobile.matches);
    if (focusWillHide) toggle.focus();
  });

  navigation.before(toggle);
  setOpen(!mobile.matches);
});

const languageSelect = document.querySelector("#language");

if (languageSelect) {
  languageSelect.addEventListener("change", event => {
    window.location.assign(event.target.value);
  });
}

document.querySelectorAll("[data-current-year]").forEach(element => {
  element.textContent = new Date().getFullYear();
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("[data-photo-gallery]").forEach(gallery => {
  const track = gallery.querySelector("[data-gallery-track]");
  const slides = [...track.children];
  const counter = gallery.querySelector("[data-gallery-counter]");
  const currentIndex = () => Math.round(track.scrollLeft / track.clientWidth);
  const move = direction => {
    const index = (currentIndex() + direction + slides.length) % slides.length;
    track.scrollTo({ left:index * track.clientWidth, behavior:prefersReducedMotion ? "instant" : "smooth" });
  };
  gallery.querySelector("[data-gallery-previous]").addEventListener("click", () => move(-1));
  gallery.querySelector("[data-gallery-next]").addEventListener("click", () => move(1));
  track.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  });
  track.addEventListener("scroll", () => {
    const label = `${currentIndex() + 1} / ${slides.length}`;
    if (counter.textContent !== label) counter.textContent = label;
  }, { passive:true });
  gallery.querySelector("[data-gallery-controls]").hidden = false;
});

const revealElements = [...document.querySelectorAll("[data-reveal]")];

if (revealElements.length && "IntersectionObserver" in window && !prefersReducedMotion) {
  document.documentElement.classList.add("has-reveal");

  revealElements.forEach(element => {
    element.style.setProperty("--reveal-delay", element.dataset.revealDelay || "0");
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin:"0px 0px -8%", threshold:.12 });

  revealElements.forEach(element => revealObserver.observe(element));
}

document.querySelectorAll("[data-pop-group]").forEach(group => {
  const sections = [...group.querySelectorAll("details")];
  sections.forEach(section => {
    section.addEventListener("toggle", () => {
      if (!section.open) return;
      sections.forEach(sibling => {
        if (sibling !== section) sibling.open = false;
      });
    });
  });
});

document.querySelectorAll("[data-scroll-story]").forEach(story => {
  const steps = [...story.querySelectorAll("[data-story-step]")];
  const visuals = [...story.querySelectorAll("[data-story-visual]")];

  if (!steps.length || !visuals.length || !("IntersectionObserver" in window)) return;

  document.documentElement.classList.add("has-scroll-story");

  const activate = index => {
    steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
    visuals.forEach((visual, visualIndex) => visual.classList.toggle("is-active", visualIndex === index));
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activate(steps.indexOf(entry.target));
    });
  }, { rootMargin: "-42% 0px -42%", threshold:0 });

  steps.forEach(step => observer.observe(step));
  activate(0);

  // Each phone chapter introduces its own image before revealing the copy.
  const mobileMotion = window.matchMedia("(max-width: 760px) and (prefers-reduced-motion: no-preference)");
  let mobileObserver;
  const setupMobileStory = () => {
    mobileObserver?.disconnect();
    story.classList.remove("has-mobile-story");
    steps.forEach(step => step.classList.remove("is-introduced"));
    if (!mobileMotion.matches) return;

    mobileObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.closest("[data-story-step]").classList.add("is-introduced");
        mobileObserver.unobserve(entry.target);
      });
    }, { rootMargin:"0px 0px -8%", threshold:.15 });

    story.classList.add("has-mobile-story");
    steps.forEach(step => mobileObserver.observe(step.querySelector(".story-mobile-media")));
  };
  mobileMotion.addEventListener("change", setupMobileStory);
  setupMobileStory();
});

document.querySelectorAll("[data-relay-toggle]").forEach(button => {
  const animation = button.closest(".relay-switch-animation");
  if (!animation) return;

  animation.classList.add("is-interactive");
  button.addEventListener("click", () => {
    const energized = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(energized));
    animation.classList.toggle("is-energized", energized);
  });
});

document.querySelectorAll("[data-manual-chapter-link]").forEach(link => {
  link.addEventListener("click", event => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    const chapter = target?.closest("details.manual-chapter");
    if (!chapter) return;
    event.preventDefault();
    chapter.open = true;
    history.replaceState(null, "", link.hash);
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
});

if (window.location.hash) {
  let target;
  try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch {}
  const chapter = target?.closest("details.manual-chapter");
  if (chapter) {
    chapter.open = true;
    target.scrollIntoView({ block:"start" });
  }
}
