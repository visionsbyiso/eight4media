(function () {
  "use strict";

  var body = document.body;
  var menuBtn = document.getElementById("menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  var progress = document.getElementById("progress");

  if (menuBtn && mobileMenu) {
    var menuLinks = mobileMenu.querySelectorAll("a");

    function toggleMenu(forceOpen) {
      var open = typeof forceOpen === "boolean" ? forceOpen : !mobileMenu.classList.contains("open");
      mobileMenu.classList.toggle("open", open);
      menuBtn.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
      body.style.overflow = open ? "hidden" : "";
      body.classList.toggle("menu-open", open);
    }

    menuBtn.addEventListener("click", function () {
      toggleMenu();
    });

    menuLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        toggleMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
        toggleMenu(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820 && mobileMenu.classList.contains("open")) {
        toggleMenu(false);
      }
    });
  }

  if (progress) {
    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progress.style.width = value + "%";
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  var countEls = document.querySelectorAll("[data-count]");
  var counted = false;
  var hero = document.querySelector(".hero");

  function runCounters() {
    if (counted) return;
    counted = true;

    countEls.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var duration = 1100;
      var start = 0;
      var startTime = null;

      function frame(time) {
        if (!startTime) startTime = time;
        var progress = Math.min((time - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(start + (target - start) * eased);
        el.textContent = String(value);
        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      }

      requestAnimationFrame(frame);
    });
  }

  if (hero && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          runCounters();
          counterObserver.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    counterObserver.observe(hero);
  } else if (countEls.length > 0) {
    runCounters();
  }

  var heroMedia = document.querySelector(".hero-media");
  var mediaChip = document.querySelector(".media-chip");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroMedia && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    heroMedia.addEventListener("pointermove", function (event) {
      var rect = heroMedia.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width;
      var y = (event.clientY - rect.top) / rect.height;
      var shiftX = (x - 0.5) * 12;
      var shiftY = (y - 0.5) * 10;

      heroMedia.style.transform = "translate3d(" + shiftX.toFixed(2) + "px, " + shiftY.toFixed(2) + "px, 0)";
      if (mediaChip) {
        mediaChip.style.transform = "translate3d(" + (-shiftX * 0.65).toFixed(2) + "px, " + (-shiftY * 0.5).toFixed(2) + "px, 0)";
      }
    });

    heroMedia.addEventListener("pointerleave", function () {
      heroMedia.style.transform = "";
      if (mediaChip) mediaChip.style.transform = "";
    });
  }

  var sectionEls = document.querySelectorAll("main section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a");

  if (sectionEls.length && navAnchors.length) {
    function updateActiveNav() {
      var pos = window.scrollY + 120;
      var current = "";
      sectionEls.forEach(function (section) {
        if (pos >= section.offsetTop) current = section.id;
      });

      navAnchors.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + current);
      });
    }

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav();
  }

  var industrySelect = document.getElementById("industry-filter");
  var industryTabs = document.querySelectorAll(".industry-tab");
  var industryPanels = document.querySelectorAll(".industry-panel");

  if (industrySelect && industryTabs.length && industryPanels.length) {
    function activateIndustry(industry) {
      if (!industry) return;

      industryTabs.forEach(function (tab) {
        var active = tab.getAttribute("data-industry") === industry;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.setAttribute("tabindex", active ? "0" : "-1");
      });

      industryPanels.forEach(function (panel) {
        var active = panel.getAttribute("data-industry") === industry;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });

      if (industrySelect.value !== industry) {
        industrySelect.value = industry;
      }
    }

    function focusTabByIndex(index) {
      if (!industryTabs[index]) return;
      var tab = industryTabs[index];
      tab.focus();
      activateIndustry(tab.getAttribute("data-industry"));
    }

    industryTabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateIndustry(tab.getAttribute("data-industry"));
      });

      tab.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          focusTabByIndex((index + 1) % industryTabs.length);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          focusTabByIndex((index - 1 + industryTabs.length) % industryTabs.length);
        }
      });
    });

    industrySelect.addEventListener("change", function () {
      activateIndustry(industrySelect.value);
    });

    activateIndustry(industrySelect.value || industryTabs[0].getAttribute("data-industry"));
  }

  var stickyCta = document.querySelector(".mobile-sticky-cta");
  if (stickyCta) {
    function updateScrollState() {
      body.classList.toggle("scrolled", window.scrollY > 260);
    }

    window.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();

    var contactSection = document.getElementById("contact");
    if (contactSection && "IntersectionObserver" in window) {
      var contactObserver = new IntersectionObserver(
        function (entries) {
          body.classList.toggle("contact-in-view", entries[0].isIntersecting);
        },
        { threshold: 0.2, rootMargin: "-10% 0px -45% 0px" }
      );

      contactObserver.observe(contactSection);
    }
  }

  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item, idx) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");

    function setState(open) {
      item.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    }

    setState(idx === 0);

    btn.addEventListener("click", function () {
      var shouldOpen = !item.classList.contains("open");
      faqItems.forEach(function (other) {
        var oBtn = other.querySelector(".faq-q");
        var oPanel = other.querySelector(".faq-a");
        other.classList.remove("open");
        oBtn.setAttribute("aria-expanded", "false");
        oPanel.style.maxHeight = "0px";
      });

      setState(shouldOpen);
    });
  });

  var form = document.getElementById("contact-form");
  var success = document.getElementById("form-success");
  if (form && success) {
    var leadConfig = window.eight4Lead || null;
    var requiredFields = form.querySelectorAll("[required]");
    var submitButton = form.querySelector('button[type="submit"]');
    var defaultButtonLabel = submitButton ? submitButton.textContent : "Request Proposal";
    var hideMessageTimer = null;

    function isEmailValid(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function setFormMessage(message, isError) {
      if (hideMessageTimer) {
        window.clearTimeout(hideMessageTimer);
      }

      success.textContent = message;
      success.classList.toggle("is-error", !!isError);
      success.style.display = "block";

      if (!isError) {
        hideMessageTimer = window.setTimeout(function () {
          success.style.display = "none";
        }, 7000);
      }
    }

    function setSubmitting(isSubmitting) {
      if (!submitButton) return;
      submitButton.disabled = isSubmitting;
      submitButton.textContent = isSubmitting ? "Sending..." : defaultButtonLabel;
    }

    function parseJsonSafely(text) {
      try {
        return JSON.parse(text);
      } catch (error) {
        return null;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var valid = true;

      requiredFields.forEach(function (field) {
        field.classList.remove("error");
        if (!field.value.trim()) {
          field.classList.add("error");
          valid = false;
        }
      });

      var email = document.getElementById("email");
      if (email && email.value.trim() && !isEmailValid(email.value.trim())) {
        email.classList.add("error");
        valid = false;
      }

      if (!valid) return;
      success.style.display = "none";
      success.classList.remove("is-error");

      setSubmitting(true);

      var fallbackSuccess = "Thanks, message received. We will reply within one business day with practical next steps.";
      var fallbackError = "Unable to send right now. Please call 0432 596 324 or email admin@eight4media.com.au.";

      if (!leadConfig || !leadConfig.ajaxUrl || !leadConfig.nonce) {
        form.reset();
        setFormMessage("Thanks, message saved in preview mode. Live email delivery works on the WordPress site.", false);
        setSubmitting(false);
        return;
      }

      var formData = new FormData(form);
      formData.append("action", "eight4_send_lead");
      formData.append("nonce", leadConfig.nonce);
      formData.append("page_url", window.location.href);

      var requestBody = new URLSearchParams();
      formData.forEach(function (value, key) {
        requestBody.append(key, String(value));
      });

      fetch(leadConfig.ajaxUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: requestBody.toString(),
      })
        .then(function (response) {
          return response.text();
        })
        .then(function (text) {
          var payload = parseJsonSafely(text);
          if (payload && payload.success) {
            form.reset();
            setFormMessage((payload.data && payload.data.message) || leadConfig.successMessage || fallbackSuccess, false);
            return;
          }

          var errorMessage =
            (payload && payload.data && payload.data.message) ||
            leadConfig.errorMessage ||
            fallbackError;
          setFormMessage(errorMessage, true);
        })
        .catch(function () {
          setFormMessage(leadConfig.errorMessage || fallbackError, true);
        })
        .finally(function () {
          setSubmitting(false);
        });
    });

    requiredFields.forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("error");
      });
    });
  }
})();
