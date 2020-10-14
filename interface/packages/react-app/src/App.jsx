import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import React, { useCallback, useEffect, useState } from 'react';
import { Body, Header } from './components';
import OptionsILGraph from './components/OptionsILGraph';
import WalletButton from './components/WalletButton';
import { web3Modal } from './utils/web3Modal';

const DEFAULT_PROVIDER = new EtherscanProvider(
  'homestead',
  process.env.REACT_APP_ETHERSCAN_API_KEY
);

function App() {
  const [provider, setProvider] = useState();

  /* Open wallet selection modal. */
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    setProvider(new Web3Provider(newProvider));
  }, []);

  /* If user has loaded a wallet before, load it automatically. */
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  return (
    <div>
      <Header>
        <WalletButton web3Provider={provider} loadWeb3Modal={loadWeb3Modal} />
      </Header>
      <Body>
        <OptionsILGraph web3Provider={DEFAULT_PROVIDER} />
      </Body>
    </div>
  );
}

export default App;
