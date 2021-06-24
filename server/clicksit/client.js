import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { ClickSit_CreateReturnLabels, ClickSit_GetTrackingStatus } from "../endpoints";

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
}
