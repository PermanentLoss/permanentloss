import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const PortfolioSection = styled.input`
  width: 40px;
`;

function PortfolioDetector({ web3Provider, setEthPortfolioSize }) {
  // TODO this should detect UNI pools for web3Provider wallet and auto-populate ETH size
  function changeEthPortfolioSize(newVal) {
    const newValAsFloat = parseFloat(newVal);
    if (!isNaN(newValAsFloat)) {
      setEthPortfolioSize(newValAsFloat);
    }
  }

  return (
    <div>
      Amount of ETH to protect:
      <PortfolioSection
        type="number"
        defaultValue="1"
        onChange={(e) => changeEthPortfolioSize(e.target.value)}
      />
    </div>
  );
}

PortfolioDetector.propTypes = {
  web3Provider: PropTypes.oneOfType([
    PropTypes.instanceOf(Web3Provider),
    PropTypes.instanceOf(EtherscanProvider),
  ]).isRequired,
  setEthPortfolioSize: PropTypes.func,
};

export default PortfolioDetector;
