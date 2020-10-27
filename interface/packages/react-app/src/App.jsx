import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useCallback, useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import ApyCalculator from './components/ApyCalculator';
import Faq from './components/Faq';
import Header from './components/Header';
import OptionsILGraph from './components/OptionsILGraph';
import OptionsSeller from './components/OptionsSeller';
import PortfolioDetector from './components/PortfolioDetector/PortfolioDetector';
import './index.css';
import ethPriceFeed from './utils/ethPriceFeed';
import { web3Modal } from './utils/web3Modal';

const ColAlignedWithGraphTitle = styled(Col)`
  margin-top: 20px;
`;

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
  const [removedOption, setRemovedOption] = useState(null);

  /* Open wallet selection modal. */
  const loadWeb3Modal = useCallback(async () => {
    try {
      const newProvider = await web3Modal.connect();
      setProvider(new Web3Provider(newProvider));
    } catch {
      // Ignore when user closes the modal before connecting to the Web3 wallet
    }
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
      setRemovedOption(option);
    }
  }

  function ApyElement() {
    if (selectedPut || selectedCall) {
      return (
        <ApyCalculator
          ethPrice={currentEthPrice}
          ethPortfolioSize={ethPortfolioSize}
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
      <Header web3Provider={provider} loadWeb3Modal={loadWeb3Modal} />
      <Container fluid>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Row className="">
                  <Col>
                    <OptionsILGraph
                      web3Provider={provider ?? DEFAULT_PROVIDER}
                      ethPrice={currentEthPrice}
                      ethPortfolioSize={ethPortfolioSize}
                      setSelectedPut={setSelectedPut}
                      setSelectedCall={setSelectedCall}
                      removeSelectionOf={removedOption}
                    />
                  </Col>
                  <ColAlignedWithGraphTitle>
                    <PortfolioDetector
                      web3Provider={provider ?? DEFAULT_PROVIDER}
                      setEthPortfolioSize={changeEthPortfolioSize}
                    />
                    {ApyElement()}
                  </ColAlignedWithGraphTitle>
                </Row>
              </>
            }
          />
          <Route
            path="sell/"
            element={<OptionsSeller web3Provider={provider} />}
          />
          <Route path="/faq">
            <Route path=":id"
              element={
                <>
                  <Row className="justify-content-center">
                    <Faq />
                  </Row>
                </>
              }
            />
            <Route path=""
              element={
                <>
                  <Row className="justify-content-center">
                    <Faq />
                  </Row>
                </>
              }
            />
          </Route>
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
