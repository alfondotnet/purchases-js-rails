// app/javascript/controllers/paywall_controller.js

import { Controller } from "@hotwired/stimulus"
import * as RevenueCat from "@revenuecat/purchases-js"

export default class extends Controller {
  connect() {
    console.log("Paywall controller connected. Initializing SDK...");
    this.initializeRevenueCat();
  }

  async initializeRevenueCat() {
    const apiKey = 'rcb_wqNPRHHStvmcrfqurgmvRHmLduos';
    const appUserID = 'final-repro-' + Math.random().toString(16).slice(2);
    // These getElementById calls will now succeed
    const statusEl = document.getElementById('status');
    const purchaseBtn = document.getElementById('purchase-button');

    try {
      const Purchases = RevenueCat.Purchases;
      if (!Purchases) throw new Error("Purchases class not found.");

      this.purchases = new Purchases(apiKey, appUserID);
      console.log("SDK Initialized:", this.purchases);

      this.offerings = await this.purchases.getOfferings();

      statusEl.textContent = "SDK Ready. Click to test.";
      purchaseBtn.disabled = false;
      // This line was missing. It updates the button text after loading is complete.
      purchaseBtn.textContent = "Start Purchase";

    } catch (e) {
      console.error("SDK Init Error:", e);
      statusEl.textContent = `Error: ${e.message}`;
      if(purchaseBtn) purchaseBtn.textContent = "SDK Failed to Load";
    }
  }

  // This method name now matches the data-action in the HTML
  async startPurchase() {
    const statusEl = document.getElementById('status');
    console.log("Button clicked, calling purchasePackage()...");

    try {
      if (!this.offerings || !this.offerings.current) {
        throw new Error("Offerings not loaded yet.");
      }

      const packageToPurchase = this.offerings.current.availablePackages[0];
      if (!packageToPurchase) {
        throw new Error("No available packages found in the current offering.");
      }

      console.log(`Attempting to purchase first available package: ${packageToPurchase.identifier}`);
      statusEl.textContent = `Purchasing '${packageToPurchase.identifier}'...`;

      await this.purchases.purchasePackage(packageToPurchase);

      statusEl.textContent = "Purchase flow started successfully!";
      console.log("Purchase successful!");

    } catch (e) {
      if (e.userCancelled) {
        console.log("User cancelled purchase flow.");
        statusEl.textContent = "Purchase flow cancelled by user.";
      } else {
        console.error("Purchase Error:", e);
        statusEl.textContent = `Error during purchase: ${e.message}`;
      }
    }
  }
}
