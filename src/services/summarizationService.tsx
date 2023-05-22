import { SummarizationResponse } from '@/types/summarization';
import axios, { AxiosResponse } from 'axios';

// Summarization Service for handling summarization operations
class SummarizationService{
    // Get all summarizations by user
    static async getByUser(jwt: string): Promise<[SummarizationResponse]> { 
        try {
            // Form url endpoint for getting all summarizations by user
            const url = `${process.env.NEXT_PUBLIC_API_URL}/summarization/`;   
            // Set headers for getting all summarizations by user
            const headers = {
                // Accept json
                'Accept': 'application/json',
                // Set content type to json
                'Content-Type': 'application/json',
                // Set authorization to jwt token
                'Authorization': `Bearer ${jwt}`
            };
            // Send get request to get all summarizations by user
            const response: AxiosResponse = await axios.get(url, { headers });
            // Return response
            return response.data;    
        } catch(error) {
            throw error;
        }
    }

    // Create a new summarization
    static async create(jwt: string, ytUrl: string): Promise<SummarizationResponse> {
        try {
            // Form url endpoint for creating a new summarization
            const url = `${process.env.NEXT_PUBLIC_API_URL}/summarization/`;

            // Set headers for creating a new summarization
            const headers = {
            // Accept json
            'Accept': 'application/json',
            // Set content type to json
            'Content-Type': 'application/json',
            // Set authorization to jwt token
            'Authorization': `Bearer ${jwt}`
            };

            // Set data for creating a new summarization
            const data = {
            youtube_video_url: ytUrl
            };

            // Set the timeout duration in milliseconds (e.g., 60 seconds)
            const timeoutDuration = 60000;

            // Send post request to create a new summarization with timeout
            const response: AxiosResponse = await axios.post(url, data, {
            headers,
            timeout: timeoutDuration
            });
            // Return response
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default SummarizationService;