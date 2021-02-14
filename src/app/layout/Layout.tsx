import * as React from "react";
import {Stack} from "@chakra-ui/react";

import Navbar from "./Navbar";

const Layout: React.FC = ({children}) => {
  return (
    <Stack flex={1} spacing={0}>
      <Navbar />
      {children}
    </Stack>
  );
};

export default Layout;
