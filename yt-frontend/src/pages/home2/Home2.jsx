import React, { useEffect } from "react";
import Home2Hero from "./Home2Hero";
import Home2Services from "./Home2Services";
import Home2Products from "./Home2Products";
import Home2Expertise from "./Home2Expertise";
import Home2FAQ from "./Home2FAQ";
import Home2About from "./Home2About";
import Home2Footer from "./Home2Footer";

export default function Home2() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <Home2Hero />
      <Home2Services />
      <Home2Products />
      <Home2Expertise />
      <Home2FAQ />
      <Home2About />
      <Home2Footer />
    </>
  );
}
