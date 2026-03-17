import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export const generateLogosAction = createAsyncThunk(
  'logo/generateLogos',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/generate', {
        name: userData.name || "BRAND",
        slogan: userData.slogan || "",
        industry: userData.industryId || 23,
        font: userData.fontId || "1",
        color: userData.colorId || "1",
        p: 2,
      });
      // API response return karein
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

interface LogoState {
  formData: any;
  results: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LogoState = {
  formData: { name: '', slogan: '', industryId: 23, fontId: '1', colorId: '1' },
  results: [],
  status: 'idle',
  error: null,
};

const logoSlice = createSlice({
  name: 'logo',
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<any>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetLogoProcess: (state) => {
      state.results = [];
      state.status = 'idle';
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
        console.log("API Success, Payload received:", action.payload);
        state.status = 'succeeded';

        // FIX: API response mein data 'data' field ke andar hai
        state.results = action.payload.data || [];
      })
      .addCase(generateLogosAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { updateFormData, resetLogoProcess } = logoSlice.actions;
export default logoSlice.reducer;