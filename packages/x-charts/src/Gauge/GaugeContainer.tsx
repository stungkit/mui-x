'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { ChartsSurface, ChartsSurfaceProps } from '../ChartsSurface';
import { GaugeProvider, GaugeProviderProps } from './GaugeProvider';
import { ChartProvider } from '../context/ChartProvider';
import { MergeSignaturesProperty } from '../internals/plugins/models';
import { ChartCorePluginSignatures } from '../internals/plugins/corePlugins';
import { defaultizeMargin } from '../internals/defaultizeMargin';

export interface GaugeContainerProps
  extends Omit<ChartsSurfaceProps, 'children'>,
    Omit<
      MergeSignaturesProperty<ChartCorePluginSignatures, 'params'>,
      'series' | 'dataset' | 'colors' | 'theme' | 'experimentalFeatures'
    >,
    Omit<GaugeProviderProps, 'children'>,
    Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
  children?: React.ReactNode;
}

const GStyled = styled('g')(({ theme }) => ({
  '& text': {
    fill: (theme.vars || theme).palette.text.primary,
  },
}));

const GaugeContainer = React.forwardRef(function GaugeContainer(
  props: GaugeContainerProps,
  ref: React.Ref<SVGSVGElement>,
) {
  const {
    width: inWidth,
    height: inHeight,
    margin,
    title,
    desc,
    value,
    valueMin = 0,
    valueMax = 100,
    startAngle,
    endAngle,
    outerRadius,
    innerRadius,
    cornerRadius,
    cx,
    cy,
    children,
    ...other
  } = props;

  return (
    <ChartProvider
      pluginParams={{
        width: inWidth,
        height: inHeight,
        margin: defaultizeMargin(margin, { left: 10, right: 10, top: 10, bottom: 10 }),
      }}
      plugins={[]}
    >
      <GaugeProvider
        value={value}
        valueMin={valueMin}
        valueMax={valueMax}
        startAngle={startAngle}
        endAngle={endAngle}
        outerRadius={outerRadius}
        innerRadius={innerRadius}
        cornerRadius={cornerRadius}
        cx={cx}
        cy={cy}
      >
        <ChartsSurface
          title={title}
          desc={desc}
          role="meter"
          aria-valuenow={value === null ? undefined : value}
          aria-valuemin={valueMin}
          aria-valuemax={valueMax}
          {...other}
          ref={ref}
        >
          <GStyled aria-hidden="true">{children}</GStyled>
        </ChartsSurface>
      </GaugeProvider>
    </ChartProvider>
  );
});

GaugeContainer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  className: PropTypes.string,
  /**
   * The radius applied to arc corners (similar to border radius).
   * Set it to '50%' to get rounded arc.
   * @default 0
   */
  cornerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The x coordinate of the arc center.
   * Can be a number (in px) or a string with a percentage such as '50%'.
   * The '100%' is the width the drawing area.
   */
  cx: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The y coordinate of the arc center.
   * Can be a number (in px) or a string with a percentage such as '50%'.
   * The '100%' is the height the drawing area.
   */
  cy: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  desc: PropTypes.string,
  /**
   * The end angle (deg).
   * @default 360
   */
  endAngle: PropTypes.number,
  /**
   * The height of the chart in px. If not defined, it takes the height of the parent element.
   */
  height: PropTypes.number,
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id: PropTypes.string,
  /**
   * The radius between circle center and the beginning of the arc.
   * Can be a number (in px) or a string with a percentage such as '50%'.
   * The '100%' is the maximal radius that fit into the drawing area.
   * @default '80%'
   */
  innerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The margin between the SVG and the drawing area.
   * It's used for leaving some space for extra information such as the x- and y-axis or legend.
   *
   * Accepts a `number` to be used on all sides or an object with the optional properties: `top`, `bottom`, `left`, and `right`.
   */
  margin: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      bottom: PropTypes.number,
      left: PropTypes.number,
      right: PropTypes.number,
      top: PropTypes.number,
    }),
  ]),
  /**
   * The radius between circle center and the end of the arc.
   * Can be a number (in px) or a string with a percentage such as '50%'.
   * The '100%' is the maximal radius that fit into the drawing area.
   * @default '100%'
   */
  outerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * If `true`, animations are skipped.
   * If unset or `false`, the animations respects the user's `prefers-reduced-motion` setting.
   */
  skipAnimation: PropTypes.bool,
  /**
   * The start angle (deg).
   * @default 0
   */
  startAngle: PropTypes.number,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  title: PropTypes.string,
  /**
   * The value of the gauge.
   * Set to `null` to not display a value.
   */
  value: PropTypes.number,
  /**
   * The maximal value of the gauge.
   * @default 100
   */
  valueMax: PropTypes.number,
  /**
   * The minimal value of the gauge.
   * @default 0
   */
  valueMin: PropTypes.number,
  /**
   * The width of the chart in px. If not defined, it takes the width of the parent element.
   */
  width: PropTypes.number,
} as any;

export { GaugeContainer };
