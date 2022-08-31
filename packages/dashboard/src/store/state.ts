import { createStore } from "solid-js/store";
import { Signal, createSignal } from "solid-js";
import { Session } from "../services/session";

export const [state, setState] = createStore<{
  currentOrganizationId?: string;
}>({});

function createLocalStorageSignal<T>(
  key: string,
  defaultValue: T,
  storage = localStorage
): Signal<T> {
  const item = storage.getItem(key);
  const initialValue = item ? (JSON.parse(item) as T) : defaultValue;

  const [value, setValue] = createSignal<T>(initialValue);

  const setValueAndStore = ((arg) => {
    const value = setValue(arg);
    storage.setItem(key, JSON.stringify(value));
    return value;
  }) as typeof setValue;

  return [value, setValueAndStore];
}

export const [sessionState, setSessionState] = createLocalStorageSignal<{
  currentOrganizationId?: string;
  session?: Session;
}>("nandu-session", {});
