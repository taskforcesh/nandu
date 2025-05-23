import { Component, createResource, For } from "solid-js";
import {
  useNavigate,
  useLocation,
  RoutePreloadFunc,
  RoutePreloadFuncArgs,
  query,
  useParams,
} from "@solidjs/router";

import { Table, Thead, Tr, Th, Tbody, Td, Button } from "@hope-ui/solid";

import AddTeam from "./AddTeam";
import RemoveResource from "./RemoveResource";

import { Team } from "../services/teams";
import { state } from "../store/state";
import { TeamsService } from "../services/teams";

const getTeams = query(
  async (scope: string) => {
    return await TeamsService.listTeams(scope);
  },
  "teams" // Cache key
);

export const fetchTeams: RoutePreloadFunc = ({
  params,
  location,
}: RoutePreloadFuncArgs) => {
  return TeamsService.listTeams(params.scope);
};

/**
 * Dashboard Component.
 *
 */
const Teams: Component = (props) => {
  const params = useParams();
  const [teams, { mutate: setTeams }] = createResource(
    () => params.scope,
    getTeams
  );

  const navigate = useNavigate();
  const location = useLocation();

  async function saveTeam(values: Team) {
    try {
      await TeamsService.addTeam(values, state.currentOrganizationId!);
      setTeams([values, ...teams()]);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeTeam(teamName: string) {
    await TeamsService.removeTeam(teamName, state.currentOrganizationId!);
    setTeams(teams().filter((u: Team) => u.name !== teamName));
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <h1 class="text-2xl font-semibold text-white">Teams</h1>
      </div>

      <div class="flex flex-row justify-start mb-4">
        <AddTeam onAddTeam={saveTeam} />
      </div>

      <div class="border-2 border-orange-400 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr class="text-orange-400">
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <For each={teams()}>
              {(team: any, i) => (
                <Tr>
                  <Td>{team.name}</Td>
                  <Td>{team.description}</Td>
                  <Td>
                    <div class="items-center flex flex-row justify-start gap-x-1">
                      <Button
                        class="bg-orange-400 hover:bg-orange-500 focus:outline-none font-medium rounded-md "
                        onClick={() =>
                          navigate(`${location.pathname}/${team.name}/members`)
                        }
                        size="lg"
                        compact
                      >
                        Members
                      </Button>
                      <Button
                        class="bg-orange-400 hover:bg-orange-500 focus:outline-none"
                        onClick={() =>
                          navigate(`${location.pathname}/${team.name}/packages`)
                        }
                        size="lg"
                        compact
                      >
                        Packages
                      </Button>
                      <div class="flex flex-row justify-start gap-x-1">
                        <RemoveResource
                          resourceId={team.name}
                          resourceType="Team"
                          resourceName={team.name}
                          onRemoveResource={removeTeam}
                        />
                      </div>
                    </div>
                  </Td>
                </Tr>
              )}
            </For>
          </Tbody>
        </Table>
      </div>
    </div>
  );
};

export default Teams;
