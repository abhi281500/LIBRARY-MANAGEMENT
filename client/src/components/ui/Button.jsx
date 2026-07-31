import { forwardRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const Button = forwardRef(
  (
    {
      children,
      type = "button",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      className,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",

      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

      outline:
        "border border-gray-300 bg-white hover:bg-gray-100 focus:ring-gray-400",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth && "w-full",
            className
          )
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;