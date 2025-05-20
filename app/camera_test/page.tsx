"use client";
import { useEffect, useRef, useState } from "react";

export default function InterviewTest() {
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedCam, setSelectedCam] = useState<string>("");

  const [micLevel, setMicLevel] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((d) => d.kind === "audioinput");
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setAudioInputDevices(audioInputs);
      setVideoInputDevices(videoInputs);
      if (audioInputs[0]) setSelectedMic(audioInputs[0].deviceId);
      if (videoInputs[0]) setSelectedCam(videoInputs[0].deviceId);
    });
  }, []);

  const startInterview = async () => {
    setInterviewStarted(true);

    // Start Microphone
    if (selectedMic) {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMic },
      });
      micStreamRef.current = micStream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(micStream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      const updateMicLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
        setMicLevel(avg);
        if (interviewStarted) requestAnimationFrame(updateMicLevel);
      };
      updateMicLevel();
    }

    // Start Camera
    if (selectedCam && videoRef.current) {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCam },
      });
      videoStreamRef.current = videoStream;
      videoRef.current.srcObject = videoStream;
      await videoRef.current.play();
    }
  };

  const stopInterview = () => {
    setInterviewStarted(false);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    setMicLevel(0);
  };

  return (
    <main className="min-h-screen bg-gray-700 p-6 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white rounded-xl p-6 space-y-6 shadow">
        <h1 className="text-2xl font-bold text-center text-black">Interview Device Test</h1>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-black mb-1">Camera</label>
            <select
              disabled={interviewStarted}
              value={selectedCam}
              onChange={(e) => setSelectedCam(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 text-black"
            >
              {videoInputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Camera"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Microphone</label>
            <select
              disabled={interviewStarted}
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 text-black"
            >
              {audioInputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Microphone"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Mic Level</label>
            <div className="w-full bg-gray-200 rounded h-3">
              <div
                className="bg-green-500 h-3 rounded"
                style={{ width: `${(micLevel / 255) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Camera Preview</label>
            <video
              ref={videoRef}
              className="w-full border rounded bg-black"
              muted
              autoPlay
              playsInline
              height={240}
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={interviewStarted ? stopInterview : startInterview}
            className={`mt-4 px-6 py-2 rounded text-white font-semibold ${
              interviewStarted ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            {interviewStarted ? "Stop Interview" : "Start Interview"}
          </button>
        </div>
      </div>
    </main>
  );
}
