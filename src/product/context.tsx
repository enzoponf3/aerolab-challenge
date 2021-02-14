import React from "react";

import {Product} from "./types";

export interface Context {
  state: {products: Product[]};
}

const PRODUCTS: Product[] = [
  {
    _id: "5a033eeb364bf301523e9b92",
    name: "Sandalia Pale Gold YSL",
    cost: 200,
    category: "Indumentaria",
    img: {
      url: "https://coding-challenge-api.aerolab.co/images/Alienware13-x2.png",
      hdUrl: "https://coding-challenge-api.aerolab.co/images/Alienware13-x2.png",
    },
  },
  {
    _id: "5a033f0f364bf301523e9b93",
    name: "iPhone 7 Case Sea-Blue",
    cost: 3000,
    category: "Accesorios",
    img: {
      url: "https://coding-challenge-api.aerolab.co/images/SamsungTabS2-x1.png",
      hdUrl: "https://coding-challenge-api.aerolab.co/images/SamsungTabS2-x1.png",
    },
  },
];

const ProductContext = React.createContext<Context>({} as Context);

const ProductProvider: React.FC = ({children}) => {
  const [products] = React.useState<Product[]>(PRODUCTS);

  const state = {
    products,
  };

  return <ProductContext.Provider value={{state}}>{children}</ProductContext.Provider>;
};

export {ProductContext as default, ProductProvider as Provider};
