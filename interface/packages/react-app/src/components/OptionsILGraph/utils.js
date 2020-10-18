import { parseEther } from '@ethersproject/units';
import { abis } from '@permanentloss-interface/contracts';
import { Contract } from 'ethers';

const WETH_CONTRACT = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const USDC_CONTRACT = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

function isEpochInFuture(epoch) {
  return epoch > new Date().getTime() / 1000;
}

export function getImpermanentLossPoints() {
  const x = [
    0,
    0.1,
    0.2,
    0.3,
    0.4,
    0.5,
    0.6,
    0.7,
    0.8,
    0.9,
    1,
    1.1,
    1.2,
    1.3,
    1.4,
    1.5,
    1.6,
    1.7,
    1.8,
    1.9,
    2,
    3,
    4,
    5,
  ];

  // Equation from https://uniswap.org/docs/v2/advanced-topics/understanding-returns/
  const y = x.map((pointX) => (2 * Math.sqrt(pointX)) / (1 + pointX) - 1);

  return [x, y];
}

function filterForPuts(x) {
  return (
    x.underlying === WETH_CONTRACT &&
    x.underlying !== '0x0000000000000000000000000000000000000000' &&
    isEpochInFuture(x.expiry)
  );
}

function filterForCalls(x) {
  return (
    x.strike === '0x0000000000000000000000000000000000000000' &&
    x.underlying === USDC_CONTRACT &&
    isEpochInFuture(x.expiry)
  );
}

function convertPutStrikePrice(strikePrice) {
  return strikePrice * 10;
}

function convertCallStrikePrice(strikePrice) {
  return (1 / strikePrice) * 10 ** 5;
}

function convertCallPrice(price) {
  return price / 10 ** 6;
}

function convertPutPrice(price) {
  return price / 10 ** 7;
}

export async function getEthOptions(
  web3Provider,
  currentEthPrice,
  ethPortfolioSize,
  opynUniswapContract,
  isPut,
  optionsContracts
) {
  if (!optionsContracts.length) return null;
  const options = optionsContracts.filter(
    isPut ? filterForPuts : filterForCalls
  );
  const populatedWethOptions = [];
  // console.log(`ethPortfolioSize:${ethPortfolioSize}`);
  await Promise.allSettled(
    options.map(async (option) => {
      // console.log(`${isPut ? 'put' : 'call'} option:${JSON.stringify(option)}`);
      const exchangeAddress = await opynUniswapContract.getExchange(
        option.address
      );
      const optionMarket = new Contract(
        exchangeAddress,
        abis.uniswapv1_market,
        web3Provider
      );
      const inputPrice = isPut
        ? `${ethPortfolioSize}`
        : `${0.02 * ethPortfolioSize}`; // Call options measured in usdc so 1.0 eth will report massive slippage
      const rawPrice = await optionMarket.getEthToTokenInputPrice(
        parseEther(inputPrice)
      );
      const price = isPut
        ? (1 / convertPutPrice(rawPrice)) * currentEthPrice
        : (parseFloat(inputPrice, 10) / convertCallPrice(rawPrice)) *
          currentEthPrice *
          currentEthPrice;
      const strikePrice = isPut
        ? convertPutStrikePrice(option.strikePriceValue)
        : convertCallStrikePrice(option.strikePriceValue);
      // console.log(`${isPut ? 'put' : 'call'} strikePrice:${strikePrice}   price:${price}`);
      const strikePriceAsPercentDrop = strikePrice / currentEthPrice;
      // console.log(`${isPut ? 'put' : 'call'} x:${strikePriceAsPercentDrop}   y:${price}`);
      populatedWethOptions.push({
        ...option,
        ...{
          strikePriceAsPercentDrop,
          price,
          strikePriceInDollars: strikePrice,
          isPut,
        },
      });
    })
  );
  populatedWethOptions.sort(
    (a, b) => a.strikePriceAsPercentDrop - b.strikePriceAsPercentDrop
  );
  const data = {
    x: populatedWethOptions.map((x) => x.strikePriceAsPercentDrop),
    y: populatedWethOptions.map((y) => y.price),
    meta: populatedWethOptions,
  };
  return data;
}
