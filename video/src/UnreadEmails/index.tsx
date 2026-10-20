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
import { Background, Words } from "../FitcoReel/components";
import { FONT, MINT, MINT_GRADIENT, NAVY, WHITE } from "../FitcoReel/theme";

const EMAILS = [
  { name: "Valeria Ríos", subject: "Tu membresía vence en 3 días", opened: true },
  { name: "Diego Paredes", subject: "Reserva tu clase de pilates", opened: false },
  { name: "Camila Torres", subject: "Nuevo horario de spinning", opened: true },
  { name: "Andrés Molina", subject: "Renueva tu paquete de clases", opened: false },
  { name: "Lucía Herrera", subject: "¡Feliz cumpleaños! Clase gratis", opened: false },
  { name: "Mateo Salas", subject: "Descarga la app para reservar", opened: true },
  { name: "Sofía Vargas", subject: "Tu plan mensual está listo", opened: false },
];

const UNREAD = EMAILS.filter((e) => !e.opened).length;

const ROW_H = 132;
const CLICK = 62;

const Checks: React.FC<{ color: string }> = ({ color }) => (
  <svg width={56} height={34} viewBox="0 0 56 34">
    <polyline points="4,18 14,28 32,6" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="22,26 24,28 42,6" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cursor: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 24 24">
    <path
      d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1a1.5 1.5 0 0 1 3 0v1.5m0-.5a1.5 1.5 0 0 1 3 0v1m0 0a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5-2.7L5 15.5a1.6 1.6 0 0 1 2.5-2L9 15"
      fill={WHITE}
      stroke={NAVY}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </svg>
);

export const UnreadEmails: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 15 } });
  const filtered = spring({ frame: frame - CLICK - 4, fps, config: { damping: 16 } });
  const press = interpolate(frame, [CLICK - 3, CLICK, CLICK + 4], [1, 0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor glides from bottom-right to the filter button.
  const cursorT = interpolate(frame, [30, CLICK - 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const cursorX = interpolate(cursorT, [0, 1], [760, 214]);
  const cursorY = interpolate(cursorT, [0, 1], [900, 82]);
  const tooltip = interpolate(frame, [CLICK - 10, CLICK - 4, CLICK + 18, CLICK + 24], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const counter = Math.round(interpolate(filtered, [0, 1], [0, UNREAD]));
  const badge = spring({ frame: frame - CLICK - 12, fps, config: { damping: 10 } });

  let unreadIndex = 0;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", padding: "300px 60px 0" }}>
        <Words
          text="¿Quién no ha abierto tu correo?"
          size={82}
          weight={800}
          highlight={["correo?"]}
          stagger={3}
        />

        <div
          style={{
            marginTop: 90,
            width: 960,
            borderRadius: 40,
            background: WHITE,
            boxShadow: "0 40px 90px rgba(0,0,0,0.45)",
            overflow: "hidden",
            position: "relative",
            opacity: cardIn,
            transform: `translateY(${(1 - cardIn) * 400}px)`,
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              height: 140,
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "0 44px",
              borderBottom: "2px solid #e8ebf2",
              fontFamily: FONT,
            }}
          >
            <div style={{ width: 40, height: 40, border: "4px solid #9aa3b8", borderRadius: 8 }} />
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: filtered > 0.05 ? `${MINT}26` : "#f1f3f8",
                transform: `scale(${press})`,
                boxShadow: filtered > 0.05 ? `0 0 0 4px ${MINT}` : "none",
              }}
            >
              <Checks color={MINT} />
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, color: NAVY }}>Enviados</div>
            <div
              style={{
                marginLeft: "auto",
                fontSize: 34,
                fontWeight: 700,
                color: NAVY,
                background: MINT_GRADIENT,
                borderRadius: 999,
                padding: "10px 28px",
                opacity: badge,
                transform: `scale(${badge})`,
              }}
            >
              {counter} sin abrir
            </div>
          </div>

          {/* Rows */}
          <div style={{ position: "relative" }}>
            {EMAILS.map((email, i) => {
              const rowIn = spring({ frame: frame - 8 - i * 4, fps, config: { damping: 14 } });
              const slot = email.opened ? null : unreadIndex++;
              const targetY = slot === null ? i * ROW_H : slot * ROW_H;
              const y = interpolate(filtered, [0, 1], [i * ROW_H, targetY]);
              const hide = email.opened ? filtered : 0;
              const glow = !email.opened
                ? interpolate(Math.sin((frame - CLICK) / 4), [-1, 1], [0.08, 0.2]) * filtered
                : 0;
              return (
                <div
                  key={email.name}
                  style={{
                    position: i === 0 ? "relative" : "absolute",
                    top: i === 0 ? undefined : 0,
                    left: 0,
                    right: 0,
                    height: ROW_H,
                    transform: `translateY(${i === 0 ? 0 : y}px) translateX(${(1 - rowIn) * 200 + hide * 300}px)`,
                    opacity: rowIn * (1 - hide),
                    display: "flex",
                    alignItems: "center",
                    gap: 28,
                    padding: "0 44px",
                    borderBottom: "2px solid #eef0f5",
                    background: `rgba(29,205,159,${glow})`,
                    fontFamily: FONT,
                  }}
                >
                  <div style={{ width: 34, height: 34, border: "4px solid #c3c9d6", borderRadius: 7, flexShrink: 0 }} />
                  <Checks color={email.opened ? MINT : "#b9c0cf"} />
                  <div style={{ width: 300, flexShrink: 0 }}>
                    <div style={{ fontSize: 36, fontWeight: email.opened ? 500 : 700, color: NAVY }}>
                      {email.name}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: email.opened ? 400 : 600,
                      color: email.opened ? "#6b7490" : NAVY,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {email.subject}
                  </div>
                </div>
              );
            })}
            {/* Keeps the card height stable while rows are absolutely positioned. */}
            <div style={{ height: interpolate(filtered, [0, 1], [EMAILS.length - 1, UNREAD - 1]) * ROW_H }} />
          </div>

          {/* Tooltip */}
          <div
            style={{
              position: "absolute",
              top: 128,
              left: 60,
              background: NAVY,
              color: WHITE,
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 500,
              padding: "14px 24px",
              borderRadius: 14,
              opacity: tooltip,
              transform: `translateY(${(1 - tooltip) * 10}px)`,
              whiteSpace: "nowrap",
            }}
          >
            Mostrar solo correos no abiertos
          </div>

          {/* Cursor */}
          <div
            style={{
              position: "absolute",
              left: cursorX,
              top: cursorY,
              opacity: interpolate(frame, [26, 32, 100, 108], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `scale(${press})`,
            }}
          >
            <Cursor />
          </div>
        </div>

        <div style={{ marginTop: 80, opacity: interpolate(frame, [96, 106], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <Img src={staticFile("logo-fitco.png")} style={{ width: 300 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
