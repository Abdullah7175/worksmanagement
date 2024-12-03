'use client'
import React, { useRef, useState } from 'react';
import { Pause, Play, Repeat, Volume2 } from 'lucide-react';

const Page = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [isEnded, setIsEnded] = useState(false); // State to track if the video has ended

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const handleProgressChange = (e) => {
        const newProgress = e.target.value;
        setProgress(newProgress);
        if (videoRef.current) {
            videoRef.current.currentTime =
                (videoRef.current.duration * newProgress) / 100;
        }
    };

    const updateProgress = () => {
        if (videoRef.current) {
            const currentProgress =
                (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleVideoEnd = () => {
        setIsEnded(true); // Set the video as ended
    };

    const handleReplay = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0; // Reset to the start of the video
            videoRef.current.play();
            setIsPlaying(true);
            setIsEnded(false); // Hide replay button
        }
    };

    return (
        <>
            <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-4">
                    Complaint Video Proof
                </h1>
                <p className="mt-2 text-gray-600">
                    Enter relevant details to create a new video.
                </p>
            </div>

            <div className="flex flex-col items-center mt-6">
                {/* Video Player Container */}
                <div className="relative bg-black rounded-lg shadow-lg overflow-hidden lg:w-[850px] aspect-video">
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        preload="metadata"
                        style={{ objectFit: 'contain' }}
                        onTimeUpdate={updateProgress}
                        onEnded={handleVideoEnd} // Trigger when video ends
                    >
                        <source src="/uploads/vid.mp4" type="video/mp4" />
                        <track
                            src="/path/to/captions.vtt"
                            kind="subtitles"
                            srcLang="en"
                            label="English"
                        />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bottom-0 flex items-center justify-center">
                        {!isPlaying && !isEnded && (
                            <button
                                onClick={togglePlayPause}
                                className="p-4 text-white rounded-full shadow-lg focus:outline-none"
                            >
                                <Play />
                            </button>
                        )}
                        {/* Show replay icon if the video ends */}
                        {isEnded && (
                            <button
                                onClick={handleReplay}
                                className="p-4 bg-white text-gray-800 rounded-full shadow-lg focus:outline-none"
                            >
                                <Repeat />
                            </button>
                        )}
                        {/* Show pause button if the video is playing */}
                        {isPlaying && !isEnded && (
                            <button
                                onClick={togglePlayPause}
                                className="p-4 text-white rounded-full shadow-lg focus:outline-none"
                            >
                                <Pause />
                            </button>
                        )}
                    </div>

                    {/* Controls at the Bottom */}
                    <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between space-x-4">
                        {/* Seek Bar */}
                        <div className="flex gap-1 items-center w-full">
                            <button
                                onClick={togglePlayPause}
                                className="text-2xl focus:outline-none text-gray-300"
                            >
                                {isPlaying ? <Pause /> : <Play />}
                            </button>
                            <input
                                type="range"
                                className="flex-1 h-2 bg-gray-500 rounded-lg appearance-none"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress}
                                onChange={handleProgressChange}
                            />
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-300"><Volume2 /></span>
                            <input
                                type="range"
                                className="h-24 w-2 bg-gray-300 rounded-lg"
                                min="0"
                                max="1"
                                step="0.01" // Make volume change more dynamic
                                value={volume}
                                onChange={handleVolumeChange}
                            />
                            {/* Display Volume Percentage */}
                            <span className="text-gray-300">{Math.round(volume * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Page;
