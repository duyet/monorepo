import { t } from "./i18n.js";
import { applyAppearance, loadSettings } from "./settings.js";
import { mountSettingsPanel } from "./settings-panel.js";

const settings = await loadSettings();
applyAppearance(settings);
document.title = `${t(settings, "settings")} — AI News`;
const heading = document.querySelector(".options-title");
if (heading) heading.textContent = t(settings, "settings");
mountSettingsPanel(
  document.getElementById("settings-root"),
  settings,
  (next) => {
    applyAppearance(next);
  }
);
