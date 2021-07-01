import React, { useState, useCallback } from "react";
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Filters, Card, DataTable, Spinner, Stack, Pagination } from "@shopify/polaris";

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
      orderCursor: [],
      hasPrevious: false,
      hasNext: false,
    }
  }

  componentDidCatch() {
    console.log("OrdersList::Catch something wrong");
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

          if (data.orders?.pageInfo?.hasNextPage) {
            this.state.hasNext = true;
            fetchMore({
              variables: { first: this.state.itemsPerPage, cursor: data.orders.length }
            });
          }

          if (data.orders?.pageInfo?.hasPreviousPage) {
            this.state.hasPrevious = true;
            fetchMore({
              variables: { first: this.state.itemsPerPage, cursor: data.orders.length }
            });
          }

          if (Array.isArray(data.orders?.edges) && data.orders?.edges.length) {
            data.orders.edges.map(item => {
              const { id, createdAt, name, shippingAddress, customer } = item.node;
              const column = [id, name, createdAt, shippingAddress?.address1 ?? "-", customer?.email ?? "-", customer?.displayName ?? "-"];
              this.state.orders.push(column);
            });

            var firstItem = data.orders.edges[0].cursor;
            var lastItem = data.orders.edges[data.orders.edges.length-1].cursor;

            this.state.orderCursor.push([firstItem, lastItem]);
          }

          return (
            <Card>
              <Card.Section>
                <Pagination
                  label="Pagination"
                  hasPrevious={this.state.hasPrevious}
                  onPrevious={() => {
                    console.log('Previous');

                  }}
                  hasNext={this.state.hasNext}
                  onNext={() => {
                    console.log('Next', this.state.orderCursor);
                    fetchMore({
                      variables: { first: this.state.itemsPerPage, cursor: this.state.orderCursor[1] }
                    }).then(res => {
                      console.log("FetchmoreData::", res);
                      this.setState({order: res.data.orders })
                    });
                  }}
                />
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
                  'ID',
                  'Name',
                  'Created At',
                  'Shipping Address',
                  'Email',
                  'Display Name'
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
