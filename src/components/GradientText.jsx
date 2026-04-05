import React from 'react';
import { motion } from 'framer-motion';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function GradientText({
  text,
  className,
  gradient = 'linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)',
  neon = false,
  transition = { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'linear' },
  ...props
}) {
  const baseStyle = {
    backgroundImage: gradient
  };

  return (
    <span
      className={cn('relative inline-block', className)}
      data-slot="gradient-text"
      {...props}
    >
      <motion.span
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        className="m-0 text-transparent bg-clip-text bg-[length:200%_100%]"
        style={baseStyle}
        transition={transition}
      >
        {text}
      </motion.span>

      {neon && (
        <motion.span
          animate={{ backgroundPositionX: ['0%', '200%'] }}
          className="m-0 absolute left-0 top-0 text-transparent bg-clip-text blur-[8px] bg-[length:200%_100%]"
          style={baseStyle}
          transition={transition}
        >
          {text}
        </motion.span>
      )}
    </span>
  );
}

export default GradientText;
