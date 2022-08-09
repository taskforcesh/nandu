import { Component, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "solid-app-router";

import { Session } from "../services/session";

// We need to use the store for the session so that it can be accessed from many places
// inclusive the router.

const [state, setState] = createStore<{ session?: Session }>({});

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
const Login: Component = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const navigate = useNavigate();

  const login = async (event: any) => {
    event.preventDefault();
    try {
      console.log(`Login: ${email()}, Password: ${password()}`);
      const session = await Session.login(email(), password());

      setState({ session });

      if (session) {
        navigate("/dashboard", { replace: true });
      } else {
        // TODO: Show error message.
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
              placeholder="Username"
            />
          </div>
          <div class="mb-6">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="password"
            >
              Password
            </label>
            <input
              class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
            />
            <p class="text-red-500 text-xs italic">Please choose a password.</p>
          </div>
          <div class="flex items-center justify-between">
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={(e) => login(e)}
            >
              Sign In
            </button>
            <a
              class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
        </form>
        <p class="text-center text-gray-500 text-xs">
          &copy;2020 Acme Corp. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
