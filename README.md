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

## License

This respository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

# British Redcross Custom app

## Overview
From this section on, it's all hands on, how to start and configure the node server locally, see package.json scripts.
`npm run dev` or using shopify-cli `shopify serve`

## NGROK

1. Create free account
`https://dashboard.ngrok.com/get-started/setup`
2. Follow setup configurations

## Configuring a webhook using the Shopify Admin

1. Head over to the settings in the admin dashboard and click notifications.
2. Scroll down to the webhooks section and click the create webhook button.
3. Select the event type, the format, and URL which should receive the webhook notification.
