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
  const progress = story.querySelector("[data-story-progress]");
  const current = story.querySelector("[data-story-current]");

  if (!steps.length || !visuals.length || !("IntersectionObserver" in window)) return;

  document.documentElement.classList.add("has-scroll-story");

  const activate = index => {
    steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
    visuals.forEach((visual, visualIndex) => visual.classList.toggle("is-active", visualIndex === index));
    if (progress) progress.style.transform = `scaleX(${(index + 1) / steps.length})`;
    if (current) current.textContent = String(index + 1).padStart(2, "0");
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activate(steps.indexOf(entry.target));
    });
  }, { rootMargin: "-42% 0px -42%", threshold:0 });

  steps.forEach(step => observer.observe(step));
  activate(0);
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
    const chapter = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!(chapter instanceof HTMLDetailsElement)) return;
    event.preventDefault();
    chapter.open = true;
    history.replaceState(null, "", link.hash);
    chapter.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
});

if (window.location.hash) {
  const chapter = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (chapter instanceof HTMLDetailsElement && chapter.matches(".manual-chapter")) chapter.open = true;
}
