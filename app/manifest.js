export default function manifest() {
  return {
    name: "ConquistIA",

    short_name: "ConquistIA",

    description:
      "Organização financeira inteligente, simples e acolhedora.",

    start_url: "/painel",

    scope: "/",

    display: "standalone",

    background_color: "#f6f9f7",

    theme_color: "#087a54",

    orientation: "portrait",

    categories: [
      "finance",
      "productivity",
      "lifestyle",
    ],

    icons: [
      {
        src: "/icons/icon-192.png",

        sizes: "192x192",

        type: "image/png",

        purpose: "any",
      },

      {
        src: "/icons/icon-512.png",

        sizes: "512x512",

        type: "image/png",

        purpose: "any",
      },

      {
        src: "/icons/icon-512.png",

        sizes: "512x512",

        type: "image/png",

        purpose: "maskable",
      },
    ],
  };
}