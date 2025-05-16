import { Component, createSignal, Show } from "solid-js";
import { useForm } from "../services/form";
import { UsersService } from "../services/users";


// We need to use the store for the session so that it can be accessed from many places
// inclusive the router.

import { setSessionState } from "../store/state";

/**
 * Login Component.
 *
 * Supports user/password.
 * Use Tailwind for styling.
 *
 * - Supports password reset.
 * - Supports registration.
 * - Supports forgot password.
 *
 */
const RequestPasswordReset: Component = () => {
  const { form, updateFormField } = useForm({ email: "" });
  const [errorMessage, setErrorMessage] = createSignal("");
  const [requestedPasswordReset, setRequestedPasswordReset] =
    createSignal(false);

  const resetPassword = async (event: any) => {
    event.preventDefault();
    try {
      const { email } = form;
      console.log({ email });
      const result = await UsersService.resetPassword(email as string);
      console.log(result);

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
              {errorMessage()}
            </div>
            <div class="flex items-center justify-between">
              <button
                class="bg-amber-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded active:bg-orange-700 focus:outline-none focus:ring focus:ring-amber-400"
                type="button"
                onClick={(e) => resetPassword(e)}
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

export default RequestPasswordReset;
