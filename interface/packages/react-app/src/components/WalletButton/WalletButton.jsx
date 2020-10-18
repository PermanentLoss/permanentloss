import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import PropTypes from 'prop-types';
import React from 'react';
import { logoutOfWeb3Modal } from '../../utils/web3Modal';
import { Button } from '../index';

function WalletButton({ web3Provider, loadWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!web3Provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!web3Provider ? 'Connect Wallet' : 'Disconnect Wallet'}
    </Button>
  );
}

WalletButton.propTypes = {
  web3Provider: PropTypes.oneOfType([
    PropTypes.instanceOf(Web3Provider),
    PropTypes.instanceOf(EtherscanProvider),
  ]),
  loadWeb3Modal: PropTypes.func.isRequired,
};

export default WalletButton;
