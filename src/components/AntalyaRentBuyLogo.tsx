import React from "react";
import clsx from "clsx";

type Props = {
  /** Logo genişliği (px ya da %). Yükseklik otomatik oranlanır. */
  width?: number | string;
  /** Çatı/ampersand rengi */
  accent?: string;
  /** Yazı rengi */
  textColor?: string;
  /** Arka plan rengi (örn. "#000" veya "transparent") */
  background?: string;
  className?: string;
  /** "ANTALYA" yazısını göster/gizle */
  showCity?: boolean;
};

export default function AntalyaRentBuyLogo({
  width = 320,
  accent = "#FFFFFF",     // white color
  textColor = "#FFFFFF",
  background = "transparent",
  className,
  showCity = true,
}: Props) {
  return (
    <svg
      role="img"
      aria-label="Antalya Rent & Buy Logo"
      viewBox="0 0 800 520"
      width={typeof width === "number" ? `${width}px` : width}
      className={clsx(className)}
      style={{ display: "block", background }}
    >
      {/* Çatı + baca - İçi boş üçgen görünümü */}
      <path
        d="M70 300 L400 70 L730 300 L690 300 L400 110 L110 300 Z"
        fill={accent}
      />
      <path
        d="M650 205 h45 a8 8 0 0 1 8 8 v65 h-61 v-65 a8 8 0 0 1 8-8z"
        fill={accent}
      />

      {/* ANTALYA */}
      {showCity && (
        <text
          x="400"
          y="250"
          textAnchor="middle"
          fill={textColor}
          fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          fontWeight="800"
          fontSize="52"
          letterSpacing="2"
        >
          ANTALYA
        </text>
      )}

      {/* RENT & BUY satırı */}
      {/* RENT */}
      <text
        x="320"
        y="360"
        textAnchor="end"
        fill={textColor}
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        fontWeight="900"
        fontSize="110"
      >
        RENT
      </text>

      {/* & */}
      <text
        x="400"
        y="370"
        textAnchor="middle"
        fill={accent}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="150"
      >
        &
      </text>

      {/* BUY */}
      <text
        x="480"
        y="360"
        textAnchor="start"
        fill={textColor}
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        fontWeight="900"
        fontSize="110"
      >
        BUY
      </text>
    </svg>
  );
}