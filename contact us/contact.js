const DJANGO = 'http://127.0.0.1:8000';

// ── Star rating ──────────────────────────────────────────────────────────────
const starsContainer = document.querySelector(".emojis");
const stars = starsContainer.querySelectorAll(".star");

function paintStars(count, className) {
  stars.forEach((s, i) => {
    s.classList.toggle(className, i < count);
  });
}

stars.forEach(star => {
  star.addEventListener("click", () => {
    const rating = parseInt(star.dataset.value);
    starsContainer.dataset.rating = rating;
    paintStars(rating, "active");
  });
});

stars.forEach(star => {
  star.addEventListener("mouseenter", () => {
    paintStars(parseInt(star.dataset.value), "hover-active");
  });
  star.addEventListener("mouseleave", () => {
    stars.forEach(s => s.classList.remove("hover-active"));
  });
});

// ── Form fields ──────────────────────────────────────────────────────────────
const formBox    = document.querySelector(".form-box");
const nameInput  = formBox.querySelector('input[type="text"]:nth-of-type(1), input[placeholder="Full Name"]');
const emailInput = formBox.querySelector('input[type="email"], input[placeholder="Email Address"]');
const subjectInput = formBox.querySelector('input[placeholder="Subject"]');
const msgInput   = formBox.querySelector("textarea");
const submitBtn  = formBox.querySelector(".submit-btn");

// ── Feedback message ─────────────────────────────────────────────────────────
let feedbackEl = document.getElementById("form-feedback");
if (!feedbackEl) {
  feedbackEl = document.createElement("p");
  feedbackEl.id = "form-feedback";
  feedbackEl.style.cssText = "margin:12px 0 0;font-size:0.9rem;text-align:center;";
  submitBtn.insertAdjacentElement("afterend", feedbackEl);
}

function showFeedback(msg, success) {
  feedbackEl.textContent = msg;
  feedbackEl.style.color = success ? "#d4af37" : "#ff6b6b";
}

// ── Submit ────────────────────────────────────────────────────────────────────
submitBtn.addEventListener("click", async () => {
  const full_name = nameInput?.value.trim()    || "";
  const email     = emailInput?.value.trim()   || "";
  const subject   = subjectInput?.value.trim() || "";
  const message   = msgInput?.value.trim()     || "";
  const rating    = parseInt(starsContainer.dataset.rating) || null;

  if (!full_name || !email || !subject || !message) {
    showFeedback("Please fill in all fields.", false);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  feedbackEl.textContent = "";

  try {
    const res  = await fetch(`${DJANGO}/api/contact/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ full_name, email, subject, message, rating }),
    });
    const data = await res.json();

    if (data.ok) {
      showFeedback("Your message has been sent. Thank you!", true);
      // Reset form
      if (nameInput)    nameInput.value    = "";
      if (emailInput)   emailInput.value   = "";
      if (subjectInput) subjectInput.value = "";
      if (msgInput)     msgInput.value     = "";
      starsContainer.dataset.rating = "0";
      paintStars(0, "active");
    } else {
      showFeedback(data.error || "Something went wrong.", false);
    }
  } catch {
    showFeedback("Cannot reach server. Make sure Django is running on port 8000.", false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});
