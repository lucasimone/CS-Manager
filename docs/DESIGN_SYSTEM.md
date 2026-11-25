# CS-Manager design system

The application remains a standalone HTML file. Shared design tokens live at the beginning of its main stylesheet; shared component rules live at its end.

## Foundations

- Brand: primary #6f5bd5, accent #6653ce, existing selection and hover colors retained.
- Canvas: #f6f7fb light, #101622 dark.
- Surfaces: white light, #1c2636 dark.
- Semantic variables: --cs-canvas, --cs-surface, --cs-text, --cs-muted, --cs-divider, --cs-primary, --cs-field-surface, --cs-field-border.
- Spacing: 4, 8, 12, 16, 20, 24px.
- Radii: 8px control, 12px card, pill.
- Type: 12px small, 13px body, 18px section heading.
- Control height: 36px minimum for toolbar input/select.

Prefer semantic variables in new components. Theme-specific legacy palette tokens deliberately retain existing colors during migration; do not substitute them indiscriminately for semantic tokens.

## Component migration

Shared card, toolbar, badge, ghost button, page-action and section-heading foundations are introduced in this PR. Existing page-specific rules, selectors, layout, business logic and print styles are retained. This is an incremental foundation, not a complete CSS deduplication or redesign.

## Verification

Use the existing browser tests, generated screenshots and axe audit. The new browser check verifies theme-dependent surface resolution and shared card radius. Compare generated screenshots before accepting a visual change.

Port the same changes into the versioned development HTML and preserve tests when building future releases.
