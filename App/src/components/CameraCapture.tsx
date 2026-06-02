"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, Check, RefreshCw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCapture, setHasCapture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setHasCapture(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Camera not accessible. Allow camera permission or use file upload instead.");
    }
  }, []);

  useEffect(() => {
    if (isOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    setHasCapture(true);
    stopCamera();
  };

  const retake = () => {
    setHasCapture(false);
    startCamera();
  };

  const confirm = () => {
    canvasRef.current?.toBlob((blob) => {
      if (blob) {
        onCapture(new File([blob], "camera-capture.jpg", { type: "image/jpeg" }));
        setIsOpen(false);
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
      >
        <Camera size={18} />
        Take Photo
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-900 flex items-center gap-2">
                <Camera size={18} className="text-brand-orange" />
                Camera Capture
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-black relative" style={{ aspectRatio: "4/3" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${hasCapture ? "hidden" : ""}`}
              />
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover ${hasCapture ? "" : "hidden"}`}
              />
              {error && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p className="text-white text-sm font-bold text-center">{error}</p>
                </div>
              )}
            </div>

            <div className="p-4 flex gap-3">
              {!hasCapture ? (
                <button
                  type="button"
                  onClick={capture}
                  disabled={!!error}
                  className="flex-1 bg-brand-orange hover:bg-brand-dark-orange text-white py-3 rounded-2xl font-black disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Camera size={18} />
                  Capture
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={retake}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw size={18} />
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={confirm}
                    className="flex-1 bg-brand-orange hover:bg-brand-dark-orange text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Check size={18} />
                    Use Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
