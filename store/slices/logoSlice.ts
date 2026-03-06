import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export const generateLogosAction = createAsyncThunk(
  'logo/generateLogos',
  async (userData: any, { rejectWithValue }) => {
    try {
      const payload = {
        name: userData.name || "BRAND",
        slogan: userData.slogan || "",
        industry: userData.industryId || 23,
        font: userData.fontId || "1",
        color: userData.colorId || "1",
        p: 2,
        select: "55540,55014,54795,54792,54558,54559,54553...",
        selectlog: "54559,48016,47543...",
      };

      const response = await axios.post('/api/generate', payload);
      return response.data.templates || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

interface LogoState {
  formData: {
    name: string;
    slogan: string;
    industryId: number;
    fontId: string;
    colorId: string;
  };
  results: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LogoState = {
  formData: {
    name: '',
    slogan: '',
    industryId: 23,
    fontId: '1',
    colorId: '1',
  },
  results: [],
  status: 'idle',
  error: null,
};

const logoSlice = createSlice({
  name: 'logo',
  initialState,
  reducers: {
    // Saare reducers ek saath yahan rakhein
    updateFormData: (state, action: PayloadAction<Partial<LogoState['formData']>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetLogoProcess: (state) => {
      state.results = [];
      state.status = 'idle';
      state.error = null;
    },
    // Yeh raha naya reducer
    initiateGeneration: (state) => {
      state.status = 'loading';
      state.results = [];
      state.error = null;
    },
  },
extraReducers: (builder) => {
    builder
      .addCase(generateLogosAction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generateLogosAction.fulfilled, (state, action) => {
        console.log("API Success, Payload received:", action.payload); // Debugging
        state.status = 'succeeded';
        state.results = action.payload; 
      })
      .addCase(generateLogosAction.rejected, (state, action) => {
        console.error("API Error:", action.payload); // Debugging
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Yahan initiateGeneration ko bhi export karna zaroori hai
export const { updateFormData, resetLogoProcess, initiateGeneration } = logoSlice.actions;
export default logoSlice.reducer;