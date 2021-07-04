# Shopify App Node

## Overview

The following section explain how to create a shopify app via command line or cloning from Shopify repository.
The scope of this section is to demonstrate how can you start a new app and all the configurations required to run shopify-cli and other tools.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Build Status](https://travis-ci.com/Shopify/shopify-app-node.svg?branch=master)](https://travis-ci.com/Shopify/shopify-app-node)

Boilerplate to create an embedded Shopify app made with Node, [Next.js](https://nextjs.org/), [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth), [Polaris](https://github.com/Shopify/polaris-react), and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components).

## Installation

Using the [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli) run:

```sh
~/ $ shopify create project APP_NAME
```

Or, fork and clone repo

## Requirements

- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- In the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

## Usage

This repository is used by [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli) as a scaffold for Node apps. You can clone or fork it yourself, but it’s faster and easier to use Shopify App CLI, which handles additional routine development tasks for you.

## Shopify CLI

Read more https://shopify.dev/tools/cli/getting-started

### Create a new project
```sh
shopify create
```

### Start a local development server
```sh
shopify serve
```

### Install your app on your development store
```sh
shopify open
```

### Populate test data
```sh
shopify populate
```

### Deploy app
```sh
shopify deploy
```

## License

This respository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

</br>

# British Redcross Custom app

## Overview
From this section on, it's all hands on, how to start and configure the node server locally, see package.json scripts.
`npm run dev` or using shopify-cli `shopify serve`

## NGROK

1. Create free account
`https://dashboard.ngrok.com/get-started/setup`
2. Follow setup configurations
3. On startup should see something like

```sh
Version                       2.3.40
Region                        United States (us)                                                                        
Web Interface                 http://127.0.0.1:4040                                                                     
Forwarding                    http://c5ac085793cb.ngrok.io -> http://localhost:8081                                     
Forwarding                    https://c5ac085793cb.ngrok.io -> http://localhost:8081
```

## Configuring a webhook using the Shopify Admin

1. Head over to the settings in the admin dashboard and click notifications.
2. Scroll down to the webhooks section and click the create webhook button.
3. Select the event type, the format, and URL which should receive the webhook notification.

## GraphQL Admin API

To test our queries we used the following URL \
https://shopify.dev/tools/graphiql-admin-api \
e.g. of orders query 
```sh
query getOrders {
  orders(first: 5, after: null) {
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

```

## Issues found prototype phase

1. JWT token not active - https://github.com/Shopify/shopify-node-api/issues/137
Windows machine - until a fix is done on the JWT lib, workaround,
```sh
How to sync date and time manually using Settings
Open Settings.
Click on Time & Language.
Click on Date & time.
Under “Synchronize your clock,” click the Sync now button. Synchronize clock on Windows 10. Quick Tip: If the process fails, wait a few seconds, and try again.
```

## TODO's

1. server.js, when the webhook is triggered sends the order to the application, identify what property is holding the number of bags requested.
2. workflow -> create-order.js, clean up the PDFkit address label generation to a separate js file. Finalise the logic steps described on the file.
3. analyze what is required to send streams of data to SharePoint.
4. @Alex complete the update actions required on the order when we have the return labels from Clicksit (trackingnumber) and change the order status.
5. include tests into the application, we didn't for the simple reason that working with Shopify react polaris was what we could deal with the two weeks time of investigation.
6. OrdersList component maybe requires a few tweeks on the graphql side, will depend on Redcross what data they want to see.
7. Clean up index.js file, it's only a skeleton.
