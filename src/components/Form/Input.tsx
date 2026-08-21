import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  icon,
  className,
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <input
          id={inputId}
          className={[
            styles.input,
            icon ? styles.inputWithIcon : "",
            error ? styles.inputError : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
      </div>
      {error ? <span className={styles.error}>{error}</span> : null}
      {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
