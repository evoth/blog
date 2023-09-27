// Whether menu is collapsed
let isCollapsed = true;
// Classes added/removed for each state
const expandedClasses = [
    "-translate-y-0",
    "opacity-100",
    "pointer-events-auto",
];
const collapsedClasses = [
    "-translate-y-full",
    "opacity-0",
    "pointer-events-none",
];
// Expandable part of the navbar
const menu = document.getElementById("nav-menu");
// Toggle button (only shown below medium breakpoint)
const button = document.getElementById("nav-menu-button");
// Individual lines in menu icon SVG (animate between hamburger and "X")
const lines = document.querySelector("#nav-menu-button>svg").children;
/**
 * Expands/collapses navbar
 */
function toggle() {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
        // Switch menu classes to collapsed
        menu.classList.remove(...expandedClasses);
        menu.classList.add(...collapsedClasses);
        // Animate icon from "X" to hamburger
        lines[0].classList.remove("opacity-0");
        lines[1].classList.remove("rotate-45");
        lines[2].classList.remove("-rotate-45");
        // Set button title to value in data-title-expand
        button.title = button.dataset.titleExpand;
        // Make invisible after animation is complete
        menu.addEventListener("transitionend", () => menu.classList.add("invisible"), { once: true });
    }
    else {
        // Switch menu classes to expanded
        menu.classList.remove(...collapsedClasses);
        menu.classList.add(...expandedClasses);
        // Animate icon from hamburger to "X"
        lines[0].classList.add("opacity-0");
        lines[1].classList.add("rotate-45");
        lines[2].classList.add("-rotate-45");
        // Set button title to value in data-title-collapse
        button.title = button.dataset.titleCollapse;
        // Make visible
        menu.classList.remove("invisible");
    }
}
// Toggle button
button.addEventListener("click", () => toggle());
button.title = button.dataset.titleExpand;
// Dismiss if user clicks outside menu
document.documentElement.addEventListener("click", (event) => {
    if (!isCollapsed && event.y > menu.getBoundingClientRect().bottom) {
        toggle();
    }
});
// Initial line classes
lines[0].classList.add("[transition:opacity_0.2s]");
lines[1].classList.add("[transition:transform_0.2s]");
lines[2].classList.add("[transition:transform_0.2s]");
export {};
