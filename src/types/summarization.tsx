// Type definitions for summarization
export interface SummarizationData{
    transcript: string;
    summary: string;
}

export interface SummarizationResponse {
    id: number;
    youtube_video_id: string;
    title: string;
}