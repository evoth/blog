// So let me start off by saying that this is kind of an abomination and there
// are probably (definitely?) better ways to do this. But this works well, so
// for now it's here to stay
const baseClasses = {
    left: ["right-0"],
    right: ["left-0"],
    top: [],
    bottom: ["-translate-y-full"],
    open: { all: [], left: [], right: [], top: [], bottom: [] },
    closed: { all: [], left: [], right: [], top: [], bottom: [] },
};
const bodyClasses = {
    left: ["left-1/2"],
    right: ["right-1/2"],
    top: ["after:-top-4", "after:bottom-full"],
    bottom: ["after:-bottom-4", "after:top-full"],
    open: {
        all: [
            "opacity-100",
            "[transition:opacity_0.3s_ease-out,top_0.2s_ease-out,background-color_0.2s]",
        ],
        left: [],
        right: [],
        top: ["top-3"],
        bottom: ["-top-3"],
    },
    closed: {
        all: [
            "opacity-0",
            "[transition:opacity_0.3s_ease-out,top_0.2s_ease-out,background-color_0.2s]",
        ],
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
// Status constants used in `tooltip.dataset.status`
const OPEN = "open";
const OPENING = "opening";
const CLOSED = "closed";
// Delay to open the tooltip after mouseenter
const OPEN_DELAY = 500;
// Delay to close the tooltip after mouseleave
const CLOSE_DELAY = 200;
/**
 * Modifies an element's classes depending on its quadrant
 * - `isLeft`: Whether the tooltip originates from the left half of the screen
 * - `isTop`: Whether the tooltip originates from the top half of the screen
 * - `...elementAndClasses`: Each a tuple of [`element`, `addClasses`,
 * `removeClasses?`], where `addClasses` are removed for all states, then added
 * conditionally based on `isLeft` and `isTop`. If `removeClasses` is supplied,
 * they are removed for all states.
 */
function editClasses(isLeft, isTop, ...elementAndClasses) {
    for (const [element, addClasses, removeClasses] of elementAndClasses) {
        if (removeClasses) {
            // Removes classes for all states
            element.classList.remove(...removeClasses.left, ...removeClasses.right, ...removeClasses.top, ...removeClasses.bottom);
            if (removeClasses.all) {
                element.classList.remove(...removeClasses.all);
            }
        }
        // Removes `addClasses` and then adds back only the appropriate ones
        element.classList.remove(...addClasses.left, ...addClasses.right, ...addClasses.top, ...addClasses.bottom);
        element.classList.add(...(isLeft ? addClasses.left : addClasses.right), ...(isTop ? addClasses.top : addClasses.bottom));
        if (addClasses.all) {
            element.classList.remove(...addClasses.all);
            element.classList.add(...addClasses.all);
        }
    }
}
/**
 * Prepares tooltip for opening; opens if mouse remains hovering after delay
 * - `event`: MouseEvent from `mouseenter` listener
 */
function tooltipEnter(event) {
    if (!(event.target instanceof HTMLElement))
        return;
    const tooltip = event.target.closest(".tooltip");
    // Keeps a total of how many tooltips are being hovered over (0 = no hover)
    tooltip.dataset.hover = String(Number(tooltip.dataset.hover) + 1);
    // Incremented on enter and leave events; used later to check if we can close
    tooltip.dataset.counter = String(Number(tooltip.dataset.counter) + 1);
    // Tooltip label text (inline)
    const text = tooltip.children[0];
    // Gets individual bounding boxes for the tooltip label text
    const rects = [...text.getClientRects()].filter((rect) => rect.height * rect.width != 0);
    // Bail if for some reason there are no boxes with width/height != 0
    if (rects.length == 0)
        return;
    // Find box with y-coordinate closest to that of the mouse
    let lineRect = rects[0], minDeltaY = Infinity;
    for (const rect of rects) {
        const deltaY = Math.abs((rect.top + rect.bottom) / 2 - event.y);
        if (deltaY < minDeltaY) {
            lineRect = rect;
            minDeltaY = deltaY;
        }
    }
    let isLeft, isTop;
    if (tooltip.dataset.status == CLOSED) {
        // If closed, calculate and store screen quadrant
        isLeft = event.x < window.innerWidth / 2;
        isTop = event.y < window.innerHeight / 2;
        tooltip.dataset.isLeft = String(isLeft);
        tooltip.dataset.isTop = String(isTop);
    }
    else {
        // If already open, use the stored quadrant for consistency
        isLeft = tooltip.dataset.isLeft == "true";
        isTop = tooltip.dataset.isTop == "true";
    }
    // The tooltip starts from the outside horizontal edge and inside vertical edge
    const x = isLeft ? lineRect.left : lineRect.right;
    const y = isTop ? lineRect.bottom : lineRect.top;
    // Element that remains inline from which to offset base
    const anchor = tooltip.getElementsByClassName("tooltip-anchor")[0];
    // Element to be positioned on corner of tooltip label text
    const base = anchor.getElementsByClassName("tooltip-base")[0];
    // Body of tooltip, extends inwards horizontally and vertically
    const body = base.getElementsByClassName("tooltip-body")[0];
    // Arrow that points to label text; inset from outer edge of tooltip body
    const arrow = base.getElementsByClassName("tooltip-arrow")[0];
    // Positions base on corner of tooltip label text
    const anchorBoundingRect = anchor.getBoundingClientRect();
    base.style.left = `${x - anchorBoundingRect.left}px`;
    base.style.top = `${y - anchorBoundingRect.top}px`;
    // Gets nearest <div> ancestor
    const containingDiv = tooltip.closest("div:not(.not-tooltip-container)");
    if (containingDiv) {
        // Sets `maxWidth` to the space available between `x` and the opposite edge
        // of the div
        const containingDivBoundingRect = containingDiv.getBoundingClientRect();
        const maxWidth = isLeft
            ? containingDivBoundingRect.right - x
            : x - containingDivBoundingRect.left;
        base.style.maxWidth = null;
        // If `maxWidth` is less than the current (CSS-determined) width, use it
        if (maxWidth < body.getBoundingClientRect().width) {
            base.style.maxWidth = `${maxWidth}px`;
        }
        else {
            base.style.maxWidth = null;
        }
    }
    if (tooltip.dataset.status == CLOSED) {
        tooltip.dataset.status = OPENING;
        // First, sets the general classes (positions element correctly)
        editClasses(isLeft, isTop, [base, baseClasses], [body, bodyClasses], [arrow, arrowClasses]);
        // Then, sets the closed classes to prepare for opening
        editClasses(isLeft, isTop, [base, baseClasses.closed], [body, bodyClasses.closed], [arrow, arrowClasses.closed]);
        // Waits for `OPEN_DELAY` milliseconds, opening if mouse is still hovering
        setTimeout(function () {
            if (tooltip.dataset.status == CLOSED ||
                Number(tooltip.dataset.hover) == 0)
                return;
            tooltip.dataset.status = OPEN;
            base.classList.remove("invisible");
            editClasses(isLeft, isTop, [base, baseClasses.open, baseClasses.closed], [body, bodyClasses.open, bodyClasses.closed], [arrow, arrowClasses.open, arrowClasses.closed]);
        }, OPEN_DELAY);
    }
    // This function's a bit long, isn't it? I should probably split it up at some
    // point... Oh well, I'm sure I'll get around to it someday
}
/**
 * Closes tooltip after delay if mouse has remained not hovering
 * - `event`: MouseEvent from `mouseleave` listener
 */
function tooltipLeave(event) {
    if (!(event.target instanceof HTMLElement))
        return;
    // See `tooltipEnter()`
    const tooltip = event.target.closest(".tooltip");
    const base = tooltip.getElementsByClassName("tooltip-base")[0];
    const body = base.getElementsByClassName("tooltip-body")[0];
    const arrow = base.getElementsByClassName("tooltip-arrow")[0];
    // Keeps a total of how many tooltips are being hovered over (0 = no hover)
    tooltip.dataset.hover = String(Number(tooltip.dataset.hover) - 1);
    // Incremented on enter and leave events; used to check if we can close
    const counter = String(Number(tooltip.dataset.counter) + 1);
    tooltip.dataset.counter = counter;
    // If tooltip isn't open yet, no need to change classes
    if (tooltip.dataset.status == OPENING) {
        tooltip.dataset.status = CLOSED;
        return;
    }
    // Waits for `CLOSE_DELAY` milliseconds, only closing if counter hasn't changed
    setTimeout(function () {
        if (tooltip.dataset.counter != counter)
            return;
        tooltip.dataset.status = CLOSED;
        editClasses(tooltip.dataset.isLeft == "true", tooltip.dataset.isTop == "true", [base, baseClasses.closed, baseClasses.open], [body, bodyClasses.closed, bodyClasses.open], [arrow, arrowClasses.closed, arrowClasses.open]);
        // Hide after animation is complete
        base.addEventListener("transitionend", () => base.classList.add("invisible"), {
            once: true,
        });
    }, CLOSE_DELAY);
}
// Adds event listeners to tooltip link and tooltip itself
const tooltips = document.getElementsByClassName("tooltip");
for (let i = 0; i < tooltips.length; i++) {
    const body = tooltips[i].getElementsByClassName("tooltip-body")[0];
    const link = tooltips[i].getElementsByTagName("a")[0];
    if (!(body && link))
        continue;
    link.addEventListener("mouseenter", tooltipEnter);
    link.addEventListener("mouseleave", tooltipLeave);
    body.addEventListener("mouseenter", tooltipEnter);
    body.addEventListener("mouseleave", tooltipLeave);
}
export {};
