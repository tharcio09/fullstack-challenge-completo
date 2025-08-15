import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { DefaultApolloClient } from '@vue/apollo-composable';

// Link de erro para tratamento global de erros
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Link HTTP
const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production' 
    ? 'https://fullstack-challenge-completo.onrender.com'
    : 'http://localhost:4000/graphql',
  credentials: 'include',
});

// Configuração do cache
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        participants: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Essa função está pronta para ligar o Apollo no Vue
export function provideApollo(app) {
  app.provide(DefaultApolloClient, apolloClient);
}
