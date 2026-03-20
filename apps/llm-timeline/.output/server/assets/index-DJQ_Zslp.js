import React7, { useMemo, useCallback, useSyncExternalStore, useRef, useState, useEffect, useContext, createElement, createContext } from "react";
import useSWR, { SWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import useSWRMutation from "swr/mutation";
import { createPortal } from "react-dom";
function createErrorTypeGuard(ErrorClass) {
  function typeGuard(error) {
    const target = error ?? this;
    if (!target) throw new TypeError(`${ErrorClass.kind || ErrorClass.name} type guard requires an error object`);
    if (ErrorClass.kind && typeof target === "object" && target !== null && "constructor" in target) {
      if (target.constructor?.kind === ErrorClass.kind) return true;
    }
    return target instanceof ErrorClass;
  }
  return typeGuard;
}
var ClerkAPIError = class {
  static kind = "ClerkApiError";
  code;
  message;
  longMessage;
  meta;
  constructor(json) {
    const parsedError = {
      code: json.code,
      message: json.message,
      longMessage: json.long_message,
      meta: {
        paramName: json.meta?.param_name,
        sessionId: json.meta?.session_id,
        emailAddresses: json.meta?.email_addresses,
        identifiers: json.meta?.identifiers,
        zxcvbn: json.meta?.zxcvbn,
        plan: json.meta?.plan,
        isPlanUpgradePossible: json.meta?.is_plan_upgrade_possible
      }
    };
    this.code = parsedError.code;
    this.message = parsedError.message;
    this.longMessage = parsedError.longMessage;
    this.meta = parsedError.meta;
  }
};
var ClerkError = class ClerkError2 extends Error {
  static kind = "ClerkError";
  clerkError = true;
  code;
  longMessage;
  docsUrl;
  cause;
  get name() {
    return this.constructor.name;
  }
  constructor(opts) {
    super(new.target.formatMessage(new.target.kind, opts.message, opts.code, opts.docsUrl), { cause: opts.cause });
    Object.setPrototypeOf(this, ClerkError2.prototype);
    this.code = opts.code;
    this.docsUrl = opts.docsUrl;
    this.longMessage = opts.longMessage;
    this.cause = opts.cause;
  }
  toString() {
    return `[${this.name}]
Message:${this.message}`;
  }
  static formatMessage(name, msg, code, docsUrl) {
    const prefix = "Clerk:";
    const regex = new RegExp(prefix.replace(" ", "\\s*"), "i");
    msg = msg.replace(regex, "");
    msg = `${prefix} ${msg.trim()}

(code="${code}")

`;
    if (docsUrl) msg += `

Docs: ${docsUrl}`;
    return msg;
  }
};
var ClerkAPIResponseError = class ClerkAPIResponseError2 extends ClerkError {
  static kind = "ClerkAPIResponseError";
  status;
  clerkTraceId;
  retryAfter;
  errors;
  constructor(message, options) {
    const { data: errorsJson, status, clerkTraceId, retryAfter } = options;
    super({
      ...options,
      message,
      code: "api_response_error"
    });
    Object.setPrototypeOf(this, ClerkAPIResponseError2.prototype);
    this.status = status;
    this.clerkTraceId = clerkTraceId;
    this.retryAfter = retryAfter;
    this.errors = (errorsJson || []).map((e) => new ClerkAPIError(e));
  }
  toString() {
    let message = `[${this.name}]
Message:${this.message}
Status:${this.status}
Serialized errors: ${this.errors.map((e) => JSON.stringify(e))}`;
    if (this.clerkTraceId) message += `
Clerk Trace ID: ${this.clerkTraceId}`;
    return message;
  }
  static formatMessage(name, msg, _, __) {
    return msg;
  }
};
const isClerkAPIResponseError = createErrorTypeGuard(ClerkAPIResponseError);
const DefaultMessages = Object.freeze({
  InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
  InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
  MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
});
function buildErrorThrower({ packageName, customMessages }) {
  let pkg = packageName;
  function buildMessage(rawMessage, replacements) {
    if (!replacements) return `${pkg}: ${rawMessage}`;
    let msg = rawMessage;
    const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
    for (const match of matches) {
      const replacement = (replacements[match[1]] || "").toString();
      msg = msg.replace(`{{${match[1]}}}`, replacement);
    }
    return `${pkg}: ${msg}`;
  }
  const messages = {
    ...DefaultMessages,
    ...customMessages
  };
  return {
    setPackageName({ packageName: packageName$1 }) {
      if (typeof packageName$1 === "string") pkg = packageName$1;
      return this;
    },
    setMessages({ customMessages: customMessages$1 }) {
      Object.assign(messages, customMessages$1 || {});
      return this;
    },
    throwInvalidPublishableKeyError(params) {
      throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
    },
    throwInvalidProxyUrl(params) {
      throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
    },
    throwMissingPublishableKeyError() {
      throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
    },
    throwMissingSecretKeyError() {
      throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
    },
    throwMissingClerkProviderError(params) {
      throw new Error(buildMessage(messages.MissingClerkProvider, params));
    },
    throw(message) {
      throw new Error(buildMessage(message));
    }
  };
}
var ClerkRuntimeError = class ClerkRuntimeError2 extends ClerkError {
  static kind = "ClerkRuntimeError";
  /**
  * @deprecated Use `clerkError` property instead. This property is maintained for backward compatibility.
  */
  clerkRuntimeError = true;
  constructor(message, options) {
    super({
      ...options,
      message
    });
    Object.setPrototypeOf(this, ClerkRuntimeError2.prototype);
  }
};
const TYPES_TO_OBJECTS = {
  strict_mfa: {
    afterMinutes: 10,
    level: "multi_factor"
  },
  strict: {
    afterMinutes: 10,
    level: "second_factor"
  },
  moderate: {
    afterMinutes: 60,
    level: "second_factor"
  },
  lax: {
    afterMinutes: 1440,
    level: "second_factor"
  }
};
const ALLOWED_LEVELS = /* @__PURE__ */ new Set([
  "first_factor",
  "second_factor",
  "multi_factor"
]);
const ALLOWED_TYPES = /* @__PURE__ */ new Set([
  "strict_mfa",
  "strict",
  "moderate",
  "lax"
]);
const isValidMaxAge = (maxAge) => typeof maxAge === "number" && maxAge > 0;
const isValidLevel = (level) => ALLOWED_LEVELS.has(level);
const isValidVerificationType = (type) => ALLOWED_TYPES.has(type);
const prefixWithOrg = (value) => value.replace(/^(org:)*/, "org:");
const checkOrgAuthorization = (params, options) => {
  const { orgId, orgRole, orgPermissions } = options;
  if (!params.role && !params.permission) return null;
  if (!orgId || !orgRole || !orgPermissions) return null;
  if (params.permission) return orgPermissions.includes(prefixWithOrg(params.permission));
  if (params.role) return prefixWithOrg(orgRole) === prefixWithOrg(params.role);
  return null;
};
const checkForFeatureOrPlan = (claim, featureOrPlan) => {
  const { org: orgFeatures, user: userFeatures } = splitByScope(claim);
  const [scope, _id] = featureOrPlan.split(":");
  const id = _id || scope;
  if (scope === "org") return orgFeatures.includes(id);
  else if (scope === "user") return userFeatures.includes(id);
  else return [...orgFeatures, ...userFeatures].includes(id);
};
const checkBillingAuthorization = (params, options) => {
  const { features, plans } = options;
  if (params.feature && features) return checkForFeatureOrPlan(features, params.feature);
  if (params.plan && plans) return checkForFeatureOrPlan(plans, params.plan);
  return null;
};
const splitByScope = (fea) => {
  const features = fea ? fea.split(",").map((f) => f.trim()) : [];
  return {
    org: features.filter((f) => f.split(":")[0].includes("o")).map((f) => f.split(":")[1]),
    user: features.filter((f) => f.split(":")[0].includes("u")).map((f) => f.split(":")[1])
  };
};
const validateReverificationConfig = (config) => {
  if (!config) return false;
  const convertConfigToObject = (config$1) => {
    if (typeof config$1 === "string") return TYPES_TO_OBJECTS[config$1];
    return config$1;
  };
  const isValidStringValue = typeof config === "string" && isValidVerificationType(config);
  const isValidObjectValue = typeof config === "object" && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);
  if (isValidStringValue || isValidObjectValue) return convertConfigToObject.bind(null, config);
  return false;
};
const checkReverificationAuthorization = (params, { factorVerificationAge }) => {
  if (!params.reverification || !factorVerificationAge) return null;
  const isValidReverification = validateReverificationConfig(params.reverification);
  if (!isValidReverification) return null;
  const { level, afterMinutes } = isValidReverification();
  const [factor1Age, factor2Age] = factorVerificationAge;
  const isValidFactor1 = factor1Age !== -1 ? afterMinutes > factor1Age : null;
  const isValidFactor2 = factor2Age !== -1 ? afterMinutes > factor2Age : null;
  switch (level) {
    case "first_factor":
      return isValidFactor1;
    case "second_factor":
      return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
    case "multi_factor":
      return factor2Age === -1 ? isValidFactor1 : isValidFactor1 && isValidFactor2;
  }
};
const createCheckAuthorization = (options) => {
  return (params) => {
    if (!options.userId) return false;
    const billingAuthorization = checkBillingAuthorization(params, options);
    const orgAuthorization = checkOrgAuthorization(params, options);
    const reverificationAuthorization = checkReverificationAuthorization(params, options);
    if ([billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === null)) return [billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === true);
    return [billingAuthorization || orgAuthorization, reverificationAuthorization].every((a) => a === true);
  };
};
const resolveAuthState = ({ authObject: { sessionId, sessionStatus, userId, actor, orgId, orgRole, orgSlug, signOut, getToken, has: has2, sessionClaims }, options: { treatPendingAsSignedOut = true } }) => {
  if (sessionId === void 0 && userId === void 0) return {
    isLoaded: false,
    isSignedIn: void 0,
    sessionId,
    sessionClaims: void 0,
    userId,
    actor: void 0,
    orgId: void 0,
    orgRole: void 0,
    orgSlug: void 0,
    has: void 0,
    signOut,
    getToken
  };
  if (sessionId === null && userId === null) return {
    isLoaded: true,
    isSignedIn: false,
    sessionId,
    userId,
    sessionClaims: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: () => false,
    signOut,
    getToken
  };
  if (treatPendingAsSignedOut && sessionStatus === "pending") return {
    isLoaded: true,
    isSignedIn: false,
    sessionId: null,
    userId: null,
    sessionClaims: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: () => false,
    signOut,
    getToken
  };
  if (!!sessionId && !!sessionClaims && !!userId && !!orgId && !!orgRole) return {
    isLoaded: true,
    isSignedIn: true,
    sessionId,
    sessionClaims,
    userId,
    actor: actor || null,
    orgId,
    orgRole,
    orgSlug: orgSlug || null,
    has: has2,
    signOut,
    getToken
  };
  if (!!sessionId && !!sessionClaims && !!userId && !orgId) return {
    isLoaded: true,
    isSignedIn: true,
    sessionId,
    sessionClaims,
    userId,
    actor: actor || null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: has2,
    signOut,
    getToken
  };
};
const DEV_OR_STAGING_SUFFIXES = [
  ".lcl.dev",
  ".stg.dev",
  ".lclstage.dev",
  ".stgstage.dev",
  ".dev.lclclerk.com",
  ".stg.lclclerk.com",
  ".accounts.lclclerk.com",
  "accountsstage.dev",
  "accounts.dev"
];
const isomorphicAtob = (data) => {
  if (typeof atob !== "undefined" && typeof atob === "function") return atob(data);
  else if (typeof global !== "undefined" && global.Buffer) return new global.Buffer(data, "base64").toString();
  return data;
};
const PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
const PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
function isValidDecodedPublishableKey(decoded) {
  if (!decoded.endsWith("$")) return false;
  const withoutTrailing = decoded.slice(0, -1);
  if (withoutTrailing.includes("$")) return false;
  return withoutTrailing.includes(".");
}
function parsePublishableKey(key, options = {}) {
  key = key || "";
  if (!key || !isPublishableKey(key)) {
    if (options.fatal && !key) throw new Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");
    if (options.fatal && !isPublishableKey(key)) throw new Error("Publishable key not valid.");
    return null;
  }
  const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
  let decodedFrontendApi;
  try {
    decodedFrontendApi = isomorphicAtob(key.split("_")[2]);
  } catch {
    if (options.fatal) throw new Error("Publishable key not valid: Failed to decode key.");
    return null;
  }
  if (!isValidDecodedPublishableKey(decodedFrontendApi)) {
    if (options.fatal) throw new Error("Publishable key not valid: Decoded key has invalid format.");
    return null;
  }
  let frontendApi = decodedFrontendApi.slice(0, -1);
  if (options.proxyUrl) frontendApi = options.proxyUrl;
  else if (instanceType !== "development" && options.domain && options.isSatellite) frontendApi = `clerk.${options.domain}`;
  return {
    instanceType,
    frontendApi
  };
}
function isPublishableKey(key = "") {
  try {
    if (!(key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX))) return false;
    const parts = key.split("_");
    if (parts.length !== 3) return false;
    const encodedPart = parts[2];
    if (!encodedPart) return false;
    return isValidDecodedPublishableKey(isomorphicAtob(encodedPart));
  } catch {
    return false;
  }
}
function createDevOrStagingUrlCache() {
  const devOrStagingUrlCache = /* @__PURE__ */ new Map();
  return { isDevOrStagingUrl: (url) => {
    if (!url) return false;
    const hostname = typeof url === "string" ? url : url.hostname;
    let res = devOrStagingUrlCache.get(hostname);
    if (res === void 0) {
      res = DEV_OR_STAGING_SUFFIXES.some((s) => hostname.endsWith(s));
      devOrStagingUrlCache.set(hostname, res);
    }
    return res;
  } };
}
const EVENT_METHOD_CALLED = "METHOD_CALLED";
const EVENT_SAMPLING_RATE$2 = 0.1;
function eventMethodCalled(method, payload) {
  return {
    event: EVENT_METHOD_CALLED,
    eventSamplingRate: EVENT_SAMPLING_RATE$2,
    payload: {
      method,
      ...payload
    }
  };
}
const REVERIFICATION_REASON = "reverification-error";
const reverificationError = (missingConfig) => ({ clerk_error: {
  type: "forbidden",
  reason: REVERIFICATION_REASON,
  metadata: { reverification: missingConfig }
} });
const isReverificationHint = (result) => {
  return result && typeof result === "object" && "clerk_error" in result && result.clerk_error?.type === "forbidden" && result.clerk_error?.reason === REVERIFICATION_REASON;
};
const noop = (..._args) => {
};
const createDeferredPromise = () => {
  let resolve = noop;
  let reject = noop;
  return {
    promise: new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    }),
    resolve,
    reject
  };
};
function getCurrentOrganizationMembership(organizationMemberships, organizationId) {
  return organizationMemberships.find((organizationMembership) => organizationMembership.organization.id === organizationId);
}
var has = Object.prototype.hasOwnProperty;
function find(iter, tar, key) {
  for (key of iter.keys()) {
    if (dequal(key, tar)) return key;
  }
}
function dequal(foo, bar) {
  var ctor, len, tmp;
  if (foo === bar) return true;
  if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
    if (ctor === Date) return foo.getTime() === bar.getTime();
    if (ctor === RegExp) return foo.toString() === bar.toString();
    if (ctor === Array) {
      if ((len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len])) ;
      }
      return len === -1;
    }
    if (ctor === Set) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (len of foo) {
        tmp = len;
        if (tmp && typeof tmp === "object") {
          tmp = find(bar, tmp);
          if (!tmp) return false;
        }
        if (!bar.has(tmp)) return false;
      }
      return true;
    }
    if (ctor === Map) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (len of foo) {
        tmp = len[0];
        if (tmp && typeof tmp === "object") {
          tmp = find(bar, tmp);
          if (!tmp) return false;
        }
        if (!dequal(len[1], bar.get(tmp))) {
          return false;
        }
      }
      return true;
    }
    if (ctor === ArrayBuffer) {
      foo = new Uint8Array(foo);
      bar = new Uint8Array(bar);
    } else if (ctor === DataView) {
      if ((len = foo.byteLength) === bar.byteLength) {
        while (len-- && foo.getInt8(len) === bar.getInt8(len)) ;
      }
      return len === -1;
    }
    if (ArrayBuffer.isView(foo)) {
      if ((len = foo.byteLength) === bar.byteLength) {
        while (len-- && foo[len] === bar[len]) ;
      }
      return len === -1;
    }
    if (!ctor || typeof foo === "object") {
      len = 0;
      for (ctor in foo) {
        if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
        if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
      }
      return Object.keys(bar).length === len;
    }
  }
  return foo !== foo && bar !== bar;
}
function assertContextExists(contextVal, msgOrCtx) {
  if (!contextVal) throw typeof msgOrCtx === "string" ? new Error(msgOrCtx) : /* @__PURE__ */ new Error(`${msgOrCtx.displayName} not found`);
}
const createContextAndHook = (displayName, options) => {
  const { assertCtxFn = assertContextExists } = {};
  const Ctx = React7.createContext(void 0);
  Ctx.displayName = displayName;
  const useCtx = () => {
    const ctx = React7.useContext(Ctx);
    assertCtxFn(ctx, `${displayName} not found`);
    return ctx.value;
  };
  const useCtxWithoutGuarantee = () => {
    const ctx = React7.useContext(Ctx);
    return ctx ? ctx.value : {};
  };
  return [
    Ctx,
    useCtx,
    useCtxWithoutGuarantee
  ];
};
function SWRConfigCompat({ swrConfig, children }) {
  return /* @__PURE__ */ React7.createElement(SWRConfig, { value: swrConfig }, children);
}
const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook("ClerkInstanceContext");
const [UserContext, useUserContext] = createContextAndHook("UserContext");
const [ClientContext, useClientContext] = createContextAndHook("ClientContext");
const [SessionContext, useSessionContext] = createContextAndHook("SessionContext");
React7.createContext({});
const [CheckoutContext, useCheckoutContext] = createContextAndHook("CheckoutContext");
const __experimental_CheckoutProvider = ({ children, ...rest }) => {
  return /* @__PURE__ */ React7.createElement(CheckoutContext.Provider, { value: { value: rest } }, children);
};
const [OrganizationContextInternal, useOrganizationContext] = createContextAndHook("OrganizationContext");
const OrganizationProvider = ({ children, organization, swrConfig }) => {
  return /* @__PURE__ */ React7.createElement(SWRConfigCompat, { swrConfig }, /* @__PURE__ */ React7.createElement(OrganizationContextInternal.Provider, { value: { value: { organization } } }, children));
};
function useAssertWrappedByClerkProvider$1(displayNameOrFn) {
  if (!React7.useContext(ClerkInstanceContext)) {
    if (typeof displayNameOrFn === "function") {
      displayNameOrFn();
      return;
    }
    throw new Error(`${displayNameOrFn} can only be used within the <ClerkProvider /> component.

Possible fixes:
1. Ensure that the <ClerkProvider /> is correctly wrapping your application where this component is used.
2. Check for multiple versions of the \`@clerk/shared\` package in your project. Use a tool like \`npm ls @clerk/shared\` to identify multiple versions, and update your dependencies to only rely on one.

Learn more: https://clerk.com/docs/components/clerk-provider`.trim());
  }
}
const USER_MEMBERSHIPS_KEY = "userMemberships";
const USER_INVITATIONS_KEY = "userInvitations";
const USER_SUGGESTIONS_KEY = "userSuggestions";
const DOMAINS_KEY = "domains";
const MEMBERSHIP_REQUESTS_KEY = "membershipRequests";
const MEMBERSHIPS_KEY = "memberships";
const INVITATIONS_KEY = "invitations";
const ORGANIZATION_CREATION_DEFAULTS_KEY = "organizationCreationDefaults";
const STABLE_KEYS = {
  USER_MEMBERSHIPS_KEY,
  USER_INVITATIONS_KEY,
  USER_SUGGESTIONS_KEY,
  DOMAINS_KEY,
  MEMBERSHIP_REQUESTS_KEY,
  MEMBERSHIPS_KEY,
  INVITATIONS_KEY,
  ORGANIZATION_CREATION_DEFAULTS_KEY
};
function createCacheKeys(params) {
  return {
    queryKey: [
      params.stablePrefix,
      params.authenticated,
      params.tracked,
      params.untracked
    ],
    invalidationKey: [
      params.stablePrefix,
      params.authenticated,
      params.tracked
    ],
    stableKey: params.stablePrefix,
    authenticated: params.authenticated
  };
}
function toSWRQuery(keys) {
  const { queryKey } = keys;
  return {
    type: queryKey[0],
    ...queryKey[2],
    ...queryKey[3].args
  };
}
const useWithSafeValues = (params, defaultValues) => {
  const shouldUseDefaults = typeof params === "boolean" && params;
  const initialPageRef = useRef(shouldUseDefaults ? defaultValues.initialPage : params?.initialPage ?? defaultValues.initialPage);
  const pageSizeRef = useRef(shouldUseDefaults ? defaultValues.pageSize : params?.pageSize ?? defaultValues.pageSize);
  const newObj = {};
  for (const key of Object.keys(defaultValues)) newObj[key] = shouldUseDefaults ? defaultValues[key] : params?.[key] ?? defaultValues[key];
  return {
    ...newObj,
    initialPage: initialPageRef.current,
    pageSize: pageSizeRef.current
  };
};
function getDifferentKeys(obj1, obj2) {
  const keysSet = new Set(Object.keys(obj2));
  const differentKeysObject = {};
  for (const key1 of Object.keys(obj1)) if (!keysSet.has(key1)) differentKeysObject[key1] = obj1[key1];
  return differentKeysObject;
}
function usePreviousValue(value) {
  const currentRef = useRef(value);
  const previousRef = useRef(null);
  if (currentRef.current !== value) {
    previousRef.current = currentRef.current;
    currentRef.current = value;
  }
  return previousRef.current;
}
const cachingSWROptions = {
  dedupingInterval: 1e3 * 60,
  focusThrottleInterval: 1e3 * 60 * 2
};
const cachingSWRInfiniteOptions = {
  ...cachingSWROptions,
  revalidateFirstPage: false
};
const usePagesOrInfinite = (params) => {
  const { fetcher, config, keys } = params;
  const [paginatedPage, setPaginatedPage] = useState(config.initialPage ?? 1);
  const initialPageRef = useRef(config.initialPage ?? 1);
  const pageSizeRef = useRef(config.pageSize ?? 10);
  const enabled = config.enabled ?? true;
  const cacheMode = config.__experimental_mode === "cache";
  const triggerInfinite = config.infinite ?? false;
  const keepPreviousData = config.keepPreviousData ?? false;
  const isSignedIn = config.isSignedIn;
  const pagesCacheKey = {
    ...toSWRQuery(keys),
    initialPage: paginatedPage,
    pageSize: pageSizeRef.current
  };
  const previousIsSignedIn = usePreviousValue(isSignedIn);
  const shouldFetch = !triggerInfinite && enabled && (!cacheMode ? !!fetcher : true);
  const { data: swrData, isValidating: swrIsValidating, isLoading: swrIsLoading, error: swrError, mutate: swrMutate } = useSWR(typeof isSignedIn === "boolean" ? previousIsSignedIn === true && isSignedIn === false ? pagesCacheKey : isSignedIn ? shouldFetch ? pagesCacheKey : null : null : shouldFetch ? pagesCacheKey : null, !cacheMode && !!fetcher ? (cacheKeyParams) => {
    if (isSignedIn === false || shouldFetch === false) return null;
    return fetcher(getDifferentKeys(cacheKeyParams, {
      type: keys.queryKey[0],
      ...keys.queryKey[2]
    }));
  } : null, {
    keepPreviousData,
    ...cachingSWROptions
  });
  const { data: swrInfiniteData, isLoading: swrInfiniteIsLoading, isValidating: swrInfiniteIsValidating, error: swrInfiniteError, size, setSize, mutate: swrInfiniteMutate } = useSWRInfinite((pageIndex) => {
    if (!triggerInfinite || !enabled || isSignedIn === false) return null;
    return {
      ...toSWRQuery(keys),
      initialPage: initialPageRef.current + pageIndex,
      pageSize: pageSizeRef.current
    };
  }, (cacheKeyParams) => {
    const requestParams = getDifferentKeys(cacheKeyParams, {
      type: keys.queryKey[0],
      ...keys.queryKey[2]
    });
    return fetcher?.(requestParams);
  }, cachingSWRInfiniteOptions);
  const page = useMemo(() => {
    if (triggerInfinite) return size;
    return paginatedPage;
  }, [
    triggerInfinite,
    size,
    paginatedPage
  ]);
  const fetchPage = useCallback((numberOrgFn) => {
    if (triggerInfinite) {
      setSize(numberOrgFn);
      return;
    }
    return setPaginatedPage(numberOrgFn);
  }, [setSize, triggerInfinite]);
  const data = useMemo(() => {
    if (triggerInfinite) return swrInfiniteData?.map((a) => a?.data).flat() ?? [];
    return swrData?.data ?? [];
  }, [
    triggerInfinite,
    swrData,
    swrInfiniteData
  ]);
  const count = useMemo(() => {
    if (triggerInfinite) return swrInfiniteData?.[swrInfiniteData?.length - 1]?.total_count || 0;
    return swrData?.total_count ?? 0;
  }, [
    triggerInfinite,
    swrData,
    swrInfiniteData
  ]);
  const isLoading = triggerInfinite ? swrInfiniteIsLoading : swrIsLoading;
  const isFetching = triggerInfinite ? swrInfiniteIsValidating : swrIsValidating;
  const error = (triggerInfinite ? swrInfiniteError : swrError) ?? null;
  const isError = !!error;
  const fetchNext = useCallback(() => {
    fetchPage((n) => Math.max(0, n + 1));
  }, [fetchPage]);
  const fetchPrevious = useCallback(() => {
    fetchPage((n) => Math.max(0, n - 1));
  }, [fetchPage]);
  const offsetCount = (initialPageRef.current - 1) * pageSizeRef.current;
  return {
    data,
    count,
    error,
    isLoading,
    isFetching,
    isError,
    page,
    pageCount: Math.ceil((count - offsetCount) / pageSizeRef.current),
    fetchPage,
    fetchNext,
    fetchPrevious,
    hasNextPage: count - offsetCount * pageSizeRef.current > page * pageSizeRef.current,
    hasPreviousPage: (page - 1) * pageSizeRef.current > offsetCount * pageSizeRef.current,
    revalidate: triggerInfinite ? () => swrInfiniteMutate() : () => swrMutate(),
    setData: triggerInfinite ? (value) => swrInfiniteMutate(value, { revalidate: false }) : (value) => swrMutate(value, { revalidate: false })
  };
};
const useClerk = () => {
  useAssertWrappedByClerkProvider$1("useClerk");
  return useClerkInstanceContext();
};
function useAttemptToEnableOrganizations(caller) {
  const clerk = useClerk();
  const hasAttempted = useRef(false);
  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;
    clerk.__internal_attemptToEnableEnvironmentSetting?.({
      for: "organizations",
      caller
    });
  }, [clerk, caller]);
}
const undefinedPaginatedResource$1 = {
  data: void 0,
  count: void 0,
  error: void 0,
  isLoading: false,
  isFetching: false,
  isError: false,
  page: void 0,
  pageCount: void 0,
  fetchPage: void 0,
  fetchNext: void 0,
  fetchPrevious: void 0,
  hasNextPage: false,
  hasPreviousPage: false,
  revalidate: void 0,
  setData: void 0
};
function useOrganization(params) {
  const { domains: domainListParams, membershipRequests: membershipRequestsListParams, memberships: membersListParams, invitations: invitationsListParams } = params || {};
  useAssertWrappedByClerkProvider$1("useOrganization");
  useAttemptToEnableOrganizations("useOrganization");
  const { organization } = useOrganizationContext();
  const session = useSessionContext();
  const domainSafeValues = useWithSafeValues(domainListParams, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
    enrollmentMode: void 0
  });
  const membershipRequestSafeValues = useWithSafeValues(membershipRequestsListParams, {
    initialPage: 1,
    pageSize: 10,
    status: "pending",
    keepPreviousData: false,
    infinite: false
  });
  const membersSafeValues = useWithSafeValues(membersListParams, {
    initialPage: 1,
    pageSize: 10,
    role: void 0,
    keepPreviousData: false,
    infinite: false,
    query: void 0
  });
  const invitationsSafeValues = useWithSafeValues(invitationsListParams, {
    initialPage: 1,
    pageSize: 10,
    status: ["pending"],
    keepPreviousData: false,
    infinite: false
  });
  const clerk = useClerkInstanceContext();
  clerk.telemetry?.record(eventMethodCalled("useOrganization"));
  const domainParams = typeof domainListParams === "undefined" ? void 0 : {
    initialPage: domainSafeValues.initialPage,
    pageSize: domainSafeValues.pageSize,
    enrollmentMode: domainSafeValues.enrollmentMode
  };
  const membershipRequestParams = typeof membershipRequestsListParams === "undefined" ? void 0 : {
    initialPage: membershipRequestSafeValues.initialPage,
    pageSize: membershipRequestSafeValues.pageSize,
    status: membershipRequestSafeValues.status
  };
  const membersParams = typeof membersListParams === "undefined" ? void 0 : {
    initialPage: membersSafeValues.initialPage,
    pageSize: membersSafeValues.pageSize,
    role: membersSafeValues.role,
    query: membersSafeValues.query
  };
  const invitationsParams = typeof invitationsListParams === "undefined" ? void 0 : {
    initialPage: invitationsSafeValues.initialPage,
    pageSize: invitationsSafeValues.pageSize,
    status: invitationsSafeValues.status
  };
  const domains = usePagesOrInfinite({
    fetcher: organization?.getDomains,
    config: {
      keepPreviousData: domainSafeValues.keepPreviousData,
      infinite: domainSafeValues.infinite,
      enabled: !!domainParams,
      isSignedIn: Boolean(organization),
      initialPage: domainSafeValues.initialPage,
      pageSize: domainSafeValues.pageSize
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.DOMAINS_KEY,
      authenticated: Boolean(organization),
      tracked: { organizationId: organization?.id },
      untracked: { args: domainParams }
    })
  });
  const membershipRequests = usePagesOrInfinite({
    fetcher: organization?.getMembershipRequests,
    config: {
      keepPreviousData: membershipRequestSafeValues.keepPreviousData,
      infinite: membershipRequestSafeValues.infinite,
      enabled: !!membershipRequestParams,
      isSignedIn: Boolean(organization),
      initialPage: membershipRequestSafeValues.initialPage,
      pageSize: membershipRequestSafeValues.pageSize
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.MEMBERSHIP_REQUESTS_KEY,
      authenticated: Boolean(organization),
      tracked: { organizationId: organization?.id },
      untracked: { args: membershipRequestParams }
    })
  });
  const memberships = usePagesOrInfinite({
    fetcher: organization?.getMemberships,
    config: {
      keepPreviousData: membersSafeValues.keepPreviousData,
      infinite: membersSafeValues.infinite,
      enabled: !!membersParams,
      isSignedIn: Boolean(organization),
      initialPage: membersSafeValues.initialPage,
      pageSize: membersSafeValues.pageSize
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.MEMBERSHIPS_KEY,
      authenticated: Boolean(organization),
      tracked: { organizationId: organization?.id },
      untracked: { args: membersParams }
    })
  });
  const invitations = usePagesOrInfinite({
    fetcher: organization?.getInvitations,
    config: {
      keepPreviousData: invitationsSafeValues.keepPreviousData,
      infinite: invitationsSafeValues.infinite,
      enabled: !!invitationsParams,
      isSignedIn: Boolean(organization),
      initialPage: invitationsSafeValues.initialPage,
      pageSize: invitationsSafeValues.pageSize
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.INVITATIONS_KEY,
      authenticated: Boolean(organization),
      tracked: { organizationId: organization?.id },
      untracked: { args: invitationsParams }
    })
  });
  if (organization === void 0) return {
    isLoaded: false,
    organization: void 0,
    membership: void 0,
    domains: undefinedPaginatedResource$1,
    membershipRequests: undefinedPaginatedResource$1,
    memberships: undefinedPaginatedResource$1,
    invitations: undefinedPaginatedResource$1
  };
  if (organization === null) return {
    isLoaded: true,
    organization: null,
    membership: null,
    domains: null,
    membershipRequests: null,
    memberships: null,
    invitations: null
  };
  if (!clerk.loaded && organization) return {
    isLoaded: true,
    organization,
    membership: void 0,
    domains: undefinedPaginatedResource$1,
    membershipRequests: undefinedPaginatedResource$1,
    memberships: undefinedPaginatedResource$1,
    invitations: undefinedPaginatedResource$1
  };
  return {
    isLoaded: clerk.loaded,
    organization,
    membership: getCurrentOrganizationMembership(session.user.organizationMemberships, organization.id),
    domains,
    membershipRequests,
    memberships,
    invitations
  };
}
function useOrganizationCreationDefaultsCacheKeys(params) {
  const { userId } = params;
  return useMemo(() => {
    return createCacheKeys({
      stablePrefix: STABLE_KEYS.ORGANIZATION_CREATION_DEFAULTS_KEY,
      authenticated: Boolean(userId),
      tracked: { userId: userId ?? null },
      untracked: { args: {} }
    });
  }, [userId]);
}
function useOrganizationCreationDefaultsHook(params = {}) {
  const { keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const featureEnabled = clerk.__unstable__environment?.organizationSettings?.organizationCreationDefaults?.enabled ?? false;
  clerk.telemetry?.record(eventMethodCalled("useOrganizationCreationDefaults"));
  const { queryKey } = useOrganizationCreationDefaultsCacheKeys({ userId: user?.id ?? null });
  const swr = useSWR(Boolean(user) && enabled && featureEnabled && clerk.loaded ? queryKey : null, () => {
    if (!user) throw new Error("User is required to fetch organization creation defaults");
    return user.getOrganizationCreationDefaults();
  }, {
    dedupingInterval: 1e3 * 60,
    keepPreviousData
  });
  return {
    data: swr.data,
    error: swr.error ?? null,
    isLoading: swr.isLoading,
    isFetching: swr.isValidating
  };
}
const undefinedPaginatedResource = {
  data: void 0,
  count: void 0,
  error: void 0,
  isLoading: false,
  isFetching: false,
  isError: false,
  page: void 0,
  pageCount: void 0,
  fetchPage: void 0,
  fetchNext: void 0,
  fetchPrevious: void 0,
  hasNextPage: false,
  hasPreviousPage: false,
  revalidate: void 0,
  setData: void 0
};
function useOrganizationList(params) {
  const { userMemberships, userInvitations, userSuggestions } = params || {};
  useAssertWrappedByClerkProvider$1("useOrganizationList");
  useAttemptToEnableOrganizations("useOrganizationList");
  const userMembershipsSafeValues = useWithSafeValues(userMemberships, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false
  });
  const userInvitationsSafeValues = useWithSafeValues(userInvitations, {
    initialPage: 1,
    pageSize: 10,
    status: "pending",
    keepPreviousData: false,
    infinite: false
  });
  const userSuggestionsSafeValues = useWithSafeValues(userSuggestions, {
    initialPage: 1,
    pageSize: 10,
    status: "pending",
    keepPreviousData: false,
    infinite: false
  });
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  clerk.telemetry?.record(eventMethodCalled("useOrganizationList"));
  const userMembershipsParams = typeof userMemberships === "undefined" ? void 0 : {
    initialPage: userMembershipsSafeValues.initialPage,
    pageSize: userMembershipsSafeValues.pageSize
  };
  const userInvitationsParams = typeof userInvitations === "undefined" ? void 0 : {
    initialPage: userInvitationsSafeValues.initialPage,
    pageSize: userInvitationsSafeValues.pageSize,
    status: userInvitationsSafeValues.status
  };
  const userSuggestionsParams = typeof userSuggestions === "undefined" ? void 0 : {
    initialPage: userSuggestionsSafeValues.initialPage,
    pageSize: userSuggestionsSafeValues.pageSize,
    status: userSuggestionsSafeValues.status
  };
  const isClerkLoaded = !!(clerk.loaded && user);
  const memberships = usePagesOrInfinite({
    fetcher: user?.getOrganizationMemberships,
    config: {
      keepPreviousData: userMembershipsSafeValues.keepPreviousData,
      infinite: userMembershipsSafeValues.infinite,
      enabled: !!userMembershipsParams,
      isSignedIn: Boolean(user),
      initialPage: userMembershipsSafeValues.initialPage,
      pageSize: userMembershipsSafeValues.pageSize
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.USER_MEMBERSHIPS_KEY,
      authenticated: Boolean(user),
      tracked: { userId: user?.id },
      untracked: { args: userMembershipsParams }
    })
  });
  const invitations = usePagesOrInfinite({
    fetcher: user?.getOrganizationInvitations,
    config: {
      keepPreviousData: userInvitationsSafeValues.keepPreviousData,
      infinite: userInvitationsSafeValues.infinite,
      enabled: !!userInvitationsParams,
      isSignedIn: Boolean(user),
      initialPage: userInvitationsSafeValues.initialPage,
      pageSize: userInvitationsSafeValues.pageSize
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.USER_INVITATIONS_KEY,
      authenticated: Boolean(user),
      tracked: { userId: user?.id },
      untracked: { args: userInvitationsParams }
    })
  });
  const suggestions = usePagesOrInfinite({
    fetcher: user?.getOrganizationSuggestions,
    config: {
      keepPreviousData: userSuggestionsSafeValues.keepPreviousData,
      infinite: userSuggestionsSafeValues.infinite,
      enabled: !!userSuggestionsParams,
      isSignedIn: Boolean(user),
      initialPage: userSuggestionsSafeValues.initialPage,
      pageSize: userSuggestionsSafeValues.pageSize
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.USER_SUGGESTIONS_KEY,
      authenticated: Boolean(user),
      tracked: { userId: user?.id },
      untracked: { args: userSuggestionsParams }
    })
  });
  if (!isClerkLoaded) return {
    isLoaded: false,
    createOrganization: void 0,
    setActive: void 0,
    userMemberships: undefinedPaginatedResource,
    userInvitations: undefinedPaginatedResource,
    userSuggestions: undefinedPaginatedResource
  };
  return {
    isLoaded: isClerkLoaded,
    setActive: clerk.setActive,
    createOrganization: clerk.createOrganization,
    userMemberships: memberships,
    userInvitations: invitations,
    userSuggestions: suggestions
  };
}
const useSafeLayoutEffect = typeof window !== "undefined" ? React7.useLayoutEffect : React7.useEffect;
const hookName$3 = `useSession`;
const useSession = () => {
  useAssertWrappedByClerkProvider$1(hookName$3);
  const session = useSessionContext();
  const clerk = useClerkInstanceContext();
  clerk.telemetry?.record(eventMethodCalled(hookName$3));
  if (session === void 0) return {
    isLoaded: false,
    isSignedIn: void 0,
    session: void 0
  };
  if (session === null) return {
    isLoaded: true,
    isSignedIn: false,
    session: null
  };
  return {
    isLoaded: true,
    isSignedIn: clerk.isSignedIn,
    session
  };
};
const hookName$2 = "useSessionList";
const useSessionList = () => {
  useAssertWrappedByClerkProvider$1(hookName$2);
  const isomorphicClerk = useClerkInstanceContext();
  const client = useClientContext();
  useClerkInstanceContext().telemetry?.record(eventMethodCalled(hookName$2));
  if (!client) return {
    isLoaded: false,
    sessions: void 0,
    setActive: void 0
  };
  return {
    isLoaded: true,
    sessions: client.sessions,
    setActive: isomorphicClerk.setActive
  };
};
const hookName$1 = "useUser";
function useUser() {
  useAssertWrappedByClerkProvider$1(hookName$1);
  const user = useUserContext();
  useClerkInstanceContext().telemetry?.record(eventMethodCalled(hookName$1));
  if (user === void 0) return {
    isLoaded: false,
    isSignedIn: void 0,
    user: void 0
  };
  if (user === null) return {
    isLoaded: true,
    isSignedIn: false,
    user: null
  };
  return {
    isLoaded: true,
    isSignedIn: true,
    user
  };
}
const isDeeplyEqual = dequal;
const CLERK_API_REVERIFICATION_ERROR_CODE = "session_reverification_required";
async function resolveResult(result) {
  try {
    const r = await result;
    if (r instanceof Response) return r.json();
    return r;
  } catch (e) {
    if (isClerkAPIResponseError(e) && e.errors.find(({ code }) => code === CLERK_API_REVERIFICATION_ERROR_CODE)) return reverificationError();
    throw e;
  }
}
function createReverificationHandler(params) {
  function assertReverification(fetcher) {
    return (async (...args) => {
      let result = await resolveResult(fetcher(...args));
      if (isReverificationHint(result)) {
        const resolvers = createDeferredPromise();
        const isValidMetadata = validateReverificationConfig(result.clerk_error.metadata?.reverification);
        const level = isValidMetadata ? isValidMetadata().level : void 0;
        const cancel = () => {
          resolvers.reject(new ClerkRuntimeError("User cancelled attempted verification", { code: "reverification_cancelled" }));
        };
        const complete = () => {
          resolvers.resolve(true);
        };
        if (params.onNeedsReverification === void 0)
          params.openUIComponent?.({
            level,
            afterVerification: complete,
            afterVerificationCancelled: cancel
          });
        else params.onNeedsReverification({
          cancel,
          complete,
          level
        });
        await resolvers.promise;
        result = await resolveResult(fetcher(...args));
      }
      return result;
    });
  }
  return assertReverification;
}
const useReverification = (fetcher, options) => {
  const { __internal_openReverification, telemetry } = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);
  telemetry?.record(eventMethodCalled("useReverification", { onNeedsReverification: Boolean(options?.onNeedsReverification) }));
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  });
  return useCallback((...args) => {
    return createReverificationHandler({
      openUIComponent: __internal_openReverification,
      telemetry,
      ...optionsRef.current
    })(fetcherRef.current)(...args);
  }, [__internal_openReverification, telemetry]);
};
const useCheckout = (options) => {
  const contextOptions = useCheckoutContext();
  const { for: forOrganization, planId, planPeriod } = options || contextOptions;
  const clerk = useClerk();
  const { organization } = useOrganizationContext();
  const { isLoaded, user } = useUser();
  if (!isLoaded) throw new Error("Clerk: Ensure that `useCheckout` is inside a component wrapped with `<ClerkLoaded />`.");
  if (!user) throw new Error("Clerk: Ensure that `useCheckout` is inside a component wrapped with `<SignedIn />`.");
  if (forOrganization === "organization" && !organization) throw new Error("Clerk: Ensure your flow checks for an active organization. Retrieve `orgId` from `useAuth()` and confirm it is defined. For SSR, see: https://clerk.com/docs/reference/backend/types/auth-object#how-to-access-the-auth-object");
  const manager = useMemo(() => clerk.__experimental_checkout({
    planId,
    planPeriod,
    for: forOrganization
  }), [
    user.id,
    organization?.id,
    planId,
    planPeriod,
    forOrganization
  ]);
  const managerProperties = useSyncExternalStore((cb) => manager.subscribe(cb), () => manager.getState(), () => manager.getState());
  return { checkout: {
    ...useMemo(() => {
      if (!managerProperties.checkout) return {
        id: null,
        externalClientSecret: null,
        externalGatewayId: null,
        totals: null,
        isImmediatePlanChange: null,
        planPeriod: null,
        plan: null,
        paymentMethod: null,
        freeTrialEndsAt: null,
        payer: null,
        needsPaymentMethod: null,
        planPeriodStart: null
      };
      const { reload, confirm, pathRoot, ...rest } = managerProperties.checkout;
      return rest;
    }, [managerProperties.checkout]),
    getState: manager.getState,
    start: manager.start,
    confirm: manager.confirm,
    clear: manager.clear,
    finalize: manager.finalize,
    isStarting: managerProperties.isStarting,
    isConfirming: managerProperties.isConfirming,
    error: managerProperties.error,
    status: managerProperties.status,
    fetchStatus: managerProperties.fetchStatus
  } };
};
const usePrevious = (value) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
const useAttachEvent = (element, event, cb) => {
  const cbDefined = !!cb;
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);
  useEffect(() => {
    if (!cbDefined || !element) return () => {
    };
    const decoratedCb = (...args) => {
      if (cbRef.current) cbRef.current(...args);
    };
    element.on(event, decoratedCb);
    return () => {
      element.off(event, decoratedCb);
    };
  }, [
    cbDefined,
    event,
    element,
    cbRef
  ]);
};
const ElementsContext = React7.createContext(null);
ElementsContext.displayName = "ElementsContext";
const parseElementsContext = (ctx, useCase) => {
  if (!ctx) throw new Error(`Could not find Elements context; You need to wrap the part of your app that ${useCase} in an <Elements> provider.`);
  return ctx;
};
const Elements = (({ stripe: rawStripeProp, options, children }) => {
  const parsed = React7.useMemo(() => parseStripeProp(rawStripeProp), [rawStripeProp]);
  const [ctx, setContext] = React7.useState(() => ({
    stripe: parsed.tag === "sync" ? parsed.stripe : null,
    elements: parsed.tag === "sync" ? parsed.stripe.elements(options) : null
  }));
  React7.useEffect(() => {
    let isMounted = true;
    const safeSetContext = (stripe) => {
      setContext((ctx$1) => {
        if (ctx$1.stripe) return ctx$1;
        return {
          stripe,
          elements: stripe.elements(options)
        };
      });
    };
    if (parsed.tag === "async" && !ctx.stripe) parsed.stripePromise.then((stripe) => {
      if (stripe && isMounted) safeSetContext(stripe);
    });
    else if (parsed.tag === "sync" && !ctx.stripe) safeSetContext(parsed.stripe);
    return () => {
      isMounted = false;
    };
  }, [
    parsed,
    ctx,
    options
  ]);
  const prevStripe = usePrevious(rawStripeProp);
  React7.useEffect(() => {
    if (prevStripe !== null && prevStripe !== rawStripeProp) console.warn("Unsupported prop change on Elements: You cannot change the `stripe` prop after setting it.");
  }, [prevStripe, rawStripeProp]);
  const prevOptions = usePrevious(options);
  React7.useEffect(() => {
    if (!ctx.elements) return;
    const updates = extractAllowedOptionsUpdates(options, prevOptions, ["clientSecret", "fonts"]);
    if (updates) ctx.elements.update(updates);
  }, [
    options,
    prevOptions,
    ctx.elements
  ]);
  return /* @__PURE__ */ React7.createElement(ElementsContext.Provider, { value: ctx }, children);
});
const useElementsContextWithUseCase = (useCaseMessage) => {
  return parseElementsContext(React7.useContext(ElementsContext), useCaseMessage);
};
const useElements = () => {
  const { elements } = useElementsContextWithUseCase("calls useElements()");
  return elements;
};
const INVALID_STRIPE_ERROR = "Invalid prop `stripe` supplied to `Elements`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.";
const validateStripe = (maybeStripe, errorMsg = INVALID_STRIPE_ERROR) => {
  if (maybeStripe === null || isStripe(maybeStripe)) return maybeStripe;
  throw new Error(errorMsg);
};
const parseStripeProp = (raw, errorMsg = INVALID_STRIPE_ERROR) => {
  if (isPromise(raw)) return {
    tag: "async",
    stripePromise: Promise.resolve(raw).then((result) => validateStripe(result, errorMsg))
  };
  const stripe = validateStripe(raw, errorMsg);
  if (stripe === null) return { tag: "empty" };
  return {
    tag: "sync",
    stripe
  };
};
const isUnknownObject = (raw) => {
  return raw !== null && typeof raw === "object";
};
const isPromise = (raw) => {
  return isUnknownObject(raw) && typeof raw.then === "function";
};
const isStripe = (raw) => {
  return isUnknownObject(raw) && typeof raw.elements === "function" && typeof raw.createToken === "function" && typeof raw.createPaymentMethod === "function" && typeof raw.confirmCardPayment === "function";
};
const extractAllowedOptionsUpdates = (options, prevOptions, immutableKeys) => {
  if (!isUnknownObject(options)) return null;
  return Object.keys(options).reduce((newOptions, key) => {
    const isUpdated = !isUnknownObject(prevOptions) || !isEqual(options[key], prevOptions[key]);
    if (immutableKeys.includes(key)) {
      if (isUpdated) console.warn(`Unsupported prop change: options.${key} is not a mutable property.`);
      return newOptions;
    }
    if (!isUpdated) return newOptions;
    return {
      ...newOptions || {},
      [key]: options[key]
    };
  }, null);
};
const PLAIN_OBJECT_STR = "[object Object]";
const isEqual = (left, right) => {
  if (!isUnknownObject(left) || !isUnknownObject(right)) return left === right;
  const leftArray = Array.isArray(left);
  if (leftArray !== Array.isArray(right)) return false;
  const leftPlainObject = Object.prototype.toString.call(left) === PLAIN_OBJECT_STR;
  if (leftPlainObject !== (Object.prototype.toString.call(right) === PLAIN_OBJECT_STR)) return false;
  if (!leftPlainObject && !leftArray) return left === right;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  const keySet = {};
  for (let i = 0; i < leftKeys.length; i += 1) keySet[leftKeys[i]] = true;
  for (let i = 0; i < rightKeys.length; i += 1) keySet[rightKeys[i]] = true;
  const allKeys = Object.keys(keySet);
  if (allKeys.length !== leftKeys.length) return false;
  const l = left;
  const r = right;
  const pred = (key) => {
    return isEqual(l[key], r[key]);
  };
  return allKeys.every(pred);
};
const useStripe = () => {
  const { stripe } = useElementsOrCheckoutSdkContextWithUseCase("calls useStripe()");
  return stripe;
};
const useElementsOrCheckoutSdkContextWithUseCase = (useCaseString) => {
  return parseElementsContext(React7.useContext(ElementsContext), useCaseString);
};
const capitalized = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const createElementComponent = (type, isServer) => {
  const displayName = `${capitalized(type)}Element`;
  const ClientElement = ({ id, className, fallback, options = {}, onBlur, onFocus, onReady, onChange, onEscape, onClick, onLoadError, onLoaderStart, onNetworksChange, onConfirm, onCancel, onShippingAddressChange, onShippingRateChange }) => {
    const ctx = useElementsOrCheckoutSdkContextWithUseCase(`mounts <${displayName}>`);
    const elements = "elements" in ctx ? ctx.elements : null;
    const [element, setElement] = React7.useState(null);
    const elementRef = React7.useRef(null);
    const domNode = React7.useRef(null);
    const [isReady, setReady] = useState(false);
    useAttachEvent(element, "blur", onBlur);
    useAttachEvent(element, "focus", onFocus);
    useAttachEvent(element, "escape", onEscape);
    useAttachEvent(element, "click", onClick);
    useAttachEvent(element, "loaderror", onLoadError);
    useAttachEvent(element, "loaderstart", onLoaderStart);
    useAttachEvent(element, "networkschange", onNetworksChange);
    useAttachEvent(element, "confirm", onConfirm);
    useAttachEvent(element, "cancel", onCancel);
    useAttachEvent(element, "shippingaddresschange", onShippingAddressChange);
    useAttachEvent(element, "shippingratechange", onShippingRateChange);
    useAttachEvent(element, "change", onChange);
    let readyCallback;
    if (onReady) readyCallback = () => {
      setReady(true);
      onReady(element);
    };
    useAttachEvent(element, "ready", readyCallback);
    React7.useLayoutEffect(() => {
      if (elementRef.current === null && domNode.current !== null && elements) {
        let newElement = null;
        if (elements) newElement = elements.create(type, options);
        elementRef.current = newElement;
        setElement(newElement);
        if (newElement) newElement.mount(domNode.current);
      }
    }, [elements, options]);
    const prevOptions = usePrevious(options);
    React7.useEffect(() => {
      if (!elementRef.current) return;
      const updates = extractAllowedOptionsUpdates(options, prevOptions, ["paymentRequest"]);
      if (updates && "update" in elementRef.current) elementRef.current.update(updates);
    }, [options, prevOptions]);
    React7.useLayoutEffect(() => {
      return () => {
        if (elementRef.current && typeof elementRef.current.destroy === "function") try {
          elementRef.current.destroy();
          elementRef.current = null;
        } catch {
        }
      };
    }, []);
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, !isReady && fallback, /* @__PURE__ */ React7.createElement("div", {
      id,
      style: {
        height: isReady ? "unset" : "0px",
        visibility: isReady ? "visible" : "hidden"
      },
      className,
      ref: domNode
    }));
  };
  const ServerElement = (props) => {
    useElementsOrCheckoutSdkContextWithUseCase(`mounts <${displayName}>`);
    const { id, className } = props;
    return /* @__PURE__ */ React7.createElement("div", {
      id,
      className
    });
  };
  const Element = isServer ? ServerElement : ClientElement;
  Element.displayName = displayName;
  Element.__elementType = type;
  return Element;
};
const PaymentElement$1 = createElementComponent("payment", typeof window === "undefined");
function useInitializePaymentMethod(options) {
  const { for: forType = "user" } = options ?? {};
  const { organization } = useOrganizationContext();
  const user = useUserContext();
  const resource = forType === "organization" ? organization : user;
  const { data, trigger } = useSWRMutation(resource?.id ? {
    key: "billing-payment-method-initialize",
    resourceId: resource.id,
    for: forType
  } : null, () => {
    return resource?.initializePaymentMethod({ gateway: "stripe" });
  });
  useEffect(() => {
    if (!resource?.id) return;
    trigger().catch(() => {
    });
  }, [resource?.id, trigger]);
  return {
    initializedPaymentMethod: data,
    initializePaymentMethod: trigger
  };
}
function useStripeClerkLibs() {
  const clerk = useClerk();
  return useSWR("clerk-stripe-sdk", async () => {
    return { loadStripe: await clerk.__internal_loadStripeJs() };
  }, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: Infinity
  }).data ?? null;
}
function useStripeLoader(options) {
  const { stripeClerkLibs, externalGatewayId, stripePublishableKey } = options;
  return useSWR(stripeClerkLibs && externalGatewayId && stripePublishableKey ? {
    key: "stripe-sdk",
    externalGatewayId,
    stripePublishableKey
  } : null, ({ stripePublishableKey: stripePublishableKey$1, externalGatewayId: externalGatewayId$1 }) => {
    return stripeClerkLibs?.loadStripe(stripePublishableKey$1, { stripeAccount: externalGatewayId$1 });
  }, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 1e3 * 60
  }).data;
}
const useInternalEnvironment = () => {
  return useClerk().__unstable__environment;
};
const useLocalization = () => {
  const clerk = useClerk();
  let locale = "en";
  try {
    locale = clerk.__internal_getOption("localization")?.locale || "en";
  } catch {
  }
  return locale.split("-")[0];
};
const usePaymentSourceUtils = (forResource = "user") => {
  const stripeClerkLibs = useStripeClerkLibs();
  const environment = useInternalEnvironment();
  const { initializedPaymentMethod, initializePaymentMethod } = useInitializePaymentMethod({ for: forResource });
  const stripePublishableKey = environment?.commerceSettings.billing.stripePublishableKey ?? void 0;
  return {
    stripe: useStripeLoader({
      stripeClerkLibs,
      externalGatewayId: initializedPaymentMethod?.externalGatewayId,
      stripePublishableKey
    }),
    initializePaymentMethod,
    externalClientSecret: initializedPaymentMethod?.externalClientSecret,
    paymentMethodOrder: initializedPaymentMethod?.paymentMethodOrder
  };
};
const [PaymentElementContext, usePaymentElementContext] = createContextAndHook("PaymentElementContext");
const [StripeUtilsContext, useStripeUtilsContext] = createContextAndHook("StripeUtilsContext");
const ValidateStripeUtils = ({ children }) => {
  const stripe = useStripe();
  const elements = useElements();
  return /* @__PURE__ */ React7.createElement(StripeUtilsContext.Provider, { value: { value: {
    stripe,
    elements
  } } }, children);
};
const DummyStripeUtils = ({ children }) => {
  return /* @__PURE__ */ React7.createElement(StripeUtilsContext.Provider, { value: { value: {} } }, children);
};
const PropsProvider = ({ children, ...props }) => {
  const utils = usePaymentSourceUtils(props.for);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  return /* @__PURE__ */ React7.createElement(PaymentElementContext.Provider, { value: { value: {
    ...props,
    ...utils,
    setIsPaymentElementReady,
    isPaymentElementReady
  } } }, children);
};
const PaymentElementProvider = ({ children, ...props }) => {
  return /* @__PURE__ */ React7.createElement(PropsProvider, props, /* @__PURE__ */ React7.createElement(PaymentElementInternalRoot, null, children));
};
const PaymentElementInternalRoot = (props) => {
  const { stripe, externalClientSecret, stripeAppearance } = usePaymentElementContext();
  const locale = useLocalization();
  if (stripe && externalClientSecret) return /* @__PURE__ */ React7.createElement(Elements, {
    key: externalClientSecret,
    stripe,
    options: {
      loader: "never",
      clientSecret: externalClientSecret,
      appearance: { variables: stripeAppearance },
      locale
    }
  }, /* @__PURE__ */ React7.createElement(ValidateStripeUtils, null, props.children));
  return /* @__PURE__ */ React7.createElement(DummyStripeUtils, null, props.children);
};
const PaymentElement = ({ fallback }) => {
  const { setIsPaymentElementReady, paymentMethodOrder, checkout, stripe, externalClientSecret, paymentDescription, for: _for } = usePaymentElementContext();
  const environment = useInternalEnvironment();
  const applePay = useMemo(() => {
    if (!checkout || !checkout.totals || !checkout.plan) return;
    return { recurringPaymentRequest: {
      paymentDescription: paymentDescription || "",
      managementURL: _for === "organization" ? environment?.displayConfig.organizationProfileUrl || "" : environment?.displayConfig.userProfileUrl || "",
      regularBilling: {
        amount: checkout.totals.totalDueNow?.amount || checkout.totals.grandTotal.amount,
        label: checkout.plan.name,
        recurringPaymentIntervalUnit: checkout.planPeriod === "annual" ? "year" : "month"
      }
    } };
  }, [
    checkout,
    paymentDescription,
    _for,
    environment
  ]);
  const options = useMemo(() => {
    return {
      layout: {
        type: "tabs",
        defaultCollapsed: false
      },
      paymentMethodOrder,
      applePay
    };
  }, [applePay, paymentMethodOrder]);
  const onReady = useCallback(() => {
    setIsPaymentElementReady(true);
  }, [setIsPaymentElementReady]);
  if (!stripe || !externalClientSecret) return /* @__PURE__ */ React7.createElement(React7.Fragment, null, fallback);
  return /* @__PURE__ */ React7.createElement(PaymentElement$1, {
    fallback,
    onReady,
    options
  });
};
const throwLibsMissingError = () => {
  throw new Error("Clerk: Unable to submit, Stripe libraries are not yet loaded. Be sure to check `isFormReady` before calling `submit`.");
};
const usePaymentElement = () => {
  const { isPaymentElementReady, initializePaymentMethod } = usePaymentElementContext();
  const { stripe, elements } = useStripeUtilsContext();
  const { externalClientSecret } = usePaymentElementContext();
  const submit = useCallback(async () => {
    if (!stripe || !elements) return throwLibsMissingError();
    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required"
    });
    if (error) return {
      data: null,
      error: {
        gateway: "stripe",
        error: {
          code: error.code,
          message: error.message,
          type: error.type
        }
      }
    };
    return {
      data: {
        gateway: "stripe",
        paymentToken: setupIntent.payment_method
      },
      error: null
    };
  }, [stripe, elements]);
  const reset = useCallback(async () => {
    if (!stripe || !elements) return throwLibsMissingError();
    await initializePaymentMethod();
  }, [
    stripe,
    elements,
    initializePaymentMethod
  ]);
  const isProviderReady = Boolean(stripe && externalClientSecret);
  if (!isProviderReady) return {
    submit: throwLibsMissingError,
    reset: throwLibsMissingError,
    isFormReady: false,
    provider: void 0,
    isProviderReady: false
  };
  return {
    submit,
    reset,
    isFormReady: isPaymentElementReady,
    provider: { name: "stripe" },
    isProviderReady
  };
};
var errorThrower$1 = buildErrorThrower({ packageName: "@clerk/clerk-react" });
function setErrorThrowerOptions(options) {
  errorThrower$1.setMessages(options).setPackageName(options);
}
var [AuthContext, useAuthContext] = createContextAndHook("AuthContext");
var IsomorphicClerkContext = ClerkInstanceContext;
var useIsomorphicClerkContext = useClerkInstanceContext;
var multipleClerkProvidersError = "You've added multiple <ClerkProvider> components in your React component tree. Wrap your components in a single <ClerkProvider>.";
var multipleChildrenInButtonComponent = (name) => `You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;
var invalidStateError = "Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support";
var unsupportedNonBrowserDomainOrProxyUrlFunction = "Unsupported usage of isSatellite, domain or proxyUrl. The usage of isSatellite, domain or proxyUrl as function is not supported in non-browser environments.";
var userProfilePageRenderedError = "<UserProfile.Page /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.";
var userProfileLinkRenderedError = "<UserProfile.Link /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.";
var organizationProfilePageRenderedError = "<OrganizationProfile.Page /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.";
var organizationProfileLinkRenderedError = "<OrganizationProfile.Link /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.";
var customPagesIgnoredComponent = (componentName) => `<${componentName} /> can only accept <${componentName}.Page /> and <${componentName}.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;
var customPageWrongProps = (componentName) => `Missing props. <${componentName}.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.`;
var customLinkWrongProps = (componentName) => `Missing props. <${componentName}.Link /> component requires the following props: url, label and labelIcon.`;
var userButtonIgnoredComponent = `<UserButton /> can only accept <UserButton.UserProfilePage />, <UserButton.UserProfileLink /> and <UserButton.MenuItems /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;
var customMenuItemsIgnoredComponent = "<UserButton.MenuItems /> component can only accept <UserButton.Action /> and <UserButton.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.";
var userButtonMenuItemsRenderedError = "<UserButton.MenuItems /> component needs to be a direct child of `<UserButton />`.";
var userButtonMenuActionRenderedError = "<UserButton.Action /> component needs to be a direct child of `<UserButton.MenuItems />`.";
var userButtonMenuLinkRenderedError = "<UserButton.Link /> component needs to be a direct child of `<UserButton.MenuItems />`.";
var userButtonMenuItemLinkWrongProps = "Missing props. <UserButton.Link /> component requires the following props: href, label and labelIcon.";
var userButtonMenuItemsActionWrongsProps = "Missing props. <UserButton.Action /> component requires the following props: label.";
var useAssertWrappedByClerkProvider = (source) => {
  useAssertWrappedByClerkProvider$1(() => {
    errorThrower$1.throwMissingClerkProviderError({ source });
  });
};
var clerkLoaded = (isomorphicClerk) => {
  return new Promise((resolve) => {
    const handler = (status) => {
      if (["ready", "degraded"].includes(status)) {
        resolve();
        isomorphicClerk.off("status", handler);
      }
    };
    isomorphicClerk.on("status", handler, { notify: true });
  });
};
var createGetToken = (isomorphicClerk) => {
  return async (options) => {
    await clerkLoaded(isomorphicClerk);
    if (!isomorphicClerk.session) {
      return null;
    }
    return isomorphicClerk.session.getToken(options);
  };
};
var createSignOut = (isomorphicClerk) => {
  return async (...args) => {
    await clerkLoaded(isomorphicClerk);
    return isomorphicClerk.signOut(...args);
  };
};
var useAuth = (initialAuthStateOrOptions = {}) => {
  var _a;
  useAssertWrappedByClerkProvider("useAuth");
  const { treatPendingAsSignedOut, ...rest } = initialAuthStateOrOptions != null ? initialAuthStateOrOptions : {};
  const initialAuthState = rest;
  const authContextFromHook = useAuthContext();
  let authContext = authContextFromHook;
  if (authContext.sessionId === void 0 && authContext.userId === void 0) {
    authContext = initialAuthState != null ? initialAuthState : {};
  }
  const isomorphicClerk = useIsomorphicClerkContext();
  const getToken = useCallback(createGetToken(isomorphicClerk), [isomorphicClerk]);
  const signOut = useCallback(createSignOut(isomorphicClerk), [isomorphicClerk]);
  (_a = isomorphicClerk.telemetry) == null ? void 0 : _a.record(eventMethodCalled("useAuth", { treatPendingAsSignedOut }));
  return useDerivedAuth(
    {
      ...authContext,
      getToken,
      signOut
    },
    {
      treatPendingAsSignedOut
    }
  );
};
function useDerivedAuth(authObject, { treatPendingAsSignedOut = true } = {}) {
  const { userId, orgId, orgRole, has: has2, signOut, getToken, orgPermissions, factorVerificationAge, sessionClaims } = authObject != null ? authObject : {};
  const derivedHas = useCallback(
    (params) => {
      if (has2) {
        return has2(params);
      }
      return createCheckAuthorization({
        userId,
        orgId,
        orgRole,
        orgPermissions,
        factorVerificationAge,
        features: (sessionClaims == null ? void 0 : sessionClaims.fea) || "",
        plans: (sessionClaims == null ? void 0 : sessionClaims.pla) || ""
      })(params);
    },
    [has2, userId, orgId, orgRole, orgPermissions, factorVerificationAge, sessionClaims]
  );
  const payload = resolveAuthState({
    authObject: {
      ...authObject,
      getToken,
      signOut,
      has: derivedHas
    },
    options: {
      treatPendingAsSignedOut
    }
  });
  if (!payload) {
    return errorThrower$1.throw(invalidStateError);
  }
  return payload;
}
function useEmailLink(resource) {
  const { startEmailLinkFlow, cancelEmailLinkFlow } = React7.useMemo(() => resource.createEmailLinkFlow(), [resource]);
  React7.useEffect(() => {
    return cancelEmailLinkFlow;
  }, []);
  return {
    startEmailLinkFlow,
    cancelEmailLinkFlow
  };
}
var useSignIn = () => {
  var _a;
  useAssertWrappedByClerkProvider("useSignIn");
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();
  (_a = isomorphicClerk.telemetry) == null ? void 0 : _a.record(eventMethodCalled("useSignIn"));
  if (!client) {
    return { isLoaded: false, signIn: void 0, setActive: void 0 };
  }
  return {
    isLoaded: true,
    signIn: client.signIn,
    setActive: isomorphicClerk.setActive
  };
};
var useSignUp = () => {
  var _a;
  useAssertWrappedByClerkProvider("useSignUp");
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();
  (_a = isomorphicClerk.telemetry) == null ? void 0 : _a.record(eventMethodCalled("useSignUp"));
  if (!client) {
    return { isLoaded: false, signUp: void 0, setActive: void 0 };
  }
  return {
    isLoaded: true,
    signUp: client.signUp,
    setActive: isomorphicClerk.setActive
  };
};
var withClerk = (Component, displayNameOrOptions) => {
  const passedDisplayedName = typeof displayNameOrOptions === "string" ? displayNameOrOptions : displayNameOrOptions == null ? void 0 : displayNameOrOptions.component;
  const displayName = passedDisplayedName || Component.displayName || Component.name || "Component";
  Component.displayName = displayName;
  const options = typeof displayNameOrOptions === "string" ? void 0 : displayNameOrOptions;
  const HOC = (props) => {
    useAssertWrappedByClerkProvider(displayName);
    const clerk = useIsomorphicClerkContext();
    if (!clerk.loaded && !(options == null ? void 0 : options.renderWhileLoading)) {
      return null;
    }
    return /* @__PURE__ */ React7.createElement(
      Component,
      {
        ...props,
        component: displayName,
        clerk
      }
    );
  };
  HOC.displayName = `withClerk(${displayName})`;
  return HOC;
};
const isDevelopmentEnvironment = () => {
  try {
    return false;
  } catch {
  }
  return false;
};
const isTestEnvironment = () => {
  try {
    return false;
  } catch {
  }
  return false;
};
const isProductionEnvironment = () => {
  try {
    return true;
  } catch {
  }
  return false;
};
const displayedWarnings = /* @__PURE__ */ new Set();
const deprecated = (fnName, warning, key) => {
  const hideWarning = isTestEnvironment() || isProductionEnvironment();
  const messageId = fnName;
  if (displayedWarnings.has(messageId) || hideWarning) return;
  displayedWarnings.add(messageId);
  console.warn(`Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.
