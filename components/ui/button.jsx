/**
 * Button Component (shadcn/ui style)
 *
 * A button component with multiple variants and sizes,
 * supporting both button and anchor elements.
 */

import * as React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const buttonVariants = {
  variant: {
    default:
      "bg-green-primary text-white hover:bg-green-700 shadow-green-glow hover:shadow-green-glow-lg",
    destructive:
      "bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-900/90",
    outline:
      "border-2 border-green-primary bg-transparent text-green-primary hover:bg-green-primary/10",
    secondary:
      "bg-orange-primary text-white hover:bg-orange-500 shadow-orange-glow hover:shadow-orange-glow-lg",
    ghost:
      "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    link: "text-green-primary underline-offset-4 hover:underline",
    green:
      "bg-green-primary text-white hover:bg-green-700 shadow-green-glow hover:shadow-green-glow-lg",
    orange:
      "bg-orange-primary text-white hover:bg-orange-500 shadow-orange-glow hover:shadow-orange-glow-lg",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      href,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-gray-950";

    const classes = cn(
      baseClasses,
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      className
    );

    // If href is provided, render as anchor
    if (href) {
      return (
        <a ref={ref} href={href} className={classes} {...props} />
      );
    }

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
