import { Check, Send } from "lucide-react";
import { useState } from "react";

function ContactCard() {
  const [sent, setSent] = useState(false);
  const [val, setVal] = useState("");

  if (sent) {
    return (
      <div className="rd-chat-cards">
        <div className="rd-chat-card cursor-default flex items-center gap-[10px] border-[color-mix(in_srgb,var(--rd-ok)_40%,var(--rd-border))]">
          <span className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[color-mix(in_srgb,var(--rd-ok)_16%,transparent)] text-[var(--rd-ok)] shrink-0">
            <Check size={14} />
          </span>
          <span>
            <div className="rd-cc-t">Message queued</div>
            <div className="rd-cc-m">Routed to Duyet via the contact tool.</div>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[12px] flex gap-[8px]">
      <input
        className="rd-chat-card flex-1 font-inherit text-[13.5px] px-[13px] py-[11px] outline-none bg-[var(--rd-bg)] text-[var(--rd-text)] border border-[var(--rd-border)] rounded-[10px]"
        placeholder="Your message or email…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) setSent(true);
        }}
      />
      <button
        className="rd-chat-send w-[40px] h-[40px]"
        onClick={() => val.trim() && setSent(true)}
        aria-label="Send"
      >
        <Send size={16} />
      </button>
    </div>
  );
}

export { ContactCard };
