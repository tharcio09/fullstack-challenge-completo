import { gql } from '@apollo/client/core';

export const ADD_PARTICIPANT = gql`
  mutation ($firstName: String!, $lastName: String!, $participation: Float!) {
    addParticipant(
      firstName: $firstName
      lastName: $lastName
      participation: $participation
    ) {
      id
      firstName
      lastName
      participation
    }
  }
`;

export const DELETE_PARTICIPANT = gql`
  mutation ($id: ID!) {
    deleteParticipant(id: $id)
  }
`;
