import { describe, expect, it } from "vitest";
import { redirectToAidr } from "./aidr-redirect";

function request(url: string, method = "GET"): Request {
  return new Request(url, { method });
}

describe("redirectToAidr", () => {
  it("301s the news.duyet.net homepage to aidr.today", () => {
    const res = redirectToAidr(request("https://news.duyet.net/"));
    expect(res).not.toBeNull();
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe("https://aidr.today/");
  });

  it("keeps path and query on GET", () => {
    const res = redirectToAidr(
      request("https://news.duyet.net/about?lang=vi")
    );
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe(
      "https://aidr.today/about?lang=vi"
    );
  });

  it("maps /news-tab.zip to /aidr.zip", () => {
    const res = redirectToAidr(
      request("https://news.duyet.net/news-tab.zip?dl=1")
    );
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe(
      "https://aidr.today/aidr.zip?dl=1"
    );
  });

  it("308s POST/PUT/PATCH/DELETE so the method is preserved", () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const res = redirectToAidr(
        request("https://news.duyet.net/api/subscribe", method)
      );
      expect(res?.status).toBe(308);
      expect(res?.headers.get("location")).toBe(
        "https://aidr.today/api/subscribe"
      );
    }
  });

  it("does not redirect localhost", () => {
    expect(redirectToAidr(request("http://localhost:3014/"))).toBeNull();
  });

  it("does not redirect workers.dev", () => {
    expect(
      redirectToAidr(request("https://duyet-news.duyet.workers.dev/"))
    ).toBeNull();
  });
});
