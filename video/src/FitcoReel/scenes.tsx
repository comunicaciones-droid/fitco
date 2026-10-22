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
import { Arrow, Chip, PopIn, Scene, Words } from "./components";
import { FONT, MINT, MINT_GRADIENT, NAVY, NAVY_GRADIENT, WHITE } from "./theme";

const Logo: React.FC<{ width: number; delay?: number }> = ({ width, delay = 0 }) => (
  <PopIn delay={delay} from="scale">
    <Img src={staticFile("logo-fitco.png")} style={{ width }} />
  </PopIn>
);

const Column: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 60,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap,
      width: "100%",
    }}
  >
    {children}
  </div>
);

// 1. Hook
export const Hook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const ring = interpolate(frame % 40, [0, 40], [0.6, 1.6]);
  return (
    <Scene duration={duration}>
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: `6px solid ${MINT}`,
          transform: `scale(${ring})`,
          opacity: interpolate(ring, [0.6, 1.6], [0.5, 0]),
        }}
      />
      <Column gap={90}>
        <Logo width={380} />
        <Words
          text="¿Tienes un estudio fitness o wellness?"
          delay={8}
          size={100}
          weight={800}
          highlight={["fitness", "wellness?"]}
        />
      </Column>
    </Scene>
  );
};

const Card: React.FC<{ label: string; tint: string }> = ({ label, tint }) => (
  <div
    style={{
      width: 300,
      height: 300,
      borderRadius: 48,
      background: tint,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: 84,
      color: WHITE,
      boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
      border: "4px solid rgba(255,255,255,0.15)",
    }}
  >
    {label}
  </div>
);

// 2. "Tus alumnos creen que..." + "No lo son."
export const SameThing: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const merge = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const split = spring({ frame: frame - 52, fps, config: { damping: 9 } });
  const gap = 260 * (1 - merge) + 60 + 220 * split;
  const strike = interpolate(frame, [52, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Scene duration={duration}>
      <Column gap={80}>
        <Words
          text="Tus alumnos creen que tu web y tu app son lo mismo."
          size={76}
          stagger={2}
          highlight={["web", "app"]}
        />
        <div style={{ display: "flex", alignItems: "center", height: 320 }}>
          <div style={{ transform: `translateX(${-gap / 2}px) rotate(${-8 * split}deg)` }}>
            <Card label="WEB" tint={MINT_GRADIENT} />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 130,
              color: WHITE,
              opacity: merge,
            }}
          >
            =
            <div
              style={{
                position: "absolute",
                left: -10,
                top: "50%",
                width: 100,
                height: 14,
                borderRadius: 7,
                background: "#ff5470",
                transform: `rotate(-60deg) scaleX(${strike})`,
              }}
            />
          </div>
          <div style={{ transform: `translateX(${gap / 2}px) rotate(${8 * split}deg)` }}>
            <Card label="APP" tint={NAVY_GRADIENT} />
          </div>
        </div>
        <Words text="No lo son." delay={52} size={130} weight={800} highlight={["No", "lo", "son."]} />
      </Column>
    </Scene>
  );
};

const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={260} height={260} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={44} fill="none" stroke={MINT} strokeWidth={6} />
      <line
        x1={50}
        y1={50}
        x2={50}
        y2={22}
        stroke={WHITE}
        strokeWidth={6}
        strokeLinecap="round"
        transform={`rotate(${frame * 18} 50 50)`}
      />
      <line
        x1={50}
        y1={50}
        x2={50}
        y2={32}
        stroke={WHITE}
        strokeWidth={6}
        strokeLinecap="round"
        transform={`rotate(${frame * 1.5} 50 50)`}
      />
      <circle cx={50} cy={50} r={5} fill={MINT} />
    </svg>
  );
};

// 3. Confusión = tiempo
export const CostsTime: React.FC<{ duration: number }> = ({ duration }) => (
  <Scene duration={duration}>
    <Column gap={80}>
      <PopIn from="scale">
        <Clock />
      </PopIn>
      <Words
        text="Y esa confusión te está costando tiempo."
        delay={6}
        size={92}
        weight={800}
        highlight={["tiempo."]}
      />
    </Column>
  </Scene>
);

