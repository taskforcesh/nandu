import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "@solidjs/router";
import { Component, createSignal, Match, Show, Switch } from "solid-js";

import { useForm } from "../services/form";
import { UsersService } from "../services/users";

import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-yup";
import { InferType, ref, object, string } from "yup";

import {
  Input,
  FormControl,
  FormErrorMessage,
  FormLabel,
  VStack,
} from "@hope-ui/solid";

import { classNames } from "../utils";

/**
 * PasswordReset Component.
 *
 */
/*
const PasswordReset_: Component = () => {
  const { form, updateFormField } = useForm({
    password: "",
    repeatPassword: "",
  });
  const [errorMessage, setErrorMessage] = createSignal("");
  const [requestedPasswordReset, setRequestedPasswordReset] =
    createSignal(false);

  const { token } = useParams<{ token: string }>();
  const [{ email }] = useSearchParams<{ email: string }>();

  console.log({ token, email });

  const setPassword = async (event: any) => {
    event.preventDefault();
    try {
      const { email } = form;
      await UsersService.changePassword();
      const result = await UsersService.resetPassword(email as string);
      setRequestedPasswordReset(true);
    } catch (e) {
      const error = e as Error;
      setErrorMessage(error.message);
    }
  };

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <div class="w-full max-w-xs">
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <Show
            when={!requestedPasswordReset()}
            fallback={
              <div class="text-gray-700">
                <h2>
                  We have sent you a password link if your email address was
                  correct.
                </h2>
                <h3>
                  When you receive an email from Nandu click on the link to
                  reset your password
                </h3>
              </div>
            }
          >
            <h1 class="text-black mb-3 text-lg">Forgot your password?</h1>
            <p class="text-gray-500 mb-4">
              Type in your email and we will send you a code to reset your
              password!
            </p>
            <div class="mb-4">
              <label
                class="block text-gray-700 text-sm font-bold mb-2"
                for="username"
              >
                Your email
              </label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                value={form.email as string}
                placeholder="name@company.com"
                onChange={updateFormField("email")}
              />
            </div>

            <div class="mb-10 peer-invalid:visible text-pink-600 text-sm">
              {errorMessage}
            </div>
            <div class="flex items-center justify-between">
              <button
                class="bg-amber-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded active:bg-orange-700 focus:outline-none focus:ring focus:ring-amber-400"
                type="button"
                onClick={(e) => setPassword(e)}
              >
                Reset password
              </button>
            </div>
          </Show>
        </form>

        <p class="text-center text-gray-500 text-xs">
          &copy;2022 Taskforce.sh Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PasswordReset_;
*/

const schema = object({
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
  const { token } = useParams<{ token: string }>();
  const [{ email }] = useSearchParams<{ email: string }>();
  const [errorMessage, setErrorMessage] = createSignal("");
  const [success, setSuccess] = createSignal("");

  const navigate = useNavigate();

  const { form, errors, data, isValid, setFields } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      const { newPassword } = values;
      try {
        if (!email) {
          throw new Error("Email is required");
        }
        await UsersService.setPassword(email, token, newPassword);
        setSuccess("Password changed successfully");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (e) {
        const error = e as Error;
        setErrorMessage(error.message);
      }
    },
    initialValues: {},
  });

  const getError = (type: "newPassword" | "confirmPassword") => {
    const error = errors(type);
    if (error) {
      return error[0];
    }
    return "";
  };

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <div class="w-full max-w-xs">
        <div class="bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4 text-gray-200">
          <Switch
            fallback={
              <VStack
                as="form"
                ref={form}
                spacing="$5"
                alignItems="stretch"
                maxW="$96"
                mx="auto"
              >
                <FormControl required invalid={!!errors("newPassword")}>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                  />
                  <FormErrorMessage>{getError("newPassword")}</FormErrorMessage>
                </FormControl>

                <FormControl required invalid={!!errors("confirmPassword")}>
                  <FormLabel>Repeat Password</FormLabel>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat Password"
                  />
                  <FormErrorMessage>
                    {getError("confirmPassword")}
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
                    Change Password
                  </button>
                </div>
              </VStack>
            }
          >
            <Match when={errorMessage()}>
              <div>There were some errors when processing the request:</div>
              <div>{errorMessage()}</div>
            </Match>

            <Match when={success()}>
              <div>{success()}</div>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
