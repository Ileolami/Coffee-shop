import { createThirdwebClient } from "thirdweb";

import { ConnectButton } from "thirdweb/react";

const client = createThirdwebClient({ clientId: import.meta.env.VITE_CLIENT_ID});

export default function ConnectBtn() {
  return (
  
      <ConnectButton client={client} />
   
  );
}