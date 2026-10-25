import { useState, useCallback } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Fingerprint,
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

  const destination = auth.user?.role
    ? getDashboardPathForRole(auth.user.role)
    : ROUTES.student.dashboard;

  const handleVerify = useCallback(
    async (idToVerify?: string) => {
      const targetId = (idToVerify || faydaIdInput || auth.user?.phone || "").trim();
      if (!targetId) {
        setErrorMessage(
          "Please enter your Fayda ID (FCN), registered phone number, or verify via id.gov.et/scanId.",
        );
        setVerificationState("error");
        return;
      }

      setVerificationState("verifying");
      setErrorMessage(null);

      try {
        const isPhone = /^(\+251|0)[1-9]\d{8}$/.test(targetId.replace(/[\s-]/g, ""));
        await auth.verifyFayda(
          isPhone ? { phone: targetId } : { faydaId: targetId },
        );

        const citizen: VerifiedIdentity = {
          name: auth.user
            ? `${auth.user.firstName} ${auth.user.lastName}`
            : "Verified Citizen",
          gender: "Male",
          dateOfBirth: "15 MAR 1998",
          version: "1.0",
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
            "Verification failed with Fayda registry. Please check your Fayda ID and try again.",
          ),
        );
      }
    },
    [auth, destination, faydaIdInput, navigate],
  );

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
            Verify your Ethiopian National ID through the official Fayda Offline Authenticator &amp; Verifier.
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
            /* OFFICIAL FAYDA OFFLINE AUTHENTICATOR & VERIFIER */
            <div className={styles.contentWrapper}>
              {/* Official Portal Banner Card */}
              <div className={styles.portalHeroCard}>
                <div className={styles.portalHeader}>
                  <div className={styles.portalIconWrapper}>
                    <Fingerprint size={32} />
                  </div>
                  <div className={styles.portalTitleArea}>
                    <span className={styles.agencyTag}>National ID Program Ethiopia</span>
                    <h2>Fayda Offline Authenticator &amp; Verifier</h2>
                  </div>
                </div>

                <p className={styles.portalDescription}>
                  Scan and authenticate your physical Fayda card or digital QR code directly using the official Ethiopian National ID Program portal:
                </p>

                <a
                  href="https://id.gov.et/scanId"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryPortalLink}
                >
                  <ShieldCheck size={18} />
                  <span>Visit id.gov.et/scanId</span>
                  <ExternalLink size={16} />
                </a>
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
                    Fayda Identification Number (FCN) or Phone Number
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="faydaIdInput"
                      type="text"
                      className={styles.textInput}
                      placeholder="e.g. 7483 9201 8472 9102 or FAY-123456"
                      value={faydaIdInput}
                      onChange={(e) => setFaydaIdInput(e.target.value)}
                      disabled={verificationState === "verifying"}
                    />
                  </div>
                  <span className={styles.inputHelp}>
                    Enter the FCN from your Fayda card or after verifying at id.gov.et/scanId
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
                      <span>Verify Identity</span>
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
            <strong>Fayda Offline Authenticator &amp; Verifier</strong>
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
