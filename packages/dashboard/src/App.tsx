import { Component, lazy, Show } from "solid-js";
import { Route, Router } from "@solidjs/router";

const Login = lazy(() => import("./components/Login"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Profile = lazy(() => import("./components/Profile"));
const Packages = lazy(() => import("./components/Packages"));
const Teams = lazy(() => import("./components/Teams"));
const TeamMembers = lazy(() => import("./components/TeamMembers"));
const TeamPackages = lazy(() => import("./components/TeamPackages"));

import { sessionState } from "./store/state";

import styles from "./App.module.css";

import Users from "./components/Users";
import Hooks from "./components/Hooks";
import RequestPasswordReset from "./components/RequestPasswordReset";
import PasswordReset from "./components/PasswordReset";
import { LoginRedirect } from "./components/LoginRedirect";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Router>
        <Route path="/login" component={Login} />
        <Route
          path="/request-password-reset"
          component={RequestPasswordReset}
        />
        <Route path="/passwords/reset/:token" component={PasswordReset} />

        {sessionState().session?.user && (
          <Show when={sessionState().session?.user} fallback={<></>}>
            <Route path="/" component={Dashboard}>
              <Route path="/" component={Profile} />
              <Route path="/:scope" component={Profile} />

              <Route path="/:scope/packages" component={Packages} />

              <Route path="/:scope/users" component={Users} />
              <Route path="/:scope/teams" component={Teams} />

              <Route
                path="/:scope/teams/:team/members"
                component={TeamMembers}
              />

              <Route
                path="/:scope/teams/:team/packages"
                component={TeamPackages}
              />

              <Route path="/:scope/hooks" component={Hooks} />
            </Route>
          </Show>
        )}
        <Route path="*" component={LoginRedirect} />
      </Router>
    </div>
  );
};

export default App;