const Bubble: React.FC<{ text: string; side: "left" | "right"; delay: number }> = ({
  text,
  side,
  delay,
}) => (
  <PopIn delay={delay} from={side} style={{ alignSelf: side === "left" ? "flex-start" : "flex-end" }}>
    <div
      style={{
        maxWidth: 780,
        padding: "34px 44px",
        borderRadius: 44,
        borderBottomLeftRadius: side === "left" ? 8 : 44,
        borderBottomRightRadius: side === "right" ? 8 : 44,
        background: side === "left" ? WHITE : MINT_GRADIENT,
        color: NAVY,
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 52,
        lineHeight: 1.25,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </div>
  </PopIn>
);

// 4. Preguntas repetidas
export const Questions: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const count = Math.floor(interpolate(frame, [30, duration], [3, 48], { extrapolateLeft: "clamp" }));
  return (
    <Scene duration={duration}>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, width: "100%" }}>
        <Bubble text="“¿Dónde reservo mi clase de pilates?”" side="left" delay={0} />
        <Bubble text="“¿Por qué no puedo comprar mi paquete en la app?”" side="right" delay={18} />
        <PopIn delay={34} from="scale" style={{ alignSelf: "center", marginTop: 20 }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 40,
              color: WHITE,
              background: "#ff5470",
              borderRadius: 999,
              padding: "14px 36px",
            }}
          >
            +{count} mensajes sin leer
          </div>
        </PopIn>
        <div style={{ marginTop: 60 }}>
          <Words text="Alumnos perdidos." delay={50} size={88} weight={800} highlight={["perdidos."]} />
          <Words
            text="Recepción respondiendo lo mismo todo el día."
            delay={64}
            stagger={2}
            size={58}
            weight={500}
            style={{ marginTop: 24 }}
          />
        </div>
      </div>
    </Scene>
  );
};

// 5. Transición: "Vamos a aclararlo"
export const Clarify: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 12], [0, 100], { extrapolateRight: "clamp" });
  return (
    <Scene duration={duration}>
      <AbsoluteFill
        style={{
          background: MINT_GRADIENT,
          clipPath: `circle(${wipe * 1.2}% at 50% 50%)`,
        }}
      />
      <Words text="Vamos a aclararlo" delay={6} size={120} weight={800} color={NAVY} />
    </Scene>
  );
};

const Title: React.FC<{ who: string; verb: string; dark?: boolean }> = ({ who, verb, dark }) => (
  <div style={{ textAlign: "center" }}>
    <Words
      text={`${who} es para`}
      size={78}
      weight={600}
      color={dark ? NAVY : WHITE}
      highlight={[who.split(" ")[1]]}
      highlightColor={dark ? NAVY : MINT}
    />
    <PopIn delay={12} from="scale">
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 150,
          lineHeight: 1.1,
          backgroundImage: MINT_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {verb}
      </div>
    </PopIn>
  </div>
);

// 6. La web es para comprar
export const WebScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 16, fps, config: { damping: 15 } });
  return (
    <Scene
      duration={duration}
      background={`linear-gradient(180deg, ${WHITE} 0%, #e6faf4 100%)`}
    >
      <Column gap={70}>
        <Title who="LA WEB" verb="COMPRAR" dark />
        <div
          style={{
            width: 960,
            borderRadius: 28,
            overflow: "hidden",
            background: WHITE,
            boxShadow: "0 40px 80px rgba(25,34,66,0.3)",
            transform: `perspective(1600px) rotateX(${(1 - enter) * 25}deg) translateY(${(1 - enter) * 300}px)`,
            opacity: enter,
          }}
        >
          <div
            style={{
              height: 56,
              background: NAVY,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 24px",
            }}
          >
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
            ))}
          </div>
          <Img src={staticFile("dashboard-web.png")} style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          {["Membresías", "Paquetes de clases", "Planes mensuales"].map((label, i) => (
            <PopIn key={label} delay={40 + i * 10} from={i % 2 ? "right" : "left"}>
              <Chip label={label} dark size={46} />
            </PopIn>
          ))}
        </div>
      </Column>
    </Scene>
  );
};

// 7. La app es para reservar
export const AppScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  const scroll = interpolate(frame, [40, duration], [0, -50], { extrapolateLeft: "clamp" });
  const tap = interpolate(frame, [70, 78, 86], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Scene duration={duration}>
      <Column gap={50}>
        <Title who="LA APP" verb="RESERVAR" />
        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
          <div
            style={{
              width: 420,
              height: 820,
              borderRadius: 64,
              padding: 16,
              background: "#0b0f22",
              boxShadow: `0 40px 90px rgba(0,0,0,0.5), 0 0 0 4px ${MINT}55`,
              transform: `translateY(${(1 - enter) * 500}px) rotate(${(1 - enter) * -10}deg) scale(${tap})`,
              opacity: enter,
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: 50, overflow: "hidden" }}>
              <Img
                src={staticFile("app-reservas.png")}
                style={{ width: "100%", transform: `translateY(${scroll}px)` }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            {["Yoga", "Pilates", "Funcional", "Spinning"].map((label, i) => (
              <PopIn key={label} delay={34 + i * 8} from="right">
                <Chip label={label} size={42} />
              </PopIn>
            ))}
          </div>
        </div>
        <Words
          text="Reservan, cancelan y ven horarios."
          delay={70}
          size={54}
          weight={600}
          highlight={["reservan,", "cancelan", "horarios."]}
        />
      </Column>
    </Scene>
  );
};

