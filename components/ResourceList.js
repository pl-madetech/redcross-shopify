import React, { useState, useCallback } from "react";
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Filters, Card, DataTable } from "@shopify/polaris";

const GET_ORDERS = gql`
  query First50Orders {
    orders(first: 50) {
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

class ResourceListWithOrders extends React.Component {
  render() {
    return (
      <Query query={GET_ORDERS}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;

          const rows = [];
          data.orders.edges.map(item => {
            const { id, createdAt, name, shippingAddress, customer } = item.node;
            const column = [id, name, createdAt, shippingAddress?.address1, customer?.email, customer?.displayName];
            rows.push(column);
          });

          return (
            <Card>
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
                rows={rows}
                footerContent={`Showing ${rows.length} of ${rows.length} results`}
              />
            </Card>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithOrders;
