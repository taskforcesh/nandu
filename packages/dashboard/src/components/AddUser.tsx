import { Component, mergeProps, For } from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-yup";
import type { InferType } from "yup";
import { mixed, object, string } from "yup";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Input,
  Select,
  SelectTrigger,
  SelectPlaceholder,
  SelectValue,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionText,
  SelectOptionIndicator,
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
  email: string().email().required(),
  type: mixed().oneOf(["user", "root"]).required().default("user"),
  role: mixed()
    .oneOf(["developer", "admin", "owner"])
    .required()
    .default("developer"),
});

/**
 * Dashboard Component.
 *
 */
const AddUser: Component<any> = (props: any) => {
  const merged = mergeProps({ onAddUser: () => void 0 }, props);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const { form, errors, data, isValid, setFields } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      await merged.onAddUser(values);
      onClose();
    },
    initialValues: {
      type: "user",
      role: "developer",
    },
  });

  return (
    <div>
      <button
        onClick={onOpen}
        type="button"
        class={classNames(
          "inline-flex text-sm items-center px-4 py-2 border border-transparent shadow-sm text-sm",
          "font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none",
          "focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        )}
      >
        <Icon class="w-5 h-5 mr-1" path={userAdd} />
        User
      </button>

      <Modal
        blockScrollOnMount={false}
        opened={isOpen()}
        initialFocus="#userName"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Add User</ModalHeader>
          <ModalBody as="form" ref={form}>
            <FormControl required invalid={!!errors("name")}>
              <FormLabel>Name</FormLabel>
              <Input
                id="userName"
                type="text"
                name="name"
                placeholder="username"
              />
              <FormErrorMessage>{errors("name")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("email")}>
              <FormLabel>Email</FormLabel>
              <Input type="email" name="email" placeholder="user@nandu.land" />
              <FormErrorMessage>{errors("email")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("type")}>
              <FormLabel>Type</FormLabel>
              <Select
                defaultValue="user"
                onChange={(value) => setFields("type", value)}
              >
                <SelectTrigger>
                  <SelectPlaceholder>User type</SelectPlaceholder>
                  <SelectValue />
                  <SelectIcon />
                </SelectTrigger>
                <SelectContent>
                  <SelectListbox>
                    <For each={["user", "root"]}>
                      {(item) => (
                        <SelectOption value={item}>
                          <SelectOptionText>{item}</SelectOptionText>
                          <SelectOptionIndicator />
                        </SelectOption>
                      )}
                    </For>
                  </SelectListbox>
                </SelectContent>
              </Select>
              <FormErrorMessage>{errors("type")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("role")}>
              <FormLabel>Role</FormLabel>
              <Select
                defaultValue="developer"
                onChange={(value) => setFields("role", value)}
              >
                <SelectTrigger>
                  <SelectPlaceholder>User role</SelectPlaceholder>
                  <SelectValue />
                  <SelectIcon />
                </SelectTrigger>
                <SelectContent>
                  <SelectListbox>
                    <For each={["developer", "admin", "owner"]}>
                      {(item) => (
                        <SelectOption value={item}>
                          <SelectOptionText>{item}</SelectOptionText>
                          <SelectOptionIndicator />
                        </SelectOption>
                      )}
                    </For>
                  </SelectListbox>
                </SelectContent>
              </Select>
              <FormErrorMessage>{errors("role")[0]}</FormErrorMessage>
            </FormControl>

            <div class="w-full flex flex-row justify-end my-4">
              <button
                disabled={!isValid()}
                type="submit"
                class={classNames(
                  "bg-blue-500 hover:bg-blue-700 text-white font-bold",
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

export default AddUser;
