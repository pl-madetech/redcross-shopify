import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import { receiveWebhook } from '@shopify/koa-shopify-webhooks';
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { ClickSit_CreateReturnLabels, ClickSit_GetTrackingStatus } from "./endpoints";

dotenv.config();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  PORT,
  NODE_ENV,
  SCOPES,
  HOST,
  SHOPIFY_WEBHOOOK_ORDER_CREATED
} = process.env;

const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET });
const port = parseInt(PORT, 10) || 8081;
const dev = NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: SCOPES.split(","),
  HOST_NAME: HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!response.success) {
          console.log(`Failed to register APP_UNINSTALLED webhook: ${response.result}`);
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.get("/", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(SHOPIFY_WEBHOOOK_ORDER_CREATED, webhook, async (ctx) => {
    try {

      const wH = ctx.state.webhook;

      console.log("SERVER::Webhooks created order CTX...", wH);

      ctx.response.status = 200;

      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook create order: ${error}`);
    }
  });

  router.post("/graphql", verifyRequest({ returnHeader: true }), async (ctx) => {
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  });

  router.post(ClickSit_CreateReturnLabels, verifyRequest(), async (ctx) => {
    try {

      console.log(ctx.request.body);

      const results = await fetch(process.env.CLICKSIT_RETURN_LABELS_URL, {
        method: "POST",
        body: JSON.stringify(ctx.request.body),
      })
        .then(response => response.json())
        .then(json => {
          return json;
        });

      ctx.body = {
        data: results
      };

    } catch (err) {
      console.log(err)
    }
  });

  router.post(ClickSit_GetTrackingStatus, verifyRequest(), async (ctx) => {
    try {

      console.log(ctx.request.body);

      const results = await fetch(process.env.CLICKSIT_GET_TRACKING_STATUS_URL, {
        method: "POST",
        body: JSON.stringify(ctx.request.body),
        headers: {
          'api-key': process.env.CLICKSIT_GET_TRACKING_STATUS_API_KEY,
        },
      })
        .then(response => response.json())
        .then(json => {
          return json;
        });

      ctx.body = {
        data: results
      };

    } catch (err) {
      console.log(err)
    }
  });

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", verifyRequest(), handleRequest); // Everything else must have sessions

  server.use(bodyParser());
  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
