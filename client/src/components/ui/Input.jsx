import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input component that follows the AliTools design system
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input id
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const Input = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  helpText,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };
  
  // Base classes
  const baseClasses = `
    w-full 
    rounded-md 
    border 
    focus:outline-none 
    focus:ring-2 
    transition-smooth
  `;
  
  // State classes
  const stateClasses = error
    ? 'border-error focus:border-error focus:ring-error/30 text-error'
    : 'border-neutral-300 focus:border-brand focus:ring-brand/30 text-primary';
  
  // Disabled classes
  const disabledClasses = disabled ? 'bg-neutral-100 cursor-not-allowed opacity-75' : 'bg-white';
  
  // Combine all classes
  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  // Generate a unique ID if none is provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId}
          className={`block mb-1 text-sm font-medium ${error ? 'text-error' : 'text-primary-800'}`}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={inputClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...props}
      />
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${inputId}-help`} className="mt-1 text-sm text-neutral-600">
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    'text', 'email', 'password', 'number', 'tel', 'url', 
    'date', 'datetime-local', 'month', 'week', 'time', 'search', 'color'
  ]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Input; 