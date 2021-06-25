import { Heading, Page, Layout, ResourceList, Avatar, ResourceItem, TextStyle, Card } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { ClickSitService } from "../server/clicksit/client";

class Index extends React.Component {

  constructor(props) {
    super(props);
    this.clickSitService = new ClickSitService(props.appBridge);
  }

  state = {
    orders: [],
    open: false
  }

  render() {

    // const sessionToken = await getSessionToken(app);
    // console.log(sessionToken);

    return (
      <Page fullWidth
        title="Orders"
        primaryAction={{
          content: 'Create order', onAction: async () => {

            let labels = await this.clickSitService.createReturnLabels("asd", "email@yahoo.com");
            let trackStatus = await this.clickSitService.getTrackingStatus("82PJG8303119A040");

            console.log(labels);
            console.log(trackStatus);

            // this.setState({ open: true });
          }
        }}
        secondaryActions={[{ content: 'Export' }]}
        pagination={{
          hasNext: true,
        }}
      >
        <Layout>
          <Layout.Section>
            {
              /* Page-level banners */
              <Heading>Hello Iam new to Shopify !!!! Scary :) :)</Heading>
            }
          </Layout.Section>
          <Layout.Section>
            {
              /* Wide page content */
              <ResourcePicker
                resourceType='Product'
                open={this.state.open}
              />
            }
          </Layout.Section>
          <Layout.Section>
            {
              /* Page footer content */
              <Card>
                <ResourceList
                  resourceName={{ singular: 'order', plural: 'orders' }}
                  items={[
                    {
                      id: 3905353351317,
                      url: 'orders/3905353351317',
                      name: 'Mae Jemison',
                      location: 'Decatur, USA',
                    },
                    {
                      id: 3905354137749,
                      url: 'orders/3905354137749',
                      name: 'Ellen Ochoa',
                      location: 'Los Angeles, USA',
                    },
                  ]}
                  renderItem={(item) => {
                    const { id, url, name, location } = item;
                    const media = <Avatar customer size="medium" name={name} />;

                    return (
                      <ResourceItem
                        id={id}
                        url={url}
                        media={media}
                        accessibilityLabel={`View details for ${name}`}
                      >
                        <h3>
                          <TextStyle variation="strong">{name}</TextStyle>
                        </h3>
                        <div>{location}</div>
                      </ResourceItem>
                    );
                  }}
                />
              </Card>
            }
          </Layout.Section>
        </Layout>
      </Page>
    )
  }
}

export default Index;
