import axios from "axios";
import { AxiosRequestConfig } from "axios";

export const addToken = async (
  registry: string,
  userName: string,
  password: string,
  opts: AxiosRequestConfig<any>,
  readonly = false,
  cidrWhitelist = ""
) => {
  const url = `${registry}/-/npm/v1/tokens/org.couchdb.user:${userName}`;

  const { data: token } = await axios.post(
    url,
    {
      password,
      readonly,
      cidr_whitelist: cidrWhitelist.split(","),
    },
    opts
  );

  return token;
};

export const listTokens = async (
  registry: string,
  userName: string,
  opts: AxiosRequestConfig<any>
) => {
  const url = `${registry}/-/npm/v1/tokens/org.couchdb.user:${userName}`;
  const { data } = await axios.get(url, opts);
  return data;
};

export const addUser = async (
  registry: string,
  name: string,
  password: string,
  email: string,
  opts: AxiosRequestConfig<any>
) => {
  const _id = `org.couchdb.user:${name}`;
  const url = `${registry}/-/user/${_id}`;
  const { data } = await axios.put(
    url,
    {
      _id,
      name,
      password,
      email,
      type: "user",
    },
    opts
  );

  return data;
};
