import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { ClickSit_CreateReturnLabels, ClickSit_GetTrackingStatus, Shopify_addOrderTrackingNote, Shopify_GetOrders } from "../endpoints";

export class ClickSitService {
  constructor(appBridge) {
    this.appBridge = appBridge;
  }

  createReturnLabels = async (orderReference, email) => {
    try {
      let createdLabel = await authenticatedFetch(this.appBridge)(ClickSit_CreateReturnLabels, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",               // Without headers fails customer not found
        },
        body: JSON.stringify({
          retailerref: "clicksit",                          // Hardcoded - Don't change will fail with customer not found
          orderreference: orderReference,
          email: email
        }),
      });

      let createdLabelJson = await createdLabel.json();
      return createdLabelJson;

    } catch (err) {
      console.log(err);
    }
  }

  getTrackingStatus = async (trackingnumber) => {
    try {
      let trackingStatus = await authenticatedFetch(this.appBridge)(ClickSit_GetTrackingStatus, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",               // Without headers fails customer not found
        },
        body: JSON.stringify({
          trackingno: trackingnumber,
        }),
      });

      let trackingStatusJson = await trackingStatus.json();
      return trackingStatusJson;

    } catch (err) {
      console.log(err);
    }
  }

  updateOrder = async (orderReference, trackingNumber) => {
    try {
      console.log("Trying to update order")
      let updateStatus = await authenticatedFetch(this.appBridge)(Shopify_addOrderTrackingNote, {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "orderReference":orderReference,
          "trackingNumber":trackingNumber
        })
     })
    .then(result => {
      return updateStatus.json();
    })
    } catch (e) {
      console.warn("Error! "+e)
    }
  }

  getOrders = async (numberOfRecords = 10, searchQuery = "fire unfulfilled") => {
    try {
      let updateStatus = await authenticatedFetch(this.appBridge)(Shopify_GetOrders, {
        method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: 
      `query {
        orders(first: ${numberOfRecords}, query: ${searchQuery}) {
          edges {
            node {
              id,
              createdAt,
              note,
              lineItems (first: ${numberOfRecords}) {
                edges {
                  node {
                  id,
                  name,
                  quantity,
                  fulfillmentStatus
                  }
                }
              }
            }
          }
        }
      }`
  })
    .then(result => {
      return updateStatus.json();
    })
    } catch (e) {
      console.warn("Error! "+e)
    }
  }
}
