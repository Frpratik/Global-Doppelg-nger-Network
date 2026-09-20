"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FaceService } from "@/services/face.service";
import { QualityChecklist } from "@/components/enrollment/QualityChecklist";
import { QualityAssessment } from "@/types/domain";
import { 
  Camera, Upload, ShieldCheck, CheckCircle2, 
  AlertCircle, RefreshCw, ArrowRight, VideoOff,
  Lock, Sparkles, Sliders
} from "lucide-react";

export default function EnrollPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [qualityData, setQualityData] = useState<QualityAssessment | null>(null);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Stream
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
      setError("Camera access was not granted. You can still enroll by uploading a clear portrait photo.");
      setMode("upload");
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === "camera" && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, capturedImage]);

  // Capture Frame
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

  // Upload File
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

  // Quality Evaluation
  const evaluateQuality = async (base64Img: string) => {
    setCheckingQuality(true);
    setError(null);
    try {
      const res = await FaceService.evaluateQuality(base64Img);
      setQualityData(res);
    } catch (err: any) {
      setError(err.message || "Quality assessment could not be completed.");
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
      await FaceService.enroll(capturedImage);
      await refreshUser();
      router.push("/enroll/success");
    } catch (err: any) {
      setError(err.message || "Face enrollment failed. Please verify your photo meets quality requirements.");
    } finally {
      setEnrolling(false);
    }
  };

  // Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setQualityData(null);
    setError(null);
    if (mode === "camera") {
      startCamera();
    }
  };

  return (
    <div className="min-h-[85vh] py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Consent-Driven Biometric Setup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Enroll Your Visual Profile
        </h1>
        <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
          Position yourself facing forward with clear lighting. Our neural pipeline verifies quality, extracts a 512-dimensional vector embedding, and enables cosine discovery.
        </p>
      </div>

      {/* Step Progress Tracker */}
      <div className="grid grid-cols-3 gap-3 p-2 rounded-2xl bg-surface-card border border-surface-border text-center text-xs">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center gap-2">
          <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[11px] font-bold">1</span>
          <span className="hidden sm:inline">Portrait Scan</span>
        </div>
        <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold ${qualityData?.acceptable ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-surface-background border-surface-border text-content-muted'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${qualityData?.acceptable ? 'bg-cyan-400 text-black' : 'bg-surface-border text-content-muted'}`}>2</span>
          <span className="hidden sm:inline">Quality Verification</span>
        </div>
        <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold ${enrolling ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-surface-background border-surface-border text-content-muted'}`}>
          <span className="w-5 h-5 rounded-full bg-surface-border text-content-muted flex items-center justify-center text-[11px] font-bold">3</span>
          <span className="hidden sm:inline">512-D Indexing</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Viewport */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-5">
          {/* Mode Switcher */}
          {!capturedImage && (
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-background border border-surface-border">
              <button
                type="button"
                onClick={() => setMode("camera")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === "camera"
                    ? "bg-cyan-500 text-surface-background shadow-sm"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Camera
              </button>
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === "upload"
                    ? "bg-cyan-500 text-surface-background shadow-sm"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
            </div>
          )}

          {/* Viewport Frame */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-background border border-surface-border flex items-center justify-center shadow-inner">
            {capturedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Captured Portrait"
                  className="w-full h-full object-cover"
                />
                {qualityData?.face_box && (
                  <div
                    className="absolute border-2 border-cyan-400 rounded-lg shadow-lg pointer-events-none"
                    style={{
                      left: `${(qualityData.face_box[0] / 640) * 100}%`,
                      top: `${(qualityData.face_box[1] / 480) * 100}%`,
                      width: `${(qualityData.face_box[2] / 640) * 100}%`,
                      height: `${(qualityData.face_box[3] / 480) * 100}%`,
                    }}
                  >
                    <span className="bg-cyan-400 text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded-br-md block w-fit">
                      1 DETECTED FACE ({Math.round(qualityData.quality_score * 100)}%)
                    </span>
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
                {/* Focal Oval Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-64 rounded-full border-2 border-dashed border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center text-cyan-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-content-primary">Select a portrait photo</p>
                  <p className="text-xs text-content-muted mt-0.5">JPEG, PNG or WebP up to 10MB</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-surface-elevated text-content-primary border border-surface-border hover:border-cyan-500/40 transition-colors"
                >
                  Browse Device Files
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-3 rounded-xl text-xs font-semibold text-content-secondary bg-surface-background hover:text-content-primary border border-surface-border transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling || checkingQuality || !qualityData?.acceptable}
                  className="flex-1 py-3 rounded-xl text-xs font-bold bg-cyan-500 text-surface-background hover:bg-cyan-400 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {enrolling ? "Encoding 512-D Vector..." : "Confirm & Index Biometric Profile"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : mode === "camera" ? (
              <button
                type="button"
                onClick={capturePhoto}
                className="w-full py-3 rounded-xl text-xs font-bold bg-cyan-500 text-surface-background hover:bg-cyan-400 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Capture Portrait Photo
              </button>
            ) : null}
          </div>
        </div>

        {/* Right: Quality Checklist */}
        <div className="lg:col-span-5">
          <QualityChecklist assessment={qualityData} loading={checkingQuality} />
        </div>
      </div>
    </div>
  );
}
