import { ApplicationStatus } from "../../../types/common.types.ts";
import styles from "./EnrollmentWorkspace.module.css";

export function EnrollmentStatus({ status }: { status: ApplicationStatus }) {
  const className = [styles.status, status === ApplicationStatus.PENDING ? styles.pending : "", status === ApplicationStatus.ACCEPTED ? styles.accepted : "", status === ApplicationStatus.REJECTED ? styles.rejected : ""].filter(Boolean).join(" ");
  return <span className={className}>{status.toLowerCase()}</span>;
}
