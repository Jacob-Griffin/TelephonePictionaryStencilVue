# BYFO Components
Component Library capturing some initial work on the online telephone pictionary app, [blowyourfaceoff.com](https://blowyourfaceoff.com). Provides the component and logic structure for the bare minimum gameplay

## The Components

### Content (tp-content)

Represents 1 card in a stack. Displays text or an image based on the content and content type passed in.

### Input Zone

A wrapper that manages placement and events for the drawing-step components. Contains:

> ### Canvas (tp-canvas)
>
> The canvas element. Also holds a bunch of logic for drawing events.
>
> ### Canvas Controls (tp-canvas-controls)
>
> The buttons controlling canvas tools (Draw/Erase, Clear, Pen size, etc).

### Timer

A basic countdown timer that emits a tp-submitted event on completion. Based on an end time that's passed in

## Tree
```
tp-content
tp-input-zone
    -> tp-canvas
    -> tp-canvas-controls
tp-timer
```