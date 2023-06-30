const themeEvent = new Event("theme");
let themeIsDark;

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
    themeIsDark = true;
} else {
    document.documentElement.classList.remove('dark')
    themeIsDark = false;
}

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    toggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        themeIsDark = !themeIsDark;
        if (themeIsDark) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        };
        document.documentElement.dispatchEvent(themeEvent);
    });
});