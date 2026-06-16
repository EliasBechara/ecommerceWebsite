import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import {
  closePanel,
  openPanel,
  type ActivePanel,
} from "../uiSlice";

export const useUIOverlay = () => {
  const dispatch = useAppDispatch();

  const activePanel = useSelector(
    (state: RootState) => state.ui.activePanel
  );

  return {
    activePanel,

    open: (panel: Exclude<ActivePanel, null>) =>
      dispatch(openPanel(panel)),

    close: () => dispatch(closePanel()),

    isOpen: (panel: ActivePanel) =>
      activePanel === panel,
  };
};