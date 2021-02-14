import axios from "axios";

import {User} from "./types";

export default {
  fetch: (): Promise<User> =>
    axios
      .get<User>(`${import.meta.env.VITE_API_URL}/user/me`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      })
      .then((res) => res.data),
  points: {
    add: (amount: number) =>
      axios
        .post<number>(
          `${import.meta.env.VITE_API_URL}/user/points`,
          {amount},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
          },
        )
        .then((res) => res.data),
  },
};
