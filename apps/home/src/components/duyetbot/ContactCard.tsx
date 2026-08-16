import { Send } from "lucide-react";
import { useState } from "react";
import { CONTACT_EMAIL, contactMailto } from "./contact-mailto";

export { contactMailto };

function ContactCard() {
  const [val, setVal] = useState("");
  const ready = val.trim().length > 0;

  return (
    <div className="mt-[12px] flex flex-col gap-[8px]">
      <p className="rd-cc-m">
        Opens your email client to {CONTACT_EMAIL}. Nothing is sent from this
        page.
      </p>
      <div className="flex gap-[8px]">
        <input
          className="rd-chat-card flex-1 font-inherit text-[13.5px] px-[13px] py-[11px] outline-none bg-[var(--rd-bg)] text-[var(--rd-text)] border border-[var(--rd-border)] rounded-[10px]"
          placeholder="Your message…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <a
          className="rd-chat-send w-[40px] h-[40px] grid place-items-center"
          href={ready ? contactMailto(val) : undefined}
          aria-disabled={!ready}
          aria-label="Open email to Duyet"
        >
          <Send size={16} />
        </a>
      </div>
    </div>
  );
}

export { ContactCard };
