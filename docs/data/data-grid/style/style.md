# Data Grid - Styling

<p class="description">The grid CSS can be easily overwritten.</p>

## Using the `sx` prop

For one-off styles, the `sx` prop can be used.
It allows to apply simple to complex customizations directly onto the Data Grid element.
The keys accepted can be any CSS property as well as the custom properties provided by MUI.
For more details, visit the [`sx` prop page](/system/getting-started/the-sx-prop/).

```tsx
<DataGrid sx={{ m: 2 }} /> // Sets the margin to 2 times the spacing unit = 16px
```

{{"demo": "SxProp.js", "bg": "inline"}}

## Styling column headers

The `GridColDef` type has properties to apply class names and custom CSS on the header.

- `headerClassName`: to apply class names into the column header. It can also be a function, which is called with a `GridColumnHeaderParams` object.
- `headerAlign`: to align the content of the header. It must be 'left' | 'right' | 'center'.

```tsx
const columns: GridColDef[] = [
  {
    field: 'first',
    headerClassName: 'super-app-theme--header',
    headerAlign: 'center',
  },
  {
    field: 'last',
    headerClassName: 'super-app-theme--header',
    headerAlign: 'center',
  },
];
```

{{"demo": "StylingHeaderGrid.js", "bg": "inline"}}

## Styling rows

The `getRowClassName` prop can be used to apply a custom CSS class on each row. It's called with a `GridRowParams` object and must return a string. Sometimes it might be needed to override the existing rules using higher specificity CSS selectors.

```tsx
interface GridRowParams<R extends GridRowModel = GridRowModel> {
  /**
   * The grid row id.
   */
  id: GridRowId;
  /**
   * The row model of the row that the current cell belongs to.
   */
  row: R;
  /**
   * All grid columns.
   */
  columns: GridColDef[];
}
```

{{"demo": "StylingRowsGrid.js", "bg": "inline"}}

## Styling cells

There are multiple ways to apply a custom CSS class on a cell.

1. Using the`cellClassName` property of `GridColDef`:

This property allows to set a CSS class that is applied on every cell of the column it was defined.
It can also be a function, which is called with a `GridCellParams` object.

```tsx
const columns: GridColDef[] = [
  {
    field: 'name',
    cellClassName: 'super-app-theme--cell',
  },
  {
    field: 'score',
    type: 'number',
    cellClassName: (params: GridCellParams<number>) =>
      clsx('super-app', {
        negative: params.value < 0,
        positive: params.value > 0,
      }),
  },
];
```

{{"demo": "StylingCellsGrid.js", "bg": "inline", "defaultCodeOpen": false}}

2. Using the `getCellClassName` prop:

This prop is called for every cell in every column.
Different from the first option, this prop is defined at the Data Grid level, not column level.
It is also called with a `GridCellParams` object.

{{"demo": "StylingAllCells.js", "bg": "inline"}}

## Cell alignment

Use the `align` property in `GridColDef` to change the alignment of content of the cells.
Choose between one of the following values: 'left' | 'right' | 'center'.

:::warning
You must use `headerAlign` to align the content of the header.
:::

## Striped rows

You can use the `indexRelativeToCurrentPage` param passed to `getRowClassName` to apply alternating styles to the rows.

The following demo illustrates how this can be achieved.

{{"demo": "StripedGrid.js", "bg": "inline"}}

## Container, header, and pinned sections

By default, the Data Grid uses the Material UI `theme.palette.background.default` color for the background color of the grid container, the column headers, and the pinned rows and columns.

You can override these background colors with the following theme configuration:

```tsx
import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

const theme = createTheme({
  palette: {
    DataGrid: {
      // Container background
      bg: '#f8fafc',
      // Pinned rows and columns background
      pinnedBg: '#f1f5f9',
      // Column header background
      headerBg: '#eaeff5',
    },
  },
});
```

### Light and dark mode in Material UI v6

Material UI v6 users can use the `colorSchemes` property to specify different colors for light and dark mode:

```tsx
import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        DataGrid: {
          bg: '#f8fafc',
          pinnedBg: '#f1f5f9',
          headerBg: '#eaeff5',
        },
      },
    },
    dark: {
      palette: {
        DataGrid: {
          bg: '#334155',
          pinnedBg: '#293548',
          headerBg: '#1e293b',
        },
      },
    },
  },
});
```

### Light and dark mode in Material UI v5

Material UI v5 supports specifying different colors for light and dark mode with two different themes, as shown in the demo below.

{{"demo": "BackgroundColorsGrid.js", "bg": "inline", "defaultCodeOpen": false}}

## Custom theme

The following demo leverages the CSS customization API to match the Ant Design specification.

{{"demo": "AntDesignGrid.js", "defaultCodeOpen": false}}

## API

- [DataGrid](/x/api/data-grid/data-grid/)
- [DataGridPro](/x/api/data-grid/data-grid-pro/)
- [DataGridPremium](/x/api/data-grid/data-grid-premium/)
