import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PublishState {
  isPublishing: boolean;
  lastPublishedVersion: string | null;
}

const initialState: PublishState = {
  isPublishing: false,
  lastPublishedVersion: null,
};

const publishSlice = createSlice({
  name: 'publish',
  initialState,
  reducers: {
    publishStart: (state) => { state.isPublishing = true; },
    publishSuccess: (state, action: PayloadAction<string>) => {
      state.isPublishing = false;
      state.lastPublishedVersion = action.payload;
    },
    publishFail: (state) => { state.isPublishing = false; }
  },
});

export const { publishStart, publishSuccess, publishFail } = publishSlice.actions;
export default publishSlice.reducer;
