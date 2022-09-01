import { Component, For } from "solid-js";
import { useRouteData, useParams } from "@solidjs/router";

import { Table, Thead, Tr, Th, Tbody, Td } from "@hope-ui/solid";

import AddTeam from "./AddTeam";
import RemoveUser from "./RemoveUser";

import { Team } from "../services/teams";
import { sessionState, state } from "../store/state";
import { TeamsService } from "../services/teams";

/**
 * Dashboard Component.
 *
 */
const TeamMembers: Component = () => {
  const [members, setMembers] = useRouteData<any>();

  const params = useParams();

  async function addMember(team: string, userName: string) {
    try {
      await TeamsService.addMember(
        sessionState().session?.token!,
        state.currentOrganizationId!,
        userName,
        team
      );
      setMembers([{ name: userName }, ...members()]);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeTeam(team: Team) {
    await TeamsService.removeTeam(
      sessionState().session?.token!,
      team.name,
      state.currentOrganizationId!
    );
    setMembers(members().filter((u: Team) => u.name !== team.name));
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h1 class="text-2xl font-semibold text-white">
          Team {params.team} Members
        </h1>
      </div>

      <div class="flex flex-row justify-start mb-4">
        <AddTeam onAddTeam={addMember} />
      </div>

      <div class="border-2 border-gray-200 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Type</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <For each={members()}>
              {(member: any, i) => (
                <Tr>
                  <Td>{member.name}</Td>
                  <Td>{member.email}</Td>
                  <Td>{member.type}</Td>
                  <Td>{new Date(member.createdAt).toLocaleDateString()}</Td>
                  <Td>{new Date(member.updatedAt).toLocaleDateString()}</Td>
                  <Td>
                    <div class="flex flex-row justify-start gap-x-1">
                      <RemoveUser user={member} onRemoveUser={removeTeam} />
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

export default TeamMembers;
