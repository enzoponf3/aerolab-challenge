import {CircularProgress, useToast} from "@chakra-ui/react";
import React from "react";

import {Product} from "../product/types";
import productApi from "../product/api";

import api from "./api";
import {User} from "./types";

export interface Context {
  state: {
    user: User;
    points: User["points"];
  };
  actions: {
    redeem: (product: Product) => Promise<void>;
    addPoints: (points: number) => Promise<void>;
  };
}

const UserContext = React.createContext<Context>({} as Context);

const UserProvider: React.FC = ({children}) => {
  const [user, setUser] = React.useState<User>();
  const [status, setStatus] = React.useState<"pending" | "resolved" | "rejected">("pending");
  const toast = useToast();

  async function handleRedeem(product: Product) {
    if (!user) return;

    return productApi.redeem(product).then(() => {
      setUser({
        ...user,
        points: user.points - product.cost,
      });

      toast({
        status: "success",
        title: "Good!",
        description: `${product.name} was redeemed!`,
      });
    });
  }

  async function handleAddPoints(points: number) {
    if (!user) return;

    return api.points.add(points).then(() => {
      setUser({...user, points: user.points + points});

      toast({
        status: "success",
        title: "Good!",
        description: `${points} points were added, you now have ${user.points + points} points!`,
      });
    });
  }

  React.useEffect(() => {
    api.fetch().then((user) => {
      setUser(user);
      setStatus("resolved");
    });
  }, []);

  if (!user || status === "pending") {
    return <CircularProgress isIndeterminate color="primary.500" />;
  }

  const state: Context["state"] = {
    user: user,
    points: user["points"],
  };
  const actions: Context["actions"] = {
    redeem: handleRedeem,
    addPoints: handleAddPoints,
  };

  return <UserContext.Provider value={{state, actions}}>{children}</UserContext.Provider>;
};

export {UserContext as default, UserProvider as Provider};
