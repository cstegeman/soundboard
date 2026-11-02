import { createSlice } from '@reduxjs/toolkit';

export const monoSlice = createSlice({
  name: 'mono',
  initialState: {
    value: false
  },
  reducers: {
    enableMono: (state, action) => {
      state.value = action.payload;
    }
  }
});

export const { enableMono } = monoSlice.actions;

export default monoSlice.reducer;
