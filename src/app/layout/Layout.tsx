import * as React from "react";
import {Center, Container, Stack} from "@chakra-ui/react";

import Navbar from "./Navbar";

const Layout: React.FC = ({children}) => {
  return (
    <Stack backgroundColor="gray.100" flex={1} spacing={0}>
      <Navbar />
      <Center>
        <Container maxWidth="6xl">{children}</Container>
      </Center>
    </Stack>
  );
};

export default Layout;
