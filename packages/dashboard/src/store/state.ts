import { createStore } from "solid-js/store";
import { Session } from "../services/session";

export const [state, setState] = createStore<{ session?: Session }>({});
