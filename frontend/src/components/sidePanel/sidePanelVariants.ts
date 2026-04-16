import { cva } from "class-variance-authority";

export const sidePanelStyles = cva(
  "fixed top-0 h-full w-100 bg-greyOne text-white z-50 p-6 transform transition-transform duration-300 ease-in-out",
  {
    variants: {
      position: {
        left: "left-0",
        right: "right-0",
      },
      open: {
        true: "translate-x-0",
        false: "",
      },
    },
    compoundVariants: [
      {
        position: "left",
        open: false,
        className: "-translate-x-full",
      },
      {
        position: "right",
        open: false,
        className: "translate-x-full",
      },
    ],
    defaultVariants: {
      position: "left",
    },
  },
);
