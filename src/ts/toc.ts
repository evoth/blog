// TODO: Get breakpoint the correct way
const BREAKPOINT_3XL = 1792;

// Whether TOC is collapsed
let isCollapsed = false;

// Animation duration (used to clear transition class after animation is done)
const DURATION = 200;
// Class added to content to transition max-height
const TRANSITION = "[transition:max-height_0.2s]";
// Class added to chevron to rotate it
const ROTATE = "rotate-90";
// Classes added to active link in table of contents
const ACTIVE = ["font-semibold", "bg-zinc-300", "dark:bg-zinc-700"];
// Classes added to first and last active links in table of contents
const ACTIVE_FIRST = ["rounded-t-sm", "md:rounded-t-md"];
const ACTIVE_LAST = ["rounded-b-sm", "md:rounded-b-md"];

// Table of contents element (if it exists)
const toc = document.getElementById("table-of-contents");
// Collapsible content
let content: HTMLElement, chevron: HTMLElement;
// Collapse/expand buttons
let buttons: HTMLElement[] = [];
// Heading classes to track which sections are being shown on the page
// TODO: split into two arrays?
let headings: [anchor: string, heading: HTMLElement][] = [];
// Links in table of contents to update
let links: { [Anchor: string]: HTMLElement } = {};
// Stores active links so classes can be selectively removed when needed
let activeAnchors = new Set<string>();
// First and last active anchors (used when styling corners)
let firstAnchor: string;
let lastAnchor: string;

/**
 * Expands/collapses table of contents by animating max-height
 */
function toggle() {
  isCollapsed = !isCollapsed;

  // Rotate chevron (arrow) according to status and update button titles
  if (isCollapsed) {
    chevron.classList.add(ROTATE);
    for (const button of buttons) {
      button.title = toc.dataset.titleExpand;
    }
  } else {
    chevron.classList.remove(ROTATE);
    for (const button of buttons) {
      button.title = toc.dataset.titleCollapse;
    }
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
  if (!isCollapsed && window.innerWidth < BREAKPOINT_3XL) {
    content.style.maxHeight = `${content.scrollHeight}px`;
  } else if (window.innerWidth >= BREAKPOINT_3XL) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = `0px`;
  }
}

/**
 * Update styling of links in table of contents to reflect sections of content
 * that are currently onscreen
 */
function updateActiveLinks() {
  // New set of active link anchors to compare against previous
  let newActiveAnchors = new Set<string>();
  // New first and last active anchors
  let newFirstAnchor: string;
  let newLastAnchor: string;

  // Get top y coordinate of each heading
  const headingTops = headings.map(
    ([anchor, heading]) => heading.getBoundingClientRect().top
  );

  // Active links correspond to headings that have content visible onscreen
  for (let i = 0; i < headings.length; i++) {
    const [anchor, heading] = headings[i];
    const top = Math.max(0, headingTops[i]);
    const bottom = Math.min(
      window.innerHeight,
      i < headings.length - 1 ? headingTops[i + 1] : window.innerHeight
    );
    // Section is visible onscreen
    if (bottom - top > 0) {
      if (newActiveAnchors.size == 0) newFirstAnchor = anchor;
      newLastAnchor = anchor;

      newActiveAnchors.add(anchor);
    }
  }

  // If all are active, don't style any (because it looks sorta strange)
  if (newActiveAnchors.size == headings.length) {
    newActiveAnchors = new Set();
  }

  // For each newly active link, check if it's already active. If not, add
  // classes. Otherwise, do nothing.
  for (const newAnchor of newActiveAnchors) {
    if (activeAnchors.has(newAnchor)) {
      activeAnchors.delete(newAnchor);
    } else {
      links[newAnchor].classList.add(...ACTIVE);
    }
  }

  // Remove classes from links that are newly inactive
  for (const oldAnchor of activeAnchors) {
    links[oldAnchor].classList.remove(...ACTIVE);
  }

  activeAnchors = new Set(newActiveAnchors);

  // Style first and last active links
  if (firstAnchor != newFirstAnchor) {
    if (firstAnchor != null) {
      links[firstAnchor].classList.remove(...ACTIVE_FIRST);
    }
    if (newFirstAnchor != null) {
      links[newFirstAnchor].classList.add(...ACTIVE_FIRST);
    }
  }
  if (lastAnchor != newLastAnchor) {
    if (lastAnchor != null) {
      links[lastAnchor].classList.remove(...ACTIVE_LAST);
    }
    if (newLastAnchor != null) {
      links[newLastAnchor].classList.add(...ACTIVE_LAST);
    }
  }
  firstAnchor = newFirstAnchor;
  lastAnchor = newLastAnchor;
}

if (toc != null) {
  // Toggle buttons
  const tocButtons = toc.getElementsByClassName("toc-button");
  for (const button of tocButtons) {
    button.addEventListener("click", toggle);
    buttons.push(button as HTMLElement);
  }

  // Populate headings list
  const tocLinks = toc.getElementsByClassName("toc-link");
  for (const link of tocLinks) {
    const anchor = (link as HTMLElement).dataset.anchor;
    links[anchor] = link as HTMLElement;
    headings.push([anchor, document.getElementById(anchor)]);
  }

  // Update content and active links on resize and/or scroll
  content = toc.getElementsByClassName("toc-content")[0] as HTMLElement;
  window.addEventListener("resize", () => {
    updateMaxHeight();
    updateActiveLinks();
  });
  window.addEventListener("scroll", () => {
    updateActiveLinks();
  });

  // Get chevron element
  chevron = toc.getElementsByClassName("toc-chevron")[0] as HTMLElement;

  // Sets initial state
  toggle();
  updateMaxHeight();
  updateActiveLinks();
}
