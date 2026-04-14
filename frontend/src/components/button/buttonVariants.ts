import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "font-medium cursor-pointer inline-flex items-center",
  {
    variants: {
      variant: {
        text: "relative group transition-colors duration-300 justify-center",
        outline: "border border-gray-300 px-3 py-1 rounded justify-center",
        icon: "text-2xl p-2 rounded-full justify-center",
        sidebar:
          "relative group text-[20px] sm:text-[18px] leading-[24px] tracking-[1.4px] pt-5 text-left w-fit justify-start",
        overlay:
          "absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out text-[11px] sm:text-[13px] leading-[18px] tracking-[1.3px] py-[7px] px-1.5 text-black justify-center",
      },
    },
    defaultVariants: {
      variant: "text",
    },
  },
);
