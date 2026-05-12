const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("section[id]");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  {
    rootMargin: "-20% 0px -65% 0px",
    threshold: 0,
  },
);

sections.forEach((section) => sectionObserver.observe(section));

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("img");
const lightboxTitle = lightbox?.querySelector("strong");
const lightboxCaption = lightbox?.querySelector("figcaption span");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const mainEl = document.querySelector("main");

const openLightbox = (item) => {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxCaption) return;

  const fullImage = item.dataset.full;
  const title = item.dataset.title || "";
  const caption = item.dataset.caption || "";

  if (!fullImage) return;

  lightboxImage.src = fullImage;
  lightboxImage.alt = title;
  lightboxTitle.textContent = title;
  lightboxCaption.textContent = caption;
  lightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
};

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) return;

  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.classList.remove("is-lightbox-open");
};

mainEl?.addEventListener("click", (event) => {
  if (event.defaultPrevented) return;
  const trigger = event.target.closest("button.gallery-item[data-full]");
  if (!trigger || (mainEl && !mainEl.contains(trigger))) return;
  if (trigger.closest("[data-photo-carousel]")) return;
  openLightbox(trigger);
});

const PHOTO_CAROUSEL_DEFAULT_INTERVAL_MS = 1500;
const PHOTO_CAROUSEL_SWIPE_THRESHOLD_PX = 48;

const parseCarouselIntervalMs = (root) => {
  const raw = root.dataset.carInterval;
  if (raw == null || raw === "") return PHOTO_CAROUSEL_DEFAULT_INTERVAL_MS;
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n <= 0) return PHOTO_CAROUSEL_DEFAULT_INTERVAL_MS;
  return n;
};

const parseCarouselAutoplay = (root) => {
  const v = (root.dataset.carAutoplay || "").toLowerCase().trim();
  if (v === "false" || v === "0" || v === "off") return false;
  return true;
};

const initPhotoCarousel = (root) => {
  const viewport = root.querySelector("[data-car-viewport]");
  const track = root.querySelector("[data-car-track]");
  const dotsHost = root.querySelector("[data-car-dots]");
  const prevBtn = root.querySelector("[data-car-prev]");
  const nextBtn = root.querySelector("[data-car-next]");
  const realSlides = Array.from(root.querySelectorAll(".photo-carousel-slide"));
  if (!viewport || !track || !realSlides.length) return;

  const realN = realSlides.length;
  const multiSlide = realN > 1;
  const intervalMs = parseCarouselIntervalMs(root);
  let autoplayEnabled = parseCarouselAutoplay(root) && multiSlide;
  const panelCount = multiSlide ? realN + 1 : 1;

  if (!multiSlide) {
    root.classList.add("photo-carousel--single");
  }

  if (multiSlide) {
    const firstClone = realSlides[0].cloneNode(true);
    firstClone.classList.add("photo-carousel-slide--clone");
    firstClone.setAttribute("aria-hidden", "true");
    track.appendChild(firstClone);
  }
  track.style.setProperty("--photo-car-panels", String(panelCount));

  let trackIndex = 0;
  let carouselTimer;
  let swipeStartX = null;
  let swipePointerId = null;
  let consumeNextViewportClick = false;
  let autoplaySuspended = false;

  const logicalIndex = () => (multiSlide && trackIndex >= realN ? 0 : trackIndex);

  const currentSlideForLightbox = () => realSlides[logicalIndex()];

  if (dotsHost && multiSlide) {
    dotsHost.setAttribute("role", "group");
    dotsHost.setAttribute("aria-label", "选择幻灯片");
    dotsHost.removeAttribute("aria-hidden");
    realSlides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "photo-carousel-dot";
      dot.setAttribute("aria-label", `第 ${i + 1} 张`);
      dot.dataset.carDotIndex = String(i);
      dotsHost.appendChild(dot);
    });
  }

  const dots = dotsHost ? Array.from(dotsHost.querySelectorAll(".photo-carousel-dot")) : [];

  const applyTransform = () => {
    const pct = multiSlide ? (trackIndex * 100) / panelCount : 0;
    track.style.transform = `translateX(-${pct}%)`;
    const logical = logicalIndex();
    dots.forEach((dot, i) => {
      const active = i === logical;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const clearAutoplay = () => {
    window.clearTimeout(carouselTimer);
  };

  const scheduleAutoplay = () => {
    if (!autoplayEnabled || autoplaySuspended) return;
    clearAutoplay();
    carouselTimer = window.setTimeout(() => {
      if (autoplaySuspended) return;
      nextSlide();
    }, intervalMs);
  };

  const snapToRealStart = () => {
    if (!multiSlide) return;
    trackIndex = 0;
    track.classList.add("is-photo-car-jumping");
    applyTransform();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        track.classList.remove("is-photo-car-jumping");
        scheduleAutoplay();
      });
    });
  };

  const goToSlide = (index) => {
    if (!multiSlide) {
      scheduleAutoplay();
      return;
    }
    const i = ((index % realN) + realN) % realN;
    if (trackIndex === realN) {
      track.classList.add("is-photo-car-jumping");
      trackIndex = i;
      applyTransform();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          track.classList.remove("is-photo-car-jumping");
          scheduleAutoplay();
        });
      });
      return;
    }
    if (trackIndex === i) {
      scheduleAutoplay();
      return;
    }
    trackIndex = i;
    applyTransform();
  };

  const nextSlide = () => {
    if (!multiSlide) return;
    if (trackIndex === realN) {
      snapToRealStart();
      return;
    }
    if (trackIndex === realN - 1) {
      trackIndex = realN;
      applyTransform();
      return;
    }
    trackIndex += 1;
    applyTransform();
  };

  const prevSlide = () => {
    if (!multiSlide) return;
    if (trackIndex === realN) {
      trackIndex = realN - 1;
      applyTransform();
      return;
    }
    if (trackIndex === 0) {
      trackIndex = realN - 1;
      applyTransform();
      return;
    }
    trackIndex -= 1;
    applyTransform();
  };

  if (multiSlide) {
    track.addEventListener("transitionend", (event) => {
      if (event.target !== track) return;
      if (event.propertyName !== "transform") return;
      if (trackIndex === realN) {
        snapToRealStart();
        return;
      }
      scheduleAutoplay();
    });
  }

  applyTransform();
  scheduleAutoplay();

  prevBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    clearAutoplay();
    prevSlide();
  });

  nextBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    clearAutoplay();
    nextSlide();
  });

  dotsHost?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest("[data-car-dot-index]");
    if (!btn || !dotsHost.contains(btn)) return;
    event.stopPropagation();
    const idx = Number.parseInt(btn.getAttribute("data-car-dot-index") || "", 10);
    if (Number.isNaN(idx)) return;
    clearAutoplay();
    goToSlide(idx);
  });

  viewport.addEventListener("click", (event) => {
    if (consumeNextViewportClick) {
      event.preventDefault();
      event.stopPropagation();
      consumeNextViewportClick = false;
      return;
    }
    const slide = currentSlideForLightbox();
    if (slide) openLightbox(slide);
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (!multiSlide || event.button !== 0) return;
    swipeStartX = event.clientX;
    swipePointerId = event.pointerId;
    try {
      viewport.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  });

  const endSwipe = (event) => {
    if (!multiSlide) return;
    if (event.pointerId !== swipePointerId) return;
    swipePointerId = null;
    if (swipeStartX == null) return;
    const dx = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(dx) < PHOTO_CAROUSEL_SWIPE_THRESHOLD_PX) return;
    event.preventDefault();
    consumeNextViewportClick = true;
    clearAutoplay();
    if (dx < 0) nextSlide();
    else prevSlide();
  };

  viewport.addEventListener("pointerup", endSwipe);
  viewport.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== swipePointerId) return;
    swipePointerId = null;
    swipeStartX = null;
  });

  root.addEventListener("keydown", (event) => {
    if (!multiSlide) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const slide = currentSlideForLightbox();
        if (slide) openLightbox(slide);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      clearAutoplay();
      prevSlide();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      clearAutoplay();
      nextSlide();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const slide = currentSlideForLightbox();
      if (slide) openLightbox(slide);
    }
  });

  ["mouseenter", "focusin"].forEach((type) => {
    root.addEventListener(type, () => {
      autoplaySuspended = true;
      clearAutoplay();
    });
  });

  ["mouseleave", "focusout"].forEach((type) => {
    root.addEventListener(type, () => {
      autoplaySuspended = false;
      scheduleAutoplay();
    });
  });
};

