import * as React from "react";
import {Divider, Stack} from "@chakra-ui/react";

import {Product} from "../../types";

import {Filter} from "./types";
import Count from "./Count";
import Filters from "./Filters";
import Grid from "./Grid";

interface Props {
  products: Product[];
}

const ProductsList: React.FC<Props> = ({products}) => {
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
      <Grid products={filteredProducts} />
      <Count current={filteredProducts.length} total={products.length} />
    </Stack>
  );
};

export default ProductsList;
