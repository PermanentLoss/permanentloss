import React from 'react';
import { Button } from '..';
import { logoutOfWeb3Modal } from '../../utils/web3Modal';

export default function WalletButton({ provider, loadWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? 'Connect Wallet' : 'Disconnect Wallet'}
    </Button>
  );
}
