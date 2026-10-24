/* =========================================================
   WIL WEBSITE — COMPLETE INTERACTIONS
   Lenis smooth scroll, reveal effects, past-speaker grids,
   interactive video cards and centred video player modal,
   image gallery, horizontal agenda timelines, search/menu.
========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const pad = (number) => String(number).padStart(2, "0");
  const photoPath = (number) => `assets/images/photo-${pad(number)}.jpg`;
  const posterPath = (number) => `assets/images/video-poster-${pad(number)}.jpg`;
  const videoPath = (number) => `assets/videos/video-${pad(number)}.mp4`;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =======================================================
     1. SMOOTH PAGE SCROLL
  ======================================================= */
  let lenis = null;
  if (window.Lenis && !reducedMotion) {
    try {
      lenis = new window.Lenis({
        autoRaf: true,
        smoothWheel: true,
        lerp: 0.075,
        wheelMultiplier: 0.9,
        anchors: false,
        allowNestedScroll: true,
        syncTouch: false
      });
    } catch (error) {
      console.warn("Lenis initialisation failed; using native smooth scrolling.", error);
    }
  }

  function smoothScrollTo(target) {
    if (lenis) {
      lenis.scrollTo(target, {
        offset: -88,
        duration: 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 4)
      });
    } else if (target instanceof Element) {
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }

  /* =======================================================
     2. SEARCH + QUICK MENU
  ======================================================= */
  const searchToggle = $("#wilSearchToggle");
  const searchForm = $("#wilHeroSearch");
  const searchInput = $("#wilSearchInput");
  const menuToggle = $("#wilMenuToggle");
  const quickMenu = $("#wilQuickMenu");

  function closeQuickMenu() {
    if (!quickMenu || !menuToggle) return;
    quickMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function closeSearch() {
    if (!searchForm || !searchToggle) return;
    searchForm.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle?.addEventListener("click", () => {
    const open = quickMenu.hidden;
    quickMenu.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    if (open) closeSearch();
  });

  quickMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeQuickMenu));
  searchToggle?.addEventListener("click", () => {
    const open = searchForm.hidden;
    searchForm.hidden = !open;
    searchToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      closeQuickMenu();
      searchInput?.focus();
    }
  });
  searchInput?.addEventListener("input", () => searchInput.setCustomValidity(""));

  /* =======================================================
     3. PHOTO GALLERY
  ======================================================= */
  const photoEditions = [
    { name: "WIL 5.0", start: 1, end: 6 },
    { name: "WIL 4.0", start: 7, end: 12 },
    { name: "WIL 3.0", start: 13, end: 18 },
    { name: "WIL 2.0", start: 19, end: 21 },
    { name: "WIL 1.0", start: 22, end: 23 }
  ];

  function buildPhotoGallery() {
    const gallery = $("#wilPhotoGallery");
    if (!gallery || gallery.dataset.generated === "true") return;
    gallery.dataset.generated = "true";

    photoEditions.forEach((edition, editionIndex) => {
      const section = document.createElement("section");
      section.className = "wil-photo-edition";
      const heading = document.createElement("h2");
      heading.append(document.createTextNode(edition.name));
      const line = document.createElement("span");
      line.setAttribute("aria-hidden", "true");
      heading.appendChild(line);

      const grid = document.createElement("div");
      grid.className = `wil-photo-grid ${editionIndex === 0 ? "wil-photo-grid-large" : "wil-photo-grid-small"}`;

      for (let number = edition.start; number <= edition.end; number++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "wil-photo-item";
        button.dataset.full = photoPath(number);
        button.setAttribute("aria-label", `View ${edition.name} photograph ${number}`);
        const image = document.createElement("img");
        image.src = photoPath(number);
        image.alt = `${edition.name} conference photograph ${number}`;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          button.classList.add("media-unavailable");
          button.title = `Unable to load ${photoPath(number)}. Check the assets folder.`;
        });
        button.appendChild(image);
        grid.appendChild(button);
      }
      section.append(heading, grid);
      gallery.appendChild(section);
    });

    const smallEditions = $$(".wil-photo-edition", gallery).slice(1);
    for (let i = 0; i < smallEditions.length; i += 2) {
      const pair = document.createElement("div");
      pair.className = "wil-photo-editions-pair";
      const first = smallEditions[i];
      const second = smallEditions[i + 1];
      first.before(pair);
      pair.appendChild(first);
      if (second) pair.appendChild(second);
    }
  }

  /* =======================================================
     4. PAST SPEAKER ARCHIVE: FOUR EDITION BLOCKS
     The WIL 4.0 and 3.0 headshots use BMU-hosted image URLs.
     Earlier-edition images use the supplied local media archive.
     Verify each historic portrait/edition before publishing.
  ======================================================= */
  const speakerEditions = [
    {
      edition: "WIL 4.0",
      theme: "COURAGE · CONVICTION · COLLABORATION",
      people: [
        { name: "Dr. Suchitra Ella", image: "https://www.bmu.edu.in/wp-content/uploads/2026/02/sucitra-1.webp" },
        { name: "Ms. Pallavi Dinodia", image: "https://www.bmu.edu.in/wp-content/uploads/2026/02/fac1.webp" },
        { name: "Ms. Anita Kapur", image: "https://www.bmu.edu.in/wp-content/uploads/2026/02/fac3.webp" },
        { name: "Prof. Saraswathy Vaidyanathan", image: "https://www.bmu.edu.in/wp-content/uploads/2026/02/fac2.webp" },
        { name: "Mr. Saurabh Uboweja", image: "https://www.bmu.edu.in/wp-content/uploads/2026/02/Saurabh-Uboweja.jpeg" },
        { name: "Sqn Ldr Dimple Rawat (Retd.)", image: "https://www.bmu.edu.in/wp-content/uploads/2026/02/Dimple-Rawat.webp" }
      ]
    },
    {
      edition: "WIL 3.0",
      theme: "POWER · PROGRESS · POSSIBILITIES",
      people: [
        { name: "Ms. Tanu Kashyap", image: "https://www.bmu.edu.in/wp-content/uploads/2025/04/MS.-TANU-KASHYAP-scaled.jpg" },
        { name: "Ms. Lakshmi Venkatesh", image: "https://www.bmu.edu.in/wp-content/uploads/2025/04/DSC09874-1.jpg" },
        { name: "Ms. Priya Kashyap", image: "https://www.bmu.edu.in/wp-content/uploads/2025/04/Priya-Kashyap.jpg" },
        { name: "Prakhar Kasar", image: "https://www.bmu.edu.in/wp-content/uploads/2025/04/1734888562802.jpg" },
        { name: "Mr. Anurag Upadhyay", image: "https://www.bmu.edu.in/wp-content/uploads/2025/04/anurag.jpg" },
        { name: "Ms. Nirupama Subramanian", image: "https://www.bmu.edu.in/wp-content/uploads/2025/04/nirupama.jpg" }
      ]
    },
    {
      edition: "WIL 2.0",
      theme: "BOLD · BRILLIANT · BEYOND",
      people: [
        { name: "WIL speaker archive image 1", image: posterPath(1) },
        { name: "WIL speaker archive image 2", image: posterPath(2) },
        { name: "WIL speaker archive image 3", image: posterPath(3) },
        { name: "WIL speaker archive image 4", image: posterPath(4) },
        { name: "WIL speaker archive image 5", image: posterPath(5) },
        { name: "WIL speaker archive image 6", image: posterPath(6) }
      ]
    },
    {
      edition: "WIL 1.0",
      theme: "THE BEGINNING OF THE WIL JOURNEY",
      people: [
        { name: "WIL event archive image 1", image: photoPath(3) },
        { name: "WIL event archive image 2", image: photoPath(4) },
        { name: "WIL event archive image 3", image: photoPath(5) },
        { name: "WIL event archive image 4", image: photoPath(8) },
        { name: "WIL event archive image 5", image: photoPath(10) },
        { name: "WIL event archive image 6", image: photoPath(13) }
      ]
    }
  ];

  function buildPastSpeakerArchive() {
    const grid = $("#speakerEditionsGrid");
    if (!grid || grid.dataset.generated === "true") return;
    grid.dataset.generated = "true";

    // The old WIL 3.0 anchor now belongs to the edition grid card.
    const oldWil30 = $("#wil30");
    if (oldWil30) oldWil30.id = "wil3VideoArchive";

    speakerEditions.forEach((edition, editionIndex) => {
      const card = document.createElement("article");
      card.className = "speaker-edition-card";
      if (editionIndex === 1) card.id = "wil30";

      const cardHeading = document.createElement("div");
      cardHeading.className = "speaker-edition-heading";

      const title = document.createElement("h4");
      title.textContent = edition.edition;

      const theme = document.createElement("span");
      theme.textContent = edition.theme;
      cardHeading.append(title, theme);

      const mosaic = document.createElement("div");
      mosaic.className = "speaker-edition-mosaic";

      edition.people.forEach((person) => {
        const item = document.createElement("div");
        item.className = "speaker-mosaic-item";

        const image = document.createElement("img");
        image.src = person.image;
        image.alt = person.name;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          item.classList.add("media-unavailable");
          item.title = `Image unavailable: ${person.name}`;
        });

        const caption = document.createElement("span");
        caption.textContent = person.name;

        item.append(image, caption);
        mosaic.appendChild(item);
      });

      card.append(cardHeading, mosaic);
      grid.appendChild(card);
    });
  }

  /* =======================================================
     5. VIDEO TESTIMONIAL CARDS
     Hover reveals the colourful backing. Click opens a modal.
  ======================================================= */
  const videoGroups = [
    { track: "#wil4Track", start: 1, end: 3, label: "WIL 4.0 — Video Testimonials" },
    { track: "#wil3Track", start: 4, end: 13, label: "Previous Editions — Video Testimonials" }
  ];

  function createVideoCard(number, index, total, label) {
    const slide = document.createElement("article");
    slide.className = "wil-testimonial-slide";
    slide.style.setProperty("--slide-bg", `url("${posterPath(number)}")`);

    const card = document.createElement("div");
    card.className = "wil-testimonial-card";

    const count = document.createElement("span");
    count.className = "wil-slide-count";
    count.textContent = `${pad(index)} / ${pad(total)}`;

    const heading = document.createElement("h3");
    heading.textContent = `Conference Story ${pad(number)}`;

    const description = document.createElement("p");
    description.textContent = "A voice, an experience, and a perspective from the leadership community.";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "wil-video-thumb";
    button.dataset.video = videoPath(number);
    button.dataset.poster = posterPath(number);
    button.dataset.title = `${label} — Conference Story ${pad(number)}`;
    button.setAttribute("aria-label", `Play conference video ${number}`);

    const image = document.createElement("img");
    image.src = posterPath(number);
    image.alt = `Video testimonial preview ${number}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      button.classList.add("media-unavailable");
      button.title = `Thumbnail unavailable: ${posterPath(number)}`;
    });

    const play = document.createElement("span");
    play.className = "wil-video-play";
    play.setAttribute("aria-hidden", "true");
    play.textContent = "▶";

    const caption = document.createElement("span");
    caption.className = "wil-video-caption";
    caption.textContent = "Watch testimonial";

    button.append(image, play, caption);
    card.append(count, heading, description, button);
    slide.appendChild(card);
    return slide;
  }

  function buildVideoCards() {
    videoGroups.forEach((group) => {
      const track = $(group.track);
      if (!track || track.dataset.generated === "true") return;
      track.dataset.generated = "true";

      // Keep the arrow and pagination controls. The cards now form a
      // single-row horizontal rail inside the existing viewport.
      const carousel = track.closest(".wil-testimonial-carousel");
      const viewport = carousel?.querySelector(".wil-carousel-viewport");
      if (viewport) viewport.setAttribute("data-lenis-prevent", "");

      const total = group.end - group.start + 1;
      for (let number = group.start; number <= group.end; number++) {
        track.appendChild(createVideoCard(number, number - group.start + 1, total, group.label));
      }
    });
  }

  /* =======================================================
     6. SINGLE-ROW HORIZONTAL VIDEO CARD RAILS
     Cards stay white until hover; the light-purple backing appears
     only while a card is hovered or keyboard-focused.
  ======================================================= */
  function initialiseVideoCardRails() {
    $$(".wil-testimonial-carousel").forEach((carousel) => {
      if (carousel.dataset.railInitialised === "true") return;

      const viewport = $(".wil-carousel-viewport", carousel);
      const track = $(".wil-carousel-track", carousel);
      const previous = $(".wil-carousel-prev", carousel);
      const next = $(".wil-carousel-next", carousel);
      const dotsContainer = $(".wil-carousel-dots", carousel);

      if (!viewport || !track || !previous || !next || !dotsContainer) return;

      carousel.dataset.railInitialised = "true";
      viewport.setAttribute("data-lenis-prevent", "");
      viewport.setAttribute("tabindex", "0");

      let pageStep = 0;
      let pageCount = 1;
      let dots = [];
      let resizeFrame = 0;

      function calculatePageStep() {
        return Math.max(1, Math.round(viewport.clientWidth * 0.82));
      }

      function buildDots() {
        pageStep = calculatePageStep();
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        pageCount = Math.max(1, Math.ceil(maxScroll / pageStep) + 1);

        dotsContainer.replaceChildren();
        dots = [];

        for (let page = 0; page < pageCount; page++) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "wil-carousel-dot";
          dot.setAttribute("aria-label", `Show video group ${page + 1}`);
          dot.addEventListener("click", () => {
            viewport.scrollTo({
              left: Math.min(page * pageStep, Math.max(0, viewport.scrollWidth - viewport.clientWidth)),
              behavior: reducedMotion ? "auto" : "smooth"
            });
          });
          dotsContainer.appendChild(dot);
          dots.push(dot);
        }
        updateControls();
      }

      function updateControls() {
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const current = viewport.scrollLeft;
        previous.disabled = current <= 2;
        next.disabled = maxScroll <= 2 || current >= maxScroll - 2;

        pageStep = calculatePageStep();
        const activePage = Math.max(0, Math.min(pageCount - 1, Math.round(current / pageStep)));

        dots.forEach((dot, index) => {
          const active = index === activePage;
          dot.classList.toggle("is-active", active);
          if (active) dot.setAttribute("aria-current", "true");
          else dot.removeAttribute("aria-current");
        });
      }

      function moveRail(direction) {
        const distance = Math.max(1, Math.round(viewport.clientWidth * 0.82));
        viewport.scrollBy({
          left: direction * distance,
          behavior: reducedMotion ? "auto" : "smooth"
        });
      }

      previous.addEventListener("click", () => moveRail(-1));
      next.addEventListener("click", () => moveRail(1));

      viewport.addEventListener("scroll", updateControls, { passive: true });
      viewport.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveRail(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveRail(1);
        }
      });

      window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          const oldLeft = viewport.scrollLeft;
          buildDots();
          viewport.scrollLeft = Math.min(oldLeft, Math.max(0, viewport.scrollWidth - viewport.clientWidth));
          updateControls();
        });
      });

      // Wait for card widths and poster images to settle before calculating pages.
      requestAnimationFrame(() => {
        buildDots();
        updateControls();
      });
      track.querySelectorAll("img").forEach((image) => {
        image.addEventListener("load", () => {
          buildDots();
          updateControls();
        });
      });
    });
  }

  /* =======================================================
     6. SAME-PAGE CENTRED VIDEO MODAL
  ======================================================= */
  function createVideoModal() {
    let modal = $("#wilVideoModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "wil-video-modal";
    modal.id = "wilVideoModal";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Video testimonial player");

    const dialog = document.createElement("div");
    dialog.className = "wil-video-modal-dialog";

    const close = document.createElement("button");
    close.className = "wil-video-modal-close";
    close.type = "button";
    close.setAttribute("aria-label", "Close video");
    close.innerHTML = "&times;";

    const title = document.createElement("p");
    title.className = "wil-video-modal-title";
    title.id = "wilVideoModalTitle";

    const playerHost = document.createElement("div");
    playerHost.className = "wil-video-modal-player";

    dialog.append(close, playerHost, title);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    let lastFocused = null;

    function closeVideo() {
      const video = $("video", playerHost);
      video?.pause();
      playerHost.replaceChildren();
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("wil-video-view-open");
      lenis?.start();
      lastFocused?.focus();
    }

    function openVideo(button) {
      lastFocused = button;
      const video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = button.dataset.poster || "";

      const source = document.createElement("source");
      source.src = button.dataset.video;
      source.type = "video/mp4";
      video.appendChild(source);

      playerHost.replaceChildren(video);
      title.textContent = button.dataset.title || "WIL video testimonial";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("wil-video-view-open");
      lenis?.stop();
      close.focus();
      video.play().catch(() => {
        // Browser autoplay restrictions may require the viewer to press play.
      });
      video.addEventListener("error", () => {
        const error = document.createElement("p");
        error.className = "wil-video-error";
        error.textContent = `Unable to load ${button.dataset.video}. Please check the MP4 path.`;
        playerHost.appendChild(error);
      }, { once: true });
    }

    close.addEventListener("click", closeVideo);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeVideo();
    });
    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") closeVideo();
    });

    modal.openVideo = openVideo;
    return modal;
  }

  function initialiseVideoModal() {
    const modal = createVideoModal();
    document.addEventListener("click", (event) => {
      const button = event.target.closest(".wil-video-thumb");
      if (!button || !button.dataset.video) return;
      event.preventDefault();
      modal.openVideo(button);
    });
  }

  /* =======================================================
     7. MEDIA TABS
  ======================================================= */
  const photosTab = $("#photosTab");
  const videosTab = $("#videosTab");
  const photosPanel = $("#photosPanel");
  const videosPanel = $("#videosPanel");

  function activateMediaTab(which) {
    if (!photosTab || !videosTab || !photosPanel || !videosPanel) return;
    const showPhotos = which === "photos";
    photosPanel.hidden = !showPhotos;
    videosPanel.hidden = showPhotos;
    photosTab.classList.toggle("is-active", showPhotos);
    videosTab.classList.toggle("is-active", !showPhotos);
    photosTab.setAttribute("aria-selected", String(showPhotos));
    videosTab.setAttribute("aria-selected", String(!showPhotos));
  }

  photosTab?.addEventListener("click", () => activateMediaTab("photos"));
  videosTab?.addEventListener("click", () => activateMediaTab("videos"));
  activateMediaTab("videos");

  function activateHiddenPanelFor(target) {
    if (target?.closest("#photosPanel")) activateMediaTab("photos");
    if (target?.closest("#videosPanel")) activateMediaTab("videos");
  }

  /* =======================================================
     8. SEARCH + ONE-PAGE ANCHOR NAVIGATION
  ======================================================= */
  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = (searchInput?.value || "").trim().toLowerCase();
    if (!query) return;

    const elements = $$("main h1, main h2, main h3, main h4, main p")
      .filter((element) => !element.closest("[hidden]"));
    const match = elements.find((element) => element.textContent.toLowerCase().includes(query));

    if (!match) {
      searchInput.setCustomValidity("No matching content was found on this page.");
      searchInput.reportValidity();
      return;
    }

    const target = match.closest("section") || match;
    activateHiddenPanelFor(target);
    closeSearch();
    closeQuickMenu();
    requestAnimationFrame(() => smoothScrollTo(target));
  });

  function getAnchorTarget(link) {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#") || href === "#") return null;
    return document.getElementById(href.slice(1));
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = getAnchorTarget(link);
    if (!target) return;
    event.preventDefault();
    activateHiddenPanelFor(target);
    closeQuickMenu();
    requestAnimationFrame(() => smoothScrollTo(target));
    history.replaceState(null, "", link.getAttribute("href"));
  });

  const navLinks = $$(".wil-section-nav a");
  function updateSectionNavigation() {
    if (!navLinks.length) return;
    let activeLink = null;
    let bestTop = -Infinity;

    if (window.scrollY < 35) {
      activeLink = navLinks.find((link) => link.getAttribute("href") === "#sponsorship") || navLinks[0];
    } else {
      navLinks.forEach((link) => {
        const target = getAnchorTarget(link);
        if (!target || target.closest("[hidden]") || target.getClientRects().length === 0) return;
        const top = target.getBoundingClientRect().top;
        if (top <= 150 && top > bestTop) {
          bestTop = top;
          activeLink = link;
        }
      });
      if (!activeLink) activeLink = navLinks[0];
    }

    navLinks.forEach((link) => {
      const active = link === activeLink;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", updateSectionNavigation, { passive: true });
  window.addEventListener("resize", updateSectionNavigation);
  window.addEventListener("hashchange", updateSectionNavigation);

  /* =======================================================
     9. HORIZONTAL AGENDA ARROWS + PROGRESS
  ======================================================= */
  function initialiseAgendaTimelines() {
    $$(".agenda-lane").forEach((lane) => {
      const viewport = $(".agenda-viewport", lane);
      const progress = $(".agenda-progress-bar", lane);
      const previous = $(".agenda-prev", lane);
      const next = $(".agenda-next", lane);
      const track = $(".agenda-track", lane);
      if (!viewport || !track || !previous || !next) return;

      function update() {
        const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const left = viewport.scrollLeft;
        previous.disabled = left <= 2;
        next.disabled = max <= 2 || left >= max - 2;
        if (progress) progress.style.width = `${max <= 2 ? 100 : (left / max) * 100}%`;
      }

      function move(direction) {
        const card = $(".agenda-item", track);
        if (!card) return;
        const styles = getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
        const stride = card.getBoundingClientRect().width + gap;
        const perClick = window.innerWidth <= 560 ? 1 : 2;
        viewport.scrollBy({ left: direction * stride * perClick, behavior: reducedMotion ? "auto" : "smooth" });
      }

      previous.addEventListener("click", () => move(-1));
      next.addEventListener("click", () => move(1));
      viewport.addEventListener("scroll", update, { passive: true });
      viewport.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      });
      window.addEventListener("resize", update);
      track.querySelectorAll("img").forEach((image) => {
        image.addEventListener("load", update);
        image.addEventListener("error", update);
      });
      requestAnimationFrame(update);
    });
  }

  /* =======================================================
     10. PHOTO LIGHTBOX
  ======================================================= */
  function initialisePhotoLightbox() {
    const modal = $("#wilPhotoModal");
    const enlarged = $("#wilExpandedPhoto");
    if (!modal || !enlarged) return;

    const closeButton = $(".wil-photo-modal-close", modal);
    const previous = $(".wil-photo-modal-prev", modal);
    const next = $(".wil-photo-modal-next", modal);
    if (!closeButton || !previous || !next) return;

    let index = 0;
    let lastFocus = null;
    const buttons = () => $$(".wil-photo-item");

    function openAt(value) {
      const photos = buttons();
      if (!photos.length) return;
      index = (value + photos.length) % photos.length;
      const button = photos[index];
      const thumbnail = $("img", button);
      if (!thumbnail) return;
      enlarged.src = button.dataset.full || thumbnail.currentSrc || thumbnail.src;
      enlarged.alt = thumbnail.alt || "Conference photograph";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("wil-photo-view-open");
      lenis?.stop();
      closeButton.focus();
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("wil-photo-view-open");
      enlarged.src = "";
      lenis?.start();
      lastFocus?.focus();
    }

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".wil-photo-item");
      if (!button) return;
      lastFocus = button;
      openAt(buttons().indexOf(button));
    });

    closeButton.addEventListener("click", close);
    previous.addEventListener("click", () => openAt(index - 1));
    next.addEventListener("click", () => openAt(index + 1));
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") openAt(index - 1);
      if (event.key === "ArrowRight") openAt(index + 1);
    });
  }

  /* =======================================================
     11. ABOUT VIDEO — SAME PAGE
  ======================================================= */
  function initialiseAboutVideo() {
    const button = $(".video-card .play");
    if (!button) return;
    button.addEventListener("click", () => {
      const holder = $(".video-card");
      if (!holder || $("video", holder)) return;
      const video = document.createElement("video");
      video.className = "wil-inline-video";
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = videoPath(1);
      holder.replaceChildren(video);
      video.play().catch(() => {});
      video.addEventListener("error", () => {
        holder.textContent = "Conference video unavailable. Check assets/videos/video-01.mp4.";
      });
    });
  }

  /* =======================================================
     12. BACK TO TOP
  ======================================================= */
  function initialiseBackToTop() {
    const button = $("#backtop");
    if (!button) return;
    const update = () => { button.style.display = window.scrollY > 500 ? "block" : "none"; };
    window.addEventListener("scroll", update, { passive: true });
    update();
    button.addEventListener("click", () => smoothScrollTo(0));
  }

  /* =======================================================
     13. SCROLL-REVEAL EFFECTS
  ======================================================= */
  function initialiseScrollReveal() {
    const selectors = [
      ".section .blue-title", ".section .heading", ".section .subheading",
      ".about-grid > *", ".objective", ".pills span", ".stat",
      ".speaker-feature-section .workshop-feature", ".speaker-panel-section .person",
      ".agenda-lane-heading", ".agenda-item", ".committee-title", ".committee-card",
      ".speaker-edition-card", ".speaker-mosaic-item", ".partners-section .sponsor-card",
      ".person", ".workshop-feature", ".tier-card", ".wil-addons",
      ".wil-current-partners", ".sponsorship-contact", ".wil-gallery-heading",
      ".wil-photo-edition", ".wil-photo-item", ".wil-video-heading",
      ".wil-testimonial-slide", ".wil-media-toolbar"
    ];
    const elements = $$(selectors.join(","));

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
    });

    document.documentElement.classList.add("has-scroll-reveal");

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observerInstance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -25px 0px" });

    elements.forEach((element) => observer.observe(element));
  }

  /* =======================================================
     14. INITIALISE IN DEPENDENCY ORDER
  ======================================================= */
  buildPhotoGallery();
  buildPastSpeakerArchive();
  buildVideoCards();
  initialiseVideoCardRails();
  initialiseVideoModal();
  initialiseAgendaTimelines();
  initialisePhotoLightbox();
  initialiseAboutVideo();
  initialiseBackToTop();
  initialiseScrollReveal();
  updateSectionNavigation();
})();
