import "isomorphic-fetch";
import { gql } from "apollo-boost";

export function GET_ORDERS(url) {
  return gql`
    query {
      orders(first:10) {
        edges {
          node {
            id
            name
            displayFulfillmentStatus
            channel{
                id
                name
            }
            lineItems(first:50){
                edges {
                    node {
                    id
                    title
                    }
                }
            }
          }
        }
      }
    }
  `;
}

export const getOrdersUrl = async (ctx) => {

  console.log("GetOrders::CTX", ctx);

  const { client } = ctx;
  const confirmationUrl = await client
    .mutate({
      mutation: GET_ORDERS(process.env.HOST),
    })
    .then((response) => response.data.appPurchaseOneTimeCreate.confirmationUrl);
  return ctx.redirect(confirmationUrl);
};
