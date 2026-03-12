document.addEventListener("DOMContentLoaded", () => {
    // Scroll Reveal Animation with Intersection Observer for better performance
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-text, .hero-image, .project-card');
    revealElements.forEach(el => observer.observe(el));

  // Smooth Scroll for Nav Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // Simple Form Submission (Log to console)
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      console.log("Form Submitted:", Object.fromEntries(formData));
      alert("Thank you for your message! (Demo Only)");
      contactForm.reset();
    });
  }
});
