import React from 'react';
import PropTypes from 'prop-types';
import { Web3Provider, EtherscanProvider } from '@ethersproject/providers';

function PortfolioDetector({web3Provider, setEthPortfolioSize }) {
    // TODO this should detect UNI pools for web3Provider wallet and auto-populate ETH size
    function changeEthPortfolioSize(newVal) {
        const newValAsFloat = parseFloat(newVal);
        if (!isNaN(newValAsFloat)) {
            setEthPortfolioSize(newValAsFloat);
        }
    }

    return (
        <div className="portfolio-section">
            Amount of ETH to protect:<input type="number" defaultValue="1" onChange={e => changeEthPortfolioSize(e.target.value)} />
        </div>
    )
}

PortfolioDetector.propTypes = {
    web3Provider: PropTypes.oneOfType([
        PropTypes.instanceOf(Web3Provider),
        PropTypes.instanceOf(EtherscanProvider),
      ]).isRequired,
    setEthPortfolioSize: PropTypes.func
  };

export default PortfolioDetector