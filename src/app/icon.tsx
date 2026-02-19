import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const GOOGLE_FONTS_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Damion&display=swap";

async function loadDamionFont(): Promise<ArrayBuffer> {
  const cssRes = await fetch(GOOGLE_FONTS_CSS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+",
    },
  });
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) throw new Error("Font URL not found");
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

export default async function Icon() {
  const damionFont = await loadDamionFont();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <span
          style={{
            fontFamily: "Damion",
            fontSize: "22px",
            color: "#111",
            marginTop: "-2px",
          }}
        >
          JB
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Damion", data: damionFont, style: "normal", weight: 400 },
      ],
    },
  );
}
