"use strict";
// Div that holds the actual text of the post
const articleContent = document.getElementById("content");
// Only update the sidenote variables if, you know, sidenotes are present
if (articleContent && document.getElementsByClassName("sidenote").length > 0) {
    // Div that holds entire article; includes padding which will be respected by
    // the sidenotes
    const inner = document.getElementById("article");
    // An outer div that constrains itself to the maximum extent of sidenotes
    const outer = document.getElementById("sidenote-border");
    /**
     * Updates CSS vars to reflect sidenote offsets and width
     */
    function updateSidenoteVars() {
        const innerBoundingRect = inner.getBoundingClientRect();
        const outerBoundingRect = outer.getBoundingClientRect();
        const contentBoundingRect = articleContent.getBoundingClientRect();
        const offset = innerBoundingRect.right - contentBoundingRect.left;
        const maxWidth = outerBoundingRect.right - innerBoundingRect.right;
        inner.style.setProperty("--sidenote-offset", `${offset}px`);
        inner.style.setProperty("--sidenote-max-width", `${maxWidth}px`);
    }
    updateSidenoteVars();
    window.addEventListener("resize", updateSidenoteVars);
}
// Status constants used in `sidenote.dataset.status`
const INLINE = "inline";
const BLOCK = "block";
// Sidenote event, which is called every time a sidenote is toggled and is used
// to notify other all sidenotes to update outline rectangles
const sidenoteEvent = new Event("sidenote");
// Stores classes to be added/removed when toggling. Each key is the suffix of
// the corresponding element's class name after "sidenote-", e.g. "sidenote-space"
const toggleClasses = {
    space: {
        inline: [],
        block: ["hidden"],
    },
    content: {
        inline: ["p-1", "md:p-1.5", "rounded-md", "box-decoration-clone"],
        block: ["hidden", "3xl:block", "absolute", "p-4", "rounded-xl", "border"],
    },
    sup: {
        inline: [
            "[transition:background-color_0.2s]",
            "hover:group-hover:bg-zinc-500",
            "hover:group-hover:dark:bg-zinc-500",
        ],
        block: ["group-hover:border"],
    },
    button: {
        inline: ["hidden"],
        block: [],
    },
    "text-inline": {
        inline: [],
        block: ["hidden"],
    },
    "text-block": {
        inline: ["hidden"],
        block: [],
    },
    background: {
        inline: ["relative"],
        block: ["hidden"],
    },
};
/**
 * Toggles whether sidenote is inline or not
 * - `element`: Child of toggled sidenote
 */
function toggleInline(element) {
    // Parent sidenote element
    const sidenote = element.closest(".sidenote");
    // Prefix and suffix elements, used to adapt the text to its current context
    const prefix = sidenote.getElementsByClassName("sidenote-prefix")[0];
    const suffix = sidenote.getElementsByClassName("sidenote-suffix")[0];
    // Toggle and store the status
    sidenote.dataset.status = sidenote.dataset.status == BLOCK ? INLINE : BLOCK;
    // For each element in `toggleClasses`, add and remove respective classes
    const isInline = sidenote.dataset.status == INLINE;
    for (const [name, classes] of Object.entries(toggleClasses)) {
        const element = sidenote.getElementsByClassName(`sidenote-${name}`)[0];
        element.classList.remove(...(isInline ? classes.block : classes.inline));
        element.classList.add(...(isInline ? classes.inline : classes.block));
    }
    // Set prefix and suffix text
    prefix.textContent = isInline
        ? prefix.dataset.prefixInline
        : prefix.dataset.prefixBlock;
    suffix.textContent = isInline
        ? suffix.dataset.suffixInline
        : suffix.dataset.suffixBlock;
    // Notify other sidenotes of the change
    document.documentElement.dispatchEvent(sidenoteEvent);
}
/**
 * Updates an inline sidenote's "outline rectangles", which are multiple
 * absolutely positioned boxes used to neatly outline the sidenote
 * - `element`: Child of sidenote
 */
