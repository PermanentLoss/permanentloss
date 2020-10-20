import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const PortfolioSection = styled.div`
  margin: 0.25em 0 0.25em 0;
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
    <PortfolioSection>
      <Form>
        <Form.Group as={Row} controlId="formHorizontalEmail">
          <Form.Label column sm={6}>
          Amount of ETH to protect:
          </Form.Label>
          <Col sm={3}>
            <Form.Control type="number" defaultValue="1" onChange={(e) => changeEthPortfolioSize(e.target.value)} />
          </Col>
        </Form.Group>
      </Form>
    </PortfolioSection>
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
