import { createThirdwebClient } from "thirdweb";

import { ConnectButton } from "thirdweb/react";

const client = createThirdwebClient({ clientId: 'fb5cd66563844b8e611b13bff43ac875'});

export default function ConnectBtn() {
  return (
  
      <ConnectButton client={client} />
   
  );
}