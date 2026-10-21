import React from "react";
import {
  AbsoluteFill,
  Img,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background, PopIn, Words } from "../FitcoReel/components";
import { FONT, MINT, MINT_GRADIENT, NAVY, WHITE } from "../FitcoReel/theme";

// Reel cover + two Instagram stories for the Full Training email-automation case.

export const STORY_DURATION = 240;

const AUTOMATIONS = [
  { emoji: "cake", title: "Saludo de cumpleaños", detail: "Se envía solo en su día" },
  { emoji: "hourglass", title: "Aviso de vencimiento", detail: "Antes de que termine su plan" },
  { emoji: "check", title: "Confirmación de reserva", detail: "Apenas reserva su clase" },
];

const Emoji: React.FC<{ name: string; size: number; style?: React.CSSProperties }> = ({
  name,
  size,
  style,
}) => <Img src={staticFile(`emoji/${name}.png`)} style={{ width: size, height: size, ...style }} />;

const FitcoLogo: React.FC<{ width: number }> = ({ width }) => (
  <Img src={staticFile("logo-fitco.png")} style={{ width }} />
);

const FullLogo: React.FC<{ size: number }> = ({ size }) => (
  <Img
    src={staticFile("full/full-logo.png")}
    style={{ width: size, height: size, borderRadius: size * 0.18, boxShadow: "0 16px 36px rgba(0,0,0,0.4)" }}
  />
);

// Gentle idle float so the stories never look frozen.
const useFloat = (seed: number, amount = 12) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / 18 + seed) * amount;
};

const Notification: React.FC<{
  emoji: string;
  title: string;
  detail?: string;
  width?: number;
  scale?: number;
}> = ({ emoji, title, detail, width = 620, scale = 1 }) => (
  <div
    style={{
      width: width * scale,
      display: "flex",
      alignItems: "center",
      gap: 26 * scale,
      padding: `${24 * scale}px ${30 * scale}px`,
      borderRadius: 34 * scale,
      background: WHITE,
      boxShadow: "0 20px 44px rgba(0,0,0,0.35)",
      fontFamily: FONT,
      color: NAVY,
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 96 * scale,
        height: 96 * scale,
        borderRadius: 28 * scale,
        background: MINT_GRADIENT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Emoji name={emoji} size={66 * scale} />
    </div>
    <div style={{ lineHeight: 1.25 }}>
      <div style={{ fontSize: 34 * scale, fontWeight: 700 }}>{title}</div>
      {detail && <div style={{ fontSize: 27 * scale, fontWeight: 500, color: "#6b7490" }}>{detail}</div>}
    </div>
  </div>
);

const PhotoCard: React.FC<{
  src: string;
  width: number;
  height: number;
  rotate: number;
  label: React.ReactNode;
  labelAlign?: "center" | "left";
}> = ({ src, width, height, rotate, label, labelAlign = "center" }) => (
  <div style={{ position: "relative", transform: `rotate(${rotate}deg)` }}>
    <div
      style={{
        width,
        height,
        borderRadius: 44,
        overflow: "hidden",
        border: `8px solid ${WHITE}`,
        boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <div
      style={{
        position: "absolute",
        left: labelAlign === "center" ? "50%" : 30,
        bottom: -34,
        transform: labelAlign === "center" ? "translateX(-50%)" : undefined,
        whiteSpace: "nowrap",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 34,
        color: NAVY,
        background: MINT_GRADIENT,
        borderRadius: 999,
        padding: "14px 34px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
      }}
    >
      {label}
    </div>
  </div>
);

// Reel cover (rendered as a still PNG).
export const ReelCover: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <Background />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 4,
          color: MINT,
          border: `3px solid ${MINT}`,
          borderRadius: 999,
          padding: "12px 34px",
        }}
      >
        CASO DE ÉXITO
      </div>
      <div
        style={{
          marginTop: 40,
          padding: "0 70px",
          textAlign: "center",
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1.12,
          color: WHITE,
        }}
      >
        Así Full Training{" "}
        <span
          style={{
            backgroundImage: MINT_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          automatizó sus correos
        </span>
      </div>
    </AbsoluteFill>

    {/* Photos */}
    <div style={{ position: "absolute", left: 50, top: 760 }}>
      <PhotoCard src="full/alessandra.png" width={480} height={588} rotate={-5} label="Alessandra · FITCO" labelAlign="left" />
    </div>
    <div style={{ position: "absolute", right: 60, top: 900 }}>
      <PhotoCard src="full/full-owner.png" width={520} height={600} rotate={5} label="Full Training" />
      <div style={{ position: "absolute", right: -18, top: -40, transform: "rotate(8deg)" }}>
        <FullLogo size={150} />
      </div>
    </div>

    {/* Automated emails floating around */}
    <div style={{ position: "absolute", left: 40, top: 1440, transform: "rotate(-3deg)" }}>
      <Notification emoji="cake" title="¡Feliz cumpleaños!" scale={0.82} width={560} />
    </div>
    <div style={{ position: "absolute", right: 30, top: 700, transform: "rotate(4deg)" }}>
      <Notification emoji="check" title="Reserva confirmada" scale={0.72} width={560} />
    </div>

    {/* Co-branding */}
    <div
      style={{
        position: "absolute",
        bottom: 150,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 36,
      }}
    >
      <FitcoLogo width={250} />
      <div style={{ fontSize: 56, fontWeight: 300, color: WHITE, opacity: 0.8 }}>×</div>
      <FullLogo size={110} />
    </div>
  </AbsoluteFill>
);

const StoryHeader: React.FC = () => (
  <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <PopIn from="scale">
      <FitcoLogo width={240} />
    </PopIn>
  </div>
);

const PointDown: React.FC<{ text: string; delay: number; top: number }> = ({ text, delay, top }) => {
  const frame = useCurrentFrame();
  const bounce = Math.abs(Math.sin(frame / 7)) * 18;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <PopIn delay={delay}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 700, color: WHITE }}>{text}</div>
          <Emoji name="point-down" size={70} style={{ transform: `translateY(${bounce}px)` }} />
        </div>
      </PopIn>
    </div>
  );
};

