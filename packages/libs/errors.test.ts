import { describe, test, expect } from "bun:test";
import {
  LibError,
  ValidationError,
  NetworkError,
  FileSystemError,
  isLibError,
  isNetworkError,
  isValidationError,
  isFileSystemError,
} from "./errors";

describe("LibError", () => {
  test("creates with message only", () => {
    const err = new LibError("something failed");
    expect(err.message).toBe("something failed");
    expect(err.name).toBe("LibError");
    expect(err.code).toBeUndefined();
    expect(err.context).toBeUndefined();
  });

  test("creates with code and context", () => {
    const err = new LibError("oops", { code: "ERR_001", context: { key: "value" } });
    expect(err.code).toBe("ERR_001");
    expect(err.context).toEqual({ key: "value" });
  });

  test("is instanceof Error and LibError", () => {
    const err = new LibError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(LibError);
  });

  test("toJSON returns all fields", () => {
    const err = new LibError("test msg", { code: "ERR_X", context: { a: 1 } });
    expect(err.toJSON()).toEqual({
      name: "LibError",
      message: "test msg",
      code: "ERR_X",
      context: { a: 1 },
    });
  });

  test("toJSON with no code or context", () => {
    const err = new LibError("bare");
    expect(err.toJSON()).toEqual({
      name: "LibError",
      message: "bare",
      code: undefined,
      context: undefined,
    });
  });
});

describe("ValidationError", () => {
  test("creates with message", () => {
    const err = new ValidationError("invalid email");
    expect(err.message).toBe("invalid email");
    expect(err.name).toBe("ValidationError");
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  test("creates with context", () => {
    const err = new ValidationError("bad field", { field: "email" });
    expect(err.context).toEqual({ field: "email" });
  });

  test("is instanceof LibError and ValidationError", () => {
    const err = new ValidationError("x");
    expect(err).toBeInstanceOf(LibError);
    expect(err).toBeInstanceOf(ValidationError);
  });

  test("toJSON includes ValidationError name", () => {
    const err = new ValidationError("x");
    expect(err.toJSON().name).toBe("ValidationError");
    expect(err.toJSON().code).toBe("VALIDATION_ERROR");
  });
});

describe("NetworkError", () => {
  test("creates with message only", () => {
    const err = new NetworkError("fetch failed");
    expect(err.message).toBe("fetch failed");
    expect(err.name).toBe("NetworkError");
    expect(err.code).toBe("NETWORK_ERROR");
    expect(err.status).toBeUndefined();
    expect(err.statusText).toBeUndefined();
    expect(err.url).toBeUndefined();
  });

  test("creates with full context", () => {
    const err = new NetworkError("not found", {
      status: 404,
      statusText: "Not Found",
      url: "https://example.com/api",
    });
    expect(err.status).toBe(404);
    expect(err.statusText).toBe("Not Found");
    expect(err.url).toBe("https://example.com/api");
  });

  test("is instanceof LibError and NetworkError", () => {
    const err = new NetworkError("x");
    expect(err).toBeInstanceOf(LibError);
    expect(err).toBeInstanceOf(NetworkError);
  });

  test("toJSON includes NetworkError name", () => {
    const err = new NetworkError("fail", { status: 500 });
    expect(err.toJSON().name).toBe("NetworkError");
    expect(err.toJSON().code).toBe("NETWORK_ERROR");
  });
});

describe("FileSystemError", () => {
  test("creates with message only", () => {
    const err = new FileSystemError("read failed");
    expect(err.message).toBe("read failed");
    expect(err.name).toBe("FileSystemError");
    expect(err.code).toBe("FILE_SYSTEM_ERROR");
    expect(err.path).toBeUndefined();
  });

  test("creates with path in context", () => {
    const err = new FileSystemError("not found", { path: "/etc/passwd" });
    expect(err.path).toBe("/etc/passwd");
    expect(err.context).toMatchObject({ path: "/etc/passwd" });
  });

  test("is instanceof LibError and FileSystemError", () => {
    const err = new FileSystemError("x");
    expect(err).toBeInstanceOf(LibError);
    expect(err).toBeInstanceOf(FileSystemError);
  });

  test("toJSON includes FileSystemError name", () => {
    const err = new FileSystemError("oops", { path: "/tmp/file" });
    expect(err.toJSON().name).toBe("FileSystemError");
    expect(err.toJSON().code).toBe("FILE_SYSTEM_ERROR");
  });
});

describe("isLibError", () => {
  test("returns true for LibError", () => {
    expect(isLibError(new LibError("x"))).toBe(true);
  });

  test("returns true for subclasses", () => {
    expect(isLibError(new ValidationError("x"))).toBe(true);
    expect(isLibError(new NetworkError("x"))).toBe(true);
    expect(isLibError(new FileSystemError("x"))).toBe(true);
  });

  test("returns false for plain Error", () => {
    expect(isLibError(new Error("x"))).toBe(false);
  });

  test("returns false for non-errors", () => {
    expect(isLibError("string")).toBe(false);
    expect(isLibError(null)).toBe(false);
    expect(isLibError(42)).toBe(false);
  });
});

describe("isValidationError", () => {
  test("returns true only for ValidationError instances", () => {
    expect(isValidationError(new ValidationError("x"))).toBe(true);
    expect(isValidationError(new LibError("x"))).toBe(false);
    expect(isValidationError(new NetworkError("x"))).toBe(false);
    expect(isValidationError(new FileSystemError("x"))).toBe(false);
  });
});

describe("isNetworkError", () => {
  test("returns true only for NetworkError instances", () => {
    expect(isNetworkError(new NetworkError("x"))).toBe(true);
    expect(isNetworkError(new LibError("x"))).toBe(false);
    expect(isNetworkError(new ValidationError("x"))).toBe(false);
    expect(isNetworkError(new FileSystemError("x"))).toBe(false);
  });
});

describe("isFileSystemError", () => {
  test("returns true only for FileSystemError instances", () => {
    expect(isFileSystemError(new FileSystemError("x"))).toBe(true);
    expect(isFileSystemError(new LibError("x"))).toBe(false);
    expect(isFileSystemError(new ValidationError("x"))).toBe(false);
    expect(isFileSystemError(new NetworkError("x"))).toBe(false);
  });
});
