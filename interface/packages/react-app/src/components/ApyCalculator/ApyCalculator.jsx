import React, { useState }  from 'react';
import PropTypes from 'prop-types';

function ApyCalculator({put, call, onRemoveOption})
{   
    const ethPrice = 380;
    const [uniswapRoi, setUniswapRoi] = useState(20);
    const [projectedGain, setProjectedGain] = 
        useState(getProjectedGainzPerOptionPeriod(put?.expiry) + getProjectedGainzPerOptionPeriod(call?.expiry));

    function getExpirationDate(epoch) {
        return new Date(parseInt(epoch, 10) * 1000);
    }

    function getRoiPerDay() {
        return (1+ uniswapRoi/100) ** (1/365) - 1
    }

    function numberOfDaysTillExpiration(epoch) {
        return (getExpirationDate(epoch)-new Date()) / (1000 * 60 * 60 * 24);
    }

    function getProjectedGainzPerOptionPeriod() {
        const minEpoch = getMinEpoch();
        if (minEpoch > 0) {
            return getRoiPerDay() * numberOfDaysTillExpiration(minEpoch) * ethPrice * 2
        } else {
            return 0;
        }
        
    }

    function getMinEpoch() {
        return Math.min(
            isNaN(put?.expiry) ? Number.MAX_VALUE : put.expiry,
            isNaN(call?.expiry) ? Number.MAX_VALUE : call.expiry);
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
                <h4>{isPut ? 'Put' : 'Call'} Option <span onClick={onRemoveOption.bind(null, option)}>X</span></h4>
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

    function updateUniswapRoi(newValue) {
        setUniswapRoi(newValue);
        setProjectedGain(getProjectedGainzPerOptionPeriod(put?.expiry) + getProjectedGainzPerOptionPeriod(call?.expiry));
    }

    function getPercentCostOfOptions() {
        return getCostOfOptions() / projectedGain * 100;;
    }

    function getCostOfOptions() {
        let cost = 0;
        if (put && put.price !== null) {
            cost += put.price;
        }
        if (call && call.price != null) {
            cost += call.price 
        }
        return cost;
    }
    
    return (
        <div className="apy-section">
            <div>
                Uniswap APY: <input type="number" value={uniswapRoi} onChange={e => updateUniswapRoi(e.target.value)} /> over the next {numberOfDaysTillExpiration(getMinEpoch()).toFixed(2)} days 
            </div>
            <div>
                Projected Naked Gain:${projectedGain.toFixed(2)}
            </div>
            <div>
                Projected Protected Gain:${(projectedGain - getCostOfOptions()).toFixed(2)}
            </div>    
            <div>
                Cost to APY:-{getPercentCostOfOptions().toFixed(2)}%
            </div>                
            <div>
                Net APY:{((1 - (getPercentCostOfOptions() / 100)) * uniswapRoi).toFixed(2)}%
            </div>
            {putSection()}
            {callSection()}
        </div>
      );
}

ApyCalculator.propTypes = {
    put: PropTypes.object,
    call: PropTypes.object,
    onRemoveOption: PropTypes.func
  };

export default ApyCalculator