${warning}`);
};
var SignedIn = ({ children, treatPendingAsSignedOut }) => {
  useAssertWrappedByClerkProvider("SignedIn");
  const { userId } = useAuth({ treatPendingAsSignedOut });
  if (userId) {
    return children;
  }
  return null;
};
var SignedOut = ({ children, treatPendingAsSignedOut }) => {
  useAssertWrappedByClerkProvider("SignedOut");
  const { userId } = useAuth({ treatPendingAsSignedOut });
  if (userId === null) {
    return children;
  }
  return null;
};
var ClerkLoaded = ({ children }) => {
  useAssertWrappedByClerkProvider("ClerkLoaded");
  const isomorphicClerk = useIsomorphicClerkContext();
  if (!isomorphicClerk.loaded) {
    return null;
  }
  return children;
};
var ClerkLoading = ({ children }) => {
  useAssertWrappedByClerkProvider("ClerkLoading");
  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.status !== "loading") {
    return null;
  }
  return children;
};
var ClerkFailed = ({ children }) => {
  useAssertWrappedByClerkProvider("ClerkFailed");
  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.status !== "error") {
    return null;
  }
  return children;
};
var ClerkDegraded = ({ children }) => {
  useAssertWrappedByClerkProvider("ClerkDegraded");
  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.status !== "degraded") {
    return null;
  }
  return children;
};
var Protect = ({ children, fallback, treatPendingAsSignedOut, ...restAuthorizedParams }) => {
  useAssertWrappedByClerkProvider("Protect");
  const { isLoaded, has: has2, userId } = useAuth({ treatPendingAsSignedOut });
  if (!isLoaded) {
    return null;
  }
  const unauthorized = fallback != null ? fallback : null;
  const authorized = children;
  if (!userId) {
    return unauthorized;
  }
  if (typeof restAuthorizedParams.condition === "function") {
    if (restAuthorizedParams.condition(has2)) {
      return authorized;
    }
    return unauthorized;
  }
  if (restAuthorizedParams.role || restAuthorizedParams.permission || restAuthorizedParams.feature || restAuthorizedParams.plan) {
    if (has2(restAuthorizedParams)) {
      return authorized;
    }
    return unauthorized;
  }
  return authorized;
};
var RedirectToSignIn = withClerk(({ clerk, ...props }) => {
  const { client, session } = clerk;
  const hasSignedInSessions = client.signedInSessions ? client.signedInSessions.length > 0 : (
    // Compat for clerk-js<5.54.0 (which was released with the `signedInSessions` property)
    client.activeSessions && client.activeSessions.length > 0
  );
  React7.useEffect(() => {
    if (session === null && hasSignedInSessions) {
      void clerk.redirectToAfterSignOut();
    } else {
      void clerk.redirectToSignIn(props);
    }
  }, []);
  return null;
}, "RedirectToSignIn");
var RedirectToSignUp = withClerk(({ clerk, ...props }) => {
  React7.useEffect(() => {
    void clerk.redirectToSignUp(props);
  }, []);
  return null;
}, "RedirectToSignUp");
var RedirectToTasks = withClerk(({ clerk, ...props }) => {
  React7.useEffect(() => {
    void clerk.redirectToTasks(props);
  }, []);
  return null;
}, "RedirectToTasks");
var RedirectToUserProfile = withClerk(({ clerk }) => {
  React7.useEffect(() => {
    deprecated("RedirectToUserProfile", "Use the `redirectToUserProfile()` method instead.");
    void clerk.redirectToUserProfile();
  }, []);
  return null;
}, "RedirectToUserProfile");
var RedirectToOrganizationProfile = withClerk(({ clerk }) => {
  React7.useEffect(() => {
    deprecated("RedirectToOrganizationProfile", "Use the `redirectToOrganizationProfile()` method instead.");
    void clerk.redirectToOrganizationProfile();
  }, []);
  return null;
}, "RedirectToOrganizationProfile");
var RedirectToCreateOrganization = withClerk(({ clerk }) => {
  React7.useEffect(() => {
    deprecated("RedirectToCreateOrganization", "Use the `redirectToCreateOrganization()` method instead.");
    void clerk.redirectToCreateOrganization();
  }, []);
  return null;
}, "RedirectToCreateOrganization");
var AuthenticateWithRedirectCallback = withClerk(
  ({ clerk, ...handleRedirectCallbackParams }) => {
    React7.useEffect(() => {
      void clerk.handleRedirectCallback(handleRedirectCallbackParams);
    }, []);
    return null;
  },
  "AuthenticateWithRedirectCallback"
);
function handleValueOrFn(value, url, defaultValue) {
  if (typeof value === "function") return value(url);
  if (typeof value !== "undefined") return value;
  if (typeof defaultValue !== "undefined") return defaultValue;
}
const logErrorInDevMode = (message) => {
  if (isDevelopmentEnvironment()) console.error(`Clerk: ${message}`);
};
const without = (obj, ...props) => {
  const copy = { ...obj };
  for (const prop of props) delete copy[prop];
  return copy;
};
var assertSingleChild = (children) => (name) => {
  try {
    return React7.Children.only(children);
  } catch {
    return errorThrower$1.throw(multipleChildrenInButtonComponent(name));
  }
};
var normalizeWithDefaultValue = (children, defaultText) => {
  if (!children) {
    children = defaultText;
  }
  if (typeof children === "string") {
    children = /* @__PURE__ */ React7.createElement("button", null, children);
  }
  return children;
};
var safeExecute = (cb) => (...args) => {
  if (cb && typeof cb === "function") {
    return cb(...args);
  }
};
function isConstructor(f) {
  return typeof f === "function";
}
var counts = /* @__PURE__ */ new Map();
function useMaxAllowedInstancesGuard(name, error, maxCount = 1) {
  React7.useEffect(() => {
    const count = counts.get(name) || 0;
    if (count == maxCount) {
      return errorThrower$1.throw(error);
    }
    counts.set(name, count + 1);
    return () => {
      counts.set(name, (counts.get(name) || 1) - 1);
    };
  }, []);
}
function withMaxAllowedInstancesGuard(WrappedComponent, name, error) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || name || "Component";
  const Hoc = (props) => {
    useMaxAllowedInstancesGuard(name, error);
    return /* @__PURE__ */ React7.createElement(WrappedComponent, { ...props });
  };
  Hoc.displayName = `withMaxAllowedInstancesGuard(${displayName})`;
  return Hoc;
}
var useCustomElementPortal = (elements) => {
  const [nodeMap, setNodeMap] = useState(/* @__PURE__ */ new Map());
  return elements.map((el) => ({
    id: el.id,
    mount: (node) => setNodeMap((prev) => new Map(prev).set(String(el.id), node)),
    unmount: () => setNodeMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(String(el.id), null);
      return newMap;
    }),
    portal: () => {
      const node = nodeMap.get(String(el.id));
      return node ? createPortal(el.component, node) : null;
    }
  }));
};
var isThatComponent = (v, component) => {
  return !!v && React7.isValidElement(v) && (v == null ? void 0 : v.type) === component;
};
var useUserProfileCustomPages = (children, options) => {
  const reorderItemsLabels = ["account", "security", "billing", "apiKeys"];
  return useCustomPages(
    {
      children,
      reorderItemsLabels,
      LinkComponent: UserProfileLink,
      PageComponent: UserProfilePage,
      MenuItemsComponent: MenuItems,
      componentName: "UserProfile"
    },
    options
  );
};
var useOrganizationProfileCustomPages = (children, options) => {
  const reorderItemsLabels = ["general", "members", "billing", "apiKeys"];
  return useCustomPages(
    {
      children,
      reorderItemsLabels,
      LinkComponent: OrganizationProfileLink,
      PageComponent: OrganizationProfilePage,
      componentName: "OrganizationProfile"
    },
    options
  );
};
var useSanitizedChildren = (children) => {
  const sanitizedChildren = [];
  const excludedComponents = [
    OrganizationProfileLink,
    OrganizationProfilePage,
    MenuItems,
    UserProfilePage,
    UserProfileLink
  ];
  React7.Children.forEach(children, (child) => {
    if (!excludedComponents.some((component) => isThatComponent(child, component))) {
      sanitizedChildren.push(child);
    }
  });
  return sanitizedChildren;
};
var useCustomPages = (params, options) => {
  const { children, LinkComponent, PageComponent, MenuItemsComponent, reorderItemsLabels, componentName } = params;
  const { allowForAnyChildren = false } = options || {};
  const validChildren = [];
  React7.Children.forEach(children, (child) => {
    if (!isThatComponent(child, PageComponent) && !isThatComponent(child, LinkComponent) && !isThatComponent(child, MenuItemsComponent)) {
      if (child && !allowForAnyChildren) {
        logErrorInDevMode(customPagesIgnoredComponent(componentName));
      }
      return;
    }
    const { props } = child;
    const { children: children2, label, url, labelIcon } = props;
    if (isThatComponent(child, PageComponent)) {
      if (isReorderItem(props, reorderItemsLabels)) {
        validChildren.push({ label });
      } else if (isCustomPage(props)) {
        validChildren.push({ label, labelIcon, children: children2, url });
      } else {
        logErrorInDevMode(customPageWrongProps(componentName));
        return;
      }
    }
    if (isThatComponent(child, LinkComponent)) {
      if (isExternalLink(props)) {
        validChildren.push({ label, labelIcon, url });
      } else {
        logErrorInDevMode(customLinkWrongProps(componentName));
        return;
      }
    }
  });
  const customPageContents = [];
  const customPageLabelIcons = [];
  const customLinkLabelIcons = [];
  validChildren.forEach((cp, index) => {
    if (isCustomPage(cp)) {
      customPageContents.push({ component: cp.children, id: index });
      customPageLabelIcons.push({ component: cp.labelIcon, id: index });
      return;
    }
    if (isExternalLink(cp)) {
      customLinkLabelIcons.push({ component: cp.labelIcon, id: index });
    }
  });
  const customPageContentsPortals = useCustomElementPortal(customPageContents);
  const customPageLabelIconsPortals = useCustomElementPortal(customPageLabelIcons);
  const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);
  const customPages = [];
  const customPagesPortals = [];
  validChildren.forEach((cp, index) => {
    if (isReorderItem(cp, reorderItemsLabels)) {
      customPages.push({ label: cp.label });
      return;
    }
    if (isCustomPage(cp)) {
      const {
        portal: contentPortal,
        mount,
        unmount
      } = customPageContentsPortals.find((p) => p.id === index);
      const {
        portal: labelPortal,
        mount: mountIcon,
        unmount: unmountIcon
      } = customPageLabelIconsPortals.find((p) => p.id === index);
      customPages.push({ label: cp.label, url: cp.url, mount, unmount, mountIcon, unmountIcon });
      customPagesPortals.push(contentPortal);
      customPagesPortals.push(labelPortal);
      return;
    }
    if (isExternalLink(cp)) {
      const {
        portal: labelPortal,
        mount: mountIcon,
        unmount: unmountIcon
      } = customLinkLabelIconsPortals.find((p) => p.id === index);
      customPages.push({ label: cp.label, url: cp.url, mountIcon, unmountIcon });
      customPagesPortals.push(labelPortal);
      return;
    }
  });
  return { customPages, customPagesPortals };
};
var isReorderItem = (childProps, validItems) => {
  const { children, label, url, labelIcon } = childProps;
  return !children && !url && !labelIcon && validItems.some((v) => v === label);
};
var isCustomPage = (childProps) => {
  const { children, label, url, labelIcon } = childProps;
  return !!children && !!url && !!labelIcon && !!label;
};
var isExternalLink = (childProps) => {
  const { children, label, url, labelIcon } = childProps;
  return !children && !!url && !!labelIcon && !!label;
};
var useUserButtonCustomMenuItems = (children, options) => {
  var _a;
  const reorderItemsLabels = ["manageAccount", "signOut"];
  return useCustomMenuItems({
    children,
    reorderItemsLabels,
    MenuItemsComponent: MenuItems,
    MenuActionComponent: MenuAction,
    MenuLinkComponent: MenuLink,
    UserProfileLinkComponent: UserProfileLink,
    UserProfilePageComponent: UserProfilePage,
    allowForAnyChildren: (_a = options == null ? void 0 : options.allowForAnyChildren) != null ? _a : false
  });
};
var useCustomMenuItems = ({
  children,
  MenuItemsComponent,
  MenuActionComponent,
  MenuLinkComponent,
  UserProfileLinkComponent,
  UserProfilePageComponent,
  reorderItemsLabels,
  allowForAnyChildren = false
}) => {
  const validChildren = [];
  const customMenuItems = [];
  const customMenuItemsPortals = [];
  React7.Children.forEach(children, (child) => {
    if (!isThatComponent(child, MenuItemsComponent) && !isThatComponent(child, UserProfileLinkComponent) && !isThatComponent(child, UserProfilePageComponent)) {
      if (child && !allowForAnyChildren) {
        logErrorInDevMode(userButtonIgnoredComponent);
      }
      return;
    }
    if (isThatComponent(child, UserProfileLinkComponent) || isThatComponent(child, UserProfilePageComponent)) {
      return;
    }
    const { props } = child;
    React7.Children.forEach(props.children, (child2) => {
      if (!isThatComponent(child2, MenuActionComponent) && !isThatComponent(child2, MenuLinkComponent)) {
        if (child2) {
          logErrorInDevMode(customMenuItemsIgnoredComponent);
        }
        return;
      }
      const { props: props2 } = child2;
      const { label, labelIcon, href, onClick, open } = props2;
      if (isThatComponent(child2, MenuActionComponent)) {
        if (isReorderItem2(props2, reorderItemsLabels)) {
          validChildren.push({ label });
        } else if (isCustomMenuItem(props2)) {
          const baseItem = {
            label,
            labelIcon
          };
          if (onClick !== void 0) {
            validChildren.push({
              ...baseItem,
              onClick
            });
          } else if (open !== void 0) {
            validChildren.push({
              ...baseItem,
              open: open.startsWith("/") ? open : `/${open}`
            });
          } else {
            logErrorInDevMode("Custom menu item must have either onClick or open property");
            return;
          }
        } else {
          logErrorInDevMode(userButtonMenuItemsActionWrongsProps);
          return;
        }
      }
      if (isThatComponent(child2, MenuLinkComponent)) {
        if (isExternalLink2(props2)) {
          validChildren.push({ label, labelIcon, href });
        } else {
          logErrorInDevMode(userButtonMenuItemLinkWrongProps);
          return;
        }
      }
    });
  });
  const customMenuItemLabelIcons = [];
  const customLinkLabelIcons = [];
  validChildren.forEach((mi, index) => {
    if (isCustomMenuItem(mi)) {
      customMenuItemLabelIcons.push({ component: mi.labelIcon, id: index });
    }
    if (isExternalLink2(mi)) {
      customLinkLabelIcons.push({ component: mi.labelIcon, id: index });
    }
  });
  const customMenuItemLabelIconsPortals = useCustomElementPortal(customMenuItemLabelIcons);
  const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);
  validChildren.forEach((mi, index) => {
    if (isReorderItem2(mi, reorderItemsLabels)) {
      customMenuItems.push({
        label: mi.label
      });
    }
    if (isCustomMenuItem(mi)) {
      const {
        portal: iconPortal,
        mount: mountIcon,
        unmount: unmountIcon
      } = customMenuItemLabelIconsPortals.find((p) => p.id === index);
      const menuItem = {
        label: mi.label,
        mountIcon,
        unmountIcon
      };
      if ("onClick" in mi) {
        menuItem.onClick = mi.onClick;
      } else if ("open" in mi) {
        menuItem.open = mi.open;
      }
      customMenuItems.push(menuItem);
      customMenuItemsPortals.push(iconPortal);
    }
    if (isExternalLink2(mi)) {
      const {
        portal: iconPortal,
        mount: mountIcon,
        unmount: unmountIcon
      } = customLinkLabelIconsPortals.find((p) => p.id === index);
      customMenuItems.push({
        label: mi.label,
        href: mi.href,
        mountIcon,
        unmountIcon
      });
      customMenuItemsPortals.push(iconPortal);
    }
  });
  return { customMenuItems, customMenuItemsPortals };
};
var isReorderItem2 = (childProps, validItems) => {
  const { children, label, onClick, labelIcon } = childProps;
  return !children && !onClick && !labelIcon && validItems.some((v) => v === label);
};
var isCustomMenuItem = (childProps) => {
  const { label, labelIcon, onClick, open } = childProps;
  return !!labelIcon && !!label && (typeof onClick === "function" || typeof open === "string");
};
var isExternalLink2 = (childProps) => {
  const { label, href, labelIcon } = childProps;
  return !!href && !!labelIcon && !!label;
};
var createAwaitableMutationObserver = (globalOptions) => {
  const isReady = globalOptions == null ? void 0 : globalOptions.isReady;
  return (options) => new Promise((resolve, reject) => {
    const { root = document == null ? void 0 : document.body, selector, timeout = 0 } = options;
    if (!root) {
      reject(new Error("No root element provided"));
      return;
    }
    let elementToWatch = root;
    if (selector) {
      elementToWatch = root == null ? void 0 : root.querySelector(selector);
    }
    if (isReady(elementToWatch, selector)) {
      resolve();
      return;
    }
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (!elementToWatch && selector) {
          elementToWatch = root == null ? void 0 : root.querySelector(selector);
        }
        if (globalOptions.childList && mutation.type === "childList" || globalOptions.attributes && mutation.type === "attributes") {
          if (isReady(elementToWatch, selector)) {
            observer.disconnect();
            resolve();
            return;
          }
        }
      }
    });
    observer.observe(root, globalOptions);
    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    }
  });
};
var waitForElementChildren = createAwaitableMutationObserver({
  childList: true,
  subtree: true,
  isReady: (el, selector) => {
    var _a;
    return !!(el == null ? void 0 : el.childElementCount) && ((_a = el == null ? void 0 : el.matches) == null ? void 0 : _a.call(el, selector)) && el.childElementCount > 0;
  }
});
function useWaitForComponentMount(component, options) {
  const watcherRef = useRef();
  const [status, setStatus] = useState("rendering");
  useEffect(() => {
    if (!component) {
      throw new Error("Clerk: no component name provided, unable to detect mount.");
    }
    if (typeof window !== "undefined" && !watcherRef.current) {
      const defaultSelector = `[data-clerk-component="${component}"]`;
      const selector = options == null ? void 0 : options.selector;
      watcherRef.current = waitForElementChildren({
        selector: selector ? (
          // Allows for `[data-clerk-component="xxxx"][data-some-attribute="123"] .my-class`
          defaultSelector + selector
        ) : defaultSelector
      }).then(() => {
        setStatus("rendered");
      }).catch(() => {
        setStatus("error");
      });
    }
  }, [component, options == null ? void 0 : options.selector]);
  return status;
}
var isMountProps = (props) => {
  return "mount" in props;
};
var isOpenProps = (props) => {
  return "open" in props;
};
var stripMenuItemIconHandlers = (menuItems) => {
  return menuItems == null ? void 0 : menuItems.map(({ mountIcon, unmountIcon, ...rest }) => rest);
};
var ClerkHostRenderer = class extends React7.PureComponent {
  constructor() {
    super(...arguments);
    this.rootRef = React7.createRef();
  }
  componentDidUpdate(_prevProps) {
    var _a, _b, _c, _d;
    if (!isMountProps(_prevProps) || !isMountProps(this.props)) {
      return;
    }
    const prevProps = without(_prevProps.props, "customPages", "customMenuItems", "children");
    const newProps = without(this.props.props, "customPages", "customMenuItems", "children");
    const customPagesChanged = ((_a = prevProps.customPages) == null ? void 0 : _a.length) !== ((_b = newProps.customPages) == null ? void 0 : _b.length);
    const customMenuItemsChanged = ((_c = prevProps.customMenuItems) == null ? void 0 : _c.length) !== ((_d = newProps.customMenuItems) == null ? void 0 : _d.length);
    const prevMenuItemsWithoutHandlers = stripMenuItemIconHandlers(_prevProps.props.customMenuItems);
    const newMenuItemsWithoutHandlers = stripMenuItemIconHandlers(this.props.props.customMenuItems);
    if (!isDeeplyEqual(prevProps, newProps) || !isDeeplyEqual(prevMenuItemsWithoutHandlers, newMenuItemsWithoutHandlers) || customPagesChanged || customMenuItemsChanged) {
      if (this.rootRef.current) {
        this.props.updateProps({ node: this.rootRef.current, props: this.props.props });
      }
    }
  }
  componentDidMount() {
    if (this.rootRef.current) {
      if (isMountProps(this.props)) {
        this.props.mount(this.rootRef.current, this.props.props);
      }
      if (isOpenProps(this.props)) {
        this.props.open(this.props.props);
      }
    }
  }
  componentWillUnmount() {
    if (this.rootRef.current) {
      if (isMountProps(this.props)) {
        this.props.unmount(this.rootRef.current);
      }
      if (isOpenProps(this.props)) {
        this.props.close();
      }
    }
  }
  render() {
    const { hideRootHtmlElement = false } = this.props;
    const rootAttributes = {
      ref: this.rootRef,
      ...this.props.rootProps,
      ...this.props.component && { "data-clerk-component": this.props.component }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, !hideRootHtmlElement && /* @__PURE__ */ React7.createElement("div", { ...rootAttributes }), this.props.children);
  }
};
var CustomPortalsRenderer = (props) => {
  var _a, _b;
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, (_a = props == null ? void 0 : props.customPagesPortals) == null ? void 0 : _a.map((portal, index) => createElement(portal, { key: index })), (_b = props == null ? void 0 : props.customMenuItemsPortals) == null ? void 0 : _b.map((portal, index) => createElement(portal, { key: index })));
};
var SignIn = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountSignIn,
        unmount: clerk.unmountSignIn,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "SignIn", renderWhileLoading: true }
);
var SignUp = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountSignUp,
        unmount: clerk.unmountSignUp,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "SignUp", renderWhileLoading: true }
);
function UserProfilePage({ children }) {
  logErrorInDevMode(userProfilePageRenderedError);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
}
function UserProfileLink({ children }) {
  logErrorInDevMode(userProfileLinkRenderedError);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
}
var _UserProfile = withClerk(
  ({
    clerk,
    component,
    fallback,
    ...props
  }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountUserProfile,
        unmount: clerk.unmountUserProfile,
        updateProps: clerk.__unstable__updateProps,
        props: { ...props, customPages },
        rootProps: rendererRootProps
      },
      /* @__PURE__ */ React7.createElement(CustomPortalsRenderer, { customPagesPortals })
    ));
  },
  { component: "UserProfile", renderWhileLoading: true }
);
var UserProfile = Object.assign(_UserProfile, {
  Page: UserProfilePage,
  Link: UserProfileLink
});
var UserButtonContext = createContext({
  mount: () => {
  },
  unmount: () => {
  },
  updateProps: () => {
  }
});
var _UserButton = withClerk(
  ({
    clerk,
    component,
    fallback,
    ...props
  }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children, {
      allowForAnyChildren: !!props.__experimental_asProvider
    });
    const userProfileProps = { ...props.userProfileProps, customPages };
    const { customMenuItems, customMenuItemsPortals } = useUserButtonCustomMenuItems(props.children, {
      allowForAnyChildren: !!props.__experimental_asProvider
    });
    const sanitizedChildren = useSanitizedChildren(props.children);
    const passableProps = {
      mount: clerk.mountUserButton,
      unmount: clerk.unmountUserButton,
      updateProps: clerk.__unstable__updateProps,
      props: { ...props, userProfileProps, customMenuItems }
    };
    const portalProps = {
      customPagesPortals,
      customMenuItemsPortals
    };
    return /* @__PURE__ */ React7.createElement(UserButtonContext.Provider, { value: passableProps }, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        ...passableProps,
        hideRootHtmlElement: !!props.__experimental_asProvider,
        rootProps: rendererRootProps
      },
      props.__experimental_asProvider ? sanitizedChildren : null,
      /* @__PURE__ */ React7.createElement(CustomPortalsRenderer, { ...portalProps })
    ));
  },
  { component: "UserButton", renderWhileLoading: true }
);
function MenuItems({ children }) {
  logErrorInDevMode(userButtonMenuItemsRenderedError);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
}
function MenuAction({ children }) {
  logErrorInDevMode(userButtonMenuActionRenderedError);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
}
function MenuLink({ children }) {
  logErrorInDevMode(userButtonMenuLinkRenderedError);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
}
function UserButtonOutlet(outletProps) {
  const providerProps = useContext(UserButtonContext);
  const portalProps = {
    ...providerProps,
    props: {
      ...providerProps.props,
      ...outletProps
    }
  };
  return /* @__PURE__ */ React7.createElement(ClerkHostRenderer, { ...portalProps });
}
var UserButton = Object.assign(_UserButton, {
  UserProfilePage,
  UserProfileLink,
  MenuItems,
  Action: MenuAction,
  Link: MenuLink,
  __experimental_Outlet: UserButtonOutlet
});
function OrganizationProfilePage({ children }) {
  logErrorInDevMode(organizationProfilePageRenderedError);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
}
function OrganizationProfileLink({ children }) {
  logErrorInDevMode(organizationProfileLinkRenderedError);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
}
var _OrganizationProfile = withClerk(
  ({
    clerk,
    component,
    fallback,
    ...props
  }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children);
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountOrganizationProfile,
        unmount: clerk.unmountOrganizationProfile,
        updateProps: clerk.__unstable__updateProps,
        props: { ...props, customPages },
        rootProps: rendererRootProps
      },
      /* @__PURE__ */ React7.createElement(CustomPortalsRenderer, { customPagesPortals })
    ));
  },
  { component: "OrganizationProfile", renderWhileLoading: true }
);
var OrganizationProfile = Object.assign(_OrganizationProfile, {
  Page: OrganizationProfilePage,
  Link: OrganizationProfileLink
});
var CreateOrganization = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountCreateOrganization,
        unmount: clerk.unmountCreateOrganization,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "CreateOrganization", renderWhileLoading: true }
);
var OrganizationSwitcherContext = createContext({
  mount: () => {
  },
  unmount: () => {
  },
  updateProps: () => {
  }
});
var _OrganizationSwitcher = withClerk(
  ({
    clerk,
    component,
    fallback,
    ...props
  }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children, {
      allowForAnyChildren: !!props.__experimental_asProvider
    });
    const organizationProfileProps = { ...props.organizationProfileProps, customPages };
    const sanitizedChildren = useSanitizedChildren(props.children);
    const passableProps = {
      mount: clerk.mountOrganizationSwitcher,
      unmount: clerk.unmountOrganizationSwitcher,
      updateProps: clerk.__unstable__updateProps,
      props: { ...props, organizationProfileProps },
      rootProps: rendererRootProps,
      component
    };
    clerk.__experimental_prefetchOrganizationSwitcher();
    return /* @__PURE__ */ React7.createElement(OrganizationSwitcherContext.Provider, { value: passableProps }, /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        ...passableProps,
        hideRootHtmlElement: !!props.__experimental_asProvider
      },
      props.__experimental_asProvider ? sanitizedChildren : null,
      /* @__PURE__ */ React7.createElement(CustomPortalsRenderer, { customPagesPortals })
    )));
  },
  { component: "OrganizationSwitcher", renderWhileLoading: true }
);
function OrganizationSwitcherOutlet(outletProps) {
  const providerProps = useContext(OrganizationSwitcherContext);
  const portalProps = {
    ...providerProps,
    props: {
      ...providerProps.props,
      ...outletProps
    }
  };
  return /* @__PURE__ */ React7.createElement(ClerkHostRenderer, { ...portalProps });
}
var OrganizationSwitcher = Object.assign(_OrganizationSwitcher, {
  OrganizationProfilePage,
  OrganizationProfileLink,
  __experimental_Outlet: OrganizationSwitcherOutlet
});
var OrganizationList = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountOrganizationList,
        unmount: clerk.unmountOrganizationList,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "OrganizationList", renderWhileLoading: true }
);
var GoogleOneTap = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        open: clerk.openGoogleOneTap,
        close: clerk.closeGoogleOneTap,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "GoogleOneTap", renderWhileLoading: true }
);
var Waitlist = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountWaitlist,
        unmount: clerk.unmountWaitlist,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "Waitlist", renderWhileLoading: true }
);
var PricingTable = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component, {
      // This attribute is added to the PricingTable root element after we've successfully fetched the plans asynchronously.
      selector: '[data-component-status="ready"]'
    });
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountPricingTable,
        unmount: clerk.unmountPricingTable,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "PricingTable", renderWhileLoading: true }
);
var APIKeys = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountAPIKeys,
        unmount: clerk.unmountAPIKeys,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "ApiKeys", renderWhileLoading: true }
);
var UserAvatar = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountUserAvatar,
        unmount: clerk.unmountUserAvatar,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "UserAvatar", renderWhileLoading: true }
);
var TaskChooseOrganization = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountTaskChooseOrganization,
        unmount: clerk.unmountTaskChooseOrganization,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "TaskChooseOrganization", renderWhileLoading: true }
);
var TaskResetPassword = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountTaskResetPassword,
        unmount: clerk.unmountTaskResetPassword,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "TaskResetPassword", renderWhileLoading: true }
);
var TaskSetupMFA = withClerk(
  ({ clerk, component, fallback, ...props }) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
    const rendererRootProps = {
      ...shouldShowFallback && fallback && { style: { display: "none" } }
    };
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ React7.createElement(
      ClerkHostRenderer,
      {
        component,
        mount: clerk.mountTaskSetupMFA,
        unmount: clerk.unmountTaskSetupMFA,
        updateProps: clerk.__unstable__updateProps,
        props,
        rootProps: rendererRootProps
      }
    ));
  },
  { component: "TaskSetupMFA", renderWhileLoading: true }
);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
const defaultOptions = {
  initialDelay: 125,
  maxDelayBetweenRetries: 0,
  factor: 2,
  shouldRetry: (_, iteration) => iteration < 5,
  retryImmediately: false,
  jitter: true
};
const RETRY_IMMEDIATELY_DELAY = 100;
const sleep = async (ms) => new Promise((s) => setTimeout(s, ms));
const applyJitter = (delay, jitter) => {
  return jitter ? delay * (1 + Math.random()) : delay;
};
const createExponentialDelayAsyncFn = (opts) => {
  let timesCalled = 0;
  const calculateDelayInMs = () => {
    const constant = opts.initialDelay;
    const base = opts.factor;
    let delay = constant * Math.pow(base, timesCalled);
    delay = applyJitter(delay, opts.jitter);
    return Math.min(opts.maxDelayBetweenRetries || delay, delay);
  };
  return async () => {
    await sleep(calculateDelayInMs());
    timesCalled++;
  };
};
const retry = async (callback, options = {}) => {
  let iterations = 0;
  const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter, onBeforeRetry } = {
    ...defaultOptions,
    ...options
  };
  const delay = createExponentialDelayAsyncFn({
    initialDelay,
    maxDelayBetweenRetries,
    factor,
    jitter
  });
  while (true) try {
    return await callback();
  } catch (e) {
    iterations++;
    if (!shouldRetry(e, iterations)) throw e;
    if (onBeforeRetry) await onBeforeRetry(iterations);
    if (retryImmediately && iterations === 1) await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
    else await delay();
  }
};
const NO_DOCUMENT_ERROR = "loadScript cannot be called when document does not exist";
const NO_SRC_ERROR = "loadScript cannot be called without a src";
async function loadScript(src = "", opts) {
  const { async, defer, beforeLoad, crossOrigin, nonce } = opts || {};
  const load = () => {
    return new Promise((resolve, reject) => {
      if (!src) reject(new Error(NO_SRC_ERROR));
      if (!document || !document.body) reject(new Error(NO_DOCUMENT_ERROR));
      const script = document.createElement("script");
      if (crossOrigin) script.setAttribute("crossorigin", crossOrigin);
      script.async = async || false;
      script.defer = defer || false;
      script.addEventListener("load", () => {
        script.remove();
        resolve(script);
      });
      script.addEventListener("error", (event) => {
        script.remove();
        reject(event.error ?? /* @__PURE__ */ new Error(`failed to load script: ${src}`));
      });
      script.src = src;
      script.nonce = nonce;
      beforeLoad?.(script);
      document.body.appendChild(script);
    });
  };
  return retry(load, { shouldRetry: (_, iterations) => iterations <= 5 });
}
function isValidProxyUrl(key) {
  if (!key) return true;
  return isHttpOrHttps(key) || isProxyUrlRelative(key);
}
function isHttpOrHttps(key) {
  return /^http(s)?:\/\//.test(key || "");
}
function isProxyUrlRelative(key) {
  return key.startsWith("/");
}
function proxyUrlToAbsoluteURL(url) {
  if (!url) return "";
  return isProxyUrlRelative(url) ? new URL(url, window.location.origin).toString() : url;
}
function addClerkPrefix(str) {
  if (!str) return "";
  let regex;
  if (str.match(/^(clerk\.)+\w*$/)) regex = /(clerk\.)*(?=clerk\.)/;
  else if (str.match(/\.clerk.accounts/)) return str;
  else regex = /^(clerk\.)*/gi;
  return `clerk.${str.replace(regex, "")}`;
}
const versionSelector = (clerkJSVersion, packageVersion = "5.125.3") => {
  if (clerkJSVersion) return clerkJSVersion;
  const prereleaseTag = getPrereleaseTag(packageVersion);
  if (prereleaseTag) {
    if (prereleaseTag === "snapshot") return "5.125.3";
    return prereleaseTag;
  }
  return getMajorVersion(packageVersion);
};
const getPrereleaseTag = (packageVersion) => packageVersion.trim().replace(/^v/, "").match(/-(.+?)(\.|$)/)?.[1];
const getMajorVersion = (packageVersion) => packageVersion.trim().replace(/^v/, "").split(".")[0];
const ERROR_CODE = "failed_to_load_clerk_js";
const ERROR_CODE_TIMEOUT = "failed_to_load_clerk_js_timeout";
const FAILED_TO_LOAD_ERROR = "Failed to load Clerk";
const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
const errorThrower = buildErrorThrower({ packageName: "@clerk/shared" });
function setClerkJsLoadingErrorPackageName(packageName) {
  errorThrower.setPackageName({ packageName });
}
function isClerkProperlyLoaded() {
  if (typeof window === "undefined" || !window.Clerk) return false;
  const clerk = window.Clerk;
  return typeof clerk === "object" && typeof clerk.load === "function";
}
function hasScriptRequestError(scriptUrl) {
  if (typeof window === "undefined" || !window.performance) return false;
  const entries = performance.getEntriesByName(scriptUrl, "resource");
  if (entries.length === 0) return false;
  const scriptEntry = entries[entries.length - 1];
  if (scriptEntry.transferSize === 0 && scriptEntry.decodedBodySize === 0) {
    if (scriptEntry.responseEnd === 0) return true;
    if (scriptEntry.responseEnd > 0 && scriptEntry.responseStart > 0) return true;
    if ("responseStatus" in scriptEntry) {
      if (scriptEntry.responseStatus >= 400) return true;
      if (scriptEntry.responseStatus === 0) return true;
    }
  }
  return false;
}
function waitForClerkWithTimeout(timeoutMs, existingScript) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const cleanup = (timeoutId$1, pollInterval$1) => {
      clearTimeout(timeoutId$1);
      clearInterval(pollInterval$1);
    };
    existingScript?.addEventListener("error", () => {
      cleanup(timeoutId, pollInterval);
      reject(new ClerkRuntimeError(FAILED_TO_LOAD_ERROR, { code: ERROR_CODE }));
    });
    const checkAndResolve = () => {
      if (resolved) return;
      if (isClerkProperlyLoaded()) {
        resolved = true;
        cleanup(timeoutId, pollInterval);
        resolve(null);
      }
    };
    const handleTimeout = () => {
      if (resolved) return;
      resolved = true;
      cleanup(timeoutId, pollInterval);
      if (!isClerkProperlyLoaded()) reject(new ClerkRuntimeError(FAILED_TO_LOAD_ERROR, { code: ERROR_CODE_TIMEOUT }));
      else resolve(null);
    };
    const timeoutId = setTimeout(handleTimeout, timeoutMs);
    checkAndResolve();
    const pollInterval = setInterval(() => {
      if (resolved) {
        clearInterval(pollInterval);
        return;
      }
      checkAndResolve();
    }, 100);
  });
}
const loadClerkJsScript = async (opts) => {
  const timeout = opts?.scriptLoadTimeout ?? 15e3;
  if (isClerkProperlyLoaded()) return null;
  if (!opts?.publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
    return null;
  }
  const scriptUrl = clerkJsScriptUrl(opts);
  const existingScript = document.querySelector("script[data-clerk-js-script]");
  if (existingScript) if (hasScriptRequestError(scriptUrl)) existingScript.remove();
  else try {
    await waitForClerkWithTimeout(timeout, existingScript);
    return null;
  } catch {
    existingScript.remove();
  }
  const loadPromise = waitForClerkWithTimeout(timeout);
  loadScript(scriptUrl, {
    async: true,
    crossOrigin: "anonymous",
    nonce: opts.nonce,
    beforeLoad: applyClerkJsScriptAttributes(opts)
  }).catch((error) => {
    throw new ClerkRuntimeError(FAILED_TO_LOAD_ERROR + (error.message ? `, ${error.message}` : ""), {
      code: ERROR_CODE,
      cause: error
    });
  });
  return loadPromise;
};
const clerkJsScriptUrl = (opts) => {
  const { clerkJSUrl, clerkJSVariant, clerkJSVersion, proxyUrl, domain, publishableKey } = opts;
  if (clerkJSUrl) return clerkJSUrl;
  let scriptHost = "";
  if (!!proxyUrl && isValidProxyUrl(proxyUrl)) scriptHost = proxyUrlToAbsoluteURL(proxyUrl).replace(/http(s)?:\/\//, "");
  else if (domain && !isDevOrStagingUrl(parsePublishableKey(publishableKey)?.frontendApi || "")) scriptHost = addClerkPrefix(domain);
  else scriptHost = parsePublishableKey(publishableKey)?.frontendApi || "";
  const variant = clerkJSVariant ? `${clerkJSVariant.replace(/\.+$/, "")}.` : "";
  const version = versionSelector(clerkJSVersion);
  return `https://${scriptHost}/npm/@clerk/clerk-js@${version}/dist/clerk.${variant}browser.js`;
};
const buildClerkJsScriptAttributes = (options) => {
  const obj = {};
  if (options.publishableKey) obj["data-clerk-publishable-key"] = options.publishableKey;
  if (options.proxyUrl) obj["data-clerk-proxy-url"] = options.proxyUrl;
  if (options.domain) obj["data-clerk-domain"] = options.domain;
  if (options.nonce) obj.nonce = options.nonce;
  return obj;
};
const applyClerkJsScriptAttributes = (options) => (script) => {
  const attributes = buildClerkJsScriptAttributes(options);
  for (const attribute in attributes) script.setAttribute(attribute, attributes[attribute]);
};
const deriveState = (clerkOperational, state, initialState) => {
  if (!clerkOperational && initialState) return deriveFromSsrInitialState(initialState);
  return deriveFromClientSideState(state);
};
const deriveFromSsrInitialState = (initialState) => {
  const userId = initialState.userId;
  const user = initialState.user;
  const sessionId = initialState.sessionId;
  const sessionStatus = initialState.sessionStatus;
  const sessionClaims = initialState.sessionClaims;
  return {
    userId,
    user,
    sessionId,
    session: initialState.session,
    sessionStatus,
    sessionClaims,
    organization: initialState.organization,
    orgId: initialState.orgId,
    orgRole: initialState.orgRole,
    orgPermissions: initialState.orgPermissions,
    orgSlug: initialState.orgSlug,
    actor: initialState.actor,
    factorVerificationAge: initialState.factorVerificationAge
  };
};
const deriveFromClientSideState = (state) => {
  const userId = state.user ? state.user.id : state.user;
  const user = state.user;
  const sessionId = state.session ? state.session.id : state.session;
  const session = state.session;
  const sessionStatus = state.session?.status;
  const sessionClaims = state.session ? state.session.lastActiveToken?.jwt?.claims : null;
  const factorVerificationAge = state.session ? state.session.factorVerificationAge : null;
  const actor = session?.actor;
  const organization = state.organization;
  const orgId = state.organization ? state.organization.id : state.organization;
  const orgSlug = organization?.slug;
  const membership = organization ? user?.organizationMemberships?.find((om) => om.organization.id === orgId) : organization;
  const orgPermissions = membership ? membership.permissions : membership;
  return {
    userId,
    user,
    sessionId,
    session,
    sessionStatus,
    sessionClaims,
    organization,
    orgId,
    orgRole: membership ? membership.role : membership,
    orgSlug,
    orgPermissions,
    actor,
    factorVerificationAge
  };
};
function inBrowser() {
  return typeof window !== "undefined";
}
const _on = (eventToHandlersMap, latestPayloadMap, event, handler, opts) => {
  const { notify } = opts || {};
  let handlers = eventToHandlersMap.get(event);
  if (!handlers) {
    handlers = [];
    eventToHandlersMap.set(event, handlers);
  }
  handlers.push(handler);
  if (notify && latestPayloadMap.has(event)) handler(latestPayloadMap.get(event));
};
const _dispatch = (eventToHandlersMap, event, payload) => (eventToHandlersMap.get(event) || []).map((h) => h(payload));
const _off = (eventToHandlersMap, event, handler) => {
  const handlers = eventToHandlersMap.get(event);
  if (handlers) if (handler) handlers.splice(handlers.indexOf(handler) >>> 0, 1);
  else eventToHandlersMap.set(event, []);
};
const createEventBus = () => {
  const eventToHandlersMap = /* @__PURE__ */ new Map();
  const latestPayloadMap = /* @__PURE__ */ new Map();
  const eventToPredispatchHandlersMap = /* @__PURE__ */ new Map();
  const emit = (event, payload) => {
    latestPayloadMap.set(event, payload);
    _dispatch(eventToPredispatchHandlersMap, event, payload);
    _dispatch(eventToHandlersMap, event, payload);
  };
  return {
    on: (...args) => _on(eventToHandlersMap, latestPayloadMap, ...args),
    prioritizedOn: (...args) => _on(eventToPredispatchHandlersMap, latestPayloadMap, ...args),
    emit,
    off: (...args) => _off(eventToHandlersMap, ...args),
    prioritizedOff: (...args) => _off(eventToPredispatchHandlersMap, ...args),
    internal: { retrieveListeners: (event) => eventToHandlersMap.get(event) || [] }
  };
};
const clerkEvents = { Status: "status" };
const createClerkEventBus = () => {
  return createEventBus();
};
if (typeof window !== "undefined" && !window.global) {
  window.global = typeof global === "undefined" ? window : global;
}
var SignInButton = withClerk(
  ({ clerk, children, ...props }) => {
    const {
      // @ts-expect-error - appearance is a valid prop for SignInProps & SignInButtonPropsModal
      appearance,
      signUpFallbackRedirectUrl,
      forceRedirectUrl,
      fallbackRedirectUrl,
      signUpForceRedirectUrl,
      mode,
      initialValues,
      withSignUp,
      oauthFlow,
      ...rest
    } = props;
    children = normalizeWithDefaultValue(children, "Sign in");
    const child = assertSingleChild(children)("SignInButton");
    const clickHandler = () => {
      const opts = {
        forceRedirectUrl,
        fallbackRedirectUrl,
        signUpFallbackRedirectUrl,
        signUpForceRedirectUrl,
        initialValues,
        withSignUp,
        oauthFlow
      };
      if (mode === "modal") {
        return clerk.openSignIn({ ...opts, appearance });
      }
      return clerk.redirectToSignIn({
        ...opts,
        signInFallbackRedirectUrl: fallbackRedirectUrl,
        signInForceRedirectUrl: forceRedirectUrl
      });
    };
    const wrappedChildClickHandler = async (e) => {
      if (child && typeof child === "object" && "props" in child) {
        await safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };
    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React7.cloneElement(child, childProps);
  },
  { component: "SignInButton", renderWhileLoading: true }
);
var SignInWithMetamaskButton = withClerk(
  ({ clerk, children, ...props }) => {
    const { redirectUrl, ...rest } = props;
    children = normalizeWithDefaultValue(children, "Sign in with Metamask");
    const child = assertSingleChild(children)("SignInWithMetamaskButton");
    const clickHandler = async () => {
      async function authenticate() {
        await clerk.authenticateWithMetamask({ redirectUrl: redirectUrl || void 0 });
      }
      void authenticate();
    };
    const wrappedChildClickHandler = async (e) => {
      await safeExecute(child.props.onClick)(e);
      return clickHandler();
    };
    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React7.cloneElement(child, childProps);
  },
  { component: "SignInWithMetamask", renderWhileLoading: true }
);
var SignOutButton = withClerk(
  ({ clerk, children, ...props }) => {
    const { redirectUrl = "/", signOutOptions, ...rest } = props;
    children = normalizeWithDefaultValue(children, "Sign out");
    const child = assertSingleChild(children)("SignOutButton");
    const clickHandler = () => clerk.signOut({ redirectUrl, ...signOutOptions });
    const wrappedChildClickHandler = async (e) => {
      await safeExecute(child.props.onClick)(e);
      return clickHandler();
    };
    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React7.cloneElement(child, childProps);
  },
  { component: "SignOutButton", renderWhileLoading: true }
);
var SignUpButton = withClerk(
  ({ clerk, children, ...props }) => {
    const {
      // @ts-expect-error - appearance is a valid prop for SignUpProps & SignUpButtonPropsModal
      appearance,
      // @ts-expect-error - unsafeMetadata is a valid prop for SignUpProps & SignUpButtonPropsModal
      unsafeMetadata,
      fallbackRedirectUrl,
      forceRedirectUrl,
      signInFallbackRedirectUrl,
      signInForceRedirectUrl,
      mode,
      initialValues,
      oauthFlow,
      ...rest
    } = props;
    children = normalizeWithDefaultValue(children, "Sign up");
    const child = assertSingleChild(children)("SignUpButton");
    const clickHandler = () => {
      const opts = {
        fallbackRedirectUrl,
        forceRedirectUrl,
        signInFallbackRedirectUrl,
        signInForceRedirectUrl,
        initialValues,
        oauthFlow
      };
      if (mode === "modal") {
        return clerk.openSignUp({
          ...opts,
          appearance,
          unsafeMetadata
        });
      }
      return clerk.redirectToSignUp({
        ...opts,
        signUpFallbackRedirectUrl: fallbackRedirectUrl,
        signUpForceRedirectUrl: forceRedirectUrl
      });
    };
    const wrappedChildClickHandler = async (e) => {
      if (child && typeof child === "object" && "props" in child) {
        await safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };
    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React7.cloneElement(child, childProps);
  },
  { component: "SignUpButton", renderWhileLoading: true }
);
var defaultSignInErrors = () => ({
  fields: {
    identifier: null,
    password: null,
    code: null
  },
  raw: null,
  global: null
});
var defaultSignUpErrors = () => ({
  fields: {
    firstName: null,
    lastName: null,
    emailAddress: null,
    phoneNumber: null,
    password: null,
    username: null,
    code: null,
    captcha: null,
    legalAccepted: null
  },
  raw: null,
  global: null
});
var StateProxy = class {
  constructor(isomorphicClerk) {
    this.isomorphicClerk = isomorphicClerk;
    this.signInSignalProxy = this.buildSignInProxy();
    this.signUpSignalProxy = this.buildSignUpProxy();
  }
  signInSignal() {
    return this.signInSignalProxy;
  }
  signUpSignal() {
    return this.signUpSignalProxy;
  }
  buildSignInProxy() {
    const gateProperty = this.gateProperty.bind(this);
    const target = () => this.client.signIn.__internal_future;
    return {
      errors: defaultSignInErrors(),
      fetchStatus: "idle",
      signIn: {
        status: "needs_identifier",
        availableStrategies: [],
        isTransferable: false,
        get id() {
          return gateProperty(target, "id", void 0);
        },
        get supportedFirstFactors() {
          return gateProperty(target, "supportedFirstFactors", []);
        },
        get supportedSecondFactors() {
          return gateProperty(target, "supportedSecondFactors", []);
        },
        get secondFactorVerification() {
          return gateProperty(target, "secondFactorVerification", {
            status: null,
            error: null,
            expireAt: null,
            externalVerificationRedirectURL: null,
            nonce: null,
            attempts: null,
            message: null,
            strategy: null,
            verifiedAtClient: null,
            verifiedFromTheSameClient: () => false,
            __internal_toSnapshot: () => {
              throw new Error("__internal_toSnapshot called before Clerk is loaded");
            },
            pathRoot: "",
            reload: () => {
              throw new Error("__internal_toSnapshot called before Clerk is loaded");
            }
          });
        },
        get identifier() {
          return gateProperty(target, "identifier", null);
        },
        get createdSessionId() {
          return gateProperty(target, "createdSessionId", null);
        },
        get userData() {
          return gateProperty(target, "userData", {});
        },
        get firstFactorVerification() {
          return gateProperty(target, "firstFactorVerification", {
            status: null,
            error: null,
            expireAt: null,
            externalVerificationRedirectURL: null,
            nonce: null,
            attempts: null,
            message: null,
            strategy: null,
            verifiedAtClient: null,
            verifiedFromTheSameClient: () => false,
            __internal_toSnapshot: () => {
              throw new Error("__internal_toSnapshot called before Clerk is loaded");
            },
            pathRoot: "",
            reload: () => {
              throw new Error("__internal_toSnapshot called before Clerk is loaded");
            }
          });
        },
        create: this.gateMethod(target, "create"),
        password: this.gateMethod(target, "password"),
        sso: this.gateMethod(target, "sso"),
        finalize: this.gateMethod(target, "finalize"),
        emailCode: this.wrapMethods(() => target().emailCode, ["sendCode", "verifyCode"]),
        emailLink: this.wrapStruct(
          () => target().emailLink,
          ["sendLink", "waitForVerification"],
          ["verification"],
          { verification: null }
        ),
        resetPasswordEmailCode: this.wrapMethods(() => target().resetPasswordEmailCode, [
          "sendCode",
          "verifyCode",
          "submitPassword"
        ]),
        phoneCode: this.wrapMethods(() => target().phoneCode, ["sendCode", "verifyCode"]),
        mfa: this.wrapMethods(() => target().mfa, [
          "sendPhoneCode",
          "verifyPhoneCode",
          "verifyTOTP",
          "verifyBackupCode"
        ]),
        ticket: this.gateMethod(target, "ticket"),
        passkey: this.gateMethod(target, "passkey"),
        web3: this.gateMethod(target, "web3")
      }
    };
  }
  buildSignUpProxy() {
    const gateProperty = this.gateProperty.bind(this);
    const gateMethod = this.gateMethod.bind(this);
    const wrapMethods = this.wrapMethods.bind(this);
    const target = () => this.client.signUp.__internal_future;
    return {
      errors: defaultSignUpErrors(),
      fetchStatus: "idle",
      signUp: {
        get id() {
          return gateProperty(target, "id", void 0);
        },
        get requiredFields() {
          return gateProperty(target, "requiredFields", []);
        },
        get optionalFields() {
          return gateProperty(target, "optionalFields", []);
        },
        get missingFields() {
          return gateProperty(target, "missingFields", []);
        },
        get username() {
          return gateProperty(target, "username", null);
        },
        get firstName() {
          return gateProperty(target, "firstName", null);
        },
        get lastName() {
          return gateProperty(target, "lastName", null);
        },
        get emailAddress() {
          return gateProperty(target, "emailAddress", null);
        },
        get phoneNumber() {
          return gateProperty(target, "phoneNumber", null);
        },
        get web3Wallet() {
          return gateProperty(target, "web3Wallet", null);
        },
        get hasPassword() {
          return gateProperty(target, "hasPassword", false);
        },
        get unsafeMetadata() {
          return gateProperty(target, "unsafeMetadata", {});
        },
        get createdSessionId() {
          return gateProperty(target, "createdSessionId", null);
        },
        get createdUserId() {
          return gateProperty(target, "createdUserId", null);
        },
        get abandonAt() {
          return gateProperty(target, "abandonAt", null);
        },
        get legalAcceptedAt() {
          return gateProperty(target, "legalAcceptedAt", null);
        },
        get locale() {
          return gateProperty(target, "locale", null);
        },
        get status() {
          return gateProperty(target, "status", "missing_requirements");
        },
        get unverifiedFields() {
          return gateProperty(target, "unverifiedFields", []);
        },
        get isTransferable() {
          return gateProperty(target, "isTransferable", false);
        },
        create: gateMethod(target, "create"),
        update: gateMethod(target, "update"),
        sso: gateMethod(target, "sso"),
        password: gateMethod(target, "password"),
        ticket: gateMethod(target, "ticket"),
        web3: gateMethod(target, "web3"),
        finalize: gateMethod(target, "finalize"),
        verifications: wrapMethods(() => target().verifications, [
          "sendEmailCode",
          "verifyEmailCode",
          "sendPhoneCode",
          "verifyPhoneCode"
        ])
      }
    };
  }
  __internal_effect(_) {
    throw new Error("__internal_effect called before Clerk is loaded");
  }
  __internal_computed(_) {
    throw new Error("__internal_computed called before Clerk is loaded");
  }
  get client() {
    const c = this.isomorphicClerk.client;
    if (!c) {
      throw new Error("Clerk client not ready");
    }
    return c;
  }
  gateProperty(getTarget, key, defaultValue) {
    return (() => {
      if (!inBrowser() || !this.isomorphicClerk.loaded) {
        return defaultValue;
      }
      const t = getTarget();
      return t[key];
    })();
  }
  gateMethod(getTarget, key) {
    return (async (...args) => {
      if (!inBrowser()) {
        return errorThrower$1.throw(`Attempted to call a method (${key}) that is not supported on the server.`);
      }
      if (!this.isomorphicClerk.loaded) {
        await new Promise((resolve) => this.isomorphicClerk.addOnLoaded(resolve));
      }
      const t = getTarget();
      return t[key].apply(t, args);
    });
  }
  wrapMethods(getTarget, keys) {
    return Object.fromEntries(keys.map((k) => [k, this.gateMethod(getTarget, k)]));
  }
  wrapStruct(getTarget, methods, getters, fallbacks) {
    const out = {};
    for (const m of methods) {
      out[m] = this.gateMethod(getTarget, m);
    }
    for (const g of getters) {
      Object.defineProperty(out, g, {
        get: () => this.gateProperty(getTarget, g, fallbacks[g]),
        enumerable: true
      });
    }
    return out;
  }
};
if (typeof globalThis.__BUILD_DISABLE_RHC__ === "undefined") {
  globalThis.__BUILD_DISABLE_RHC__ = false;
}
var SDK_METADATA = {
  name: "@clerk/clerk-react",
  version: "5.61.3",
  environment: "production"
};
var _status, _domain, _proxyUrl, _publishableKey, _eventBus, _stateProxy, _instance, _IsomorphicClerk_instances, waitForClerkJS_fn;
var _IsomorphicClerk = class _IsomorphicClerk2 {
  constructor(options) {
    __privateAdd(this, _IsomorphicClerk_instances);
    this.clerkjs = null;
    this.preopenOneTap = null;
    this.preopenUserVerification = null;
    this.preopenEnableOrganizationsPrompt = null;
    this.preopenSignIn = null;
    this.preopenCheckout = null;
    this.preopenPlanDetails = null;
    this.preopenSubscriptionDetails = null;
    this.preopenSignUp = null;
    this.preopenUserProfile = null;
    this.preopenOrganizationProfile = null;
    this.preopenCreateOrganization = null;
    this.preOpenWaitlist = null;
    this.premountSignInNodes = /* @__PURE__ */ new Map();
    this.premountSignUpNodes = /* @__PURE__ */ new Map();
    this.premountUserAvatarNodes = /* @__PURE__ */ new Map();
    this.premountUserProfileNodes = /* @__PURE__ */ new Map();
    this.premountUserButtonNodes = /* @__PURE__ */ new Map();
    this.premountOrganizationProfileNodes = /* @__PURE__ */ new Map();
    this.premountCreateOrganizationNodes = /* @__PURE__ */ new Map();
    this.premountOrganizationSwitcherNodes = /* @__PURE__ */ new Map();
    this.premountOrganizationListNodes = /* @__PURE__ */ new Map();
    this.premountMethodCalls = /* @__PURE__ */ new Map();
    this.premountWaitlistNodes = /* @__PURE__ */ new Map();
    this.premountPricingTableNodes = /* @__PURE__ */ new Map();
    this.premountAPIKeysNodes = /* @__PURE__ */ new Map();
    this.premountOAuthConsentNodes = /* @__PURE__ */ new Map();
    this.premountTaskChooseOrganizationNodes = /* @__PURE__ */ new Map();
    this.premountTaskResetPasswordNodes = /* @__PURE__ */ new Map();
    this.premountTaskSetupMFANodes = /* @__PURE__ */ new Map();
    this.premountAddListenerCalls = /* @__PURE__ */ new Map();
    this.loadedListeners = [];
    __privateAdd(this, _status, "loading");
    __privateAdd(this, _domain);
    __privateAdd(this, _proxyUrl);
    __privateAdd(this, _publishableKey);
    __privateAdd(this, _eventBus, createClerkEventBus());
    __privateAdd(this, _stateProxy);
    this.buildSignInUrl = (opts) => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildSignInUrl(opts)) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildSignInUrl", callback);
      }
    };
    this.buildSignUpUrl = (opts) => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildSignUpUrl(opts)) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildSignUpUrl", callback);
      }
    };
    this.buildAfterSignInUrl = (...args) => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignInUrl(...args)) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildAfterSignInUrl", callback);
      }
    };
    this.buildAfterSignUpUrl = (...args) => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignUpUrl(...args)) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildAfterSignUpUrl", callback);
      }
    };
    this.buildAfterSignOutUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignOutUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildAfterSignOutUrl", callback);
      }
    };
    this.buildNewSubscriptionRedirectUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildNewSubscriptionRedirectUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildNewSubscriptionRedirectUrl", callback);
      }
    };
    this.buildAfterMultiSessionSingleSignOutUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterMultiSessionSingleSignOutUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildAfterMultiSessionSingleSignOutUrl", callback);
      }
    };
    this.buildUserProfileUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildUserProfileUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildUserProfileUrl", callback);
      }
    };
    this.buildCreateOrganizationUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildCreateOrganizationUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildCreateOrganizationUrl", callback);
      }
    };
    this.buildOrganizationProfileUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildOrganizationProfileUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildOrganizationProfileUrl", callback);
      }
    };
    this.buildWaitlistUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildWaitlistUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildWaitlistUrl", callback);
      }
    };
    this.buildTasksUrl = () => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildTasksUrl()) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildTasksUrl", callback);
      }
    };
    this.buildUrlWithAuth = (to) => {
      const callback = () => {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.buildUrlWithAuth(to)) || "";
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("buildUrlWithAuth", callback);
      }
    };
    this.handleUnauthenticated = async () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.handleUnauthenticated();
      };
      if (this.clerkjs && this.loaded) {
        void callback();
      } else {
        this.premountMethodCalls.set("handleUnauthenticated", callback);
      }
    };
    this.on = (...args) => {
      var _a;
      if ((_a = this.clerkjs) == null ? void 0 : _a.on) {
        return this.clerkjs.on(...args);
      } else {
        __privateGet(this, _eventBus).on(...args);
      }
    };
    this.off = (...args) => {
      var _a;
      if ((_a = this.clerkjs) == null ? void 0 : _a.off) {
        return this.clerkjs.off(...args);
      } else {
        __privateGet(this, _eventBus).off(...args);
      }
    };
    this.addOnLoaded = (cb) => {
      this.loadedListeners.push(cb);
      if (this.loaded) {
        this.emitLoaded();
      }
    };
    this.emitLoaded = () => {
      this.loadedListeners.forEach((cb) => cb());
      this.loadedListeners = [];
    };
    this.beforeLoad = (clerkjs) => {
      if (!clerkjs) {
        throw new Error("Failed to hydrate latest Clerk JS");
      }
    };
    this.hydrateClerkJS = (clerkjs) => {
      var _a, _b;
      if (!clerkjs) {
        throw new Error("Failed to hydrate latest Clerk JS");
      }
      this.clerkjs = clerkjs;
      this.premountMethodCalls.forEach((cb) => cb());
      this.premountAddListenerCalls.forEach((listenerHandlers, listener) => {
        listenerHandlers.nativeUnsubscribe = clerkjs.addListener(listener);
      });
      (_a = __privateGet(this, _eventBus).internal.retrieveListeners("status")) == null ? void 0 : _a.forEach((listener) => {
        this.on("status", listener, { notify: true });
      });
      (_b = __privateGet(this, _eventBus).internal.retrieveListeners("queryClientStatus")) == null ? void 0 : _b.forEach((listener) => {
        this.on("queryClientStatus", listener, { notify: true });
      });
      if (this.preopenSignIn !== null) {
        clerkjs.openSignIn(this.preopenSignIn);
      }
      if (this.preopenCheckout !== null) {
        clerkjs.__internal_openCheckout(this.preopenCheckout);
      }
      if (this.preopenPlanDetails !== null) {
        clerkjs.__internal_openPlanDetails(this.preopenPlanDetails);
      }
      if (this.preopenSubscriptionDetails !== null) {
        clerkjs.__internal_openSubscriptionDetails(this.preopenSubscriptionDetails);
      }
      if (this.preopenSignUp !== null) {
        clerkjs.openSignUp(this.preopenSignUp);
      }
      if (this.preopenUserProfile !== null) {
        clerkjs.openUserProfile(this.preopenUserProfile);
      }
      if (this.preopenUserVerification !== null) {
        clerkjs.__internal_openReverification(this.preopenUserVerification);
      }
      if (this.preopenOneTap !== null) {
        clerkjs.openGoogleOneTap(this.preopenOneTap);
      }
      if (this.preopenOrganizationProfile !== null) {
        clerkjs.openOrganizationProfile(this.preopenOrganizationProfile);
      }
      if (this.preopenCreateOrganization !== null) {
        clerkjs.openCreateOrganization(this.preopenCreateOrganization);
      }
      if (this.preOpenWaitlist !== null) {
        clerkjs.openWaitlist(this.preOpenWaitlist);
      }
      if (this.preopenEnableOrganizationsPrompt) {
        clerkjs.__internal_openEnableOrganizationsPrompt(this.preopenEnableOrganizationsPrompt);
      }
      this.premountSignInNodes.forEach((props, node) => {
        clerkjs.mountSignIn(node, props);
      });
      this.premountSignUpNodes.forEach((props, node) => {
        clerkjs.mountSignUp(node, props);
      });
      this.premountUserProfileNodes.forEach((props, node) => {
        clerkjs.mountUserProfile(node, props);
      });
      this.premountUserAvatarNodes.forEach((props, node) => {
        clerkjs.mountUserAvatar(node, props);
      });
      this.premountUserButtonNodes.forEach((props, node) => {
        clerkjs.mountUserButton(node, props);
      });
      this.premountOrganizationListNodes.forEach((props, node) => {
        clerkjs.mountOrganizationList(node, props);
      });
      this.premountWaitlistNodes.forEach((props, node) => {
        clerkjs.mountWaitlist(node, props);
      });
      this.premountPricingTableNodes.forEach((props, node) => {
        clerkjs.mountPricingTable(node, props);
      });
      this.premountAPIKeysNodes.forEach((props, node) => {
        clerkjs.mountAPIKeys(node, props);
      });
      this.premountOAuthConsentNodes.forEach((props, node) => {
        clerkjs.__internal_mountOAuthConsent(node, props);
      });
      this.premountTaskChooseOrganizationNodes.forEach((props, node) => {
        clerkjs.mountTaskChooseOrganization(node, props);
      });
      this.premountTaskResetPasswordNodes.forEach((props, node) => {
        clerkjs.mountTaskResetPassword(node, props);
      });
      this.premountTaskSetupMFANodes.forEach((props, node) => {
        clerkjs.mountTaskSetupMFA(node, props);
      });
      if (typeof this.clerkjs.status === "undefined") {
        __privateGet(this, _eventBus).emit(clerkEvents.Status, "ready");
      }
      this.emitLoaded();
      return this.clerkjs;
    };
    this.__experimental_checkout = (...args) => {
      var _a;
      return (_a = this.clerkjs) == null ? void 0 : _a.__experimental_checkout(...args);
    };
    this.__unstable__updateProps = async (props) => {
      const clerkjs = await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this);
      if (clerkjs && "__unstable__updateProps" in clerkjs) {
        return clerkjs.__unstable__updateProps(props);
      }
    };
    this.setActive = (params) => {
      if (this.clerkjs) {
        return this.clerkjs.setActive(params);
      } else {
        return Promise.reject();
      }
    };
    this.openSignIn = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.openSignIn(props);
      } else {
        this.preopenSignIn = props;
      }
    };
    this.closeSignIn = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.closeSignIn();
      } else {
        this.preopenSignIn = null;
      }
    };
    this.__internal_openCheckout = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_openCheckout(props);
      } else {
        this.preopenCheckout = props;
      }
    };
    this.__internal_closeCheckout = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_closeCheckout();
      } else {
        this.preopenCheckout = null;
      }
    };
    this.__internal_openPlanDetails = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_openPlanDetails(props);
      } else {
        this.preopenPlanDetails = props;
      }
    };
    this.__internal_closePlanDetails = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_closePlanDetails();
      } else {
        this.preopenPlanDetails = null;
      }
    };
    this.__internal_openSubscriptionDetails = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_openSubscriptionDetails(props);
      } else {
        this.preopenSubscriptionDetails = props != null ? props : null;
      }
    };
    this.__internal_closeSubscriptionDetails = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_closeSubscriptionDetails();
      } else {
        this.preopenSubscriptionDetails = null;
      }
    };
    this.__internal_openReverification = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_openReverification(props);
      } else {
        this.preopenUserVerification = props;
      }
    };
    this.__internal_closeReverification = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_closeReverification();
      } else {
        this.preopenUserVerification = null;
      }
    };
    this.__internal_openEnableOrganizationsPrompt = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_openEnableOrganizationsPrompt(props);
      } else {
        this.preopenEnableOrganizationsPrompt = props;
      }
    };
    this.__internal_closeEnableOrganizationsPrompt = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_closeEnableOrganizationsPrompt();
      } else {
        this.preopenEnableOrganizationsPrompt = null;
      }
    };
    this.openGoogleOneTap = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.openGoogleOneTap(props);
      } else {
        this.preopenOneTap = props;
      }
    };
    this.closeGoogleOneTap = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.closeGoogleOneTap();
      } else {
        this.preopenOneTap = null;
      }
    };
    this.openUserProfile = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.openUserProfile(props);
      } else {
        this.preopenUserProfile = props;
      }
    };
    this.closeUserProfile = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.closeUserProfile();
      } else {
        this.preopenUserProfile = null;
      }
    };
    this.openOrganizationProfile = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.openOrganizationProfile(props);
      } else {
        this.preopenOrganizationProfile = props;
      }
    };
    this.closeOrganizationProfile = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.closeOrganizationProfile();
      } else {
        this.preopenOrganizationProfile = null;
      }
    };
    this.openCreateOrganization = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.openCreateOrganization(props);
      } else {
        this.preopenCreateOrganization = props;
      }
    };
    this.closeCreateOrganization = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.closeCreateOrganization();
      } else {
        this.preopenCreateOrganization = null;
      }
    };
    this.openWaitlist = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.openWaitlist(props);
      } else {
        this.preOpenWaitlist = props;
      }
    };
    this.closeWaitlist = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.closeWaitlist();
      } else {
        this.preOpenWaitlist = null;
      }
    };
    this.openSignUp = (props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.openSignUp(props);
      } else {
        this.preopenSignUp = props;
      }
    };
    this.closeSignUp = () => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.closeSignUp();
      } else {
        this.preopenSignUp = null;
      }
    };
    this.mountSignIn = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountSignIn(node, props);
      } else {
        this.premountSignInNodes.set(node, props);
      }
    };
    this.unmountSignIn = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountSignIn(node);
      } else {
        this.premountSignInNodes.delete(node);
      }
    };
    this.mountSignUp = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountSignUp(node, props);
      } else {
        this.premountSignUpNodes.set(node, props);
      }
    };
    this.unmountSignUp = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountSignUp(node);
      } else {
        this.premountSignUpNodes.delete(node);
      }
    };
    this.mountUserAvatar = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountUserAvatar(node, props);
      } else {
        this.premountUserAvatarNodes.set(node, props);
      }
    };
    this.unmountUserAvatar = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountUserAvatar(node);
      } else {
        this.premountUserAvatarNodes.delete(node);
      }
    };
    this.mountUserProfile = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountUserProfile(node, props);
      } else {
        this.premountUserProfileNodes.set(node, props);
      }
    };
    this.unmountUserProfile = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountUserProfile(node);
      } else {
        this.premountUserProfileNodes.delete(node);
      }
    };
    this.mountOrganizationProfile = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountOrganizationProfile(node, props);
      } else {
        this.premountOrganizationProfileNodes.set(node, props);
      }
    };
    this.unmountOrganizationProfile = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountOrganizationProfile(node);
      } else {
        this.premountOrganizationProfileNodes.delete(node);
      }
    };
    this.mountCreateOrganization = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountCreateOrganization(node, props);
      } else {
        this.premountCreateOrganizationNodes.set(node, props);
      }
    };
    this.unmountCreateOrganization = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountCreateOrganization(node);
      } else {
        this.premountCreateOrganizationNodes.delete(node);
      }
    };
    this.mountOrganizationSwitcher = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountOrganizationSwitcher(node, props);
      } else {
        this.premountOrganizationSwitcherNodes.set(node, props);
      }
    };
    this.unmountOrganizationSwitcher = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountOrganizationSwitcher(node);
      } else {
        this.premountOrganizationSwitcherNodes.delete(node);
      }
    };
    this.__experimental_prefetchOrganizationSwitcher = () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.__experimental_prefetchOrganizationSwitcher();
      };
      if (this.clerkjs && this.loaded) {
        void callback();
      } else {
        this.premountMethodCalls.set("__experimental_prefetchOrganizationSwitcher", callback);
      }
    };
    this.mountOrganizationList = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountOrganizationList(node, props);
      } else {
        this.premountOrganizationListNodes.set(node, props);
      }
    };
    this.unmountOrganizationList = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountOrganizationList(node);
      } else {
        this.premountOrganizationListNodes.delete(node);
      }
    };
    this.mountUserButton = (node, userButtonProps) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountUserButton(node, userButtonProps);
      } else {
        this.premountUserButtonNodes.set(node, userButtonProps);
      }
    };
    this.unmountUserButton = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountUserButton(node);
      } else {
        this.premountUserButtonNodes.delete(node);
      }
    };
    this.mountWaitlist = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountWaitlist(node, props);
      } else {
        this.premountWaitlistNodes.set(node, props);
      }
    };
    this.unmountWaitlist = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountWaitlist(node);
      } else {
        this.premountWaitlistNodes.delete(node);
      }
    };
    this.mountPricingTable = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountPricingTable(node, props);
      } else {
        this.premountPricingTableNodes.set(node, props);
      }
    };
    this.unmountPricingTable = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountPricingTable(node);
      } else {
        this.premountPricingTableNodes.delete(node);
      }
    };
    this.mountAPIKeys = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountAPIKeys(node, props);
      } else {
        this.premountAPIKeysNodes.set(node, props);
      }
    };
    this.unmountAPIKeys = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountAPIKeys(node);
      } else {
        this.premountAPIKeysNodes.delete(node);
      }
    };
    this.__internal_mountOAuthConsent = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_mountOAuthConsent(node, props);
      } else {
        this.premountOAuthConsentNodes.set(node, props);
      }
    };
    this.__internal_unmountOAuthConsent = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.__internal_unmountOAuthConsent(node);
      } else {
        this.premountOAuthConsentNodes.delete(node);
      }
    };
    this.mountTaskChooseOrganization = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountTaskChooseOrganization(node, props);
      } else {
        this.premountTaskChooseOrganizationNodes.set(node, props);
      }
    };
    this.unmountTaskChooseOrganization = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountTaskChooseOrganization(node);
      } else {
        this.premountTaskChooseOrganizationNodes.delete(node);
      }
    };
    this.mountTaskResetPassword = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountTaskResetPassword(node, props);
      } else {
        this.premountTaskResetPasswordNodes.set(node, props);
      }
    };
    this.unmountTaskResetPassword = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountTaskResetPassword(node);
      } else {
        this.premountTaskResetPasswordNodes.delete(node);
      }
    };
    this.mountTaskSetupMFA = (node, props) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.mountTaskSetupMFA(node, props);
      } else {
        this.premountTaskSetupMFANodes.set(node, props);
      }
    };
    this.unmountTaskSetupMFA = (node) => {
      if (this.clerkjs && this.loaded) {
        this.clerkjs.unmountTaskSetupMFA(node);
      } else {
        this.premountTaskSetupMFANodes.delete(node);
      }
    };
    this.addListener = (listener) => {
      if (this.clerkjs) {
        return this.clerkjs.addListener(listener);
      } else {
        const unsubscribe = () => {
          var _a;
          const listenerHandlers = this.premountAddListenerCalls.get(listener);
          if (listenerHandlers) {
            (_a = listenerHandlers.nativeUnsubscribe) == null ? void 0 : _a.call(listenerHandlers);
            this.premountAddListenerCalls.delete(listener);
          }
        };
        this.premountAddListenerCalls.set(listener, { unsubscribe, nativeUnsubscribe: void 0 });
        return unsubscribe;
      }
    };
    this.navigate = (to) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.navigate(to);
      };
      if (this.clerkjs && this.loaded) {
        void callback();
      } else {
        this.premountMethodCalls.set("navigate", callback);
      }
    };
    this.redirectWithAuth = async (...args) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectWithAuth(...args);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectWithAuth", callback);
        return;
      }
    };
    this.redirectToSignIn = async (opts) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToSignIn(opts);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToSignIn", callback);
        return;
      }
    };
    this.redirectToSignUp = async (opts) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToSignUp(opts);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToSignUp", callback);
        return;
      }
    };
    this.redirectToUserProfile = async () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToUserProfile();
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToUserProfile", callback);
        return;
      }
    };
    this.redirectToAfterSignUp = () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignUp();
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToAfterSignUp", callback);
      }
    };
    this.redirectToAfterSignIn = () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignIn();
      };
      if (this.clerkjs && this.loaded) {
        callback();
      } else {
        this.premountMethodCalls.set("redirectToAfterSignIn", callback);
      }
    };
    this.redirectToAfterSignOut = () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignOut();
      };
      if (this.clerkjs && this.loaded) {
        callback();
      } else {
        this.premountMethodCalls.set("redirectToAfterSignOut", callback);
      }
    };
    this.redirectToOrganizationProfile = async () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToOrganizationProfile();
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToOrganizationProfile", callback);
        return;
      }
    };
    this.redirectToCreateOrganization = async () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToCreateOrganization();
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToCreateOrganization", callback);
        return;
      }
    };
    this.redirectToWaitlist = async () => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToWaitlist();
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToWaitlist", callback);
        return;
      }
    };
    this.redirectToTasks = async (opts) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.redirectToTasks(opts);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("redirectToTasks", callback);
        return;
      }
    };
    this.handleRedirectCallback = async (params) => {
      var _a;
      const callback = () => {
        var _a2;
        return (_a2 = this.clerkjs) == null ? void 0 : _a2.handleRedirectCallback(params);
      };
      if (this.clerkjs && this.loaded) {
        void ((_a = callback()) == null ? void 0 : _a.catch(() => {
        }));
      } else {
        this.premountMethodCalls.set("handleRedirectCallback", callback);
      }
    };
    this.handleGoogleOneTapCallback = async (signInOrUp, params) => {
      var _a;
      const callback = () => {
        var _a2;
        return (_a2 = this.clerkjs) == null ? void 0 : _a2.handleGoogleOneTapCallback(signInOrUp, params);
      };
      if (this.clerkjs && this.loaded) {
        void ((_a = callback()) == null ? void 0 : _a.catch(() => {
        }));
      } else {
        this.premountMethodCalls.set("handleGoogleOneTapCallback", callback);
      }
    };
    this.handleEmailLinkVerification = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.handleEmailLinkVerification(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("handleEmailLinkVerification", callback);
      }
    };
    this.authenticateWithMetamask = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithMetamask(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("authenticateWithMetamask", callback);
      }
    };
    this.authenticateWithCoinbaseWallet = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithCoinbaseWallet(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("authenticateWithCoinbaseWallet", callback);
      }
    };
    this.authenticateWithBase = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithBase(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("authenticateWithBase", callback);
      }
    };
    this.authenticateWithOKXWallet = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithOKXWallet(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("authenticateWithOKXWallet", callback);
      }
    };
    this.authenticateWithSolana = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithSolana(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("authenticateWithSolana", callback);
      }
    };
    this.authenticateWithWeb3 = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithWeb3(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("authenticateWithWeb3", callback);
      }
    };
    this.authenticateWithGoogleOneTap = async (params) => {
      const clerkjs = await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this);
      return clerkjs.authenticateWithGoogleOneTap(params);
    };
    this.__internal_loadStripeJs = async () => {
      const clerkjs = await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this);
      return clerkjs.__internal_loadStripeJs();
    };
    this.createOrganization = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.createOrganization(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("createOrganization", callback);
      }
    };
    this.getOrganization = async (organizationId) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.getOrganization(organizationId);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("getOrganization", callback);
      }
    };
    this.joinWaitlist = async (params) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.joinWaitlist(params);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("joinWaitlist", callback);
      }
    };
    this.signOut = async (...args) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.signOut(...args);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("signOut", callback);
      }
    };
    this.__internal_attemptToEnableEnvironmentSetting = (options2) => {
      const callback = () => {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.__internal_attemptToEnableEnvironmentSetting(options2);
      };
      if (this.clerkjs && this.loaded) {
        return callback();
      } else {
        this.premountMethodCalls.set("__internal_attemptToEnableEnvironmentSetting", callback);
      }
    };
    const { Clerk = null, publishableKey } = options || {};
    __privateSet(this, _publishableKey, publishableKey);
    __privateSet(this, _proxyUrl, options == null ? void 0 : options.proxyUrl);
    __privateSet(this, _domain, options == null ? void 0 : options.domain);
    this.options = options;
    this.Clerk = Clerk;
    this.mode = inBrowser() ? "browser" : "server";
    __privateSet(this, _stateProxy, new StateProxy(this));
    if (!this.options.sdkMetadata) {
      this.options.sdkMetadata = SDK_METADATA;
    }
    __privateGet(this, _eventBus).emit(clerkEvents.Status, "loading");
    __privateGet(this, _eventBus).prioritizedOn(clerkEvents.Status, (status) => __privateSet(this, _status, status));
    if (__privateGet(this, _publishableKey)) {
      void this.loadClerkJS();
    }
  }
  get publishableKey() {
    return __privateGet(this, _publishableKey);
  }
  get loaded() {
    var _a;
    return ((_a = this.clerkjs) == null ? void 0 : _a.loaded) || false;
  }
  get status() {
    var _a;
    if (!this.clerkjs) {
      return __privateGet(this, _status);
    }
    return ((_a = this.clerkjs) == null ? void 0 : _a.status) || /**
    * Support older clerk-js versions.
    * If clerk-js is available but `.status` is missing it we need to fallback to `.loaded`.
    * Since "degraded" an "error" did not exist before,
    * map "loaded" to "ready" and "not loaded" to "loading".
    */
    (this.clerkjs.loaded ? "ready" : "loading");
  }
  static getOrCreateInstance(options) {
    if (!inBrowser() || !__privateGet(this, _instance) || options.Clerk && __privateGet(this, _instance).Clerk !== options.Clerk || // Allow hot swapping PKs on the client
    __privateGet(this, _instance).publishableKey !== options.publishableKey) {
      __privateSet(this, _instance, new _IsomorphicClerk2(options));
    }
    return __privateGet(this, _instance);
  }
  static clearInstance() {
    __privateSet(this, _instance, null);
  }
  get domain() {
    if (typeof window !== "undefined" && window.location) {
      return handleValueOrFn(__privateGet(this, _domain), new URL(window.location.href), "");
    }
    if (typeof __privateGet(this, _domain) === "function") {
      return errorThrower$1.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
    }
    return __privateGet(this, _domain) || "";
  }
  get proxyUrl() {
    if (typeof window !== "undefined" && window.location) {
      return handleValueOrFn(__privateGet(this, _proxyUrl), new URL(window.location.href), "");
    }
    if (typeof __privateGet(this, _proxyUrl) === "function") {
      return errorThrower$1.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
    }
    return __privateGet(this, _proxyUrl) || "";
  }
  /**
   * Accesses private options from the `Clerk` instance and defaults to
   * `IsomorphicClerk` options when in SSR context.
   *  @internal
   */
  __internal_getOption(key) {
    var _a, _b;
    return ((_a = this.clerkjs) == null ? void 0 : _a.__internal_getOption) ? (_b = this.clerkjs) == null ? void 0 : _b.__internal_getOption(key) : this.options[key];
  }
  get sdkMetadata() {
    var _a;
    return ((_a = this.clerkjs) == null ? void 0 : _a.sdkMetadata) || this.options.sdkMetadata || void 0;
  }
  get instanceType() {
    var _a;
    return (_a = this.clerkjs) == null ? void 0 : _a.instanceType;
  }
  get frontendApi() {
    var _a;
    return ((_a = this.clerkjs) == null ? void 0 : _a.frontendApi) || "";
  }
  get isStandardBrowser() {
    var _a;
    return ((_a = this.clerkjs) == null ? void 0 : _a.isStandardBrowser) || this.options.standardBrowser || false;
  }
  get __internal_queryClient() {
    var _a;
    return (_a = this.clerkjs) == null ? void 0 : _a.__internal_queryClient;
  }
  get isSatellite() {
    if (typeof window !== "undefined" && window.location) {
      return handleValueOrFn(this.options.isSatellite, new URL(window.location.href), false);
    }
    if (typeof this.options.isSatellite === "function") {
      return errorThrower$1.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
    }
    return false;
  }
  async loadClerkJS() {
    var _a;
    if (this.mode !== "browser" || this.loaded) {
      return;
    }
    if (typeof window !== "undefined") {
      window.__clerk_publishable_key = __privateGet(this, _publishableKey);
      window.__clerk_proxy_url = this.proxyUrl;
      window.__clerk_domain = this.domain;
    }
    try {
      if (this.Clerk) {
        let c;
        if (isConstructor(this.Clerk)) {
          c = new this.Clerk(__privateGet(this, _publishableKey), {
            proxyUrl: this.proxyUrl,
            domain: this.domain
          });
          this.beforeLoad(c);
          await c.load(this.options);
        } else {
          c = this.Clerk;
          if (!c.loaded) {
            this.beforeLoad(c);
            await c.load(this.options);
          }
        }
        global.Clerk = c;
      } else if (!__BUILD_DISABLE_RHC__) {
        if (!global.Clerk) {
          await loadClerkJsScript({
            ...this.options,
            publishableKey: __privateGet(this, _publishableKey),
            proxyUrl: this.proxyUrl,
            domain: this.domain,
            nonce: this.options.nonce
          });
        }
        if (!global.Clerk) {
          throw new Error("Failed to download latest ClerkJS. Contact support@clerk.com.");
        }
        this.beforeLoad(global.Clerk);
        await global.Clerk.load(this.options);
      }
      if ((_a = global.Clerk) == null ? void 0 : _a.loaded) {
        return this.hydrateClerkJS(global.Clerk);
      }
      return;
    } catch (err) {
      const error = err;
      __privateGet(this, _eventBus).emit(clerkEvents.Status, "error");
      console.error(error.stack || error.message || error);
      return;
    }
  }
  get version() {
    var _a;
    return (_a = this.clerkjs) == null ? void 0 : _a.version;
  }
  get client() {
    if (this.clerkjs) {
      return this.clerkjs.client;
    } else {
      return void 0;
    }
  }
  get session() {
    if (this.clerkjs) {
      return this.clerkjs.session;
    } else {
      return void 0;
    }
  }
  get user() {
    if (this.clerkjs) {
      return this.clerkjs.user;
    } else {
      return void 0;
    }
  }
  get organization() {
    if (this.clerkjs) {
      return this.clerkjs.organization;
    } else {
      return void 0;
    }
  }
  get telemetry() {
    if (this.clerkjs) {
      return this.clerkjs.telemetry;
    } else {
      return void 0;
    }
  }
  get __unstable__environment() {
    if (this.clerkjs) {
      return this.clerkjs.__unstable__environment;
    } else {
      return void 0;
    }
  }
  get isSignedIn() {
    if (this.clerkjs) {
      return this.clerkjs.isSignedIn;
    } else {
      return false;
    }
  }
  get billing() {
    var _a;
    return (_a = this.clerkjs) == null ? void 0 : _a.billing;
  }
  get __internal_state() {
    return this.loaded && this.clerkjs ? this.clerkjs.__internal_state : __privateGet(this, _stateProxy);
  }
  get apiKeys() {
    var _a;
    return (_a = this.clerkjs) == null ? void 0 : _a.apiKeys;
  }
  __unstable__setEnvironment(...args) {
    if (this.clerkjs && "__unstable__setEnvironment" in this.clerkjs) {
      this.clerkjs.__unstable__setEnvironment(args);
    } else {
      return void 0;
    }
  }
};
_status = /* @__PURE__ */ new WeakMap();
_domain = /* @__PURE__ */ new WeakMap();
_proxyUrl = /* @__PURE__ */ new WeakMap();
_publishableKey = /* @__PURE__ */ new WeakMap();
_eventBus = /* @__PURE__ */ new WeakMap();
_stateProxy = /* @__PURE__ */ new WeakMap();
_instance = /* @__PURE__ */ new WeakMap();
_IsomorphicClerk_instances = /* @__PURE__ */ new WeakSet();
waitForClerkJS_fn = function() {
  return new Promise((resolve) => {
    this.addOnLoaded(() => resolve(this.clerkjs));
  });
};
__privateAdd(_IsomorphicClerk, _instance);
var IsomorphicClerk = _IsomorphicClerk;
function ClerkContextProvider(props) {
  const { isomorphicClerkOptions, initialState, children } = props;
  const { isomorphicClerk: clerk, clerkStatus } = useLoadedIsomorphicClerk(isomorphicClerkOptions);
  const [state, setState] = React7.useState({
    client: clerk.client,
    session: clerk.session,
    user: clerk.user,
    organization: clerk.organization
  });
  React7.useEffect(() => {
    return clerk.addListener((e) => setState({ ...e }));
  }, []);
  const derivedState = deriveState(clerk.loaded, state, initialState);
  const clerkCtx = React7.useMemo(
    () => ({ value: clerk }),
    [
      // Only update the clerk reference on status change
      clerkStatus
    ]
  );
  const clientCtx = React7.useMemo(() => ({ value: state.client }), [state.client]);
  const {
    sessionId,
    sessionStatus,
    sessionClaims,
    session,
    userId,
    user,
    orgId,
    actor,
    organization,
    orgRole,
    orgSlug,
    orgPermissions,
    factorVerificationAge
  } = derivedState;
  const authCtx = React7.useMemo(() => {
    const value = {
      sessionId,
      sessionStatus,
      sessionClaims,
      userId,
      actor,
      orgId,
      orgRole,
      orgSlug,
      orgPermissions,
      factorVerificationAge
    };
    return { value };
  }, [sessionId, sessionStatus, userId, actor, orgId, orgRole, orgSlug, factorVerificationAge, sessionClaims == null ? void 0 : sessionClaims.__raw]);
  const sessionCtx = React7.useMemo(() => ({ value: session }), [sessionId, session]);
  const userCtx = React7.useMemo(() => ({ value: user }), [userId, user]);
  const organizationCtx = React7.useMemo(() => {
    const value = {
      organization
    };
    return { value };
  }, [orgId, organization]);
  return (
    // @ts-expect-error value passed is of type IsomorphicClerk where the context expects LoadedClerk
    /* @__PURE__ */ React7.createElement(IsomorphicClerkContext.Provider, { value: clerkCtx }, /* @__PURE__ */ React7.createElement(ClientContext.Provider, { value: clientCtx }, /* @__PURE__ */ React7.createElement(SessionContext.Provider, { value: sessionCtx }, /* @__PURE__ */ React7.createElement(OrganizationProvider, { ...organizationCtx.value }, /* @__PURE__ */ React7.createElement(AuthContext.Provider, { value: authCtx }, /* @__PURE__ */ React7.createElement(UserContext.Provider, { value: userCtx }, /* @__PURE__ */ React7.createElement(
      __experimental_CheckoutProvider,
      {
        value: void 0
      },
      children
    )))))))
  );
}
var useLoadedIsomorphicClerk = (options) => {
  const isomorphicClerkRef = React7.useRef(IsomorphicClerk.getOrCreateInstance(options));
  const [clerkStatus, setClerkStatus] = React7.useState(isomorphicClerkRef.current.status);
  React7.useEffect(() => {
    void isomorphicClerkRef.current.__unstable__updateProps({ appearance: options.appearance });
  }, [options.appearance]);
  React7.useEffect(() => {
    void isomorphicClerkRef.current.__unstable__updateProps({ options });
  }, [options.localization]);
  React7.useEffect(() => {
    isomorphicClerkRef.current.on("status", setClerkStatus);
    return () => {
      if (isomorphicClerkRef.current) {
        isomorphicClerkRef.current.off("status", setClerkStatus);
      }
      IsomorphicClerk.clearInstance();
    };
  }, []);
  return { isomorphicClerk: isomorphicClerkRef.current, clerkStatus };
};
function ClerkProviderBase(props) {
  const { initialState, children, __internal_bypassMissingPublishableKey, ...restIsomorphicClerkOptions } = props;
  const { publishableKey = "", Clerk: userInitialisedClerk } = restIsomorphicClerkOptions;
  if (!userInitialisedClerk && !__internal_bypassMissingPublishableKey) {
    if (!publishableKey) {
      errorThrower$1.throwMissingPublishableKeyError();
    } else if (publishableKey && !isPublishableKey(publishableKey)) {
      errorThrower$1.throwInvalidPublishableKeyError({ key: publishableKey });
    }
  }
  return /* @__PURE__ */ React7.createElement(
    ClerkContextProvider,
    {
      initialState,
      isomorphicClerkOptions: restIsomorphicClerkOptions
    },
    children
  );
}
var ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, "ClerkProvider", multipleClerkProvidersError);
ClerkProvider.displayName = "ClerkProvider";
setErrorThrowerOptions({ packageName: "@clerk/clerk-react" });
setClerkJsLoadingErrorPackageName("@clerk/clerk-react");
export {
  APIKeys,
  AuthenticateWithRedirectCallback,
  ClerkDegraded,
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  ClerkProvider,
  CreateOrganization,
  GoogleOneTap,
  OrganizationList,
  OrganizationProfile,
  OrganizationSwitcher,
  PricingTable,
  Protect,
  RedirectToCreateOrganization,
  RedirectToOrganizationProfile,
  RedirectToSignIn,
  RedirectToSignUp,
  RedirectToTasks,
  RedirectToUserProfile,
  SignIn,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUp,
  SignUpButton,
  SignedIn,
  SignedOut,
  TaskChooseOrganization,
  TaskResetPassword,
  TaskSetupMFA,
  UserAvatar,
  UserButton,
  UserProfile,
  Waitlist,
  __experimental_CheckoutProvider,
  PaymentElement as __experimental_PaymentElement,
  PaymentElementProvider as __experimental_PaymentElementProvider,
  useCheckout as __experimental_useCheckout,
  usePaymentElement as __experimental_usePaymentElement,
  useAuth,
  useClerk,
  useEmailLink,
  useOrganization,
  useOrganizationCreationDefaultsHook as useOrganizationCreationDefaults,
  useOrganizationList,
  useReverification,
  useSession,
  useSessionList,
  useSignIn,
  useSignUp,
  useUser
};
