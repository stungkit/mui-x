'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import refType from '@mui/utils/refType';
import resolveComponentProps from '@mui/utils/resolveComponentProps';
import {
  DIALOG_WIDTH,
  PickerRangeValue,
  PickerRendererInterceptorProps,
  PickerViewRendererLookup,
  resolveTimeFormat,
  TimeViewWithMeridiem,
  VIEW_HEIGHT,
} from '@mui/x-date-pickers/internals';
import {
  multiSectionDigitalClockClasses,
  multiSectionDigitalClockSectionClasses,
} from '@mui/x-date-pickers/MultiSectionDigitalClock';
import { digitalClockClasses } from '@mui/x-date-pickers/DigitalClock';
import {
  renderDigitalClockTimeView,
  renderMultiSectionDigitalClockTimeView,
} from '@mui/x-date-pickers/timeViewRenderers';
import { extractValidationProps } from '@mui/x-date-pickers/validation';
import { PickerOwnerState } from '@mui/x-date-pickers/models';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import { rangeValueManager } from '../internals/utils/valueManagers';
import { MobileTimeRangePickerProps } from './MobileTimeRangePicker.types';
import { useTimeRangePickerDefaultizedProps } from '../TimeRangePicker/shared';
import { SingleInputTimeRangeField } from '../SingleInputTimeRangeField';
import { useMobileRangePicker } from '../internals/hooks/useMobileRangePicker';
import { validateTimeRange } from '../validation/validateTimeRange';
import { RANGE_VIEW_HEIGHT } from '../internals/constants/dimensions';
import { TimeRangePickerTimeWrapper } from '../TimeRangePicker/TimeRangePickerTimeWrapper';
import { PickerRangeStep } from '../internals/utils/createRangePickerStepNavigation';

const STEPS: PickerRangeStep[] = [
  { views: null, rangePosition: 'start' },
  { views: null, rangePosition: 'end' },
];

const rendererInterceptor = function rendererInterceptor(
  props: PickerRendererInterceptorProps<PickerRangeValue, TimeViewWithMeridiem, any>,
) {
  const { viewRenderers, popperView, rendererProps } = props;
  const finalProps = {
    ...rendererProps,
    sx: [
      {
        width: DIALOG_WIDTH,
        [`.${multiSectionDigitalClockSectionClasses.root}`]: {
          flex: 1,
          // account for the border on `MultiSectionDigitalClock`
          maxHeight: VIEW_HEIGHT - 1,
          [`.${multiSectionDigitalClockSectionClasses.item}`]: {
            width: 'auto',
          },
        },
        [`&.${digitalClockClasses.root}`]: {
          maxHeight: RANGE_VIEW_HEIGHT,
          [`.${digitalClockClasses.item}`]: {
            justifyContent: 'center',
          },
        },
        [`&.${multiSectionDigitalClockClasses.root}, .${multiSectionDigitalClockSectionClasses.root}`]:
          {
            maxHeight: RANGE_VIEW_HEIGHT - 1,
          },
      },
    ],
  };
  const viewRenderer = viewRenderers[popperView];
  if (!viewRenderer) {
    return null;
  }
  return <TimeRangePickerTimeWrapper {...finalProps} viewRenderer={viewRenderer} />;
};

type MobileTimeRangePickerComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(
  props: MobileTimeRangePickerProps<TEnableAccessibleFieldDOMStructure> &
    React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { propTypes?: any };

const MobileTimeRangePicker = React.forwardRef(function MobileTimeRangePicker<
  TEnableAccessibleFieldDOMStructure extends boolean = true,
>(
  inProps: MobileTimeRangePickerProps<TEnableAccessibleFieldDOMStructure>,
  ref: React.Ref<HTMLDivElement>,
) {
  const adapter = usePickerAdapter();

  // Props with the default values common to all time range pickers
  const defaultizedProps = useTimeRangePickerDefaultizedProps<
    MobileTimeRangePickerProps<TEnableAccessibleFieldDOMStructure>
  >(inProps, 'MuiMobileTimeRangePicker');

  const renderTimeView = defaultizedProps.shouldRenderTimeInASingleColumn
    ? renderDigitalClockTimeView
    : renderMultiSectionDigitalClockTimeView;

  const viewRenderers: PickerViewRendererLookup<any, TimeViewWithMeridiem, any> = {
    hours: renderTimeView,
    minutes: renderTimeView,
    seconds: renderTimeView,
    meridiem: renderTimeView,
    ...defaultizedProps.viewRenderers,
  };

  const props = {
    ...defaultizedProps,
    ampmInClock: true,
    viewRenderers,
    format: resolveTimeFormat(adapter, defaultizedProps),
    slots: {
      field: SingleInputTimeRangeField,
      ...defaultizedProps.slots,
    },
    slotProps: {
      ...defaultizedProps.slotProps,
      field: (ownerState: PickerOwnerState) => ({
        ...resolveComponentProps(defaultizedProps.slotProps?.field, ownerState),
        ...extractValidationProps(defaultizedProps),
      }),
      tabs: {
        hidden: false,
        ...defaultizedProps.slotProps?.tabs,
      },
      toolbar: {
        hidden: false,
        ...defaultizedProps.slotProps?.toolbar,
      },
    },
  };

  const { renderPicker } = useMobileRangePicker<
    TimeViewWithMeridiem,
    TEnableAccessibleFieldDOMStructure,
    typeof props
  >({
    ref,
    props,
    valueManager: rangeValueManager,
    valueType: 'time',
    validator: validateTimeRange,
    rendererInterceptor,
    steps: STEPS,
  });

  return renderPicker();
}) as MobileTimeRangePickerComponent;

MobileTimeRangePicker.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * 12h/24h view for hour selection clock.
   * @default adapter.is12HourCycleInCurrentLocale()
   */
  ampm: PropTypes.bool,
  /**
   * If `true`, the main element is focused during the first mount.
   * This main element is:
   * - the element chosen by the visible view if any (i.e: the selected day on the `day` view).
   * - the `input` element if there is a field rendered.
   */
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  /**
   * If `true`, the Picker will close after submitting the full date.
   * @default false
   */
  closeOnSelect: PropTypes.bool,
  /**
   * The initial position in the edited date range.
   * Used when the component is not controlled.
   * @default 'start'
   */
  defaultRangePosition: PropTypes.oneOf(['end', 'start']),
  /**
   * The default value.
   * Used when the component is not controlled.
   */
  defaultValue: PropTypes.arrayOf(PropTypes.object),
  /**
   * If `true`, the component is disabled.
   * When disabled, the value cannot be changed and no interaction is possible.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, disable values after the current date for date components, time for time components and both for date time components.
   * @default false
   */
  disableFuture: PropTypes.bool,
  /**
   * Do not ignore date part when validating min/max time.
   * @default false
   */
  disableIgnoringDatePartForTimeValidation: PropTypes.bool,
  /**
   * If `true`, the button to open the Picker will not be rendered (it will only render the field).
   * @deprecated Use the [field component](https://mui.com/x/react-date-pickers/fields/) instead.
   * @default false
   */
  disableOpenPicker: PropTypes.bool,
  /**
   * If `true`, disable values before the current date for date components, time for time components and both for date time components.
   * @default false
   */
  disablePast: PropTypes.bool,
  /**
   * @default true
   */
  enableAccessibleFieldDOMStructure: PropTypes.any,
  /**
   * Format of the date when rendered in the input(s).
   * Defaults to localized format based on the used `views`.
   */
  format: PropTypes.string,
  /**
   * Density of the format when rendered in the input.
   * Setting `formatDensity` to `"spacious"` will add a space before and after each `/`, `-` and `.` character.
   * @default "dense"
   */
  formatDensity: PropTypes.oneOf(['dense', 'spacious']),
  /**
   * Pass a ref to the `input` element.
   */
  inputRef: refType,
  /**
   * The label content.
   */
  label: PropTypes.node,
  /**
   * Locale for components texts.
   * Allows overriding texts coming from `LocalizationProvider` and `theme`.
   */
  localeText: PropTypes.object,
  /**
   * Maximal selectable time.
   * The date part of the object will be ignored unless `props.disableIgnoringDatePartForTimeValidation === true`.
   */
  maxTime: PropTypes.object,
  /**
   * Minimal selectable time.
   * The date part of the object will be ignored unless `props.disableIgnoringDatePartForTimeValidation === true`.
   */
  minTime: PropTypes.object,
  /**
   * Step over minutes.
   * @default 1
   */
  minutesStep: PropTypes.number,
  /**
   * Name attribute used by the `input` element in the Field.
   */
  name: PropTypes.string,
  /**
   * Callback fired when the value is accepted.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @param {TValue} value The value that was just accepted.
   * @param {FieldChangeHandlerContext<TError>} context The context containing the validation result of the current value.
   */
  onAccept: PropTypes.func,
  /**
   * Callback fired when the value changes.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @param {TValue} value The new value.
   * @param {FieldChangeHandlerContext<TError>} context The context containing the validation result of the current value.
   */
  onChange: PropTypes.func,
  /**
   * Callback fired when the popup requests to be closed.
   * Use in controlled mode (see `open`).
   */
  onClose: PropTypes.func,
  /**
   * Callback fired when the error associated with the current value changes.
   * When a validation error is detected, the `error` parameter contains a non-null value.
   * This can be used to render an appropriate form error.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @param {TError} error The reason why the current value is not valid.
   * @param {TValue} value The value associated with the error.
   */
  onError: PropTypes.func,
  /**
   * Callback fired when the popup requests to be opened.
   * Use in controlled mode (see `open`).
   */
  onOpen: PropTypes.func,
  /**
   * Callback fired when the range position changes.
   * @param {RangePosition} rangePosition The new range position.
   */
  onRangePositionChange: PropTypes.func,
  /**
   * Callback fired when the selected sections change.
   * @param {FieldSelectedSections} newValue The new selected sections.
   */
  onSelectedSectionsChange: PropTypes.func,
  /**
   * Callback fired on view change.
   * @template TView Type of the view. It will vary based on the Picker type and the `views` it uses.
   * @param {TView} view The new view.
   */
  onViewChange: PropTypes.func,
  /**
   * Control the popup or dialog open state.
   * @default false
   */
  open: PropTypes.bool,
  /**
   * The default visible view.
   * Used when the component view is not controlled.
   * Must be a valid option from `views` list.
   */
  openTo: PropTypes.oneOf(['hours', 'minutes', 'seconds']),
  /**
   * The position in the currently edited date range.
   * Used when the component position is controlled.
   */
  rangePosition: PropTypes.oneOf(['end', 'start']),
  /**
   * If `true`, the component is read-only.
   * When read-only, the value cannot be changed but the user can interact with the interface.
   * @default false
   */
  readOnly: PropTypes.bool,
  /**
   * If `true`, disable heavy animations.
   * @default `@media(prefers-reduced-motion: reduce)` || `navigator.userAgent` matches Android <10 or iOS <13
   */
  reduceAnimations: PropTypes.bool,
  /**
   * The date used to generate the new value when both `value` and `defaultValue` are empty.
   * @default The closest valid date-time using the validation props, except callbacks like `shouldDisable<...>`.
   */
  referenceDate: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
  /**
   * The currently selected sections.
   * This prop accepts four formats:
   * 1. If a number is provided, the section at this index will be selected.
   * 2. If a string of type `FieldSectionType` is provided, the first section with that name will be selected.
   * 3. If `"all"` is provided, all the sections will be selected.
   * 4. If `null` is provided, no section will be selected.
   * If not provided, the selected sections will be handled internally.
   */
  selectedSections: PropTypes.oneOfType([
    PropTypes.oneOf([
      'all',
      'day',
      'empty',
      'hours',
      'meridiem',
      'minutes',
      'month',
      'seconds',
      'weekDay',
      'year',
    ]),
    PropTypes.number,
  ]),
  /**
   * Disable specific time.
   * @param {PickerValidDate} value The value to check.
   * @param {TimeView} view The clock type of the timeValue.
   * @returns {boolean} If `true` the time will be disabled.
   */
  shouldDisableTime: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * Amount of time options below or at which the single column time renderer is used.
   * @default 24
   */
  thresholdToRenderTimeInASingleColumn: PropTypes.number,
  /**
   * The time steps between two time unit options.
   * For example, if `timeSteps.minutes = 8`, then the available minute options will be `[0, 8, 16, 24, 32, 40, 48, 56]`.
   * When single column time renderer is used, only `timeSteps.minutes` will be used.
   * @default{ hours: 1, minutes: 5, seconds: 5 }
   */
  timeSteps: PropTypes.shape({
    hours: PropTypes.number,
    minutes: PropTypes.number,
    seconds: PropTypes.number,
  }),
  /**
   * Choose which timezone to use for the value.
   * Example: "default", "system", "UTC", "America/New_York".
   * If you pass values from other timezones to some props, they will be converted to this timezone before being used.
   * @see See the {@link https://mui.com/x/react-date-pickers/timezone/ timezones documentation} for more details.
   * @default The timezone of the `value` or `defaultValue` prop is defined, 'default' otherwise.
   */
  timezone: PropTypes.string,
  /**
   * The selected value.
   * Used when the component is controlled.
   */
  value: PropTypes.arrayOf(PropTypes.object),
  /**
   * The visible view.
   * Used when the component view is controlled.
   * Must be a valid option from `views` list.
   */
  view: PropTypes.oneOf(['hours', 'meridiem', 'minutes', 'seconds']),
  /**
   * Define custom view renderers for each section.
   * If `null`, the section will only have field editing.
   * If `undefined`, internally defined view will be the used.
   */
  viewRenderers: PropTypes.shape({
    hours: PropTypes.func,
    meridiem: PropTypes.func,
    minutes: PropTypes.func,
    seconds: PropTypes.func,
  }),
  /**
   * Available views.
   */
  views: PropTypes.arrayOf(PropTypes.oneOf(['hours', 'minutes', 'seconds']).isRequired),
} as any;

export { MobileTimeRangePicker };
