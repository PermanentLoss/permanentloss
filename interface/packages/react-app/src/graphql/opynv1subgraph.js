import { gql } from 'apollo-boost';

const GET_OPYN_V1_OPTIONS_CONTRACTS = gql`
  {
    optionsContracts {
      address
      expiry
      owner
      strike
      strikePriceValue
      underlying
    }
  }
`;

export default GET_OPYN_V1_OPTIONS_CONTRACTS;
