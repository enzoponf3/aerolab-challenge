import axios from "axios";

import {API_KEY, API_URL} from "../app/constants";

import {Product} from "./types";

export default {
  list: (): Promise<Product[]> =>
    axios
      .get<Product[]>(`${API_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      })
      .then((res) => res.data),
  redeem: (product: Product): Promise<Product> =>
    axios
      .post<Product>(
        `${API_URL}/redeem`,
        {
          productId: product._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      )
      .then((res) => res.data),
};
