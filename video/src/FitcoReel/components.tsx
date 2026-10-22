import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, MINT, MINT_GRADIENT, NAVY, NAVY_GRADIENT, WHITE } from "./theme";

const clean = (word: string) =>
  word.toLowerCase().replace(/[¿?¡!.,:"“”]/g, "");

// Text that reveals word by word with a springy rise.
export const Words: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  highlight?: string[];
  highlightColor?: string;
  align?: "center" | "left";
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  delay = 0,
  stagger = 3,
  size = 84,
  weight = 700,
  color = WHITE,
  highlight = [],
  highlightColor,
  align = "center",
  lineHeight = 1.2,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const marks = highlight.map(clean);

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight,
        textAlign: align,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.26,
        ...style,
      }}
    >
      {text.split(" ").map((word, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 14, mass: 0.6 },
        });
        const isMark = marks.includes(clean(word));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${(1 - s) * size * 0.7}px) scale(${0.85 + 0.15 * s})`,
              filter: `blur(${(1 - s) * 8}px)`,
              ...(isMark
                ? highlightColor
                  ? { color: highlightColor }
                  : {
                      backgroundImage: MINT_GRADIENT,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                : {}),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Fades/scales a scene in and out within its own Sequence.
export const Scene: React.FC<{
  duration: number;
  children: React.ReactNode;
  background?: string;
  fadeOut?: boolean;
}> = ({ duration, children, background, fadeOut = true }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    fadeOut ? [0, 8, duration - 8, duration] : [0, 8],
    fadeOut ? [0, 1, 1, 0] : [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(frame, [0, duration], [1.04, 1]);
  return (
    <AbsoluteFill style={{ opacity, background }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Navy gradient with slowly drifting mint glows.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: NAVY_GRADIENT, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          left: -300 + Math.sin(t * 0.6) * 120,
          top: -350 + Math.cos(t * 0.5) * 100,
          background: `radial-gradient(circle, ${MINT}55 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          right: -450 + Math.cos(t * 0.45) * 140,
          bottom: -450 + Math.sin(t * 0.55) * 120,
          background: `radial-gradient(circle, #12a8a044 0%, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const PopIn: React.FC<{
  delay?: number;
  children: React.ReactNode;
  from?: "up" | "left" | "right" | "scale";
  style?: React.CSSProperties;
}> = ({ delay = 0, children, from = "up", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13 } });
  const offset = (1 - s) * 120;
  const transform =
    from === "left"
      ? `translateX(${-offset}px)`
      : from === "right"
        ? `translateX(${offset}px)`
        : from === "scale"
          ? `scale(${s})`
          : `translateY(${offset}px)`;
  return (
    <div style={{ opacity: Math.min(1, s * 1.5), transform, ...style }}>
      {children}
    </div>
  );
};

export const Chip: React.FC<{
  label: string;
  dark?: boolean;
  size?: number;
}> = ({ label, dark, size = 40 }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: size,
      padding: `${size * 0.4}px ${size * 0.9}px`,
      borderRadius: 999,
      color: dark ? WHITE : NAVY,
      background: dark ? NAVY_GRADIENT : MINT_GRADIENT,
      boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

export const Arrow: React.FC<{ progress: number; color?: string; width?: number }> = ({
  progress,
  color = MINT,
  width = 200,
}) => {
  const length = width - 30;
  return (
    <svg width={width} height={60} viewBox={`0 0 ${width} 60`}>
      <line
        x1={10}
        y1={30}
        x2={width - 20}
        y2={30}
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
      <polyline
        points={`${width - 45},8 ${width - 15},30 ${width - 45},52`}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={progress > 0.85 ? 1 : 0}
      />
    </svg>
  );
};

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 10,
        width: `${(frame / (durationInFrames - 1)) * 100}%`,
        background: MINT_GRADIENT,
      }}
    />
  );
};
