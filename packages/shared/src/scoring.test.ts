import { describe, expect, it } from "vitest";
import { scoreMatchPrediction } from "./scoring";

describe("scoreMatchPrediction", () => {
  it("awards 3 for correct winner", () => {
    const result = scoreMatchPrediction(
      { home: 2, away: 1 },
      { home: 3, away: 1 }
    );
    expect(result.points).toBe(3);
    expect(result.isWinnerCorrect).toBe(true);
    expect(result.isExact).toBe(false);
  });

  it("awards 5 for exact score", () => {
    const result = scoreMatchPrediction(
      { home: 1, away: 1 },
      { home: 1, away: 1 }
    );
    expect(result.points).toBe(5);
    expect(result.isExact).toBe(true);
  });

  it("awards 0 for wrong prediction", () => {
    const result = scoreMatchPrediction(
      { home: 2, away: 0 },
      { home: 0, away: 2 }
    );
    expect(result.points).toBe(0);
    expect(result.isFailed).toBe(true);
  });
});
