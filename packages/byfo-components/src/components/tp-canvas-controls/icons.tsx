import { h } from '@stencil/core';

export const pencil = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
  </svg>
);

export const eraser = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z" />
  </svg>
);

export const undo = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
  </svg>
);

export const redo = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
  </svg>
);

export const trash = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
  </svg>
);

const scaleThickness = strokewidth => {
  if (!strokewidth) {
    return '1.25px';
  }

  if (/^\d*\.?\d+$/.test(strokewidth)) {
    //Raw number case: convert to px
    return `${strokewidth}px`;
  }
  if (/^\d*\.?\d+%$/.test(strokewidth)) {
    //Percent case: use the value to apply my built in range
    const percent = parseFloat(strokewidth.replace('%', ''));
    const min = 0.5;
    const max = 1.8;
    const value = min + (max - min) * (percent / 100);
    return `${value}px`;
  } else if (/\d*\.?\d+px/.test(strokewidth)) {
    //px case: just pass it along
    return strokewidth;
  } else {
    //Error case
    console.warn(`Invalid stroke width ${strokewidth}. Use [number], [number]px or [number]%`);
    return '0px';
  }
};

export const line = width => {
  const squiggleWidth = {
    small: '0%',
    medium: '33%',
    large: '66%',
    xlarge: '100%',
  };
  const internalStrokeWidth = scaleThickness(squiggleWidth[width]);
  return (
    <svg viewBox="0 0 12.7 12.7" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
          style={{
            'stroke-width': internalStrokeWidth,
            'fill': 'none',
            'stroke': 'var(--button-text,white)',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-dasharray': 'none',
          }}
          d="m 3.4507602,1.3291817 c 0,0 -1.6399363,1.0096969 -2.1982621,1.9554308 C 0.69417235,4.2303464 0.97622094,5.5361879 2.735047,5.0227734 4.4938731,4.5093589 6.1158339,2.7173529 7.3999636,1.8659667 8.6840932,1.0145805 10.6835,2.4905343 9.0870019,3.7191527 7.4905036,4.9477711 4.6292866,6.8339056 3.2207096,7.7578203 1.8121325,8.6817351 2.9684602,11.092467 5.1377986,9.7899345 7.3071369,8.487402 9.2235712,6.0256732 10.237256,5.5851193 11.25094,5.1445654 12.316385,6.3402137 11.451412,7.3871832 10.586439,8.4341527 9.8581997,8.1460909 8.8825123,9.559884 c -0.9756874,1.413793 0.4217596,1.94265 0.4217596,1.94265"
          id="path1679"
        />
      </g>
    </svg>
  );
};

// Raw SVGs sourced from Bootstrap Icons under the MIT License
export default {
  pencil,
  eraser,
  undo,
  redo,
  trash,
  line,
};
