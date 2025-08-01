'use client';
import * as React from 'react';
import useSlotProps from '@mui/utils/useSlotProps';
import Grow from '@mui/material/Grow';
import Fade from '@mui/material/Fade';
import MuiPaper, { PaperProps as MuiPaperProps, PaperProps } from '@mui/material/Paper';
import MuiPopper, {
  PopperProps as MuiPopperProps,
  PopperPlacementType,
  PopperProps,
} from '@mui/material/Popper';
import BaseFocusTrap, {
  TrapFocusProps as MuiTrapFocusProps,
} from '@mui/material/Unstable_TrapFocus';
import useForkRef from '@mui/utils/useForkRef';
import useEventCallback from '@mui/utils/useEventCallback';
import ownerDocument from '@mui/utils/ownerDocument';
import composeClasses from '@mui/utils/composeClasses';
import { styled, useThemeProps } from '@mui/material/styles';
import { TransitionProps as MuiTransitionProps } from '@mui/material/transitions';
import { MuiEvent, SlotComponentPropsFromProps } from '@mui/x-internals/types';
import { getPickerPopperUtilityClass, PickerPopperClasses } from './pickerPopperClasses';
import { executeInTheNextEventLoopTick, getActiveElement } from '../../utils/utils';
import { usePickerPrivateContext } from '../../hooks/usePickerPrivateContext';
import { PickerOwnerState } from '../../../models';
import { usePickerContext } from '../../../hooks';

export interface PickerPopperOwnerState extends PickerOwnerState {
  popperPlacement: PopperPlacementType;
}

export interface PickerPopperSlots {
  /**
   * Custom component for the paper rendered inside the desktop picker's Popper.
   * @default PickerPopperPaper
   */
  desktopPaper?: React.JSXElementConstructor<MuiPaperProps>;
  /**
   * Custom component for the desktop popper [Transition](https://mui.com/material-ui/transitions/).
   * @default Grow or Fade from '@mui/material' when `reduceAnimations` is `true`.
   */
  desktopTransition?: React.JSXElementConstructor<MuiTransitionProps>;
  /**
   * Custom component for trapping the focus inside the views on desktop.
   * @default TrapFocus from '@mui/material'.
   */
  desktopTrapFocus?: React.JSXElementConstructor<MuiTrapFocusProps>;
  /**
   * Custom component for the popper inside which the views are rendered on desktop.
   * @default Popper from '@mui/material'.
   */
  popper?: React.ElementType<MuiPopperProps>;
}

export interface PickerPopperSlotProps {
  /**
   * Props passed down to the desktop [Paper](https://mui.com/material-ui/api/paper/) component.
   */
  desktopPaper?: SlotComponentPropsFromProps<PaperProps, {}, PickerPopperOwnerState>;
  /**
   * Props passed down to the desktop [Transition](https://mui.com/material-ui/transitions/) component.
   */
  desktopTransition?: Partial<MuiTransitionProps>;
  /**
   * Props passed down to the [FocusTrap](https://mui.com/base-ui/react-focus-trap/) component on desktop.
   */
  desktopTrapFocus?: Partial<MuiTrapFocusProps>;
  /**
   * Props passed down to [Popper](https://mui.com/material-ui/api/popper/) component.
   */
  popper?: SlotComponentPropsFromProps<PopperProps, {}, PickerOwnerState>;
}

export interface ExportedPickerPopperProps {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<PickerPopperClasses>;
  /**
   * @default "bottom-start"
   */
  // Never used in the codebase, only here for theme augmentation.
  placement?: MuiPopperProps['placement'];
}

export interface PickerPopperProps extends ExportedPickerPopperProps {
  children?: React.ReactNode;
  slots?: PickerPopperSlots;
  slotProps?: PickerPopperSlotProps;
}

const useUtilityClasses = (classes: Partial<PickerPopperClasses> | undefined) => {
  const slots = {
    root: ['root'],
    paper: ['paper'],
  };

  return composeClasses(slots, getPickerPopperUtilityClass, classes);
};

const PickerPopperRoot = styled(MuiPopper, {
  name: 'MuiPickerPopper',
  slot: 'Root',
})<{ ownerState: PickerOwnerState }>(({ theme }) => ({
  zIndex: theme.zIndex.modal,
}));

const PickerPopperPaper = styled(MuiPaper, {
  name: 'MuiPickerPopper',
  slot: 'Paper',
})<{
  ownerState: PickerPopperOwnerState;
}>({
  outline: 0,
  transformOrigin: 'top center',
  variants: [
    {
      props: ({ popperPlacement }) => new Set(['top', 'top-start', 'top-end']).has(popperPlacement),
      style: {
        transformOrigin: 'bottom center',
      },
    },
  ],
});

function clickedRootScrollbar(event: MouseEvent, doc: Document) {
  return (
    doc.documentElement.clientWidth < event.clientX ||
    doc.documentElement.clientHeight < event.clientY
  );
}

type OnClickAway = (event: MouseEvent | TouchEvent) => void;

