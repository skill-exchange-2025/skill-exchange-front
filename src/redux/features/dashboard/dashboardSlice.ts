import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Period } from '@/types/dashboard';

 export interface DashboardUIState {
    activeTab: string;
    selectedPeriod: Period;
}

const initialState: DashboardUIState = {
    activeTab: 'overview',
    selectedPeriod: 'month'
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<string>) => {
            state.activeTab = action.payload;
        },
        setSelectedPeriod: (state, action: PayloadAction<Period>) => {
            state.selectedPeriod = action.payload;
        }
    }
});

export const { setActiveTab, setSelectedPeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;