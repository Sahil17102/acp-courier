import type { SpinSize } from "antd/es/spin";
import { BrandedLoader } from "./BrandedLoader";

export type LoadingVariant = "inline" | "fullPage";

interface LoadingProps {
  /** "inline" = block/section loading; "fullPage" = overlay over entire app */
  variant?: LoadingVariant;
  /** Spinner size (uses theme primary color via ConfigProvider) */
  size?: SpinSize;
  /** Text below spinner — uses theme muted color */
  tip?: string;
  className?: string;
}

/**
 * App-wide theme-based loading. Use everywhere instead of ad-hoc spinners.
 * Spinner color comes from theme (Ant Design token); wrapper and tip use theme vars.
 */
export function Loading({
  variant = "inline",
  size: _size = "large",
  tip = "Loading...",
  className = "",
}: LoadingProps) {
  return <BrandedLoader message={tip} fullScreen={variant === "fullPage"} className={className} />;
}
