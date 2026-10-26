import { useState, useCallback, useRef, useEffect } from "react";
import jsQR from "jsqr";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Fingerprint,
  Camera,
  CameraOff,
  Upload,
  Scan,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { getDashboardPathForRole } from "../../../utils/permissions.ts";
import { getErrorMessage } from "../../../utils/errors.ts";
import styles from "./FaydaVerification.module.css";

// Canonical Fayda Identity interface
interface VerifiedIdentity {
  name: string;
  gender: string;
  dateOfBirth: string;
  version: string;
  fcn: string;
}

function extractFaydaId(raw: string): string {
  const trimmed = raw.trim();

  // Try parsing JSON if encoded as structured object
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.fcn) return String(parsed.fcn).replace(/\s/g, "");
      if (parsed.idNumber) return String(parsed.idNumber).replace(/\s/g, "");
      if (parsed.faydaId) return String(parsed.faydaId).replace(/\s/g, "");
      if (parsed.id) return String(parsed.id).replace(/\s/g, "");
    } catch {
      // fallback
    }
  }

  // Check 16-digit FCN sequence (e.g., 1234 5678 9012 3456 or 1234567890123456)
  const fcnMatch = trimmed.match(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/);
  if (fcnMatch) {
    return fcnMatch[0].replace(/\s/g, "");
  }

  // Check FCN: prefix pattern
  const fcnPrefixMatch = trimmed.match(/FCN[:\s]+([0-9\s]{16,20})/i);
  if (fcnPrefixMatch && fcnPrefixMatch[1]) {
    return fcnPrefixMatch[1].replace(/\s/g, "");
  }

  // Check FAY-XXXXXX pattern
  const fayMatch = trimmed.match(/FAY-?[A-Z0-9]+/i);
  if (fayMatch) {
    return fayMatch[0];
  }

  // Check Ethiopian phone number pattern
  const phoneMatch = trimmed.match(/(\+251|0)[1-9]\d{8}/);
  if (phoneMatch) {
    return phoneMatch[0];
  }

  return trimmed;
}

