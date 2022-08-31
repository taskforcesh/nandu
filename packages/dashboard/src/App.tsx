import { Component, lazy, createResource, Show } from "solid-js";
import { Routes, Route, useNavigate } from "@solidjs/router";

const Login = lazy(() => import("./components/login"));
const Dashboard = lazy(() => import("./components/dashboard"));
const Profile = lazy(() => import("./components/profile"));
const Packages = lazy(() => import("./components/packages"));
const Teams = lazy(() => import("./components/teams"));

import { PackagesService } from "./services/packages";

import { sessionState, setState, state } from "./store/state";

import styles from "./App.module.css";
import { OrganizationsService } from "./services/organizations";
import { UsersService } from "./services/users";
import Users from "./components/Users";
import Hooks from "./components/Hooks";

function ScopePackages({ params, location, navigate, data }: any) {
  const [packages] = createResource(() =>
    PackagesService.listPackages(params.scope, sessionState().session?.token!)
  );
  return packages;
}

function ScopeUsers({ params, location, navigate, data }: any) {
  const [users, { mutate }] = createResource(() =>
    UsersService.listUsers(params.scope, sessionState().session?.token!)
  );
  return [users, mutate];
}

function UserOrganizations({ params, location, navigate, data }: any) {
  const [organizations, { mutate, refetch }] = createResource(async () => {
    const organizations = await OrganizationsService.listOrganizations(
      sessionState().session?.user._id!,
      sessionState().session?.token!
    );
    setState({ currentOrganizationId: organizations[0]?.organizationId });
    return organizations;
  });
  return organizations;
}

const App: Component = () => {
  const navigate = useNavigate();

  if (!sessionState().session?.user) {
    navigate("/login", { replace: true });
  }

  return (
    <div class={styles.App}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Show when={sessionState().session?.user} fallback={<></>}>
          <Route
            path="/about"
            element={<div>This site was made with Solid</div>}
          />
          <Route path="/" component={Dashboard} data={UserOrganizations}>
            <Route path="/" component={Profile} />
            <Route path="/:scope" component={Profile} />
            <Route
              path="/:scope/packages"
              component={Packages}
              data={ScopePackages}
            />
            <Route path="/:scope/users" component={Users} data={ScopeUsers} />
            <Route path="/:scope/teams" component={Teams} />
            <Route path="/:scope/hooks" component={Hooks} />
          </Route>
        </Show>
      </Routes>
    </div>
  );
};

export default App;
