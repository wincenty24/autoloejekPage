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

function revealHashTarget() {
  let target;
  try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch { return; }
  if (!target) return;
  let ancestor = target;
  while (ancestor) {
    if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    ancestor = ancestor.parentElement;
  }
  target.scrollIntoView({block:'start'});
}
if (window.location.hash) revealHashTarget();
window.addEventListener('hashchange', revealHashTarget);

document.querySelectorAll('[data-visualization]').forEach(visualization => {
  const deviceFrames = new Map([...visualization.querySelectorAll('.viz-assembly-svg')].map(svg => {
    const box = svg.getAttribute('viewBox').split(' ').map(Number);
    return [svg, {left:box[0], width:box[2]}];
  }));
  const updateDevice = () => {
    const selected = visualization.querySelector('[name="installation-device"]:checked')?.value ?? 'valve';
    visualization.dataset.device = selected;
    visualization.querySelectorAll('[data-device-pump]').forEach(part => {
      part.toggleAttribute('hidden', selected !== 'pump');
    });
    deviceFrames.forEach((frame, svg) => {
      const box = svg.getAttribute('viewBox').split(' ').map(Number);
      const leftExtension = selected === 'pump' ? 360 : 0;
      const rightReduction = selected === 'pump' ? 380 : 0;
      box[0] = frame.left - leftExtension;
      box[2] = frame.width + leftExtension - rightReduction;
      svg.setAttribute('viewBox', box.join(' '));
    });
  };
  visualization.querySelectorAll('[name="installation-device"]').forEach(input => {
    input.addEventListener('change', updateDevice);
  });
  updateDevice();

  const zoomControls = visualization.querySelector('[data-viz-zoom-controls]');
  const diagram = visualization.querySelector('.viz-assembly-scroll');
  if (zoomControls && diagram) {
    const zoomOut = zoomControls.querySelector('[data-viz-zoom-out]');
    const zoomIn = zoomControls.querySelector('[data-viz-zoom-in]');
    const zoomLevel = zoomControls.querySelector('[data-viz-zoom-level]');
    const minZoom = 20;
    const maxZoom = 150;
    const zoomStep = 25;
    let zoom = 100;
    const updateZoom = nextZoom => {
      const previousZoom = zoom;
      const center = diagram.scrollLeft + diagram.clientWidth / 2;
      zoom = Math.max(minZoom, Math.min(maxZoom, nextZoom));
      diagram.style.setProperty('--viz-zoom', String(zoom / 100));
      diagram.style.setProperty('--viz-zoom-width', `${zoom}%`);
      diagram.scrollLeft = Math.max(0, center * zoom / previousZoom - diagram.clientWidth / 2);
      zoomLevel.textContent = `${zoom}%`;
      zoomOut.disabled = zoom === minZoom;
      zoomIn.disabled = zoom === maxZoom;
    };
    zoomOut.addEventListener('click', () => updateZoom(zoom - zoomStep));
    zoomIn.addEventListener('click', () => updateZoom(zoom + zoomStep));
    updateZoom(zoom);
    zoomControls.hidden = false;
    const assembly = visualization.querySelector('.viz-assembly');
    const openButton = visualization.querySelector('[data-viz-fullscreen-open]');
    const fullDialog = visualization.querySelector('[data-viz-fullscreen-dialog]');
    const stage = fullDialog.querySelector('[data-viz-fullscreen-stage]');
    const closeButton = fullDialog.querySelector('[data-viz-fullscreen-close]');
    if (typeof fullDialog.showModal === 'function') {
      let sectionMarker;
      let savedZoom = 100;
      let savedScroll = {left:0, top:0};
      let nativeFullscreen = false;
      let openingFullscreen = false;
      let overlayMarkers = [];
      const layoutFullscreen = () => {
        if (!fullDialog.open) return;
        const width = fullDialog.clientWidth;
        const height = fullDialog.clientHeight;
        const portrait = height > width;
        stage.style.width = `${portrait ? height : width}px`;
        stage.style.height = `${portrait ? width : height}px`;
        stage.style.transform = `translate(-50%, -50%) rotate(${portrait ? 90 : 0}deg)`;
      };
      openButton.hidden = false;
      openButton.addEventListener('click', async () => {
        if (fullDialog.open || openingFullscreen) return;
        openingFullscreen = true;
        // Enter native fullscreen first: opening it after the dialog places the
        // document above the dialog in the browser top layer.
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          try {
            await document.documentElement.requestFullscreen({navigationUI:'hide'});
            nativeFullscreen = true;
          } catch {
            // Mobile browsers without native fullscreen use the viewport dialog.
          }
        }
        savedZoom = zoom;
        savedScroll = {left:diagram.scrollLeft, top:diagram.scrollTop};
        sectionMarker = document.createComment('installation diagram position');
        assembly.before(sectionMarker);
        stage.append(assembly);
        overlayMarkers = [];
        [visualization.querySelector('#viz-ud-panel'), document.querySelector('.viz-part-popup')].filter(Boolean).forEach(overlay => {
          const marker = document.createComment('diagram overlay position');
          overlay.before(marker);
          overlayMarkers.push([overlay, marker]);
          overlay.hidden = true;
          fullDialog.append(overlay);
        });
        document.documentElement.classList.add('viz-fullscreen-active');
        fullDialog.showModal();
        layoutFullscreen();
        updateZoom(100);
        diagram.scrollLeft = 0;
        diagram.scrollTop = 0;
        closeButton.focus();
        openingFullscreen = false;
      });
      closeButton.addEventListener('click', () => fullDialog.close());
      fullDialog.addEventListener('cancel', event => {
        event.preventDefault();
        fullDialog.close();
      });
      fullDialog.addEventListener('close', () => {
        sectionMarker.replaceWith(assembly);
        overlayMarkers.forEach(([overlay, marker]) => { overlay.hidden = true; marker.replaceWith(overlay); });
        visualization.querySelectorAll('[data-viz-ud-trigger]').forEach(button => button.setAttribute('aria-expanded', 'false'));
        document.documentElement.classList.remove('viz-fullscreen-active');
        updateZoom(savedZoom);
        diagram.scrollLeft = savedScroll.left;
        diagram.scrollTop = savedScroll.top;
        if (nativeFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
        nativeFullscreen = false;
        openButton.focus({preventScroll:true});
      });
      document.addEventListener('fullscreenchange', () => {
        if (nativeFullscreen && !document.fullscreenElement && fullDialog.open) fullDialog.close();
        layoutFullscreen();
      });
      window.addEventListener('resize', layoutFullscreen);
      window.visualViewport?.addEventListener('resize', layoutFullscreen);
    }
  }
  const updateThread = () => {
    const selected = visualization.querySelector('[name="meter-thread"]:checked')?.value ?? 'external';
    visualization.querySelectorAll('[data-meter-variant]').forEach(variant => {
      variant.toggleAttribute('hidden', variant.dataset.meterVariant !== selected);
    });
  };
  visualization.querySelectorAll('[name="meter-thread"]').forEach(input => {
    input.addEventListener('change', updateThread);
  });
  updateThread();
  const meterTypes = ['compact', 'multi-jet', 'hall'];
  let meterTypeIndex = 0;
  const updateMeterType = () => {
    const selected = meterTypes[meterTypeIndex];
    visualization.querySelectorAll('[data-meter-type]').forEach(variant => {
      variant.toggleAttribute('hidden', variant.dataset.meterType !== selected);
    });
  };
  visualization.querySelectorAll('[data-meter-type-step]').forEach(button => {
    button.addEventListener('click', () => {
      meterTypeIndex = (meterTypeIndex + Number(button.dataset.meterTypeStep) + meterTypes.length) % meterTypes.length;
      hidePartPopup();
      updateMeterType();
    });
  });
  updateMeterType();
  const updateValveThread = () => {
    const selected = visualization.querySelector('[name="valve-thread"]:checked')?.value ?? 'external';
    visualization.querySelectorAll('[data-valve-variant]').forEach(variant => {
      variant.toggleAttribute('hidden', variant.dataset.valveVariant !== selected);
    });
  };
  visualization.querySelectorAll('[name="valve-thread"]').forEach(input => {
    input.addEventListener('change', updateValveThread);
  });
  updateValveThread();
  let checkValveEnabled = false;
  const shiftedParts = new Map([...visualization.querySelectorAll('[data-check-valve-shift]')].map(part => [part, part.getAttribute('transform') ?? '']));
  const compressionImages = new Map([...visualization.querySelectorAll('[data-check-compression-swap]')].map(image => [image, image.getAttribute('href')]));
  const clawImages = new Map([...visualization.querySelectorAll('[data-check-claw-swap]')].map(image => [image, image.getAttribute('href')]));
  const updateCheckValve = () => {
    const pump = visualization.dataset.device === 'pump';
    const internal = visualization.querySelector('[name="valve-thread"]:checked')?.value === 'internal';
    const maleOutlet = checkValveEnabled && !pump && !internal;
    const nippleLength = internal ? 112 : 80;
    const nippleSpan = nippleLength + 22;
    const endShift = maleOutlet ? 212 : internal ? 346 : 314;
    compressionImages.forEach((base, image) => image.setAttribute('href', maleOutlet ? base.replace('compression-adapter-front.png', 'compression-adapter-male-front.png') : base));
    clawImages.forEach((base, image) => image.setAttribute('href', maleOutlet ? base.replace('claw-coupling-front.png', 'claw-coupling-male-front.png') : base));
    const toggle = visualization.querySelector('[data-check-toggle]');
    toggle.setAttribute('aria-pressed', String(checkValveEnabled));
    toggle.querySelector('[data-check-add]').hidden = checkValveEnabled;
    toggle.querySelector('[data-check-remove]').hidden = !checkValveEnabled;
    updateDevice();
    if (checkValveEnabled) deviceFrames.forEach((frame, svg) => {
      const box = svg.getAttribute('viewBox').split(' ').map(Number);
      box[2] += pump ? 12 : endShift;
      svg.setAttribute('viewBox', box.join(' '));
    });
    visualization.querySelectorAll('[data-pump-outlet]').forEach(part => {
      const start = Number(part.dataset.outletBase) + (checkValveEnabled ? 234 : 222);
      part.setAttribute('transform', `translate(${start - Number(part.dataset.outletAnchor)} 0)`);
    });
    visualization.querySelectorAll('[data-pump-outlet-union]').forEach(part => part.toggleAttribute('hidden', !pump || checkValveEnabled));
    shiftedParts.forEach((base, part) => part.setAttribute('transform', base + (checkValveEnabled ? ` translate(${endShift} 0)` : '')));
    visualization.querySelectorAll('[data-check-valve]').forEach(part => {
      part.toggleAttribute('hidden', !checkValveEnabled);
      const base = Number(part.dataset.checkBase);
      const before = !pump && internal;
      const outlet = base + (pump ? 0 : internal ? 330.95 : 380.95);
      const start = outlet + 22 + (before ? nippleSpan : 0);
      part.setAttribute('transform', `translate(${start} 120.931)`);
      const nipple = part.querySelector('[data-check-nipple]');
      nipple.toggleAttribute('hidden', pump || maleOutlet);
      nipple.setAttribute('transform', `translate(${before ? -nippleSpan : 212} 0)`);
      const nippleImage = nipple.querySelector('svg');
      nippleImage.setAttribute('width', String(nippleLength));
      nippleImage.setAttribute('height', before ? '56' : '40');
      nippleImage.setAttribute('y', before ? '-28' : '-20');
    });
  };
  visualization.querySelector('[data-check-toggle]').addEventListener('click', () => {
    checkValveEnabled = !checkValveEnabled;
    hidePartPopup();
    updateCheckValve();
  });
  visualization.querySelectorAll('[name="installation-device"], [name="valve-thread"]').forEach(input => input.addEventListener('change', updateCheckValve));
  visualization.addEventListener('installation-end-change', updateCheckValve);
  updateCheckValve();
});

