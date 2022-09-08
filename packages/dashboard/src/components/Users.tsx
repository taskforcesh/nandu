import { Component, For } from "solid-js";
import { useRouteData } from "@solidjs/router";

import { Table, Thead, Tr, Th, Tbody, Td } from "@hope-ui/solid";

import AddUser from "./AddUser";
import RemoveUser from "./RemoveUser";

import { User, UsersService } from "../services/users";
import { sessionState, state } from "../store/state";

/**
 * Dashboard Component.
 *
 */
const Users: Component = () => {
  const [users, setUsers] = useRouteData<any>();

  async function saveUser(values: User & { role: string }) {
    try {
      await UsersService.createUser(
        values,
        state.currentOrganizationId!,
        values.role
      );

      setUsers([values, ...users()]);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeUser(user: User) {
    await UsersService.removeUser(user.name, state.currentOrganizationId!);
    setUsers(users().filter((u: User) => u.userId !== user.userId));
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h1 class="text-2xl font-semibold text-white">
          {state.currentOrganizationId} Users
        </h1>
      </div>

      <div class="flex flex-row justify-start mb-4">
        <AddUser onAddUser={saveUser} />
      </div>

      <div class="border-2 border-orange-400 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr class="text-orange-400">
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Type</Th>
              <Th>Email</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <For each={users()}>
              {(user: any, i) => (
                <Tr>
                  <Td>{user.name}</Td>
                  <Td>{user.role}</Td>
                  <Td>{user.type}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <RemoveUser
                      disabled={sessionState().session?.user.name === user.name}
                      user={user}
                      onRemoveUser={removeUser}
                    />
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

export default Users;
