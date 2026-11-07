import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};

export { getRouter };
