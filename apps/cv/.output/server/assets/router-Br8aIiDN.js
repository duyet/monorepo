import { Link, createRootRoute, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import React__default, { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import require$$0 from "fs";
import * as ReactDOM from "react-dom";
import { Sun, Monitor, Moon, X, Menu as Menu$1 } from "lucide-react";
import { useTheme, ThemeProvider } from "next-themes";
const __vite_import_meta_env__ = {};
const importMetaEnv = typeof import.meta !== "undefined" ? __vite_import_meta_env__ : void 0;
const GA_MEASUREMENT_ID = importMetaEnv?.VITE_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_MEASUREMENT_ID;
const POSTHOG_API_KEY = importMetaEnv?.VITE_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const SELINE_TOKEN = importMetaEnv?.VITE_SELINE_TOKEN ?? process.env.NEXT_PUBLIC_SELINE_TOKEN;
function loadScript(src, attrs) {
  const el = document.createElement("script");
  el.src = src;
  el.async = true;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith("data-")) {
        el.dataset[k.slice(5)] = v;
      } else {
        el.setAttribute(k, v);
      }
    }
  }
  document.body.appendChild(el);
  return el;
}
function loadInlineScript(code) {
  const el = document.createElement("script");
  el.textContent = code;
  document.body.appendChild(el);
  return el;
}
function AnalyticWrapper() {
  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      loadScript(
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      );
      loadInlineScript(`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `);
    }
    if (SELINE_TOKEN) {
      loadScript("https://cdn.seline.so/seline.js", {
        "data-token": SELINE_TOKEN
      });
    }
    loadInlineScript(`
      !function(e,n,t){e.onload=function(){
      let e=n.createElement("script");
      e.src=t,n.body.appendChild(e)}}
      (window,document,"//pageview.duyet.net/pageview.js");
    `);
    loadInlineScript(`
      (function(c,l,a,r,i,t,y){
        c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "h2lw6wemnl");
    `);
    if (POSTHOG_API_KEY) {
      loadInlineScript(`
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${POSTHOG_API_KEY}',{api_host:'https://app.posthog.com'})
      `);
    }
    loadScript("https://j.duyet.net/p.js");
  }, []);
  return null;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Container({ children, className }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10",
        className
      ),
      children
    }
  );
}
var kindOf;
var hasRequiredKindOf;
function requireKindOf() {
  if (hasRequiredKindOf) return kindOf;
  hasRequiredKindOf = 1;
  var toString = Object.prototype.toString;
  kindOf = function kindOf2(val) {
    if (val === void 0) return "undefined";
    if (val === null) return "null";
    var type2 = typeof val;
    if (type2 === "boolean") return "boolean";
    if (type2 === "string") return "string";
    if (type2 === "number") return "number";
    if (type2 === "symbol") return "symbol";
    if (type2 === "function") {
      return isGeneratorFn(val) ? "generatorfunction" : "function";
    }
    if (isArray(val)) return "array";
    if (isBuffer(val)) return "buffer";
    if (isArguments(val)) return "arguments";
    if (isDate(val)) return "date";
    if (isError(val)) return "error";
    if (isRegexp(val)) return "regexp";
    switch (ctorName(val)) {
      case "Symbol":
        return "symbol";
      case "Promise":
        return "promise";
      // Set, Map, WeakSet, WeakMap
      case "WeakMap":
        return "weakmap";
      case "WeakSet":
        return "weakset";
      case "Map":
        return "map";
      case "Set":
        return "set";
      // 8-bit typed arrays
      case "Int8Array":
        return "int8array";
      case "Uint8Array":
        return "uint8array";
      case "Uint8ClampedArray":
        return "uint8clampedarray";
      // 16-bit typed arrays
      case "Int16Array":
        return "int16array";
      case "Uint16Array":
        return "uint16array";
      // 32-bit typed arrays
      case "Int32Array":
        return "int32array";
      case "Uint32Array":
        return "uint32array";
      case "Float32Array":
        return "float32array";
      case "Float64Array":
        return "float64array";
    }
    if (isGeneratorObj(val)) {
      return "generator";
    }
    type2 = toString.call(val);
    switch (type2) {
      case "[object Object]":
        return "object";
      // iterators
      case "[object Map Iterator]":
        return "mapiterator";
      case "[object Set Iterator]":
        return "setiterator";
      case "[object String Iterator]":
        return "stringiterator";
      case "[object Array Iterator]":
        return "arrayiterator";
    }
    return type2.slice(8, -1).toLowerCase().replace(/\s/g, "");
  };
  function ctorName(val) {
    return typeof val.constructor === "function" ? val.constructor.name : null;
  }
  function isArray(val) {
    if (Array.isArray) return Array.isArray(val);
    return val instanceof Array;
  }
  function isError(val) {
    return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
  }
  function isDate(val) {
    if (val instanceof Date) return true;
    return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
  }
  function isRegexp(val) {
    if (val instanceof RegExp) return true;
    return typeof val.flags === "string" && typeof val.ignoreCase === "boolean" && typeof val.multiline === "boolean" && typeof val.global === "boolean";
  }
  function isGeneratorFn(name, val) {
    return ctorName(name) === "GeneratorFunction";
  }
  function isGeneratorObj(val) {
    return typeof val.throw === "function" && typeof val.return === "function" && typeof val.next === "function";
  }
  function isArguments(val) {
    try {
      if (typeof val.length === "number" && typeof val.callee === "function") {
        return true;
      }
    } catch (err) {
      if (err.message.indexOf("callee") !== -1) {
        return true;
      }
    }
    return false;
  }
  function isBuffer(val) {
    if (val.constructor && typeof val.constructor.isBuffer === "function") {
      return val.constructor.isBuffer(val);
    }
    return false;
  }
  return kindOf;
}
var isExtendable;
var hasRequiredIsExtendable;
function requireIsExtendable() {
  if (hasRequiredIsExtendable) return isExtendable;
  hasRequiredIsExtendable = 1;
  isExtendable = function isExtendable2(val) {
    return typeof val !== "undefined" && val !== null && (typeof val === "object" || typeof val === "function");
  };
  return isExtendable;
}
var extendShallow;
var hasRequiredExtendShallow;
function requireExtendShallow() {
  if (hasRequiredExtendShallow) return extendShallow;
  hasRequiredExtendShallow = 1;
  var isObject = requireIsExtendable();
  extendShallow = function extend(o) {
    if (!isObject(o)) {
      o = {};
    }
    var len = arguments.length;
    for (var i = 1; i < len; i++) {
      var obj = arguments[i];
      if (isObject(obj)) {
        assign(o, obj);
      }
    }
    return o;
  };
  function assign(a, b) {
    for (var key in b) {
      if (hasOwn(b, key)) {
        a[key] = b[key];
      }
    }
  }
  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }
  return extendShallow;
}
var sectionMatter;
var hasRequiredSectionMatter;
function requireSectionMatter() {
  if (hasRequiredSectionMatter) return sectionMatter;
  hasRequiredSectionMatter = 1;
  var typeOf = requireKindOf();
  var extend = requireExtendShallow();
  sectionMatter = function(input, options2) {
    if (typeof options2 === "function") {
      options2 = { parse: options2 };
    }
    var file = toObject(input);
    var defaults2 = { section_delimiter: "---", parse: identity };
    var opts = extend({}, defaults2, options2);
    var delim = opts.section_delimiter;
    var lines = file.content.split(/\r?\n/);
    var sections = null;
    var section = createSection();
    var content = [];
    var stack = [];
    function initSections(val) {
      file.content = val;
      sections = [];
      content = [];
    }
    function closeSection(val) {
      if (stack.length) {
        section.key = getKey(stack[0], delim);
        section.content = val;
        opts.parse(section, sections);
        sections.push(section);
        section = createSection();
        content = [];
        stack = [];
      }
    }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var len = stack.length;
      var ln = line.trim();
      if (isDelimiter(ln, delim)) {
        if (ln.length === 3 && i !== 0) {
          if (len === 0 || len === 2) {
            content.push(line);
            continue;
          }
          stack.push(ln);
          section.data = content.join("\n");
          content = [];
          continue;
        }
        if (sections === null) {
          initSections(content.join("\n"));
        }
        if (len === 2) {
          closeSection(content.join("\n"));
        }
        stack.push(ln);
        continue;
      }
      content.push(line);
    }
    if (sections === null) {
      initSections(content.join("\n"));
    } else {
      closeSection(content.join("\n"));
    }
    file.sections = sections;
    return file;
  };
  function isDelimiter(line, delim) {
    if (line.slice(0, delim.length) !== delim) {
      return false;
    }
    if (line.charAt(delim.length + 1) === delim.slice(-1)) {
      return false;
    }
    return true;
  }
  function toObject(input) {
    if (typeOf(input) !== "object") {
      input = { content: input };
    }
    if (typeof input.content !== "string" && !isBuffer(input.content)) {
      throw new TypeError("expected a buffer or string");
    }
    input.content = input.content.toString();
    input.sections = [];
    return input;
  }
  function getKey(val, delim) {
    return val ? val.slice(delim.length).trim() : "";
  }
  function createSection() {
    return { key: "", data: "", content: "" };
  }
  function identity(val) {
    return val;
  }
  function isBuffer(val) {
    if (val && val.constructor && typeof val.constructor.isBuffer === "function") {
      return val.constructor.isBuffer(val);
    }
    return false;
  }
  return sectionMatter;
}
var engines = { exports: {} };
var jsYaml$1 = {};
var loader = {};
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function isNothing(subject) {
    return typeof subject === "undefined" || subject === null;
  }
  function isObject(subject) {
    return typeof subject === "object" && subject !== null;
  }
  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;
    else if (isNothing(sequence)) return [];
    return [sequence];
  }
  function extend(target, source) {
    var index, length, key, sourceKeys;
    if (source) {
      sourceKeys = Object.keys(source);
      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }
    return target;
  }
  function repeat(string, count2) {
    var result = "", cycle;
    for (cycle = 0; cycle < count2; cycle += 1) {
      result += string;
    }
    return result;
  }
  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }
  common.isNothing = isNothing;
  common.isObject = isObject;
  common.toArray = toArray;
  common.repeat = repeat;
  common.isNegativeZero = isNegativeZero;
  common.extend = extend;
  return common;
}
var exception;
var hasRequiredException;
function requireException() {
  if (hasRequiredException) return exception;
  hasRequiredException = 1;
  function YAMLException(reason, mark2) {
    Error.call(this);
    this.name = "YAMLException";
    this.reason = reason;
    this.mark = mark2;
    this.message = (this.reason || "(unknown reason)") + (this.mark ? " " + this.mark.toString() : "");
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack || "";
    }
  }
  YAMLException.prototype = Object.create(Error.prototype);
  YAMLException.prototype.constructor = YAMLException;
  YAMLException.prototype.toString = function toString(compact) {
    var result = this.name + ": ";
    result += this.reason || "(unknown reason)";
    if (!compact && this.mark) {
      result += " " + this.mark.toString();
    }
    return result;
  };
  exception = YAMLException;
  return exception;
}
var mark;
var hasRequiredMark;
function requireMark() {
  if (hasRequiredMark) return mark;
  hasRequiredMark = 1;
  var common2 = requireCommon();
  function Mark(name, buffer, position, line, column) {
    this.name = name;
    this.buffer = buffer;
    this.position = position;
    this.line = line;
    this.column = column;
  }
  Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
    var head, start, tail, end, snippet;
    if (!this.buffer) return null;
    indent = indent || 4;
    maxLength = maxLength || 75;
    head = "";
    start = this.position;
    while (start > 0 && "\0\r\n\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1) {
      start -= 1;
      if (this.position - start > maxLength / 2 - 1) {
        head = " ... ";
        start += 5;
        break;
      }
    }
    tail = "";
    end = this.position;
    while (end < this.buffer.length && "\0\r\n\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1) {
      end += 1;
      if (end - this.position > maxLength / 2 - 1) {
        tail = " ... ";
        end -= 5;
        break;
      }
    }
    snippet = this.buffer.slice(start, end);
    return common2.repeat(" ", indent) + head + snippet + tail + "\n" + common2.repeat(" ", indent + this.position - start + head.length) + "^";
  };
  Mark.prototype.toString = function toString(compact) {
    var snippet, where = "";
    if (this.name) {
      where += 'in "' + this.name + '" ';
    }
    where += "at line " + (this.line + 1) + ", column " + (this.column + 1);
    if (!compact) {
      snippet = this.getSnippet();
      if (snippet) {
        where += ":\n" + snippet;
      }
    }
    return where;
  };
  mark = Mark;
  return mark;
}
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  var YAMLException = requireException();
  var TYPE_CONSTRUCTOR_OPTIONS = [
    "kind",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "defaultStyle",
    "styleAliases"
  ];
  var YAML_NODE_KINDS = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function compileStyleAliases(map2) {
    var result = {};
    if (map2 !== null) {
      Object.keys(map2).forEach(function(style) {
        map2[style].forEach(function(alias) {
          result[String(alias)] = style;
        });
      });
    }
    return result;
  }
  function Type(tag, options2) {
    options2 = options2 || {};
    Object.keys(options2).forEach(function(name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });
    this.tag = tag;
    this.kind = options2["kind"] || null;
    this.resolve = options2["resolve"] || function() {
      return true;
    };
    this.construct = options2["construct"] || function(data) {
      return data;
    };
    this.instanceOf = options2["instanceOf"] || null;
    this.predicate = options2["predicate"] || null;
    this.represent = options2["represent"] || null;
    this.defaultStyle = options2["defaultStyle"] || null;
    this.styleAliases = compileStyleAliases(options2["styleAliases"] || null);
    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }
  type = Type;
  return type;
}
var schema;
var hasRequiredSchema;
function requireSchema() {
  if (hasRequiredSchema) return schema;
  hasRequiredSchema = 1;
  var common2 = requireCommon();
  var YAMLException = requireException();
  var Type = requireType();
  function compileList(schema2, name, result) {
    var exclude = [];
    schema2.include.forEach(function(includedSchema) {
      result = compileList(includedSchema, name, result);
    });
    schema2[name].forEach(function(currentType) {
      result.forEach(function(previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
          exclude.push(previousIndex);
        }
      });
      result.push(currentType);
    });
    return result.filter(function(type2, index) {
      return exclude.indexOf(index) === -1;
    });
  }
  function compileMap() {
    var result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {}
    }, index, length;
    function collectType(type2) {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }
  function Schema(definition) {
    this.include = definition.include || [];
    this.implicit = definition.implicit || [];
    this.explicit = definition.explicit || [];
    this.implicit.forEach(function(type2) {
      if (type2.loadKind && type2.loadKind !== "scalar") {
        throw new YAMLException("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      }
    });
    this.compiledImplicit = compileList(this, "implicit", []);
    this.compiledExplicit = compileList(this, "explicit", []);
    this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
  }
  Schema.DEFAULT = null;
  Schema.create = function createSchema() {
    var schemas, types;
    switch (arguments.length) {
      case 1:
        schemas = Schema.DEFAULT;
        types = arguments[0];
        break;
      case 2:
        schemas = arguments[0];
        types = arguments[1];
        break;
      default:
        throw new YAMLException("Wrong number of arguments for Schema.create function");
    }
    schemas = common2.toArray(schemas);
    types = common2.toArray(types);
    if (!schemas.every(function(schema2) {
      return schema2 instanceof Schema;
    })) {
      throw new YAMLException("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");
    }
    if (!types.every(function(type2) {
      return type2 instanceof Type;
    })) {
      throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    return new Schema({
      include: schemas,
      explicit: types
    });
  };
  schema = Schema;
  return schema;
}
var str;
var hasRequiredStr;
function requireStr() {
  if (hasRequiredStr) return str;
  hasRequiredStr = 1;
  var Type = requireType();
  str = new Type("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(data) {
      return data !== null ? data : "";
    }
  });
  return str;
}
var seq;
var hasRequiredSeq;
function requireSeq() {
  if (hasRequiredSeq) return seq;
  hasRequiredSeq = 1;
  var Type = requireType();
  seq = new Type("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(data) {
      return data !== null ? data : [];
    }
  });
  return seq;
}
var map;
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap) return map;
  hasRequiredMap = 1;
  var Type = requireType();
  map = new Type("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(data) {
      return data !== null ? data : {};
    }
  });
  return map;
}
var failsafe;
var hasRequiredFailsafe;
function requireFailsafe() {
  if (hasRequiredFailsafe) return failsafe;
  hasRequiredFailsafe = 1;
  var Schema = requireSchema();
  failsafe = new Schema({
    explicit: [
      requireStr(),
      requireSeq(),
      requireMap()
    ]
  });
  return failsafe;
}
var _null;
var hasRequired_null;
function require_null() {
  if (hasRequired_null) return _null;
  hasRequired_null = 1;
  var Type = requireType();
  function resolveYamlNull(data) {
    if (data === null) return true;
    var max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
  }
  function constructYamlNull() {
    return null;
  }
  function isNull(object) {
    return object === null;
  }
  _null = new Type("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      }
    },
    defaultStyle: "lowercase"
  });
  return _null;
}
var bool;
var hasRequiredBool;
function requireBool() {
  if (hasRequiredBool) return bool;
  hasRequiredBool = 1;
  var Type = requireType();
  function resolveYamlBoolean(data) {
    if (data === null) return false;
    var max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
  }
  function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
  }
  function isBoolean(object) {
    return Object.prototype.toString.call(object) === "[object Boolean]";
  }
  bool = new Type("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function(object) {
        return object ? "true" : "false";
      },
      uppercase: function(object) {
        return object ? "TRUE" : "FALSE";
      },
      camelcase: function(object) {
        return object ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  });
  return bool;
}
var int;
var hasRequiredInt;
function requireInt() {
  if (hasRequiredInt) return int;
  hasRequiredInt = 1;
  var common2 = requireCommon();
  var Type = requireType();
  function isHexCode(c) {
    return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
  }
  function isOctCode(c) {
    return 48 <= c && c <= 55;
  }
  function isDecCode(c) {
    return 48 <= c && c <= 57;
  }
  function resolveYamlInteger(data) {
    if (data === null) return false;
    var max = data.length, index = 0, hasDigits = false, ch;
    if (!max) return false;
    ch = data[index];
    if (ch === "-" || ch === "+") {
      ch = data[++index];
    }
    if (ch === "0") {
      if (index + 1 === max) return true;
      ch = data[++index];
      if (ch === "b") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch === "_") continue;
          if (ch !== "0" && ch !== "1") return false;
          hasDigits = true;
        }
        return hasDigits && ch !== "_";
      }
      if (ch === "x") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch === "_") continue;
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== "_";
      }
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "_") return false;
    for (; index < max; index++) {
      ch = data[index];
      if (ch === "_") continue;
      if (ch === ":") break;
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    if (!hasDigits || ch === "_") return false;
    if (ch !== ":") return true;
    return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
  }
  function constructYamlInteger(data) {
    var value = data, sign = 1, ch, base, digits = [];
    if (value.indexOf("_") !== -1) {
      value = value.replace(/_/g, "");
    }
    ch = value[0];
    if (ch === "-" || ch === "+") {
      if (ch === "-") sign = -1;
      value = value.slice(1);
      ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
      if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
      if (value[1] === "x") return sign * parseInt(value, 16);
      return sign * parseInt(value, 8);
    }
    if (value.indexOf(":") !== -1) {
      value.split(":").forEach(function(v) {
        digits.unshift(parseInt(v, 10));
      });
      value = 0;
      base = 1;
      digits.forEach(function(d) {
        value += d * base;
        base *= 60;
      });
      return sign * value;
    }
    return sign * parseInt(value, 10);
  }
  function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common2.isNegativeZero(object));
  }
  int = new Type("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function(obj) {
        return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
      },
      octal: function(obj) {
        return obj >= 0 ? "0" + obj.toString(8) : "-0" + obj.toString(8).slice(1);
      },
      decimal: function(obj) {
        return obj.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(obj) {
        return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  });
  return int;
}
var float;
var hasRequiredFloat;
function requireFloat() {
  if (hasRequiredFloat) return float;
  hasRequiredFloat = 1;
  var common2 = requireCommon();
  var Type = requireType();
  var YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function resolveYamlFloat(data) {
    if (data === null) return false;
    if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    data[data.length - 1] === "_") {
      return false;
    }
    return true;
  }
  function constructYamlFloat(data) {
    var value, sign, base, digits;
    value = data.replace(/_/g, "").toLowerCase();
    sign = value[0] === "-" ? -1 : 1;
    digits = [];
    if ("+-".indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }
    if (value === ".inf") {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === ".nan") {
      return NaN;
    } else if (value.indexOf(":") >= 0) {
      value.split(":").forEach(function(v) {
        digits.unshift(parseFloat(v, 10));
      });
      value = 0;
      base = 1;
      digits.forEach(function(d) {
        value += d * base;
        base *= 60;
      });
      return sign * value;
    }
    return sign * parseFloat(value, 10);
  }
  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  function representYamlFloat(object, style) {
    var res;
    if (isNaN(object)) {
      switch (style) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    } else if (common2.isNegativeZero(object)) {
      return "-0.0";
    }
    res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
  }
  function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common2.isNegativeZero(object));
  }
  float = new Type("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: "lowercase"
  });
  return float;
}
var json;
var hasRequiredJson;
function requireJson() {
  if (hasRequiredJson) return json;
  hasRequiredJson = 1;
  var Schema = requireSchema();
  json = new Schema({
    include: [
      requireFailsafe()
    ],
    implicit: [
      require_null(),
      requireBool(),
      requireInt(),
      requireFloat()
    ]
  });
  return json;
}
var core;
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore) return core;
  hasRequiredCore = 1;
  var Schema = requireSchema();
  core = new Schema({
    include: [
      requireJson()
    ]
  });
  return core;
}
var timestamp;
var hasRequiredTimestamp;
function requireTimestamp() {
  if (hasRequiredTimestamp) return timestamp;
  hasRequiredTimestamp = 1;
  var Type = requireType();
  var YAML_DATE_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  );
  var YAML_TIMESTAMP_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }
  function constructYamlTimestamp(data) {
    var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
    match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error("Date resolve error");
    year = +match[1];
    month = +match[2] - 1;
    day = +match[3];
    if (!match[4]) {
      return new Date(Date.UTC(year, month, day));
    }
    hour = +match[4];
    minute = +match[5];
    second = +match[6];
    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) {
        fraction += "0";
      }
      fraction = +fraction;
    }
    if (match[9]) {
      tz_hour = +match[10];
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 6e4;
      if (match[9] === "-") delta = -delta;
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
  }
  function representYamlTimestamp(object) {
    return object.toISOString();
  }
  timestamp = new Type("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });
  return timestamp;
}
var merge;
var hasRequiredMerge;
function requireMerge() {
  if (hasRequiredMerge) return merge;
  hasRequiredMerge = 1;
  var Type = requireType();
  function resolveYamlMerge(data) {
    return data === "<<" || data === null;
  }
  merge = new Type("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
  });
  return merge;
}
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var binary;
var hasRequiredBinary;
function requireBinary() {
  if (hasRequiredBinary) return binary;
  hasRequiredBinary = 1;
  var NodeBuffer;
  try {
    var _require = commonjsRequire;
    NodeBuffer = _require("buffer").Buffer;
  } catch (__) {
  }
  var Type = requireType();
  var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
  function resolveYamlBinary(data) {
    if (data === null) return false;
    var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
    for (idx = 0; idx < max; idx++) {
      code = map2.indexOf(data.charAt(idx));
      if (code > 64) continue;
      if (code < 0) return false;
      bitlen += 6;
    }
    return bitlen % 8 === 0;
  }
  function constructYamlBinary(data) {
    var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
    for (idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      }
      bits = bits << 6 | map2.indexOf(input.charAt(idx));
    }
    tailbits = max % 4 * 6;
    if (tailbits === 0) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 255);
      result.push(bits >> 2 & 255);
    } else if (tailbits === 12) {
      result.push(bits >> 4 & 255);
    }
    if (NodeBuffer) {
      return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
    }
    return result;
  }
  function representYamlBinary(object) {
    var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
    for (idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map2[bits >> 18 & 63];
        result += map2[bits >> 12 & 63];
        result += map2[bits >> 6 & 63];
        result += map2[bits & 63];
      }
      bits = (bits << 8) + object[idx];
    }
    tail = max % 3;
    if (tail === 0) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    } else if (tail === 2) {
      result += map2[bits >> 10 & 63];
      result += map2[bits >> 4 & 63];
      result += map2[bits << 2 & 63];
      result += map2[64];
    } else if (tail === 1) {
      result += map2[bits >> 2 & 63];
      result += map2[bits << 4 & 63];
      result += map2[64];
      result += map2[64];
    }
    return result;
  }
  function isBinary(object) {
    return NodeBuffer && NodeBuffer.isBuffer(object);
  }
  binary = new Type("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
  return binary;
}
var omap;
var hasRequiredOmap;
function requireOmap() {
  if (hasRequiredOmap) return omap;
  hasRequiredOmap = 1;
  var Type = requireType();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var _toString = Object.prototype.toString;
  function resolveYamlOmap(data) {
    if (data === null) return true;
    var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;
      if (_toString.call(pair) !== "[object Object]") return false;
      for (pairKey in pair) {
        if (_hasOwnProperty.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;
          else return false;
        }
      }
      if (!pairHasKey) return false;
      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
      else return false;
    }
    return true;
  }
  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }
  omap = new Type("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
  return omap;
}
var pairs;
var hasRequiredPairs;
function requirePairs() {
  if (hasRequiredPairs) return pairs;
  hasRequiredPairs = 1;
  var Type = requireType();
  var _toString = Object.prototype.toString;
  function resolveYamlPairs(data) {
    if (data === null) return true;
    var index, length, pair, keys, result, object = data;
    result = new Array(object.length);
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      if (_toString.call(pair) !== "[object Object]") return false;
      keys = Object.keys(pair);
      if (keys.length !== 1) return false;
      result[index] = [keys[0], pair[keys[0]]];
    }
    return true;
  }
  function constructYamlPairs(data) {
    if (data === null) return [];
    var index, length, pair, keys, result, object = data;
    result = new Array(object.length);
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }
    return result;
  }
  pairs = new Type("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
  return pairs;
}
var set;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet) return set;
  hasRequiredSet = 1;
  var Type = requireType();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveYamlSet(data) {
    if (data === null) return true;
    var key, object = data;
    for (key in object) {
      if (_hasOwnProperty.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }
    return true;
  }
  function constructYamlSet(data) {
    return data !== null ? data : {};
  }
  set = new Type("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });
  return set;
}
var default_safe;
var hasRequiredDefault_safe;
function requireDefault_safe() {
  if (hasRequiredDefault_safe) return default_safe;
  hasRequiredDefault_safe = 1;
  var Schema = requireSchema();
  default_safe = new Schema({
    include: [
      requireCore()
    ],
    implicit: [
      requireTimestamp(),
      requireMerge()
    ],
    explicit: [
      requireBinary(),
      requireOmap(),
      requirePairs(),
      requireSet()
    ]
  });
  return default_safe;
}
var _undefined;
var hasRequired_undefined;
function require_undefined() {
  if (hasRequired_undefined) return _undefined;
  hasRequired_undefined = 1;
  var Type = requireType();
  function resolveJavascriptUndefined() {
    return true;
  }
  function constructJavascriptUndefined() {
    return void 0;
  }
  function representJavascriptUndefined() {
    return "";
  }
  function isUndefined(object) {
    return typeof object === "undefined";
  }
  _undefined = new Type("tag:yaml.org,2002:js/undefined", {
    kind: "scalar",
    resolve: resolveJavascriptUndefined,
    construct: constructJavascriptUndefined,
    predicate: isUndefined,
    represent: representJavascriptUndefined
  });
  return _undefined;
}
var regexp;
var hasRequiredRegexp;
function requireRegexp() {
  if (hasRequiredRegexp) return regexp;
  hasRequiredRegexp = 1;
  var Type = requireType();
  function resolveJavascriptRegExp(data) {
    if (data === null) return false;
    if (data.length === 0) return false;
    var regexp2 = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
    if (regexp2[0] === "/") {
      if (tail) modifiers = tail[1];
      if (modifiers.length > 3) return false;
      if (regexp2[regexp2.length - modifiers.length - 1] !== "/") return false;
    }
    return true;
  }
  function constructJavascriptRegExp(data) {
    var regexp2 = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
    if (regexp2[0] === "/") {
      if (tail) modifiers = tail[1];
      regexp2 = regexp2.slice(1, regexp2.length - modifiers.length - 1);
    }
    return new RegExp(regexp2, modifiers);
  }
  function representJavascriptRegExp(object) {
    var result = "/" + object.source + "/";
    if (object.global) result += "g";
    if (object.multiline) result += "m";
    if (object.ignoreCase) result += "i";
    return result;
  }
  function isRegExp(object) {
    return Object.prototype.toString.call(object) === "[object RegExp]";
  }
  regexp = new Type("tag:yaml.org,2002:js/regexp", {
    kind: "scalar",
    resolve: resolveJavascriptRegExp,
    construct: constructJavascriptRegExp,
    predicate: isRegExp,
    represent: representJavascriptRegExp
  });
  return regexp;
}
var _function;
var hasRequired_function;
function require_function() {
  if (hasRequired_function) return _function;
  hasRequired_function = 1;
  var esprima;
  try {
    var _require = commonjsRequire;
    esprima = _require("esprima");
  } catch (_) {
    if (typeof window !== "undefined") esprima = window.esprima;
  }
  var Type = requireType();
  function resolveJavascriptFunction(data) {
    if (data === null) return false;
    try {
      var source = "(" + data + ")", ast = esprima.parse(source, { range: true });
      if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  function constructJavascriptFunction(data) {
    var source = "(" + data + ")", ast = esprima.parse(source, { range: true }), params = [], body;
    if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
      throw new Error("Failed to resolve function");
    }
    ast.body[0].expression.params.forEach(function(param) {
      params.push(param.name);
    });
    body = ast.body[0].expression.body.range;
    if (ast.body[0].expression.body.type === "BlockStatement") {
      return new Function(params, source.slice(body[0] + 1, body[1] - 1));
    }
    return new Function(params, "return " + source.slice(body[0], body[1]));
  }
  function representJavascriptFunction(object) {
    return object.toString();
  }
  function isFunction2(object) {
    return Object.prototype.toString.call(object) === "[object Function]";
  }
  _function = new Type("tag:yaml.org,2002:js/function", {
    kind: "scalar",
    resolve: resolveJavascriptFunction,
    construct: constructJavascriptFunction,
    predicate: isFunction2,
    represent: representJavascriptFunction
  });
  return _function;
}
var default_full;
var hasRequiredDefault_full;
function requireDefault_full() {
  if (hasRequiredDefault_full) return default_full;
  hasRequiredDefault_full = 1;
  var Schema = requireSchema();
  default_full = Schema.DEFAULT = new Schema({
    include: [
      requireDefault_safe()
    ],
    explicit: [
      require_undefined(),
      requireRegexp(),
      require_function()
    ]
  });
  return default_full;
}
var hasRequiredLoader;
function requireLoader() {
  if (hasRequiredLoader) return loader;
  hasRequiredLoader = 1;
  var common2 = requireCommon();
  var YAMLException = requireException();
  var Mark = requireMark();
  var DEFAULT_SAFE_SCHEMA = requireDefault_safe();
  var DEFAULT_FULL_SCHEMA = requireDefault_full();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CONTEXT_FLOW_IN = 1;
  var CONTEXT_FLOW_OUT = 2;
  var CONTEXT_BLOCK_IN = 3;
  var CONTEXT_BLOCK_OUT = 4;
  var CHOMPING_CLIP = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP = 3;
  var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }
  function is_EOL(c) {
    return c === 10 || c === 13;
  }
  function is_WHITE_SPACE(c) {
    return c === 9 || c === 32;
  }
  function is_WS_OR_EOL(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
  }
  function is_FLOW_INDICATOR(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
  }
  function fromHexCode(c) {
    var lc;
    if (48 <= c && c <= 57) {
      return c - 48;
    }
    lc = c | 32;
    if (97 <= lc && lc <= 102) {
      return lc - 97 + 10;
    }
    return -1;
  }
  function escapedHexLen(c) {
    if (c === 120) {
      return 2;
    }
    if (c === 117) {
      return 4;
    }
    if (c === 85) {
      return 8;
    }
    return 0;
  }
  function fromDecimalCode(c) {
    if (48 <= c && c <= 57) {
      return c - 48;
    }
    return -1;
  }
  function simpleEscapeSequence(c) {
    return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
  }
  function charFromCodepoint(c) {
    if (c <= 65535) {
      return String.fromCharCode(c);
    }
    return String.fromCharCode(
      (c - 65536 >> 10) + 55296,
      (c - 65536 & 1023) + 56320
    );
  }
  function setProperty(object, key, value) {
    if (key === "__proto__") {
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value
      });
    } else {
      object[key] = value;
    }
  }
  var simpleEscapeCheck = new Array(256);
  var simpleEscapeMap = new Array(256);
  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }
  function State(input, options2) {
    this.input = input;
    this.filename = options2["filename"] || null;
    this.schema = options2["schema"] || DEFAULT_FULL_SCHEMA;
    this.onWarning = options2["onWarning"] || null;
    this.legacy = options2["legacy"] || false;
    this.json = options2["json"] || false;
    this.listener = options2["listener"] || null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0;
    this.documents = [];
  }
  function generateError(state, message) {
    return new YAMLException(
      message,
      new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart)
    );
  }
  function throwError(state, message) {
    throw generateError(state, message);
  }
  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }
  var directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      var match, major, minor;
      if (state.version !== null) {
        throwError(state, "duplication of %YAML directive");
      }
      if (args.length !== 1) {
        throwError(state, "YAML directive accepts exactly one argument");
      }
      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
      if (match === null) {
        throwError(state, "ill-formed argument of the YAML directive");
      }
      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);
      if (major !== 1) {
        throwError(state, "unacceptable YAML version of the document");
      }
      state.version = args[0];
      state.checkLineBreaks = minor < 2;
      if (minor !== 1 && minor !== 2) {
        throwWarning(state, "unsupported YAML version of the document");
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      var handle, prefix;
      if (args.length !== 2) {
        throwError(state, "TAG directive accepts exactly two arguments");
      }
      handle = args[0];
      prefix = args[1];
      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
      }
      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }
      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
      }
      state.tagMap[handle] = prefix;
    }
  };
  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;
    if (start < end) {
      _result = state.input.slice(start, end);
      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);
          if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
            throwError(state, "expected valid JSON character");
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, "the stream contains non-printable characters");
      }
      state.result += _result;
    }
  }
  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;
    if (!common2.isObject(source)) {
      throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    sourceKeys = Object.keys(source);
    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];
      if (!_hasOwnProperty.call(destination, key)) {
        setProperty(destination, key, source[key]);
        overridableKeys[key] = true;
      }
    }
  }
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    var index, quantity;
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);
      for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, "nested arrays are not supported inside keys");
        }
        if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
          keyNode[index] = "[object Object]";
        }
      }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
      keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (_result === null) {
      _result = {};
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.position = startPos || state.position;
        throwError(state, "duplicated mapping key");
      }
      setProperty(_result, keyNode, valueNode);
      delete overridableKeys[keyNode];
    }
    return _result;
  }
  function readLineBreak(state) {
    var ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 10) {
      state.position++;
    } else if (ch === 13) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 10) {
        state.position++;
      }
    } else {
      throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
  }
  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (allowComments && ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 10 && ch !== 13 && ch !== 0);
      }
      if (is_EOL(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;
        while (ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
  }
  function testDocumentSeparator(state) {
    var _position = state.position, ch;
    ch = state.input.charCodeAt(_position);
    if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);
      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }
    return false;
  }
  function writeFoldedLines(state, count2) {
    if (count2 === 1) {
      state.result += " ";
    } else if (count2 > 1) {
      state.result += common2.repeat("\n", count2 - 1);
    }
  }
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
    ch = state.input.charCodeAt(state.position);
    if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
      return false;
    }
    if (ch === 63 || ch === 45) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }
    state.kind = "scalar";
    state.result = "";
    captureStart = captureEnd = state.position;
    hasPendingContent = false;
    while (ch !== 0) {
      if (ch === 58) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }
      } else if (ch === 35) {
        preceding = state.input.charCodeAt(state.position - 1);
        if (is_WS_OR_EOL(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;
      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);
        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }
      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
      return true;
    }
    state.kind = _kind;
    state.result = _result;
    return false;
  }
  function readSingleQuotedScalar(state, nodeIndent) {
    var ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 39) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 39) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (ch === 39) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a single quoted scalar");
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }
    throwError(state, "unexpected end of the stream within a single quoted scalar");
  }
  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 34) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 34) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 92) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent);
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;
          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);
            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, "expected hexadecimal character");
            }
          }
          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, "unknown escape sequence");
        }
        captureStart = captureEnd = state.position;
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a double quoted scalar");
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }
    throwError(state, "unexpected end of the stream within a double quoted scalar");
  }
  function readFlowCollection(state, nodeIndent) {
    var readNext = true, _line, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = {}, keyNode, keyTag, valueNode, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 91) {
      terminator = 93;
      isMapping = false;
      _result = [];
    } else if (ch === 123) {
      terminator = 125;
      isMapping = true;
      _result = {};
    } else {
      return false;
    }
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(++state.position);
    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? "mapping" : "sequence";
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, "missed comma between flow collection entries");
      }
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === 63) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }
      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if ((isExplicitPair || state.line === _line) && ch === 58) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }
      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
      } else {
        _result.push(keyNode);
      }
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === 44) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }
    throwError(state, "unexpected end of the stream within a flow collection");
  }
  function readBlockScalar(state, nodeIndent) {
    var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 124) {
      folding = false;
    } else if (ch === 62) {
      folding = true;
    } else {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
      if (ch === 43 || ch === 45) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, "repeat of a chomping mode identifier");
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, "repeat of an indentation width identifier");
        }
      } else {
        break;
      }
    }
    if (is_WHITE_SPACE(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (is_WHITE_SPACE(ch));
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!is_EOL(ch) && ch !== 0);
      }
    }
    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);
      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }
      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      }
      if (state.lineIndent < textIndent) {
        if (chomping === CHOMPING_KEEP) {
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            state.result += "\n";
          }
        }
        break;
      }
      if (folding) {
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true;
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common2.repeat("\n", emptyLines + 1);
        } else if (emptyLines === 0) {
          if (didReadContent) {
            state.result += " ";
          }
        } else {
          state.result += common2.repeat("\n", emptyLines);
        }
      } else {
        state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      }
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;
      while (!is_EOL(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, state.position, false);
    }
    return true;
  }
  function readBlockSequence(state, nodeIndent) {
    var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (ch !== 45) {
        break;
      }
      following = state.input.charCodeAt(state.position + 1);
      if (!is_WS_OR_EOL(following)) {
        break;
      }
      detected = true;
      state.position++;
      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }
      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a sequence entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "sequence";
      state.result = _result;
      return true;
    }
    return false;
  }
  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following, allowCompact, _line, _pos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = {}, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      following = state.input.charCodeAt(state.position + 1);
      _line = state.line;
      _pos = state.position;
      if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
        if (ch === 63) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
        }
        state.position += 1;
        ch = following;
      } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 58) {
            ch = state.input.charCodeAt(++state.position);
            if (!is_WS_OR_EOL(ch)) {
              throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
            }
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
            throwError(state, "can not read an implicit mapping pair; a colon is missed");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else if (detected) {
          throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else {
        break;
      }
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }
        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
          keyTag = keyNode = valueNode = null;
        }
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }
      if (state.lineIndent > nodeIndent && ch !== 0) {
        throwError(state, "bad indentation of a mapping entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "mapping";
      state.result = _result;
    }
    return detected;
  }
  function readTagProperty(state) {
    var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 33) return false;
    if (state.tag !== null) {
      throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 60) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 33) {
      isNamed = true;
      tagHandle = "!!";
      ch = state.input.charCodeAt(++state.position);
    } else {
      tagHandle = "!";
    }
    _position = state.position;
    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 62);
      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, "unexpected end of the stream within a verbatim tag");
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        if (ch === 33) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, "named tag handle cannot contain such characters");
            }
            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, "tag suffix cannot contain exclamation marks");
          }
        }
        ch = state.input.charCodeAt(++state.position);
      }
      tagName = state.input.slice(_position, state.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, "tag suffix cannot contain flow indicator characters");
      }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, "tag name cannot contain such characters: " + tagName);
    }
    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === "!") {
      state.tag = "!" + tagName;
    } else if (tagHandle === "!!") {
      state.tag = "tag:yaml.org,2002:" + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }
    return true;
  }
  function readAnchorProperty(state) {
    var _position, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 38) return false;
    if (state.anchor !== null) {
      throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(_position, state.position);
    return true;
  }
  function readAlias(state) {
    var _position, alias, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 42) return false;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an alias node must contain at least one character");
    }
    alias = state.input.slice(_position, state.position);
    if (!_hasOwnProperty.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }
    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, type2, flowIndent, blockIndent;
    if (state.listener !== null) {
      state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }
    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }
    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }
      blockIndent = state.position - state.lineStart;
      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;
            if (state.tag !== null || state.anchor !== null) {
              throwError(state, "alias node should not have any properties");
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (state.tag === null) {
              state.tag = "?";
            }
          }
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }
    if (state.tag !== null && state.tag !== "!") {
      if (state.tag === "?") {
        if (state.result !== null && state.kind !== "scalar") {
          throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
        }
        for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type2 = state.implicitTypes[typeIndex];
          if (type2.resolve(state.result)) {
            state.result = type2.construct(state.result);
            state.tag = type2.tag;
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
            break;
          }
        }
      } else if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
        type2 = state.typeMap[state.kind || "fallback"][state.tag];
        if (state.result !== null && type2.kind !== state.kind) {
          throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
        }
        if (!type2.resolve(state.result)) {
          throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
        } else {
          state.result = type2.construct(state.result);
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else {
        throwError(state, "unknown tag !<" + state.tag + ">");
      }
    }
    if (state.listener !== null) {
      state.listener("close", state);
    }
    return state.tag !== null || state.anchor !== null || hasContent;
  }
  function readDocument(state) {
    var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = {};
    state.anchorMap = {};
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if (state.lineIndent > 0 || ch !== 37) {
        break;
      }
      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];
      if (directiveName.length < 1) {
        throwError(state, "directive name must not be less than one character in length");
      }
      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !is_EOL(ch));
          break;
        }
        if (is_EOL(ch)) break;
        _position = state.position;
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveArgs.push(state.input.slice(_position, state.position));
      }
      if (ch !== 0) readLineBreak(state);
      if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
      throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 46) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }
    if (state.position < state.length - 1) {
      throwError(state, "end of the stream or a document separator is expected");
    } else {
      return;
    }
  }
  function loadDocuments(input, options2) {
    input = String(input);
    options2 = options2 || {};
    if (input.length !== 0) {
      if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
        input += "\n";
      }
      if (input.charCodeAt(0) === 65279) {
        input = input.slice(1);
      }
    }
    var state = new State(input, options2);
    var nullpos = input.indexOf("\0");
    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, "null byte is not allowed in input");
    }
    state.input += "\0";
    while (state.input.charCodeAt(state.position) === 32) {
      state.lineIndent += 1;
      state.position += 1;
    }
    while (state.position < state.length - 1) {
      readDocument(state);
    }
    return state.documents;
  }
  function loadAll(input, iterator, options2) {
    if (iterator !== null && typeof iterator === "object" && typeof options2 === "undefined") {
      options2 = iterator;
      iterator = null;
    }
    var documents = loadDocuments(input, options2);
    if (typeof iterator !== "function") {
      return documents;
    }
    for (var index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }
  function load(input, options2) {
    var documents = loadDocuments(input, options2);
    if (documents.length === 0) {
      return void 0;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new YAMLException("expected a single document in the stream, but found more");
  }
  function safeLoadAll(input, iterator, options2) {
    if (typeof iterator === "object" && iterator !== null && typeof options2 === "undefined") {
      options2 = iterator;
      iterator = null;
    }
    return loadAll(input, iterator, common2.extend({ schema: DEFAULT_SAFE_SCHEMA }, options2));
  }
  function safeLoad(input, options2) {
    return load(input, common2.extend({ schema: DEFAULT_SAFE_SCHEMA }, options2));
  }
  loader.loadAll = loadAll;
  loader.load = load;
  loader.safeLoadAll = safeLoadAll;
  loader.safeLoad = safeLoad;
  return loader;
}
var dumper = {};
var hasRequiredDumper;
function requireDumper() {
  if (hasRequiredDumper) return dumper;
  hasRequiredDumper = 1;
  var common2 = requireCommon();
  var YAMLException = requireException();
  var DEFAULT_FULL_SCHEMA = requireDefault_full();
  var DEFAULT_SAFE_SCHEMA = requireDefault_safe();
  var _toString = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CHAR_TAB = 9;
  var CHAR_LINE_FEED = 10;
  var CHAR_CARRIAGE_RETURN = 13;
  var CHAR_SPACE = 32;
  var CHAR_EXCLAMATION = 33;
  var CHAR_DOUBLE_QUOTE = 34;
  var CHAR_SHARP = 35;
  var CHAR_PERCENT = 37;
  var CHAR_AMPERSAND = 38;
  var CHAR_SINGLE_QUOTE = 39;
  var CHAR_ASTERISK = 42;
  var CHAR_COMMA = 44;
  var CHAR_MINUS = 45;
  var CHAR_COLON = 58;
  var CHAR_EQUALS = 61;
  var CHAR_GREATER_THAN = 62;
  var CHAR_QUESTION = 63;
  var CHAR_COMMERCIAL_AT = 64;
  var CHAR_LEFT_SQUARE_BRACKET = 91;
  var CHAR_RIGHT_SQUARE_BRACKET = 93;
  var CHAR_GRAVE_ACCENT = 96;
  var CHAR_LEFT_CURLY_BRACKET = 123;
  var CHAR_VERTICAL_LINE = 124;
  var CHAR_RIGHT_CURLY_BRACKET = 125;
  var ESCAPE_SEQUENCES = {};
  ESCAPE_SEQUENCES[0] = "\\0";
  ESCAPE_SEQUENCES[7] = "\\a";
  ESCAPE_SEQUENCES[8] = "\\b";
  ESCAPE_SEQUENCES[9] = "\\t";
  ESCAPE_SEQUENCES[10] = "\\n";
  ESCAPE_SEQUENCES[11] = "\\v";
  ESCAPE_SEQUENCES[12] = "\\f";
  ESCAPE_SEQUENCES[13] = "\\r";
  ESCAPE_SEQUENCES[27] = "\\e";
  ESCAPE_SEQUENCES[34] = '\\"';
  ESCAPE_SEQUENCES[92] = "\\\\";
  ESCAPE_SEQUENCES[133] = "\\N";
  ESCAPE_SEQUENCES[160] = "\\_";
  ESCAPE_SEQUENCES[8232] = "\\L";
  ESCAPE_SEQUENCES[8233] = "\\P";
  var DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ];
  function compileStyleMap(schema2, map2) {
    var result, keys, index, length, tag, style, type2;
    if (map2 === null) return {};
    result = {};
    keys = Object.keys(map2);
    for (index = 0, length = keys.length; index < length; index += 1) {
      tag = keys[index];
      style = String(map2[tag]);
      if (tag.slice(0, 2) === "!!") {
        tag = "tag:yaml.org,2002:" + tag.slice(2);
      }
      type2 = schema2.compiledTypeMap["fallback"][tag];
      if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
        style = type2.styleAliases[style];
      }
      result[tag] = style;
    }
    return result;
  }
  function encodeHex(character) {
    var string, handle, length;
    string = character.toString(16).toUpperCase();
    if (character <= 255) {
      handle = "x";
      length = 2;
    } else if (character <= 65535) {
      handle = "u";
      length = 4;
    } else if (character <= 4294967295) {
      handle = "U";
      length = 8;
    } else {
      throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return "\\" + handle + common2.repeat("0", length - string.length) + string;
  }
  function State(options2) {
    this.schema = options2["schema"] || DEFAULT_FULL_SCHEMA;
    this.indent = Math.max(1, options2["indent"] || 2);
    this.noArrayIndent = options2["noArrayIndent"] || false;
    this.skipInvalid = options2["skipInvalid"] || false;
    this.flowLevel = common2.isNothing(options2["flowLevel"]) ? -1 : options2["flowLevel"];
    this.styleMap = compileStyleMap(this.schema, options2["styles"] || null);
    this.sortKeys = options2["sortKeys"] || false;
    this.lineWidth = options2["lineWidth"] || 80;
    this.noRefs = options2["noRefs"] || false;
    this.noCompatMode = options2["noCompatMode"] || false;
    this.condenseFlow = options2["condenseFlow"] || false;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = "";
    this.duplicates = [];
    this.usedDuplicates = null;
  }
  function indentString(string, spaces) {
    var ind = common2.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
    while (position < length) {
      next = string.indexOf("\n", position);
      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }
      if (line.length && line !== "\n") result += ind;
      result += line;
    }
    return result;
  }
  function generateNextLine(state, level) {
    return "\n" + common2.repeat(" ", state.indent * level);
  }
  function testImplicitResolving(state, str2) {
    var index, length, type2;
    for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      type2 = state.implicitTypes[index];
      if (type2.resolve(str2)) {
        return true;
      }
    }
    return false;
  }
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }
  function isPrintable(c) {
    return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== 65279 || 65536 <= c && c <= 1114111;
  }
  function isNsChar(c) {
    return isPrintable(c) && !isWhitespace(c) && c !== 65279 && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
  }
  function isPlainSafe(c, prev) {
    return isPrintable(c) && c !== 65279 && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_COLON && (c !== CHAR_SHARP || prev && isNsChar(prev));
  }
  function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== 65279 && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
  }
  function needIndentIndicator(string) {
    var leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
  }
  var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
    var i;
    var char, prev_char;
    var hasLineBreak = false;
    var hasFoldableLine = false;
    var shouldTrackWidth = lineWidth !== -1;
    var previousLineBreak = -1;
    var plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
    if (singleLineOnly) {
      for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
        plain = plain && isPlainSafe(char, prev_char);
      }
    } else {
      for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
            i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
        plain = plain && isPlainSafe(char, prev_char);
      }
      hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
    }
    if (!hasLineBreak && !hasFoldableLine) {
      return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
      return STYLE_DOUBLE;
    }
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  function writeScalar(state, string, level, iskey) {
    state.dump = (function() {
      if (string.length === 0) {
        return "''";
      }
      if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
        return "'" + string + "'";
      }
      var indent = state.indent * Math.max(1, level);
      var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
      var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
      function testAmbiguity(string2) {
        return testImplicitResolving(state, string2);
      }
      switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string) + '"';
        default:
          throw new YAMLException("impossible error: invalid scalar style");
      }
    })();
  }
  function blockHeader(string, indentPerLevel) {
    var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    var clip = string[string.length - 1] === "\n";
    var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    var chomp = keep ? "+" : clip ? "" : "-";
    return indentIndicator + chomp + "\n";
  }
  function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
  }
  function foldString(string, width) {
    var lineRe = /(\n+)([^\n]*)/g;
    var result = (function() {
      var nextLF = string.indexOf("\n");
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    })();
    var prevMoreIndented = string[0] === "\n" || string[0] === " ";
    var moreIndented;
    var match;
    while (match = lineRe.exec(string)) {
      var prefix = match[1], line = match[2];
      moreIndented = line[0] === " ";
      result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }
    return result;
  }
  function foldLine(line, width) {
    if (line === "" || line[0] === " ") return line;
    var breakRe = / [^ ]/g;
    var match;
    var start = 0, end, curr = 0, next = 0;
    var result = "";
    while (match = breakRe.exec(line)) {
      next = match.index;
      if (next - start > width) {
        end = curr > start ? curr : next;
        result += "\n" + line.slice(start, end);
        start = end + 1;
      }
      curr = next;
    }
    result += "\n";
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }
    return result.slice(1);
  }
  function escapeString(string) {
    var result = "";
    var char, nextChar;
    var escapeSeq;
    for (var i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (char >= 55296 && char <= 56319) {
        nextChar = string.charCodeAt(i + 1);
        if (nextChar >= 56320 && nextChar <= 57343) {
          result += encodeHex((char - 55296) * 1024 + nextChar - 56320 + 65536);
          i++;
          continue;
        }
      }
      escapeSeq = ESCAPE_SEQUENCES[char];
      result += !escapeSeq && isPrintable(char) ? string[i] : escapeSeq || encodeHex(char);
    }
    return result;
  }
  function writeFlowSequence(state, level, object) {
    var _result = "", _tag = state.tag, index, length;
    for (index = 0, length = object.length; index < length; index += 1) {
      if (writeNode(state, level, object[index], false, false)) {
        if (index !== 0) _result += "," + (!state.condenseFlow ? " " : "");
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = "[" + _result + "]";
  }
  function writeBlockSequence(state, level, object, compact) {
    var _result = "", _tag = state.tag, index, length;
    for (index = 0, length = object.length; index < length; index += 1) {
      if (writeNode(state, level + 1, object[index], true, true)) {
        if (!compact || index !== 0) {
          _result += generateNextLine(state, level);
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += "-";
        } else {
          _result += "- ";
        }
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
  }
  function writeFlowMapping(state, level, object) {
    var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = "";
      if (index !== 0) pairBuffer += ", ";
      if (state.condenseFlow) pairBuffer += '"';
      objectKey = objectKeyList[index];
      objectValue = object[objectKey];
      if (!writeNode(state, level, objectKey, false, false)) {
        continue;
      }
      if (state.dump.length > 1024) pairBuffer += "? ";
      pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
      if (!writeNode(state, level, objectValue, false, false)) {
        continue;
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = "{" + _result + "}";
  }
  function writeBlockMapping(state, level, object, compact) {
    var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
    if (state.sortKeys === true) {
      objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      throw new YAMLException("sortKeys must be a boolean or a function");
    }
    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = "";
      if (!compact || index !== 0) {
        pairBuffer += generateNextLine(state, level);
      }
      objectKey = objectKeyList[index];
      objectValue = object[objectKey];
      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue;
      }
      explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += "?";
        } else {
          pairBuffer += "? ";
        }
      }
      pairBuffer += state.dump;
      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }
      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue;
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ":";
      } else {
        pairBuffer += ": ";
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
  }
  function detectType(state, object, explicit) {
    var _result, typeList, index, length, type2, style;
    typeList = explicit ? state.explicitTypes : state.implicitTypes;
    for (index = 0, length = typeList.length; index < length; index += 1) {
      type2 = typeList[index];
      if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
        state.tag = explicit ? type2.tag : "?";
        if (type2.represent) {
          style = state.styleMap[type2.tag] || type2.defaultStyle;
          if (_toString.call(type2.represent) === "[object Function]") {
            _result = type2.represent(object, style);
          } else if (_hasOwnProperty.call(type2.represent, style)) {
            _result = type2.represent[style](object, style);
          } else {
            throw new YAMLException("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
          }
          state.dump = _result;
        }
        return true;
      }
    }
    return false;
  }
  function writeNode(state, level, object, block, compact, iskey) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }
    var type2 = _toString.call(state.dump);
    if (block) {
      block = state.flowLevel < 0 || state.flowLevel > level;
    }
    var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
      compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = "*ref_" + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type2 === "[object Object]") {
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object Array]") {
        var arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
        if (block && state.dump.length !== 0) {
          writeBlockSequence(state, arrayLevel, state.dump, compact);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, arrayLevel, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object String]") {
        if (state.tag !== "?") {
          writeScalar(state, state.dump, level, iskey);
        }
      } else {
        if (state.skipInvalid) return false;
        throw new YAMLException("unacceptable kind of an object to dump " + type2);
      }
      if (state.tag !== null && state.tag !== "?") {
        state.dump = "!<" + state.tag + "> " + state.dump;
      }
    }
    return true;
  }
  function getDuplicateReferences(object, state) {
    var objects = [], duplicatesIndexes = [], index, length;
    inspectNode(object, objects, duplicatesIndexes);
    for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }
  function inspectNode(object, objects, duplicatesIndexes) {
    var objectKeyList, index, length;
    if (object !== null && typeof object === "object") {
      index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);
        if (Array.isArray(object)) {
          for (index = 0, length = object.length; index < length; index += 1) {
            inspectNode(object[index], objects, duplicatesIndexes);
          }
        } else {
          objectKeyList = Object.keys(object);
          for (index = 0, length = objectKeyList.length; index < length; index += 1) {
            inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }
  function dump(input, options2) {
    options2 = options2 || {};
    var state = new State(options2);
    if (!state.noRefs) getDuplicateReferences(input, state);
    if (writeNode(state, 0, input, true, true)) return state.dump + "\n";
    return "";
  }
  function safeDump(input, options2) {
    return dump(input, common2.extend({ schema: DEFAULT_SAFE_SCHEMA }, options2));
  }
  dumper.dump = dump;
  dumper.safeDump = safeDump;
  return dumper;
}
var hasRequiredJsYaml$1;
function requireJsYaml$1() {
  if (hasRequiredJsYaml$1) return jsYaml$1;
  hasRequiredJsYaml$1 = 1;
  var loader2 = requireLoader();
  var dumper2 = requireDumper();
  function deprecated(name) {
    return function() {
      throw new Error("Function " + name + " is deprecated and cannot be used.");
    };
  }
  jsYaml$1.Type = requireType();
  jsYaml$1.Schema = requireSchema();
  jsYaml$1.FAILSAFE_SCHEMA = requireFailsafe();
  jsYaml$1.JSON_SCHEMA = requireJson();
  jsYaml$1.CORE_SCHEMA = requireCore();
  jsYaml$1.DEFAULT_SAFE_SCHEMA = requireDefault_safe();
  jsYaml$1.DEFAULT_FULL_SCHEMA = requireDefault_full();
  jsYaml$1.load = loader2.load;
  jsYaml$1.loadAll = loader2.loadAll;
  jsYaml$1.safeLoad = loader2.safeLoad;
  jsYaml$1.safeLoadAll = loader2.safeLoadAll;
  jsYaml$1.dump = dumper2.dump;
  jsYaml$1.safeDump = dumper2.safeDump;
  jsYaml$1.YAMLException = requireException();
  jsYaml$1.MINIMAL_SCHEMA = requireFailsafe();
  jsYaml$1.SAFE_SCHEMA = requireDefault_safe();
  jsYaml$1.DEFAULT_SCHEMA = requireDefault_full();
  jsYaml$1.scan = deprecated("scan");
  jsYaml$1.parse = deprecated("parse");
  jsYaml$1.compose = deprecated("compose");
  jsYaml$1.addConstructor = deprecated("addConstructor");
  return jsYaml$1;
}
var jsYaml;
var hasRequiredJsYaml;
function requireJsYaml() {
  if (hasRequiredJsYaml) return jsYaml;
  hasRequiredJsYaml = 1;
  var yaml2 = requireJsYaml$1();
  jsYaml = yaml2;
  return jsYaml;
}
var hasRequiredEngines;
function requireEngines() {
  if (hasRequiredEngines) return engines.exports;
  hasRequiredEngines = 1;
  (function(module, exports$1) {
    const yaml = requireJsYaml();
    const engines = module.exports;
    engines.yaml = {
      parse: yaml.safeLoad.bind(yaml),
      stringify: yaml.safeDump.bind(yaml)
    };
    engines.json = {
      parse: JSON.parse.bind(JSON),
      stringify: function(obj, options2) {
        const opts = Object.assign({ replacer: null, space: 2 }, options2);
        return JSON.stringify(obj, opts.replacer, opts.space);
      }
    };
    engines.javascript = {
      parse: function parse(str, options, wrap) {
        try {
          if (wrap !== false) {
            str = "(function() {\nreturn " + str.trim() + ";\n}());";
          }
          return eval(str) || {};
        } catch (err) {
          if (wrap !== false && /(unexpected|identifier)/i.test(err.message)) {
            return parse(str, options, false);
          }
          throw new SyntaxError(err);
        }
      },
      stringify: function() {
        throw new Error("stringifying JavaScript is not supported");
      }
    };
  })(engines);
  return engines.exports;
}
var utils = {};
var stripBomString;
var hasRequiredStripBomString;
function requireStripBomString() {
  if (hasRequiredStripBomString) return stripBomString;
  hasRequiredStripBomString = 1;
  stripBomString = function(str2) {
    if (typeof str2 === "string" && str2.charAt(0) === "\uFEFF") {
      return str2.slice(1);
    }
    return str2;
  };
  return stripBomString;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports$12) {
    const stripBom = requireStripBomString();
    const typeOf = requireKindOf();
    exports$12.define = function(obj, key, val) {
      Reflect.defineProperty(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: val
      });
    };
    exports$12.isBuffer = function(val) {
      return typeOf(val) === "buffer";
    };
    exports$12.isObject = function(val) {
      return typeOf(val) === "object";
    };
    exports$12.toBuffer = function(input) {
      return typeof input === "string" ? Buffer.from(input) : input;
    };
    exports$12.toString = function(input) {
      if (exports$12.isBuffer(input)) return stripBom(String(input));
      if (typeof input !== "string") {
        throw new TypeError("expected input to be a string or buffer");
      }
      return stripBom(input);
    };
    exports$12.arrayify = function(val) {
      return val ? Array.isArray(val) ? val : [val] : [];
    };
    exports$12.startsWith = function(str2, substr, len) {
      if (typeof len !== "number") len = substr.length;
      return str2.slice(0, len) === substr;
    };
  })(utils);
  return utils;
}
var defaults;
var hasRequiredDefaults;
function requireDefaults() {
  if (hasRequiredDefaults) return defaults;
  hasRequiredDefaults = 1;
  const engines2 = requireEngines();
  const utils2 = requireUtils();
  defaults = function(options2) {
    const opts = Object.assign({}, options2);
    opts.delimiters = utils2.arrayify(opts.delims || opts.delimiters || "---");
    if (opts.delimiters.length === 1) {
      opts.delimiters.push(opts.delimiters[0]);
    }
    opts.language = (opts.language || opts.lang || "yaml").toLowerCase();
    opts.engines = Object.assign({}, engines2, opts.parsers, opts.engines);
    return opts;
  };
  return defaults;
}
var engine;
var hasRequiredEngine;
function requireEngine() {
  if (hasRequiredEngine) return engine;
  hasRequiredEngine = 1;
  engine = function(name, options2) {
    let engine2 = options2.engines[name] || options2.engines[aliase(name)];
    if (typeof engine2 === "undefined") {
      throw new Error('gray-matter engine "' + name + '" is not registered');
    }
    if (typeof engine2 === "function") {
      engine2 = { parse: engine2 };
    }
    return engine2;
  };
  function aliase(name) {
    switch (name.toLowerCase()) {
      case "js":
      case "javascript":
        return "javascript";
      case "coffee":
      case "coffeescript":
      case "cson":
        return "coffee";
      case "yaml":
      case "yml":
        return "yaml";
      default: {
        return name;
      }
    }
  }
  return engine;
}
var stringify;
var hasRequiredStringify;
function requireStringify() {
  if (hasRequiredStringify) return stringify;
  hasRequiredStringify = 1;
  const typeOf = requireKindOf();
  const getEngine = requireEngine();
  const defaults2 = requireDefaults();
  stringify = function(file, data, options2) {
    if (data == null && options2 == null) {
      switch (typeOf(file)) {
        case "object":
          data = file.data;
          options2 = {};
          break;
        case "string":
          return file;
        default: {
          throw new TypeError("expected file to be a string or object");
        }
      }
    }
    const str2 = file.content;
    const opts = defaults2(options2);
    if (data == null) {
      if (!opts.data) return file;
      data = opts.data;
    }
    const language = file.language || opts.language;
    const engine2 = getEngine(language, opts);
    if (typeof engine2.stringify !== "function") {
      throw new TypeError('expected "' + language + '.stringify" to be a function');
    }
    data = Object.assign({}, file.data, data);
    const open = opts.delimiters[0];
    const close = opts.delimiters[1];
    const matter = engine2.stringify(data, options2).trim();
    let buf = "";
    if (matter !== "{}") {
      buf = newline(open) + newline(matter) + newline(close);
    }
    if (typeof file.excerpt === "string" && file.excerpt !== "") {
      if (str2.indexOf(file.excerpt.trim()) === -1) {
        buf += newline(file.excerpt) + newline(close);
      }
    }
    return buf + newline(str2);
  };
  function newline(str2) {
    return str2.slice(-1) !== "\n" ? str2 + "\n" : str2;
  }
  return stringify;
}
var excerpt;
var hasRequiredExcerpt;
function requireExcerpt() {
  if (hasRequiredExcerpt) return excerpt;
  hasRequiredExcerpt = 1;
  const defaults2 = requireDefaults();
  excerpt = function(file, options2) {
    const opts = defaults2(options2);
    if (file.data == null) {
      file.data = {};
    }
    if (typeof opts.excerpt === "function") {
      return opts.excerpt(file, opts);
    }
    const sep = file.data.excerpt_separator || opts.excerpt_separator;
    if (sep == null && (opts.excerpt === false || opts.excerpt == null)) {
      return file;
    }
    const delimiter = typeof opts.excerpt === "string" ? opts.excerpt : sep || opts.delimiters[0];
    const idx = file.content.indexOf(delimiter);
    if (idx !== -1) {
      file.excerpt = file.content.slice(0, idx);
    }
    return file;
  };
  return excerpt;
}
var toFile;
var hasRequiredToFile;
function requireToFile() {
  if (hasRequiredToFile) return toFile;
  hasRequiredToFile = 1;
  const typeOf = requireKindOf();
  const stringify2 = requireStringify();
  const utils2 = requireUtils();
  toFile = function(file) {
    if (typeOf(file) !== "object") {
      file = { content: file };
    }
    if (typeOf(file.data) !== "object") {
      file.data = {};
    }
    if (file.contents && file.content == null) {
      file.content = file.contents;
    }
    utils2.define(file, "orig", utils2.toBuffer(file.content));
    utils2.define(file, "language", file.language || "");
    utils2.define(file, "matter", file.matter || "");
    utils2.define(file, "stringify", function(data, options2) {
      if (options2 && options2.language) {
        file.language = options2.language;
      }
      return stringify2(file, data, options2);
    });
    file.content = utils2.toString(file.content);
    file.isEmpty = false;
    file.excerpt = "";
    return file;
  };
  return toFile;
}
var parse;
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse;
  hasRequiredParse = 1;
  const getEngine = requireEngine();
  const defaults2 = requireDefaults();
  parse = function(language, str2, options2) {
    const opts = defaults2(options2);
    const engine2 = getEngine(language, opts);
    if (typeof engine2.parse !== "function") {
      throw new TypeError('expected "' + language + '.parse" to be a function');
    }
    return engine2.parse(str2, opts);
  };
  return parse;
}
var grayMatter;
var hasRequiredGrayMatter;
function requireGrayMatter() {
  if (hasRequiredGrayMatter) return grayMatter;
  hasRequiredGrayMatter = 1;
  const fs = require$$0;
  const sections = requireSectionMatter();
  const defaults2 = requireDefaults();
  const stringify2 = requireStringify();
  const excerpt2 = requireExcerpt();
  const engines2 = requireEngines();
  const toFile2 = requireToFile();
  const parse2 = requireParse();
  const utils2 = requireUtils();
  function matter(input, options2) {
    if (input === "") {
      return { data: {}, content: input, excerpt: "", orig: input };
    }
    let file = toFile2(input);
    const cached = matter.cache[file.content];
    if (!options2) {
      if (cached) {
        file = Object.assign({}, cached);
        file.orig = cached.orig;
        return file;
      }
      matter.cache[file.content] = file;
    }
    return parseMatter(file, options2);
  }
  function parseMatter(file, options2) {
    const opts = defaults2(options2);
    const open = opts.delimiters[0];
    const close = "\n" + opts.delimiters[1];
    let str2 = file.content;
    if (opts.language) {
      file.language = opts.language;
    }
    const openLen = open.length;
    if (!utils2.startsWith(str2, open, openLen)) {
      excerpt2(file, opts);
      return file;
    }
    if (str2.charAt(openLen) === open.slice(-1)) {
      return file;
    }
    str2 = str2.slice(openLen);
    const len = str2.length;
    const language = matter.language(str2, opts);
    if (language.name) {
      file.language = language.name;
      str2 = str2.slice(language.raw.length);
    }
    let closeIndex = str2.indexOf(close);
    if (closeIndex === -1) {
      closeIndex = len;
    }
    file.matter = str2.slice(0, closeIndex);
    const block = file.matter.replace(/^\s*#[^\n]+/gm, "").trim();
    if (block === "") {
      file.isEmpty = true;
      file.empty = file.content;
      file.data = {};
    } else {
      file.data = parse2(file.language, file.matter, opts);
    }
    if (closeIndex === len) {
      file.content = "";
    } else {
      file.content = str2.slice(closeIndex + close.length);
      if (file.content[0] === "\r") {
        file.content = file.content.slice(1);
      }
      if (file.content[0] === "\n") {
        file.content = file.content.slice(1);
      }
    }
    excerpt2(file, opts);
    if (opts.sections === true || typeof opts.section === "function") {
      sections(file, opts.section);
    }
    return file;
  }
  matter.engines = engines2;
  matter.stringify = function(file, data, options2) {
    if (typeof file === "string") file = matter(file, options2);
    return stringify2(file, data, options2);
  };
  matter.read = function(filepath, options2) {
    const str2 = fs.readFileSync(filepath, "utf8");
    const file = matter(str2, options2);
    file.path = filepath;
    return file;
  };
  matter.test = function(str2, options2) {
    return utils2.startsWith(str2, defaults2(options2).delimiters[0]);
  };
  matter.language = function(str2, options2) {
    const opts = defaults2(options2);
    const open = opts.delimiters[0];
    if (matter.test(str2)) {
      str2 = str2.slice(open.length);
    }
    const language = str2.slice(0, str2.search(/\r?\n/));
    return {
      raw: language,
      name: language ? language.trim() : ""
    };
  };
  matter.cache = {};
  matter.clearCache = function() {
    matter.cache = {};
  };
  grayMatter = matter;
  return grayMatter;
}
requireGrayMatter();
const duyetProfile = {
  personal: {
    name: "Duyet Le",
    shortName: "Duyệt",
    email: "me@duyet.net",
    title: "Sr. Data Engineer",
    bio: "Data Engineering, Rustacean at night",
    experience: "6+ years",
    location: "Vietnam"
  },
  social: {
    github: "https://github.com/duyet",
    twitter: "https://x.com/_duyet",
    linkedin: "https://linkedin.com/in/duyet",
    unsplash: "https://unsplash.com/@_duyet",
    tiktok: "https://www.tiktok.com/@duyet.net"
  },
  appearance: {
    avatar: "/avatar.jpg",
    favicon: "/favicon.ico",
    theme: {
      // Claude-inspired color palette
      primary: "#f5dcd0",
      // Claude peach
      secondary: "#a8d5ba",
      // Claude mint
      accent: "#c5c5ff",
      // Claude lavender
      // Extended palette (used in home page cards)
      coral: "#ff9999",
      // Coral
      yellow: "#f0d9a8",
      // Soft yellow
      sky: "#b3d9ff"
      // Sky blue
    }
  }
};
const duyetUrls = {
  apps: {
    blog: process.env.NEXT_PUBLIC_DUYET_BLOG_URL || process.env.NEXT_PUBLIC_APP_BLOG || "https://blog.duyet.net",
    cv: process.env.NEXT_PUBLIC_DUYET_CV_URL || process.env.NEXT_PUBLIC_APP_CV || "https://cv.duyet.net",
    insights: process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || process.env.NEXT_PUBLIC_APP_INSIGHTS || "https://insights.duyet.net",
    home: process.env.NEXT_PUBLIC_DUYET_HOME_URL || process.env.NEXT_PUBLIC_APP_HOME || "https://duyet.net",
    photos: process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL || process.env.NEXT_PUBLIC_APP_PHOTOS || "https://photos.duyet.net",
    homelab: process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL || process.env.NEXT_PUBLIC_APP_HOMELAB || "https://homelab.duyet.net"
  },
  external: {
    rust: "https://rust-tieng-viet.github.io",
    clickhouse: "https://clickhouse.duyet.net",
    mcp: "https://mcp.duyet.net",
    monica: "https://monica.im/invitation?c=RJF8T7RT",
    googleScript: "https://script.google.com/macros/s/AKfycbyRLwRpcBUlE1Iw2mhSN1zQNHLT7EQsnFVPaduKyEUJMQwaBhEuKXJfWjzUZc20F7sR/exec"
  }
};
const LOGO = "/assets/logo-gAD2WqhI.svg";
function Logo({
  className = "",
  logoClassName = "",
  width = 50,
  height = 50
}) {
  const logoCls = cn(
    "flex items-center",
    "hover:opacity-80 transition-opacity",
    "cursor-pointer",
    "rounded-full",
    logoClassName
  );
  return /* @__PURE__ */ jsx(
    Link,
    {
      to: "/",
      className: cn("p-3 font-bold flex flex-row items-center", className),
      children: /* @__PURE__ */ jsx(
        "img",
        {
          src: LOGO,
          alt: "Logo",
          width,
          height,
          className: logoCls
        }
      )
    }
  );
}
const Github = (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 438.549 438.549", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
  }
) });
const Twitter = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    height: "16",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 16 16",
    width: "16",
    ...props,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M0.5 0.5H5.75L9.48421 5.71053L14 0.5H16L10.3895 6.97368L16.5 15.5H11.25L7.51579 10.2895L3 15.5H1L6.61053 9.02632L0.5 0.5ZM12.0204 14L3.42043 2H4.97957L13.5796 14H12.0204Z",
        fill: "currentColor"
      }
    )
  }
);
const LinkedIn = (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  }
) });
const Unsplash = (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z"
  }
) });
const TikTok = (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
  }
) });
const Medium = (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"
  }
) });
const DevTo = (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z"
  }
) });
const UserEmpty = (props) => /* @__PURE__ */ jsxs(
  "svg",
  {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "8", r: "4" }),
      /* @__PURE__ */ jsx("path", { d: "M20 21c0-4.4-3.6-8-8-8s-8 3.6-8 8" })
    ]
  }
);
const Icons = {
  UserEmpty
};
function Social({
  profile = duyetProfile,
  className,
  iconSize = "w-4 h-4"
}) {
  const iconClasses = cn(
    iconSize,
    "text-claude-gray-400 hover:text-claude-gray-600",
    "dark:text-gray-500 dark:hover:text-white"
  );
  const socialLinks = [
    {
      url: profile.social.github,
      Icon: Github,
      label: "GitHub"
    },
    {
      url: profile.social.twitter,
      Icon: Twitter,
      label: "Twitter"
    },
    {
      url: profile.social.linkedin,
      Icon: LinkedIn,
      label: "LinkedIn"
    },
    {
      url: profile.social.unsplash,
      Icon: Unsplash,
      label: "Unsplash"
    },
    {
      url: profile.social.tiktok,
      Icon: TikTok,
      label: "TikTok"
    },
    {
      url: profile.social.medium,
      Icon: Medium,
      label: "Medium"
    },
    {
      url: profile.social.devto,
      Icon: DevTo,
      label: "Dev.to"
    }
  ].filter((link) => link.url);
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-row gap-4", className), children: socialLinks.map(({ url, Icon, label }) => /* @__PURE__ */ jsx(
    "a",
    {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": label,
      children: /* @__PURE__ */ jsx(Icon, { className: iconClasses })
    },
    url
  )) });
}
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = React.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = React.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = React.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return React.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return React.useCallback(composeRefs(...refs), refs);
}
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = /* @__PURE__ */ Symbol("radix.slottable");
function isSlottable(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = /* @__PURE__ */ createSlot(`Primitive.${node}`);
  const Node = React.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
function dispatchDiscreteCustomEvent(target, event) {
  if (target) ReactDOM.flushSync(() => target.dispatchEvent(event));
}
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope2] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React__default.useRef(null);
    const itemMap = React__default.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = /* @__PURE__ */ createSlot(COLLECTION_SLOT_NAME);
  const CollectionSlot = React__default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsx(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = /* @__PURE__ */ createSlot(ITEM_SLOT_NAME);
  const CollectionItemSlot = React__default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React__default.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React__default.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection2(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React__default.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection2,
    createCollectionScope2
  ];
}
var useLayoutEffect2 = globalThis?.document ? React.useLayoutEffect : () => {
};
var useReactId = React[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
  const [id, setId] = React.useState(useReactId());
  useLayoutEffect2(() => {
    setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return id ? `radix-${id}` : "";
}
function useCallbackRef(callback) {
  const callbackRef = React.useRef(callback);
  React.useEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}
var useInsertionEffect = React[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  },
  caller
}) {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  {
    const isControlledRef = React.useRef(prop !== void 0);
    React.useEffect(() => {
      const wasControlled = isControlledRef.current;
      if (wasControlled !== isControlled) {
        const from = wasControlled ? "controlled" : "uncontrolled";
        const to = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        );
      }
      isControlledRef.current = isControlled;
    }, [isControlled, caller]);
  }
  const setValue = React.useCallback(
    (nextValue) => {
      if (isControlled) {
        const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
        if (value2 !== prop) {
          onChangeRef.current?.(value2);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, onChangeRef]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const [value, setValue] = React.useState(defaultProp);
  const prevValueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);
  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef]);
  return [value, setValue, onChangeRef];
}
function isFunction(value) {
  return typeof value === "function";
}
var DirectionContext = React.createContext(void 0);
function useDirection(localDir) {
  const globalDir = React.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = React.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsx(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = React.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = React.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = React.useState(0);
  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: React.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: React.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: React.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: React.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME$1 = "RovingFocusGroupItem";
var RovingFocusGroupItem = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME$1, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    React.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsx(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME$1;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root = RovingFocusGroup;
var Item = RovingFocusGroupItem;
var NAME = "Toggle";
var Toggle = React.forwardRef((props, forwardedRef) => {
  const { pressed: pressedProp, defaultPressed, onPressedChange, ...buttonProps } = props;
  const [pressed, setPressed] = useControllableState({
    prop: pressedProp,
    onChange: onPressedChange,
    defaultProp: defaultPressed ?? false,
    caller: NAME
  });
  return /* @__PURE__ */ jsx(
    Primitive.button,
    {
      type: "button",
      "aria-pressed": pressed,
      "data-state": pressed ? "on" : "off",
      "data-disabled": props.disabled ? "" : void 0,
      ...buttonProps,
      ref: forwardedRef,
      onClick: composeEventHandlers(props.onClick, () => {
        if (!props.disabled) {
          setPressed(!pressed);
        }
      })
    }
  );
});
Toggle.displayName = NAME;
var TOGGLE_GROUP_NAME = "ToggleGroup";
var [createToggleGroupContext] = createContextScope(TOGGLE_GROUP_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var ToggleGroup = React__default.forwardRef((props, forwardedRef) => {
  const { type: type2, ...toggleGroupProps } = props;
  if (type2 === "single") {
    const singleProps = toggleGroupProps;
    return /* @__PURE__ */ jsx(ToggleGroupImplSingle, { ...singleProps, ref: forwardedRef });
  }
  if (type2 === "multiple") {
    const multipleProps = toggleGroupProps;
    return /* @__PURE__ */ jsx(ToggleGroupImplMultiple, { ...multipleProps, ref: forwardedRef });
  }
  throw new Error(`Missing prop \`type\` expected on \`${TOGGLE_GROUP_NAME}\``);
});
ToggleGroup.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupValueProvider, useToggleGroupValueContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImplSingle = React__default.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupSingleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? "",
    onChange: onValueChange,
    caller: TOGGLE_GROUP_NAME
  });
  return /* @__PURE__ */ jsx(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "single",
      value: React__default.useMemo(() => value ? [value] : [], [value]),
      onItemActivate: setValue,
      onItemDeactivate: React__default.useCallback(() => setValue(""), [setValue]),
      children: /* @__PURE__ */ jsx(ToggleGroupImpl, { ...toggleGroupSingleProps, ref: forwardedRef })
    }
  );
});
var ToggleGroupImplMultiple = React__default.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: TOGGLE_GROUP_NAME
  });
  const handleButtonActivate = React__default.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleButtonDeactivate = React__default.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsx(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "multiple",
      value,
      onItemActivate: handleButtonActivate,
      onItemDeactivate: handleButtonDeactivate,
      children: /* @__PURE__ */ jsx(ToggleGroupImpl, { ...toggleGroupMultipleProps, ref: forwardedRef })
    }
  );
});
ToggleGroup.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupContext, useToggleGroupContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImpl = React__default.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeToggleGroup,
      disabled = false,
      rovingFocus = true,
      orientation,
      dir,
      loop = true,
      ...toggleGroupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeToggleGroup);
    const direction = useDirection(dir);
    const commonProps = { role: "group", dir: direction, ...toggleGroupProps };
    return /* @__PURE__ */ jsx(ToggleGroupContext, { scope: __scopeToggleGroup, rovingFocus, disabled, children: rovingFocus ? /* @__PURE__ */ jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation,
        dir: direction,
        loop,
        children: /* @__PURE__ */ jsx(Primitive.div, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsx(Primitive.div, { ...commonProps, ref: forwardedRef }) });
  }
);
var ITEM_NAME = "ToggleGroupItem";
var ToggleGroupItem = React__default.forwardRef(
  (props, forwardedRef) => {
    const valueContext = useToggleGroupValueContext(ITEM_NAME, props.__scopeToggleGroup);
    const context = useToggleGroupContext(ITEM_NAME, props.__scopeToggleGroup);
    const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToggleGroup);
    const pressed = valueContext.value.includes(props.value);
    const disabled = context.disabled || props.disabled;
    const commonProps = { ...props, pressed, disabled };
    const ref = React__default.useRef(null);
    return context.rovingFocus ? /* @__PURE__ */ jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: pressed,
        ref,
        children: /* @__PURE__ */ jsx(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsx(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef });
  }
);
ToggleGroupItem.displayName = ITEM_NAME;
var ToggleGroupItemImpl = React__default.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToggleGroup, value, ...itemProps } = props;
    const valueContext = useToggleGroupValueContext(ITEM_NAME, __scopeToggleGroup);
    const singleProps = { role: "radio", "aria-checked": props.pressed, "aria-pressed": void 0 };
    const typeProps = valueContext.type === "single" ? singleProps : void 0;
    return /* @__PURE__ */ jsx(
      Toggle,
      {
        ...typeProps,
        ...itemProps,
        ref: forwardedRef,
        onPressedChange: (pressed) => {
          if (pressed) {
            valueContext.onItemActivate(value);
          } else {
            valueContext.onItemDeactivate(value);
          }
        }
      }
    );
  }
);
var Root2 = ToggleGroup;
var Item2 = ToggleGroupItem;
const toggleGroupClasses = cn(
  "p-[3px] w-fit flex rounded-full border border-gray-200",
  "dark:border-gray-800"
);
const toggleGroupItemClasses = cn(
  "h-8 w-8 flex items-center rounded-full justify-center transition",
  "text-gray-400 hover:text-gray-900 dark:hover:data-[state=off]:text-gray-100",
  "data-[state=on]:bg-gray-200 data-[state=on]:text-gray-900",
  "dark:data-[state=on]:bg-gray-800 dark:data-[state=on]:text-gray-200"
);
const iconProps = {
  className: cn("w-4 h-4"),
  strokeWidth: 1,
  size: 16
};
function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  const onChange = (value) => {
    if (value) setTheme(value);
  };
  return /* @__PURE__ */ jsxs(
    Root2,
    {
      className: toggleGroupClasses,
      type: "single",
      "aria-label": "Theme",
      onValueChange: onChange,
      value: theme,
      children: [
        /* @__PURE__ */ jsx(
          Item2,
          {
            className: toggleGroupItemClasses,
            value: "light",
            "aria-label": "Light",
            children: /* @__PURE__ */ jsx(Sun, { ...iconProps })
          }
        ),
        /* @__PURE__ */ jsx(
          Item2,
          {
            className: toggleGroupItemClasses,
            value: "system",
            "aria-label": "System",
            children: /* @__PURE__ */ jsx(Monitor, { ...iconProps })
          }
        ),
        /* @__PURE__ */ jsx(
          Item2,
          {
            className: toggleGroupItemClasses,
            value: "dark",
            "aria-label": "Dark",
            children: /* @__PURE__ */ jsx(Moon, { ...iconProps })
          }
        )
      ]
    }
  );
}
function FooterLink({ href, children }) {
  const classes = cn(
    "text-sm text-neutral-500 dark:text-neutral-400",
    "no-underline hover:text-gray-700",
    "dark:hover:text-white transition"
  );
  if (href.startsWith("http")) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href,
        className: classes,
        target: "_blank",
        rel: "noopener noreferrer",
        children
      }
    );
  }
  return /* @__PURE__ */ jsx(Link, { to: href, className: classes, children });
}
function FooterHeader({ children }) {
  return /* @__PURE__ */ jsx("h3", { className: "text-sm text-black dark:text-white font-bold", children });
}
function createFooterNavigation(urls, profile) {
  return {
    general: [
      urls.external.rust && {
        name: "Rust Tiếng Việt",
        href: `${urls.external.rust}?utm_source=blog&utm_medium=footer&utm_campaign=rust_tieng_viet`
      },
      { name: "/archives", href: `${urls.apps.blog}/archives` },
      { name: "/series", href: `${urls.apps.blog}/series` },
      { name: "/tags", href: `${urls.apps.blog}/tags` },
      { name: "Status", href: "https://status.duyet.net" }
    ].filter(Boolean),
    profile: [
      { name: "About", href: `${urls.apps.home}/about` },
      profile.social.linkedin && {
        name: "LinkedIn",
        href: profile.social.linkedin
      },
      { name: "Resume", href: urls.apps.cv },
      profile.social.github && {
        name: "Projects",
        href: `${profile.social.github}?tab=repositories`
      }
    ].filter(Boolean)
  };
}
function FooterContent({
  profile = duyetProfile,
  urls = duyetUrls
} = {}) {
  const navigation = createFooterNavigation(urls, profile);
  return /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsxs("div", { "aria-labelledby": "footer-heading", children: [
    /* @__PURE__ */ jsx("h2", { id: "footer-heading", className: "sr-only", children: "Footer" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full py-8 mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "xl:grid xl:grid-cols-3 xl:gap-8", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-8 xl:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-6 md:mt-0", children: /* @__PURE__ */ jsx(Logo, { className: "p-0" }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 sm:mt-12 md:mt-0", children: [
          /* @__PURE__ */ jsx(FooterHeader, { children: "Resources" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-1.5 list-none ml-0", children: navigation.general.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(FooterLink, { href: item.href, children: item.name }) }, item.name)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 sm:mt-12 md:mt-0", children: [
          /* @__PURE__ */ jsx(FooterHeader, { children: profile.personal.email }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-sm text-gray-600 dark:text-neutral-400", children: /* @__PURE__ */ jsx(Social, { profile }) }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-1.5 list-none ml-0", children: navigation.profile.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(FooterLink, { href: item.href, children: item.name }) }, item.name)) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "pt-8 mt-8 sm:flex sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxs("p", { className: "mt-4 text-xs text-gray-500 dark:text-neutral-400", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " ",
          urls.apps.home.replace(/^https?:\/\//, ""),
          " |",
          " ",
          profile.personal.title,
          " |",
          " ",
          (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsx(ThemeToggle, {}) })
      ] })
    ] })
  ] }) });
}
function Footer({
  profile = duyetProfile,
  urls = duyetUrls,
  className,
  containerClassName
}) {
  return /* @__PURE__ */ jsxs(
    "footer",
    {
      className: cn(
        "bg-neutral-50 pb-[env(safe-area-inset-bottom)] relative dark:bg-claude-gray-900",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("hr", { className: "dark:border-neutral-700" }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "mx-auto max-w-[90rem] py-12 flex justify-center md:justify-center text-black dark:text-white",
              "pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)]",
              containerClassName
            ),
            children: /* @__PURE__ */ jsx(FooterContent, { profile, urls })
          }
        )
      ]
    }
  );
}
const DNS_PREFETCH_DOMAINS = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://avatars.githubusercontent.com",
  "https://github.com",
  "https://images.unsplash.com"
];
function Head() {
  return /* @__PURE__ */ jsxs("head", { children: [
    /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
    /* @__PURE__ */ jsx("meta", { content: "follow, index", name: "robots" }),
    /* @__PURE__ */ jsx("meta", { content: "ie=edge", httpEquiv: "x-ua-compatible" }),
    /* @__PURE__ */ jsx("link", { href: "/icon.svg", rel: "icon", sizes: "any" }),
    DNS_PREFETCH_DOMAINS.map((domain) => /* @__PURE__ */ jsx("link", { href: domain, rel: "dns-prefetch" }, domain)),
    DNS_PREFETCH_DOMAINS.map((domain) => /* @__PURE__ */ jsx("link", { href: domain, rel: "preconnect" }, `preconnect-${domain}`))
  ] });
}
function createDefaultNavigation(urls) {
  return [
    { name: "Home", href: urls.apps.home },
    { name: "About", href: `${urls.apps.home}/about` },
    { name: "Photos", href: urls.apps.photos },
    { name: "Insights", href: urls.apps.insights },
    { name: "CV", href: urls.apps.cv }
  ];
}
const HOME = { name: "Home", href: duyetUrls.apps.home };
const ABOUT = { name: "About", href: `${duyetUrls.apps.home}/about` };
const INSIGHTS = { name: "Insights", href: duyetUrls.apps.insights };
const PHOTOS = { name: "Photos", href: duyetUrls.apps.photos };
({
  href: `${duyetUrls.apps.blog}/archives`
});
({ href: duyetUrls.apps.blog });
const BLOG = { name: "Blog", href: duyetUrls.apps.blog };
({ href: duyetUrls.apps.cv });
({ href: `${duyetUrls.apps.blog}/search` });
function Menu({
  urls = duyetUrls,
  className,
  navigationItems,
  onItemClick
}) {
  const items = navigationItems ?? createDefaultNavigation(urls);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex flex-row gap-3 sm:gap-5 flex-wrap items-center",
        className
      ),
      children: items.map(
        ({ name, href }) => href.startsWith("http") ? /* @__PURE__ */ jsx(
          "a",
          {
            href,
            onClick: onItemClick,
            className: "text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8",
            children: name
          },
          name
        ) : /* @__PURE__ */ jsx(
          Link,
          {
            to: href,
            onClick: onItemClick,
            className: "text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8",
            children: name
          },
          name
        )
      )
    }
  );
}
let clerkProviderMounted = false;
function AuthButtons({
  urls,
  className = "",
  signInClassName = "h-8 w-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors",
  avatarSize = "h-8 w-8",
  signedInContent = null,
  signedOutContent = null,
  wrapWithProvider = true
} = {}) {
  const [clerkModule, setClerkModule] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const isOwner = useRef(false);
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);
  useEffect(() => {
    if (clerkProviderMounted) return;
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!key) return;
    clerkProviderMounted = true;
    isOwner.current = true;
    import("./index-1wa3mUHv.js").then((mod) => setClerkModule(mod)).catch(() => {
    });
    return () => {
      if (isOwner.current) {
        clerkProviderMounted = false;
      }
    };
  }, []);
  if (!clerkModule || !isOwner.current) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `${signInClassName} ${className}`.trim(),
        "aria-label": "Sign in",
        children: /* @__PURE__ */ jsx(Icons.UserEmpty, { className: "h-4 w-4" })
      }
    );
  }
  const { ClerkProvider, SignedOut, SignedIn, SignInButton, UserButton } = clerkModule;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey || !ClerkProvider || !SignedOut || !SignedIn || !SignInButton || !UserButton) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `${signInClassName} ${className}`.trim(),
        "aria-label": "Sign in (Unavailable)",
        children: /* @__PURE__ */ jsx(Icons.UserEmpty, { className: "h-4 w-4" })
      }
    );
  }
  const redirectUrl = currentUrl || urls?.apps?.blog || "https://blog.duyet.net";
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    signedOutContent && /* @__PURE__ */ jsx(SignedOut, { children: signedOutContent }),
    signedInContent && /* @__PURE__ */ jsx(SignedIn, { children: signedInContent }),
    /* @__PURE__ */ jsx(SignedOut, { children: /* @__PURE__ */ jsx(SignInButton, { mode: "modal", redirectUrl, children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `${signInClassName} ${className}`.trim(),
        "aria-label": "Sign in",
        children: /* @__PURE__ */ jsx(Icons.UserEmpty, { className: "h-4 w-4" })
      }
    ) }) }),
    /* @__PURE__ */ jsx(SignedIn, { children: /* @__PURE__ */ jsx(
      UserButton,
      {
        appearance: {
          elements: {
            avatarBox: avatarSize
          }
        },
        afterSignOutUrl: redirectUrl
      }
    ) })
  ] });
  return wrapWithProvider ? /* @__PURE__ */ jsx(ClerkProvider, { publishableKey, children: content }) : content;
}
function HeaderBranding({
  homeUrl,
  shortText,
  longText,
  logo = true,
  center = false,
  className
}) {
  const linkClassName = cn(
    "font-serif text-xl sm:text-2xl font-normal text-neutral-900 dark:text-neutral-100",
    className
  );
  const textContent = shortText && longText ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "block sm:hidden", children: shortText }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: cn("hidden sm:block", center && "md:text-7xl md:mt-5"),
        children: longText
      }
    )
  ] }) : /* @__PURE__ */ jsx("span", { children: shortText || longText });
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-row items-center gap-2"), children: [
    logo && /* @__PURE__ */ jsx(
      Logo,
      {
        className: center ? "md:flex-col" : "",
        logoClassName: center ? "md:w-40 md:h-40" : ""
      }
    ),
    homeUrl.startsWith("http") ? /* @__PURE__ */ jsx("a", { href: homeUrl, className: linkClassName, children: textContent }) : /* @__PURE__ */ jsx(Link, { to: homeUrl, className: linkClassName, children: textContent })
  ] });
}
function Header({
  profile = duyetProfile,
  urls = duyetUrls,
  logo = true,
  shortText,
  longText,
  center = false,
  navigationItems,
  className,
  containerClassName
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayShortText = shortText ?? profile.personal.shortName;
  const displayLongText = longText ?? profile.personal.title;
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: cn(
        "py-10",
        center ? "md:flex md:justify-center md:my-10" : "",
        className
      ),
      children: /* @__PURE__ */ jsxs(Container, { className: cn("mb-0", containerClassName), children: [
        /* @__PURE__ */ jsxs(
          "nav",
          {
            className: cn(
              "flex items-center flex-wrap justify-between transition-all gap-4",
              center && "md:flex-col md:gap-10"
            ),
            children: [
              /* @__PURE__ */ jsx(
                HeaderBranding,
                {
                  homeUrl: urls.apps.home,
                  shortText: displayShortText,
                  longText: displayLongText,
                  logo,
                  center
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "hidden md:flex flex-row gap-3 sm:gap-5 flex-wrap items-center", children: [
                /* @__PURE__ */ jsx(
                  Menu,
                  {
                    urls,
                    navigationItems,
                    className: "gap-3 sm:gap-5"
                  }
                ),
                /* @__PURE__ */ jsx(AuthButtons, { urls })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 md:hidden", children: [
                /* @__PURE__ */ jsx(AuthButtons, { urls }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setMobileMenuOpen((prev) => !prev),
                    "aria-label": mobileMenuOpen ? "Close menu" : "Open menu",
                    "aria-expanded": mobileMenuOpen,
                    className: "p-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 rounded",
                    children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "size-5" }) : /* @__PURE__ */ jsx(Menu$1, { className: "size-5" })
                  }
                )
              ] })
            ]
          }
        ),
        mobileMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden border-t border-neutral-200 dark:border-neutral-700 mt-4 pt-4", children: /* @__PURE__ */ jsx(
          Menu,
          {
            urls,
            navigationItems,
            className: "flex-col gap-3",
            onItemClick: () => setMobileMenuOpen(false)
          }
        ) })
      ] })
    }
  );
}
function Providers({ children }) {
  return /* @__PURE__ */ jsx(
    ThemeProvider,
    {
      defaultTheme: "system",
      attribute: "class",
      enableSystem: true,
      disableTransitionOnChange: true,
      children
    }
  );
}
const schemaOrgData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Duyet Le",
  jobTitle: "Senior Data Engineer",
  email: "me@duyet.net",
  url: "https://duyet.net",
  sameAs: [
    "https://github.com/duyet",
    "https://linkedin.com/in/duyet",
    "https://blog.duyet.net"
  ],
  description: "Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing.",
  knowsAbout: [
    "LlamaIndex",
    "AI SDK",
    "LangGraph",
    "ClickHouse",
    "Apache Spark",
    "Apache Airflow",
    "Python",
    "Rust",
    "TypeScript",
    "Kubernetes",
    "AWS",
    "GCP",
    "Kafka",
    "BigQuery",
    "Helm",
    "Data Engineering",
    "Distributed Systems",
    "Cloud Computing",
    "Data Warehousing",
    "Machine Learning Infrastructure",
    "DevOps"
  ],
  worksFor: {
    "@type": "Organization",
    name: "Cartrack",
    url: "https://cartrack.us"
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Information Technology"
  }
};
const Route$2 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Duyet Le | Resume" },
      {
        name: "description",
        content: "Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing. Proficient in LlamaIndex, AI SDK, LangGraph, ClickHouse, Spark, Airflow, Python, and Rust."
      }
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Libre+Baskerville:wght@400;700&display=swap"
      }
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(schemaOrgData)
      }
    ]
  }),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(Head, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "bg-[var(--background)] font-sans text-[var(--foreground)] antialiased", children: [
      /* @__PURE__ */ jsxs(Providers, { children: [
        /* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsx(Container, { className: "mb-20 mt-10 min-h-screen max-w-3xl md:mt-20 print:mb-10 print:mt-10", children }) }),
        /* @__PURE__ */ jsx("div", { className: "border-t print:hidden", children: /* @__PURE__ */ jsx(
          Header,
          {
            logo: false,
            containerClassName: "max-w-3xl",
            longText: "Resume",
            navigationItems: [HOME, BLOG, PHOTOS, INSIGHTS, ABOUT],
            shortText: "CV"
          }
        ) }),
        /* @__PURE__ */ jsx(Footer, { className: "print:hidden", containerClassName: "max-w-3xl" }),
        /* @__PURE__ */ jsx(AnalyticWrapper, {})
      ] }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$1 = () => import("./pdf-DOmpLlPw.js");
const Route$1 = createFileRoute("/pdf")({
  head: () => ({
    meta: [{
      title: "Duyet Le | Resume"
    }, {
      name: "description",
      content: ""
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-DIjVtyUO.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const PdfRoute = Route$1.update({
  id: "/pdf",
  path: "/pdf",
  getParentRoute: () => Route$2
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$2
});
const rootRouteChildren = {
  IndexRoute,
  PdfRoute
};
const routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true });
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Primitive as P,
  createContextScope as a,
  useComposedRefs as b,
  cn as c,
  useCallbackRef as d,
  composeEventHandlers as e,
  dispatchDiscreteCustomEvent as f,
  useControllableState as g,
  router as r,
  useLayoutEffect2 as u
};
