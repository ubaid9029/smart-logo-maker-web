import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface LogoFormData {
  name: string;
  slogan: string;
  industryId: number | null;
  fontId: string;
  colorId: string;
}

const getErrorMessage = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    const candidate = value as { error?: unknown; details?: unknown; message?: unknown };

    if (typeof candidate.error === 'string' && typeof candidate.details === 'string') {
      return `${candidate.error}: ${candidate.details}`;
    }

    if (typeof candidate.error === 'string') {
      return candidate.error;
    }

    if (typeof candidate.message === 'string') {
      return candidate.message;
    }
  }

  return 'Something went wrong';
};

export const generateLogosAction = createAsyncThunk(
  'logo/generateLogos',
  async (userData: Partial<LogoFormData> | undefined, { rejectWithValue }) => {
    try {
      const payload = {
        name: userData?.name,
        slogan: userData?.slogan ?? "",
        industryId: userData?.industryId,
        fontId: userData?.fontId,
        colorId: userData?.colorId,
      };

      if (
        !payload.name?.trim() ||
        !payload.slogan?.trim() ||
        payload.industryId === undefined ||
        payload.industryId === null ||
        !payload.fontId ||
        !payload.colorId
      ) {
        return rejectWithValue("Missing required logo generation selections.");
      }

      const response = await axios.post('/api/generate', {
        ...payload,
      });
      // API response return karein
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(getErrorMessage(error.response?.data));
      }

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

interface LogoState {
  formData: LogoFormData;
  results: unknown[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LogoState = {
  formData: { name: '', slogan: '', industryId: null, fontId: '', colorId: '' },
  results: [],
  status: 'idle',
  error: null,
};

const logoSlice = createSlice({
  name: 'logo',
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<Partial<LogoFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetLogoProcess: (state) => {
      state.formData = { ...initialState.formData };
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
        state.error = getErrorMessage(action.payload);
      });
  },
});

export const { updateFormData, resetLogoProcess } = logoSlice.actions;
export default logoSlice.reducer;
