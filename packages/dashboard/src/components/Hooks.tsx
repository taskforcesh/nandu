import { Component, For } from "solid-js";
import { Table, Thead, Tr, Th, Tbody, Td } from "@hope-ui/solid";

import { useRouteData } from "@solidjs/router";

import RemoveUser from "./RemoveUser";
import { HooksService, Hook, HookType } from "../services/hooks";
import { sessionState, state } from "../store/state";
import AddHook from "./AddHook";

/**
 * Hooks Component.
 *
 */
const Hooks: Component = () => {
  const [hooks, setHooks] = useRouteData<any>();

  async function saveHook(values: {
    type: HookType;
    name: string;
    endpoint: string;
    secret: string;
  }) {
    try {
      await HooksService.addHook(sessionState().session?.token!, values);
      setHooks([{ ...values, createdAt: new Date() }, ...hooks()]);
    } catch (e) {
      console.error(e);
    }
  }
  async function removeHook(team: Hook) {
    await HooksService.removeHook(
      sessionState().session?.token!,
      team.name,
      state.currentOrganizationId!
    );
    setHooks(hooks().filter((u: Hook) => u.name !== team.name));
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-white">Hooks</h1>
      </div>
      <div class="flex flex-row justify-start mb-4">
        <AddHook onAddHook={saveHook} />
      </div>
      <div class="border-2 border-gray-200 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Endpoint</Th>
              <Th>Last triggered</Th>
              <Th>Trigger count</Th>
              <Th>Created at</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <For each={hooks()}>
              {(hook: any, i) => (
                <Tr>
                  <Td>{hook.name}</Td>
                  <Td>{hook.type}</Td>
                  <Td>{hook.endpoint}</Td>
                  <Td>{hook.last_delivery}</Td>
                  <Td>{hook.triggerCount}</Td>
                  <Td>{hook.createdAt}</Td>
                  <Td>
                    <div class="flex flex-row justify-start gap-x-1">
                      <RemoveUser user={hook} onRemoveUser={removeHook} />
                    </div>
                  </Td>
                </Tr>
              )}
            </For>
          </Tbody>
        </Table>
      </div>{" "}
    </div>
  );
};

export default Hooks;
