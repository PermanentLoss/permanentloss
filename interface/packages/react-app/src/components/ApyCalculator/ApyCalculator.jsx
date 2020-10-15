import React from 'react';
import PropTypes from 'prop-types';

function ApyCalculator({put, call})
{
    function getExpirationDate(epoch) {
        return new Date(parseInt(epoch, 10) * 1000);
    }

    function putSection() {
        return renderOption(put, true);
    }

    function callSection() {
        return renderOption(call, false);
    }

    function renderOption(option, isPut)
    {
        if (option) {
            return <div>
                <h4>{isPut ? 'Put' : 'Call'} Option</h4>
                {optionSection(option.strikePriceInDollars, option.price, option.expiry)}
            </div>
        }
    }

    function optionSection(strikePriceInDollars, price, expiry) {
        return <div>
                <div>Strike: ${strikePriceInDollars}</div>
                <div>Price per Eth:${price?.toFixed(2)}</div>
                <div>Expiration: {getExpirationDate(expiry).toLocaleString()}</div>
            </div>
    }
    
    return (
        <div className="apy-section">
            {putSection()}
            {callSection()}
        </div>
      );
}

ApyCalculator.propTypes = {
    put: PropTypes.object,
    call: PropTypes.object
  };

export default ApyCalculator