// Envelopes drifting upward in the background.
const DriftingEnvelopes: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    { x: 90, speed: 1.6, phase: 0, size: 90 },
    { x: 880, speed: 1.2, phase: 500, size: 110 },
    { x: 760, speed: 2, phase: 1100, size: 70 },
    { x: 200, speed: 1.4, phase: 1500, size: 80 },
  ];
  return (
    <>
      {items.map((it, i) => {
        const y = 2000 - ((frame * it.speed * 3 + it.phase) % 2200);
        return (
          <Emoji
            key={i}
            name="email"
            size={it.size}
            style={{
              position: "absolute",
              left: it.x,
              top: y,
              opacity: 0.35,
              transform: `rotate(${Math.sin(frame / 20 + i) * 12}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

// Story 1: question + empty space for the Instagram poll sticker.
export const StoryQuestion: React.FC = () => {
  const float = useFloat(0);
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />
      <DriftingEnvelopes />
      <StoryHeader />
      <AbsoluteFill style={{ alignItems: "center", padding: "400px 80px 0" }}>
        <PopIn from="scale" delay={6}>
          <Emoji name="thinking" size={190} style={{ transform: `translateY(${float}px)` }} />
        </PopIn>
        <Words
          text="¿Envías correos automatizados a tus clientes?"
          delay={14}
          size={84}
          weight={800}
          highlight={["correos", "automatizados"]}
          style={{ marginTop: 40 }}
        />
        <Words
          text="Cumpleaños, vencimientos de plan, confirmación de reservas…"
          delay={40}
          stagger={2}
          size={40}
          weight={500}
          color="rgba(255,255,255,0.85)"
          style={{ marginTop: 36 }}
        />
      </AbsoluteFill>
      <PointDown text="Vota aquí" delay={60} top={1150} />
      {/* 1250–1600 left empty for the poll sticker. */}
    </AbsoluteFill>
  );
};

const AutomationRow: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const item = AUTOMATIONS[index];
  const start = 40 + index * 18;
  const enter = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const tick = spring({ frame: frame - start - 14, fps, config: { damping: 9 } });
  const float = useFloat(index * 2, 6);
  return (
    <div
      style={{
        position: "relative",
        opacity: enter,
        transform: `translateX(${(1 - enter) * (index % 2 ? 300 : -300)}px) translateY(${float}px)`,
      }}
    >
      <Notification emoji={item.emoji} title={item.title} detail={item.detail} width={880} />
      <div
        style={{
          position: "absolute",
          right: 30,
          top: "50%",
          width: 64,
          height: 64,
          marginTop: -32,
          borderRadius: 32,
          background: MINT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${tick})`,
        }}
      >
        <svg width={38} height={38} viewBox="0 0 24 24">
          <polyline points="5,12.5 10,17 19,7" fill="none" stroke={WHITE} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

// Story 2: FITCO does it automatically + empty space for the link sticker.
export const StoryFeatures: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />
      <StoryHeader />
      <AbsoluteFill style={{ alignItems: "center", padding: "390px 80px 0" }}>
        <Words
          text="Nuestra plataforma lo hace por ti"
          delay={6}
          size={86}
          weight={800}
          highlight={["por", "ti"]}
        />
        <Words
          text="Correos automáticos para tus alumnos:"
          delay={24}
          stagger={2}
          size={42}
          weight={500}
          color="rgba(255,255,255,0.85)"
          style={{ marginTop: 26, marginBottom: 50 }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {AUTOMATIONS.map((_, i) => (
            <AutomationRow key={i} index={i} />
          ))}
        </div>
        <PopIn delay={110} style={{ marginTop: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <FullLogo size={84} />
            <div style={{ fontSize: 36, fontWeight: 600, color: WHITE, lineHeight: 1.3 }}>
              Como lo hicimos con
              <br />
              <span style={{ color: MINT, fontWeight: 800 }}>Full Training</span>
            </div>
          </div>
        </PopIn>
      </AbsoluteFill>
      <PointDown text="Conoce más" delay={130} top={1410} />
      {/* 1500–1660 left empty for the link sticker. */}
    </AbsoluteFill>
  );
};

