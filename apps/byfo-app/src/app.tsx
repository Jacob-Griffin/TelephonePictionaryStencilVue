import type { Component } from "solid-js";
import { Link, useRoutes, useLocation } from "@solidjs/router";

import { routes } from "./routes";
import Logo from "./components/Logo";

const App: Component = () => {
  const location = useLocation();
  const Route = useRoutes(routes);

  return (
    <>
      <nav class="bg-brand-primary text-white px-4">
        <Logo></Logo>
      </nav>

      <main class="flex flex-col flex-grow">
        <Route />
      </main>
    </>
  );
};

export default App;
