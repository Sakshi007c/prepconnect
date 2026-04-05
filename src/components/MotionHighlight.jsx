import React, { createContext, useCallback, useContext, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const MotionHighlightContext = createContext(undefined);

function useMotionHighlight() {
  const context = useContext(MotionHighlightContext);
  if (!context) {
    throw new Error('useMotionHighlight must be used within MotionHighlight');
  }
  return context;
}

function MotionHighlight({
  children,
  value,
  defaultValue = null,
  onValueChange,
  className,
  transition = { type: 'spring', stiffness: 350, damping: 35 },
  hover = false,
  enabled = true,
  disabled = false,
  exitDelay = 0.2,
  controlledItems = false,
  itemsClassName
}) {
  const [activeValue, setActiveValue] = useState(value ?? defaultValue);
  const contextId = useId();

  useEffect(() => {
    if (value !== undefined) {
      setActiveValue(value);
    }
  }, [value]);

  const safeSetActiveValue = useCallback((nextValue) => {
    setActiveValue((prev) => (prev === nextValue ? prev : nextValue));
    if (nextValue !== activeValue) {
      onValueChange?.(nextValue);
    }
  }, [activeValue, onValueChange]);

  return (
    <MotionHighlightContext.Provider
      value={{
        activeValue,
        setActiveValue: safeSetActiveValue,
        hover,
        className,
        transition,
        disabled,
        enabled,
        exitDelay,
        contextId
      }}
    >
      {enabled
        ? controlledItems
          ? children
          : React.Children.map(children, (child, index) => (
            <MotionHighlightItem className={itemsClassName} key={index}>
              {child}
            </MotionHighlightItem>
          ))
        : children}
    </MotionHighlightContext.Provider>
  );
}

function MotionHighlightItem({
  children,
  id,
  value,
  className,
  transition,
  activeClassName,
  disabled = false,
  exitDelay,
  asChild = false
}) {
  const {
    activeValue,
    setActiveValue,
    hover,
    enabled,
    className: contextClassName,
    transition: contextTransition,
    contextId,
    disabled: contextDisabled,
    exitDelay: contextExitDelay
  } = useMotionHighlight();

  const itemId = useId();
  const element = children;

  if (!React.isValidElement(element)) {
    return children;
  }

  const childValue = id ?? value ?? element.props?.['data-value'] ?? element.props?.id ?? itemId;
  const isActive = activeValue === childValue;
  const isDisabled = disabled ?? contextDisabled;
  const itemTransition = transition ?? contextTransition;

  const commonHandlers = hover
    ? {
      onMouseEnter: (e) => {
        setActiveValue(childValue);
        element.props.onMouseEnter?.(e);
      },
      onMouseLeave: (e) => {
        setActiveValue(null);
        element.props.onMouseLeave?.(e);
      }
    }
    : {
      onClick: (e) => {
        setActiveValue(childValue);
        element.props.onClick?.(e);
      }
    };

  if (asChild) {
    return React.cloneElement(
      element,
      {
        className: cn('relative', element.props.className),
        'data-active': isActive ? 'true' : 'false',
        'data-value': childValue,
        ...commonHandlers
      },
      <>
        <AnimatePresence initial={false}>
          {isActive && !isDisabled && (
            <motion.div
              animate={{ opacity: 1 }}
              className={cn('absolute inset-0 z-0', contextClassName, activeClassName)}
              exit={{
                opacity: 0,
                transition: {
                  ...itemTransition,
                  delay: (itemTransition?.delay ?? 0) + (exitDelay ?? contextExitDelay ?? 0)
                }
              }}
              initial={{ opacity: 0 }}
              layoutId={`transition-background-${contextId}`}
              transition={itemTransition}
            />
          )}
        </AnimatePresence>
        <div className={cn('relative z-[1]', className)}>
          {element.props.children}
        </div>
      </>
    );
  }

  return enabled ? (
    <div
      className={cn('relative', className)}
      data-active={isActive ? 'true' : 'false'}
      data-value={childValue}
      {...commonHandlers}
    >
      <AnimatePresence initial={false}>
        {isActive && !isDisabled && (
          <motion.div
            animate={{ opacity: 1 }}
            className={cn('absolute inset-0 z-0', contextClassName, activeClassName)}
            exit={{
              opacity: 0,
              transition: {
                ...itemTransition,
                delay: (itemTransition?.delay ?? 0) + (exitDelay ?? contextExitDelay ?? 0)
              }
            }}
            initial={{ opacity: 0 }}
            layoutId={`transition-background-${contextId}`}
            transition={itemTransition}
          />
        )}
      </AnimatePresence>

      {React.cloneElement(element, {
        className: cn('relative z-[1]', element.props.className)
      })}
    </div>
  ) : children;
}

export { MotionHighlight, MotionHighlightItem, useMotionHighlight };
export default MotionHighlight;
