import * as React from "react";
import {Stack, Divider, Image, Text, Box, StackProps, Flex, Button, Center} from "@chakra-ui/react";

import {useRedeem, usePoints} from "../../user/hooks";
import coin from "../../assets/icons/coin.svg";
import {Product} from "../types";

interface Props extends StackProps {
  product: Product;
  isSelected: boolean;
}

const RedeemableCard: React.FC<Props> = ({product, isSelected, ...props}) => {
  const [points] = usePoints();
  const redeem = useRedeem();
  const canBuy = product.cost <= points;

  function handleRedeem() {
    if (canBuy) {
      return redeem(product);
    }
  }

  return (
    <Box
      backgroundColor="white"
      borderRadius="sm"
      boxShadow="md"
      cursor={canBuy ? "pointer" : "not-allowed"}
      opacity={canBuy ? 1 : 0.5}
      padding={6}
      position="relative"
      {...props}
    >
      <Stack spacing={3}>
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
        >
          <Text>{canBuy ? product.cost : `Missing ${product.cost - points} points`}</Text>
          {canBuy && <Image height={4} src={coin} width={4} />}
        </Stack>
        <Center>
          <Image objectFit="contain" src={product.img.url} width={64} />
        </Center>
        <Divider />
        <Stack alignItems="flex-start" spacing={0}>
          <Text color="gray.500" fontSize="sm">
            {product.category}
          </Text>
          <Text fontWeight="500">{product.name}</Text>
        </Stack>
      </Stack>
      {isSelected && (
        <Flex
          alignItems="center"
          borderRadius="sm"
          height="100%"
          justifyContent="center"
          left={0}
          position="absolute"
          top={0}
          width="100%"
          zIndex={2}
        >
          <Box
            backgroundColor={canBuy ? "primary.500" : "gray.500"}
            borderRadius="sm"
            height="100%"
            left={0}
            opacity={0.9}
            position="absolute"
            top={0}
            width="100%"
          />
          <Stack color="white" fontSize="2xl" fontWeight="bold" spacing={6} zIndex={3}>
            <Stack spacing={0}>
              <Text>{points}</Text>
              <Text borderBottomColor="white" borderBottomWidth={2}>
                -{product.cost}
              </Text>
              <Text>{points - product.cost}</Text>
            </Stack>
            {canBuy && (
              <Button color="primary.500" variant="solid" onClick={handleRedeem}>
                Redeem now
              </Button>
            )}
          </Stack>
        </Flex>
      )}
    </Box>
  );
};

export default RedeemableCard;
