import { Component, lazy, createResource, Show } from "solid-js";
import { Routes, Route, useNavigate } from "@solidjs/router";

const Login = lazy(() => import("./components/login"));
const Dashboard = lazy(() => import("./components/dashboard"));
const Profile = lazy(() => import("./components/profile"));
const Packages = lazy(() => import("./components/packages"));
const Teams = lazy(() => import("./components/teams"));
const TeamMembers = lazy(() => import("./components/teamMembers"));
const TeamPackages = lazy(() => import("./components/teamPackages"));

import { PackagesService } from "./services/packages";

import { sessionState, setState, state } from "./store/state";

import styles from "./App.module.css";
import { OrganizationsService } from "./services/organizations";
import { UsersService } from "./services/users";
import Users from "./components/Users";
import Hooks from "./components/Hooks";
import { TeamsService } from "./services/teams";
import { HooksService } from "./services/hooks";

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

function ScopeTeams({ params, location, navigate, data }: any) {
  const [teams, { mutate }] = createResource(() =>
    TeamsService.listTeams(params.scope, sessionState().session?.token!)
  );
  return [teams, mutate];
}

function TeamMembersData({ params, location, navigate, data }: any) {
  const [members, { mutate }] = createResource(() =>
    TeamsService.listMembers(
      params.scope,
      params.team,
      sessionState().session?.token!
    )
  );
  return [members, mutate];
}

function TeamPackagesData({ params, location, navigate, data }: any) {
  const [packages, { mutate }] = createResource(() =>
    TeamsService.listPackages(
      params.scope,
      params.team,
      sessionState().session?.token!
    )
  );
  return [packages, mutate];
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

function HooksData({ params, location, navigate, data }: any) {
  const [hooks, { mutate }] = createResource(() =>
    HooksService.listHooks(sessionState().session?.token!)
  );
  return [hooks, mutate];
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
            <Route
              path="/:scope/teams"
              component={Teams}
              data={ScopeTeams}
            ></Route>

            <Route
              path="/:scope/teams/:team/members"
              component={TeamMembers}
              data={TeamMembersData}
            />

            <Route
              path="/:scope/teams/:team/packages"
              component={TeamPackages}
              data={TeamPackagesData}
            />

            <Route path="/:scope/hooks" component={Hooks} data={HooksData} />
          </Route>
        </Show>
      </Routes>
    </div>
  );
};

export default App;
