import "./preview-shim.js";
import { applyAppearance, loadSettings } from "./settings.js";

const settings = await loadSettings();
applyAppearance(settings);
