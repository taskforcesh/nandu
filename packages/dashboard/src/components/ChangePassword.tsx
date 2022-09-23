import { Component, mergeProps } from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-yup";
import { InferType, ref, object, string } from "yup";

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

import { classNames } from "../utils";

const schema = object({
  oldPassword: string().required("old password is required"),
  newPassword: string()
    .required()
    .min(8, "Password must have at least 8 characters"),
  confirmPassword: string()
    .required("This is a required field")
    .oneOf([ref("newPassword"), null], "Passwords must match"),
});

/**
 * Change Password Component.
 *
 */
const ChangePassword: Component<any> = (props: any) => {
  const merged = mergeProps({ onChangePassword: () => void 0 }, props);

  const { isOpen, onOpen, onClose } = createDisclosure();

  const { form, errors, data, isValid, setFields } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      await merged.onChangePassword(values);
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
        Change Password
      </button>

      <Modal
        blockScrollOnMount={false}
        opened={isOpen()}
        initialFocus="#oldPassword"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody as="form" ref={form}>
            <FormControl required invalid={!!errors("oldPassword")}>
              <FormLabel>Old Password</FormLabel>
              <Input
                id="oldPassword"
                type="password"
                name="oldPassword"
                placeholder="Old Password"
              />
              <FormErrorMessage>{errors("oldPassword")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("newPassword")}>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                name="newPassword"
                placeholder="New Password"
              />
              <FormErrorMessage>{errors("newPassword")[0]}</FormErrorMessage>
            </FormControl>

            <FormControl required invalid={!!errors("confirmPassword")}>
              <FormLabel>Repeat Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Repeat Password"
              />
              <FormErrorMessage>
                {errors("confirmPassword")[0]}
              </FormErrorMessage>
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

export default ChangePassword;
