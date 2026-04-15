import { createSlice } from "@reduxjs/toolkit";

interface ProductsUIState {
  searchQuery: string;
  sortBy: "price-asc" | "price-desc" | "newest";
}

const initialState: ProductsUIState = {
  searchQuery: "",
  sortBy: "newest",
};

const productsUISlice = createSlice({
  name: "productsUI",
  initialState,
  reducers: {},
});

export default productsUISlice.reducer;
