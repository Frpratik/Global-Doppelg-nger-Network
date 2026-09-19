"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FaceService } from "@/services/face.service";
import { QualityChecklist } from "@/components/enrollment/QualityChecklist";
import { QualityAssessment } from "@/types/domain";
import { 
  Camera, Upload, ShieldCheck, CheckCircle2, 
  AlertCircle, RefreshCw, ArrowRight, VideoOff 
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
      setError("Camera access was not permitted. You can still enroll by uploading a clear portrait photo.");
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
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded border border-brand-cyan/20">
          Biometric Profile Ingestion
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mt-3">
          Enroll Your Face Profile
        </h1>
        <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
          Position yourself directly facing the camera with balanced lighting. Our pipeline validates sharpness, single-face presence, and extracts a normalized 512-d feature vector.
        </p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-3.5 rounded-lg bg-status-dangerBg border border-status-danger/30 text-status-danger text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Viewport */}
        <div className="lg:col-span-7 surface-card rounded-2xl p-6 border border-surface-border">
          {/* Mode Switcher */}
          {!capturedImage && (
            <div className="flex items-center gap-2 mb-4 p-1 rounded-lg bg-surface-elevated border border-surface-border">
              <button
                type="button"
                onClick={() => setMode("camera")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  mode === "camera"
                    ? "bg-brand-cyan text-black font-semibold shadow-sm"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera
              </button>
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  mode === "upload"
                    ? "bg-brand-cyan text-black font-semibold shadow-sm"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
            </div>
          )}

          {/* Viewport Frame */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-subtle border border-surface-border flex items-center justify-center">
            {capturedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Captured Portrait"
                  className="w-full h-full object-cover"
                />
                {qualityData?.face_box && (
                  <div
                    className="absolute border border-brand-cyan rounded shadow-sm pointer-events-none"
                    style={{
                      left: `${(qualityData.face_box[0] / 640) * 100}%`,
                      top: `${(qualityData.face_box[1] / 480) * 100}%`,
                      width: `${(qualityData.face_box[2] / 640) * 100}%`,
                      height: `${(qualityData.face_box[3] / 480) * 100}%`,
                    }}
                  >
                    <span className="bg-brand-cyan text-black text-[9px] font-mono font-bold px-1 py-0.2 rounded-br block w-fit">
                      1 FACE ({Math.round(qualityData.quality_score * 100)}%)
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
                  <div className="w-40 h-52 rounded-full border border-dashed border-brand-cyan/60" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Upload className="w-8 h-8 text-content-muted mb-2 opacity-60" />
                <p className="text-xs font-semibold text-content-primary">Select a portrait photo</p>
                <p className="text-[11px] text-content-muted mt-0.5">JPEG, PNG or WebP up to 10MB</p>
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
                  className="mt-3.5 px-4 py-2 rounded-lg text-xs font-medium bg-surface-elevated text-content-primary border border-surface-border hover:border-brand-cyan/40 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex items-center gap-3">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-lg text-xs font-medium text-content-secondary bg-surface-elevated hover:text-content-primary border border-surface-border transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling || checkingQuality || !qualityData?.acceptable}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-brand-cyan text-black hover:bg-brand-cyanHover shadow-buttonPrimary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                >
                  {enrolling ? "Encoding 512-D Vector..." : "Confirm & Enroll Face Profile"}
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </>
            ) : mode === "camera" ? (
              <button
                type="button"
                onClick={capturePhoto}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-brand-cyan text-black hover:bg-brand-cyanHover shadow-buttonPrimary flex items-center justify-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-black" />
                Capture Selfie
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
