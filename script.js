/* WIL 5.0 — native scrolling and accessible, dependency-free interactions. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const behavior = () => motion.matches ? "auto" : "smooth";
  const pad = number => String(number).padStart(2, "0");
  const photoPath = number => `assets/images/photo-${pad(number)}.jpg`;
  const posterPath = number => `assets/images/video-poster-${pad(number)}.jpg`;
  const videoPath = number => `assets/videos/video-${pad(number)}.mp4`;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function image(src, alt) {
    const img = make("img");
    Object.assign(img, { src, alt, loading: "lazy", decoding: "async" });
    return img;
  }

  // Existing media names are retained. Edition selections follow the draft;
  // replace these lists with confirmed mappings when the archive is curated.
  const archiveEditions = [
    { name: "WIL 4.0", id: "wil-4-archive", photos: [7, 8, 9, 10, 11, 12] },
    { name: "WIL 3.0", id: "wil30", photos: [13, 14, 15, 16, 17, 18] },
    { name: "WIL 2.0", id: "wil-2-archive", photos: [19, 20, 21] },
    { name: "WIL 1.0", id: "wil-1-archive", photos: [22, 23] }
  ];
  const photoCollections = [
    { name: "Conference moments", start: 1, end: 6 },
    { name: "Conversations and connections", start: 7, end: 12 },
    { name: "From across the WIL journey", start: 13, end: 18 },
    { name: "More from the archive", start: 19, end: 23 }
  ];
  function photoButton(number) {
    const button = make("button", "wil-photo-item");
    button.type = "button";
    button.dataset.full = photoPath(number);
    button.setAttribute("aria-label", `Enlarge WIL archive photograph ${number}`);
    button.append(image(photoPath(number), `WIL archive photograph ${number}`));
    return button;
  }
  function buildArchives() {
    const gallery = $("#wilPhotoGallery");
    if (gallery) photoCollections.forEach((collection, i) => {
      const section = make("section", "wil-photo-edition");
      const title = make("h3", "", collection.name);
      title.id = `photo-collection-${i + 1}`;
      section.setAttribute("aria-labelledby", title.id);
      section.dataset.photoGroup = collection.name;
      const rule = make("span");
      rule.setAttribute("aria-hidden", "true");
      title.append(rule);
      const grid = make("div", "wil-photo-grid");
      for (let n = collection.start; n <= collection.end; n++) grid.append(photoButton(n));
      section.append(title, grid);
      gallery.append(section);
    });
    const archive = $("#speakerEditionsGrid");
    if (!archive) return;
    archiveEditions.forEach(edition => {
      const card = make("article", "speaker-edition-card");
      card.id = edition.id;
      card.dataset.photoGroup = edition.name;
      const heading = make("div", "speaker-edition-heading");
      const title = make("h3", "", edition.name);
      const line = make("span", "edition-heading-rule");
      line.setAttribute("aria-hidden", "true");
      heading.append(title, line);
      const mosaic = make("div", "speaker-edition-mosaic");
      edition.photos.forEach(n => mosaic.append(photoButton(n)));
      // Maintain a 3 × 2 composition without repeating or inventing images.
      for (let n = edition.photos.length; n < 6; n++) {
        const empty = make("div", "archive-photo-pending");
        empty.append(make("span", "", "WIL ARCHIVE"), make("span", "", "Photograph to follow"));
        mosaic.append(empty);
      }
      card.append(heading, mosaic);
      archive.append(card);
    });
  }

  function buildVideos() {
    const groups = [
      { id: "wil4Track", start: 1, end: 3 },
      { id: "wil3Track", start: 4, end: 13 }
    ];
    groups.forEach(group => {
      const track = document.getElementById(group.id);
      if (!track) return;
      for (let n = group.start; n <= group.end; n++) {
        const slide = make("article", "wil-testimonial-slide");
        const card = make("div", "wil-testimonial-card");
        const button = make("button", "wil-video-thumb");
        button.type = "button";
        button.dataset.video = videoPath(n);
        button.dataset.poster = posterPath(n);
        button.dataset.title = `WIL conference story ${pad(n)}`;
        button.setAttribute("aria-label", `Play WIL conference story ${n}`);
        const play = make("span", "wil-video-play", "▶");
        play.setAttribute("aria-hidden", "true");
        button.append(image(posterPath(n), `Conference story ${n} preview`), play,
          make("span", "wil-video-caption", "Watch testimonial"));
        card.append(make("span", "wil-slide-count", `${pad(n - group.start + 1)} / ${pad(group.end - group.start + 1)}`),
          make("h3", "", `Conference Story ${pad(n)}`),
          make("p", "", "A voice, an experience and a perspective from the leadership community."), button);
        slide.append(card);
        track.append(slide);
      }
    });
  }

  // Native <dialog> handles focus trapping, Escape and inert background content.
  function setupDialog(dialog, onClose = () => {}) {
    let opener;
    const close = () => dialog.close();
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      onClose();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
    return {
      close,
      open(trigger) {
        opener = trigger;
        dialog.showModal();
        document.body.classList.add("modal-open");
      }
    };
  }

  function initialiseVideos() {
    const dialog = make("dialog", "wil-video-modal");
    dialog.setAttribute("aria-labelledby", "wilVideoModalTitle");
    const inner = make("div", "wil-video-modal-dialog");
    const close = make("button", "wil-video-modal-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close video");
    const host = make("div", "wil-video-modal-player");
    const title = make("p", "wil-video-modal-title");
    title.id = "wilVideoModalTitle";
    inner.append(close, host, title);
    dialog.append(inner);
    document.body.append(dialog);
    const control = setupDialog(dialog, () => {
      const player = $("video", host);
      player?.pause();
      player?.removeAttribute("src");
      player?.load();
      host.replaceChildren();
    });
    close.addEventListener("click", control.close);
    document.addEventListener("click", event => {
      const trigger = event.target.closest("[data-video]");
      if (!trigger) return;
      const video = make("video");
      Object.assign(video, { controls: true, playsInline: true, preload: "metadata" });
      video.src = trigger.dataset.video;
      video.poster = trigger.dataset.poster || "";
      video.setAttribute("aria-label", trigger.dataset.title || "Conference video");
      title.textContent = trigger.dataset.title || "Conference video";
      host.replaceChildren(video);
      video.addEventListener("error", () => {
        const error = make("p", "wil-video-error", "This video is currently unavailable. Please try again later.");
        error.setAttribute("role", "status");
        host.append(error);
      }, { once: true });
      control.open(trigger);
      video.play().catch(() => { /* Playback controls remain available. */ });
    });
    const teaser = $(".video-card .play");
    if (teaser) {
      teaser.dataset.video = videoPath(1);
      teaser.dataset.poster = photoPath(3);
      teaser.dataset.title = "Women in Leadership — conference film";
    }
  }

  function initialisePhotos() {
    const dialog = $("#wilPhotoModal");
    if (!dialog) return;
    const img = $("#wilExpandedPhoto", dialog);
    const caption = $("#wilPhotoCaption", dialog);
    let index = 0, group = [], groupName = "WIL archive";
    const control = setupDialog(dialog, () => img.removeAttribute("src"));
    const render = next => {
      if (!group.length) return;
      index = (next + group.length) % group.length;
      const thumb = $("img", group[index]);
      img.alt = thumb.alt;
      img.src = group[index].dataset.full;
      caption.textContent = `${groupName} · Photograph ${index + 1} of ${group.length}`;
    };
    $$(".wil-photo-item").forEach(button => button.addEventListener("click", () => {
      const collection = button.closest("[data-photo-group]");
      group = $$(".wil-photo-item", collection || document);
      groupName = collection?.dataset.photoGroup || "WIL archive";
      render(group.indexOf(button));
      control.open(button);
    }));
    $(".wil-photo-modal-close", dialog).addEventListener("click", control.close);
    $(".wil-photo-modal-prev", dialog).addEventListener("click", () => render(index - 1));
    $(".wil-photo-modal-next", dialog).addEventListener("click", () => render(index + 1));
    dialog.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); render(index - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); render(index + 1); }
    });
    img.addEventListener("error", () => { caption.textContent = "This photograph is currently unavailable."; });
  }

  const railRefreshers = [];
  function initialiseRail(root, config) {
    const viewport = $(config.viewport, root);
    const track = $(config.track, root);
    const previous = $(config.previous, root);
    const next = $(config.next, root);
    const dotsHost = config.dots ? $(config.dots, root) : null;
    if (!viewport || !track || !previous || !next) return;
    viewport.tabIndex = 0;
    viewport.setAttribute("role", "region");
    if (!viewport.hasAttribute("aria-label")) viewport.setAttribute("aria-label", "Video testimonials. Use left and right arrows to browse.");
    let positions = [0], dots = [];
    const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const update = () => {
      const max = maxScroll();
      previous.disabled = viewport.scrollLeft <= 2;
      next.disabled = max <= 2 || viewport.scrollLeft >= max - 2;
      let active = 0;
      positions.forEach((pos, i) => {
        if (Math.abs(pos - viewport.scrollLeft) < Math.abs(positions[active] - viewport.scrollLeft)) active = i;
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === active);
        if (i === active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    };
    const move = direction => {
      const card = track.firstElementChild;
      if (!card) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const stride = card.getBoundingClientRect().width + gap;
      const count = Math.max(1, Math.floor(viewport.clientWidth / stride));
      viewport.scrollBy({ left: stride * count * direction, behavior: behavior() });
    };
    const refresh = () => {
      // Hidden tab panels have zero width; recalculate when they are revealed.
      if (!viewport.clientWidth) return;
      const max = maxScroll();
      const rect = viewport.getBoundingClientRect();
      const offsets = [...track.children].map(card => Math.min(max,
        Math.max(0, card.getBoundingClientRect().left - rect.left + viewport.scrollLeft)));
      positions = [...new Set([0, ...offsets.map(Math.round), Math.round(max)])];
      if (dotsHost) {
        // Reuse buttons when only dimensions change, preserving keyboard focus.
        if (dots.length !== positions.length) {
          dots = positions.map((_, i) => {
            const dot = make("button", "wil-carousel-dot");
            dot.type = "button";
            dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
            dot.addEventListener("click", () => viewport.scrollTo({ left: positions[i], behavior: behavior() }));
            return dot;
          });
          dotsHost.replaceChildren(...dots);
        }
      }
      update();
    };
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    viewport.addEventListener("scroll", update, { passive: true });
    viewport.addEventListener("keydown", event => {
      if (event.target !== viewport) return;
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Home") viewport.scrollTo({ left: 0, behavior: behavior() });
      if (event.key === "End") viewport.scrollTo({ left: maxScroll(), behavior: behavior() });
    });
    if ("ResizeObserver" in window) new ResizeObserver(refresh).observe(viewport);
    else window.addEventListener("resize", refresh);
    railRefreshers.push(refresh);
    refresh();
  }

  const tabs = $$(".wil-media-tab");
  function activateTab(id, focus = false) {
    tabs.forEach(tab => {
      const active = tab.id === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle("is-active", active);
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !active;
      if (active && focus) tab.focus();
    });
    requestAnimationFrame(() => railRefreshers.forEach(refresh => refresh()));
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(tab.id));
    tab.addEventListener("keydown", event => {
      let target;
      if (event.key === "ArrowLeft") target = (i + tabs.length - 1) % tabs.length;
      if (event.key === "ArrowRight") target = (i + 1) % tabs.length;
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); activateTab(tabs[target].id, true); }
    });
  });
  const keywordPause = $(".community-pause");
  keywordPause?.addEventListener("click", () => {
    const paused = keywordPause.getAttribute("aria-pressed") !== "true";
    keywordPause.setAttribute("aria-pressed", String(paused));
    keywordPause.textContent = paused ? "Resume moving keywords" : "Pause moving keywords";
    $(".community-marquee").classList.toggle("is-paused", paused);
  });

  const workshopTabs = $$(".workshop-tabs button");
  function selectWorkshop(id, focus = false) {
    workshopTabs.forEach(tab => {
      const active = tab.getAttribute("aria-controls") === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      panel.hidden = !active;
      panel.setAttribute("role", "tabpanel");
      if (active && focus) tab.focus();
    });
  }
  workshopTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectWorkshop(tab.getAttribute("aria-controls")));
    tab.addEventListener("keydown", event => {
      const keys = { ArrowRight: (index + 1) % workshopTabs.length,
        ArrowLeft: (index + workshopTabs.length - 1) % workshopTabs.length,
        Home: 0, End: workshopTabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      selectWorkshop(workshopTabs[keys[event.key]].getAttribute("aria-controls"), true);
    });
  });
  if (workshopTabs.length) {
    $(".workshop-tabs").hidden = false;
    selectWorkshop(workshopTabs[0].getAttribute("aria-controls"));
  }

  function revealPanel(target) {
    const panel = target.closest('[role="tabpanel"]');
    if (panel?.classList.contains("workshop-card")) selectWorkshop(panel.id);
    else if (panel) activateTab(panel.getAttribute("aria-labelledby"));
    const session = target.closest(".schedule-item");
    if (session?.hidden) setScheduleFilter("all");
    const details = target.closest("details");
    if (details) details.open = true;
  }
  function scrollToTarget(target, focus = false) {
    revealPanel(target);
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: behavior(), block: "start" });
      if (focus) {
        const hadTabindex = target.hasAttribute("tabindex");
        if (!hadTabindex) target.tabIndex = -1;
        target.focus({ preventScroll: true });
        if (!hadTabindex) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
    });
  }
  function hashTarget(hash) {
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  }

  const menuToggle = $("#wilMenuToggle"), menu = $("#wilQuickMenu");
  const searchToggle = $("#wilSearchToggle"), search = $("#wilHeroSearch"), input = $("#wilSearchInput");
  function closePopover(toggle, panel, restore = false) {
    if (!toggle || !panel) return;
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restore) toggle.focus();
  }
  function closePopovers() {
    closePopover(menuToggle, menu);
    closePopover(searchToggle, search);
  }
  [[menuToggle, menu], [searchToggle, search]].forEach(([toggle, panel]) => {
    toggle?.addEventListener("click", () => {
      const open = panel.hidden;
      closePopovers();
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) $("input, a", panel)?.focus();
    });
    panel?.addEventListener("focusout", () => {
      queueMicrotask(() => {
        if (!panel.contains(document.activeElement) && document.activeElement !== toggle) closePopover(toggle, panel);
      });
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (menu && !menu.hidden) closePopover(menuToggle, menu, true);
    if (search && !search.hidden) closePopover(searchToggle, search, true);
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".wil-hero-top")) closePopovers();
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = hashTarget(link.hash);
    if (!target) return;
    // Keep native anchors working even if a later enhancement fails.
    revealPanel(target);
    closePopovers();
    scrollToTarget(target, true);
  });
  input?.addEventListener("input", () => input.setCustomValidity(""));
  search?.addEventListener("submit", event => {
    event.preventDefault();
    const query = input.value.trim().toLocaleLowerCase();
    if (!query) return;
    // Search both media panels, revealing the matching tab before scrolling.
    const match = $$("main h2, main h3, main h4, main p, main li, main .pills span")
      .find(node => node.textContent.toLocaleLowerCase().includes(query));
    if (!match) {
      input.setCustomValidity("No matching content was found. Try another search.");
      input.reportValidity();
      return;
    }
    input.setCustomValidity("");
    closePopovers();
    scrollToTarget(match, true);
  });
  const navLinks = $$(".wil-section-nav a");
  function updateNavigation() {
    const mastheadHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height")) || 56;
    let active = navLinks[0];
    const threshold = mastheadHeight + (document.querySelector('#wilSectionNav')?.offsetHeight || 56) + 24;
    const positions = navLinks.map(link => ({link, target: hashTarget(link.hash)})).filter(item => item.target);
    positions.sort((a,b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
    for (const item of positions) if (item.target.getBoundingClientRect().top <= threshold) active = item.link;
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) active = navLinks.at(-1);
    navLinks.forEach(link => {
      const selected = link === active;
      link.classList.toggle("active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const backtop = $("#backtop");
    if (backtop) backtop.hidden = window.scrollY < 500;
  }
  let scrollFrame;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { updateNavigation(); scrollFrame = null; });
  }, { passive: true });
  window.addEventListener("resize", updateNavigation);
  window.addEventListener("pageshow", updateNavigation);
  function followHash() {
    const target = hashTarget(location.hash);
    if (target) scrollToTarget(target);
  }
  window.addEventListener("hashchange", followHash);
  $("#backtop")?.addEventListener("click", () => scrollToTarget($("#top"), true));

  // Missing media is announced without exposing paths or replacing real assets.
  function markImageUnavailable(img) {
    if (!(img instanceof HTMLImageElement) || img.id === "wilExpandedPhoto") return;
    img.classList.add("image-missing");
    const container = img.closest(".wil-photo-item, .wil-video-thumb, .video-card");
    container?.classList.add("media-unavailable");
  }
  document.addEventListener("error", event => markImageUnavailable(event.target), true);
  $$("img[src]").forEach(img => {
    if (img.complete && !img.naturalWidth) markImageUnavailable(img);
  });

  function setScheduleFilter(filter) {
    const sessions = $$(".schedule-item");
    let visible = 0;
    sessions.forEach(session => {
      session.hidden = filter !== "all" && session.dataset.sessionPhase !== filter;
      if (!session.hidden) visible++;
    });
    $$("[data-schedule-filter]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.scheduleFilter === filter));
    });
    const status = $("#scheduleStatus");
    if (status) status.textContent = `${visible} sessions · ${filter === "all" ? "All times IST" : `${filter === "morning" ? "Morning" : "Afternoon"} · IST`}`;
  }
  function initialiseSchedule() {
    const filters = $(".schedule-filters");
    if (filters) filters.hidden = false;
    $$("[data-schedule-filter]").forEach(button => button.addEventListener("click", () => {
      setScheduleFilter(button.dataset.scheduleFilter);
    }));
  }


  updateNavigation();
  buildArchives();
  buildVideos();
  $$(".wil-testimonial-carousel").forEach(carousel => initialiseRail(carousel, {
    viewport: ".wil-carousel-viewport", track: ".wil-carousel-track", previous: ".wil-carousel-prev",
    next: ".wil-carousel-next", dots: ".wil-carousel-dots"
  }));
  initialiseSchedule();
  initialiseVideos();
  initialisePhotos();
  updateNavigation();
  if (location.hash) followHash();
  const highlightBox = $("#peopleHighlight");
  if (highlightBox) {
    const slides = [...highlightBox.children];
    const region = highlightBox.closest(".people-highlights");
    const pause = $("#highlightPause");
    let current = 0, paused = motion.matches;
    const show = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.hidden = i !== current);
    };
    const updatePause = () => { pause.textContent = paused ? "Resume rotation" : "Pause rotation"; };
    $("#highlightPrev").addEventListener("click", () => show(current - 1));
    $("#highlightNext").addEventListener("click", () => show(current + 1));
    pause.addEventListener("click", () => { paused = !paused; updatePause(); });
    updatePause();
    window.setInterval(() => {
      if (!paused && !document.hidden && !region.matches(":hover") && !region.contains(document.activeElement)) {
        highlightBox.setAttribute("aria-live", "off");
        show(current + 1);
      }
    }, 8000);
    region.addEventListener("focusin", () => highlightBox.setAttribute("aria-live", "polite"));
  }
})();
