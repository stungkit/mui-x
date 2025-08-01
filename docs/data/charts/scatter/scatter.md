---
title: React Scatter chart
productId: x-charts
components: ScatterChart, ScatterChartPro, ScatterPlot, ChartsGrid, ChartsWrapper
---

# Charts - Scatter

<p class="description">Scatter charts express the relation between two variables, using points in a surface.</p>

## Basics

Scatter chart series should contain a `data` property containing an array of objects.
Those objects require the `x` and `y` properties.
With an optional `id` property if more optimization is needed.

{{"demo": "BasicScatter.js"}}

### Using a dataset

If your data is stored in an array of objects, you can use the `dataset` helper prop.
It accepts an array of objects such as `dataset={[{a: 1, b: 32, c: 873}, {a: 2, b: 41, c: 182}, ...]}`.

You can reuse this data when defining the series.
The scatter series work a bit differently than in other charts.
You need to specify the `datasetKeys` properties which is an object that requires the `x` and `y` keys.
With an optional `id` and `z` keys if needed.

{{"demo": "ScatterDataset.js"}}

## Interaction

Since scatter elements can be small, interactions do not require hovering exactly over an element.
When the pointer is in the drawing area, the closest scatter element will be used for interactions (tooltip or highlights).
To do so, the chart computes [Voronoi cells](https://en.wikipedia.org/wiki/Voronoi_diagram) which map the pointer position to the closest element.

You can define a maximal radius with the `voronoiMaxRadius` prop.
If the distance with the pointer is larger than this radius, no item will be selected.
Or set the `disableVoronoi` prop to `true` to trigger interactions only when hovering exactly over an element instead of Voronoi cells.

{{"demo": "VoronoiInteraction.js"}}

## Click event

Scatter Chart provides an `onItemClick` handler for handling clicks on specific scatter items.
It has the following signature.

```js
const onItemClick = (
  event, // The mouse event.
  params, // An object that identifies the clicked elements.
) => {};
```

{{"demo": "ScatterClick.js"}}

If `disableVoronoi=true`, users need to click precisely on the scatter element, and the mouse event will come from this element.

Otherwise, the click behavior will be the same as defined in the [interaction section](#interaction) and the mouse event will come from the svg component.

## Styling

### Color scale

As with other charts, you can modify the [series color](/x/react-charts/styling/#colors) either directly, or with the color palette.

You can also modify the color by using axes `colorMap` which maps values to colors.
The scatter charts use by priority:

1. The z-axis color
2. The y-axis color
3. The x-axis color
4. The series color

:::info
The z-axis is a third axis that allows to customize scatter points independently from their position.
It can be provided with `zAxis` props.

The value to map can either come from the `z` property of series data, or from the zAxis data.
Here are three ways to set z value to 5.

```jsx
<ScatterChart
  // First option
  series={[{ data: [{ id: 0, x: 1, y: 1, z: 5 }] }]}
  // Second option
  zAxis={[{ data: [5] }]}
  // Third option
  dataset={[{ price: 5 }]}
  zAxis={[{ dataKey: 'price' }]}
/>
```

:::

Learn more about the `colorMap` properties in the [Styling docs](/x/react-charts/styling/#values-color).

{{"demo": "ColorScale.js"}}

### Grid

You can add a grid in the background of the chart with the `grid` prop.

See [Axis—Grid](/x/react-charts/axis/#grid) documentation for more information.

{{"demo": "GridDemo.js"}}

### CSS

You can target scatter markers with the following CSS selectors:

- `[data-series='<series id>']` Selects the group containing markers of the series with the given id.
- `[data-highlighted=true]` Selects markers with highlighted state.
- `[data-faded=true]` Selects markers with faded state.

To select all marker groups, use the `scatterClasses.root` class name.

Here is an example that customizes the look of highlighted items depending on the series they belong to.

{{"demo": "ScatterCSSSelectors.js"}}

### Shape

The shape of points in a scatter chart can be customized by passing a component to the `marker` slot.

If you want the legend and tooltip to match, then you also need to customize the `labelMarkType` of each series, as shown in the example below.

{{"demo": "ScatterCustomShape.js"}}

### Size

You can customize the size of points in a scatter chart using the `markerSize` prop of every series.
For circles, the `markerSize` is the radius of the point in pixels.

{{"demo": "ScatterCustomSize.js"}}

## Plot customization

You can customize the plotting of the data in a scatter chart by providing custom components as `children` of the `ScatterChart` component.

A scatter chart's series can be accessed through the `useScatterSeries` hook.
This hook returns the order of the series and information about the series themselves, including their data points, color, etc.

See [Custom components](/x/react-charts/components/) to learn how to further customize your charts.

{{"demo": "CustomScatter.js"}}

## Composition

Use the `<ChartDataProvider />` to provide `series`, `xAxis`, and `yAxis` props for composition.

In addition to the common chart components available for [composition](/x/react-charts/composition/), you can use the `<ScatterPlot />` component that renders the scatter marks.

Here's how the Scatter Chart is composed:

```jsx
<ChartDataProvider>
  <ChartsWrapper>
    <ChartsLegend />
    <ChartsSurface>
      <ChartsAxis />
      <ChartsGrid />
      <g data-drawing-container>
        {/* Elements able to overflow the drawing area. */}
        <ScatterPlot />
      </g>
      <ChartsOverlay />
      <ChartsAxisHighlight />
    </ChartsSurface>
    <ChartsTooltip trigger="item" />
  </ChartsWrapper>
</ChartDataProvider>
```

:::info
The `data-drawing-container` indicates that children of this element should be considered part of the drawing area, even if they overflow.

See the [Composition—clipping](/x/react-charts/composition/#clipping) for more info.
:::
