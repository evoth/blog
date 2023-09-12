/**
 * Unpauses SVG animation if not already animating; continues animation otherwise
 */
function cardEnter(svg) {
    // Increments counter to cancel any pausing queued previously
    svg.dataset.counter = String(Number(svg.dataset.counter ?? 0) + 1);
    // Unpauses animations
    svg.unpauseAnimations();
}
/**
 * Pauses SVG animation, waiting until looping point if necessary
 */
function cardLeave(svg) {
    const counter = svg.dataset.counter ?? "0";
    // If loopSeconds is not specified, pause immediately
    if (!svg.dataset.loopSeconds) {
        svg.pauseAnimations();
        return;
    }
    // If loopSeconds is specified, wait until multiple of loopSeconds to pause.
    const loopSeconds = Number(svg.dataset.loopSeconds);
    const loopOffset = Number(svg.dataset.loopOffset ?? 0);
    const pauseTime = loopSeconds * Math.ceil(svg.getCurrentTime() / loopSeconds) + loopOffset;
    const delay = pauseTime - svg.getCurrentTime();
    // Pauses after delay, unless counter has changed (another mouseenter event)
    setTimeout(function () {
        if (svg.dataset.counter != counter)
            return;
        svg.pauseAnimations();
        svg.setCurrentTime(pauseTime);
    }, delay * 1000);
}
// Adds event listeners to cards that have svg thumbnails
const svgs = document.getElementsByClassName("card-svg-thumb");
for (const svg of svgs) {
    svg.pauseAnimations();
    let startTime = Number(svg.dataset.loopOffset ?? 0);
    if (startTime < 0) {
        startTime += Number(svg.dataset.loopSeconds);
    }
    svg.setCurrentTime(startTime);
    const freezeElements = svg.getElementsByClassName("svg-freeze");
    for (const freeze of freezeElements) {
        freeze.style.display = "inline";
    }
    const card = svg.closest(".card");
    card.addEventListener("mouseenter", () => cardEnter(svg));
    card.addEventListener("mouseleave", () => cardLeave(svg));
}
export {};
