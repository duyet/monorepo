import { t } from "./i18n.js";
import { ensureHostPermission, saveSettings } from "./settings.js";

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") node.className = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) node.setAttribute(key, "");
    else if (value !== false && value != null)
      node.setAttribute(key, String(value));
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

function labeledSelect(labelText, name, value, options, onChange) {
  return el("label", {}, [
    el("span", { className: "lbl" }, [labelText]),
    el(
      "select",
      {
        name,
        onChange: (event) => onChange(event.target.value),
      },
      options.map((opt) =>
        el("option", { value: opt.value, selected: opt.value === value }, [
          opt.label,
        ])
      )
    ),
  ]);
}

export function mountSettingsPanel(root, settings, onSaved) {
  root.replaceChildren();

  const state = { ...settings, sections: { ...settings.sections } };

  const persist = async () => {
    const allowed = await ensureHostPermission(state.apiBase);
    if (!allowed) return;
    const saved = await saveSettings(state);
    onSaved?.(saved);
  };

  const form = el("form", { className: "settings-form" });
  form.addEventListener("submit", (event) => event.preventDefault());

  form.append(
    labeledSelect(
      t(state, "theme"),
      "theme",
      state.theme,
      [
        { value: "light", label: t(state, "light") },
        { value: "dark", label: t(state, "dark") },
        { value: "system", label: t(state, "system") },
      ],
      async (value) => {
        state.theme = value;
        await persist();
      }
    )
  );

  const accent = el("label", {}, [
    el("span", { className: "lbl" }, [t(state, "accent")]),
    el("input", {
      type: "color",
      value: state.accent,
      onInput: async (event) => {
        state.accent = event.target.value;
        await persist();
      },
    }),
  ]);
  form.append(accent);

  form.append(
    labeledSelect(
      t(state, "font"),
      "font",
      state.font,
      [
        { value: "system", label: "System" },
        { value: "editorial", label: t(state, "editorial") },
        { value: "humanist", label: t(state, "humanist") },
        { value: "serif", label: t(state, "serif") },
        { value: "mono", label: t(state, "mono") },
      ],
      async (value) => {
        state.font = value;
        await persist();
      }
    )
  );

  const sizeValue = el("span", {}, [`${state.fontSize}px`]);
  form.append(
    el("label", {}, [
      el("span", { className: "row-inline" }, [
        el("span", { className: "lbl" }, [t(state, "size")]),
        sizeValue,
      ]),
      el("input", {
        type: "range",
        min: "13",
        max: "20",
        step: "1",
        value: String(state.fontSize),
        onInput: async (event) => {
          state.fontSize = Number(event.target.value);
          sizeValue.textContent = `${state.fontSize}px`;
          await persist();
        },
      }),
    ])
  );

  form.append(
    labeledSelect(
      t(state, "language"),
      "language",
      state.language,
      [
        { value: "vi", label: t(state, "vi") },
        { value: "en", label: t(state, "en") },
        { value: "both", label: t(state, "both") },
      ],
      async (value) => {
        state.language = value;
        await persist();
      }
    )
  );

  form.append(
    labeledSelect(
      t(state, "density"),
      "density",
      state.density,
      [
        { value: "compact", label: t(state, "compact") },
        { value: "comfortable", label: t(state, "comfortable") },
        { value: "spacious", label: t(state, "spacious") },
      ],
      async (value) => {
        state.density = value;
        await persist();
      }
    )
  );

  const countValue = el("span", {}, [String(state.storyCount)]);
  form.append(
    el("label", {}, [
      el("span", { className: "row-inline" }, [
        el("span", { className: "lbl" }, [t(state, "storyCount")]),
        countValue,
      ]),
      el("input", {
        type: "range",
        min: "1",
        max: "8",
        step: "1",
        value: String(state.storyCount),
        onInput: async (event) => {
          state.storyCount = Number(event.target.value);
          countValue.textContent = String(state.storyCount);
          await persist();
        },
      }),
    ])
  );

  form.append(
    labeledSelect(
      t(state, "tldrCount"),
      "tldrCount",
      String(state.tldrCount),
      [
        { value: "8", label: "8" },
        { value: "12", label: "12" },
        { value: "16", label: "16" },
      ],
      async (value) => {
        state.tldrCount = Number(value);
        await persist();
      }
    )
  );

  const sectionKeys = ["tldr", "stories", "categories", "trending"];
  const checks = el("div", { className: "checks" });
  for (const key of sectionKeys) {
    const box = el("input", {
      type: "checkbox",
      checked: state.sections[key] !== false,
    });
    box.checked = state.sections[key] !== false;
    box.addEventListener("change", async () => {
      state.sections[key] = box.checked;
      await persist();
    });
    checks.append(
      el("label", {}, [box, t(state, key === "tldr" ? "tldr" : key)])
    );
  }
  form.append(
    el("fieldset", {}, [el("legend", {}, [t(state, "sections")]), checks])
  );

  const apiInput = el("input", {
    type: "url",
    value: state.apiBase,
    spellcheck: "false",
  });
  apiInput.addEventListener("change", async () => {
    state.apiBase = apiInput.value;
    await persist();
  });
  form.append(
    el("label", {}, [
      el("span", { className: "lbl" }, [t(state, "apiBase")]),
      apiInput,
    ])
  );

  root.append(form);
}
