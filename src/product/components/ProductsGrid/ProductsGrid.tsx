import * as React from "react";
import {Divider, Grid, Stack} from "@chakra-ui/react";

import {Product} from "../../types";
import ProductCard from "../ProductCard";

import {Filter} from "./types";
import Count from "./Count";
import Filters from "./Filters";

interface Props {
  products: Product[];
  canBuy?: boolean;
}

const ProductsGrid: React.FC<Props> = ({products, canBuy}) => {
  const [filter, setFilter] = React.useState<Filter>(Filter.MostRecent);
  const filteredProducts = React.useMemo(() => {
    switch (filter) {
      case Filter.HighestPrice: {
        return [...products].sort((a, b) => b.cost - a.cost);
      }

      case Filter.LowestPrice: {
        return [...products].sort((a, b) => a.cost - b.cost);
      }

      case Filter.MostRecent:
      default: {
        return products;
      }
    }
  }, [filter, products]);

  return (
    <Stack alignItems="flex-start" spacing={6}>
      <Stack
        alignItems="center"
        as="nav"
        direction="row"
        divider={<Divider borderColor="gray.300" height={12} orientation="vertical" />}
        flex={1}
        spacing={6}
        width="100%"
      >
        <Count current={filteredProducts.length} total={products.length} />
        <Filters active={filter} onChange={setFilter} />
      </Stack>
      <Grid gap={6} templateColumns="repeat(auto-fill, minmax(256px, 1fr))" width="100%">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} canBuy={canBuy} product={product} />
        ))}
      </Grid>
      <Count current={filteredProducts.length} total={products.length} />
    </Stack>
  );
};

export default ProductsGrid;
