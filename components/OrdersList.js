import React, { useState, useCallback } from "react";
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Filters, Card, DataTable, Spinner, Stack, Button, Collapsible, Banner } from "@shopify/polaris";

const SEARCH_ORDERS = gql`
  query filterOrders($first: Int!, $search: String, $cursor: String) {
    orders(first: $first , query: $search, after: $cursor) {
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

const FetchModeGet = "GET";
const FetchModeSearch = "SEARCH";
const FetchPolicyCache = "cache";
const FetchPolicyNoCache = "no-cache";
let dTableSingleton;

class DataTableContent extends React.Component {
  constructor(props) {
    super(props);
    dTableSingleton = this;
  }

  render() {
    return (
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
        rows={this.props.orders}
        footerContent={`Showing ${this.props.orders.length} results`}
      />
    );
  }
}

const DataTableFilter = (props) => {
  const [queryValue, setQueryValue] = useState(null);
  const handleFiltersQueryChange = useCallback(
    (value) => {
      setQueryValue(value);

      // Search empty, re-render with initial query parameters
      if (value === "" || value === undefined) {

        // Clean orders - can't figure out a best way
        props.ordersList.resetOrders();
        props.ordersList.apolloClient.cache.reset();

        props.ordersList.setState({
          fetchMode: FetchModeGet,
          fetchPolicy: FetchPolicyCache,
          ordersQuery: GET_ORDERS,
          ordersVariables: { first: props.ordersList.state.itemsPerPage }
        });
      } else {
        props.ordersList.setState({
          fetchMode: FetchModeSearch,
          fetchPolicy: FetchPolicyNoCache,
          ordersQuery: SEARCH_ORDERS,
          ordersVariables: {
            first: props.ordersList.state.itemsPerPage,
            search: `name:${value}* OR note:${value}* OR email:${value}*`
          }
        });
      }
    },
    [],
  );

  return (
    <Filters
      queryValue={queryValue}
      filters={[]}
      onQueryChange={handleFiltersQueryChange}
    />
  );
}

const CollapsibleLoader = (props) => {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  // Register return toggle reference to parent.
  props.handleToggle(handleToggle);

  return (
    <Collapsible
      open={open}
      id="basic-collapsible"
      transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
      expandOnPrint
    >
      <Banner
        title="Loading orders"
        status="info"
      >
        <Spinner accessibilityLabel="Loading" size="small" />
      </Banner>
    </Collapsible>
  );
}

class OrdersList extends React.Component {
  constructor(props) {
    super(props);

    const itemsPerPage = 5;
    this.state = {
      fetchPolicy: FetchPolicyCache,
      fetchMode: FetchModeGet,
      itemsPerPage: itemsPerPage,
      ordersQuery: GET_ORDERS,
      ordersVariables: { first: itemsPerPage },
      orders: [],
      lastOrderCursor: {},
      ordersTotal: itemsPerPage,
      hasNext: false,
    }
    this.apolloClient = props.apolloClient;
  }

  handleToggle = (handleToggle) => {
    this.toggleLoading = handleToggle;
  }

  setPagination = (data) => {
    this.state.hasNext = data.orders?.pageInfo?.hasNextPage ?? false;
  }

  resetOrders = () => {
    this.state.orders.length = 0;
    this.state.orders = [];
  }

  setOrders = (data) => {
    if (Array.isArray(data.orders?.edges) && data.orders?.edges.length) {
      data.orders.edges.map(item => {
        const { createdAt, name, shippingAddress, customer, note } = item.node;
        const column = [name, createdAt, shippingAddress?.address1 ?? "-", customer?.email ?? "-", customer?.displayName ?? "-", note ?? "-"];

        // Add to array without triggering a re-render
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
      <Card>
        <Card.Section>
          <DataTableFilter ordersList={this} />
        </Card.Section>
        <Query fetchPolicy={this.state.fetchPolicy} query={this.state.ordersQuery} variables={this.state.ordersVariables}>
          {({ data, loading, error, fetchMore, refetch }) => {
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
            if (error) return (
              <Card>
                <Card.Section>
                  <div>
                    <b>Something went wrong.{' '}</b>
                    <span style={{ color: '#bf0711' }}>
                      <Button monochrome outline onClick={() => {
                        refetch({
                          variables: { first: this.state.itemsPerPage, cursor: this.state.lastOrderCursor }
                        });
                      }}>Retry</Button>
                    </span>
                  </div>
                </Card.Section>
              </Card>
            );

            this.setPagination(data);
            this.resetOrders();
            this.setOrders(data);
            this.setOrdersCursor(data);

            return (
              <Card>
                <Card.Section>
                  <Button primary disabled={!this.state.hasNext} onClick={() => {
                    if (this.state.hasNext) {
                      this.toggleLoading();

                      // Two fetch modes GET or SEARCH
                      if (this.state.fetchMode === FetchModeGet) {
                        fetchMore({
                          variables: { first: this.state.itemsPerPage, cursor: this.state.lastOrderCursor }
                        }).then(_ => this.toggleLoading());

                      } else if (this.state.fetchMode === FetchModeSearch) {

                        fetchMore({
                          variables: { first: this.state.itemsPerPage, search: this.state.ordersVariables.search, cursor: this.state.lastOrderCursor }
                        }).then(res => {
                          this.setPagination(res.data);
                          this.setOrders(res.data);
                          this.setOrdersCursor(res.data);

                          // Force re-render of datatable component.
                          dTableSingleton.setState({ props: this.state.orders });

                        }).then(_ => this.toggleLoading());
                      }
                    }
                  }}>{this.state.hasNext ? "Load more orders" : "No more orders"}</Button>
                  <CollapsibleLoader handleToggle={this.handleToggle} />
                </Card.Section>
                <Card.Section>
                  <DataTableContent orders={this.state.orders} />
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
