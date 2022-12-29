import {
  Component,
  lazy,
  createResource,
  Show,
  ErrorBoundary,
  createMemo,
} from "solid-js";
import { Routes, Route, useNavigate, useLocation } from "@solidjs/router";

const Login = lazy(() => import("./components/Login"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Profile = lazy(() => import("./components/Profile"));
const Packages = lazy(() => import("./components/Packages"));
const Teams = lazy(() => import("./components/Teams"));
const TeamMembers = lazy(() => import("./components/TeamMembers"));
const TeamPackages = lazy(() => import("./components/TeamPackages"));

import { PackagesService } from "./services/packages";

import { sessionState, setState, state } from "./store/state";

import styles from "./App.module.css";
import { OrganizationsService } from "./services/organizations";
import { UsersService } from "./services/users";
import Users from "./components/Users";
import Hooks from "./components/Hooks";
import { TeamsService } from "./services/teams";
import { HooksService } from "./services/hooks";
import { TokensService } from "./services/tokens";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@hope-ui/solid";
import RequestPasswordReset from "./components/RequestPasswordReset";
import PasswordReset from "./components/PasswordReset";
import { LoginRedirect } from "./components/LoginRedirect";

function TokensData({ params, location, navigate, data }: any) {
  const [tokens, { mutate }] = createResource(() => TokensService.listTokens());
  return [tokens, mutate];
}

function ScopePackages({ params, location, navigate, data }: any) {
  const [packages] = createResource(() =>
    PackagesService.listPackages(params.scope)
  );
  return packages;
}

function ScopeUsers({ params, location, navigate, data }: any) {
  const [users, { mutate }] = createResource(() =>
    UsersService.listUsers(params.scope)
  );
  return [users, mutate];
}

function ScopeTeams({ params, location, navigate, data }: any) {
  const [teams, { mutate }] = createResource(() =>
    TeamsService.listTeams(params.scope)
  );
  return [teams, mutate];
}

function TeamMembersData({ params, location, navigate, data }: any) {
  const [members, { mutate }] = createResource(() =>
    TeamsService.listMembers(params.scope, params.team)
  );
  return [members, mutate];
}

function TeamPackagesData({ params, location, navigate, data }: any) {
  const [packages, { mutate }] = createResource(() =>
    TeamsService.listPackages(params.scope, params.team)
  );
  return [packages, mutate];
}

function UserOrganizations({ params, location, navigate, data }: any) {
  const [organizations, { mutate, refetch }] = createResource(async () => {
    const organizations = await OrganizationsService.listOrganizations(
      sessionState().session?.user._id!
    );
    setState({ currentOrganizationId: organizations[0]?.organizationId });
    return organizations;
  });
  return organizations;
}

function HooksData({ params, location, navigate, data }: any) {
  const [hooks, { mutate }] = createResource(() => HooksService.listHooks());
  return [hooks, mutate];
}

const App: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = createMemo(() => location.pathname);

  return (
    <div class={styles.App}>
      <ErrorBoundary
        fallback={(err, reset) => {
          if (err.name == 401) {
            navigate(
              `/login${pathname().length > 1 ? "?redirect=" + pathname() : ""}`,
              {
                replace: true,
              }
            );
            return <></>;
          } else {
            return (
              <Alert status="danger">
                <AlertIcon mr="$2_5" />
                <AlertTitle mr="$2_5">
                  There was some unexpected error{" "}
                </AlertTitle>
                <AlertDescription>
                  Please close this and refresh the page to retry.
                </AlertDescription>
              </Alert>
            );
          }
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/request-password-reset"
            element={<RequestPasswordReset />}
          />
          <Route path="/passwords/reset/:token" element={<PasswordReset />} />

          {sessionState().session?.user && (
            <Show when={sessionState().session?.user} fallback={<></>}>
              <Route path="/" component={Dashboard} data={UserOrganizations}>
                <Route path="/" component={Profile} data={TokensData} />
                <Route path="/:scope" component={Profile} data={TokensData} />

                <Route
                  path="/:scope/packages"
                  component={Packages}
                  data={ScopePackages}
                />

                <Route
                  path="/:scope/users"
                  component={Users}
                  data={ScopeUsers}
                />
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

                <Route
                  path="/:scope/hooks"
                  component={Hooks}
                  data={HooksData}
                />
              </Route>
            </Show>
          )}
          <Route path="*" element={<LoginRedirect />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
