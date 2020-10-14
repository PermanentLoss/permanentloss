import { Web3Provider } from '@ethersproject/providers';
import { abis } from '@uniswap-v2-app/contracts';
import { Contract } from 'ethers';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import {
  getEthCallOptions,
  getEthPutOptions,
  getImpermanentLossPoints
} from './utils';

function OptionsILGraph({ web3Provider }) {
  const [putOptions, setPutOptions] = useState([]);
  const [callOptions, setCallOptions] = useState([]);

  const OPYN_UNISWAP_EXCHANGE = '0xc0a47dfe034b400b47bdad5fecda2621de6c4d95';

  const opynUniswapContract = useMemo(
    () =>
      new Contract(OPYN_UNISWAP_EXCHANGE, abis.uniswapv1_factory, web3Provider),
    [web3Provider]
  );

  useEffect(() => {
    const gimmeOptions = async () => {
      const options = await getEthPutOptions(web3Provider, opynUniswapContract);
      setPutOptions(options);
    };
    gimmeOptions();
  }, [opynUniswapContract, web3Provider]);

  useEffect(() => {
    const gimmeOptions = async () => {
      const options = await getEthCallOptions(
        web3Provider,
        opynUniswapContract
      );
      setCallOptions(options);
    };
    gimmeOptions();
  }, [opynUniswapContract, web3Provider]);

  const impermanentLossPoints = getImpermanentLossPoints();
  const impermanentLossPlotData = {
    x: impermanentLossPoints[0],
    y: impermanentLossPoints[1],
    type: 'scatter',
    mode: 'lines',
    name: 'IP Loss',
    line: { shape: 'spline', smoothing: 0.5 },
    marker: { color: 'blue' },
  };

  const putOptionPlotData = {
    x: putOptions[0],
    y: putOptions[1],
    name: 'Put Price',
    yaxis: 'y2',
    type: ' scatter',
    marker: { color: 'green' },
  };

  const callOptionPlotData = {
    x: callOptions[0],
    y: callOptions[1],
    name: 'Call Price',
    yaxis: 'y3',
    type: ' scatter',
    marker: { color: 'orange' },
  };

  const layout = {
    responsive: true,
    title: 'Impermanent Loss',
    xaxis: {
      title: 'ETH Value',
      tickformat: ',.0%',
    },
    yaxis: {
      title: 'Δ Value',
      tickformat: ',.0%',
    },
    yaxis2: {
      title: 'oToken Price',
      overlaying: 'y',
      side: 'right',
    },
    yaxis3: {
      title: 'oToken Price',
      overlaying: 'y',
      side: 'right',
    },
  };

  function handlePlotClick(target) {
    console.log(target);
  }

  return (
    <Plot
      data={[impermanentLossPlotData, putOptionPlotData, callOptionPlotData]}
      layout={layout}
      onClick={handlePlotClick}
    />
  );
}

OptionsILGraph.propTypes = {
  web3Provider: PropTypes.instanceOf(Web3Provider).isRequired,
};

export default OptionsILGraph;
