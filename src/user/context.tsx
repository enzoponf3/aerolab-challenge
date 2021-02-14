import React from "react";

import {Product} from "../product/types";

import {User} from "./types";

export interface Context {
  state: {
    user: User;
    history: User["redeemHistory"];
    points: User["points"];
  };
  actions: {
    buy: (product: Product) => Promise<void>;
    addPoints: (points: number) => Promise<void>;
  };
}

const USER = {
  id: "5a03638052fd231590d04eb5",
  name: "John Kite",
  points: 2000,
  redeemHistory: [],
  createDate: 123123123123,
};

const UserContext = React.createContext<Context>({} as Context);

const UserProvider: React.FC = ({children}) => {
  const [user, setUser] = React.useState<User>(USER);

  function handleBuy(product: Product) {
    return new Promise<void>((resolve) => {
      setUser((user) => ({
        ...user,
        points: user.points - product.cost,
        redeemHistory: [...user.redeemHistory, product],
      }));

      return resolve();
    });
  }

  function handleAddPoints(points: number) {
    return new Promise<void>((resolve) => {
      setUser((user) => ({...user, points: user.points + points}));

      return resolve();
    });
  }

  const state: Context["state"] = {
    user: user,
    history: user["redeemHistory"],
    points: user["points"],
  };
  const actions: Context["actions"] = {
    buy: handleBuy,
    addPoints: handleAddPoints,
  };

  return <UserContext.Provider value={{state, actions}}>{children}</UserContext.Provider>;
};

export {UserContext as default, UserProvider as Provider};
