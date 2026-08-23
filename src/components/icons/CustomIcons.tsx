/**
 * CustomIcons — SVG icons that are NOT available in lucide-react.
 *
 * Naming convention:  Ci<Name>Icon  (Ci = Custom Icon)
 * This distinguishes them clearly from Lucide icons which are imported directly.
 *
 * Usage:
 *   import { CiSteeringWheelIcon } from '@/components/icons/CustomIcons';
 *   <CiSteeringWheelIcon size={24} />
 */

import React from "react";

interface CustomIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Steering Wheel ───────────────────────────────────────────────────────────
export function CiSteeringWheelIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  className,
  style,
}: CustomIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10" />
      {/* Hub center */}
      <circle cx="12" cy="12" r="2.5" />
      {/* Spokes */}
      <line x1="12" y1="9.5" x2="12" y2="2" />
      <line x1="15" y1="13.2" x2="21.2" y2="16.6" />
      <line x1="9" y1="13.2" x2="2.8" y2="16.6" />
      {/* Grip arc top-left */}
      <path d="M3.5 9 Q6 5 10 4" />
      {/* Grip arc top-right */}
      <path d="M14 4 Q18 5 20.5 9" />
      {/* Grip arc bottom */}
      <path d="M6 18.5 Q12 21.5 18 18.5" />
    </svg>
  );
}

// ─── Road / Highway ───────────────────────────────────────────────────────────
export function CiRoadIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  className,
  style,
}: CustomIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Left road edge */}
      <line x1="3" y1="22" x2="7" y2="2" />
      {/* Right road edge */}
      <line x1="21" y1="22" x2="17" y2="2" />
      {/* Center dashes */}
      <line x1="12" y1="22" x2="12" y2="17" />
      <line x1="12" y1="13" x2="12" y2="9" />
      <line x1="12" y1="5" x2="12" y2="2" />
    </svg>
  );
}

// ─── Ethiopian Flag Star (Pentagram) ─────────────────────────────────────────
export function CiEthiopianStarIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  style,
}: CustomIconProps) {
  // 5-pointed star path centered at (12,12) with radius 10
  const points = Array.from({ length: 5 }, (_, i) => {
    const outer = (i * 72 - 90) * (Math.PI / 180);
    const inner = outer + 36 * (Math.PI / 180);
    return [
      `${12 + 9 * Math.cos(outer)},${12 + 9 * Math.sin(outer)}`,
      `${12 + 4 * Math.cos(inner)},${12 + 4 * Math.sin(inner)}`,
    ];
  }).flat();
  const d = `M ${points[0]} ${points
    .slice(1)
    .map((p) => `L ${p}`)
    .join(" ")} Z`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

// ─── Speedometer / Dashboard ──────────────────────────────────────────────────
export function CiSpeedometerIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  className,
  style,
}: CustomIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Outer arc (half-circle, bottom open) */}
      <path d="M3 14 A9 9 0 0 1 21 14" />
      {/* Tick marks */}
      <line x1="3" y1="14" x2="4.2" y2="11.8" />
      <line x1="12" y1="5" x2="12" y2="7" />
      <line x1="21" y1="14" x2="19.8" y2="11.8" />
      <line x1="5.5" y1="8.5" x2="6.8" y2="9.8" />
      <line x1="18.5" y1="8.5" x2="17.2" y2="9.8" />
      {/* Needle */}
      <line x1="12" y1="14" x2="8" y2="9" strokeWidth="2.2" />
      {/* Hub */}
      <circle cx="12" cy="14" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

// ─── License / ID Card ────────────────────────────────────────────────────────
export function CiLicenseCardIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  className,
  style,
}: CustomIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Card outline */}
      <rect x="2" y="5" width="20" height="14" rx="2" />
      {/* Magnetic stripe */}
      <line x1="2" y1="9" x2="22" y2="9" />
      {/* Photo placeholder */}
      <rect x="4" y="11" width="5" height="5" rx="0.5" />
      {/* Text lines */}
      <line x1="11" y1="12" x2="18" y2="12" />
      <line x1="11" y1="14.5" x2="16" y2="14.5" />
    </svg>
  );
}
