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
 * Dashboard Component.
 *
 */
const RemoveUser: Component<any> = (props: any) => {
  const merged = mergeProps(
    { user: {}, onRemoveUser: () => void 0, disabled: true },
    props
  );

  const { isOpen, onOpen, onClose } = createDisclosure();

  const removeUser = () => {
    merged.onRemoveUser(merged.user);
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
          "font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none",
          "focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
          "disabled:bg-blue-400 disabled:cursor-not-allowed"
        )}
      >
        <Icon class="w-5 h-5 mr-1" path={userRemove} />
      </button>

      <Modal blockScrollOnMount={false} opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Remove User</ModalHeader>
          <ModalBody>
            <div>
              Are you sure that you want to remove user &nbsp;
              <strong>{merged.user.name}</strong>?
            </div>
          </ModalBody>
          <ModalFooter class="w-full flex flex-row justify-end">
            <button
              onClick={removeUser}
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
                "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium",
                "rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700",
                "focus:outline-none dark:focus:ring-blue-800"
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

export default RemoveUser;
