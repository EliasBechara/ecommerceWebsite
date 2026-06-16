import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ActivePanel =
    | "sidebar"
    | "search"
    | "cart"
    | null;

type UIState = {
    activePanel: ActivePanel;
};

const initialState: UIState = {
    activePanel: null,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openPanel(
            state,
            action: PayloadAction<Exclude<ActivePanel, null>>
        ) {
            state.activePanel = action.payload;
        },

        closePanel(state) {
            state.activePanel = null;
        },
    },
});

export const { openPanel, closePanel } = uiSlice.actions;

export default uiSlice.reducer;