import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MINT, MINT_GRADIENT, NAVY, NAVY_GRADIENT, WHITE } from "../FitcoReel/theme";

// Birthday greeting, plan expiry notice, booking confirmation: none arrive.
const ROWS = ["🎂", "⏳", "🧘"];

const ROW_GAP = 50; // frames between rows
const WAIT = 34; // frames the notification "types" before failing
const ROW_H = 290;
const PAD = 60;

export const NO_NOTIFICATIONS_WIDTH = 960;
export const NO_NOTIFICATIONS_HEIGHT = PAD * 2 + ROWS.length * ROW_H;
export const NO_NOTIFICATIONS_DURATION = 180;

const EMOJI_FONT = "'Noto Color Emoji', 'Apple Color Emoji', sans-serif";

const Row: React.FC<{ emoji: string; start: number }> = ({ emoji, start }) => {
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
  const dotsOpacity = 1 - grey;

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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: EMOJI_FONT,
          fontSize: 120,
          filter: `grayscale(${grey}) brightness(${1 - grey * 0.35})`,
          transform: `scale(${1 - grey * 0.08}) rotate(${grey * -6}deg)`,
          boxShadow: `0 0 0 ${10 * (1 - grey)}px ${MINT}33`,
        }}
      >
        {emoji}
      </div>

      {/* Notification that never arrives */}
      <div
        style={{
          flex: 1,
          height: 150,
          borderRadius: 75,
          background: failed ? "rgba(255,255,255,0.12)" : WHITE,
          border: failed ? "4px dashed rgba(255,255,255,0.35)" : "4px solid transparent",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          gap: 36,
          position: "relative",
          transform: `translateX(${shake}px)`,
        }}
      >
        <div
          style={{
            fontFamily: EMOJI_FONT,
            fontSize: 76,
            transform: `rotate(${ring}deg)`,
            transformOrigin: "50% 10%",
            filter: `grayscale(${grey})`,
          }}
        >
          {failed ? "🔕" : "🔔"}
        </div>
        <div style={{ display: "flex", gap: 22, opacity: dotsOpacity }}>
          {[0, 1, 2].map((i) => {
            const bounce = Math.max(0, Math.sin((frame - i * 4) / 3.5));
            return (
              <div
                key={i}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  background: NAVY,
                  opacity: 0.35 + bounce * 0.65,
                  transform: `translateY(${-bounce * 16}px)`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            right: 30,
            fontFamily: EMOJI_FONT,
            fontSize: 96,
            opacity: Math.min(1, fail * 2),
            transform: `scale(${fail}) rotate(${(1 - fail) * -90}deg)`,
          }}
        >
          ❌
        </div>
      </div>
    </div>
  );
};

export const NoNotifications: React.FC = () => {
  const frame = useCurrentFrame();
  const end = ROWS.length * ROW_GAP + WAIT - ROW_GAP;
  // Small "thud" of the whole card once the last notification fails.
  const thud = interpolate(frame, [end, end + 4, end + 12], [1, 0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: NAVY_GRADIENT, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          padding: PAD,
          transform: `scale(${thud})`,
        }}
      >
        {ROWS.map((emoji, i) => (
          <Row key={emoji} emoji={emoji} start={i * ROW_GAP} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
