import { Component, lazy } from "solid-js";
import { Routes, Route, Link } from "solid-app-router";

const Login = lazy(() => import("./components/login"));

// import logo from './logo.svg';
import styles from "./App.module.css";

const logo =
  "https://github.com/taskforcesh/nandu/blob/assets/nandu.png?raw=true";
const App: Component = () => {
  return (
    <div class={styles.App}>
      <nav>
        <Link href="/about">About</Link>
        <Link href="/">Home</Link>
        <Link href="/login">Login</Link>
      </nav>
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
      </Routes>
    </div>
  );
};

export default App;
