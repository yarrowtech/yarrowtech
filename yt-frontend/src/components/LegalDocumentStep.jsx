import React, { useEffect, useRef, useState } from "react";
import { getLegalDocument } from "../services/legalContentService";
import "./LegalDocumentStep.css";

const SCROLL_END_THRESHOLD = 24;

/* Reusable full-page legal consent step for any product's signup flow:
   shows one document (terms or privacy) at a time, full-page, and only
   enables Agree/Disagree once the reader has scrolled to the end.
   The parent drives the step sequence via onAgree/onDisagree. */
export default function LegalDocumentStep({
  productSlug,
  docType,
  stepLabel,
  onAgree,
  onDisagree,
}) {
  const [doc, setDoc] = useState(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    setDoc(null);
    setScrolledToEnd(false);

    getLegalDocument(productSlug, docType).then((data) => {
      if (active) setDoc(data);
    });

    return () => {
      active = false;
    };
  }, [productSlug, docType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [docType]);

  // Sets both directions (see TermsConsent-era bug): a re-check with the
  // real content must be able to flip an earlier false "it fits" back off.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrolledToEnd(el.scrollHeight - el.clientHeight <= SCROLL_END_THRESHOLD);
  }, [doc]);

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_END_THRESHOLD) {
      setScrolledToEnd(true);
    }
  };

  return (
    <main className="legal-step-page">
      <div className="legal-step-shell">
        {stepLabel && <span className="legal-step-label">{stepLabel}</span>}
        <h1>{doc?.title || "Loading…"}</h1>
        {doc?.updatedAt && <p className="legal-step-updated">{doc.updatedAt}</p>}

        <div className="legal-step-scrollbox" ref={scrollRef} onScroll={handleScroll}>
          {doc ? (
            doc.content.map((paragraph, i) => <p key={i}>{paragraph}</p>)
          ) : (
            <p>Loading…</p>
          )}
        </div>

        <p className="legal-step-hint">
          {scrolledToEnd
            ? "You've reached the end. Choose an option below to continue."
            : "Scroll to the end of the document to enable the buttons below."}
        </p>

        <div className="legal-step-actions">
          <button
            type="button"
            className="legal-step-btn legal-step-btn--disagree"
            disabled={!scrolledToEnd}
            onClick={onDisagree}
          >
            Disagree
          </button>
          <button
            type="button"
            className="legal-step-btn legal-step-btn--agree"
            disabled={!scrolledToEnd}
            onClick={onAgree}
          >
            Agree &amp; Continue
          </button>
        </div>
      </div>
    </main>
  );
}
