import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background, ProgressBar } from "./components";
import {
  AppScene,
  Clarify,
  CostsTime,
  Flow,
  Hook,
  Outro,
  Questions,
  SameThing,
  Tips,
  WebScene,
} from "./scenes";
import "./theme";

// Durations in frames at 30 fps; total 900 = 30 s.
const SCENES: [React.FC<{ duration: number }>, number][] = [
  [Hook, 75],
  [SameThing, 90],
  [CostsTime, 60],
  [Questions, 120],
  [Clarify, 45],
  [WebScene, 120],
  [AppScene, 120],
  [Flow, 75],
  [Tips, 105],
  [Outro, 90],
];

export const FITCO_REEL_DURATION = SCENES.reduce((sum, [, d]) => sum + d, 0);

export const FitcoReel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map(([Component, duration], i) => {
        const start = from;
        from += duration;
        return (
          <Sequence key={i} from={start} durationInFrames={duration}>
            <Component duration={duration} />
          </Sequence>
        );
      })}
      <ProgressBar />
    </AbsoluteFill>
  );
};
