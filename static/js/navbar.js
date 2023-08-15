// Main navbar element
const navbar = document.getElementById("navbar");
// Separate element underneath for shadow (so that it can be faded using opacity)
const navbarShadow = document.getElementById("navbar-shadow");
// Amount that can be scrolled down before hiding navbar
const topBuffer = 150;
// Amount that can be scrolled up before showing navbar
const bottomBuffer = 350;
// Buffer (including height of navbar) within which the navbar will be updated
// before it enters or leaves view
const displayBuffer = 400;
// Absolute y-coordinate of the "buffer" that gets pushed up/down when scrolling
let stickY = window.scrollY;
// Used to determine if stickY has changed
let oldStickY = -1;
// Whether the navbar is currently stuck at the top of the screen
let isSticking = false;
// Opacity of the shadow element (opaque when sticking, but transitions to
// transparent near the top of the page)
let shadowOpacity = 0;
// Absolute y-coordinate of navbar when not sticking
let pageY = window.scrollY;
document.addEventListener("scroll", (event) => {
    const scrollY = window.scrollY;
    if (scrollY == 0) {
        // If at top of screen, reset buffer so navbar doesn't stick when scrolling
        stickY = 0;
    }
    else if (scrollY < stickY - topBuffer) {
        // Push the buffer up if we've scrolled higher than the top of it
        stickY = scrollY + topBuffer;
    }
    else if (scrollY > stickY + bottomBuffer) {
        // Push the buffer down if we've scrolled lower than the bottom of it
        stickY = scrollY - bottomBuffer;
    }
    if (!isSticking && scrollY < stickY) {
        // We've scrolled high enough to catch the navbar; stick it to top of screen
        isSticking = true;
        navbar.style.translate = `0px 0px`;
        navbar.classList.remove("relative");
        navbar.classList.add("sticky");
    }
    else if (isSticking && scrollY > stickY) {
        // We've scrolled low enough to drop the navbar; position it at a fixed
        // position relative to the page. However, we keep its display as relative
        // and only translate it so that it still takes up the same amount of space
        // in the context of the document.
        isSticking = false;
        pageY = stickY;
        navbar.classList.remove("sticky");
        navbar.classList.add("relative");
        navbar.style.translate = `0px ${stickY}px`;
    }
    if (!isSticking && scrollY - displayBuffer < stickY && stickY != oldStickY) {
        // We've scrolled into the safety buffer and the navbar isn't in the same
        // position as before, so move it and update variables. This is only done
        // under these conditions because otherwise, the position would be updated
        // on every scroll event when pushing the buffer down.
        oldStickY = stickY;
        pageY = stickY;
        navbar.style.translate = `0px ${stickY}px`;
    }
    // Absolute y-coordinate of navbar
    const navbarY = isSticking ? scrollY : pageY;
    // `displayBuffer` is also used to start fading the shadow opacity near the top
    if (navbarY < displayBuffer) {
        // Within `displayBuffer` pixels from top; scale shadow opacity accordingly
        shadowOpacity = navbarY / displayBuffer;
        navbarShadow.style.opacity = shadowOpacity.toString();
    }
    else if (navbarY >= displayBuffer && shadowOpacity != 1) {
        // Shadow opacity isn't exactly 1 even though it should be; correct that
        shadowOpacity = 1;
        navbarShadow.style.opacity = shadowOpacity.toString();
    }
});
export {};
