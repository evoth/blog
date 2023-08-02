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
const sidenoteEvent = new Event("sidenote");

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

  document.documentElement.dispatchEvent(sidenoteEvent);
}

function updateBackground(target) {
  const sidenote = target.closest(".sidenote");
  if (sidenote.dataset.status != INLINE) {
    return;
  }
  const content = sidenote.getElementsByClassName("sidenote-content")[0];
  const background = sidenote.getElementsByClassName("sidenote-background")[0];
  const spans = background.getElementsByTagName("span");

  const contentRect = content.getBoundingClientRect();
  background.classList.remove("hidden");
  const backgroundRect = background.getBoundingClientRect();
  const rects = content.getClientRects();

  if (
    rects.length == 1 ||
    (rects.length == 2 && rects[0].left > rects[1].right)
  ) {
    background.classList.add("hidden");
    content.classList.add("border");
  } else {
    background.classList.remove("hidden");
    content.classList.remove("border");

    const edgeRects = [
      rects[0],
      rects[1],
      rects[rects.length - 2],
      rects[rects.length - 1],
    ];

    function positionSpan(
      spanIndex,
      rectIndex1,
      rectIndex2,
      useContentEdge,
      padPx = 1
    ) {
      spans[spanIndex].style.top = `${
        edgeRects[rectIndex1].top - backgroundRect.top - padPx
      }px`;
      spans[spanIndex].style.left = `${
        edgeRects[rectIndex1].left - backgroundRect.left - padPx
      }px`;
      spans[spanIndex].style.height = `${
        edgeRects[rectIndex2].bottom - edgeRects[rectIndex1].top + 2 * padPx
      }px`;
      spans[spanIndex].style.width = `${
        (useContentEdge ? contentRect.right : edgeRects[rectIndex2].right) -
        edgeRects[rectIndex1].left +
        2 * padPx
      }px`;
    }

    if (rects.length > 2) {
      positionSpan(0, 1, 2, true);
      positionSpan(1, 1, 3, false);
      positionSpan(2, 0, 2, true);
      positionSpan(3, 1, 3, false, 0);
    } else {
      positionSpan(0, 0, 2, true);
      positionSpan(1, 1, 3, false);
      positionSpan(2, 0, 3, false);
      positionSpan(3, 1, 3, false, 0);
    }
  }
}

const sidenotes = document.getElementsByClassName("sidenote");
for (const sidenote of sidenotes) {
  const button = sidenote.getElementsByClassName("sidenote-button")[0];
  const button2 = sidenote.getElementsByClassName("sidenote-button-2")[0];
  button.addEventListener("click", (event) => toggleInline(event.target));
  button2.addEventListener("click", (event) => toggleInline(event.target));
  document.documentElement.addEventListener("sidenote", () =>
    updateBackground(sidenote)
  );
  toggleInline(button);
}
if (sidenotes.length > 0) {
  window.addEventListener("resize", () =>
    document.documentElement.dispatchEvent(sidenoteEvent)
  );
}
