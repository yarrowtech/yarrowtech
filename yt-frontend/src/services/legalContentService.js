/* -------------------------------------------------------
   Legal content (Terms & Conditions / Privacy Policy) shown
   during signup consent steps across products. Proxied through
   our own backend, which holds EFNBMMS's policy API credentials
   server-side — the browser never talks to that API directly.
------------------------------------------------------- */
import API from "./api";

// productSlug is accepted for future multi-product policy scoping; the
// backend currently resolves EFNBMMS's own policy documents regardless.
export const getLegalDocument = async (productSlug, docType) => {
  const { data } = await API.get(`/efnbmms/policy/${docType}`, {
    params: { productSlug },
  });
  return data;
};
