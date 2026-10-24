import type { CSSProperties } from "react";
import { Logo } from "../Logo/Logo.tsx";
import styles from "./BrandLogo.module.css";

interface BrandLogoProps {
  /** Show the "ShumShufer" wordmark next to the mark. Default true. */
  nameText?: boolean;
  /** Height of the logo mark; the wordmark scales with it. */
  markSize?: number | string;
  /** Use on dark backgrounds so the lockup follows the parent text color. */
  tone?: "auto" | "inverse";
  className?: string;
}

export function BrandLogo({
  nameText = true,
  markSize = 34,
  tone = "auto",
  className,
}: BrandLogoProps) {
  const classes = [
    styles.brand,
    tone === "inverse" ? styles.inverse : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      style={
        {
          "--brand-mark-size":
            typeof markSize === "number" ? `${markSize}px` : markSize,
        } as CSSProperties
      }
    >
      <Logo className={styles.mark} size="100%" />
      {nameText && <span className={styles.name}>ShumShufer</span>}
    </span>
  );
}
