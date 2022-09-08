import { Component, For, mergeProps } from "solid-js";

import { Table, Thead, Tr, Th, Tbody, Td } from "@hope-ui/solid";

import RemoveResource from "./RemoveResource";
import AddToken from "./AddToken";

interface TokenProps {
  tokens: any[];
  onAddToken: (values: any) => Promise<void>;
  onRemoveToken: (tokenKey: string) => Promise<void>;
}

/**
 * Tokens Component.
 *
 */
const Tokens: Component<TokenProps> = (props: TokenProps) => {
  const merged = mergeProps(
    {
      tokens: [],
      onAddToken: () => void 0,
      onRemoveToken: (tokenKey: string) => void 0,
    },
    props
  );

  return (
    <div>
      <div class="flex flex-row justify-start mb-4">
        <AddToken onAddToken={merged.onAddToken}></AddToken>
      </div>

      <div class="border-2 border-gray-200 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr>
              <Th>Key</Th>
              <Th>Token</Th>
              <Th>Type</Th>
              <Th>Created</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <For each={merged.tokens}>
              {(token: any, i) => (
                <Tr>
                  <Td>{token.key}</Td>
                  <Td>{token.token}</Td>
                  <Td>{token.readonly ? "read-only" : "read-write"}</Td>
                  <Td>{new Date(token.created).toLocaleDateString()}</Td>
                  <Td>
                    <div class="flex flex-row justify-start gap-x-1">
                      <RemoveResource
                        resourceId={token.key}
                        resourceType="Token"
                        resourceName={token.key}
                        onRemoveResource={() => merged.onRemoveToken(token.key)}
                      />
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

export default Tokens;
