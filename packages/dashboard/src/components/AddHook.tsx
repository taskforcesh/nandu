import { Component, mergeProps, For } from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-yup";
import type { InferType } from "yup";
import { object, string, mixed } from "yup";

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
} from "@hope-ui/solid";

import { Icon } from "solid-heroicons";
import { userAdd } from "solid-heroicons/solid";

import { classNames } from "../utils";

const schema = object({
  type: mixed()
    .oneOf(["owner", "scope", "package"])
    .required()
    .default("package"),
  name: string().required(),
  endpoint: string().required(),
  secret: string().required(),
});

/**
 * Dashboard Component.
 *
 */
const AddHook: Component<any> = (props: any) => {
  const merged = mergeProps({ onAddHook: () => void 0 }, props);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const { form, errors, data, isValid, setFields } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      await merged.onAddHook(values);
      onClose();
    },
    initialValues: {
      type: "package",
    },
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
        Hook
      </button>

      <Modal
        blockScrollOnMount={false}
        opened={isOpen()}
        initialFocus="#name"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Add Hook</ModalHeader>
          <ModalBody as="form" ref={form}>
            <FormControl required invalid={!!errors("type")}>
              <FormLabel>Type</FormLabel>
              <Select
                defaultValue="package"
                onChange={(value) => setFields("type", value)}
              >
                <SelectTrigger>
                  <SelectPlaceholder>Hook type</SelectPlaceholder>
                  <SelectValue />
                  <SelectIcon />
                </SelectTrigger>
                <SelectContent>
                  <SelectListbox>
                    <For each={["owner", "scope", "package"]}>
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

            <FormControl required invalid={!!errors("name")}>
              <FormLabel>Name</FormLabel>
              <Input id="name" type="text" name="name" placeholder="Name" />
              <FormErrorMessage>{errors("pkg")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("endpoint")}>
              <FormLabel>Endpoint</FormLabel>
              <Input type="text" name="endpoint" placeholder="Url" />
              <FormErrorMessage>{errors("endpoint")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("secret")}>
              <FormLabel>Secret</FormLabel>
              <Input type="text" name="secret" placeholder="Secret" />
              <FormErrorMessage>{errors("secret")[0]}</FormErrorMessage>
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

export default AddHook;
