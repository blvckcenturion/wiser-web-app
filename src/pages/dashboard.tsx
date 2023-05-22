import LogoSVG from "@/components/logoSVG";
import SummarizationCard from "@/components/summarizationCard";
import { AuthService } from "@/services/authService";
import GoogleCloudStorageService from "@/services/googleStorageService";
import SummarizationService from "@/services/summarizationService";
import { SummarizationData } from "@/types/summarization";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import Notiflix from "notiflix";
import { useEffect, useState } from "react";

export default function Dashboard() {
    // State for showing existing summarizations 
    const [summarizations, setSummarizations] = useState<any>([]);
    // State for showing loading ui for existing summarizations
    const [loadingPreviousSummarizations, setLoadingPreviousSummarizations] = useState<boolean>(true);
    // State for storing an existing summarization id
    const [currentSummarization, setCurrentSummarization] = useState<null | string>(null);
    // State for storing an existing summarization data (transcription and summarization)
    const [currentSummarizationData, setCurrentSummarizationData] = useState<null | SummarizationData>(null);
    // State for showing loading ui for existing summarization data
    const [loadingExistingSummarization, setLoadingExistingSummarization] = useState<boolean>(false);
    // State for showing loading ui when new summarization is being created
    const [loadingNewSummarization, setLoadingNewSummarization] = useState<boolean>(false);
    // State for showing new summarization form
    const [showNewSummarizationForm, setShowNewSummarizationForm] = useState<boolean>(true);
    // State for storing user token
    const [userToken, setUserToken] = useState<string>("");
    // Router for redirecting user
    const router = useRouter();

    useEffect(() => {
        (async () => {
            // Show loading ui for existing summarizations
            setLoadingPreviousSummarizations(true);
            // Check if user is logged in
            const token = await AuthService.getCredentials();
            // Redirect to login/signup if token is not valid
            if (token === null) {
                // If user is not logged in, redirect to login/signup
                router.push("/");
            } else {
                // If user is logged in, set user token
                setUserToken(token);
                // Get all summarizations by user
                let summarizations = await SummarizationService.getByUser(token);
                // Set all summarizations by user
                setSummarizations(summarizations);
            }
            // Hide loading ui for existing summarizations
            setLoadingPreviousSummarizations(false);
        })()
    }, [])

    const loadCurrentSummarization = async (id: string) => { 
        try {
            // Show loading ui for existing summarization data
            setLoadingExistingSummarization(true);
            // Hide new summarization form
            setShowNewSummarizationForm(false);
            // Set current summarization id
            setCurrentSummarization(id);
            // Get summarization and transcript from storage
            let summary = await GoogleCloudStorageService.getFileContent(`summarization-${id}.txt`);
            let transcript = await GoogleCloudStorageService.getFileContent(`transcription-${id}.txt`);
            
            // Check if summarization and transcript are valid
            if (summary == null || transcript == null) {
                throw new Error("Error loading summarization");
            }
            // Set current summarization data
            setCurrentSummarizationData({ summary, transcript });

            // Hide loading ui for existing summarization data
            setLoadingExistingSummarization(false);
            
        } catch (error: any) {
            // If error is from backend, show error response detail
            if (error.response) { 
                Notiflix.Notify.failure(error.response.data.error);
            } else {
                Notiflix.Notify.failure("Error loading summarization ", error.message);
            }
            // Hide loading ui for existing summarization data
            setLoadingExistingSummarization(false);
            // Show new summarization form
            setShowNewSummarizationForm(true);
            // Set current summarization id to null
            setCurrentSummarization(null);
        }
    }

    const newSummarization = () => { 
        // Hide ui for existing summarization data
        setLoadingExistingSummarization(false);
        // Show new summarization form
        setShowNewSummarizationForm(true);
        // Set current summarization id to null
        setCurrentSummarization(null);
    }

    const newSummarizationForm = useFormik(
        {
            initialValues: {
                youtube_video_url: "",
            },
            onSubmit: async (values) => {
                try {
                    // Validate youtube video url
                    // Coming from a youtube video url or a youtube short shareable url
                    let videoIdFromUrl = values.youtube_video_url.split("v=")[1];
                    let videoIdFromShortUrl = values.youtube_video_url.split("be/")[1];
                    let url;
                    // Check if youtube video url is valid and set url to youtube video url
                    if (!videoIdFromUrl && !videoIdFromShortUrl) {
                        throw new Error("Invalid youtube video url");
                    } else if (videoIdFromUrl) {
                        url = `https://www.youtube.com/watch?v=${videoIdFromUrl}`;
                    } else if (videoIdFromShortUrl) {
                        url = `https://www.youtube.com/watch?v=${videoIdFromShortUrl}`;
                    }

                    // Show loading ui for new summarization
                    setLoadingNewSummarization(true);

                    // If url is valid, create new summarization
                    if (url) {

                        // Create new summarization
                        let summarization = await SummarizationService.create(userToken, values.youtube_video_url);
                        
                        // Check if summarization is valid
                        if (summarization) {
                            // Toast success message
                            Notiflix.Notify.success("Summarization created successfully");

                            // Add new summarization to existing summarizations
                            setSummarizations([...summarizations, summarization]);
                            // Load current summarization data
                            loadCurrentSummarization(summarization.youtube_video_id);
                        }
                    }
                } catch (error: any) { 
                    // If error is from backend, show error response detail
                    if (error.response) { 
                        // Toast error message
                        Notiflix.Notify.failure(error.response.data.detail);
                    } else {
                        // Toast error message
                        Notiflix.Notify.failure(error.message);
                    }
                } finally {
                    // Set the input value to empty
                    values.youtube_video_url = "";
                    // Hide loading ui for new summarization
                    setLoadingNewSummarization(false);
                }
            }
        }
    )



    return (
        <>
           <header className="dashboard-header flex justify-between items-center border-b border-[#FF9505] w-full">
                <div className="flex items-center">
                    <LogoSVG />
                    <h2 className="font-semibold text-3xl ml-4">Wiser</h2>
                </div>
                <div>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-4" onClick={() => { AuthService.removeCredentials();  router.push("/")}}>
                        Logout
                    </button>
                </div>
            </header>
            <main className="dashboard-main flex h-screen sm:flex-row flex-col">
            <div className="dashboard-sidebar w-full sm:w-1/6 h-full overflow-auto border-r sm:border-[#FF9505] border-r-[transparent] border-b border-b-[#FF9505] ] flex flex-col items-start p-4 items-center">
                {
                    loadingPreviousSummarizations ? (
                    <div className="flex flex-col items-center space-y-4">
                        <h2 className="font-semibold text-1xl">Loading...</h2>
                        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                    </div>
                    ): (
                        <>
                            <h2 className="font-semibold text-1xl mt-4 text-center">Previous Summarizations</h2>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mt-4" onClick={() => { setShowNewSummarizationForm(true); setCurrentSummarization(null);}}>
                                New Summarization
                            </button>
                            <div className="summarziations-list mt-4">
                                {summarizations.map((summarization: any) => {
                                    return (
                                        <SummarizationCard title={summarization.title} key={summarization.id} onClick={() => loadCurrentSummarization(summarization.youtube_video_id)} selected={currentSummarization == summarization.youtube_video_id} />
                                    )
                                })}
                                {summarizations.length == 0 && (
                                    <div className="flex flex-col items-center space-y-4">
                                        <h2 className="font-semibold text-1xl">No previous summarizations</h2>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                }
                
            </div>
                <div className="dashboard-main-content flex flex-col w-5/6 overflow-auto w-full">
                    {loadingExistingSummarization ? (
                        <div className="summarization-loading flex flex-col items-center space-y-4">
                            <h2 className="font-semibold text-1xl">Loading...</h2>
                            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                        </div>
                    ) : (
                            <>
                                {showNewSummarizationForm ? (
                                    <>
                                        {
                                        loadingNewSummarization ? (
                                                <div className="summarization-loading flex flex-col items-center space-y-4">
                                                    <h2 className="font-semibold text-1xl">Loading... This may take a while</h2>
                                                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                                                </div>
                                            ) : (   
                                            <>
                                                {!loadingPreviousSummarizations && (
                                                    <div className="flex justify-center items-center h-screen flex-col">
                                                    <h2 className="font-semibold text-2xl mt-4 text-center pb-2">New Summarization</h2>
                                                    <form onSubmit={newSummarizationForm.handleSubmit} className="flex flex-col items-center">
                                                    <input
                                                        id="youtubeUrl"
                                                        type="text"
                                                        placeholder="YouTube video URL"
                                                        className="border p-2 rounded mb-2 shadow text-black"
                                                        onChange={newSummarizationForm.handleChange("youtube_video_url")}
                                                        value={newSummarizationForm.values.youtube_video_url}
                                                    />
                                                    <button type="submit" className="bg-orange-500 text-white p-2 rounded">Submit</button>
                                                    </form>
                                                </div>        
                                                )}
                                            </>
                                            
                                        )
                                        }
                                    </>
                                ): (
                                    <>
                                        <div className="summarization-video flex flex-col items-center space-y-4">
                                        <h2 className="font-semibold text-2xl mt-4 text-center pb-2">Video</h2>
                                        <div className="video-content">
                                            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${currentSummarization}`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <h2 className="summarization-transcript font-semibold  pb-2 text-2xl mt-4 text-center">Transcription of the video</h2>
                                            <div className="transcription-content">
                                                        <p className="text-justify mx-10"
                                                        >{currentSummarizationData?.transcript}</p>
                                            </div>      
                                        </div>    
                                        <div>
                                            <h2 className="summarization-summary font-semibold text-2xl pb-2 mt-4 text-center">Summarization of the video</h2>        
                                            <div className="summarization-content">
                                                    <p className="text-justify mx-10"
                                                        >{currentSummarizationData?.summary}</p>
                                            </div>
                                        </div>    
                                    </div>
                                    </>
                                )}
                    </>
                    )}
                </div>
            </main>
        </>
    )
}

