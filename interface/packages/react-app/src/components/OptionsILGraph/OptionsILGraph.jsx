import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import { abis } from '@permanentloss-interface/contracts';
import { Contract } from 'ethers';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import {
  getEthOptions,
  getImpermanentLossPoints
} from './utils';

const EMPTY_PLOT = {x:[], y:[]};

function OptionsILGraph({ web3Provider, ethPrice, ethPortfolioSize, setSelectedPut, setSelectedCall }) {
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
      const options = await getEthOptions(
        web3Provider,
        ethPrice,
        ethPortfolioSize,
        opynUniswapContract,
        true
      );
      setPutOptions(options);
    };
    // TODO might be a better way to do this but I'm a hooks newb
    if (ethPrice > 0) {
      setPutOptions(EMPTY_PLOT);
      gimmeOptions();
    }
  }, [opynUniswapContract, web3Provider, ethPrice, ethPortfolioSize]);

  useEffect(() => {
    const gimmeOptions = async () => {
      const options = await getEthOptions(
        web3Provider,
        ethPrice,
        ethPortfolioSize,
        opynUniswapContract,
        false
      );
      setCallOptions(options);
    };
    if (ethPrice > 0) {
      setCallOptions(EMPTY_PLOT);
      gimmeOptions();
    }
  }, [opynUniswapContract, web3Provider, ethPrice, ethPortfolioSize]);

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
    x: putOptions.x,
    y: putOptions.y,
    customdata: putOptions.meta,
    name: `Put Price for ${ethPortfolioSize} ETH`,
    yaxis: 'y2',
    type: ' scatter',
    marker: { color: 'green' },
  };

  const callOptionPlotData = {
    x: callOptions.x,
    y: callOptions.y,
    customdata: callOptions.meta,
    name: `Call Price for ${ethPortfolioSize} ETH`,
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

  function handlePlotClick(pointsAndEvent) {
    const closestCurve = pointsAndEvent.points[0];
    if(closestCurve.customdata)
    {
      const data = closestCurve.customdata;
      console.log(`user clicked: ${JSON.stringify(data)}`);
      if (data.strikePriceAsPercentDrop > 1) {
        setSelectedCall(data);
      } else {
        setSelectedPut(data);
      }
    }
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
  web3Provider: PropTypes.oneOfType([
    PropTypes.instanceOf(Web3Provider),
    PropTypes.instanceOf(EtherscanProvider),
  ]).isRequired,
  ethPrice: PropTypes.number.isRequired,
  ethPortfolioSize: PropTypes.number.isRequired,
  setSelectedPut: PropTypes.func.isRequired,
  setSelectedCall: PropTypes.func.isRequired
};

export default OptionsILGraph;
