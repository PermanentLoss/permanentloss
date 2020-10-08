import { useQuery } from "@apollo/react-hooks";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider, Web3Provider } from "@ethersproject/providers";
import { abis, addresses, MAINNET_ID } from "@uniswap-v2-app/contracts";
import React, { useCallback, useEffect, useState } from "react";
import Plot from 'react-plotly.js';
import { Body, Button, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import GET_AGGREGATED_UNISWAP_DATA from "./graphql/subgraph";
import { logoutOfWeb3Modal, web3Modal } from './utils/web3Modal';

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const network = "homestead" // mainnet
  const defaultProvider = getDefaultProvider(network, {
    etherscan: process.env.REACT_APP_ETHERSCAN_API_KEY,
    infura: process.env.REACT_APP_INFURA_PROJECT_ID,
    alchemy: process.env.REACT_APP_ALCHEMY_API_KEY
  });
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const daiWethExchangeContract = new Contract(addresses[MAINNET_ID].pairs["DAI-WETH"], abis.pair, defaultProvider);
  // Reserves held in the DAI-WETH pair contract
  const reserves = await daiWethExchangeContract.getReserves();
  console.log({ reserves });
}

function WalletButton({ provider, loadWeb3Modal }) {
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
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function getImpermanentLossPoints() {
  const x = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 3, 4, 5];
  // Equation from https://uniswap.org/docs/v2/advanced-topics/understanding-returns/
  const y = x.map(x => 2 * Math.sqrt(x) / (1+x) - 1);
  return [x, y];
}

function App() {
  const { loading, error, data } = useQuery(GET_AGGREGATED_UNISWAP_DATA);
  const [provider, setProvider] = useState();
  const impermanentLossPoints = getImpermanentLossPoints();

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

  React.useEffect(() => {
    if (!loading && !error && data && data.uniswapFactories) {
      console.log({ uniswapFactories: data.uniswapFactories });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} />
      </Header>
      <Body>
      <Plot
        data={[
          {
            x: impermanentLossPoints[0],
            y: impermanentLossPoints[1],
            type: 'scatter',
            mode: 'lines',
            line: {'shape': 'spline', 'smoothing': .5},
            marker: {color: 'blue'},
          },
        ]}
        layout={ {width: 720, height: 360, title: 'IL Chart'} }
      />
      </Body>
    </div>
  );
}

export default App;
