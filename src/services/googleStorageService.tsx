import axios, {AxiosResponse} from "axios";

// Google Cloud Storage Service for handling file access operations
class GoogleCloudStorageService{
    
    // Get file content from storage endpoint
    static async getFileContent(fileName: string): Promise<string> {
        try {
            // Send post request to get file content from storage endpoint
            const response: AxiosResponse  = await axios.post('/api/storage', {
                // Set file name
                fileName,
            });

            if (!response.data.content) {
                // Throw error if file content is invalid
                throw new Error("Invalid file content");
            }
            // Return file content
            return response.data.content;
        } catch (error) {
            throw error;
        }
    }
}

export default GoogleCloudStorageService;