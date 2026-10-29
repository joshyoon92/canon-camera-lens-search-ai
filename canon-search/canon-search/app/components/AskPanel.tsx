import { useState, type FormEvent, type RefObject } from "react";

const EXAMPLES = [
  "Beginner camera for vlogging under $800",
  "Portrait lens for my R8",
  "Weather sealed camera for hiking under $2000",
  "Wildlife lens under $2000 for my R7",
  "Full frame camera under 700 grams for travel",
];

interface Props {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onAsk: (text: string) => void;
}

export function AskPanel({ inputRef, onAsk }: Props) {
  const [text, setText] = useState("");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (text.trim()) onAsk(text.trim());
  };

  return (
    <form className="ask" onSubmit={submit}>
      <label htmlFor="ask-input" className="sr-only">Describe what you're looking for</label>
      <div className="ask__box">
        <textarea
          id="ask-input"
          ref={inputRef}
          rows={2}
          value={text}
          placeholder="Describe what you shoot, your budget, or the camera you own…"
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
        />
        <button type="submit" className="ask__submit" disabled={!text.trim()}>
          Find gear
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
      <div className="ask__examples">
        <span>Try</span>
        {EXAMPLES.map(ex => (
          <button key={ex} type="button" className="chip chip--ghost" onClick={() => { setText(ex); onAsk(ex); }}>
            {ex}
          </button>
        ))}
      </div>
    </form>
  );
}
