import { MantineProvider } from "@mantine/core";
import appCss from "@mantine/core/styles.css?url";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
        <Scripts />
      </body>
    </html>
  );
};

const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Brotli WASM Demo" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

export { Route };
