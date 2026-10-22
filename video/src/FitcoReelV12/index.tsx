import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../FitcoReel/theme";

// v12 of the "web vs app" reel. public/v12/base.mp4 is the v11 render with the
// copy that changed erased (scripts/clean_v11.py); this composition draws the
// new copy on top, inserts the "paquetes" scene and adds music + SFX
// (scripts/v12_audio.py). Frame numbers below are v11 frames at 30 fps.

const MINT = "#03d3bd";
const NAVY = "#181f42";
const GREY = "#5b6382";

const SPLIT = 1128; // v11 frame where the "paquetes" scene is inserted
const INSERT = 195;
const BASE_LENGTH = 1605;

export const FITCO_REEL_V12_DURATION = BASE_LENGTH + INSERT;

const clean = (word: string) => word.toLowerCase().replace(/[¿?¡!.,:;"“”]/g, "");

const useFade = (from: number, to: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, from + 1, to - 6, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Word-by-word blur/rise reveal, matching the v11 title animation.
const Reveal: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  bold?: string[];
  boldColor?: string;
  lineHeight?: number;
  width?: number;
  align?: "center" | "left";
}> = ({
  text,
  delay = 0,
  stagger = 3,
  size = 84,
  weight = 400,
  color = NAVY,
  bold = [],
  boldColor = MINT,
  lineHeight = 1.06,
  width = 960,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const marks = bold.map(clean);
  return (
    <div
      style={{
        width,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.27,
      }}
    >
      {text.split(" ").map((word, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 16, mass: 0.5 } });
        const mark = marks.includes(clean(word));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${(1 - s) * size * 0.45}px)`,
              filter: `blur(${(1 - s) * 10}px)`,
              ...(mark ? { color: boldColor, fontWeight: 700 } : {}),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Positions children in v11 frame space and fades them out with the scene.
const Layer: React.FC<{
  from: number;
  to: number;
  top: number;
  left?: number;
  center?: boolean;
  children: React.ReactNode;
}> = ({ from, to, top, left = 0, center = true, children }) => {
  const opacity = useFade(from, to);
  const frame = useCurrentFrame();
  const blur = interpolate(frame, [to - 6, to], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < from || frame > to) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: center ? 0 : left,
        width: center ? 1080 : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      <Sequence from={from} layout="none">
        {children}
      </Sequence>
    </div>
  );
};

const Pill: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11, mass: 0.6 } });
  return (
    <div
      style={{
        marginTop: 34,
        height: 111,
        padding: "0 64px",
        borderRadius: 56,
        background: MINT,
        display: "flex",
        alignItems: "center",
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 56,
        color: NAVY,
        opacity: Math.min(1, s * 1.5),
        transform: `scale(${0.6 + 0.4 * s})`,
        boxShadow: "0 18px 40px rgba(3,211,189,0.25)",
      }}
    >
      {label}
    </div>
  );
};

const RoleTitle: React.FC<{ who: string; role: string; caption: string }> = ({ who, role, caption }) => (
  <>
    <Reveal text={`Tu ${who} es para`} delay={8} bold={[who]} />
    <Pill label={role} delay={16} />
    <div style={{ marginTop: 52 }}>
      <Reveal text={caption} delay={26} stagger={2} size={44} weight={500} color={GREY} lineHeight={1.25} width={940} />
    </div>
  </>
);

// White card that pops in over the v11 one it replaces.
const PopCard: React.FC<{
  delay: number;
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13, mass: 0.5 } });
  return (
    <div
      style={{
        position: "absolute",
        background: "#ffffff",
        fontFamily: FONT,
        color: NAVY,
        opacity: Math.min(1, s * 2),
        transform: `scale(${0.85 + 0.15 * s})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const StepLabel: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 46,
        lineHeight: 1,
        color: NAVY,
        opacity: o,
        transform: `translateX(${(1 - o) * -20}px)`,
        filter: `blur(${(1 - o) * 6}px)`,
      }}
    >
      {text}
    </div>
  );
};

