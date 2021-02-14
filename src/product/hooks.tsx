import React from "react";

import ProductContext, {Context} from "./context";

export function useProducts(): Context["state"]["products"] {
  const {
    state: {products},
  } = React.useContext(ProductContext);

  return products;
}
