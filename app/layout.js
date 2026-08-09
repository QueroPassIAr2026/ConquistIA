import "./globals.css";

export const metadata = {
  title: {
    default: "ConquistIA",

    template:
      "%s | ConquistIA",
  },

  description:
    "Organização financeira inteligente, simples e acolhedora.",

  applicationName:
    "ConquistIA",

  manifest:
    "/manifest.webmanifest",

  appleWebApp: {
    capable: true,

    statusBarStyle:
      "default",

    title:
      "ConquistIA",
  },

  icons: {
    icon: [
      {
        url:
          "/icons/icon-192.png",

        sizes:
          "192x192",

        type:
          "image/png",
      },

      {
        url:
          "/icons/icon-512.png",

        sizes:
          "512x512",

        type:
          "image/png",
      },
    ],

    apple: [
      {
        url:
          "/icons/icon-192.png",

        sizes:
          "192x192",

        type:
          "image/png",
      },
    ],
  },
};

export const viewport = {
  width:
    "device-width",

  initialScale:
    1,

  maximumScale:
    5,

  themeColor:
    "#087a54",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}