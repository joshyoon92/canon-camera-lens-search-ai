import { useRef, useState } from "react";
import { search, type SearchResponse } from "./catalog.ts";
import { Header } from "./components/Header.tsx";
import { AskPanel } from "./components/AskPanel.tsx";
import { Results } from "./components/Results.tsx";
import { Categories } from "./components/Categories.tsx";
import { Featured } from "./components/Featured.tsx";
import { Deals } from "./components/Deals.tsx";
import { LensFinder } from "./components/LensFinder.tsx";
import { Footer } from "./components/Footer.tsx";

export function App() {
  // ?q= makes searches shareable and lets a link open straight onto results.
  const [response, setResponse] = useState<SearchResponse | null>(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    return q ? search(q) : null;
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const setUrlQuery = (text: string | null) => {
    const url = new URL(window.location.href);
    if (text) url.searchParams.set("q", text); else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  };

  const ask = (text: string) => {
    setResponse(search(text));
    setUrlQuery(text);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const clear = () => {
    setResponse(null);
    setUrlQuery(null);
  };

  const focusAsk = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <Header onSearchClick={focusAsk} />
      <main>
        <section className="hero">
          <span className="hero__ghost" aria-hidden="true">EOS</span>
          <div className="hero__inner">
            <p className="eyebrow eyebrow--light">AI gear search</p>
            <h1>Tell us what you shoot.<br /><span>We'll find the gear.</span></h1>
            <p className="hero__lede">
              Describe your subject, budget, or the camera you already own. Every pick is checked
              against the catalog and lens compatibility.
            </p>
            <AskPanel inputRef={inputRef} onAsk={ask} />
          </div>
        </section>

        <div ref={resultsRef} className="results-anchor">
          {response && (
            <Results
              response={response}
              onClear={clear}
              onSwitch={as => setResponse(search(response.text, as))}
            />
          )}
        </div>

        <Categories onAsk={ask} />
        <Featured />
        <LensFinder onAsk={ask} />
        <Deals />
      </main>
      <Footer />
    </>
  );
}
