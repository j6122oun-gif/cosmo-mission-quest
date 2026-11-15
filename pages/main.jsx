// GitHub Pages 用のエントリ（静的サイト版）。
// Base44 本体のサーバー機能は使わず、ゲーム画面だけをブラウザで動かす。
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import "@/index.css";

import { Route as IndexRouteImport } from "@/routes/index";
import { Route as PrepRouteImport } from "@/routes/prep.$planetId";
import { Route as CommsRouteImport } from "@/routes/comms.$planetId";
import { Route as LaunchRouteImport } from "@/routes/launch.$planetId";
import { Route as ExploreRouteImport } from "@/routes/explore.$planetId";
import { Route as ResultsRouteImport } from "@/routes/results.$planetId";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster theme="dark" />
    </>
  ),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
});

const child = (route, path) => route.update({ id: path, path, getParentRoute: () => rootRoute });

const routeTree = rootRoute.addChildren([
  child(IndexRouteImport, "/"),
  child(PrepRouteImport, "/prep/$planetId"),
  child(CommsRouteImport, "/comms/$planetId"),
  child(LaunchRouteImport, "/launch/$planetId"),
  child(ExploreRouteImport, "/explore/$planetId"),
  child(ResultsRouteImport, "/results/$planetId"),
]);

const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: "intent",
  defaultErrorComponent: DefaultCatchBoundary,
  defaultNotFoundComponent: () => <NotFound />,
  scrollRestoration: true,
});

// ページごとのタイトルを反映（SSR がないので手動で）
router.subscribe("onResolved", () => {
  const titles = router.state.matches
    .flatMap((m) => m.meta ?? [])
    .filter((x) => x && x.title)
    .map((x) => x.title);
  if (titles.length) document.title = titles[titles.length - 1];
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
