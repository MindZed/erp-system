import React from "react";
import type { SVGProps } from "react";

export function JamMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -7 24 24" {...props}>
      <path
        fill="currentColor"
        d="M1 0h5a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2m7 8h5a1 1 0 0 1 0 2H8a1 1 0 1 1 0-2M1 4h12a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2"
      ></path>
    </svg>
  );
}
export function MindzedSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 46 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <rect
        y={35}
        width={35}
        height={46}
        transform="rotate(-90 0 35)"
        fill="url(#pattern0_3019_292)"
      />
      <defs>
        <pattern
          id="pattern0_3019_292"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}
        >
          <use
            xlinkHref="#image0_3019_292"
            transform="matrix(0.00327663 0 0 0.00239503 -0.0144311 -0.0313901)"
          />
        </pattern>
        <image
          id="image0_3019_292"
          width={314}
          height={440}
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

export function MaterialSymbolsDashboard2Rounded(
  props: SVGProps<SVGSVGElement>
) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M16 20q-.425 0-.712-.288T15 19v-5q0-.425.288-.712T16 13h5q.425 0 .713.288T22 14v5q0 .425-.288.713T21 20zm-4-9q-.425 0-.712-.288T11 10V5q0-.425.288-.712T12 4h9q.425 0 .713.288T22 5v5q0 .425-.288.713T21 11zm-9 9q-.425 0-.712-.288T2 19v-5q0-.425.288-.712T3 13h9q.425 0 .713.288T13 14v5q0 .425-.288.713T12 20zm0-9q-.425 0-.712-.288T2 10V5q0-.425.288-.712T3 4h5q.425 0 .713.288T9 5v5q0 .425-.288.713T8 11z"
      ></path>
    </svg>
  );
}

export function Fa7SolidHandBackFist(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" {...props}>
      <path
        fill="currentColor"
        d="M7.4 253.6C2.6 245.9 0 237.1 0 228v-36c0-26.5 21.5-48 48-48h16V64c0-26.5 21.5-48 48-48c17.3 0 32.4 9.1 40.9 22.8C157.2 16.7 176.7 0 200 0c23.4 0 42.9 16.8 47.1 38.9c7.3-4.4 15.8-6.9 24.9-6.9c22.1 0 40.8 15 46.3 35.4c5.5-2.2 11.4-3.4 17.7-3.4c26.5 0 48 21.5 48 48v96.9c0 9.9-2.3 19.7-6.8 28.6l-39.6 79.1c-10.8 21.7-33 35.4-57.2 35.4H96c-16.5 0-31.8-8.4-40.6-22.4zM32 480v-48c0-17.7 14.3-32 32-32h256c17.7 0 32 14.3 32 32v48c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32"
      ></path>
    </svg>
  );
}

export function RiBuilding2Fill(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 19h2V6l6.394 2.74a1 1 0 0 1 .606.92V19h2v2H1v-2h2V5.65a1 1 0 0 1 .594-.914l7.703-3.423a.5.5 0 0 1 .703.456z"
      ></path>
    </svg>
  );
}

export function UimSignout(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="m21.207 11.293l-3-3a1 1 0 1 0-1.414 1.415L18.086 11H12.5a1 1 0 0 0 0 2h5.586l-1.293 1.293a1 1 0 1 0 1.414 1.414l3-3a1 1 0 0 0 0-1.415Z"
      ></path>
      <path
        fill="currentColor"
        d="M12.5 13a1 1 0 0 1 0-2h4V5a3.003 3.003 0 0 0-3-3h-8a3.003 3.003 0 0 0-3 3v14a3.003 3.003 0 0 0 3 3h8a3.003 3.003 0 0 0 3-3v-6Z"
        opacity={0.5}
      ></path>
    </svg>
  );
}

export function Up(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
        d="m13 30l12-12l12 12"
      ></path>
    </svg>
  );
}

export function Down(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
        d="M36 18L24 30L12 18"
      ></path>
    </svg>
  );
}

export function FluentPerson16Filled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
      <path
        fill="currentColor"
        d="M11.5 8A1.5 1.5 0 0 1 13 9.5v.5c0 1.971-1.86 4-5 4s-5-2.029-5-4v-.5A1.5 1.5 0 0 1 4.5 8zM8 1.5A2.75 2.75 0 1 1 8 7a2.75 2.75 0 0 1 0-5.5"
      ></path>
    </svg>
  );
}

export function AkarIconsEdit(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0L3 17.25V21h3.75L20.71 7.04zM5.92 19H5v-.92l10.06-10.06.92.92L5.92 19z"
      />
    </svg>
  );
}

export function BasilAdd(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1z"
      />
    </svg>
  );
}
