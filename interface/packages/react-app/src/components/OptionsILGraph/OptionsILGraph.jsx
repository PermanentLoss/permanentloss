import { useQuery } from '@apollo/react-hooks';
import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import { abis } from '@permanentloss-interface/contracts';
import { Contract } from 'ethers';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { BreedingRhombusSpinner } from 'react-epic-spinners';
import Plot from 'react-plotly.js';
import styled from 'styled-components';
import GET_OPYN_V1_OPTIONS_CONTRACTS from '../../graphql/opynv1subgraph';
import { getEthOptions, getImpermanentLossPoints } from './utils';

const EMPTY_PLOT = { x: [], y: [] };
const PUT_COLOR = 'green';
const CALL_COLOR = 'orange';

const BreedingRhombusSpinnerStyled = styled(BreedingRhombusSpinner)`
  padding-top: 2em;
  min-height: 450px;
`;

function OptionsILGraph({
  web3Provider,
  ethPrice,
  ethPortfolioSize,
  setSelectedPut,
  setSelectedCall,
  removeSelectionOf,
}) {
  const [putOptions, setPutOptions] = useState(EMPTY_PLOT);
  const [callOptions, setCallOptions] = useState(EMPTY_PLOT);
  const [putLineData, setPutLineData] = useState(null);
  const [callLineData, setCallLineData] = useState(null);
  const [optionsContracts, setOptionsContracts] = useState(EMPTY_PLOT);

  const { loading, error, data } = useQuery(GET_OPYN_V1_OPTIONS_CONTRACTS);

  useEffect(() => {
    if (!loading && !error && data && data.optionsContracts) {
      setOptionsContracts(data.optionsContracts);
    }
  }, [loading, error, data, optionsContracts]);

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
        true,
        optionsContracts
      );
      if (options !== null) {
        setPutOptions(options);
      }
    };
    clearStalePoints(true);
    gimmeOptions();
  }, [
    opynUniswapContract,
    web3Provider,
    ethPrice,
    ethPortfolioSize,
    optionsContracts,
  ]);

  useEffect(() => {
    const gimmeOptions = async () => {
      const options = await getEthOptions(
        web3Provider,
        ethPrice,
        ethPortfolioSize,
        opynUniswapContract,
        false,
        optionsContracts
      );
      if (options !== null) {
        setCallOptions(options);
      }
    };
    clearStalePoints(false);
    gimmeOptions();
  }, [
    opynUniswapContract,
    web3Provider,
    ethPrice,
    ethPortfolioSize,
    optionsContracts,
  ]);

  useEffect(() => {
    if (removeSelectionOf?.isPut) {
      setPutLineData(null);
    } else if (!removeSelectionOf?.isPut) {
      setCallLineData(null);
    }
  }, [removeSelectionOf]);

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
    marker: { color: PUT_COLOR },
  };

  const callOptionPlotData = {
    x: callOptions.x,
    y: callOptions.y,
    customdata: callOptions.meta,
    name: `Call Price for ${ethPortfolioSize} ETH`,
    yaxis: 'y3',
    type: ' scatter',
    marker: { color: CALL_COLOR },
  };

  const layout = {
    responsive: true,
    title: 'Available Eth Protection',
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
    shapes: [putLineData, callLineData],
    autosize: false,
    width: 900,
    height: 600,
  };

  const config = {
    displayModeBar: false,
  };

  function handlePlotClick(pointsAndEvent) {
    const closestCurve = pointsAndEvent.points[0];
    if (closestCurve.customdata) {
      const _data = closestCurve.customdata;
      // console.log(`user clicked: ${JSON.stringify(_data)}`);
      drawLineForSelectedPoint(closestCurve.x, _data.isPut);
      if (!_data.isPut) {
        setSelectedCall(_data);
      } else {
        setSelectedPut(_data);
      }
    }
  }

  function drawLineForSelectedPoint(x, isPut) {
    const data = {
      type: 'line',
      x0: x,
      y0: -1,
      x1: x,
      y1: 0,
      line: {
        color: isPut ? PUT_COLOR : CALL_COLOR,
        width: 3,
        dash: 'dash',
      },
    };
    if (isPut) {
      setPutLineData(data);
    } else {
      setCallLineData(data);
    }
  }

  function clearStalePoints(isPut) {
    if (isPut) {
      setPutOptions(EMPTY_PLOT);
      setPutLineData(null);
    } else {
      setCallOptions(EMPTY_PLOT);
      setCallLineData(null);
    }
  }

  return putOptions === EMPTY_PLOT || callOptions === EMPTY_PLOT ? (
    <BreedingRhombusSpinnerStyled color="orange" />
  ) : (
    <Plot
      data={[impermanentLossPlotData, putOptionPlotData, callOptionPlotData]}
      layout={layout}
      onClick={handlePlotClick}
      config={config}
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
  setSelectedCall: PropTypes.func.isRequired,
  removeSelectionOf: PropTypes.object,
};

export default OptionsILGraph;
