import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const MINT = "#1dcd9f";
export const NAVY = "#192242";
export const WHITE = "#ffffff";

export const MINT_GRADIENT = `linear-gradient(135deg, ${MINT} 0%, #12a8a0 100%)`;
export const NAVY_GRADIENT = `linear-gradient(160deg, #23305c 0%, ${NAVY} 55%, #0f1530 100%)`;

export const FONT = "Poppins";

const WEIGHTS = ["400", "500", "600", "700", "800"] as const;

export const fontsLoaded = Promise.all(
  WEIGHTS.map((weight) =>
    loadFont({
      family: FONT,
      url: staticFile(`fonts/poppins-latin-${weight}-normal.woff2`),
      weight,
    }),
  ),
);