// New copy over the v11 footage. `f` maps a v11 frame to an output frame.
const Overlays: React.FC<{ f: (frame: number) => number }> = ({ f }) => {
  const frame = useCurrentFrame();
  const tipsCard = interpolate(frame, [f(1287), f(1290), f(1341), f(1344)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Layer from={f(102)} to={f(202)} top={290}>
        <Reveal text="¿Tu web y tu app cumplen la misma función?" delay={6} bold={["web", "app"]} />
      </Layer>
      <Layer from={f(203)} to={f(262)} top={300}>
        <Reveal text="No. Cada una tiene su propio rol." delay={2} bold={["propio", "rol."]} />
      </Layer>
      <Layer from={f(263)} to={f(353)} top={282}>
        <Reveal text="Si no las usas bien, pierdes tiempo y alumnos." delay={6} size={76} bold={["tiempo", "alumnos."]} />
      </Layer>

      {/* Chat bubble that used to say "¿Por qué no puedo comprar mi paquete en la app?" */}
      <Layer from={f(421)} to={f(499)} top={0}>
        <PopCard
          delay={0}
          style={{
            left: 208,
            top: 900,
            width: 760,
            height: 212,
            borderRadius: 44,
            padding: "22px 40px",
            boxSizing: "border-box",
            boxShadow: "0 24px 50px rgba(24,31,66,0.10)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 50, lineHeight: 1.16 }}>
            “¿Me pasas los horarios por WhatsApp?”
          </div>
          <div style={{ position: "absolute", right: 40, bottom: 26, fontSize: 22, color: "#9aa0b4" }}>09:14</div>
        </PopCard>
      </Layer>

      {/* Receptionist chip that used to say "No me deja comprar" */}
      <Layer from={f(558)} to={f(604)} top={0}>
        <PopCard
          delay={0}
          style={{
            left: 38,
            top: 1437,
            width: 376,
            height: 88,
            borderRadius: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 500,
            fontSize: 31,
            boxShadow: "0 14px 30px rgba(24,31,66,0.18)",
          }}
        >
          ¿Me pasas el horario?
        </PopCard>
      </Layer>

      <Layer from={f(669)} to={f(833)} top={288}>
        <RoleTitle who="WEB" role="Captar clientes" caption="Nuevos alumnos te encuentran, ven tus planes y compran online." />
      </Layer>
      <Layer from={f(834)} to={f(1013)} top={288}>
        <RoleTitle who="APP" role="Retener alumnos" caption="Reservan en segundos y vuelven cada semana." />
      </Layer>

      <Layer from={f(1014)} to={f(1127)} top={290}>
        <Reveal text="Tu web atrae alumnos, tu app hace que se queden." delay={6} size={80} bold={["web", "app"]} />
      </Layer>
      <Layer from={f(1014)} to={f(1127)} top={1216} left={198} center={false}>
        <StepLabel text="Captar" delay={44} />
      </Layer>
      <Layer from={f(1014)} to={f(1127)} top={1368} left={818} center={false}>
        <StepLabel text="Retener" delay={53} />
      </Layer>

      {/* WhatsApp quick reply card, redrawn over the v11 one */}
      {tipsCard > 0 && (
        <div
          style={{
            position: "absolute",
            left: 230,
            top: 1201,
            width: 760,
            height: 193,
            boxSizing: "border-box",
            padding: "28px 36px",
            borderRadius: 32,
            background: "#d7fae7",
            boxShadow: "0 20px 40px rgba(24,31,66,0.08)",
            fontFamily: FONT,
            opacity: tipsCard,
            filter: `blur(${(1 - tipsCard) * 10}px)`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 1, color: "#12a46e" }}>⚡ RESPUESTA RÁPIDA</div>
          <div style={{ marginTop: 8, fontWeight: 500, fontSize: 35, lineHeight: 1.45, color: NAVY }}>
            Compra tu plan en la web o en la app, y reserva tus clases desde la app.
          </div>
        </div>
      )}

      <Layer from={f(1344)} to={f(1445)} top={292}>
        <Reveal
          text="Web que capta + app que retiene = un estudio que crece."
          delay={6}
          size={72}
          stagger={2}
          bold={["capta", "retiene", "crece."]}
        />
      </Layer>
    </>
  );
};

const Check: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={12} fill={NAVY} />
    <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke={MINT} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Badge: React.FC<{ label: string; delay: number; dark?: boolean }> = ({ label, delay, dark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, mass: 0.5 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 30px 16px 18px",
        borderRadius: 999,
        background: dark ? NAVY : "#ffffff",
        color: dark ? "#ffffff" : NAVY,
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 32,
        whiteSpace: "nowrap",
        boxShadow: "0 16px 36px rgba(24,31,66,0.16)",
        opacity: Math.min(1, s * 2),
        transform: `scale(${0.5 + 0.5 * s})`,
      }}
    >
      <Check />
      {label}
    </div>
  );
};

const feather = (px: number) => {
  const edge = `transparent, #000 ${px}px, #000 calc(100% - ${px}px), transparent`;
  return {
    WebkitMaskImage: `linear-gradient(to right, ${edge}), linear-gradient(to bottom, ${edge})`,
    WebkitMaskComposite: "source-in",
    maskImage: `linear-gradient(to right, ${edge}), linear-gradient(to bottom, ${edge})`,
    maskComposite: "intersect",
  } as React.CSSProperties;
};

// New scene: packages can be bought on both, but booking is easier in the app.
const Paquetes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PART_B = 100;
  const sceneIn = interpolate(frame, [0, 8, INSERT - 7, INSERT], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const aOut = interpolate(frame, [PART_B - 8, PART_B], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = spring({ frame: frame - 6, fps, config: { damping: 15 } });
  const handIn = spring({ frame: frame - PART_B, fps, config: { damping: 14, mass: 0.8 } });
  const tap = interpolate(frame, [140, 146, 152], [1, 0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ripple = interpolate(frame, [142, 162], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outBlur = interpolate(frame, [INSERT - 7, INSERT], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Img src={staticFile("v12/plate.png")} style={{ width: 1080, height: 1920 }} />
      <AbsoluteFill style={{ opacity: sceneIn, filter: outBlur ? `blur(${outBlur}px)` : undefined }}>
        {frame < PART_B && (
          <AbsoluteFill style={{ opacity: aOut }}>
            <div style={{ position: "absolute", top: 292, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
              <Reveal text="¿Y los paquetes?" delay={4} bold={["paquetes?"]} />
              <Reveal
                text="Se pueden comprar en tu web y también en tu app."
                delay={16}
                stagger={2}
                size={46}
                weight={500}
                color={GREY}
                bold={["web", "app."]}
                boldColor={NAVY}
                lineHeight={1.25}
                width={900}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: 760,
                left: 20,
                transform: `translateX(${(1 - enter) * -300}px)`,
                opacity: enter,
              }}
            >
              <Img src={staticFile("v12/laptop.png")} style={{ width: 640, ...feather(28) }} />
            </div>
            <div
              style={{
                position: "absolute",
                top: 700,
                left: 700,
                transform: `translateX(${(1 - enter) * 300}px)`,
                opacity: enter,
              }}
            >
              <Img src={staticFile("v12/phone.png")} style={{ width: 340, ...feather(18) }} />
            </div>
            <div style={{ position: "absolute", top: 1215, left: 150 }}>
              <Badge label="Compra en web" delay={30} />
            </div>
            <div style={{ position: "absolute", top: 1420, left: 640 }}>
              <Badge label="Compra en app" delay={40} />
            </div>
          </AbsoluteFill>
        )}

        {frame >= PART_B - 2 && (
          <>
            <div style={{ position: "absolute", top: 292, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
              <Reveal text="Pero reservar es más fácil desde la app." delay={PART_B} bold={["reservar", "app."]} />
              <Reveal
                text="Siempre a la mano de tu alumno."
                delay={PART_B + 18}
                stagger={2}
                size={46}
                weight={500}
                color={GREY}
                bold={["mano"]}
                boldColor={NAVY}
                width={900}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: 760,
                left: 220,
                transformOrigin: "50% 100%",
                transform: `translateY(${(1 - handIn) * 700}px) rotate(${(1 - handIn) * 8}deg) scale(${1.25 * tap})`,
              }}
            >
              <Img src={staticFile("v12/hand.png")} style={{ width: 525, ...feather(30) }} />
              {ripple > 0 && ripple < 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 183 - 60,
                    top: 330 - 60,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: `5px solid ${MINT}`,
                    transform: `scale(${0.3 + ripple})`,
                    opacity: 1 - ripple,
                  }}
                />
              )}
            </div>
            <div style={{ position: "absolute", top: 905, left: 40 }}>
              <Badge label="Reserva en 2 toques" delay={PART_B + 22} />
            </div>
            <div style={{ position: "absolute", top: 1160, left: 590 }}>
              <Badge label="Siempre en su bolsillo" delay={PART_B + 32} />
            </div>
            <div style={{ position: "absolute", top: 1560, width: 1080, display: "flex", justifyContent: "center" }}>
              <Badge label="¡Clase reservada!" delay={148} dark />
            </div>
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const toOutput = (frame: number) => (frame < SPLIT ? frame : frame + INSERT);

export const FitcoReelV12: React.FC = () => {
  const base = staticFile("v12/base.mp4");
  return (
    <AbsoluteFill style={{ background: "#effbfa" }}>
      <Sequence durationInFrames={SPLIT}>
        <OffthreadVideo src={base} muted />
      </Sequence>
      <Sequence from={SPLIT} durationInFrames={INSERT}>
        <Paquetes />
      </Sequence>
      <Sequence from={SPLIT + INSERT}>
        <OffthreadVideo src={base} trimBefore={SPLIT} muted />
      </Sequence>
      <Overlays f={toOutput} />
      <Audio src={staticFile("v12/audio.wav")} />
    </AbsoluteFill>
  );
};
