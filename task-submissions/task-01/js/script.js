document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================================
       ELEMENTS
    ========================================================= */

    const body = document.body;

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navMenu =
        document.querySelector(".nav-menu");

    const navLinks =
        document.querySelectorAll(".nav-link");

    const revealElements =
        document.querySelectorAll(".reveal");

    const heroPanel =
        document.querySelector(".hero-panel");

    const featuredProject =
        document.querySelector(".featured-project");

    const projectCards =
        document.querySelectorAll(
            ".preview-card, .project-card"
        );

    const capabilityCards =
        document.querySelectorAll(
            ".capability-row"
        );

    const buttons =
        document.querySelectorAll(
            ".button, .project-button, .nav-contact"
        );

    const yearElement =
        document.querySelector(
            "[data-current-year]"
        );


    /* =========================================================
       PAGE LOAD
    ========================================================= */

    requestAnimationFrame(() => {
        body.classList.add("page-loaded");
    });


    /* =========================================================
       MOBILE NAVIGATION
    ========================================================= */

    const closeMobileMenu = () => {

        if (!menuToggle || !navMenu) {
            return;
        }

        navMenu.classList.remove("open");

        menuToggle.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        body.classList.remove(
            "mobile-menu-open"
        );
    };


    const openMobileMenu = () => {

        if (!menuToggle || !navMenu) {
            return;
        }

        navMenu.classList.add("open");

        menuToggle.classList.add("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

        body.classList.add(
            "mobile-menu-open"
        );
    };


    if (menuToggle && navMenu) {

        menuToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    navMenu.classList.contains("open");

                if (isOpen) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }

            }
        );


        navLinks.forEach((link) => {

            link.addEventListener(
                "click",
                () => {
                    closeMobileMenu();
                }
            );

        });


        document.addEventListener(
            "click",
            (event) => {

                if (
                    window.innerWidth > 900 ||
                    !navMenu.classList.contains("open")
                ) {
                    return;
                }

                const clickedInsideNav =
                    navMenu.contains(event.target);

                const clickedToggle =
                    menuToggle.contains(event.target);

                if (
                    !clickedInsideNav &&
                    !clickedToggle
                ) {
                    closeMobileMenu();
                }

            }
        );


        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 900
                ) {
                    closeMobileMenu();
                }

            }
        );

    }


    /* =========================================================
       ESCAPE KEY
    ========================================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                navMenu &&
                navMenu.classList.contains("open")
            ) {
                closeMobileMenu();
            }

        }
    );


    /* =========================================================
       SCROLL REVEAL
    ========================================================= */

    if (
        "IntersectionObserver" in window &&
        revealElements.length > 0
    ) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -45px 0px"
                }
            );


        revealElements.forEach((element) => {

            revealObserver.observe(
                element
            );

        });

    } else {

        revealElements.forEach((element) => {

            element.classList.add(
                "visible"
            );

        });

    }


    /* =========================================================
       ACTIVE NAVIGATION
    ========================================================= */

    const currentFile =
        window.location.pathname
            .split("/")
            .filter(Boolean)
            .pop() || "index.html";


    navLinks.forEach((link) => {

        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }

        const cleanHref =
            href.split("#")[0];

        const linkFile =
            cleanHref
                .split("/")
                .pop() || "index.html";

        link.classList.toggle(
            "active",
            linkFile === currentFile
        );

    });


    /* =========================================================
       SMOOTH INTERNAL LINKS
    ========================================================= */

    const anchorLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    anchorLinks.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );

                if (!target) {
                    return;
                }


                event.preventDefault();


                const header =
                    document.querySelector(
                        ".site-header"
                    );


                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 0;


                const targetTop =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    headerHeight -
                    12;


                window.scrollTo({
                    top: targetTop,
                    behavior: "smooth"
                });

            }
        );

    });


    /* =========================================================
       HERO PANEL — 3D POINTER MOTION
    ========================================================= */

    if (heroPanel) {

        heroPanel.addEventListener(
            "pointermove",
            (event) => {

                if (
                    window.innerWidth <= 950 ||
                    event.pointerType === "touch"
                ) {
                    return;
                }


                const rect =
                    heroPanel.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const percentX =
                    (x / rect.width) * 100;


                const percentY =
                    (y / rect.height) * 100;


                const rotateX =
                    ((y - rect.height / 2) /
                        (rect.height / 2)) *
                    -1.7;


                const rotateY =
                    ((x - rect.width / 2) /
                        (rect.width / 2)) *
                    1.7;


                heroPanel.style.setProperty(
                    "--glow-x",
                    `${percentX}%`
                );


                heroPanel.style.setProperty(
                    "--glow-y",
                    `${percentY}%`
                );


                heroPanel.style.transform =
                    `
                    perspective(1100px)
                    translateY(-5px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale3d(1.008, 1.008, 1.008)
                    `;

            }
        );


        heroPanel.addEventListener(
            "pointerleave",
            () => {

                heroPanel.style.transform =
                    "";

            }
        );

    }


    /* =========================================================
       FEATURED PROJECT — SUBTLE 3D MOTION
    ========================================================= */

    if (featuredProject) {

        featuredProject.addEventListener(
            "pointermove",
            (event) => {

                if (
                    window.innerWidth <= 950 ||
                    event.pointerType === "touch"
                ) {
                    return;
                }


                const rect =
                    featuredProject.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const rotateX =
                    ((y - rect.height / 2) /
                        (rect.height / 2)) *
                    -0.65;


                const rotateY =
                    ((x - rect.width / 2) /
                        (rect.width / 2)) *
                    0.65;


                featuredProject.style.transform =
                    `
                    perspective(1300px)
                    translateY(-4px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    `;

            }
        );


        featuredProject.addEventListener(
            "pointerleave",
            () => {

                featuredProject.style.transform =
                    "";

            }
        );

    }


    /* =========================================================
       PROJECT CARDS — TILT
    ========================================================= */

    projectCards.forEach((card) => {

        card.addEventListener(
            "pointermove",
            (event) => {

                if (
                    window.innerWidth <= 950 ||
                    event.pointerType === "touch"
                ) {
                    return;
                }


                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const rotateX =
                    ((y - rect.height / 2) /
                        (rect.height / 2)) *
                    -1.5;


                const rotateY =
                    ((x - rect.width / 2) /
                        (rect.width / 2)) *
                    1.5;


                card.style.transform =
                    `
                    perspective(1000px)
                    translateY(-6px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    `;

            }
        );


        card.addEventListener(
            "pointerleave",
            () => {

                card.style.transform =
                    "";

            }
        );

    });


    /* =========================================================
       CAPABILITY CARDS — TILT
    ========================================================= */

    capabilityCards.forEach((card) => {

        card.addEventListener(
            "pointermove",
            (event) => {

                if (
                    window.innerWidth <= 950 ||
                    event.pointerType === "touch"
                ) {
                    return;
                }


                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const rotateX =
                    ((y - rect.height / 2) /
                        (rect.height / 2)) *
                    -1.1;


                const rotateY =
                    ((x - rect.width / 2) /
                        (rect.width / 2)) *
                    1.1;


                card.style.transform =
                    `
                    perspective(900px)
                    translateY(-4px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    `;

            }
        );


        card.addEventListener(
            "pointerleave",
            () => {

                card.style.transform =
                    "";

            }
        );

    });


    /* =========================================================
       BUTTON PRESS FEEDBACK
    ========================================================= */

    buttons.forEach((button) => {

        button.addEventListener(
            "pointerdown",
            () => {

                button.classList.add(
                    "is-pressed"
                );

            }
        );


        button.addEventListener(
            "pointerup",
            () => {

                button.classList.remove(
                    "is-pressed"
                );

            }
        );


        button.addEventListener(
            "pointerleave",
            () => {

                button.classList.remove(
                    "is-pressed"
                );

            }
        );

    });


    /* =========================================================
       EMAIL COPY SUPPORT
       Used by contact.html later
    ========================================================= */

    const copyEmailButtons =
        document.querySelectorAll(
            "[data-copy-email]"
        );


    copyEmailButtons.forEach((button) => {

        button.addEventListener(
            "click",
            async () => {

                const email =
                    button.getAttribute(
                        "data-copy-email"
                    );


                if (!email) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        email
                    );


                    const originalText =
                        button.textContent;


                    button.textContent =
                        "Email copied ✓";


                    button.classList.add(
                        "copied"
                    );


                    setTimeout(() => {

                        button.textContent =
                            originalText;

                        button.classList.remove(
                            "copied"
                        );

                    }, 1800);


                } catch (error) {

                    window.location.href =
                        `mailto:${email}`;

                }

            }
        );

    });


    /* =========================================================
       CURSOR POSITION FOR INTERACTIVE GLOW
    ========================================================= */

    const interactiveElements =
        document.querySelectorAll(
            ".hero-panel, .featured-project, .preview-card, .project-card, .capability-row"
        );


    interactiveElements.forEach((element) => {

        element.addEventListener(
            "pointermove",
            (event) => {

                if (
                    event.pointerType === "touch"
                ) {
                    return;
                }


                const rect =
                    element.getBoundingClientRect();


                const x =
                    ((event.clientX - rect.left) /
                        rect.width) *
                    100;


                const y =
                    ((event.clientY - rect.top) /
                        rect.height) *
                    100;


                element.style.setProperty(
                    "--mouse-x",
                    `${x}%`
                );


                element.style.setProperty(
                    "--mouse-y",
                    `${y}%`
                );

            }
        );

    });


    /* =========================================================
       PARALLAX BACKGROUND
    ========================================================= */

    const glowOne =
        document.querySelector(
            ".hero-glow-one"
        );

    const glowTwo =
        document.querySelector(
            ".hero-glow-two"
        );


    if (
        glowOne &&
        glowTwo
    ) {

        let ticking =
            false;


        window.addEventListener(
            "scroll",
            () => {

                if (ticking) {
                    return;
                }


                window.requestAnimationFrame(
                    () => {

                        if (
                            window.innerWidth <= 950
                        ) {
                            ticking = false;
                            return;
                        }


                        const scrollY =
                            window.scrollY;


                        glowOne.style.transform =
                            `
                            translate3d(
                                0,
                                ${scrollY * 0.055}px,
                                0
                            )
                            `;


                        glowTwo.style.transform =
                            `
                            translate3d(
                                0,
                                ${scrollY * -0.035}px,
                                0
                            )
                            `;


                        ticking =
                            false;

                    }
                );


                ticking =
                    true;

            },
            {
                passive: true
            }
        );

    }


    /* =========================================================
       CURRENT YEAR
    ========================================================= */

    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }


    /* =========================================================
       EXTERNAL LINK SECURITY
    ========================================================= */

    const externalLinks =
        document.querySelectorAll(
            'a[target="_blank"]'
        );


    externalLinks.forEach((link) => {

        link.setAttribute(
            "rel",
            "noopener noreferrer"
        );

    });


    /* =========================================================
       PREVENT ACCIDENTAL DOUBLE-TAP ZOOM ON UI
    ========================================================= */

    const interactiveUI =
        document.querySelectorAll(
            ".button, .project-button, .nav-link, .menu-toggle"
        );


    interactiveUI.forEach((element) => {

        element.style.touchAction =
            "manipulation";

    });


});
