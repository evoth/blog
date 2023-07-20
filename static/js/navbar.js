const navbar = document.getElementById("navbar");
const navbarShadow = document.getElementById("navbar-shadow");
const topBuffer = 150;
const bottomBuffer = 300;
const displayBuffer = 200;
let stickY = window.scrollY;
let oldStickY = -1;
let isSticking = false;
let shadowOpacity = 0;
let stickingY = window.scrollY;

document.addEventListener("scroll", (event) => {
    const scrollY = window.scrollY;
    if (scrollY == 0) {
        stickY = 0;
    } else if (scrollY < stickY - topBuffer) {
        stickY = scrollY + topBuffer;
    } else if (scrollY > stickY + bottomBuffer) {
        stickY = scrollY - bottomBuffer;
    }

    if (!isSticking && scrollY < stickY) {
        isSticking = true;
        navbar.style.translate = `0px 0px`;
        navbar.classList.remove("relative");
        navbar.classList.add("sticky");
    } else if (isSticking && scrollY > stickY) {
        isSticking = false;
        stickingY = stickY;
        navbar.classList.remove("sticky");
        navbar.classList.add("relative");
        navbar.style.translate = `0px ${stickY}px`;
    }

    if (!isSticking && scrollY - displayBuffer < stickY && stickY != oldStickY) {
        oldStickY = stickY;
        stickingY = stickY;
        navbar.style.translate = `0px ${stickY}px`;
    }

    const navbarY = (isSticking ? scrollY : stickingY);

    if (navbarY < displayBuffer) {
        shadowOpacity = navbarY / displayBuffer;
        navbarShadow.style.opacity = shadowOpacity;
    } else if (navbarY >= displayBuffer && shadowOpacity != 1) {
        shadowOpacity = 1;
        navbarShadow.style.opacity = shadowOpacity;
    }
});