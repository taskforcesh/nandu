import { Component, createSignal, mergeProps } from "solid-js";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Input,
} from "@hope-ui/solid";

/**
 * Dashboard Component.
 *
 */
const AddOrganization: Component<any> = (props: any) => {
  const merged = mergeProps(
    { onAddOrganization: () => void 0, onClose: () => void 0 },
    props
  );

  const [newOrganization, setNewOrganization] = createSignal("");
  const updateOrganizationName = (event: any) =>
    setNewOrganization(event.target.value);

  async function saveOrganization(event: any) {
    merged.onAddOrganization({
      organizationId: newOrganization(),
      role: "owner",
    });
    merged.onClose();
  }

  return (
    <Modal
      blockScrollOnMount={false}
      opened={props.isOpen()}
      initialFocus="#organizationName"
      onClose={() => {
        merged.onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Add Organization</ModalHeader>
        <ModalBody>
          <Text fontWeight="$bold"></Text>
          <Input
            id="organizationName"
            placeholder="Organization name"
            onInput={updateOrganizationName}
          />
        </ModalBody>
        <ModalFooter>
          <button
            disabled={!newOrganization()}
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={saveOrganization}
          >
            Save
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOrganization;
