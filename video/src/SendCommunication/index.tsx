import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, MINT, MINT_GRADIENT, NAVY, WHITE } from "../FitcoReel/theme";

// Mobile re-creation of the "Comunicaciones > nueva comunicación" screen
// recording, on a transparent 9:16 canvas for use as an overlay.

const GREY = "#6b7490";
const LINE = "#d9dee8";

const STEPS = { channel: 95, title: 90, message: 95, filters: 110, send: 90 };
export const SEND_COMMUNICATION_DURATION = Object.values(STEPS).reduce((a, b) => a + b, 0);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A floating card that springs in and, unless it's the last one, leaves upward.
const Card: React.FC<{ duration: number; last?: boolean; children: React.ReactNode }> = ({
  duration,
  last,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15 } });
  const exit = last ? 0 : interpolate(frame, [duration - 10, duration], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: 940,
          padding: 56,
          borderRadius: 48,
          background: WHITE,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          fontFamily: FONT,
          color: NAVY,
          position: "relative",
          opacity: enter * (1 - exit),
          transform: `translateY(${(1 - enter) * 500 - exit * 200}px) scale(${0.9 + 0.1 * enter})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const Heading: React.FC<{ step: number; text: string }> = ({ step, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 44 }}>
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        background: MINT_GRADIENT,
        color: WHITE,
        fontWeight: 800,
        fontSize: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {step}
    </div>
    <div style={{ fontSize: 46, fontWeight: 700 }}>{text}</div>
  </div>
);

// Hand cursor that glides onto the center of its parent and taps at `at`.
const Tap: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [at - 16, at - 2], [0, 1], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const visible = interpolate(frame, [at - 18, at - 12, at + 14, at + 20], [0, 1, 1, 0], clamp);
  const press = interpolate(frame, [at - 2, at, at + 4], [1, 0.8, 1], clamp);
  const ripple = interpolate(frame, [at, at + 14], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none", zIndex: 10 }}>
      {frame >= at && (
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            left: -80,
            top: -80,
            borderRadius: "50%",
            border: `6px solid ${MINT}`,
            transform: `scale(${0.3 + ripple})`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg
        width={86}
        height={86}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: -18 + (1 - move) * 160,
          top: -6 + (1 - move) * 200,
          opacity: visible,
          transform: `scale(${press})`,
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
        }}
      >
        <path
          d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1a1.5 1.5 0 0 1 3 0v1.5m0-.5a1.5 1.5 0 0 1 3 0v1m0 0a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5-2.7L5 15.5a1.6 1.6 0 0 1 2.5-2L9 15"
          fill={WHITE}
          stroke={NAVY}
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const Typed: React.FC<{ text: string; from: number; perChar?: number; placeholder: string }> = ({
  text,
  from,
  perChar = 1.3,
  placeholder,
}) => {
  const frame = useCurrentFrame();
  const n = Math.floor(interpolate(frame, [from, from + text.length * perChar], [0, text.length], clamp));
  const caret = frame >= from - 6 && Math.floor(frame / 8) % 2 === 0;
  return (
    <span>
      {n === 0 ? <span style={{ color: "#a7aec0" }}>{placeholder}</span> : text.slice(0, n)}
      <span style={{ opacity: caret ? 1 : 0, color: MINT, fontWeight: 400 }}>|</span>
    </span>
  );
};

const Field: React.FC<{ label: string; active?: boolean; children: React.ReactNode; height?: number }> = ({
  label,
  active,
  children,
  height = 110,
}) => (
  <div style={{ marginBottom: 36 }}>
    <div style={{ fontSize: 32, fontWeight: 600, color: GREY, marginBottom: 14 }}>{label}</div>
    <div
      style={{
        minHeight: height,
        borderRadius: 24,
        border: `4px solid ${active ? MINT : LINE}`,
        padding: "26px 32px",
        fontSize: 38,
        fontWeight: 500,
        position: "relative",
        display: "flex",
        alignItems: height > 110 ? "flex-start" : "center",
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  </div>
);

const ICONS: Record<string, React.ReactNode> = {
  email: (
    <>
      <rect x={10} y={22} width={80} height={56} rx={8} />
      <polyline points="12,26 50,54 88,26" />
    </>
  ),
  push: (
    <>
      <rect x={30} y={10} width={40} height={80} rx={8} />
      <line x1={46} y1={78} x2={54} y2={78} />
    </>
  ),
  both: (
    <>
      <path d="M14 20h46a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H34l-14 12V58h-6a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8z" />
      <path d="M76 40h6a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8h-4v10L66 74H50" />
    </>
  ),
};

const ChannelTile: React.FC<{ icon: string; label: string; selected: boolean; tapAt?: number }> = ({
  icon,
  label,
  selected,
  tapAt,
}) => (
  <div
    style={{
      flex: 1,
      height: 250,
      borderRadius: 32,
      border: `4px solid ${MINT}`,
      background: selected ? MINT_GRADIENT : WHITE,
      color: selected ? WHITE : NAVY,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      position: "relative",
      transform: `scale(${selected ? 1.04 : 1})`,
    }}
  >
    <svg width={90} height={90} viewBox="0 0 100 100" fill="none" stroke={selected ? WHITE : NAVY} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[icon]}
    </svg>
    <div style={{ fontSize: 30, fontWeight: 600, textAlign: "center", lineHeight: 1.15, whiteSpace: "pre-line" }}>{label}</div>
    {tapAt !== undefined && <Tap at={tapAt} />}
  </div>
);

const ChannelStep: React.FC = () => {
  const frame = useCurrentFrame();
  const TAP = 45;
  return (
    <Card duration={STEPS.channel}>
      <Heading step={1} text="Elige el canal" />
      <div style={{ display: "flex", gap: 24 }}>
        <ChannelTile icon="email" label="Por email" selected={frame >= TAP} tapAt={TAP} />
        <ChannelTile icon="push" label={"Por\nnotificación"} selected={false} />
        <ChannelTile icon="both" label="Ambos" selected={false} />
      </div>
    </Card>
  );
};

const Chevron: React.FC = () => (
  <svg width={36} height={36} viewBox="0 0 24 24" style={{ marginLeft: "auto" }}>
    <polyline points="6,9 12,15 18,9" fill="none" stroke={GREY} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TitleStep: React.FC = () => (
  <Card duration={STEPS.title}>
    <Heading step={2} text="Escribe el título" />
    <Field label="Plantilla">
      <span style={{ color: GREY }}>Selecciona</span>
      <Chevron />
    </Field>
    <Field label="Título" active>
      <Typed text="Renovación de membresías" from={22} placeholder="Título" />
    </Field>
  </Card>
);

const MessageStep: React.FC = () => (
  <Card duration={STEPS.message}>
    <Heading step={3} text="Redacta el mensaje" />
    <div style={{ display: "flex", gap: 30, padding: "0 8px 20px", fontSize: 34, fontWeight: 700, color: GREY }}>
      <span>B</span>
      <span style={{ fontStyle: "italic" }}>I</span>
      <span style={{ textDecoration: "underline" }}>U</span>
      <span style={{ textDecoration: "line-through" }}>S</span>
    </div>
    <Field label="Mensaje" active height={330}>
      <Typed
        text="¡Hola! Tu membresía vence esta semana. Renuévala desde nuestra web y sigue entrenando con nosotros."
        from={14}
        perChar={0.6}
        placeholder="Escriba aquí..."
      />
    </Field>
  </Card>
);

const Radio: React.FC<{ label: string; on: boolean; tapAt?: number }> = ({ label, on, tapAt }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: on ? 700 : 500, position: "relative" }}>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        border: `4px solid ${on ? MINT : "#b9c0cf"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {on && <div style={{ width: 22, height: 22, borderRadius: 11, background: MINT }} />}
      {tapAt !== undefined && <Tap at={tapAt} />}
    </div>
    {label}
  </div>
);

const DISCIPLINES = ["Cycling", "Reformer", "Yoga", "Fuerza", "Box", "Mat"];

const FiltersStep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const RADIO = 22;
  const OPEN = 46;
  const PICK = 78;
  const list = spring({ frame: frame - OPEN, fps, config: { damping: 16 } }) *
    (1 - interpolate(frame, [PICK + 4, PICK + 12], [0, 1], clamp));
  const chip = spring({ frame: frame - PICK - 6, fps, config: { damping: 11 } });
  return (
    <Card duration={STEPS.filters}>
      <Heading step={4} text="Elige a quién enviarlo" />
      <div style={{ fontSize: 32, fontWeight: 600, color: GREY, marginBottom: 22 }}>Filtros</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 30, marginBottom: 44 }}>
        <Radio label="Planes" on={false} />
        <Radio label="Disciplinas" on={frame >= RADIO} tapAt={RADIO} />
        <Radio label="Usuarios" on={false} />
        <Radio label="Categoría" on={false} />
      </div>
      <div style={{ position: "relative" }}>
        <Field label="Para" active={frame >= OPEN}>
          {chip > 0.01 ? (
            <span
              style={{
                background: MINT_GRADIENT,
                color: WHITE,
                borderRadius: 999,
                padding: "6px 26px",
                fontWeight: 600,
                transform: `scale(${chip})`,
                display: "inline-block",
              }}
            >
              Reformer
            </span>
          ) : (
            <span style={{ color: "#a7aec0" }}>Selecciona disciplinas</span>
          )}
          <Chevron />
          <Tap at={OPEN} />
        </Field>
        {list > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 200,
              borderRadius: 24,
              background: WHITE,
              border: `3px solid ${LINE}`,
              boxShadow: "0 24px 50px rgba(25,34,66,0.25)",
              overflow: "hidden",
              opacity: list,
              transform: `translateY(${(1 - list) * -30}px)`,
              transformOrigin: "top",
              zIndex: 5,
            }}
          >
            {DISCIPLINES.map((d) => {
              const picked = d === "Reformer" && frame >= PICK;
              return (
                <div
                  key={d}
                  style={{
                    padding: "22px 34px",
                    fontSize: 36,
                    fontWeight: d === "Reformer" ? 600 : 500,
                    background: picked ? `${MINT}33` : WHITE,
                    borderBottom: `2px solid ${LINE}`,
                    position: "relative",
                  }}
                >
                  {d}
                  {d === "Reformer" && <Tap at={PICK} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

const Envelope: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const angle = -150 + i * 30; // fan upward
  const dist = t * 520;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 96,
        height: 70,
        marginLeft: -48,
        marginTop: -35,
        borderRadius: 12,
        background: WHITE,
        border: `4px solid ${MINT}`,
        transform: `translate(${x}px, ${y}px) rotate(${(i - 2) * 12 * t}deg) scale(${0.4 + t * 0.8})`,
        opacity: t > 0 ? 1 - Math.max(0, t - 0.7) / 0.3 : 0,
        boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 96 70">
        <polyline points="4,6 48,40 92,6" fill="none" stroke={MINT} strokeWidth={5} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const SendStep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const TAP = 26;
  const done = spring({ frame: frame - TAP - 4, fps, config: { damping: 12 } });
  const fly = interpolate(frame, [TAP + 2, TAP + 40], [0, 1], clamp);
  return (
    <Card duration={STEPS.send} last>
      <Heading step={5} text="Envía" />
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div
          style={{
            flex: 1,
            height: 120,
            borderRadius: 60,
            border: `4px solid ${LINE}`,
            fontSize: 34,
            fontWeight: 600,
            color: GREY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1 - done,
          }}
        >
          Cancelar
        </div>
        <div
          style={{
            flex: 2 + done,
            height: 120,
            borderRadius: 60,
            background: MINT_GRADIENT,
            color: WHITE,
            fontSize: 38,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            position: "relative",
            boxShadow: `0 16px 36px ${MINT}66`,
          }}
        >
          {done > 0.5 ? (
            <>
              <svg width={52} height={52} viewBox="0 0 24 24" style={{ transform: `scale(${done})` }}>
                <circle cx={12} cy={12} r={11} fill={WHITE} />
                <polyline points="7,12.5 10.5,16 17,9" fill="none" stroke={MINT} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ¡Comunicación enviada!
            </>
          ) : (
            "Enviar comunicación"
          )}
          <Tap at={TAP} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Envelope key={i} i={i} t={Math.max(0, fly - i * 0.06)} />
          ))}
        </div>
      </div>
    </Card>
  );
};

export const SendCommunication: React.FC = () => {
  const parts: [React.FC, number][] = [
    [ChannelStep, STEPS.channel],
    [TitleStep, STEPS.title],
    [MessageStep, STEPS.message],
    [FiltersStep, STEPS.filters],
    [SendStep, STEPS.send],
  ];
  let from = 0;
  return (
    <AbsoluteFill>
      {parts.map(([Step, duration], i) => {
        const start = from;
        from += duration;
        return (
          <Sequence key={i} from={start} durationInFrames={duration}>
            <Step />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
