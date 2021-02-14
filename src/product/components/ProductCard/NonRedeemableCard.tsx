import {Stack, Divider} from "@chakra-ui/react";
import * as React from "react";
import {Image, Text} from "@chakra-ui/react";

import {Product} from "../../types";

interface Props {
  product: Product;
}

const NonRedeemableCard: React.FC<Props> = ({product}) => {
  return (
    <Stack key={product._id} backgroundColor="white" boxShadow="md" padding={6} spacing={3}>
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

export default NonRedeemableCard;
