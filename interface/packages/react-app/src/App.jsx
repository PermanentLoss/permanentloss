import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Body, Header } from './components';
import OptionsILGraph from './components/OptionsILGraph';
import OptionsSeller from './components/OptionsSeller';
import WalletButton from './components/WalletButton';
import { web3Modal } from './utils/web3Modal';

const DEFAULT_PROVIDER = new EtherscanProvider(
  'homestead',
  process.env.REACT_APP_ETHERSCAN_API_KEY
);

function App() {
  const [provider, setProvider] = useState(null);

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
    <BrowserRouter>
      <Header>
        <WalletButton web3Provider={provider} loadWeb3Modal={loadWeb3Modal} />
      </Header>
      <Body>
        <Routes>
          <Route
            path="/"
            element={
              <OptionsILGraph web3Provider={provider ?? DEFAULT_PROVIDER} />
            }
          />
          <Route
            path="sell/"
            element={<OptionsSeller web3Provider={provider} />}
          />
        </Routes>
      </Body>
    </BrowserRouter>
  );
}

export default App;