/**
 * Based on @mui/material/ClickAwayListener without the customization.
 * We can probably strip away even more since children won't be portaled.
 * @param {boolean} active Only listen to clicks when the popper is opened.
 * @param {(event: MouseEvent | TouchEvent) => void} onClickAway The callback to call when clicking outside the popper.
 * @returns {Array} The ref and event handler to listen to the outside clicks.
 */
function useClickAwayListener(
  active: boolean,
  onClickAway: OnClickAway,
): [React.Ref<Element>, React.MouseEventHandler, React.TouchEventHandler] {
  const movedRef = React.useRef(false);
  const syntheticEventRef = React.useRef(false);

  const nodeRef = React.useRef<Element>(null);

  const activatedRef = React.useRef(false);
  React.useEffect(() => {
    if (!active) {
      return undefined;
    }

    // Ensure that this hook is not "activated" synchronously.
    // https://github.com/facebook/react/issues/20074
    function armClickAwayListener() {
      activatedRef.current = true;
    }

    document.addEventListener('mousedown', armClickAwayListener, true);
    document.addEventListener('touchstart', armClickAwayListener, true);

    return () => {
      document.removeEventListener('mousedown', armClickAwayListener, true);
      document.removeEventListener('touchstart', armClickAwayListener, true);
      activatedRef.current = false;
    };
  }, [active]);

  // The handler doesn't take event.defaultPrevented into account:
  //
  // event.preventDefault() is meant to stop default behaviors like
  // clicking a checkbox to check it, hitting a button to submit a form,
  // and hitting left arrow to move the cursor in a text input etc.
  // Only special HTML elements have these default behaviors.
  const handleClickAway = useEventCallback((event: MouseEvent | TouchEvent) => {
    if (!activatedRef.current) {
      return;
    }

    // Given developers can stop the propagation of the synthetic event,
    // we can only be confident with a positive value.
    const insideReactTree = syntheticEventRef.current;
    syntheticEventRef.current = false;

    const doc = ownerDocument(nodeRef.current);

    // 1. IE11 support, which trigger the handleClickAway even after the unbind
    // 2. The child might render null.
    // 3. Behave like a blur listener.
    if (
      !nodeRef.current ||
      // is a TouchEvent?
      ('clientX' in event && clickedRootScrollbar(event, doc))
    ) {
      return;
    }

    // Do not act if user performed touchmove
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    let insideDOM;

    // If not enough, can use https://github.com/DieterHolvoet/event-propagation-path/blob/master/propagationPath.js
    if (event.composedPath) {
      insideDOM = event.composedPath().indexOf(nodeRef.current) > -1;
    } else {
      insideDOM =
        !doc.documentElement.contains(event.target as Node | null) ||
        nodeRef.current.contains(event.target as Node | null);
    }

    if (!insideDOM && !insideReactTree) {
      onClickAway(event);
    }
  });

  // Keep track of mouse/touch events that bubbled up through the portal.
  const handleSynthetic = (event: MuiEvent<React.SyntheticEvent>) => {
    // Ignore events handled by our internal components
    if (!event.defaultMuiPrevented) {
      syntheticEventRef.current = true;
    }
  };

  React.useEffect(() => {
    if (active) {
      const doc = ownerDocument(nodeRef.current);

      const handleTouchMove = () => {
        movedRef.current = true;
      };

      doc.addEventListener('touchstart', handleClickAway);
      doc.addEventListener('touchmove', handleTouchMove);

      return () => {
        doc.removeEventListener('touchstart', handleClickAway);
        doc.removeEventListener('touchmove', handleTouchMove);
      };
    }
    return undefined;
  }, [active, handleClickAway]);

  React.useEffect(() => {
    // TODO This behavior is not tested automatically
    // It's unclear whether this is due to different update semantics in test (batched in act() vs discrete on click).
    // Or if this is a timing related issues due to different Transition components
    // Once we get rid of all the manual scheduling (for example setTimeout(update, 0)) we can revisit this code+test.
    if (active) {
      const doc = ownerDocument(nodeRef.current);

      doc.addEventListener('click', handleClickAway);

      return () => {
        doc.removeEventListener('click', handleClickAway);
        // cleanup `handleClickAway`
        syntheticEventRef.current = false;
      };
    }
    return undefined;
  }, [active, handleClickAway]);

  return [nodeRef, handleSynthetic, handleSynthetic];
}

interface PickerPopperPaperWrapperProps {
  PaperComponent: React.ElementType;
  children: React.ReactNode;
  ownerState: PickerPopperOwnerState;
  paperClasses: string;
  onPaperClick: React.MouseEventHandler<HTMLDivElement>;
  onPaperTouchStart: React.TouchEventHandler<HTMLDivElement>;
  paperSlotProps?: PickerPopperSlotProps['desktopPaper'];
}

