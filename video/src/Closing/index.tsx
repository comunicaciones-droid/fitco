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
import { FONT, MINT, NAVY } from "../FitcoReel/theme";

// Closing card: navy FITCO logo on the brand cream-to-mint background,
// with the tagline underneath.

export const CLOSING_DURATION = 150;

const ICON = 300;
const WORDMARK_W = (470 / 390) * ICON;
const GAP = 46;
const LOGO_W = ICON + GAP + WORDMARK_W;
// How far the icon travels from screen center to its place in the lockup.
const ICON_SHIFT = (LOGO_W - ICON) / 2;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const TaglineWord: React.FC<{ word: string; delay: number; bold?: boolean }> = ({
  word,
  delay,
  bold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.6 } });
  return (
    <span
      style={{
        display: "inline-block",
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
        filter: `blur(${(1 - s) * 6}px)`,
        fontWeight: bold ? 700 : 500,
      }}
    >
      {word}
    </span>
  );
};

// Light band that sweeps across a logo part, masked to its shape.
const Shine: React.FC<{ src: string; progress: number }> = ({ src, progress }) => {
  const mask = `url(${staticFile(src)})`;
  const p = progress * 100;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        WebkitMaskImage: mask,
        WebkitMaskSize: "100% 100%",
        maskImage: mask,
        maskSize: "100% 100%",
        background: `linear-gradient(105deg, transparent ${p - 12}%, rgba(29,205,159,0.95) ${p}%, transparent ${p + 12}%)`,
      }}
    />
  );
};

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgZoom = interpolate(frame, [0, CLOSING_DURATION], [1.12, 1]);
  const iconIn = spring({ frame: frame - 4, fps, config: { damping: 12, mass: 0.8 } });
  const slide = spring({ frame: frame - 34, fps, config: { damping: 16 } });
  const ripple = interpolate(frame, [16, 46], [0, 1], clamp);
  const shine = interpolate(frame, [96, 126], [-0.3, 1.3], clamp);
  const underline = spring({ frame: frame - 92, fps, config: { damping: 18 } });

  const line1 = ["Software", "para", "negocios"];
  const line2 = ["fitness", "y", "wellness"];

  return (
    <AbsoluteFill style={{ overflow: "hidden", fontFamily: FONT }}>
      <Img
        src={staticFile("closing/background.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${bgZoom})`,
        }}
      />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 90 }}>
        {/* Logo lockup */}
        <div style={{ position: "relative", width: LOGO_W, height: ICON }}>
          {/* Ripple behind the icon */}
          <div
            style={{
              position: "absolute",
              left: ICON_SHIFT * (1 - slide),
              top: 0,
              width: ICON,
              height: ICON,
              borderRadius: "50%",
              border: `8px solid ${MINT}`,
              transform: `scale(${0.6 + ripple * 1.2})`,
              opacity: (1 - ripple) * 0.8,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: ICON_SHIFT * (1 - slide),
              top: 0,
              width: ICON,
              height: ICON,
              transform: `scale(${iconIn}) rotate(${(1 - iconIn) * -200}deg)`,
            }}
          >
            <Img src={staticFile("closing/icon-navy.png")} style={{ width: "100%", height: "100%" }} />
            <Shine src="closing/icon-navy.png" progress={shine} />
          </div>
          <div
            style={{
              position: "absolute",
              left: ICON + GAP,
              top: 0,
              width: WORDMARK_W,
              height: ICON,
              clipPath: `inset(0 ${(1 - slide) * 100}% 0 0)`,
              transform: `translateX(${(1 - slide) * -60}px)`,
            }}
          >
            <Img src={staticFile("closing/wordmark-navy.png")} style={{ width: "100%", height: "100%" }} />
            <Shine src="closing/wordmark-navy.png" progress={shine - 0.25} />
          </div>
        </div>

        {/* Tagline */}
        <div style={{ textAlign: "center", color: NAVY, fontSize: 58, lineHeight: 1.3 }}>
          <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
            {line1.map((w, i) => (
              <TaglineWord key={w} word={w} delay={58 + i * 5} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
            {line2.map((w, i) => (
              <TaglineWord key={w} word={w} delay={74 + i * 5} bold={w !== "y"} />
            ))}
          </div>
          <div
            style={{
              margin: "28px auto 0",
              height: 8,
              width: 220,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${MINT}, #12a8a0)`,
              transform: `scaleX(${underline})`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
