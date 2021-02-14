import * as React from "react";
import {Container, Stack, Heading, Box, Flex} from "@chakra-ui/react";

import header from "../../../assets/header.png";
import ProductsGrid from "../../../product/components/ProductsGrid";
import {useProducts} from "../../../product/hooks";

const HomeScreen: React.FC = () => {
  const products = useProducts();

  return (
    <Stack backgroundColor="gray.50" flex={1} spacing={0}>
      <Flex as="header" minHeight={64} position="relative">
        <Box
          backgroundColor="primary.500"
          height="100%"
          left={0}
          position="absolute"
          style={{mixBlendMode: "overlay"}}
          top={0}
          width="100%"
          zIndex={1}
        />
        <Container
          alignItems="flex-end"
          backgroundImage={`url(${header})`}
          backgroundSize="cover"
          display="flex"
          filter="grayscale(1)"
          flex={1}
          height="100%"
          justifyContent="flex-start"
          maxWidth="6xl"
          minHeight={64}
          paddingY={7}
        >
          <Heading color="white" fontSize="4xl" width="fit-content">
            Electronics
          </Heading>
        </Container>
      </Flex>
      <Stack as="main">
        <Container marginTop={6} maxWidth="6xl">
          <ProductsGrid canBuy products={products} />
        </Container>
      </Stack>
    </Stack>
  );
};

export default HomeScreen;
