import * as React from "react";
import {Stack, Divider, Image, Text} from "@chakra-ui/react";

import {Product} from "../types";
import {useRedeem, usePoints} from "../../user/hooks";
import coin from "../../assets/icons/coin.svg";

interface Props {
  product: Product;
}

const RedeemableCard: React.FC<Props> = ({product}) => {
  const [points] = usePoints();
  const redeem = useRedeem();
  const canBuy = product.cost <= points;

  function handleRedeem() {
    if (canBuy) {
      return redeem(product);
    }
  }

  return (
    <Stack
      key={product._id}
      backgroundColor="white"
      boxShadow="md"
      cursor={canBuy ? "pointer" : "not-allowed"}
      opacity={canBuy ? 1 : 0.5}
      padding={6}
      position="relative"
      spacing={3}
      onClick={handleRedeem}
    >
      <Stack
        alignItems="center"
        backgroundColor="white"
        borderColor={canBuy ? "primary.500" : "orange.500"}
        borderRadius={9999}
        borderWidth={1}
        color={canBuy ? "primary.500" : "orange.500"}
        direction="row"
        fontSize="sm"
        fontWeight="500"
        justifyContent="center"
        paddingX={3}
        paddingY={1}
        position="absolute"
        right={6}
        spacing={2}
        top={6}
        zIndex={1}
      >
        <Text>{canBuy ? product.cost : `Missing ${product.cost - points} points`}</Text>
        {canBuy && <Image height={4} src={coin} width={4} />}
      </Stack>
      <Image objectFit="contain" src={product.img.url} width={64} />
      <Divider />
      <Stack alignItems="flex-start" spacing={0}>
        <Text color="gray.500" fontSize="sm">
          {product.category}
        </Text>
        <Text fontWeight="500">{product.name}</Text>
      </Stack>
    </Stack>
  );
};

export default RedeemableCard;
