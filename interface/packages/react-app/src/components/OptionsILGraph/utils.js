import { parseEther } from '@ethersproject/units';
import { abis } from '@permanentloss-interface/contracts';
import { Contract } from 'ethers';
import { optionsContracts } from '../../stubs/optionsContractsGraphQl';
import ethPriceFeed from '../../utils/ethPriceFeed';

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

export async function getEthCallOptions(web3Provider, opynUniswapContract) {
  const currentEthPrice = await ethPriceFeed(web3Provider);

  const data = [
    [], // X values
    [], // Y values
  ];
  const wethCallOptions = optionsContracts.data.optionsContracts.filter(
    (x) =>
      x.strike === '0x0000000000000000000000000000000000000000' &&
      x.underlying === USDC_CONTRACT &&
      isEpochInFuture(x.expiry)
  );
  wethCallOptions.sort((a, b) => a.strikePriceValue - b.strikePriceValue);
  await Promise.all(
    wethCallOptions.map(async (option) => {
      // console.log(`call option:${JSON.stringify(option)}`);
      const exchangeAddress = await opynUniswapContract.getExchange(
        option.address
      );
      const optionMarket = new Contract(
        exchangeAddress,
        abis.uniswapv1_market,
        web3Provider
      );
      const price =
        (await optionMarket.getEthToTokenInputPrice(parseEther('1.0'))) /
        10 ** 6;
      const strikePrice = (1 / option.strikePriceValue) * 10 ** 5;
      // console.log(`strikePrice:${strikePrice}   price:${price}`);
      data[0].push(strikePrice / currentEthPrice);
      data[1].push((1 / price) * currentEthPrice);
    })
  );
  return data;
}

// TODO combine common logic of getEthPutOptions and getEthCallOptions
export async function getEthPutOptions(web3Provider, opynUniswapContract) {
  const currentEthPrice = await ethPriceFeed(web3Provider);

  const data = [
    [], // X values
    [], // Y values
  ];
  const wethPutOptions = optionsContracts.data.optionsContracts.filter(
    (x) =>
      x.underlying === WETH_CONTRACT &&
      x.underlying !== '0x0000000000000000000000000000000000000000' &&
      isEpochInFuture(x.expiry)
  );
  wethPutOptions.sort((a, b) => a.strikePriceValue - b.strikePriceValue);
  await Promise.all(
    wethPutOptions.map(async (option) => {
      // console.log(`put option:${JSON.stringify(option)}`);
      const exchangeAddress = await opynUniswapContract.getExchange(
        option.address
      );
      const optionMarket = new Contract(
        exchangeAddress,
        abis.uniswapv1_market,
        web3Provider
      );
      const price =
        (await optionMarket.getEthToTokenInputPrice(parseEther('1.0'))) /
        10 ** 7;
      const strikePrice = option.strikePriceValue * 10; // needs to be scaled for some reason
      // console.log(`strikePrice:${strikePrice}   price:${price}`);
      data[0].push(strikePrice / currentEthPrice);
      data[1].push((1 / price) * currentEthPrice);
    })
  );
  return data;
}