const Step: React.FC<{ n: string; title: string; caption: string; mint?: boolean }> = ({
  n,
  title,
  caption,
  mint,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
    <div
      style={{
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: mint ? MINT_GRADIENT : WHITE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        color: NAVY,
        boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ fontSize: 50, fontWeight: 600, opacity: 0.6 }}>{n}</div>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1 }}>{title}</div>
    </div>
    <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 600, color: WHITE }}>{caption}</div>
  </div>
);

// 8. Flujo: web -> app
export const Flow: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const arrow = interpolate(frame, [16, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Scene duration={duration}>
      <Column gap={100}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <PopIn from="left">
            <Step n="1" title="WEB" caption="Compran" mint />
          </PopIn>
          <div style={{ marginBottom: 70 }}>
            <Arrow progress={arrow} width={180} />
          </div>
          <PopIn delay={28} from="right">
            <Step n="2" title="APP" caption="Reservan" />
          </PopIn>
        </div>
        <Words
          text="Primero compran en la web, luego reservan su clase en la app."
          delay={20}
          stagger={2}
          size={64}
          weight={700}
          highlight={["web,", "app."]}
        />
      </Column>
    </Scene>
  );
};

const TipIcon: React.FC<{ kind: number }> = ({ kind }) => {
  const s = { fill: "none", stroke: NAVY, strokeWidth: 7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg width={64} height={64} viewBox="0 0 100 100">
      {kind === 0 && (
        <>
          <rect x={12} y={22} width={76} height={56} rx={8} {...s} />
          <polyline points="14,26 50,54 86,26" {...s} />
        </>
      )}
      {kind === 1 && (
        <>
          <circle cx={50} cy={50} r={36} {...s} />
          <polygon points="50,30 56,45 72,45 59,55 64,70 50,61 36,70 41,55 28,45 44,45" {...s} strokeWidth={5} />
        </>
      )}
      {kind === 2 && (
        <>
          <rect x={14} y={14} width={28} height={28} rx={4} {...s} />
          <rect x={58} y={14} width={28} height={28} rx={4} {...s} />
          <rect x={14} y={58} width={28} height={28} rx={4} {...s} />
          <path d="M60 60 h10 v10 h16 M60 80 v6 M76 76 v10 h10" {...s} />
        </>
      )}
      {kind === 3 && (
        <>
          <path d="M50 12 a38 38 0 1 1 -32 58 L12 88 l18 -6 A38 38 0 0 0 50 12" {...s} />
          <path d="M38 36 c0 14 12 28 26 28 l6 -8 -10 -6 -5 5 c-6 -3 -10 -7 -13 -13 l5 -5 -6 -10 z" {...s} strokeWidth={4} />
        </>
      )}
    </svg>
  );
};

// 9. Cómo explicarlo
export const Tips: React.FC<{ duration: number }> = ({ duration }) => {
  const tips = [
    "En el mensaje de bienvenida al inscribirse.",
    "En una historia destacada de tu estudio.",
    "Con un cartel y QR en recepción.",
    "Con una respuesta rápida en WhatsApp.",
  ];
  return (
    <Scene duration={duration}>
      <Column gap={56}>
        <Words
          text="¿Cómo se lo explicas a tus alumnos?"
          size={80}
          weight={800}
          highlight={["alumnos?"]}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
          {tips.map((tip, i) => (
            <PopIn key={tip} delay={18 + i * 14} from="left">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 32,
                  padding: "28px 36px",
                  borderRadius: 36,
                  background: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 104,
                    height: 104,
                    borderRadius: 28,
                    background: MINT_GRADIENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TipIcon kind={i} />
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 46, color: WHITE, lineHeight: 1.25 }}>
                  {tip}
                </div>
              </div>
            </PopIn>
          ))}
        </div>
      </Column>
    </Scene>
  );
};

// 10. Cierre
export const Outro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.03;
  return (
    <Scene duration={duration} fadeOut={false}>
      <Column gap={90}>
        <Words
          text="Canales claros = un estudio que se ve profesional."
          size={88}
          weight={800}
          stagger={3}
          highlight={["claros", "profesional."]}
        />
        <Logo width={460} delay={30} />
        <PopIn delay={44} from="up">
          <div
            style={{
              transform: `scale(${pulse})`,
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 40,
              whiteSpace: "nowrap",
              color: NAVY,
              background: MINT_GRADIENT,
              borderRadius: 999,
              padding: "28px 50px",
              boxShadow: `0 20px 50px ${MINT}55`,
            }}
          >
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path d="M6 3h12v18l-6-4-6 4z" fill={NAVY} />
            </svg>
            Guárdalo y compártelo con tu equipo
          </div>
        </PopIn>
      </Column>
    </Scene>
  );
};
