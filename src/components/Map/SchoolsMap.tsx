import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Branch, School } from "../../types/school.types.ts";
import styles from "./SchoolsMap.module.css";

interface SchoolsMapProps {
  schools: School[];
  branches: Branch[];
  variant?: "browse" | "profile";
  className?: string;
}

const markerIcon = L.divIcon({
  className: styles.markerContainer,
  html: `<span class="${styles.marker}"></span>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

function MapFitBounds({ branches }: { branches: Branch[] }) {
  const map = useMap();

  useEffect(() => {
    if (!branches.length) return;
    map.fitBounds(
      L.latLngBounds(
        branches.map((branch) => [branch.latitude, branch.longitude]),
      ),
      {
        padding: [36, 36],
      },
    );
  }, [branches, map]);

  return null;
}

export function SchoolsMap({
  schools,
  branches,
  variant = "browse",
  className = "",
}: SchoolsMapProps) {
  const schoolById = new Map(schools.map((school) => [school.id, school]));

  return (
    <div
      className={[styles.container, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      aria-label="School branch locations"
    >
      <MapContainer
        center={[9.03, 38.74]}
        zoom={12}
        className={styles.map}
        scrollWheelZoom
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFitBounds branches={branches} />
        {branches.map((branch) => (
          <Marker
            key={branch.id}
            position={[branch.latitude, branch.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <div className={styles.popupContent}>
                <strong className={styles.popupTitle}>{branch.name}</strong>
                <span className={styles.popupSchool}>
                  {schoolById.get(branch.schoolId)?.name}
                </span>
                <span className={styles.popupAddress}>{branch.address}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
