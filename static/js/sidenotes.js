const articleContent = document.getElementById("content");
if (articleContent) {
  const inner = document.getElementById("article");
  const outer = document.getElementById("sidenote-border");

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

const INLINE = "inline";
const BLOCK = "block";

const toggleClasses = {
  space: {
    inline: [],
    block: ["hidden"],
  },
  content: {
    inline: [
      "p-1",
      "md:p-1.5",
      "rounded-md",
      "box-decoration-clone",
      "[transition:background-color_0.2s]",
    ],
    block: [
      "hidden",
      "3xl:block",
      "absolute",
      "p-4",
      "rounded-xl",
      "border",
      "[transition:background-color_0.2s,border_0.2s]",
    ],
  },
  sup: {
    inline: ["[transition:background-color_0.2s]"],
    block: [
      "group-hover:border",
      "[transition:background-color_0.2s,border_0.2s]",
    ],
  },
  "button-2": {
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
};

function toggleInline(target) {
  const sidenote = target.closest(".sidenote");
  const prefix = sidenote.getElementsByClassName("sidenote-prefix")[0];
  const suffix = sidenote.getElementsByClassName("sidenote-suffix")[0];

  sidenote.dataset.status = sidenote.dataset.status == BLOCK ? INLINE : BLOCK;

  if (sidenote.dataset.status == INLINE) {
    for (const [name, classes] of Object.entries(toggleClasses)) {
      const element = sidenote.getElementsByClassName(`sidenote-${name}`)[0];
      element.classList.remove(...classes.block);
      element.classList.add(...classes.inline);
    }

    prefix.textContent = prefix.dataset.prefixInline;
    suffix.textContent = suffix.dataset.suffixInline;
  } else {
    for (const [name, classes] of Object.entries(toggleClasses)) {
      const element = sidenote.getElementsByClassName(`sidenote-${name}`)[0];
      element.classList.remove(...classes.inline);
      element.classList.add(...classes.block);
    }

    prefix.textContent = prefix.dataset.prefixBlock;
    suffix.textContent = suffix.dataset.suffixBlock;
  }
}

const sidenotes = document.getElementsByClassName("sidenote");
for (const sidenote of sidenotes) {
  const button = sidenote.getElementsByClassName("sidenote-button")[0];
  const button2 = sidenote.getElementsByClassName("sidenote-button-2")[0];
  button.addEventListener("click", (event) => toggleInline(event.target));
  button2.addEventListener("click", (event) => toggleInline(event.target));
  toggleInline(button);
}
