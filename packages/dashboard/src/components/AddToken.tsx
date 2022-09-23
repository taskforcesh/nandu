import { Component, mergeProps } from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-yup";
import { boolean, InferType, object, string  } from "yup";

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
  Checkbox,
} from "@hope-ui/solid";

import { Icon } from "solid-heroicons";
import { userAdd } from "solid-heroicons/solid";

import { classNames } from "../utils";

const schema = object({
  readOnly: boolean().required().default(true),
  password: string().required(),
});

/**
 * Change Password Component.
 *
 */
const AddToken: Component<any> = (props: any) => {
  const merged = mergeProps({ onAddToken: () => void 0 }, props);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const { form, errors, data, isValid, setFields } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      await merged.onAddToken(values);
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
        Token
      </button>

      <Modal
        blockScrollOnMount={false}
        opened={isOpen()}
        onClose={onClose}
        initialFocus="#password"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>New Token</ModalHeader>
          <ModalBody as="form" ref={form}>
            <Checkbox name="readOnly" defaultChecked>
              Read Only
            </Checkbox>

            <FormControl required invalid={!!errors("password")}>
              <FormLabel>Password</FormLabel>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your Password"
              />
              <FormErrorMessage>{errors("password")[0]}</FormErrorMessage>
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
                New Token
              </button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AddToken;