// Shared element-name popup for mouse, keyboard and touch.
const partPopup = document.createElement('div');
partPopup.className = 'viz-part-popup';
partPopup.setAttribute('role', 'status');
partPopup.hidden = true;
document.body.append(partPopup);
let activePart;
const hidePartPopup = () => { partPopup.hidden = true; activePart = null; };
document.querySelectorAll('.viz-interactive-part').forEach(part => {
  const show = () => {
    activePart = part;
    partPopup.textContent = part.getAttribute('aria-label');
    partPopup.hidden = false;
    const box = part.getBoundingClientRect();
    partPopup.style.left = `${Math.max(8, Math.min(box.left + box.width / 2 - partPopup.offsetWidth / 2, window.innerWidth - partPopup.offsetWidth - 8))}px`;
    partPopup.style.top = `${Math.max(8, Math.min(box.bottom + 8, window.innerHeight - partPopup.offsetHeight - 8))}px`;
  };
  part.addEventListener('mouseenter', show);
  part.addEventListener('mouseleave', hidePartPopup);
  part.addEventListener('focus', show);
  part.addEventListener('blur', hidePartPopup);
  part.addEventListener('click', event => { event.stopPropagation(); show(); });
  part.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(); } });
});
document.addEventListener('click', hidePartPopup);
document.addEventListener('keydown', event => { if (event.key === 'Escape') hidePartPopup(); });
document.addEventListener('scroll', hidePartPopup, true);
window.addEventListener('resize', hidePartPopup);

