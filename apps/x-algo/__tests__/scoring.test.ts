import { describe, expect, it } from "vitest";
import {
  diversityMultiplier,
  likesEquivalent,
  oonApplies,
  offsetScore,
  replyWeightFor,
  scorePost,
} from "../src/lib/scoring";

describe("replyWeightFor", () => {
  it("boosts only mutual-follow originals", () => {
    expect(
      replyWeightFor({
        inNetwork: true,
        isReply: false,
        isRetweet: false,
        isMutualFollow: true,
        authorOccurrence: 0,
      }),
    ).toBe(20);
  });

  it("stays at 5 for mutual replies", () => {
    expect(
      replyWeightFor({
        inNetwork: true,
        isReply: true,
        isRetweet: false,
        isMutualFollow: true,
        authorOccurrence: 0,
      }),
    ).toBe(5);
  });
});

describe("diversityMultiplier", () => {
  it("uses 0.75 * 0.5^k + 0.25", () => {
    expect(diversityMultiplier(0)).toBe(1);
    expect(diversityMultiplier(1)).toBe(0.625);
    expect(diversityMultiplier(2)).toBe(0.4375);
    expect(diversityMultiplier(3)).toBe(0.34375);
  });
});

describe("oonApplies", () => {
  it("discounts OON and in-network replies/RTs", () => {
    expect(
      oonApplies({
        inNetwork: false,
        isReply: false,
        isRetweet: false,
        isMutualFollow: false,
        authorOccurrence: 0,
      }),
    ).toBe(true);
    expect(
      oonApplies({
        inNetwork: true,
        isReply: true,
        isRetweet: false,
        isMutualFollow: false,
        authorOccurrence: 0,
      }),
    ).toBe(true);
    expect(
      oonApplies({
        inNetwork: true,
        isReply: false,
        isRetweet: false,
        isMutualFollow: false,
        authorOccurrence: 0,
      }),
    ).toBe(false);
  });
});

describe("scorePost", () => {
  it("makes copy-link 40× a like", () => {
    expect(likesEquivalent(20)).toBe(40);
    const like = scorePost(
      { favorite: 1 },
      {
        inNetwork: true,
        isReply: false,
        isRetweet: false,
        isMutualFollow: false,
        authorOccurrence: 0,
      },
    );
    const copy = scorePost(
      { share_via_copy_link: 1 },
      {
        inNetwork: true,
        isReply: false,
        isRetweet: false,
        isMutualFollow: false,
        authorOccurrence: 0,
      },
    );
    expect(copy.combined / like.combined).toBe(40);
  });

  it("lets one report wipe hundreds of likes", () => {
    const report = scorePost(
      { report: 1 },
      {
        inNetwork: true,
        isReply: false,
        isRetweet: false,
        isMutualFollow: false,
        authorOccurrence: 0,
      },
    );
    expect(report.combined).toBe(-234);
    expect(Math.abs(report.combined) / 0.5).toBe(468);
  });

  it("applies OON after diversity", () => {
    const scored = scorePost(
      { favorite: 1 },
      {
        inNetwork: false,
        isReply: false,
        isRetweet: false,
        isMutualFollow: false,
        authorOccurrence: 1,
      },
    );
    expect(scored.diversity).toBe(0.625);
    expect(scored.oon).toBe(0.75);
    expect(scored.final).toBeCloseTo(offsetScore(0.5) * 0.625 * 0.75);
  });
});
