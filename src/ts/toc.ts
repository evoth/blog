// TODO: Get breakpoint the correct way
const BREAKPOINT_3XL = 1792;

// Status constants used in `toc.dataset.status`
const COLLAPSED = "collapsed";
const EXPANDED = "expanded";

// Animation duration (used to clear transition class after animation is done)
const DURATION = 200;
// Class added to content to transition max-height
const TRANSITION = "[transition:max-height_0.2s]";
// Class added to chevron to rotate it
const ROTATE = "rotate-90";

// Table of contents element (if it exists)
const toc = document.getElementById("table-of-contents");
// Collapsible content
let content: HTMLElement, chevron: HTMLElement;

/**
 * Expands/collapses table of contents by animating max-height
 */
function toggle() {
  // Toggle and store the status
  toc.dataset.status = toc.dataset.status == EXPANDED ? COLLAPSED : EXPANDED;
  const isCollapsed = toc.dataset.status == COLLAPSED;

  // Rotate chevron (arrow) according to status
  if (isCollapsed) {
    chevron.classList.add(ROTATE);
  } else {
    chevron.classList.remove(ROTATE);
  }

  // Sets content's max-height style to current height
  content.style.maxHeight = isCollapsed ? `${content.scrollHeight}px` : `0px`;

  // Add transition class before animation
  content.classList.add(TRANSITION);

  // New max-height (this is animated)
  content.style.maxHeight = isCollapsed ? `0px` : `${content.scrollHeight}px`;

  // Remove transition class after animation is complete
  setTimeout(function () {
    content.classList.remove(TRANSITION);
  }, DURATION);
}

/**
 * Update content max-height so it can collapse properly
 */
function updateMaxHeight() {
  const isCollapsed = toc.dataset.status == COLLAPSED;
  if (!isCollapsed && window.innerWidth < BREAKPOINT_3XL) {
    content.style.maxHeight = `${content.scrollHeight}px`;
  } else if (window.innerWidth >= BREAKPOINT_3XL) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = `0px`;
  }
}

if (toc != null) {
  // Toggle buttons
  const tocButtons = toc.getElementsByClassName("toc-button");
  for (const button of tocButtons) {
    button.addEventListener("click", toggle);
  }

  // Update content max-height on window resize so it can collapse properly
  content = toc.getElementsByClassName("toc-content")[0] as HTMLElement;
  window.addEventListener("resize", updateMaxHeight);

  // Get chevron element
  chevron = toc.getElementsByClassName("toc-chevron")[0] as HTMLElement;
}
