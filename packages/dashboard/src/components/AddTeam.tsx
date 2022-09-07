import { Component, mergeProps, For } from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-yup";
import type { InferType } from "yup";
import { object, string } from "yup";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Input,
  FormControl,
  FormErrorMessage,
  FormLabel,
  createDisclosure,
} from "@hope-ui/solid";

import { Icon } from "solid-heroicons";
import { userAdd } from "solid-heroicons/solid";

import { classNames } from "../utils";

const schema = object({
  name: string().required(),
  description: string().required(),
});

/**
 * Dashboard Component.
 *
 */
const AddTeam: Component<any> = (props: any) => {
  const merged = mergeProps({ onAddTeam: () => void 0 }, props);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const { form, errors, data, isValid, setFields } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      await merged.onAddTeam(values);
      onClose();
    },
    initialValues: {},
  });

  return (
    <div>
      <button
        onClick={onOpen}
        type="button"
        class={classNames(
          "inline-flex text-sm items-center px-4 py-2 border border-transparent shadow-sm text-sm",
          "font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none",
          "focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        )}
      >
        <Icon class="w-5 h-5 mr-1" path={userAdd} />
        Team
      </button>

      <Modal
        blockScrollOnMount={false}
        opened={isOpen()}
        initialFocus="#teamName"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Add Team</ModalHeader>
          <ModalBody as="form" ref={form}>
            <FormControl required invalid={!!errors("name")}>
              <FormLabel>Name</FormLabel>
              <Input
                id="teamName"
                type="text"
                name="name"
                placeholder="Team Name"
              />
              <FormErrorMessage>{errors("name")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("name")}>
              <FormLabel>Description</FormLabel>
              <Input type="text" name="description" placeholder="Description" />
              <FormErrorMessage>{errors("description")[0]}</FormErrorMessage>
            </FormControl>

            <div class="w-full flex flex-row justify-end my-4">
              <button
                disabled={!isValid()}
                type="submit"
                class={classNames(
                  "bg-orange-500 hover:bg-orange-600 text-white font-bold",
                  "py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Save
              </button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AddTeam;
