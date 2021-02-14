import React from "react";

import UserContext, {Context} from "./context";

export function usePoints(): [Context["state"]["points"], Context["actions"]["addPoints"]] {
  const {
    state: {points},
    actions: {addPoints},
  } = React.useContext(UserContext);

  return [points, addPoints];
}

export function useHistory(): [Context["state"]["history"], Context["actions"]["buy"]] {
  const {
    state: {history},
    actions: {buy},
  } = React.useContext(UserContext);

  return [history, buy];
}
