import axios, {AxiosResponse} from 'axios';
import {SummarizerRequest, SummaryResponse} from '../types/summarizer';

const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';

const summarizerService = {
    summarizeText: async (text: string): Promise<SummaryResponse[]> => {
        try {
            const request: SummarizerRequest = {
                inputs: text,
                parameters: {
                    max_length: 150,
                    min_length: 30,
                    do_sample: false
                }
            };

            const response: AxiosResponse<SummaryResponse[]> = await axios.post(
                API_URL,
                request,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error in summarization:', error);
            throw error;
        }
    },

    checkModelStatus: async (): Promise<any> => {
        try {
            const response: AxiosResponse = await axios.get(
                API_URL,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error checking model status:', error);
            throw error;
        }
    }
};

export default summarizerService;