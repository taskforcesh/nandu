import { ActionBase } from "cli-ux";
import { AxiosResponse } from "axios";

export const wrapAction = async (action: ActionBase, actionFn: () => {}) => {
  try {
    await actionFn();
  } catch (err) {
    console.log((<any>err).code, (<any>err).message);
    action.stop();
    const response = (<any>err).response as AxiosResponse;
    if (response) {
      const { status, statusText } = response;
      console.error(`Error ${status} ${statusText}`);
    }
  }
};
