import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./buttonVariants";
import { Underline } from "./Underline";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    underline?: boolean;
  };

const underlineVariants = new Set(["text", "sidebar"]);

export const Button = ({
  children,
  className,
  variant = "text",
  underline,
  ...props
}: ButtonProps) => {
  const v = variant ?? "text";

  const shouldUnderline = underline ?? underlineVariants.has(v);

  const content = shouldUnderline ? (
    <Underline>{children}</Underline>
  ) : (
    children
  );

  return (
    <button className={buttonVariants({ variant: v, className })} {...props}>
      {content}
    </button>
  );
};
