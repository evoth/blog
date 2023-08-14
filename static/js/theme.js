// Theme event, which is used to notify any elements that need to actively
// update their colors
const themeEvent = new Event("theme");
// Only two themes as of now, hence the boolean
let themeIsDark;
// Currently, the theme will initially be set to match `prefers-color-scheme`,
// but any subsequent theme changes will be permanent. In the future, a button
// to go back to the default theme would just have to remove the theme cookie.
if (localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
    themeIsDark = true;
}
else {
    document.documentElement.classList.remove("dark");
    themeIsDark = false;
}
// Root element is hidden until theme update to avoid flicker
document.documentElement.classList.remove("hidden");
// Registers theme toggle buttons
document.addEventListener("DOMContentLoaded", () => {
    const toggles = document.getElementsByClassName("theme-toggle");
    for (const toggle of toggles) {
        toggle.addEventListener("click", () => {
            // Triggers Tailwind styling
            document.documentElement.classList.toggle("dark");
            // Theme cookie
            themeIsDark = !themeIsDark;
            if (themeIsDark) {
                localStorage.theme = "dark";
            }
            else {
                localStorage.theme = "light";
            }
            // Notifies elements who listen for theme changes
            document.documentElement.dispatchEvent(themeEvent);
        });
    }
});
export {};