document.querySelectorAll("[data-photo-carousel]").forEach((root) => {
  initPhotoCarousel(root);
});

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

const CONTACT_TOAST_TEXT = {
  phone: "+86 16622981770",
  email: "wwl_monique@163.com",
  wechat: "16622981770",
};

const contactToastButtons = document.querySelectorAll("[data-contact-toast]");
let contactToastHideTimer;
let contactToastRemoveClassTimer;

const allContactToasts = () => Array.from(document.querySelectorAll(".contact-toast"));

const clearContactToastLayout = (el) => {
  el.style.position = "";
  el.style.left = "";
  el.style.top = "";
  el.style.transform = "";
  el.style.zIndex = "";
  el.style.marginTop = "";
};

const positionContactToast = (host, toastEl) => {
  const row = host.querySelector(".hero-contact-row");
  const anchor = row ?? host;
  const r = anchor.getBoundingClientRect();
  const centerX = r.left + r.width / 2;
  toastEl.style.position = "fixed";
  toastEl.style.left = `${centerX}px`;
  toastEl.style.top = `${r.bottom + 10}px`;
  toastEl.style.transform = "translateX(-50%)";
  toastEl.style.zIndex = "100";
  toastEl.style.marginTop = "0";
};

const hideContactToast = () => {
  allContactToasts().forEach((el) => {
    el.classList.remove("is-visible");
  });
  window.clearTimeout(contactToastRemoveClassTimer);
  contactToastRemoveClassTimer = window.setTimeout(() => {
    allContactToasts().forEach((el) => {
      el.hidden = true;
      el.textContent = "";
      clearContactToastLayout(el);
    });
  }, 300);
};

contactToastButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-contact-toast");
    const text = key ? CONTACT_TOAST_TEXT[key] : "";
    const host = btn.closest(".hero-contact");
    const contactToastEl = host?.querySelector(".contact-toast");
    if (!text || !contactToastEl) return;

    window.clearTimeout(contactToastHideTimer);
    window.clearTimeout(contactToastRemoveClassTimer);
    allContactToasts().forEach((el) => {
      el.classList.remove("is-visible");
      el.hidden = true;
      el.textContent = "";
      clearContactToastLayout(el);
    });

    contactToastEl.hidden = false;
    contactToastEl.textContent = text;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        positionContactToast(host, contactToastEl);
        contactToastEl.classList.add("is-visible");
      });
    });

    contactToastHideTimer = window.setTimeout(hideContactToast, 3200);
  });
});
