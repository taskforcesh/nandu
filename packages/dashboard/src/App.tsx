import { Component, lazy, createResource } from "solid-js";
import { Routes, Route, Link } from "@solidjs/router";

const Login = lazy(() => import("./components/login"));
const Dashboard = lazy(() => import("./components/dashboard"));
const Profile = lazy(() => import("./components/profile"));
const Packages = lazy(() => import("./components/packages"));

import { PackagesService } from "./services/packages";

import { state } from "./store/state";

// import logo from './logo.svg';
import styles from "./App.module.css";

function UserPackages({ params, location, navigate, data }: any) {
  const [user] = createResource(
    () => PackagesService.listPackages("manast", state.session?.token!)
  );
  return user;
}
const logo =
  "https://github.com/taskforcesh/nandu/blob/assets/nandu.png?raw=true";

const App: Component = () => {
  return (
    <div class={styles.App}>
      {/*}
      <nav>
        <Link href="/about">About</Link>
        <Link href="/">Dashboard</Link>
        <Link href="/login">Login</Link>
      </nav>
      *}
      {/*        <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p class="text-4xl text-red-400 tracking-widest">
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header> */}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/about"
          element={<div>This site was made with Solid</div>}
        />
        <Route path="/" element={<Dashboard />}>
          <Route path="/" component={Profile} />
          <Route path="/packages" component={Packages} data={UserPackages} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
