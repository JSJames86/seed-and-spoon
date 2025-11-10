/**
 * FormField Component
 *
 * Reusable form input component with label, validation, and accessibility
 */

'use client';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  options = [], // for select/radio/checkbox groups
  placeholder,
  helpText,
  disabled = false,
  rows = 4, // for textarea
  multiple = false, // for select
  className = '',
  ...props
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const baseInputClasses = `
    w-full px-4 py-2.5 rounded-lg border transition-colors
    focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error
      ? 'border-red-500 bg-red-50 focus:ring-red-500'
      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
    }
  `;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
            {...props}
          />
        );

      case 'select':
        return (
          <select
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            multiple={multiple}
            className={baseInputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-start">
            <input
              id={id}
              name={name}
              type="checkbox"
              checked={value || false}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
              {...props}
            />
            <label htmlFor={id} className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              {label}
              {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
            </label>
          </div>
        );

      case 'checkbox-group':
        return (
          <div className="space-y-2">
            {options.map(opt => (
              <div key={opt.value} className="flex items-center">
                <input
                  id={`${id}-${opt.value}`}
                  name={name}
                  type="checkbox"
                  value={opt.value}
                  checked={value?.includes(opt.value) || false}
                  onChange={onChange}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
                  {...props}
                />
                <label
                  htmlFor={`${id}-${opt.value}`}
                  className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map(opt => (
              <div key={opt.value} className="flex items-center">
                <input
                  id={`${id}-${opt.value}`}
                  name={name}
                  type="radio"
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  required={required}
                  className="h-4 w-4 border-gray-300 text-green-700 focus:ring-green-700"
                  {...props}
                />
                <label
                  htmlFor={`${id}-${opt.value}`}
                  className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            id={id}
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
            {...props}
          />
        );
    }
  };

  // For checkbox type, the label is rendered inline with the input
  if (type === 'checkbox') {
    return (
      <div className={`form-field ${className}`}>
        {renderInput()}
        {helpText && (
          <p id={helpId} className="ml-7 mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="ml-7 mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`form-field ${className}`}>
      {label && type !== 'checkbox' && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      {renderInput()}
      {helpText && (
        <p id={helpId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
