import React, { useState }  from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import OptionsBuyer from '../OptionsBuyer/OptionsBuyer';
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';

const FormGroupTight = styled(Form.Group)`
  margin-bottom: 0;
  width: inherit;
  height: inherit;
`;

const Cards = styled.div`
    display:flex;
`;

const OptionExpirationInput = styled.input`
    width: 6em;
    margin-left: 5px;
`

function ApyCalculator({put, call, ethPrice, ethPortfolioSize, onRemoveOption}) {
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
            return getRoiPerDay() 
                * numberOfDaysTillExpiration(minEpoch) 
                * ethPrice 
                * 2 // APY is calculated against whole position not just ETH part
                * ethPortfolioSize
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
            return <Card style={{ width: '18rem', marginLeft: !isPut && put && call ? '2em' : '0' }}>
                <Card.Header>
                    {isPut ? 'Put' : 'Call'} Option
                    <button type="button" className="close" onClick={onRemoveOption.bind(null, option)}><span aria-hidden="true">×</span><span className="sr-only">Close</span></button>
                </Card.Header>
                <Card.Body>
                    {optionSection(option.strikePriceInDollars, option.price, option.expiry)}   
                    <OptionsBuyer
                        putOption={isPut ? put : null}
                        callOption={isPut ? null : call}
                        ethPortfolioSize={ethPortfolioSize}
                    />
                </Card.Body>
            </Card>
        }
    }

    function renderTooltip(text, props) {
        return <Tooltip {...props}>
            {text}
        </Tooltip>
    };

    function optionSection(strikePriceInDollars, price, expiry) {
        return <Form>
                <FormGroupTight as={Row}>
                    <Form.Label column sm={6}>
                        Strike:
                    </Form.Label>
                    <Col sm={6}>
                        ${strikePriceInDollars}
                    </Col>
                </FormGroupTight>
                <FormGroupTight as={Row}>
                    <Form.Label column sm={6}>
                        Price per Eth:
                    </Form.Label>
                    <Col sm={6}>
                        ${price?.toFixed(2)}
                    </Col>
                </FormGroupTight>
                <FormGroupTight as={Row}>
                    <Form.Label column sm={6}>
                        Expiration:
                    </Form.Label>
                    <Col sm={6}>
                        {getExpirationDate(expiry).toLocaleString()}
                    </Col>
                </FormGroupTight>
            </Form>
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
            cost += (put.price * ethPortfolioSize);
        }
        if (call && call.price != null) {
            cost += (call.price * ethPortfolioSize);
        }
        return cost;
    }
    
    return (
        <>
            <Form>
                <Form.Group as={Row}>
                    <Form.Label column sm={6}>
                        <span>Uniswap APY over the next</span>
                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltip.bind(null, "Calculated by earliest expiration of selected options")}
                        >
                            <span>
                                <OptionExpirationInput type="number" value={numberOfDaysTillExpiration(getMinEpoch()).toFixed(2)} readOnly disabled />
                                days
                            </span>
                        </OverlayTrigger>    
                    </Form.Label>
                    <Col sm={2}>
                        <Form.Control type="number" value={uniswapRoi} onChange={e => updateUniswapRoi(e.target.value)} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={6}>
                        <span>Projected Naked Gain:</span>
                    </Form.Label>
                    <Col sm={6}>
                        <OverlayTrigger
                            placement="left"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltip.bind(null, "Gain over option expiry period without protection based on APY")}
                        >
                            <span>${projectedGain.toFixed(2)}</span>
                        </OverlayTrigger>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={6}>
                        <span>Projected Protected Gain:</span>
                    </Form.Label>
                    <Col sm={6}>
                        <OverlayTrigger
                            placement="left"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltip.bind(null, "Gain over option expiry period with protection based on APY")}
                        >
                            <span>${(projectedGain - getCostOfOptions()).toFixed(2)}</span>
                        </OverlayTrigger>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={6}>
                        <span>Cost to APY:</span>
                    </Form.Label>
                    <Col sm={6}>
                    <OverlayTrigger
                        placement="left"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip.bind(null, "% of the APY it will cost to have protection")}
                    >
                            <span>-{getPercentCostOfOptions().toFixed(2)}%</span>
                        </OverlayTrigger>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={6}>
                        <span>Net APY:</span>
                    </Form.Label>
                    <Col sm={6}>
                    <OverlayTrigger
                        placement="left"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip.bind(null, "Protected APY (compare to Uniswap APY)")}
                    >
                        <span>{((1 - (getPercentCostOfOptions() / 100)) * uniswapRoi).toFixed(2)}%</span>
                    </OverlayTrigger>
                    </Col>
                </Form.Group>
            </Form>
            <Cards>
                {putSection()}
                {callSection()}
            </Cards>
        </>
      );
}

ApyCalculator.propTypes = {
    put: PropTypes.object,
    call: PropTypes.object,
    ethPrice: PropTypes.number.isRequired,
    ethPortfolioSize: PropTypes.number.isRequired,
    onRemoveOption: PropTypes.func
  };

export default ApyCalculator