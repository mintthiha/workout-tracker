module.exports = {
	preset: "jest-expo",
	roots: ["<rootDir>/tests"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	testPathIgnorePatterns: ["/node_modules/", "/android/"],
};