document.querySelectorAll('[data-visualization]').forEach(view => {
  const selected = {left:'compression',right:'compression'};
  const renderSide = side => {
    view.querySelectorAll(`[data-end-side="${side}"]`).forEach(part => part.toggleAttribute('hidden', part.dataset.endKind !== selected[side]));
    const label = view.querySelector(`[data-end-name="${side}"]`);
    if (label) label.textContent = view.querySelector(`[data-end-side="${side}"][data-end-kind="${selected[side]}"] > image`).getAttribute('aria-label');
  };
  const syncDeviceEnds = () => {
    const pump = view.dataset.device === 'pump';
    if (pump) selected.left = 'compression';
    renderSide('left');
    renderSide('right');
    view.querySelectorAll('[data-end-change]').forEach(button => {
      const locked = pump && button.dataset.endChange === 'left';
      button.disabled = locked;
      button.closest('foreignObject').toggleAttribute('hidden', locked);
    });
    view.dispatchEvent(new Event('installation-end-change'));
    hidePartPopup();
  };
  view.querySelectorAll('[name="installation-device"]').forEach(input => input.addEventListener('change', syncDeviceEnds));
  view.querySelectorAll('[data-end-change]').forEach(button => {
    button.addEventListener('click', () => {
      const side = button.dataset.endChange;
      if (view.dataset.device === 'pump' && side === 'left') return;
      selected[side] = selected[side] === 'compression' ? 'claw' : 'compression';
      renderSide(side);
      view.dispatchEvent(new Event('installation-end-change'));
      hidePartPopup();
    });
  });
  syncDeviceEnds();
});

