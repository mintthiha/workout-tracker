import { calculateOneRepMax } from "@/src/lib/oneRepMax";

describe("calculateOneRepMax", () => {
	describe("Epley formula (weight × (1 + reps / 30))", () => {
		it("returns weight directly for 1 rep", () => {
			expect(calculateOneRepMax(225, 1, "epley")).toBe(225);
		});

		it("computes correct estimate for a multi-rep set", () => {
			expect(calculateOneRepMax(200, 5, "epley")).toBeCloseTo(200 * (1 + 5 / 30));
		});

		it("produces a higher estimate as reps increase at fixed weight", () => {
			const e5 = calculateOneRepMax(100, 5, "epley");
			const e10 = calculateOneRepMax(100, 10, "epley");
			expect(e10).toBeGreaterThan(e5);
		});
	});

	describe("Brzycki formula (weight × 36 / (37 − reps))", () => {
		it("returns weight directly for 1 rep", () => {
			expect(calculateOneRepMax(225, 1, "brzycki")).toBe(225);
		});

		it("computes correct estimate for a multi-rep set", () => {
			expect(calculateOneRepMax(200, 5, "brzycki")).toBeCloseTo((200 * 36) / (37 - 5));
		});

		it("returns 0 when reps equal 37 (denominator becomes zero)", () => {
			expect(calculateOneRepMax(200, 37, "brzycki")).toBe(0);
		});

		it("returns 0 when reps exceed 37", () => {
			expect(calculateOneRepMax(200, 40, "brzycki")).toBe(0);
		});
	});

	describe("edge cases", () => {
		it("returns 0 for zero weight", () => {
			expect(calculateOneRepMax(0, 5, "epley")).toBe(0);
			expect(calculateOneRepMax(0, 5, "brzycki")).toBe(0);
		});

		it("returns 0 for zero reps", () => {
			expect(calculateOneRepMax(200, 0, "epley")).toBe(0);
			expect(calculateOneRepMax(200, 0, "brzycki")).toBe(0);
		});

		it("returns 0 for negative weight", () => {
			expect(calculateOneRepMax(-100, 5, "epley")).toBe(0);
		});

		it("returns 0 for negative reps", () => {
			expect(calculateOneRepMax(200, -3, "epley")).toBe(0);
		});

		it("Epley and Brzycki converge near 1 rep", () => {
			const epley = calculateOneRepMax(200, 1, "epley");
			const brzycki = calculateOneRepMax(200, 1, "brzycki");
			expect(epley).toBe(200);
			expect(brzycki).toBe(200);
		});
	});
});
