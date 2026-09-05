import React from "react";
import brandLogo from "./brand-logo.jpg";

type Props = {
  className?: string;
  title?: string;
};

export function BrandLogo({ className, title = "BestMotions" }: Props) {
  return (
    <img
      className={className}
      src={brandLogo}
      alt={title}
      width={38}
      height={38}
      decoding="async"
    />
  );
}
