import axios from "axios";

import {API_KEY, API_URL} from "../app/constants";

import {User} from "./types";

export default {
  fetch: (): Promise<User> =>
    axios
      .get<User>(`${API_URL}/user/me`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      })
      .then((res) => res.data),
  points: {
    add: (amount: number) =>
      axios
        .post<number>(
          `${API_URL}/user/points`,
          {amount},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
          },
        )
        .then((res) => res.data),
  },
};
