import React, { useState, useCallback } from "react";
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Filters, Card, DataTable, Spinner, Stack, Pagination, Button } from "@shopify/polaris";

const GET_ORDERS = gql`
  query getOrders($first: Int!, $cursor: String) {
    orders(first: $first, after: $cursor) {
      pageInfo { hasNextPage, hasPreviousPage }
      edges {
        cursor
        node {
          id,
          createdAt,
          name,
          displayFulfillmentStatus,
          email,
          note,
          displayAddress { address1, address2, city, country, zip }
          shippingAddress { address1, address2 },
          customer { displayName, email }
        }
      }
    }
  }
`;

function DataTableFilter() {
  const filters = [];
  const [queryValue, setQueryValue] = useState(null);
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    [],
  );
  const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
  const handleFiltersClearAll = useCallback(() => {
    handleQueryValueRemove();
  }, [
    handleQueryValueRemove,
  ]);

  return (
    <Card.Section>
      <Filters
        queryValue={queryValue}
        filters={filters}
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={handleQueryValueRemove}
        onClearAll={handleFiltersClearAll}
      />
    </Card.Section>
  );
}

class OrdersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsPerPage: 10,
      orders: [],
      lastOrderCursor: {},
      hasNext: false,
    }
  }

  setPagination = (data) => {
    this.state.hasNext = data.orders?.pageInfo?.hasNextPage ?? false;
  }

  setOrders = (data) => {
    if (Array.isArray(data.orders?.edges) && data.orders?.edges.length) {
      this.state.orders.length = 0;
      data.orders.edges.map(item => {
        const { createdAt, name, shippingAddress, customer, note } = item.node;
        const column = [name, createdAt, shippingAddress?.address1 ?? "-", customer?.email ?? "-", customer?.displayName ?? "-", note ?? "-"];
        this.state.orders.push(column);
      });
    }
  }

  setOrdersCursor = (data) => {
    if (Array.isArray(data.orders?.edges) && data.orders?.edges.length) {
      this.state.lastOrderCursor = data.orders.edges[data.orders.edges.length - 1].cursor;
    }
  }

  render() {
    return (
      <Query query={GET_ORDERS} variables={{ first: this.state.itemsPerPage }}>
        {({ data, loading, error, fetchMore }) => {
          if (loading) {
            return <Stack
              distribution="center"
              alignment="center"
            >
              <div className="spinner-preview-container">
                <Spinner
                  accessibilityLabel="Loading orders..."
                  size="large"
                  color="teal"
                />
              </div>
            </Stack>
          }
          if (error) return <div>{error.message}</div>;

          this.setPagination(data);
          this.setOrders(data);
          this.setOrdersCursor(data);

          return (
            <Card>
              <Card.Section>
                <Button primary disabled={!this.state.hasNext} onClick={() => {
                  if (this.state.hasNext) {
                    fetchMore({
                      variables: { first: this.state.itemsPerPage, cursor: this.state.lastOrderCursor }
                    });
                  }
                }}>Load more orders</Button>
              </Card.Section>
              <DataTableFilter />
              <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ]}
                headings={[
                  'Name',
                  'Created At',
                  'Shipping Address',
                  'Email',
                  'Display Name',
                  'Tracking Number',
                ]}
                rows={this.state.orders}
                footerContent={`Showing ${this.state.orders.length} of ${this.state.orders.length} results`}
              />
            </Card>
          );
        }}
      </Query>
    );
  }
}

export default OrdersList;
