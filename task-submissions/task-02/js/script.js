/**
 * FlowPilot — Task 2
 * Navigation and FAQ interactions
 */

"use strict";

document.documentElement.classList.add("js-ready");

/* =========================================================
   Mobile Navigation
   ========================================================= */

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
    const navLinks = navMenu.querySelectorAll("a");

    const closeNavigation = () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation menu");
    };

    const openNavigation = () => {
        navMenu.classList.add("is-open");
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Close navigation menu");
    };

    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            closeNavigation();
        } else {
            openNavigation();
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeNavigation();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNavigation();
        }
    });

    document.addEventListener("click", (event) => {
        if (
            navMenu.classList.contains("is-open") &&
            !navMenu.contains(event.target) &&
            !navToggle.contains(event.target)
        ) {
            closeNavigation();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 832) {
            closeNavigation();
        }
    });
}

/* =========================================================
   FAQ Accordion
   ========================================================= */

const faqItems = document.querySelectorAll(".faq-item");

const closeFaqItem = (item) => {
    const button = item.querySelector(".faq-question button");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) {
        return;
    }

    button.setAttribute("aria-expanded", "false");
    item.classList.remove("is-open");
    answer.hidden = true;
};

const openFaqItem = (item) => {
    const button = item.querySelector(".faq-question button");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) {
        return;
    }

    button.setAttribute("aria-expanded", "true");
    item.classList.add("is-open");
    answer.hidden = false;
};

faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question button");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        const isOpen = button.getAttribute("aria-expanded") === "true";

        faqItems.forEach((faqItem) => {
            if (faqItem !== item) {
                closeFaqItem(faqItem);
            }
        });

        if (isOpen) {
            closeFaqItem(item);
        } else {
            openFaqItem(item);
        }
    });
});
