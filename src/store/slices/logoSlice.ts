import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface LogoFormData {
  name: string;
  slogan: string;
  industryId: number | null;
  fontId: string;
  colorId: string;
}

interface LogoState {
  formData: LogoFormData;
  results: unknown[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  createStep: number;
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
        slogan: userData?.slogan ?? '',
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
        return rejectWithValue('Missing required logo generation selections.');
      }

      const response = await axios.post('/api/generate', {
        ...payload,
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(getErrorMessage(error.response?.data));
      }

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState: LogoState = {
  formData: { name: '', slogan: '', industryId: null, fontId: '', colorId: '' },
  results: [],
  status: 'idle',
  error: null,
  createStep: 1,
};

const logoSlice = createSlice({
  name: 'logo',
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<Partial<LogoFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setCreateStep: (state, action: PayloadAction<number>) => {
      state.createStep = Math.max(1, Math.min(4, Number(action.payload) || 1));
    },
    resetLogoProcess: (state) => {
      state.formData = { ...initialState.formData };
      state.results = [];
      state.status = 'idle';
      state.error = null;
      state.createStep = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateLogosAction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.results = [];
        state.createStep = 4;
      })
      .addCase(generateLogosAction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.results = action.payload.data || [];
        state.error = null;
        state.createStep = 4;
      })
      .addCase(generateLogosAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = getErrorMessage(action.payload);
        state.results = [];
        state.createStep = 4;
      });
  },
});

export const { updateFormData, setCreateStep, resetLogoProcess } = logoSlice.actions;
export default logoSlice.reducer;
