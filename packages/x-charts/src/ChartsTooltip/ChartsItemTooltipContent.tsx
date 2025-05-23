'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import { ChartsTooltipClasses, useUtilityClasses } from './chartsTooltipClasses';
import { useInternalItemTooltip } from './useItemTooltip';
import {
  ChartsTooltipCell,
  ChartsTooltipPaper,
  ChartsTooltipRow,
  ChartsTooltipTable,
} from './ChartsTooltipTable';
import { ChartsLabelMark } from '../ChartsLabel/ChartsLabelMark';

export interface ChartsItemTooltipContentProps {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ChartsTooltipClasses>;
  sx?: SxProps<Theme>;
}

function ChartsItemTooltipContent(props: ChartsItemTooltipContentProps) {
  const { classes: propClasses, sx } = props;
  const tooltipData = useInternalItemTooltip();

  const classes = useUtilityClasses(propClasses);

  if (!tooltipData) {
    return null;
  }

  if ('values' in tooltipData) {
    const { label: seriesLabel, color, markType } = tooltipData;
    return (
      <ChartsTooltipPaper sx={sx} className={classes.paper}>
        <ChartsTooltipTable className={classes.table}>
          <Typography component="caption">
            <div className={classes.markContainer}>
              <ChartsLabelMark type={markType} color={color} className={classes.mark} />
            </div>
            {seriesLabel}
          </Typography>
          <tbody>
            {tooltipData.values.map(({ formattedValue, label }) => (
              <ChartsTooltipRow key={label} className={classes.row}>
                <ChartsTooltipCell className={clsx(classes.labelCell, classes.cell)} component="th">
                  {label}
                </ChartsTooltipCell>
                <ChartsTooltipCell className={clsx(classes.valueCell, classes.cell)} component="td">
                  {formattedValue}
                </ChartsTooltipCell>
              </ChartsTooltipRow>
            ))}
          </tbody>
        </ChartsTooltipTable>
      </ChartsTooltipPaper>
    );
  }

  const { color, label, formattedValue, markType } = tooltipData;

  return (
    <ChartsTooltipPaper sx={sx} className={classes.paper}>
      <ChartsTooltipTable className={classes.table}>
        <tbody>
          <ChartsTooltipRow className={classes.row}>
            <ChartsTooltipCell className={clsx(classes.labelCell, classes.cell)} component="th">
              <div className={classes.markContainer}>
                <ChartsLabelMark type={markType} color={color} className={classes.mark} />
              </div>
              {label}
            </ChartsTooltipCell>
            <ChartsTooltipCell className={clsx(classes.valueCell, classes.cell)} component="td">
              {formattedValue}
            </ChartsTooltipCell>
          </ChartsTooltipRow>
        </tbody>
      </ChartsTooltipTable>
    </ChartsTooltipPaper>
  );
}

ChartsItemTooltipContent.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { ChartsItemTooltipContent };
