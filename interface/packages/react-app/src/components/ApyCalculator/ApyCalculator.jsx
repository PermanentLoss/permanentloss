import React, { useState }  from 'react';
import PropTypes from 'prop-types';

function ApyCalculator({put, call})
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
        const minEpoch = Math.min(
            isNaN(put?.expiry) ? Number.MAX_VALUE : put.expiry,
            isNaN(call?.expiry) ? Number.MAX_VALUE : call.expiry);
        if (minEpoch > 0) {
            return getRoiPerDay() * numberOfDaysTillExpiration(minEpoch) * ethPrice * 2
        } else {
            return 0;
        }
        
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

    function updateUniswapRoi(newValue) {
        setUniswapRoi(newValue);
        setProjectedGain(getProjectedGainzPerOptionPeriod(put?.expiry) + getProjectedGainzPerOptionPeriod(call?.expiry));
    }

    function getPercentCostOfOptions() {
        let cost = 0;
        if (put && put.price !== null) {
            cost += put.price / projectedGain * 100;
        }
        if (call && call.price != null) {
            cost += call.price / projectedGain * 100;
        }
        return cost;
    }
    
    return (
        <div className="apy-section">
            <div>
                Uniswap APY: <input type="number" value={uniswapRoi} onChange={e => updateUniswapRoi(e.target.value)} />
            </div>
            <div>
                Projected Gain:${projectedGain}
            </div>    
            <div>
                Cost to APY:-{getPercentCostOfOptions()}%
            </div>                
            <div>
                Net APY:{uniswapRoi - getPercentCostOfOptions()}%
            </div>
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