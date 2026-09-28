/**
 * FlowPilot — Task 2
 * Navigation interaction
 */

"use strict";

document.documentElement.classList.add("js-ready");

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#primary-navigation");
const navLinks = document.querySelectorAll(
    ".nav-links a, .nav-cta"
);

if (navToggle && navMenu) {
    const setMenuState = (isOpen, returnFocus = false) => {
        navToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        navMenu.classList.toggle(
            "is-open",
            isOpen
        );

        if (returnFocus) {
            navToggle.focus();
        }
    };

    navToggle.addEventListener("click", () => {
        const isOpen =
            navToggle.getAttribute("aria-expanded") === "true";

        setMenuState(!isOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            setMenuState(false);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            const isOpen =
                navToggle.getAttribute("aria-expanded") === "true";

            if (isOpen) {
                setMenuState(false, true);
            }
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) {
            setMenuState(false);
        }
    });
}
