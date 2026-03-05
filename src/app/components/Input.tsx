'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <div className="flex-1">
        {label && <label className="form-label">{label}</label>}
        <input
          ref={ref}
          className={`input w-full pl-6 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
