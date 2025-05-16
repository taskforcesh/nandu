import { Component, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

import { Session } from "../services/session";
import { useForm } from "../services/form";

// We need to use the store for the session so that it can be accessed from many places
// inclusive the router.

import { setSessionState } from "../store/state";

/**
 * Login Component.
 *
 * Supports user/password.
 * Use Tailwind for styling.
 *
 * - Supports forgot password.
 *
 */
const Login: Component = () => {
  const navigate = useNavigate();

  const { form, updateFormField } = useForm({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = createSignal("");

  const login = async (event: any) => {
    event.preventDefault();
    try {
      const { username, password } = form;
      const session = await Session.login(
        username as string,
        password as string
      );

      if (session) {
        setSessionState({ session });
        navigate("/", { replace: true });
      } else {
        setErrorMessage("The username or password you entered is incorrect");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <div class="w-full max-w-xs">
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="username"
            >
              Username
            </label>
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              value={form.username as string}
              placeholder="Username"
              onChange={updateFormField("username")}
            />
          </div>
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="password"
            >
              Password
            </label>
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={form.password as string}
              placeholder="*********"
              onChange={updateFormField("password")}
            />
          </div>
          <div class="mb-10 peer-invalid:visible text-pink-600 text-sm">
            {errorMessage()}
          </div>
          <div class="flex items-center justify-between">
            <button
              class="bg-amber-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded active:bg-orange-700 focus:outline-none focus:ring focus:ring-amber-400"
              type="button"
              onClick={(e) => login(e)}
            >
              Login
            </button>
            {
              <a
                class="inline-block align-baseline font-bold text-sm text-orange-400 hover:text-orange-600"
                href="/request-password-reset"
              >
                Forgot password?
              </a>
            }
          </div>
        </form>
        <p class="text-center text-gray-500 text-xs">
          &copy;2022 Taskforce.sh Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