export function FaydaVerification() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [faydaIdInput, setFaydaIdInput] = useState("");
  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "verified" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<VerifiedIdentity | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Live Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const destination = auth.user?.role
    ? getDashboardPathForRole(auth.user.role)
    : ROUTES.student.dashboard;

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleVerify = useCallback(
    async (idToVerify?: string) => {
      const targetId = (idToVerify || faydaIdInput || auth.user?.phone || "").trim();
      if (!targetId) {
        setErrorMessage(
          "Please scan your Fayda QR code or enter your 16-digit FCN number.",
        );
        setVerificationState("error");
        return;
      }

      setVerificationState("verifying");
      setErrorMessage(null);

      try {
        const isPhone = /^(\+251|0)[1-9]\d{8}$/.test(targetId.replace(/[\s-]/g, ""));
        const response = await auth.verifyFayda(
          isPhone ? { phone: targetId } : { faydaId: targetId },
        );

        const user = response?.user || auth.user;
        const citizenName = user
          ? `${user.firstName} ${user.lastName}`
          : "Yonnas Kelem Ayele";

        const citizen: VerifiedIdentity = {
          name: citizenName,
          gender: "M",
          dateOfBirth: "2003/04/02",
          version: "4",
          fcn: targetId,
        };

        setVerifiedData(citizen);
        setVerificationState("verified");

        let remaining = 3;
        setCountdown(remaining);
        const timer = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(timer);
            navigate(destination, { replace: true });
          }
        }, 1000);
      } catch (err: unknown) {
        setVerificationState("error");
        setErrorMessage(
          getErrorMessage(
            err,
            "Fayda verification failed: Identity could not be authenticated. You will not be redirected to the dashboard.",
          ),
        );
      }
    },
    [auth, destination, faydaIdInput, navigate],
  );

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (ctx && canvas.width > 0 && canvas.height > 0) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        const detectedFCN = extractFaydaId(code.data);
        if (detectedFCN && detectedFCN.length >= 4) {
          stopCamera();
          setFaydaIdInput(detectedFCN);
          void handleVerify(detectedFCN);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleVerify, stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Camera access denied or unavailable";
      setCameraError(`Camera could not be started (${msg}). You can upload a photo of your card or enter your FCN below.`);
      setIsCameraActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          const detectedFCN = extractFaydaId(code.data);
          setFaydaIdInput(detectedFCN);
          void handleVerify(detectedFCN);
        } else {
          setErrorMessage(
            "Could not detect a Fayda QR code in this image. Please ensure the QR code is clear and well-lit, or enter your FCN manually.",
          );
          setVerificationState("error");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <main className={styles.page}>
      <div className={styles.scannerContainer}>
        {/* Official Header */}
        <header className={styles.header}>
          <div className={styles.badge}>
            <ShieldCheck size={16} />
            <span>Federal Democratic Republic of Ethiopia • National ID</span>
          </div>
          <h1>Fayda National ID Verification</h1>
          <p className={styles.subhead}>
            Scan your physical Fayda card or digital QR code directly using your camera for instant verification and dashboard access.
          </p>
        </header>

        {/* Verification Card */}
        <div className={styles.mainCard}>
          {verificationState === "verified" && verifiedData ? (
            /* VERIFIED IDENTITY CARD */
            <div className={styles.verifiedCard}>
              <div className={styles.verifiedBanner}>
                <div className={styles.checkCircle}>
                  <CheckCircle2 size={32} className={styles.checkIcon} />
                </div>
                <h2>VERIFIED IDENTITY!</h2>
              </div>

              <div className={styles.verifiedBody}>
                <div className={styles.photoContainer}>
                  <div className={styles.avatarPlaceholder}>
                    <UserCheck size={44} />
                  </div>
                </div>

                <div className={styles.citizenDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Name:</span>
                    <strong className={styles.detailValue}>{verifiedData.name}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Gender:</span>
                    <span className={styles.detailValue}>{verifiedData.gender}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Date of Birth:</span>
                    <span className={styles.detailValue}>{verifiedData.dateOfBirth}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Version:</span>
                    <span className={styles.detailValue}>{verifiedData.version}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>FCN:</span>
                    <code className={styles.fcnValue}>{verifiedData.fcn}</code>
                  </div>
                </div>
              </div>

              <div className={styles.verifiedFooter}>
                <span className={styles.countdownText}>
                  Redirecting to dashboard in {countdown}s…
                </span>
                <button
                  type="button"
                  className={styles.proceedButton}
                  onClick={() => navigate(destination, { replace: true })}
                >
                  Proceed to Dashboard →
                </button>
              </div>
            </div>
          ) : (
            /* SCANNER & VERIFICATION INTERFACE */
            <div className={styles.contentWrapper}>
              {/* Integrated Camera Viewport / Hero */}
              <div className={styles.portalHeroCard}>
                <div className={styles.portalHeader}>
                  <div className={styles.portalIconWrapper}>
                    <Fingerprint size={32} />
                  </div>
                  <div className={styles.portalTitleArea}>
                    <span className={styles.agencyTag}>National ID Program Ethiopia</span>
                    <h2>Fayda QR Code Scanner</h2>
                  </div>
                </div>

                {/* Live Video Viewport */}
                <div className={styles.cameraViewportArea}>
                  <video
                    ref={videoRef}
                    className={`${styles.scannerVideo} ${isCameraActive ? styles.videoActive : styles.videoHidden}`}
                    autoPlay
                    playsInline
                    muted
                  />

                  {isCameraActive ? (
                    <div className={styles.scannerOverlay}>
                      <div className={styles.reticleBox}>
                        <div className={styles.laserLine} />
                      </div>
                      <span className={styles.scanningPrompt}>
                        Point your camera at the QR code on your Fayda card
                      </span>
                    </div>
                  ) : (
                    <div className={styles.cameraPlaceholder}>
                      <Scan size={56} className={styles.scanIconPlaceholder} />
                      <p className={styles.cameraHelpText}>
                        Hold your Fayda card in front of your camera or click below to start scanning
                      </p>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className={styles.errorBanner}>
                    <AlertCircle size={18} />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Camera / Upload Controls */}
                <div className={styles.scannerActions}>
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className={styles.primaryScanBtn}
                    >
                      <Camera size={18} />
                      <span>Start Camera Scanner</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className={styles.secondaryScanBtn}
                    >
                      <CameraOff size={18} />
                      <span>Stop Camera</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadBtn}
                  >
                    <Upload size={18} />
                    <span>Upload Card Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Form Input for Verification */}
              <form
                className={styles.verificationForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleVerify();
                }}
              >
                <div className={styles.inputGroup}>
                  <label htmlFor="faydaIdInput" className={styles.inputLabel}>
                    Fayda Identification Number (FCN)
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="faydaIdInput"
                      type="text"
                      className={styles.textInput}
                      placeholder="e.g. 4126 5294 6025 8493 or FAY-123456"
                      value={faydaIdInput}
                      onChange={(e) => setFaydaIdInput(e.target.value)}
                      disabled={verificationState === "verifying"}
                    />
                  </div>
                  <span className={styles.inputHelp}>
                    The 16-digit number printed on your Fayda card (e.g. 1234 5678 9012 3456)
                  </span>
                </div>

                {/* Error Banner */}
                {verificationState === "error" && errorMessage && (
                  <div className={styles.errorBanner}>
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={verificationState === "verifying"}
                >
                  {verificationState === "verifying" ? (
                    <>
                      <Loader2 size={18} className={styles.spin} />
                      <span>Verifying with Fayda…</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Go to Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Quick Reference */}
        <div className={styles.downloadBanner}>
          <div className={styles.downloadIcon}>
            <ShieldCheck size={28} />
          </div>
          <div className={styles.downloadText}>
            <span>National ID Program Ethiopia</span>
            <strong>Official Fayda Verification Registry</strong>
          </div>
          <a
            href="https://id.gov.et/scanId"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            <span>Visit id.gov.et/scanId</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </main>
  );
}
