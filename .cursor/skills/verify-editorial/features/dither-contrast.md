# Dither contrast

App-switcher hover and the Get updates side panel may use a stipple texture. Labels and form copy must stay readable.

## Sub-features

- `switcher-opacity` hover dither is well below full opacity and masked off the label.
- `subscribe-panel` dither is decorative; the form column is solid `--rd-bg`.

## How to get to it (user POV)

- Open the header app switcher, hover Blog / Home / About.
- Click Subscribe → Get updates dialog.

## Driving it with verify-editorial

Preconditions: repo checkout (source proof). Optional live hover is visual, not required for the lever.

- **Source.** `verify-editorial drive dither-contrast`.
  - `packages/components/site-header/AppSwitcher.tsx` must not contain `hover:after:opacity-100`.
  - It must contain `mask-image` on the dither layer.
  - Subscribe dither `after:opacity` is 40 or less.

## Gotchas

- A screenshot of a dotted tile is not pass if the subtitle is punched through by dots.
- Do not “fix” contrast by darkening the type; reduce or mask the texture.
