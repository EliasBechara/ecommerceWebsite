import type { ReactNode } from "react";
import { type VariantProps } from "class-variance-authority";
import { Button } from "../button/Button";
import { sidePanelStyles } from "./sidePanelVariants";

type SidePanelProps = {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (isOpen: boolean) => void;
  children: ReactNode;
  position?: "left" | "right";
} & VariantProps<typeof sidePanelStyles>;

export const SidePanel = ({
  isSidePanelOpen,
  setIsSidePanelOpen,
  children,
  position = "left",
}: SidePanelProps) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isSidePanelOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidePanelOpen(false)}
      />

      <aside
        className={sidePanelStyles({
          position,
          open: isSidePanelOpen,
        })}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-black">Menu</h2>

          <Button
            onClick={() => setIsSidePanelOpen(false)}
            underline={false}
            className="cursor-pointer text-xl text-black"
          >
            ✕
          </Button>
        </div>

        {children}
      </aside>
    </>
  );
};
