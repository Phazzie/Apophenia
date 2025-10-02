
import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, variant = 'primary', className = '' }) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
};

export default Button;
