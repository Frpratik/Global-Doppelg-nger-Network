"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
import { 
  Camera, Upload, ShieldCheck, Sparkles, CheckCircle2, 
  AlertCircle, RefreshCw, Eye, ArrowRight, Video, VideoOff
} from "lucide-react";

export default function EnrollPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [qualityData, setQualityData] = useState<any | null>(null);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setError("Unable to access camera. Please allow webcam permissions or use the upload option.");
      setMode("upload");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  // Capture Photo from Webcam
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
    await evaluateQuality(dataUrl);
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      await evaluateQuality(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Evaluate Quality via Backend API
  const evaluateQuality = async (base64Img: string) => {
    setCheckingQuality(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image_base64", base64Img);
      const res = await ApiClient.checkQuality(formData);
      setQualityData(res);
    } catch (err: any) {
      setError(err.message || "Quality check failed.");
      setQualityData(null);
    } finally {
      setCheckingQuality(false);
    }
  };

  // Submit Enrollment
  const handleEnroll = async () => {
    if (!capturedImage) return;
    setEnrolling(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image_base64", capturedImage);
      await ApiClient.enrollFace(formData);
      await refreshUser();
      router.push("/enroll/success");
    } catch (err: any) {
      setError(err.message || "Enrollment failed. Please try a clearer portrait.");
    } finally {
      setEnrolling(false);
    }
  };

  // Reset / Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setQualityData(null);
    setError(null);
    if (mode === "camera") {
      startCamera();
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Single-Person Enrollment • Privacy Protected</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Enroll Your Visual Profile
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto mt-2">
          Position your face clearly. Our neural pipeline verifies image quality, aligns landmarks, and generates a 512-d normalized embedding.
        </p>
      </div>

      {error && (
        <div className="mb-8 max-w-2xl mx-auto p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Camera / Image Capture Box */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-cyan-500/20">
          {/* Mode Switcher */}
          {!capturedImage && (
            <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setMode("camera")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === "camera"
                    ? "bg-[#00F0FF] text-black shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Camera
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === "upload"
                    ? "bg-[#00F0FF] text-black shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
            </div>
          )}

          {/* Viewport Frame */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {capturedImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured Portrait"
                  className="w-full h-full object-cover"
                />
                {/* Bounding box visualizer if returned */}
                {qualityData?.face_box && (
                  <div
                    className="absolute border-2 border-[#00F0FF] rounded-lg shadow-lg shadow-cyan-500/40 pointer-events-none"
                    style={{
                      left: `${(qualityData.face_box[0] / 640) * 100}%`,
                      top: `${(qualityData.face_box[1] / 480) * 100}%`,
                      width: `${(qualityData.face_box[2] / 640) * 100}%`,
                      height: `${(qualityData.face_box[3] / 480) * 100}%`,
                    }}
                  >
                    <div className="bg-[#00F0FF] text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-br">
                      FACE {qualityData.quality_score * 100}%
                    </div>
                  </div>
                )}
              </div>
            ) : mode === "camera" ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Visual Facial Alignment Oval Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-56 rounded-full border-2 border-dashed border-cyan-400/60 shadow-2xl animate-pulse-slow" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Upload className="w-12 h-12 text-slate-500 mb-3" />
                <p className="text-sm font-semibold text-white">Select a clear portrait</p>
                <p className="text-xs text-slate-500 mt-1">JPEG, PNG or WebP up to 10MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
                >
                  Browse Image
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-between gap-4">
            {capturedImage ? (
              <>
                <button
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake Photo
                </button>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || checkingQuality || !qualityData?.acceptable}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enrolling ? "Encoding 512-D Vector..." : "Confirm & Enroll Face"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : mode === "camera" ? (
              <button
                onClick={capturePhoto}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Capture Selfie
              </button>
            ) : null}
          </div>
        </div>

        {/* Right Column: AI Quality Checklist & Live Diagnostics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-cyan-500/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              AI Quality Diagnostics
            </h3>

            {checkingQuality ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                <span className="text-xs text-slate-400 font-mono">Running Face Quality Engine...</span>
              </div>
            ) : qualityData ? (
              <div className="space-y-4">
                {/* Composite Score Bar */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">Overall Quality Index</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {Math.round(qualityData.quality_score * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        qualityData.acceptable ? "bg-gradient-to-r from-cyan-400 to-emerald-400" : "bg-rose-500"
                      }`}
                      style={{ width: `${qualityData.quality_score * 100}%` }}
                    />
                  </div>
                </div>

                {/* Individual Checklist Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">Single Face Detected</span>
                    {qualityData.face_count === 1 ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Exactly 1 Face
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {qualityData.face_count} Faces
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">Sharpness (Laplacian)</span>
                    <span className="font-mono text-cyan-300">
                      {qualityData.blur_score} / 60 min
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">Lighting Balance</span>
                    <span className="font-mono text-cyan-300">
                      {qualityData.brightness_score} (Normal)
                    </span>
                  </div>
                </div>

                {/* Warnings if any */}
                {qualityData.warnings.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                    {qualityData.warnings.map((w: string, i: number) => (
                      <p key={i}>• {w}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                <p>Take or upload a photo to view real-time quality validation results.</p>
                <p className="text-[11px] text-slate-600">
                  Ensure frontal orientation, neutral lighting, and no sunglasses or heavy face occlusions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
