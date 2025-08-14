import { gql } from '@apollo/client/core';

export const GET_PARTICIPANTS = gql`
  query {
    participants {
      id
      firstName
      lastName
      participation
    }
  }
`;
