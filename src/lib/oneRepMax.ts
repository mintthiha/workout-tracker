export type OneRepMaxFormula = "epley" | "brzycki";

/** Epley: weight × (1 + reps / 30). */
function epley(weight: number, reps: number): number {
	if (reps === 1) return weight;
	return weight * (1 + reps / 30);
}

/** Brzycki: weight × 36 / (37 − reps). Returns 0 when reps ≥ 37 (denominator non-positive). */
function brzycki(weight: number, reps: number): number {
	if (reps === 1) return weight;
	if (reps >= 37) return 0;
	return (weight * 36) / (37 - reps);
}

/** Estimates one-rep max for a given weight, rep count, and formula. Returns 0 for invalid inputs. */
export function calculateOneRepMax(
	weight: number,
	reps: number,
	formula: OneRepMaxFormula,
): number {
	if (weight <= 0 || reps <= 0) return 0;
	return formula === "epley" ? epley(weight, reps) : brzycki(weight, reps);
}
