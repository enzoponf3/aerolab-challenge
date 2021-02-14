import * as React from "react";

import {Product} from "../../types";

import RedeemableCard from "./RedeemableCard";
import NonRedeemableCard from "./NonRedeemableCard";

interface Props {
  product: Product;
  canBuy?: boolean;
}

const ProductCard: React.FC<Props> = ({product, canBuy = false}) => {
  if (canBuy) {
    return <RedeemableCard product={product} />;
  }

  return <NonRedeemableCard product={product} />;
};

export default ProductCard;
