/* -------------------------------------------------------
   Legal content (Terms & Conditions / Privacy Policy) shown
   during signup consent steps across products.

   DEMO ONLY: the actual legal department API is not wired up
   yet. This returns placeholder content in the same shape a
   real API response should have, so swapping DEMO_DOCS for a
   real fetch() call later is a one-function change — nothing
   else in the app needs to know the difference.
------------------------------------------------------- */

const DEMO_DOCS = {
  terms: {
    title: "Terms & Conditions",
    updatedAt: "Demo content — not final legal text",
    content: [
      "This is placeholder Terms & Conditions text shown for demo purposes only. It does not reflect the company's actual legal terms.",
      "By subscribing, you would normally be agreeing to usage limits, billing terms, cancellation policy, data ownership, and acceptable use rules specific to this product.",
      "Subscriptions renew automatically for the billing cycle you chose (monthly or yearly) unless cancelled before the renewal date from your account dashboard.",
      "Access to product features is tied to your active plan tier. Downgrading or letting a subscription lapse may restrict access to data and modules until it is reactivated.",
      "You are responsible for the accuracy of the business, GST, and PAN details provided at signup. Incorrect details may delay account verification or invoicing.",
      "Any misuse of the platform, including attempts to circumvent plan limits or security controls, may result in suspension or termination of the account without refund.",
      "Refunds, if applicable, are handled per the product's refund policy in effect at the time of payment, not this demo text.",
      "Final wording will be sourced from the legal department's API once it is available.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updatedAt: "Demo content — not final legal text",
    content: [
      "This is placeholder Privacy Policy text shown for demo purposes only. It does not reflect the company's actual privacy practices.",
      "It would normally describe what personal and business data is collected during signup, how it's stored, who it's shared with (e.g. payment processors), and how to request deletion.",
      "Data collected typically includes contact details, business identifiers (GST/PAN), address, and payment metadata — never full card numbers, which are handled directly by the payment processor.",
      "Information may be shared with the specific product's own backend (e.g. EFNBMMS) to create and manage your account there, and with the payment gateway to process transactions.",
      "You may request a copy of the data held about you, or request deletion of your account and associated data, subject to legal and accounting retention requirements.",
      "Cookies or local storage may be used to keep you signed in during checkout, not for cross-site tracking or advertising.",
      "Final wording will be sourced from the legal department's API once it is available.",
    ],
  },
};

// productSlug is accepted now (unused) so callers don't need to change
// when this starts calling a per-product legal API.
export const getLegalDocument = async (productSlug, docType) => {
  return DEMO_DOCS[docType] || null;
};
