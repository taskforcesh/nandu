import { Component, For, createResource } from "solid-js";
import { Table, Thead, Tr, Th, Tbody, Td } from "@hope-ui/solid";

import { query } from "@solidjs/router";

import RemoveResource from "./RemoveResource";
import { HooksService, Hook, HookType } from "../services/hooks";
import AddHook from "./AddHook";

const getHooks = query(
  async () => {
    return await HooksService.listHooks();
  },
  "hooks" // Cache key
);

/**
 * Hooks Component.
 *
 */
const Hooks: Component = () => {
  const [hooks, { mutate: setHooks }] = createResource(() => getHooks());

  async function saveHook(values: {
    type: HookType;
    name: string;
    endpoint: string;
    secret: string;
  }) {
    try {
      const hook = await HooksService.addHook(values);
      setHooks([hook, ...hooks()]);
    } catch (e) {
      console.error(e);
    }
  }
  async function removeHook(hookId: string) {
    await HooksService.removeHook(hookId);
    setHooks(hooks().filter((u: Hook) => u.id !== hookId));
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <h1 class="text-2xl font-semibold text-white">Hooks</h1>
      </div>
      <div class="flex flex-row justify-start mb-4">
        <AddHook onAddHook={saveHook} />
      </div>
      <div class="border-2 border-orange-400 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr class="text-orange-400">
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
                      <RemoveResource
                        resourceId={hook.id}
                        resourceType="Hook"
                        resourceName={hook.name}
                        onRemoveResource={removeHook}
                      />
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
