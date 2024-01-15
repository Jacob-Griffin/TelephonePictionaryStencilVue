# tp-canvas

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type          | Default     |
| -------- | --------- | ----------- | ------------- | ----------- |
| `height` | `height`  |             | `number`      | `600`       |
| `hostEl` | --        |             | `HTMLElement` | `undefined` |
| `width`  | `width`   |             | `number`      | `1000`      |


## Methods

### `backupPaths() => Promise<string>`



#### Returns

Type: `Promise<string>`



### `exportDrawing() => Promise<Blob>`



#### Returns

Type: `Promise<Blob>`



### `restoreBackup(pathsString: any) => Promise<void>`



#### Parameters

| Name          | Type  | Description |
| ------------- | ----- | ----------- |
| `pathsString` | `any` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [tp-input-zone](../tp-input-zone)

### Graph
```mermaid
graph TD;
  tp-input-zone --> tp-canvas
  style tp-canvas fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
