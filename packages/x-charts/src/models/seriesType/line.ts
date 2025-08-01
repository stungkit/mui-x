import { DefaultizedProps } from '@mui/x-internals/types';
import type { StackOffsetType } from '../stacking';
import {
  CartesianSeriesType,
  CommonDefaultizedProps,
  CommonSeriesType,
  SeriesId,
  StackableSeriesType,
} from './common';
import { CurveType } from '../curve';

export interface ShowMarkParams<AxisValue = number | Date> {
  /**
   * The item index.
   */
  index: number;
  /**
   * The x coordinate in the SVG.
   */
  x: number;
  /**
   * The y coordinate in the SVG.
   */
  y: number;
  /**
   * The item position value. It likely comes from the axis `data` property.
   */
  position: AxisValue;
  /**
   * The item value. It comes from the series `data` property.
   */
  value: number;
}

export interface LineSeriesType
  extends CommonSeriesType<number | null>,
    CartesianSeriesType,
    StackableSeriesType {
  type: 'line';
  /**
   * Data associated to the line.
   */
  data?: readonly (number | null)[];
  /**
   * The key used to retrieve data from the dataset.
   */
  dataKey?: string;
  /**
   * If `true`, the series is rendered as an area instead of a line.
   */
  area?: boolean;
  /**
   * The label to display on the tooltip or the legend. It can be a string or a function.
   */
  label?: string | ((location: 'tooltip' | 'legend') => string);
  /**
   * The type of curve to use for the line.
   * Read more about curves at [line interpolation](https://mui.com/x/react-charts/lines/#interpolation).
   * @default 'monotoneX'
   */
  curve?: CurveType;
  /**
   * If `true`, step curve starts and end at the first and last point.
   * By default the line is extended to fill the space before and after.
   */
  strictStepCurve?: boolean;
  /**
   * Define which items of the series should display a mark.
   * If can be a boolean that applies to all items.
   * Or a callback that gets some item properties and returns true if the item should be displayed.
   */
  showMark?: boolean | ((params: ShowMarkParams) => boolean);
  /**
   * The shape of the mark elements.
   * Using 'circle' renders a `<circle />` element, while all other options render a `<path />` instead. The path causes a small decrease in performance.
   * @default 'circle'
   */
  shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
  /**
   * Do not render the line highlight item if set to `true`.
   * @default false
   */
  disableHighlight?: boolean;
  /**
   * If `true`, line and area connect points separated by `null` values.
   * @default false
   */
  connectNulls?: boolean;
  /**
   * Defines how stacked series handle negative values.
   * @default 'none'
   */
  stackOffset?: StackOffsetType;
  /**
   * The value of the line at the base of the series area.
   *
   * - `'min'` the area will fill the space **under** the line.
   * - `'max'` the area will fill the space **above** the line.
   * - `number` the area will fill the space between this value and the line
   *
   * @default 0
   */
  baseline?: number | 'min' | 'max';
}

/**
 * An object that allows to identify a single line.
 * Used for item interaction
 */
export type LineItemIdentifier = {
  type: 'line';
  seriesId: SeriesId;
  /**
   * `dataIndex` can be `undefined` if the mouse is over the area and not a specific item.
   */
  dataIndex?: number;
};

export interface DefaultizedLineSeriesType
  extends DefaultizedProps<LineSeriesType, CommonDefaultizedProps | 'color'> {}
