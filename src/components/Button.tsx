
import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
  ariaLabel,
  type = 'button'
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
export default React.memo(Button);
