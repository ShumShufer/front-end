import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
    type?: "button" | "submit" | "reset";
  };

type ButtonAsLink = ButtonBaseProps & {
  to: string;
  replace?: boolean;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

function buildClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  block: boolean,
  className?: string,
) {
  return [
    styles.btn,
    styles[variant],
    styles[size],
    block ? styles.block : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    block = false,
    children,
    className,
    ...rest
  } = props;
  const cls = buildClassName(variant, size, block, className);

  if ("to" in rest && rest.to) {
    const { to, replace, ...linkRest } = rest;
    return (
      <Link to={to} replace={replace} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonType =
    (rest as ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button";

  return (
    <button
      type={buttonType}
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
