/** 44px minimum tap target for phone chrome (search / menu / theme / nav). */
export const PHONE_TAP_TARGET_CLASS =
  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center";

export const PHONE_PREFS_TRIGGER_CLASS = `${PHONE_TAP_TARGET_CLASS} rounded-md text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground`;

/** SiteHeader + desktop HeaderBar — hidden on narrow or short (landscape phone) viewports. */
export const WIDE_CHROME_CLASS = "news-wide-chrome";

/** Combined phone chrome with a visible search field. */
export const COMPACT_CHROME_CLASS = "news-compact-chrome";

export const WIDE_HEADER_ROW_CLASS = "news-wide-row";
