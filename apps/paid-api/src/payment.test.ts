import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decodePaymentRequiredHeader,
  encodePaymentSignatureHeader,
} from "@x402/core/http";
import { buildApp, type Env } from "./index";

const ADDR = "0xb6BECF08DFd2E2B0F03ED6ea48b515d687DB034B";
const NETWORK = "eip155:84532";

type FacilitatorMode = "accept" | "verify-reject" | "settle-fail";

interface FacilitatorStub {
  url: string;
  close: () => Promise<void>;
  readonly verifyCalls: number;
  readonly settleCalls: number;
}

async function startFacilitatorStub(
  mode: FacilitatorMode = "accept",
): Promise<FacilitatorStub> {
  const state = { verifyCalls: 0, settleCalls: 0 };
  let server: Server | undefined;

  await new Promise<void>((resolve) => {
    server = createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
      }

      if (req.method === "GET" && req.url === "/supported") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            kinds: [
              {
                x402Version: 2,
                scheme: "exact",
                network: NETWORK,
              },
            ],
            extensions: [],
            signers: {},
          }),
        );
        return;
      }

      if (req.method === "POST" && req.url === "/verify") {
        state.verifyCalls += 1;
        if (mode === "verify-reject") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ isValid: false, invalidReason: "test" }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ isValid: true }));
        return;
      }

      if (req.method === "POST" && req.url === "/settle") {
        state.settleCalls += 1;
        if (mode === "settle-fail") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              transaction: "0xdead",
              network: NETWORK,
              errorReason: "test-settle-failure",
            }),
          );
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            transaction: "0xabc",
            network: NETWORK,
          }),
        );
        return;
      }

      res.writeHead(404);
      res.end("not found");
    });

    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server!.address();
  if (!address || typeof address === "string") {
    throw new Error("failed to bind facilitator stub");
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    get verifyCalls() {
      return state.verifyCalls;
    },
    get settleCalls() {
      return state.settleCalls;
    },
    close: () =>
      new Promise((resolve, reject) => {
        server!.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

function stubEnv(
  facilitatorUrl: string,
  aiRun = vi.fn().mockResolvedValue("ok"),
): Env {
  return {
    AI: { run: aiRun } as unknown as Env["AI"],
    PAY_TO: ADDR,
    X402_FACILITATOR_URL: facilitatorUrl,
    X402_NETWORK: NETWORK,
    X402_PRICE: "$0.01",
  };
}

describe("x402 payment gate", () => {
  let facilitator: FacilitatorStub | undefined;

  afterEach(async () => {
    await facilitator?.close();
    facilitator = undefined;
  });

  it("returns 402 with accepts when no payment header is present", async () => {
    facilitator = await startFacilitatorStub();
    const env = stubEnv(facilitator.url);
    const app = buildApp(env);

    const res = await app.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      }),
      env,
    );

    expect(res.status).toBe(402);
    const paymentRequiredHeader = res.headers.get("PAYMENT-REQUIRED");
    expect(paymentRequiredHeader).toBeTruthy();
    const body = decodePaymentRequiredHeader(paymentRequiredHeader as string);
    expect(body.accepts?.[0]?.payTo).toBe(ADDR);
    expect(body.accepts?.[0]?.network).toBe(NETWORK);
    expect(body.accepts?.[0]?.scheme).toBe("exact");
  });

  it("runs the handler after facilitator verify succeeds", async () => {
    facilitator = await startFacilitatorStub("accept");
    const aiRun = vi.fn().mockResolvedValue("model-response");
    const env = stubEnv(facilitator.url, aiRun);
    const app = buildApp(env);

    const unpaid = await app.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      }),
      env,
    );
    expect(unpaid.status).toBe(402);
    const paymentRequiredHeader = unpaid.headers.get("PAYMENT-REQUIRED");
    expect(paymentRequiredHeader).toBeTruthy();
    const required = decodePaymentRequiredHeader(paymentRequiredHeader as string);
    const accepted = required.accepts[0];

    const paymentHeader = encodePaymentSignatureHeader({
      x402Version: 2,
      accepted,
      payload: { test: true },
    });

    const paid = await app.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PAYMENT-SIGNATURE": paymentHeader,
        },
        body: JSON.stringify({ message: "hello" }),
      }),
      env,
    );

    expect(paid.status).toBe(200);
    expect(await paid.json()).toEqual({ ok: true, response: "model-response" });
    expect(aiRun).toHaveBeenCalledTimes(1);
    expect(aiRun.mock.calls[0]?.[0]).toBe("@cf/moonshotai/kimi-k2.6");
    expect(facilitator.verifyCalls).toBe(1);
    expect(facilitator.settleCalls).toBe(1);
  });

  it("does not run compute when facilitator verify rejects the payment", async () => {
    facilitator = await startFacilitatorStub("verify-reject");
    const aiRun = vi.fn().mockResolvedValue("model-response");
    const env = stubEnv(facilitator.url, aiRun);
    const app = buildApp(env);

    const unpaid = await app.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      }),
      env,
    );
    const paymentRequiredHeader = unpaid.headers.get("PAYMENT-REQUIRED");
    expect(paymentRequiredHeader).toBeTruthy();
    const required = decodePaymentRequiredHeader(paymentRequiredHeader as string);

    const paymentHeader = encodePaymentSignatureHeader({
      x402Version: 2,
      accepted: required.accepts[0],
      payload: { test: true },
    });

    const res = await app.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PAYMENT-SIGNATURE": paymentHeader,
        },
        body: JSON.stringify({ message: "hello" }),
      }),
      env,
    );

    expect(res.status).toBe(402);
    expect(aiRun).not.toHaveBeenCalled();
    expect(facilitator.verifyCalls).toBe(1);
    expect(facilitator.settleCalls).toBe(0);
  });
});
