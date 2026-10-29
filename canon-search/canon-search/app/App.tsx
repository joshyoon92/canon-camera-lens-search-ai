import { useEffect, useRef, useState } from "react";
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
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef<AbortController | null>(null);
  const lastRequest = useRef<[string, ("camera" | "bundle")?] | null>(null);

  const setUrlQuery = (text: string | null) => {
    const url = new URL(window.location.href);
    if (text) url.searchParams.set("q", text); else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  };

  // Only the latest request may update the page; older ones are aborted.
  const run = async (text: string, as?: "camera" | "bundle", scroll = true) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    lastRequest.current = [text, as];
    setPending(text);
    setError(null);
    if (scroll) requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    try {
      setResponse(await search(text, as, controller.signal));
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      if (inFlight.current === controller) setPending(null);
    }
  };

  const ask = (text: string) => {
    setUrlQuery(text);
    run(text);
  };

  const clear = () => {
    inFlight.current?.abort();
    setResponse(null);
    setError(null);
    setPending(null);
    setUrlQuery(null);
  };

  // ?q= makes searches shareable and lets a link open straight onto results.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) run(q, undefined, false);
    return () => inFlight.current?.abort();
  }, []);

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
          {error && (
            <div className="results">
              <div className="results__empty" role="alert">
                <p>Search isn't available right now: {error}</p>
                <p><button className="link-btn" onClick={() => lastRequest.current && run(...lastRequest.current, false)}>Try again</button></p>
              </div>
            </div>
          )}
          {pending && !response && !error && (
            <div className="results"><p className="results__loading" role="status">Finding gear for “{pending}”…</p></div>
          )}
          {response && !error && (
            <div className={pending ? "results--stale" : undefined} aria-busy={pending != null}>
              <Results
                response={response}
                onClear={clear}
                onSwitch={as => run(response.text, as, false)}
              />
            </div>
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
