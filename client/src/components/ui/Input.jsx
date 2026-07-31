import { forwardRef, useId } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      className,
      containerClassName,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const id = useId();

    return (
      <div className={twMerge(clsx("space-y-1", containerClassName))}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}

            {required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-3 flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={id}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={twMerge(
              clsx(
                "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition",

                leftIcon && "pl-10",

                rightIcon && "pr-10",

                error
                  ? "border-red-500 focus:ring-2 focus:ring-red-300"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300",

                className
              )
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={`${id}-error`}
            className="text-sm text-red-500"
          >
            {error}
          </p>
        ) : helperText ? (
          <p className="text-sm text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input; 