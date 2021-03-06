import { ApolloClient } from '@apollo/client';

// Generate from skeleton, can't figure out how to work with this function.
// Leave until proptotype is completed, then if not used remove.
export const createClient = (shop, accessToken) => {
  return new ApolloClient({
    uri: `https://${shop}/admin/api/2021-04/graphql.json`,
    request: operation => {
      operation.setContext({
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "User-Agent": `shopify-app-node ${
            process.env.npm_package_version
          } | Shopify App CLI`
        }
      });
    }
  });
};
