/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface TpCanvas {
        "exportDrawing": () => Promise<unknown>;
        "height": number;
        "hostEl": HTMLElement;
        "width": number;
    }
    interface TpCanvasControls {
        "hostEl": HTMLElement;
    }
    interface TpContent {
        "content": string;
        "type": string;
    }
    interface TpIconFillSquiggle {
    }
    interface TpInputZone {
        "buttonColor": string;
        "round": number;
        "selectedColor": string;
    }
    interface TpTimer {
        "endtime": number;
    }
}
declare global {
    interface HTMLTpCanvasElement extends Components.TpCanvas, HTMLStencilElement {
    }
    var HTMLTpCanvasElement: {
        prototype: HTMLTpCanvasElement;
        new (): HTMLTpCanvasElement;
    };
    interface HTMLTpCanvasControlsElement extends Components.TpCanvasControls, HTMLStencilElement {
    }
    var HTMLTpCanvasControlsElement: {
        prototype: HTMLTpCanvasControlsElement;
        new (): HTMLTpCanvasControlsElement;
    };
    interface HTMLTpContentElement extends Components.TpContent, HTMLStencilElement {
    }
    var HTMLTpContentElement: {
        prototype: HTMLTpContentElement;
        new (): HTMLTpContentElement;
    };
    interface HTMLTpIconFillSquiggleElement extends Components.TpIconFillSquiggle, HTMLStencilElement {
    }
    var HTMLTpIconFillSquiggleElement: {
        prototype: HTMLTpIconFillSquiggleElement;
        new (): HTMLTpIconFillSquiggleElement;
    };
    interface HTMLTpInputZoneElement extends Components.TpInputZone, HTMLStencilElement {
    }
    var HTMLTpInputZoneElement: {
        prototype: HTMLTpInputZoneElement;
        new (): HTMLTpInputZoneElement;
    };
    interface HTMLTpTimerElement extends Components.TpTimer, HTMLStencilElement {
    }
    var HTMLTpTimerElement: {
        prototype: HTMLTpTimerElement;
        new (): HTMLTpTimerElement;
    };
    interface HTMLElementTagNameMap {
        "tp-canvas": HTMLTpCanvasElement;
        "tp-canvas-controls": HTMLTpCanvasControlsElement;
        "tp-content": HTMLTpContentElement;
        "tp-icon-fill-squiggle": HTMLTpIconFillSquiggleElement;
        "tp-input-zone": HTMLTpInputZoneElement;
        "tp-timer": HTMLTpTimerElement;
    }
}
declare namespace LocalJSX {
    interface TpCanvas {
        "height"?: number;
        "hostEl"?: HTMLElement;
        "width"?: number;
    }
    interface TpCanvasControls {
        "hostEl"?: HTMLElement;
    }
    interface TpContent {
        "content"?: string;
        "type"?: string;
    }
    interface TpIconFillSquiggle {
    }
    interface TpInputZone {
        "buttonColor"?: string;
        "round"?: number;
        "selectedColor"?: string;
    }
    interface TpTimer {
        "endtime"?: number;
    }
    interface IntrinsicElements {
        "tp-canvas": TpCanvas;
        "tp-canvas-controls": TpCanvasControls;
        "tp-content": TpContent;
        "tp-icon-fill-squiggle": TpIconFillSquiggle;
        "tp-input-zone": TpInputZone;
        "tp-timer": TpTimer;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "tp-canvas": LocalJSX.TpCanvas & JSXBase.HTMLAttributes<HTMLTpCanvasElement>;
            "tp-canvas-controls": LocalJSX.TpCanvasControls & JSXBase.HTMLAttributes<HTMLTpCanvasControlsElement>;
            "tp-content": LocalJSX.TpContent & JSXBase.HTMLAttributes<HTMLTpContentElement>;
            "tp-icon-fill-squiggle": LocalJSX.TpIconFillSquiggle & JSXBase.HTMLAttributes<HTMLTpIconFillSquiggleElement>;
            "tp-input-zone": LocalJSX.TpInputZone & JSXBase.HTMLAttributes<HTMLTpInputZoneElement>;
            "tp-timer": LocalJSX.TpTimer & JSXBase.HTMLAttributes<HTMLTpTimerElement>;
        }
    }
}
