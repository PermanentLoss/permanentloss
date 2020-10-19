import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Body } from './components';
import ApyCalculator from './components/ApyCalculator';
import Header from './components/Header';
import OptionsILGraph from './components/OptionsILGraph';
import OptionsSeller from './components/OptionsSeller';
import PortfolioDetector from './components/PortfolioDetector/PortfolioDetector';
import WalletButton from './components/WalletButton';
import ethPriceFeed from './utils/ethPriceFeed';
import { web3Modal } from './utils/web3Modal';

const DEFAULT_PROVIDER = new EtherscanProvider(
  'homestead',
  process.env.REACT_APP_ETHERSCAN_API_KEY
);

function App() {
  const [provider, setProvider] = useState(null);
  const [selectedPut, setSelectedPut] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [currentEthPrice, setCurrentEthPrice] = useState(0);
  const [ethPortfolioSize, setEthPortfolioSize] = useState(1);

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

  useEffect(() => {
    const gimmePrice = async () => {
      const providerInUse = provider ?? DEFAULT_PROVIDER;
      const ethPrice = await ethPriceFeed(providerInUse);
      // console.log(`eth price:${ethPrice}`);
      setCurrentEthPrice(ethPrice);
    };
    gimmePrice();
  }, [provider]);

  function removeOption(option) {
    if (option !== null) {
      if (option.isPut) {
        setSelectedPut(null);
      } else {
        setSelectedCall(null);
      }
    }
  }

  function ApyElement() {
    if (selectedPut || selectedCall) {
      return (
        <ApyCalculator
          ethPrice={currentEthPrice}
          put={selectedPut}
          call={selectedCall}
          onRemoveOption={removeOption}
        />
      );
    }
  }

  function changeEthPortfolioSize(newVal) {
    setEthPortfolioSize(newVal);
    removeOption(selectedPut);
    removeOption(selectedCall);
  }

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
              <div>
                <OptionsILGraph
                  web3Provider={provider ?? DEFAULT_PROVIDER}
                  ethPrice={currentEthPrice}
                  ethPortfolioSize={ethPortfolioSize}
                  setSelectedPut={setSelectedPut}
                  setSelectedCall={setSelectedCall}
                />
                <PortfolioDetector
                  web3Provider={provider ?? DEFAULT_PROVIDER}
                  setEthPortfolioSize={changeEthPortfolioSize}
                />
                {ApyElement()}
              </div>
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
