// read the page content
document.addEventListener("DOMContentLoaded", () => {
  const faqPanels = document.querySelectorAll(".accordion-collapse");
  const referenceDropdown = document.querySelector(".dropdown-match-reference");

  // run this page action
  faqPanels.forEach((panel) => {
    // run this page action
    panel.addEventListener("show.bs.collapse", () => {
      const icon = panel.previousElementSibling?.querySelector(".faq-toggle");
      if (icon) {
        // run this page action
        icon.classList.remove("bi-plus-lg");
        // run this page action
        icon.classList.add("bi-dash-lg");
      }
    });

    // run this page action
    panel.addEventListener("hide.bs.collapse", () => {
      const icon = panel.previousElementSibling?.querySelector(".faq-toggle");
      if (icon) {
        // run this page action
        icon.classList.remove("bi-dash-lg");
        // run this page action
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

      // run this page action
      referenceDropdown.classList.remove("show");
      // run this page action
      dropdownToggle.classList.remove("show");
      // run this page action
      dropdownMenu.classList.remove("show");
      // run this page action
      dropdownToggle.setAttribute("aria-expanded", "false");
    };

    const openReferenceDropdown = () => {
      if (window.innerWidth < 992 || !dropdownToggle || !dropdownMenu) {
        closeReferenceDropdown();
        return;
      }

      // run this page action
      referenceDropdown.classList.add("show");
      // run this page action
      dropdownToggle.classList.add("show");
      // run this page action
      dropdownMenu.classList.add("show");
      // run this page action
      dropdownToggle.setAttribute("aria-expanded", "true");
    };

    openReferenceDropdown();
    // update the browser behavior
    window.addEventListener("resize", openReferenceDropdown);

    // read the page content
    document.addEventListener("click", (event) => {
      if (!referenceDropdown.contains(event.target)) {
        closeReferenceDropdown();
      }
    });
  }
});
