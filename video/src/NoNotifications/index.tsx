import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MINT_GRADIENT, NAVY } from "../FitcoReel/theme";

// Birthday greeting, plan expiry notice, booking confirmation: none arrive.
// Emoji: Microsoft Fluent Emoji 3D (MIT), 256px PNGs in public/emoji.
const ROWS = ["cake", "hourglass", "yoga"];

const ROW_GAP = 50; // frames between rows
const WAIT = 34; // frames the notification "types" before failing
const ROW_H = 290;
const PAD = 60;

export const NO_NOTIFICATIONS_WIDTH = 960;
export const NO_NOTIFICATIONS_HEIGHT = PAD * 2 + ROWS.length * ROW_H;
export const NO_NOTIFICATIONS_DURATION = 180;

const Emoji: React.FC<{ name: string; size: number; style?: React.CSSProperties }> = ({
  name,
  size,
  style,
}) => (
  <Img src={staticFile(`emoji/${name}.png`)} style={{ width: size, height: size, ...style }} />
);

// Everything is opaque so it works both with alpha and with a chroma key.
const Row: React.FC<{ emoji: string; start: number; shadows: boolean }> = ({
  emoji,
  start,
  shadows,
}) => {
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 13 } });
  const fail = spring({ frame: frame - WAIT, fps, config: { damping: 9 } });
  const failed = frame >= WAIT;
  const grey = interpolate(frame, [WAIT, WAIT + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ring = failed ? 0 : Math.sin(frame / 2.2) * 18 * Math.min(1, frame / 8);
  const shake = failed ? Math.sin((frame - WAIT) * 1.8) * 14 * Math.max(0, 1 - (frame - WAIT) / 12) : 0;
  const shadow = shadows ? "0 16px 36px rgba(0,0,0,0.28)" : "none";

  return (
    <div
      style={{
        height: ROW_H,
        display: "flex",
        alignItems: "center",
        gap: 50,
        opacity: enter,
        transform: `translateX(${(1 - enter) * -300}px)`,
      }}
    >
      {/* Event icon */}
      <div
        style={{
          width: 210,
          height: 210,
          borderRadius: "50%",
          flexShrink: 0,
          background: MINT_GRADIENT,
          border: "6px solid #ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: `grayscale(${grey})`,
          transform: `scale(${1 - grey * 0.08}) rotate(${grey * -6}deg)`,
          boxShadow: shadow,
        }}
      >
        <Emoji name={emoji} size={128} />
      </div>

      {/* Notification that never arrives */}
      <div
        style={{
          flex: 1,
          height: 150,
          borderRadius: 75,
          background: failed ? "#e4e7ee" : "#ffffff",
          border: `5px solid ${failed ? "#b9c0cf" : "#ffffff"}`,
          display: "flex",
          alignItems: "center",
          padding: "0 34px",
          gap: 30,
          position: "relative",
          transform: `translateX(${shake}px)`,
          boxShadow: shadow,
        }}
      >
        <Emoji
          name={failed ? "bell-off" : "bell"}
          size={96}
          style={{
            transform: `rotate(${ring}deg)`,
            transformOrigin: "50% 10%",
            filter: `grayscale(${grey})`,
          }}
        />
        <div style={{ display: "flex", gap: 22, opacity: 1 - grey }}>
          {[0, 1, 2].map((i) => {
            const bounce = Math.max(0, Math.sin((frame - i * 4) / 3.5));
            return (
              <div
                key={i}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  // Opaque colors instead of opacity so a chroma key stays clean.
                  background: bounce > 0.5 ? NAVY : "#9aa3b8",
                  transform: `translateY(${-bounce * 16}px)`,
                }}
              />
            );
          })}
        </div>
        <Emoji
          name="cross"
          size={110}
          style={{
            position: "absolute",
            right: 26,
            opacity: Math.min(1, fail * 2),
            transform: `scale(${fail}) rotate(${(1 - fail) * -90}deg)`,
          }}
        />
      </div>
    </div>
  );
};

// keyColor: solid background for editors that ignore the alpha channel.
export const NoNotifications: React.FC<{ keyColor?: string }> = ({ keyColor }) => {
  const frame = useCurrentFrame();
  const end = ROWS.length * ROW_GAP + WAIT - ROW_GAP;
  // Small "thud" once the last notification fails.
  const thud = interpolate(frame, [end, end + 4, end + 12], [1, 0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: keyColor }}>
      <AbsoluteFill style={{ padding: PAD, transform: `scale(${thud})` }}>
        {ROWS.map((emoji, i) => (
          <Row key={emoji} emoji={emoji} start={i * ROW_GAP} shadows={!keyColor} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
