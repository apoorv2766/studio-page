import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeSectionId: string | null;
  role: 'viewer' | 'editor' | 'publisher';
}

const initialState: UiState = {
  activeSectionId: null,
  role: 'publisher', // Default to publisher for easy testing during assignment
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<string | null>) => {
      state.activeSectionId = action.payload;
    },
    setRole: (state, action: PayloadAction<'viewer' | 'editor' | 'publisher'>) => {
      state.role = action.payload;
    }
  },
});

export const { setActiveSection, setRole } = uiSlice.actions;
export default uiSlice.reducer;