const PickerPopperPaperWrapper = React.forwardRef(
  (props: PickerPopperPaperWrapperProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      PaperComponent,
      ownerState,
      children,
      paperSlotProps,
      paperClasses,
      onPaperClick,
      onPaperTouchStart,
      // picks up the style props provided by `Transition`
      // https://mui.com/material-ui/transitions/#child-requirement
      ...other
    } = props;

    const paperProps: MuiPaperProps = useSlotProps({
      elementType: PaperComponent,
      externalSlotProps: paperSlotProps,
      additionalProps: {
        tabIndex: -1,
        elevation: 8,
        ref,
      },
      className: paperClasses,
      ownerState,
    });
    return (
      <PaperComponent
        {...other}
        {...paperProps}
        onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          onPaperClick(event);
          paperProps.onClick?.(event);
        }}
        onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {
          onPaperTouchStart(event);
          paperProps.onTouchStart?.(event);
        }}
        ownerState={ownerState}
      >
        {children}
      </PaperComponent>
    );
  },
);

export function PickerPopper(inProps: PickerPopperProps) {
  const props = useThemeProps({ props: inProps, name: 'MuiPickerPopper' });
  const { children, placement = 'bottom-start', slots, slotProps, classes: classesProp } = props;

  const { open, popupRef, reduceAnimations } = usePickerContext();
  const { ownerState: pickerOwnerState, rootRefObject } = usePickerPrivateContext();
  const { dismissViews, getCurrentViewMode, onPopperExited, triggerElement, viewContainerRole } =
    usePickerPrivateContext();

  React.useEffect(() => {
    function handleKeyDown(nativeEvent: KeyboardEvent) {
      if (open && nativeEvent.key === 'Escape') {
        dismissViews();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dismissViews, open]);

  const lastFocusedElementRef = React.useRef<Element | null>(null);
  React.useEffect(() => {
    if (viewContainerRole === 'tooltip' || getCurrentViewMode() === 'field') {
      return;
    }

    if (open) {
      lastFocusedElementRef.current = getActiveElement(rootRefObject.current);
    } else if (
      lastFocusedElementRef.current &&
      lastFocusedElementRef.current instanceof HTMLElement
    ) {
      // make sure the button is flushed with updated label, before returning focus to it
      // avoids issue, where screen reader could fail to announce selected date after selection
      setTimeout(() => {
        if (lastFocusedElementRef.current instanceof HTMLElement) {
          lastFocusedElementRef.current.focus();
        }
      });
    }
  }, [open, viewContainerRole, getCurrentViewMode, rootRefObject]);

  const classes = useUtilityClasses(classesProp);

  const handleClickAway: OnClickAway = useEventCallback(() => {
    if (viewContainerRole === 'tooltip') {
      executeInTheNextEventLoopTick(() => {
        if (
          rootRefObject.current?.contains(getActiveElement(rootRefObject.current)) ||
          popupRef.current?.contains(getActiveElement(popupRef.current))
        ) {
          return;
        }

        dismissViews();
      });
    } else {
      dismissViews();
    }
  });

  const [clickAwayRef, onPaperClick, onPaperTouchStart] = useClickAwayListener(
    open,
    handleClickAway,
  );
  const paperRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(paperRef, popupRef);
  const handlePaperRef = useForkRef(handleRef, clickAwayRef as React.Ref<HTMLDivElement>);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // stop the propagation to avoid closing parent modal
      event.stopPropagation();
      dismissViews();
    }
  };

  const Transition = (slots?.desktopTransition ?? reduceAnimations) ? Fade : Grow;
  const FocusTrap = slots?.desktopTrapFocus ?? BaseFocusTrap;

  const Paper = slots?.desktopPaper ?? PickerPopperPaper;
  const Popper = slots?.popper ?? PickerPopperRoot;
  const popperProps = useSlotProps({
    elementType: Popper,
    externalSlotProps: slotProps?.popper,
    additionalProps: {
      transition: true,
      role: viewContainerRole == null ? undefined : viewContainerRole,
      open,
      placement,
      anchorEl: triggerElement,
      onKeyDown: handleKeyDown,
    },
    className: classes.root,
    ownerState: pickerOwnerState,
  });

  const ownerState: PickerPopperOwnerState = React.useMemo(
    () => ({ ...pickerOwnerState, popperPlacement: popperProps.placement }),
    [pickerOwnerState, popperProps.placement],
  );

  return (
    <Popper {...popperProps}>
      {({ TransitionProps }) => (
        <FocusTrap
          open={open}
          disableAutoFocus
          // pickers are managing focus position manually
          // without this prop the focus is returned to the button before `aria-label` is updated
          // which would force screen readers to read too old label
          disableRestoreFocus
          disableEnforceFocus={viewContainerRole === 'tooltip'}
          isEnabled={() => true}
          {...slotProps?.desktopTrapFocus}
        >
          <Transition
            {...TransitionProps}
            {...slotProps?.desktopTransition}
            onExited={(event) => {
              onPopperExited?.();
              slotProps?.desktopTransition?.onExited?.(event);
              TransitionProps?.onExited?.();
            }}
          >
            <PickerPopperPaperWrapper
              PaperComponent={Paper}
              ownerState={ownerState}
              ref={handlePaperRef}
              onPaperClick={onPaperClick}
              onPaperTouchStart={onPaperTouchStart}
              paperClasses={classes.paper}
              paperSlotProps={slotProps?.desktopPaper}
            >
              {children}
            </PickerPopperPaperWrapper>
          </Transition>
        </FocusTrap>
      )}
    </Popper>
  );
}
