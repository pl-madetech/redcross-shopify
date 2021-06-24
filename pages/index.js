import { Heading, Page, Layout } from "@shopify/polaris";
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
            }
          </Layout.Section>
        </Layout>
      </Page>
    )
  }
}

export default Index;
