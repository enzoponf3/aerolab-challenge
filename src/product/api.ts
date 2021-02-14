import axios from "axios";

import {Product} from "./types";

export default {
  list: (): Promise<Product[]> =>
    axios
      .get<Product[]>(`${import.meta.env.VITE_API_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      })
      .then((res) => res.data),
  redeem: (product: Product): Promise<Product> =>
    axios
      .post<Product>(
        `${import.meta.env.VITE_API_URL}/redeem`,
        {
          productId: product._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        },
      )
      .then((res) => res.data),
};
