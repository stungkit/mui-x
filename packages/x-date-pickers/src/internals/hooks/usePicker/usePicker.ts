import { warnOnce } from '@mui/x-internals/warning';
import { UsePickerParams, UsePickerProps, UsePickerReturnValue } from './usePicker.types';
import { usePickerValue } from './usePickerValue';
import { usePickerViews } from './usePickerViews';
import { DateOrTimeViewWithMeridiem, PickerValidValue } from '../../models';
import { usePickerProvider } from './usePickerProvider';

export const usePicker = <
  TValue extends PickerValidValue,
  TView extends DateOrTimeViewWithMeridiem,
  TExternalProps extends UsePickerProps<TValue, TView, any, any>,
>({
  ref,
  props,
  valueManager,
  valueType,
  variant,
  validator,
  autoFocusView,
  viewContainerRole,
  rendererInterceptor,
  localeText,
}: UsePickerParams<TValue, TView, TExternalProps>): UsePickerReturnValue<TValue> => {
  if (process.env.NODE_ENV !== 'production') {
    if ((props as any).renderInput != null) {
      warnOnce([
        'MUI X: The `renderInput` prop has been removed in version 6.0 of the Date and Time Pickers.',
        'You can replace it with the `textField` component slot in most cases.',
        'For more information, please have a look at the migration guide (https://mui.com/x/migration/migration-pickers-v5/#input-renderer-required-in-v5).',
      ]);
    }
  }
  const pickerValueResponse = usePickerValue<TValue, TExternalProps>({
    props,
    valueManager,
    valueType,
    validator,
  });

  const pickerViewsResponse = usePickerViews<TValue, TView, TExternalProps>({
    props,
    autoFocusView,
    viewContainerRole,
    propsFromPickerValue: pickerValueResponse.viewProps,
    rendererInterceptor,
  });

  const providerProps = usePickerProvider({
    ref,
    props,
    localeText,
    valueManager,
    variant,
    paramsFromUsePickerValue: pickerValueResponse.provider,
    paramsFromUsePickerViews: pickerViewsResponse.provider,
  });

  return {
    // Picker views
    renderCurrentView: pickerViewsResponse.renderCurrentView,

    // Picker provider
    providerProps,

    // Picker owner state
    ownerState: providerProps.privateContextValue.ownerState,
  };
};
