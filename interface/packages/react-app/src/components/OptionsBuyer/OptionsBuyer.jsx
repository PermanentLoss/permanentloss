import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

function OptionsBuyer({ putOption, callOption, ethPortfolioSize }) {
  const [putOptionURL, setPutOptionURL] = useState('');
  const [callOptionURL, setCallOptionURL] = useState('');

  // Defaults to Uniswap V1 since the Opyn V1 options
  // currently only have liquidity there
  const uniswapURL = 'https://app.uniswap.org/#/swap?use=v1&exactField=input';

  useEffect(() => {
    if (putOption !== null) {
      const swapPrice = Math.round(putOption.price * 100) / 100;
      const inputAmount = swapPrice * ethPortfolioSize;
      setPutOptionURL(
        `${uniswapURL}&outputCurrency=${putOption.address}` +
          `&exactAmount=${inputAmount}&inputCurrency=${putOption.strike}`
      );
    }
    if (callOption !== null) {
      const swapPrice = Math.round(callOption.price * 100) / 100;
      const inputAmount = swapPrice * ethPortfolioSize;
      setCallOptionURL(
        `${uniswapURL}&outputCurrency=${callOption.address}` +
          `&exactAmount=${inputAmount}&inputCurrency=${callOption.underlying}`
      );
    }
  }, [putOption, callOption, ethPortfolioSize]);

  return (
    <div className="mb-2">
      {putOptionURL && (
        <Button variant="success" size="lg" href={putOptionURL} target="_blank">
          Buy selected PUT on Uniswap
        </Button>
      )}
      {callOptionURL && (
        <Button
          variant="warning"
          size="lg"
          href={callOptionURL}
          target="_blank"
        >
          Buy selected CALL on Uniswap
        </Button>
      )}
    </div>
  );
}

export default OptionsBuyer;

OptionsBuyer.propTypes = {
  putOption: PropTypes.object,
  callOption: PropTypes.object,
  ethPortfolioSize: PropTypes.number,
};
