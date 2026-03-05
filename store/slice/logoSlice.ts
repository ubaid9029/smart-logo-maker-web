import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types define karein
interface LogoState {
  step: number;
  formData: {
    businessName: string;
    slogan: string;
    category: string;
    font: string;
    color: string;
  };
  results: any[]; 
  loading: boolean;
  error: string | null;
}

const initialState: LogoState = {
  step: 1,
  formData: { businessName: '', slogan: '', category: '', font: '', color: '' },
  results: [],
  loading: false,
  error: null,
};

// LogoAI API Integration (Thunk)
export const generateLogosAction = createAsyncThunk(
  'logo/generate',
  async (formData: LogoState['formData'], { rejectWithValue }) => {
    try {
      const response = await fetch('/api/generate', { // Proxy route use karein CORS se bachne ke liye
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const logoSlice = createSlice({
  name: 'logo',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Partial<LogoState['formData']>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    nextStep: (state) => { state.step += 1; },
    prevStep: (state) => { state.step -= 1; },
    resetForm: (state) => { 
        state.formData = initialState.formData;
        state.step = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateLogosAction.pending, (state) => { state.loading = true; })
      .addCase(generateLogosAction.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload; // API response yahan save hoga
      })
      .addCase(generateLogosAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFormData, nextStep, prevStep, resetForm } = logoSlice.actions;
export default logoSlice.reducer;