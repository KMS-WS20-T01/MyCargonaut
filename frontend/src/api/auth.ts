import { User } from "../model/User";
import { buildApiUrl, fetchTimeOut } from "./util";

export function getLogin() {
  return fetchTimeOut(buildApiUrl("/auth/login")).then((res) =>
    res.json()
  ) as Promise<User>;
}

export function postLogin(username: string, password: string) {
  return fetchTimeOut(buildApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  }).then((res) => res.json()) as Promise<User>;
}

export function postLogout() {
  return fetchTimeOut(buildApiUrl("/auth/logout"), { method: "POST" });
}

export function postRegister(user: {
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
}) {
  return fetchTimeOut(buildApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
}
