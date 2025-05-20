"use client";

import { useState, useEffect, useRef } from "react";

// Define TypeScript interfaces
interface Device {
  deviceId: string;
  label: string;
}

export default function VideoAudioTestScreen() {
  // State for devices
  const [cameras, setCameras] = useState<Device[]>([]);
  const [microphones, setMicrophones] = useState<Device[]>([]);
  const [speakers, setSpeakers] = useState<Device[]>([]);
  
  // Selected devices
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  
  // Stream state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // On mount, get available devices
  useEffect(() => {
    // Initialize devices
    getAvailableDevices();
    
    // Cleanup function
    return () => {
      stopMediaTracks();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // When selected devices change, update the stream
  useEffect(() => {
    if (selectedCamera || selectedMicrophone) {
      startMediaStream();
    }
  }, [selectedCamera, selectedMicrophone]);

  // When stream changes, update video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Set up audio analysis if we have audio tracks
      if (stream.getAudioTracks().length > 0) {
        setupAudioAnalysis(stream);
      }
    }
  }, [stream]);

  // Get all available media devices
  const getAvailableDevices = async () => {
    try {
      // Request permission first by getting a stream
      const initialStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Get all devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      // Filter by type
      const videoInputs = devices.filter(device => device.kind === 'videoinput')
        .map(device => ({ deviceId: device.deviceId, label: device.label || `Camera ${devices.indexOf(device) + 1}` }));
      
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
        .map(device => ({ deviceId: device.deviceId, label: device.label || `Microphone ${devices.indexOf(device) + 1}` }));
      
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput')
        .map(device => ({ deviceId: device.deviceId, label: device.label || `Speaker ${devices.indexOf(device) + 1}` }));
      
      // Set state
      setCameras(videoInputs);
      setMicrophones(audioInputs);
      setSpeakers(audioOutputs);
      
      // Set default selections
      if (videoInputs.length > 0) setSelectedCamera(videoInputs[0].deviceId);
      if (audioInputs.length > 0) setSelectedMicrophone(audioInputs[0].deviceId);
      if (audioOutputs.length > 0) setSelectedSpeaker(audioOutputs[0].deviceId);
      
      // Stop the initial stream tracks
      initialStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Error getting devices:", error);
      alert("Please allow camera and microphone access to use this test screen.");
    }
  };

  // Start media stream with selected devices
  const startMediaStream = async () => {
    // Stop any existing tracks
    stopMediaTracks();
    
    const constraints: MediaStreamConstraints = {};
    
    if (selectedCamera) {
      constraints.video = { deviceId: { exact: selectedCamera } };
    }
    
    if (selectedMicrophone) {
      constraints.audio = { deviceId: { exact: selectedMicrophone } };
    }
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
    } catch (error) {
      console.error("Error starting media stream:", error);
    }
  };

  // Stop all media tracks
  const stopMediaTracks = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  // Set up audio analysis for visualizing microphone input
  const setupAudioAnalysis = (mediaStream: MediaStream) => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    
    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const audioSource = audioContext.createMediaStreamSource(mediaStream);
    audioSource.connect(analyser);
    
    audioAnalyserRef.current = analyser;
    
    // Start analyzing audio levels
    analyzeAudio();
  };

  // Analyze audio levels
  const analyzeAudio = () => {
    if (!audioAnalyserRef.current) return;
    
    const analyser = audioAnalyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateAnalysis = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Update audio level state (0-100 scale)
      setAudioLevel(Math.min(100, average * 2));
      
      // Continue analyzing
      animationFrameRef.current = requestAnimationFrame(updateAnalysis);
    };
    
    updateAnalysis();
  };

  // Toggle microphone test
  const toggleMicrophoneTest = () => {
    if (!stream) return;
    
    // Simply restart the stream to reset audio analysis
    startMediaStream();
  };

  // Handle start interview button
  const handleStartInterview = () => {
    alert("Starting interview with selected devices:\nCamera: " +
      cameras.find(c => c.deviceId === selectedCamera)?.label +
      "\nMicrophone: " + microphones.find(m => m.deviceId === selectedMicrophone)?.label +
      "\nSpeaker: " + speakers.find(s => s.deviceId === selectedSpeaker)?.label);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-10 border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900"> Aud. and Vid. Test</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Camera Preview */}
          <div className="md:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
                  <p className="text-white text-lg font-medium">Camera feed not active</p>
                </div>
              )}
            </div>
          </div>
  
          {/* Device Controls */}
          <div className="space-y-6">
            {/* Camera */}
            <div>
              <label className="block font-semibold mb-1 text-gray-800"> Select Camera</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label.length > 60 ? camera.label.slice(0, 57) + "..." : camera.label}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Microphone */}
            <div>
              <label className="block font-semibold mb-1 text-gray-800"> Select Microphone</label>
              <select
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
              >
                {microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label.length > 60 ? mic.label.slice(0, 57) + "..." : mic.label}
                  </option>
                ))}
              </select>
  
              {/* Mic Level */}
              <div className="mt-3">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Mic Level: {Math.round(audioLevel)}%</p>
              </div>
  
              <button
                onClick={toggleMicrophoneTest}
                className="mt-3 w-full py-2.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
              >
                 Test Microphone
              </button>
            </div>
  
            {/* Speaker */}
            <div>
              <label className="block font-semibold mb-1 text-gray-800"> Select Speaker</label>
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
              >
                {speakers.map((speaker) => (
                  <option key={speaker.deviceId} value={speaker.deviceId}>
                    {speaker.label.length > 60 ? speaker.label.slice(0, 57) + "..." : speaker.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
  
        {/* Start Interview Button */}
        {/* <div className="mt-10 flex justify-center">
          <button
            onClick={handleStartInterview}
            className="px-8 py-3.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-lg transition focus:ring-2 focus:ring-green-300"
          >
            test interview
          </button>
        </div> */}
      </div>
    </div>
  );
}  