function updateOutline(element) {
    // Parent sidenote element
    const sidenote = element.closest(".sidenote");
    // Only applies to inline sidenotes
    if (sidenote.dataset.status != INLINE) {
        return;
    }
    // Content of sidenote
    const content = sidenote.getElementsByClassName("sidenote-content")[0];
    // Span which holds the outline rectangles
    const background = sidenote.getElementsByClassName("sidenote-background")[0];
    // Outline rectangles
    const spans = background.getElementsByTagName("span");
    // Overall content bounding box (used for right-hand border)
    const contentRect = content.getBoundingClientRect();
    background.classList.remove("hidden");
    // Original starting position of outline rects
    const backgroundRect = background.getBoundingClientRect();
    // Individual span bounding boxes, one for each line
    const rects = content.getClientRects();
    if (rects.length == 1 ||
        (rects.length == 2 && rects[0].left > rects[1].right)) {
        // Only one line or two disconnected rectangles; outline can be accomplished
        // with a simple border
        background.classList.add("hidden");
        content.classList.add("border");
    }
    else {
        background.classList.remove("hidden");
        content.classList.remove("border");
        // We'll only need the first two and last two bounding rectangles
        const edgeRects = [
            rects[0],
            rects[1],
            rects[rects.length - 2],
            rects[rects.length - 1],
        ];
        /**
         * Updates position and dimensions of a span to *span* (get it?) two
         * bounding rectangles
         * - `spanIndex`: Index of the outline rectangle
         * - `rectIndex1`: Index of rect from which to copy top left corner
         * - `rectIndex2`: Index of rect from which to copy bottom right corner
         * - `useContentEdge`: Whether to use right edge of content instead
         * - `padPx`: Number of extra pixels to extend beyond original content size
         */
        function positionSpan(spanIndex, rectIndex1, rectIndex2, useContentEdge, padPx = 1) {
            // Top left corner
            spans[spanIndex].style.top = `${edgeRects[rectIndex1].top - backgroundRect.top - padPx}px`;
            spans[spanIndex].style.left = `${edgeRects[rectIndex1].left - backgroundRect.left - padPx}px`;
            // Bottom right corner
            spans[spanIndex].style.height = `${edgeRects[rectIndex2].bottom - edgeRects[rectIndex1].top + 2 * padPx}px`;
            spans[spanIndex].style.width = `${(useContentEdge ? contentRect.right : edgeRects[rectIndex2].right) -
                edgeRects[rectIndex1].left +
                2 * padPx}px`;
        }
        // I... honestly don't know. Just tinkered with the layering until it worked
        if (rects.length > 2) {
            positionSpan(0, 1, 2, true);
            positionSpan(1, 1, 3, false);
            positionSpan(2, 0, 2, true);
            positionSpan(3, 1, 3, false, 0);
        }
        else {
            positionSpan(0, 0, 2, true);
            positionSpan(1, 1, 3, false);
            positionSpan(2, 0, 3, false);
            positionSpan(3, 1, 3, false, 0);
        }
    }
}
// Initialize sidenotes
const sidenotes = document.getElementsByClassName("sidenote");
for (const sidenote of sidenotes) {
    const button = sidenote.getElementsByClassName("sidenote-button")[0];
    const button2 = sidenote.getElementsByClassName("sidenote-button-2")[0];
    // Toggle buttons
    button.addEventListener("click", () => toggleInline(button));
    button2.addEventListener("click", () => toggleInline(button2));
    // Update outline rectangles when other sidenotes are toggled
    document.documentElement.addEventListener("sidenote", () => updateOutline(sidenote));
    // Set up initial state, which is block on large screens, invisible otherwise
    toggleInline(button);
}
if (sidenotes.length > 0) {
    // Update outlines on window resize
    window.addEventListener("resize", () => document.documentElement.dispatchEvent(sidenoteEvent));
}
