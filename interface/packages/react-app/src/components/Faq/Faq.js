import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import wutang from './wutang.jpg';
import { useParams } from 'react-router-dom';

const AccordionWide = styled(Accordion)`
  width: 100%;
  display: block; // This shouldn't be needed but styled-components is applying flex here for some reason
`;

function Faq() {
  let params = useParams();
  let activeKey = null;
  if (params && params.id) {
    activeKey=params.id;
  }
  return (
    <AccordionWide activeKey={activeKey}>
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Card.Header} eventKey="0">
            What is this?
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
          A tool to protect yourself from impermanent loss in Uniswap
          Eth/Stablecoin pools. The graph shows the amount of loss for a change
          in % of eth price (blue Questionne), put option price (green Questionne), and call
          option price (orange Questionne).
          <Row className="justify-content-center row">
            <img alt="C.R.E.A.M. get the money" src={wutang} width="300" onClick={() => window.open('https://www.youtube.com/watch?v=zhUnEg0he4A')}/>
          </Row>  
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Card.Header} eventKey="impermanent-loss">
            What's impermanent loss?
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="impermanent-loss">
          <Card.Body>
          Uniswap blog post{' '}
          <a href="https://uniswap.org/docs/v2/advanced-topics/understanding-returns/">
            on the subject
          </a>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Card.Header} eventKey="options">
            How do the options work?
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="options">
          <Card.Body>
            Read more{' '}
            <a href="https://bankless.substack.com/p/how-to-protect-your-eth-with-opyn">
              here
            </a>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Card.Header} eventKey="protect">
            How can I protect myself?
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="protect">
          <Card.Body>
            Purchase options to construct a{' '}
            <a href="https://www.investopedia.com/ask/answers/05/052805.asp">
              straddle/strangle
            </a>{' '}
            on the price of eth. This{' '}
            <a href="https://www.youtube.com/watch?v=GSIlF5q4eUk">video</a> covers
            the concept
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Card.Header} eventKey="exercise">
            I have options - how do I use them?
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="exercise">
          <Card.Body>
            If your options are "in the green" (profitable) then you'll want to {' '}<a id="exercise-options" href="https://opyn.gitbook.io/opyn/faq#how-do-claims-exercise-work">"exercise"</a> them before they expire.
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Card.Header} eventKey="source">
            Can I see the source code?
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="source">
          <Card.Body>
            Yup!{' '}
            <a href="https://github.com/PermanentLoss/permanentloss">github</a>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </AccordionWide>
  );
}

export default Faq;
