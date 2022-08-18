import { Component, lazy, createResource, Show } from "solid-js";
import { Routes, Route, useNavigate } from "@solidjs/router";

const Login = lazy(() => import("./components/login"));
const Dashboard = lazy(() => import("./components/dashboard"));
const Profile = lazy(() => import("./components/profile"));
const Packages = lazy(() => import("./components/packages"));
const Teams = lazy(() => import("./components/teams"));

import { PackagesService } from "./services/packages";

import { state } from "./store/state";

import styles from "./App.module.css";
import { OrganizationsService } from "./services/organizations";

function UserPackages({ params, location, navigate, data }: any) {
  const [user] = createResource(() =>
    PackagesService.listPackages(
      state().session?.user._id!,
      state().session?.token!
    )
  );
  return user;
}

function UserOrganizations({ params, location, navigate, data }: any) {
  const [organizations, { mutate, refetch }] = createResource(() =>
    OrganizationsService.listOrganizations(
      state().session?.user._id!,
      state().session?.token!
    )
  );
  return organizations;
}

const App: Component = () => {
  const navigate = useNavigate();

  if (!state().session?.user) {
    navigate("/login", { replace: true });
  }

  console.log(state().session);

  return (
    <div class={styles.App}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Show when={state().session?.user} fallback={<></>}>
          <Route
            path="/about"
            element={<div>This site was made with Solid</div>}
          />
          <Route path="/" element={<Dashboard />} data={UserOrganizations}>
            <Route path="/" component={Profile} />
            <Route path="/packages" component={Packages} data={UserPackages} />
            <Route path="/teams" component={Teams} data={UserPackages} />
          </Route>
        </Show>
      </Routes>
    </div>
  );
};

export default App;
