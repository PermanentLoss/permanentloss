import React from 'react';
import styled from 'styled-components';

const FaqSection = styled.ul`
  margin-left: 2em;
`;

const Question = styled.li`
  padding: 1em;
`;

function Faq() {
  return (
    <div>
      <FaqSection>
        <Question>
          <div>
            <h1>What is this?</h1>
          </div>
          A tool to protect yourself from impermanent loss in Uniswap
          Eth/Stablecoin pools. The graph shows the amount of loss for a change
          in % of eth price (blue line), put option price (green line), and call
          option price (orange line).
        </Question>
        <Question>
          <div>
            <h1>What's impermanent loss?</h1>
          </div>
          Uniswap blog post{' '}
          <a href="https://uniswap.org/docs/v2/advanced-topics/understanding-returns/">
            on the subject
          </a>
        </Question>
        <Question>
          <div>
            <h1>How do the options work?</h1>
          </div>
          Read more{' '}
          <a href="https://bankless.substack.com/p/how-to-protect-your-eth-with-opyn">
            here
          </a>
        </Question>
        <Question>
          <div>
            <h1>How can I protect myself?</h1>
          </div>
          Purchase options to construct a{' '}
          <a href="https://www.investopedia.com/ask/answers/05/052805.asp">
            straddle/strangle
          </a>{' '}
          on the price of eth. This{' '}
          <a href="https://www.youtube.com/watch?v=GSIlF5q4eUk">video</a> covers
          the concept
        </Question>
        <Question>
          <div>
            <h1>Can I see the source code?</h1>
          </div>
          Yup!{' '}
          <a href="https://github.com/PermanentLoss/permanentloss">github</a>
        </Question>
      </FaqSection>
    </div>
  );
}

export default Faq;
