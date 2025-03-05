import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { creditsApi } from './creditsApi';

// Define types
export interface CreditsState {
  loading: boolean;
  error: string | null;
  purchaseHistory: PurchaseRecord[];
}

export interface PurchaseRecord {
  id: string;
  amount: number;
  cost: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// Initial state
const initialState: CreditsState = {
  loading: false,
  error: null,
  purchaseHistory: [],
};

// Create slice
const creditsSlice = createSlice({
  name: 'credits',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    setPurchaseHistory: (state, action: PayloadAction<PurchaseRecord[]>) => {
      state.purchaseHistory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getUserCredits
      .addMatcher(creditsApi.endpoints.getUserCredits.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(
        creditsApi.endpoints.getUserCredits.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.purchaseHistory = action.payload.transactions.map((tx) => ({
            id: tx.reference,
            amount: tx.amount,
            cost: tx.amount,
            date: tx.timestamp,
            status: 'completed',
          }));
        }
      )
      .addMatcher(
        creditsApi.endpoints.getUserCredits.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'An error occurred';
        }
      )

      // Handle purchaseCredits
      .addMatcher(
        creditsApi.endpoints.purchaseCredits.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        creditsApi.endpoints.purchaseCredits.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.purchaseHistory.push(action.payload);
        }
      )
      .addMatcher(
        creditsApi.endpoints.purchaseCredits.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'An error occurred';
        }
      );
  },
});

// Export actions and reducer
export const { clearErrors, setPurchaseHistory } = creditsSlice.actions;

// Selectors
export const selectCreditsLoading = (state: RootState) => state.credits.loading;
export const selectCreditsError = (state: RootState) => state.credits.error;
export const selectPurchaseHistory = (state: RootState) =>
  state.credits.purchaseHistory;

export default creditsSlice.reducer;
