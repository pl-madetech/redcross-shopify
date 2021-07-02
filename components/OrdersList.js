import React, { useState, useCallback } from "react";
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Filters, Card, DataTable, Spinner, Stack, Button } from "@shopify/polaris";

const SEARCH_ORDERS = gql`
  query filterOrders($first: Int!, $search: String) {
    orders(first: $first , query: $search) {
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

const DataTableFilter = (props) => {
  const [queryValue, setQueryValue] = useState(null);
  const handleFiltersQueryChange = useCallback(
    (value) => {
      setQueryValue(value);

      if (value === "" || value === undefined) {
        props.ordersList.setState({ ordersQuery: GET_ORDERS });
        props.ordersList.setState({ ordersVariables: { first: props.ordersList.state.itemsPerPage } });
      } else {
        props.ordersList.setState({ ordersQuery: SEARCH_ORDERS });
        props.ordersList.setState({
          ordersVariables: {
            first: props.ordersList.state.itemsPerPage,
            search: `name:${value}* OR note:${value}* OR email:${value}*`
          }
        });
      }
      props.ordersList.render();
    },
    [],
  );
  const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
  const handleFiltersClearAll = useCallback(() => { handleQueryValueRemove(); }, [handleQueryValueRemove,]);

  return (
    <Filters
      queryValue={queryValue}
      filters={[]}
      onQueryChange={handleFiltersQueryChange}
      onQueryClear={handleQueryValueRemove}
      onClearAll={handleFiltersClearAll}
    />
  );
}

class OrdersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsPerPage: 2,
      ordersQuery: GET_ORDERS,
      ordersVariables: { first: 2 },
      orders: [],
      clonedOrders: [],
      lastOrderCursor: {},
      hasNext: false,
      loading: false,
    }
  }

  setPagination = (data) => {
    this.state.hasNext = data.orders?.pageInfo?.hasNextPage ?? false;
  }

  setOrders = (data) => {
    if (Array.isArray(data.orders?.edges) && data.orders?.edges.length) {
      this.state.orders.length = 0;
      this.state.clonedOrders.length = 0;
      data.orders.edges.map(item => {
        const { createdAt, name, shippingAddress, customer, note } = item.node;
        const column = [name, createdAt, shippingAddress?.address1 ?? "-", customer?.email ?? "-", customer?.displayName ?? "-", note ?? "-"];
        this.state.orders.push(column);
        this.state.clonedOrders.push(column);
      });
    }
  }

  setOrdersCursor = (data) => {
    if (Array.isArray(data.orders?.edges) && data.orders?.edges.length) {
      this.state.lastOrderCursor = data.orders.edges[data.orders.edges.length - 1].cursor;
    }
  }

  render() {
    console.log("RENDER::OrdersQuery::OrdersVariables", this.state.ordersQuery, this.state.ordersVariables);
    return (
      <Card>
        <Card.Section>
          <DataTableFilter ordersList={this} />
        </Card.Section>
        <Query fetchPolicy='no-cache' query={this.state.ordersQuery} variables={this.state.ordersVariables}>
          {({ data, loading, error }) => {
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

            console.log("HERE!!!", data);

            this.setPagination(data);
            this.setOrders(data);
            this.setOrdersCursor(data);

            return (
              <Card>
                <Card.Section>
                  <Button primary loading={this.state.loading} disabled={!this.state.hasNext} onClick={() => {
                    if (this.state.hasNext) {
                      this.setState({ loading: true });
                      fetchMore({
                        variables: { first: this.state.itemsPerPage, cursor: this.state.lastOrderCursor }
                      }).then(() => this.setState({ loading: false }));
                    }
                  }}>{this.state.hasNext ? "Load more orders" : "No more orders"}</Button>
                </Card.Section>
                <Card.Section>
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
                </Card.Section>
              </Card>
            );
          }}
        </Query>
      </Card>
    );
  }
}

export default OrdersList;
