export interface CompletionStatus {
    percentage: number;
    missingFields: string[];
    status: 'incomplete' | 'partially-complete' | 'complete';
    lastUpdated?: string;
}

export interface StatusState {
    data: CompletionStatus | null;
    isLoading: boolean;
    error: string | null;
}