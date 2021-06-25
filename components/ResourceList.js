import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { ResourceList, ResourceItem, TextStyle, Card } from "@shopify/polaris";

const GET_ORDERS = gql`
  query First50Orders {
    orders(first: 50) {
    edges {
      cursor
      node {
        id,
        createdAt,
        name,
        shippingAddress {address1, address1},
        customer{displayName, email}
      }
    }
  }
}
`;

class ResourceListWithOrders extends React.Component {
  render() {
    return (
      <Query query={GET_ORDERS}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;
          return (
            <Card>
              <ResourceList
                resourceName={{ singular: 'order', plural: 'orders', }}
                items={data.orders.edges}
                renderItem={(item) => {

                  const { id, createdAt, name, shippingAddress, customer } = item.node;

                  return (
                    <ResourceItem
                      id={id}
                    >
                      <h3>
                        <TextStyle variation="strong">{name}</TextStyle>
                        <TextStyle variation="strong">{createdAt}</TextStyle>
                        <TextStyle variation="strong">{shippingAddress?.address1}</TextStyle>
                        <TextStyle variation="strong">{customer?.email}</TextStyle>
                        <TextStyle variation="strong">{customer?.displayName}</TextStyle>
                      </h3>
                    </ResourceItem>
                  );
                }}
              />

            </Card>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithOrders;
