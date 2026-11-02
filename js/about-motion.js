// =========================================
// CINEMATIC MOTION & 3D INTERACTIONS (PHASES 3-11)
// ROBUST FIXED VERSION
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =========================================
    // SHARED HELPERS
    // =========================================

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const hasGSAP = typeof window.gsap !== "undefined";
    const gsap = hasGSAP ? window.gsap : null;

    const hasLucide =
        typeof window.lucide !== "undefined" &&
        typeof window.lucide.createIcons === "function";

    const refreshIcons = () => {
        if (hasLucide) window.lucide.createIcons();
    };

    // =========================================
    // PHASE 3: CINEMATIC SYSTEM INITIALIZATION
    // =========================================

    const btnExploreWorld = $("#btn-explore-world");
    const btnQuickExplore = $("#btn-quick-explore");
    const introOverlay = $("#cinematic-intro-overlay");
    const sysText = $("#system-activation-text");
    const earthCanvas = $("#earth-container");

    let introFinished = false;
    let introRunning = false;
    let introTimeouts = [];
    let introTimeline = null;

    const clearIntroTimers = () => {
        introTimeouts.forEach(window.clearTimeout);
        introTimeouts = [];
    };

    const scheduleIntro = (callback, delay) => {
        const timer = window.setTimeout(() => {
            introTimeouts = introTimeouts.filter(id => id !== timer);
            callback();
        }, delay);

        introTimeouts.push(timer);
        return timer;
    };

    const unlockPage = () => {
        document.body.classList.remove("intro-active");
    };

    const finishIntro = ({
        revealEarth = true,
        scrollToHero = false
    } = {}) => {

        if (introFinished) return;

        introFinished = true;
        introRunning = false;

        clearIntroTimers();

        if (introTimeline && gsap) {
            introTimeline.kill();
            introTimeline = null;
        }

        if (sysText && gsap) {
            gsap.killTweensOf(sysText);
        }

        if (introOverlay) {
            if (gsap) {
                gsap.killTweensOf(introOverlay);

                gsap.to(introOverlay, {
                    opacity: 0,
                    duration: 0.7,
                    ease: "power2.inOut",
                    onComplete: () => {
                        introOverlay.style.display = "none";
                        introOverlay.style.pointerEvents = "none";
                    }
                });
            } else {
                introOverlay.style.display = "none";
                introOverlay.style.pointerEvents = "none";
            }
        }

        unlockPage();

        if (earthCanvas) {
            earthCanvas.style.opacity = revealEarth ? "0.3" : "0";
        }

        if (scrollToHero) {
            const hero = $("#scene-hero");

            if (hero) {
                window.setTimeout(() => {
                    hero.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }, 100);
            }
        }
    };

    if (introOverlay && !introFinished) {
        document.body.classList.add("intro-active");
    }

    // =========================================
    // TYPEWRITER EFFECT
    // =========================================

    const typeWriter = (
        message,
        element,
        speed = 45,
        callback
    ) => {

        if (!element || introFinished) {
            if (
                typeof callback === "function" &&
                !introFinished
            ) {
                callback();
            }
            return;
        }

        element.style.display = "block";
        element.style.opacity = "1";
        element.textContent = "";

        let index = 0;

        const typeNext = () => {

            if (introFinished || !introRunning) return;

            if (index < message.length) {

                element.textContent += message.charAt(index);
                index += 1;

                scheduleIntro(typeNext, speed);

            } else if (typeof callback === "function") {

                scheduleIntro(() => {
                    if (!introFinished && introRunning) {
                        callback();
                    }
                }, 700);
            }
        };

        typeNext();
    };

    // =========================================
    // FULL CINEMATIC SEQUENCE
    // =========================================

    const runCinematicSequence = () => {

        if (introFinished || introRunning) return;

        introRunning = true;

        const startSystemMessages = () => {

            typeWriter(
                "INITIALIZING PERSONAL UNIVERSE...",
                sysText,
                40,
                () => {

                    typeWriter(
                        "LOADING PERSONAL IDENTITY...",
                        sysText,
                        40,
                        () => {

                            typeWriter(
                                "WELCOME TO MY WORLD.",
                                sysText,
                                40,
                                () => {

                                    if (sysText && gsap) {
                                        gsap.to(sysText, {
                                            opacity: 0,
                                            duration: 0.5
                                        });
                                    } else if (sysText) {
                                        sysText.style.opacity = "0";
                                    }

                                    if (earthCanvas) {
                                        earthCanvas.style.opacity = "1";
                                    }

                                    if (introOverlay && gsap) {

                                        gsap.to(introOverlay, {
                                            opacity: 0,
                                            duration: 1.8,
                                            ease: "power2.inOut",

                                            onComplete: () => {

                                                introOverlay.style.display = "none";
                                                introOverlay.style.pointerEvents = "none";

                                                unlockPage();

                                                const hero = $("#scene-hero");

                                                if (hero) {
                                                    hero.scrollIntoView({
                                                        behavior: "smooth",
                                                        block: "start"
                                                    });
                                                }

                                                if (earthCanvas) {
                                                    gsap.to(earthCanvas, {
                                                        opacity: 0.3,
                                                        duration: 3
                                                    });
                                                }

                                                introFinished = true;
                                                introRunning = false;

                                                clearIntroTimers();
                                            }
                                        });

                                    } else {

                                        finishIntro({
                                            revealEarth: true,
                                            scrollToHero: true
                                        });
                                    }
                                }
                            );
                        }
                    );
                }
            );
        };

        const introContent = [
            "#intro-name",
            "#intro-sub",
            "#intro-buttons"
        ]
        .map(selector => $(selector))
        .filter(Boolean);

        if (gsap && introContent.length) {

            introTimeline = gsap.timeline();

            introTimeline
                .to(introContent, {
                    opacity: 0,
                    duration: 0.8,
                    y: -20,
                    ease: "power2.in"
                })
                .call(startSystemMessages);

        } else {

            introContent.forEach(element => {
                element.style.opacity = "0";
                element.style.transform = "translateY(-20px)";
            });

            startSystemMessages();
        }
    };

    // QUICK EXPLORE

    if (btnQuickExplore) {
        btnQuickExplore.addEventListener("click", () => {
            finishIntro({
                revealEarth: true
            });
        });
    }

    if (btnExploreWorld) {
        btnExploreWorld.addEventListener(
            "click",
            runCinematicSequence
        );
    }

    // =========================================
    // HERO HEADLINE CHARACTER REVEAL
    // =========================================

    const headline = $("#heroHeadline");

    const splitText = element => {

        if (!element) return [];

        const originalText = element.textContent || "";

        element.textContent = "";

        const fragment = document.createDocumentFragment();

        Array.from(originalText).forEach(character => {

            const span = document.createElement("span");

            span.className = "char";

            span.textContent =
                character === " " ? "\u00A0" : character;

            fragment.appendChild(span);
        });

        element.appendChild(fragment);

        return $$(".char", element);
    };

    if (headline) {

        const chars = splitText(headline);

        if (gsap) {

            const heroTimeline = gsap.timeline();

            if ($(".sys-status")) {
                heroTimeline.from(".sys-status", {
                    opacity: 0,
                    y: -20,
                    duration: 1,
                    ease: "power3.out"
                });
            }

            if (chars.length) {
                heroTimeline.from(chars, {
                    opacity: 0,
                    y: 50,
                    rotateX: -90,
                    stagger: 0.05,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                }, "-=0.5");
            }

            if ($("#heroSubheadline")) {
                heroTimeline.from("#heroSubheadline", {
                    opacity: 0,
                    x: -30,
                    duration: 1,
                    ease: "power3.out"
                }, "-=0.2");
            }

            if ($("#exploreBtn")) {
                heroTimeline.from("#exploreBtn", {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.5,
                    ease: "back.out(2)"
                }, "-=0.5");
            }

            if ($("#profileTilt")) {
                heroTimeline.from("#profileTilt", {
                    opacity: 0,
                    x: 50,
                    duration: 1.5,
                    ease: "power4.out"
                }, "-=1.0");
            }
        }
    }

    // =========================================
    // 3D MAGNETIC HOVER
    // =========================================

    const tiltWrapper = $("#profileTilt");
    const profileCard = $("#profileCard");
    const closeProfileBtn = $("#closeProfileBtn");

    let isExpanded = false;
    let hologramOverlay = null;

    if (tiltWrapper && profileCard) {

        tiltWrapper.addEventListener("mousemove", event => {

            if (isExpanded) return;

            const rect = tiltWrapper.getBoundingClientRect();

            if (!rect.width || !rect.height) return;

            const x =
                ((event.clientX - rect.left) / rect.width - 0.5) * 2;

            const y =
                ((event.clientY - rect.top) / rect.height - 0.5) * 2;

            const rotateX = y * -15;
            const rotateY = x * 15;

            profileCard.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        tiltWrapper.addEventListener("mouseleave", () => {

            if (isExpanded) return;

            profileCard.style.transform =
                "perspective(1000px) rotateX(0deg) rotateY(0deg)";
        });

        // HOLOGRAM OVERLAY

        hologramOverlay = $("#hologramOverlay");

        if (!hologramOverlay) {

            hologramOverlay = document.createElement("div");

            hologramOverlay.id = "hologramOverlay";

            document.body.appendChild(hologramOverlay);
        }

        const expandHologram = () => {

            if (isExpanded) return;

            isExpanded = true;

            profileCard.style.transform = "";

            profileCard.classList.add("is-expanded");

            hologramOverlay.classList.add("active");

            document.body.classList.add("hologram-open");
        };

        const closeHologram = event => {

            if (event) event.stopPropagation();

            if (!isExpanded) return;

            isExpanded = false;

            profileCard.classList.remove("is-expanded");

            hologramOverlay.classList.remove("active");

            document.body.classList.remove("hologram-open");
        };

        profileCard.addEventListener("click", event => {

            if (event.target.closest("button, a")) return;

            expandHologram();
        });

        if (closeProfileBtn) {
            closeProfileBtn.addEventListener(
                "click",
                closeHologram
            );
        }

        hologramOverlay.addEventListener(
            "click",
            closeHologram
        );

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeHologram();
            }
        });
    }

    // =========================================
    // SCROLLTRIGGER ANIMATIONS
    // =========================================

    const hasScrollTrigger =
        typeof window.ScrollTrigger !== "undefined";

    if (gsap && hasScrollTrigger) {

        gsap.registerPlugin(window.ScrollTrigger);

        // PHASE 4: EDUCATION TIMELINE

        const timelineSection = $("#scene-education");

        if (timelineSection) {

            const timelineTrack =
                $(".timeline-advanced", timelineSection);

            const progress =
                $(".timeline-progress", timelineSection);

            if (timelineTrack && progress) {

                gsap.to(progress, {
                    scrollTrigger: {
                        trigger: timelineTrack,
                        start: "top 60%",
                        end: "bottom 60%",
                        scrub: 1
                    },
                    height: "100%",
                    ease: "none"
                });
            }

            $$(".left-node", timelineSection).forEach(node => {

                gsap.from(node, {
                    scrollTrigger: {
                        trigger: node,
                        start: "top 75%"
                    },
                    x: -100,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power4.out"
                });
            });

            $$(".right-node", timelineSection).forEach(node => {

                gsap.from(node, {
                    scrollTrigger: {
                        trigger: node,
                        start: "top 75%"
                    },
                    x: 100,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power4.out"
                });
            });
        }

        // PHASE 7: CAREER SECTION

        const careerSection = $("#scene-career");

        if (careerSection) {

            const careerCard =
                $(".career-card", careerSection);

            const workflow =
                $(".workflow-diagram", careerSection);

            if (careerCard) {

                gsap.from(careerCard, {
                    scrollTrigger: {
                        trigger: careerCard,
                        start: "top 80%"
                    },
                    y: 50,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power4.out"
                });
            }

            if (workflow) {

                const steps =
                    $$(".workflow-step", workflow);

                if (steps.length) {

                    gsap.from(steps, {
                        scrollTrigger: {
                            trigger: workflow,
                            start: "top 85%"
                        },
                        scale: 0.5,
                        opacity: 0,
                        duration: 0.8,
                        stagger: 0.3,
                        ease: "back.out(1.7)"
                    });
                }
            }
        }

        // PHASE 8: BENTO GRID

        const personalSection = $("#scene-personal");

        if (personalSection) {

            const bentoGrid =
                $(".bento-grid", personalSection);

            const items =
                $$(".bento-item", personalSection);

            if (bentoGrid && items.length) {

                gsap.from(items, {
                    scrollTrigger: {
                        trigger: bentoGrid,
                        start: "top 85%"
                    },
                    y: 60,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.15,
                    ease: "power4.out"
                });
            }
        }

        // PHASE 9: GALLERY ENTRANCE

        const gallerySection = $("#scene-gallery");

        if (gallerySection) {

            const galleryGrid =
                $(".gallery-grid", gallerySection);

            const galleryItems =
                $$(".gallery-item", gallerySection);

            if (galleryGrid && galleryItems.length) {

                gsap.from(galleryItems, {
                    scrollTrigger: {
                        trigger: galleryGrid,
                        start: "top 85%"
                    },
                    scale: 0.8,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power4.out"
                });
            }
        }
    }

    // =========================================
    // CAREER DETAILS EXPAND / COLLAPSE
    // =========================================

    const expandCareerBtn = $("#expandCareerBtn");
    const careerDetails = $("#careerDetails");

    let detailsExpanded = false;

    if (expandCareerBtn && careerDetails) {

        careerDetails.style.overflow = "hidden";
        careerDetails.style.display = "none";
        careerDetails.style.height = "0px";
        careerDetails.style.opacity = "0";

        expandCareerBtn.addEventListener("click", () => {

            detailsExpanded = !detailsExpanded;

            if (detailsExpanded) {

                careerDetails.style.display = "block";

                if (gsap) {

                    gsap.set(careerDetails, {
                        height: "auto"
                    });

                    const targetHeight =
                        careerDetails.scrollHeight;

                    gsap.fromTo(
                        careerDetails,
                        {
                            height: 0,
                            opacity: 0
                        },
                        {
                            height: targetHeight,
                            opacity: 1,
                            duration: 0.5,
                            ease: "power3.out",
                            onComplete: () => {
                                careerDetails.style.height = "auto";
                            }
                        }
                    );

                } else {

                    careerDetails.style.height = "auto";
                    careerDetails.style.opacity = "1";
                }

                expandCareerBtn.innerHTML =
                    '<i data-lucide="chevron-up"></i> Hide Details';

            } else {

                const currentHeight =
                    careerDetails.scrollHeight;

                if (gsap) {

                    gsap.fromTo(
                        careerDetails,
                        {
                            height: currentHeight,
                            opacity: 1
                        },
                        {
                            height: 0,
                            opacity: 0,
                            duration: 0.4,
                            ease: "power3.in",
                            onComplete: () => {
                                careerDetails.style.display = "none";
                            }
                        }
                    );

                } else {

                    careerDetails.style.height = "0px";
                    careerDetails.style.opacity = "0";
                    careerDetails.style.display = "none";
                }

                expandCareerBtn.innerHTML =
                    '<i data-lucide="workflow"></i> View Architecture Details';
            }

            refreshIcons();
        });
    }

    // =========================================
    // GALLERY LIGHTBOX
    // =========================================

    const galleryItems = $$(".gallery-item");

    const lightbox = $("#galleryLightbox");
    const lightboxImg = $("#lightboxImg");
    const lightboxCaption = $("#lightboxCaption");
    const closeLightboxBtn = $("#closeLightbox");

    let isLightboxOpen = false;

    const closeLightbox = () => {

        if (!isLightboxOpen || !lightbox) return;

        lightbox.classList.remove("active");

        isLightboxOpen = false;

        document.body.style.overflow = "";

        window.setTimeout(() => {

            if (!isLightboxOpen && lightboxImg) {
                lightboxImg.removeAttribute("src");
            }

        }, 500);
    };

    if (lightbox && lightboxImg && galleryItems.length) {

        galleryItems.forEach(item => {

            item.addEventListener("click", () => {

                const img = $(".gallery-img", item);
                const title = $("h3", item);

                if (!img) return;

                lightboxImg.src =
                    img.currentSrc || img.src;

                if (lightboxCaption) {

                    lightboxCaption.textContent =
                        title ? title.textContent : "";
                }

                lightbox.classList.add("active");

                isLightboxOpen = true;

                document.body.style.overflow = "hidden";
            });
        });

        if (closeLightboxBtn) {

            closeLightboxBtn.addEventListener(
                "click",
                closeLightbox
            );
        }

        lightbox.addEventListener("click", event => {

            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeLightbox();
            }
        });
    }

    // =========================================
    // PHASE 10: SCROLL PROGRESS BAR
    // =========================================

    const progressBar = $("#scroll-progress-bar");

    if (progressBar) {

        const updateScrollProgress = () => {

            const scrollTop =
                window.scrollY ||
                document.documentElement.scrollTop;

            const scrollableHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;

            const percentage = scrollableHeight > 0
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        (scrollTop / scrollableHeight) * 100
                    )
                )
                : 0;

            progressBar.style.width =
                `${percentage}%`;
        };

        window.addEventListener(
            "scroll",
            updateScrollProgress,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            updateScrollProgress
        );

        updateScrollProgress();
    }

    // =========================================
    // PHASE 11: FLOATING PARTICLES
    // =========================================

    const particleContainer = $("#particle-container");

    if (particleContainer) {

        const particleCount = 30;

        for (let i = 0; i < particleCount; i += 1) {

            const particle =
                document.createElement("div");

            particle.className = "particle";

            const size = Math.random() * 3 + 1;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            particle.style.left =
                `${Math.random() * 100}vw`;

            particle.style.top =
                `${Math.random() * 100}vh`;

            if (Math.random() > 0.7) {

                particle.style.background =
                    "var(--violet-neon)";

                particle.style.boxShadow =
                    "0 0 8px var(--violet-neon)";
            }

            particleContainer.appendChild(particle);

            if (gsap) {

                gsap.to(particle, {
                    y: `-=${Math.random() * 150 + 50}`,
                    x: `+=${Math.random() * 80 - 40}`,
                    opacity: Math.random() * 0.5 + 0.1,
                    duration: Math.random() * 10 + 10,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: Math.random() * -10
                });
            }
        }
    }

    // =========================================
    // CINEMATIC AUTO-SCROLL TOUR
    // =========================================

    const exploreBtn = $("#exploreBtn");

    if (exploreBtn) {

        let isAutoScrolling = false;
        let scrollFrame = null;

        const setExploreButton = isRunning => {

            exploreBtn.innerHTML = isRunning
                ? '<i data-lucide="square"></i> Stop Tour'
                : '<i data-lucide="zap"></i> Initialize Experience';

            refreshIcons();
        };

        const stopAutoScroll = () => {

            if (!isAutoScrolling) return;

            isAutoScrolling = false;

            if (scrollFrame !== null) {

                cancelAnimationFrame(scrollFrame);
                scrollFrame = null;
            }

            setExploreButton(false);
        };

        const autoScroll = () => {

            if (!isAutoScrolling) return;

            window.scrollBy(0, 7);

            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );

            if (
                window.innerHeight + window.scrollY >=
                documentHeight - 10
            ) {

                stopAutoScroll();
                return;
            }

            scrollFrame =
                requestAnimationFrame(autoScroll);
        };

        // USER INTERACTION STOPS TOUR

        window.addEventListener(
            "wheel",
            stopAutoScroll,
            { passive: true }
        );

        window.addEventListener(
            "touchstart",
            stopAutoScroll,
            { passive: true }
        );

        window.addEventListener(
            "mousedown",
            event => {

                if (
                    event.target !== exploreBtn &&
                    !exploreBtn.contains(event.target)
                ) {
                    stopAutoScroll();
                }

            },
            { passive: true }
        );

        window.addEventListener(
            "keydown",
            stopAutoScroll
        );

        // START / STOP TOUR

        exploreBtn.addEventListener("click", event => {

            event.preventDefault();

            if (isAutoScrolling) {

                stopAutoScroll();
                return;
            }

            isAutoScrolling = true;

            setExploreButton(true);

            autoScroll();
        });
    }

    // =========================================
    // INITIAL ICON REFRESH
    // =========================================

    refreshIcons();

});