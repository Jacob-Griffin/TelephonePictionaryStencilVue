# CSS Vars Usage

## --image-background

- The background image of the whole site. Image backgroud prioritized

## --color-background

- Modal background
- Fallback background for the whole site

## --color-button, --color-button-hover, --color-button-disabled

- All buttons background
  - Including within tp-canvas-controls, tp-input-zone, and tp-review-chat

## --color-important

- Clear canvas buttons background

## --color-button-text

- All buttons
- All text that appears on the brand color

## --color-brand

- Header
  - Including the standalone settings button on the home page
- Footer
- Settings toggled "on"
- Outline of focused inputs

## --color-link, --color-link-hover

- ... links

## --color-text

- _Most_ text
- Modal close button

## --color-backdrop

- background color for some components:
  - Player list (lobby, waiting between rounds)
  - Some text that isn't very readable on some backgrounds

## --color-backdrop-text

- Text that appears on top of the backdrop color

## --optional-text-backdrop

- Intermediate variable to determine if a backdrop color is needed or not
  - should be --color-backdrop if the background is busy, or otherwise not set
  - Some text _really_ needs a backdrop and this gets overridden to --color-backdrop

## --icon, --small-icon

- The asset path for icon images

## --scroll-color

- The actual grabby bit of the scrollbar

## --color-border

- Modal borders

## --color-heading

- Heading color on modals specifically?? (maybe this isn't necessary??)

## --color-toggle-handle

- The color of the circular handle on settings toggles

## --color-light-border

- border colors in components (is this an error?)

## --selector-backdrop

- Dark themed "no stack selected" text

## --chat-text, --chat-bubble,

- Review chat bubbles

## --chat-from-text, --chat-from-backdrop

- Review chat name tags

# Location-first order

## Main.css

### buttons

- Background color (--color-button)
- Background color hover (--color-button-hover)
- Background color disabled (--color-button-disabled)

### text inputs

- Outline Focused (--color-brand)

### links

- Text color (--color-link)
- Text color hover (--color-link-hover)

### body

- Text color (--color-text)
- Background (--image-background, fallback to --color-background)

### icon

- The icon asset (--icon)
- The small icon asset (--small-icon)

### scrollbars

- color (--scroll-color)

## Modal.css

### full modal body

- Background color (--color-background)
- Border-color (--color-border)

### Heading

- color (--color-heading)

### close button

- color (--color-text)

## Utility.css

### player lists

- background color (--color-back*drop*)
- color (--color-backdrop-text)

### optionally needs backdrop

- background color (--optional-text-backdrop)
  - this gets set to --color-backdrop with "really"

### toggles

- "on" color (--color-brand)
- The circle (--color-toggle-handle)

## App.vue

### The settings button and header

- background color (--color-brand)
- text color (including icon) (--color-button-text)

## Gameplay.vue

### the button that lines you up with the canvas

- text color (--color-button-text)
- background-color (--color-button)

## HomeView.vue

### footer

- background color (--color-brand)
- text color (--color-button-text)

## Review.vue

### No stack selected text

- background color (--color-backdrop)
- (dark only??) background color (--selector-backdrop) (this does not exist, what?)

## BYFO Components

### tp-canvas

- border color (--color-light-border)

### tp-canvas-controls

- Plenty of internal spacing variables (not in theme consideration)
- Standard button styling (--color-button, --color-button-text, --color-button-hover, --color-button-disabled)
- Clear buttons (--color-important)

### tp-content

- image border (--color-light-border)
- text content (--color-text, --color-backdrop)

### tp-input-zone

- Standard button styling (--color-button, --color-button-text, --color-button-hover, --color-button-disabled)
- Text inputs (--color-light-border, --color-input-text, --color-input-background)

### tp-review-chat

- Full review component box background color (--chat-background)
- text color (--chat-text)
- chat bubble background color (--chat-bubble)
- From bubble (--chat-from-backdrop, --chat-from-text)
- Standard button styling (--color-button, --color-button-text, --color-button-hover, --color-button-disabled)
- text and link (--color-link, --color-link-hover, --color-text)

### byfo-icon

- icon color (--color-text)

### tp-info-bubble

- text (--color-text)
- background (--color-backdrop)
