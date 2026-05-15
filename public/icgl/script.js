document.addEventListener("DOMContentLoaded", () => {
  const faqPanels = document.querySelectorAll(".accordion-collapse");
  const referenceDropdown = document.querySelector(".dropdown-match-reference");

  faqPanels.forEach((panel) => {
    panel.addEventListener("show.bs.collapse", () => {
      const icon = panel.previousElementSibling?.querySelector(".faq-toggle");
      if (icon) {
        icon.classList.remove("bi-plus-lg");
        icon.classList.add("bi-dash-lg");
      }
    });

    panel.addEventListener("hide.bs.collapse", () => {
      const icon = panel.previousElementSibling?.querySelector(".faq-toggle");
      if (icon) {
        icon.classList.remove("bi-dash-lg");
        icon.classList.add("bi-plus-lg");
      }
    });
  });

  if (referenceDropdown && document.body.dataset.page === "faqs") {
    const dropdownToggle = referenceDropdown.querySelector("[data-bs-toggle='dropdown']");
    const dropdownMenu = referenceDropdown.querySelector(".dropdown-menu");

    const closeReferenceDropdown = () => {
      if (!dropdownToggle || !dropdownMenu) {
        return;
      }

      referenceDropdown.classList.remove("show");
      dropdownToggle.classList.remove("show");
      dropdownMenu.classList.remove("show");
      dropdownToggle.setAttribute("aria-expanded", "false");
    };

    const openReferenceDropdown = () => {
      if (window.innerWidth < 992 || !dropdownToggle || !dropdownMenu) {
        closeReferenceDropdown();
        return;
      }

      referenceDropdown.classList.add("show");
      dropdownToggle.classList.add("show");
      dropdownMenu.classList.add("show");
      dropdownToggle.setAttribute("aria-expanded", "true");
    };

    openReferenceDropdown();
    window.addEventListener("resize", openReferenceDropdown);

    document.addEventListener("click", (event) => {
      if (!referenceDropdown.contains(event.target)) {
        closeReferenceDropdown();
      }
    });
  }
});
