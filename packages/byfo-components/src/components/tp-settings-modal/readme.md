# tp-settings-modal



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute       | Description | Type                                            | Default     |
| ----------- | --------------- | ----------- | ----------------------------------------------- | ----------- |
| `buildDate` | --              |             | `{ year: string; full?: string; date?: Date; }` | `undefined` |
| `enabled`   | `modal-enabled` |             | `boolean`                                       | `undefined` |
| `store`     | --              |             | `TPStore`                                       | `undefined` |


## Dependencies

### Depends on

- [tp-info-bubble](../tp-info-bubble)
- [tp-icon](../tp-icon)

### Graph
```mermaid
graph TD;
  tp-settings-modal --> tp-info-bubble
  tp-settings-modal --> tp-icon
  tp-info-bubble --> tp-icon
  style tp-settings-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
