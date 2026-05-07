import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Page, Section } from '@/lib/schema';

interface DraftPageState {
  page: Page | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: DraftPageState = {
  page: null,
  status: 'idle',
};

const draftPageSlice = createSlice({
  name: 'draftPage',
  initialState,
  reducers: {
    setDraftPage: (state, action: PayloadAction<Page>) => {
      state.page = action.payload;
    },
    updateSectionProp: (state, action: PayloadAction<{ sectionId: string, propKey: string, value: any }>) => {
      if (state.page) {
        const section = state.page.sections.find(s => s.id === action.payload.sectionId);
        if (section) {
          section.props[action.payload.propKey] = action.payload.value;
        }
      }
    },
    addSection: (state, action: PayloadAction<Section>) => {
      if (state.page) {
        state.page.sections.push(action.payload);
      }
    },
    removeSection: (state, action: PayloadAction<string>) => {
      if (state.page) {
        state.page.sections = state.page.sections.filter(s => s.id !== action.payload);
      }
    },
    moveSection: (state, action: PayloadAction<{ startIndex: number, endIndex: number }>) => {
      if (state.page) {
        const result = Array.from(state.page.sections);
        const [removed] = result.splice(action.payload.startIndex, 1);
        result.splice(action.payload.endIndex, 0, removed);
        state.page.sections = result;
      }
    }
  },
});

export const { setDraftPage, updateSectionProp, addSection, removeSection, moveSection } = draftPageSlice.actions;
export default draftPageSlice.reducer;
