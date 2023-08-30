# Portfolio Site v2

## Plan

A content-rich personal website featuring project posts and descriptions that communicate my problem solving approach and breadth of knowledge.

## Current State

A very empty version of the site and structure.

## Todo

- Fix spacing
    - Concept shortcode
- Better responsiveness for mobile
    - Home page
        - Smaller text sizes below medium breakpoint
- Sufficient button titles (TOC and others)
- Concept framing
- Footer
- Better sidenote location cue? (gwern.net)
- Change hero color?
- Get local copy of Google fonts?
- **COMMENT AND ORGANIZE**
    - Especially partials
        - Explain input/output
        - Organize into folders
        - MODULARIZE
    - Organize layouts with partials for different sections
- ARIA, accessibility in general, Schema, OpenGraph, correct use of tags and attributes where possible (semantic HTML), good tooltips and labels, button/link titles, etc.
    - Test with accessibility tools
    - Use visibility instead of display where appropriate to match visuals with accessibility tree
- Eliminate last pseudo elements
- Correct post published/updated dates (figure out GitInfo with submodules)
- Darker zinc-300 color? Or maybe add zinc-250 and shift everything down
- Tooltip with image and domain name (or site name if it exists) like Discord
- References behavior more like TOC
- Include references on TOC?
- Heading links
- Series buttons at bottom
- Organize Tailwind mess using components and stuff
    - Reduce repeated sets of classes
- Weird glitch where there's too much padding below references until reflow
- Fix repetitive tooltip.html
- Disable SVG animation and similar for prefers-reduced-motion
- Minify CSS/JS, Tailwind classes and reformat HTML
- Bundle JS or combine into modules instead of having a bunch of separate scripts
- HTML comments (there are some on a branch but they're woefully outdated)
- Fill out different types of pages
    - Concepts
        - Should link to articles which contain them
    - Projects
        - Should link to relevant articles and have galleries, github link, etc.
    - Series and tags are pretty straightforward
    - Posts page should link/preview series, tags, concepts?, projects?
    - All should be paginated if necessary
    - Placeholders if not much content
- Just use parentheses plus dot (). instead of index if it makes it easier to read
- Add keywords to front matter just 'cause
- Add svg icon names to front matter for placeholder generation
- Repeated code between references and tooltip-- create partial for metadata generation
- Reevaluate list vs single partial organization (esp. containers)
- Fix spacing at top of post (has to do with TOC?)
- Add content