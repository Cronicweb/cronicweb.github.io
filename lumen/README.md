# Lumen

An original, fictional consumer-electronics brand site, built as a front-end
study of the **minimalist product-marketing UI/UX pattern language**:

- translucent sticky global nav that inverts over dark sections
- promo bar above the nav
- full-bleed hero "chapters" with centred headline + paired `Learn more` / `Buy` links
- 2-up rounded tile grid
- pill buttons (`border-radius: 980px`) and the 17px / 21px / 40px / 56px / 80px type scale
- horizontal snap carousel with arrow controls
- sticky-scroll storytelling section driven by `IntersectionObserver` + rAF scrub
- specs grid, comparison table, disclosure-accordion footer

## Not a clone

Everything here is invented: the brand, the products, the copy, the prices and
every piece of artwork (all hand-authored SVG). No third-party logos,
trademarks, product photography or marketing text are used or reproduced.
This studies *layout and interaction conventions*, which are not owned by
anyone, rather than copying a specific site's content.

## Stack

Plain HTML, CSS and vanilla JS. No build step, no dependencies.

```
lumen/
  index.html      home — heroes, tiles, sticky-scroll story, carousel
  phone.html      product page — colour swatches, specs, comparison table
  store.html      store — filterable product grid
  404.html
  styles.css      design tokens + all components
  app.js          nav inversion, reveal, story scrub, filters, swatches
  assets/*.svg    hand-drawn device artwork
```

## Accessibility

Skip link, landmark elements, `aria-current` on the active nav item,
`aria-pressed` on filter chips and swatches, visible focus, and a full
`prefers-reduced-motion` path that disables every transition and the scroll scrub.
