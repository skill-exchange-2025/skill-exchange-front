export interface SummarizerParams {
    max_length: number;
    min_length: number;
    do_sample: boolean;
}

export interface SummarizerRequest {
    inputs: string;
    parameters: SummarizerParams;
}

export interface SummaryResponse {
    summary_text: string;
    [key: string]: any; // For any additional fields returned by the API
}