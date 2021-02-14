import React from "react";

import UserContext, {Context} from "./context";

export function usePoints(): [Context["state"]["points"], Context["actions"]["addPoints"]] {
  const {
    state: {points},
    actions: {addPoints},
  } = React.useContext(UserContext);

  return [points, addPoints];
}

export function useRedeem(): Context["actions"]["redeem"] {
  const {
    actions: {redeem},
  } = React.useContext(UserContext);

  return redeem;
}
