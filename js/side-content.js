// Div that holds the actual text of the post
const articleContent = document.getElementById("content");
if (articleContent) {
    // Div that holds entire article; includes padding which will be respected by
    // side content
    const inner = document.getElementById("article");
    // An outer div that constrains itself to the maximum extent of side content
    const outer = document.getElementById("side-content-border");
    /**
     * Updates CSS vars to reflect side content offsets and width
     */
    function updateSidenoteVars() {
        const innerBoundingRect = inner.getBoundingClientRect();
        const outerBoundingRect = outer.getBoundingClientRect();
        const contentBoundingRect = articleContent.getBoundingClientRect();
        const offsetLeft = outerBoundingRect.left - contentBoundingRect.left;
        const offsetRight = innerBoundingRect.right - contentBoundingRect.left;
        const maxWidth = outerBoundingRect.right - innerBoundingRect.right;
        inner.style.setProperty("--side-content-offset-left", `${offsetLeft}px`);
        inner.style.setProperty("--side-content-offset-right", `${offsetRight}px`);
        inner.style.setProperty("--side-content-max-width", `${maxWidth}px`);
    }
    updateSidenoteVars();
    window.addEventListener("resize", updateSidenoteVars);
}
export {};
