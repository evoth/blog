const baseClasses = {
  left: ["right-0"],
  right: ["left-0"],
  top: [],
  bottom: ["-translate-y-full"],
  open: { all: [], left: [], right: [], top: [], bottom: [] },
  closed: {
    all: ["pointer-events-none"],
    left: [],
    right: [],
    top: [],
    bottom: [],
  },
};
const bodyClasses = {
  left: ["left-1/2"],
  right: ["right-1/2"],
  top: ["after:-top-4", "after:bottom-full"],
  bottom: ["after:-bottom-4", "after:top-full"],
  open: {
    all: [
      "opacity-100",
      "[transition:opacity_0.3s_ease-out,top_0.2s_ease-out]",
    ],
    left: [],
    right: [],
    top: ["top-3"],
    bottom: ["-top-3"],
  },
  closed: {
    all: ["opacity-0", "[transition:opacity_0.3s_ease-out,top_0.2s_ease-out]"],
    left: [],
    right: [],
    top: ["top-5"],
    bottom: ["-top-5"],
  },
};
const arrowClasses = {
  left: ["left-2"],
  right: ["right-2"],
  top: ["bottom-full", "after:top-full"],
  bottom: ["top-full"],
  open: { all: [], left: [], right: [], top: [], bottom: [] },
  closed: { all: [], left: [], right: [], top: [], bottom: [] },
};
const OPEN = "open";
const OPENING = "opening";
const CLOSED = "closed";
const OPEN_DELAY = 500;
const CLOSE_DELAY = 200;

function editClasses(isLeft, isTop, ...elementAndClasses) {
  for (const ec of elementAndClasses) {
    const element = ec[0];
    const addClasses = ec[1];
    if (ec[2]) {
      const removeClasses = ec[2];
      element.classList.remove(
        ...removeClasses.left,
        ...removeClasses.right,
        ...removeClasses.top,
        ...removeClasses.bottom
      );
      if (removeClasses.all) {
        element.classList.remove(...removeClasses.all);
      }
    }
    element.classList.remove(
      ...addClasses.left,
      ...addClasses.right,
      ...addClasses.top,
      ...addClasses.bottom
    );
    element.classList.add(
      ...(isLeft ? addClasses.left : addClasses.right),
      ...(isTop ? addClasses.top : addClasses.bottom)
    );
    if (addClasses.all) {
      element.classList.remove(...addClasses.all);
      element.classList.add(...addClasses.all);
    }
  }
}

function tooltipEnter(event) {
  const tooltip = event.target.closest(".tooltip");

  tooltip.dataset.hover = Number(tooltip.dataset.hover) + 1;
  tooltip.dataset.counter = Number(tooltip.dataset.counter) + 1;

  const rects = tooltip.getClientRects();
  let lineRect, minDeltaY;
  for (const rect of rects) {
    const deltaY = Math.abs((rect.top + rect.bottom) / 2 - event.y);
    if (!lineRect || deltaY < minDeltaY) {
      lineRect = rect;
      minDeltaY = deltaY;
    }
  }

  let isLeft, isTop;
  if (tooltip.dataset.status == CLOSED) {
    isLeft = event.x < window.innerWidth / 2;
    isTop = event.y < window.innerHeight / 2;
    tooltip.dataset.isLeft = isLeft;
    tooltip.dataset.isTop = isTop;
  } else {
    isLeft = tooltip.dataset.isLeft == "true";
    isTop = tooltip.dataset.isTop == "true";
  }

  const x = isLeft ? lineRect.left : lineRect.right;
  const y = isTop ? lineRect.bottom : lineRect.top;

  const anchor = tooltip.getElementsByClassName("tooltip-anchor")[0];
  const base = anchor.getElementsByClassName("tooltip-base")[0];
  const body = base.getElementsByClassName("tooltip-body")[0];
  const arrow = base.getElementsByClassName("tooltip-arrow")[0];

  const anchorBoundingRect = anchor.getBoundingClientRect();
  base.style.left = `${x - anchorBoundingRect.left}px`;
  base.style.top = `${y - anchorBoundingRect.top}px`;

  const baseDiv = tooltip.closest("div");
  if (baseDiv) {
    const baseDivBoundingRect = baseDiv.getBoundingClientRect();
    const maxWidth = isLeft
      ? baseDivBoundingRect.right - x
      : x - baseDivBoundingRect.left;
    base.style.maxWidth = null;
    if (maxWidth < body.getBoundingClientRect().width) {
      base.style.maxWidth = `${maxWidth}px`;
    } else {
      base.style.maxWidth = null;
    }
  }

  if (tooltip.dataset.status == CLOSED) {
    tooltip.dataset.status = OPENING;

    editClasses(
      isLeft,
      isTop,
      [base, baseClasses],
      [body, bodyClasses],
      [arrow, arrowClasses]
    );

    editClasses(
      isLeft,
      isTop,
      [base, baseClasses.closed],
      [body, bodyClasses.closed],
      [arrow, arrowClasses.closed]
    );

    setTimeout(function () {
      if (
        tooltip.dataset.status == CLOSED ||
        Number(tooltip.dataset.hover) == 0
      )
        return;

      tooltip.dataset.status = OPEN;

      editClasses(
        isLeft,
        isTop,
        [base, baseClasses.open, baseClasses.closed],
        [body, bodyClasses.open, bodyClasses.closed],
        [arrow, arrowClasses.open, arrowClasses.closed]
      );
    }, OPEN_DELAY);
  }
}

function tooltipLeave(event) {
  const tooltip = event.target.closest(".tooltip");
  const base = tooltip.getElementsByClassName("tooltip-base")[0];
  const body = base.getElementsByClassName("tooltip-body")[0];
  const arrow = base.getElementsByClassName("tooltip-arrow")[0];

  tooltip.dataset.hover = Number(tooltip.dataset.hover) - 1;
  const counter = Number(tooltip.dataset.counter) + 1;
  tooltip.dataset.counter = counter;

  setTimeout(function () {
    if (tooltip.dataset.counter != counter) return;

    tooltip.dataset.status = CLOSED;

    editClasses(
      tooltip.dataset.isLeft == "true",
      (isTop = tooltip.dataset.isTop == "true"),
      [base, baseClasses.closed, baseClasses.open],
      [body, bodyClasses.closed, bodyClasses.open],
      [arrow, arrowClasses.closed, arrowClasses.open]
    );
  }, CLOSE_DELAY);
}

const tooltips = document.getElementsByClassName("tooltip");
for (let i = 0; i < tooltips.length; i++) {
  const body = tooltips[i].getElementsByClassName("tooltip-body")[0];
  const link = tooltips[i].getElementsByTagName("a")[0];
  if (!(body && link)) continue;
  link.addEventListener("mouseenter", tooltipEnter);
  link.addEventListener("mouseleave", tooltipLeave);
  body.addEventListener("mouseenter", tooltipEnter);
  body.addEventListener("mouseleave", tooltipLeave);
}
