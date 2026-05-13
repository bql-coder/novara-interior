const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const yearTarget = document.querySelectorAll("[data-year]");
const revealItems = document.querySelectorAll("[data-reveal]");
const bookingForm = document.querySelector("[data-booking-form]");
const successModal = document.querySelector("[data-success-modal]");
const successDialog = successModal?.querySelector(".success-modal__dialog");
const successCloseControls = successModal?.querySelectorAll("[data-success-close]");

yearTarget.forEach((node) => {
  node.textContent = new Date().getFullYear();
});

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (!targetElement) {
      return;
    }

    event.preventDefault();
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (bookingForm) {
  const submitButton = bookingForm.querySelector('button[type="submit"]');
  const buttonText = submitButton?.querySelector(".button-text");
  const statusField = document.querySelector("[data-form-status]");
  const requiredFields = bookingForm.querySelectorAll("[required]");
  const defaultButtonText = buttonText?.textContent || "Send Request";
  let modalCloseTimer;

  const openSuccessModal = () => {
    if (!successModal || !successDialog) {
      return;
    }

    window.clearTimeout(modalCloseTimer);
    successModal.hidden = false;
    document.body.classList.add("modal-open");

    window.requestAnimationFrame(() => {
      successModal.classList.add("is-active");
      successDialog.focus();
    });
  };

  const closeSuccessModal = () => {
    if (!successModal) {
      return;
    }

    successModal.classList.remove("is-active");
    document.body.classList.remove("modal-open");
    window.clearTimeout(modalCloseTimer);
    modalCloseTimer = window.setTimeout(() => {
      successModal.hidden = true;
    }, 280);
  };

  successCloseControls?.forEach((control) => {
    control.addEventListener("click", closeSuccessModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && successModal && !successModal.hidden) {
      closeSuccessModal();
    }
  });

  const setStatus = (message, type = "") => {
    if (!statusField) {
      return;
    }

    statusField.textContent = message;
    statusField.classList.remove("is-success", "is-error");

    if (type) {
      statusField.classList.add(type);
    }
  };

  const setLoadingState = (isLoading) => {
    if (!submitButton || !buttonText) {
      return;
    }

    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
    buttonText.textContent = isLoading ? "Sending..." : defaultButtonText;
  };

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    if (bookingForm.action.includes("YOUR_FORM_ID")) {
      setStatus(
        "Replace YOUR_FORM_ID in booking.html with your Formspree form ID before submitting.",
        "is-error"
      );
      return;
    }

    for (const field of requiredFields) {
      if (!field.value.trim()) {
        field.reportValidity();
        setStatus("Please complete all required fields.", "is-error");
        return;
      }
    }

    try {
      setLoadingState(true);

      const response = await fetch(bookingForm.action, {
        method: bookingForm.method,
        body: new FormData(bookingForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      bookingForm.reset();
      setStatus(
        "Your request has been received. We'll contact you shortly.",
        "is-success"
      );
      openSuccessModal();
    } catch (error) {
      setStatus(
        "Something went wrong while sending your request. Please try again or reach out on WhatsApp.",
        "is-error"
      );
    } finally {
      setLoadingState(false);
    }
  });
}
