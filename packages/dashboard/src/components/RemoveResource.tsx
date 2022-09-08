import { Component, mergeProps } from "solid-js";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  createDisclosure,
  ModalFooter,
} from "@hope-ui/solid";

import { Icon } from "solid-heroicons";
import { userRemove } from "solid-heroicons/solid";

import { classNames } from "../utils";

/**
 * Remove Resource Component.
 *
 */
const RemoveResource: Component<any> = (props: any) => {
  const merged = mergeProps(
    {
      resourceType: "Resource",
      resourceName: "Name",
      resourceId: "id",
      onRemoveResource: () => void 0,
      disabled: false,
    },
    props
  );

  const { isOpen, onOpen, onClose } = createDisclosure();

  const removeResource = () => {
    merged.onRemoveResource(merged.resourceId);
    onClose();
  };

  return (
    <div>
      <button
        disabled={merged.disabled}
        onClick={onOpen}
        type="button"
        class={classNames(
          "inline-flex text-sm items-center px-4 py-2 border border-transparent shadow-sm text-sm",
          "font-medium rounded-md text-white bg-orange-400 hover:bg-amber-500 focus:outline-none",
          "focus:ring-2 focus:ring-offset-2 focus:ring-amber-500",
          "disabled:bg-amber-400 disabled:cursor-not-allowed"
        )}
      >
        <Icon class="w-5 h-5 mr-1" path={userRemove} />
      </button>

      <Modal blockScrollOnMount={false} opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Remove {merged.resourceType}</ModalHeader>
          <ModalBody>
            <div>
              Are you sure that you want to remove &nbsp;
              {merged.resourceType.toLowerCase()} &nbsp;
              <strong>{merged.resourceName}</strong>?
            </div>
          </ModalBody>
          <ModalFooter class="w-full flex flex-row justify-end">
            <button
              onClick={removeResource}
              class={classNames(
                "focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4",
                "focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2",
                "dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              )}
            >
              OK
            </button>
            <button
              onClick={onClose}
              class={classNames(
                "text-white bg-yellow-400 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium",
                "rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-amber-400 dark:hover:bg-amber-500",
                "focus:outline-none dark:focus:ring-yellow-800"
              )}
            >
              Cancel
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RemoveResource;
