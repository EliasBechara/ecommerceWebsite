import { useState } from "react";

export type ActivePanel = "sidebar" | "search" | "cart" | null;

export const useUIOverlay = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const open = (panel: ActivePanel) => setActivePanel(panel);
  const close = () => setActivePanel(null);

  const isOpen = (panel: ActivePanel) => activePanel === panel;

  return { activePanel, open, close, isOpen };
};