document.querySelectorAll('[data-visualization]').forEach(view => {
  let selected = 'plug';
  const updateTop = () => {
    view.querySelectorAll('[data-top-fitting]').forEach(part => part.toggleAttribute('hidden', part.dataset.topFitting !== selected));
    view.querySelectorAll('.viz-assembly-svg').forEach(svg => {
      const box = svg.getAttribute('viewBox').split(' ').map(Number);
      box[1] = selected === 'vent' ? -230 : -60;
      box[3] = selected === 'vent' ? 720 : 550;
      svg.setAttribute('viewBox', box.join(' '));
    });
  };
  view.querySelectorAll('[data-top-change]').forEach(button => button.addEventListener('click', () => {
    selected = selected === 'plug' ? 'vent' : 'plug';
    updateTop();
    hidePartPopup();
  }));
  updateTop();
});

// The shared HTML note stays readable at every SVG zoom level.
const udPanel = document.getElementById('viz-ud-panel');
if (udPanel) {
  const triggers = [...document.querySelectorAll('[data-viz-ud-trigger]')];
  let active = null;
  let pinned = false;
  let closeTimer;
  const position = () => {
    if (!active || udPanel.hidden) return;
    const box = active.getBoundingClientRect();
    const width = udPanel.offsetWidth;
    const height = udPanel.offsetHeight;
    udPanel.style.left = `${Math.max(12, Math.min(innerWidth - width - 12, box.x + box.width / 2 - width / 2))}px`;
    udPanel.style.top = `${Math.max(12, Math.min(innerHeight - height - 12, box.bottom + 8))}px`;
  };
  const close = () => {
    clearTimeout(closeTimer);
    udPanel.hidden = true;
    triggers.forEach(button => button.setAttribute('aria-expanded', 'false'));
    pinned = false;
  };
  const show = button => {
    clearTimeout(closeTimer);
    triggers.forEach(trigger => trigger.classList.add('is-seen'));
    if (active !== button) pinned = false;
    active = button;
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', String(trigger === button)));
    udPanel.hidden = false;
    position();
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (!pinned && !udPanel.contains(document.activeElement) && document.activeElement !== active) close();
    }, 150);
  };
  triggers.forEach(button => {
    button.addEventListener('pointerenter', () => show(button));
    button.addEventListener('pointerleave', scheduleClose);
    button.addEventListener('focus', () => show(button));
    button.addEventListener('blur', scheduleClose);
    button.addEventListener('click', () => {
      if (active === button && pinned) close();
      else { show(button); pinned = true; }
    });
  });
  udPanel.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  udPanel.addEventListener('pointerleave', scheduleClose);
  udPanel.addEventListener('focusin', () => clearTimeout(closeTimer));
  udPanel.addEventListener('focusout', scheduleClose);
  document.addEventListener('click', event => {
    if (!udPanel.contains(event.target) && !triggers.some(button => button.contains(event.target))) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !udPanel.hidden) {
      active?.focus();
      close();
    }
  });
  window.addEventListener('resize', position);
  document.addEventListener('scroll', position, true);
  document.querySelectorAll('[name="meter-thread"]').forEach(input => input.addEventListener('change', close));
}

document.querySelectorAll('[data-viz-electrical-soon]').forEach(button => {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  const close = () => { panel.hidden = true; button.setAttribute('aria-expanded', 'false'); };
  button.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) panel.scrollIntoView({block:'nearest', behavior:'smooth'});
  });
  document.addEventListener('click', event => {
    if (!button.contains(event.target) && !panel.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { close(); button.focus(); }
  });
});
