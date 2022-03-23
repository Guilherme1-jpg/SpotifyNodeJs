const defaultConfig = {
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  covaregeReporters: ["text", "lcov"],
  coverageThreshould: {
    global: {
      branch: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  maxWorkers: "50%",
  watchPathIgnorePatterns: ["node_modules"],
  transformIgnorePatterns: ["node_modules"],
};

export default {
  project: [
    {
      ...defaultConfig,
      testEnvironment: "node",
      displayName: "backend",
      collectCoverageFro: ["server/", "!server/index.js"],
      transformIgnorePatterns: [
        ...defaultConfig.transformIgnorePatterns,
        "public",
      ],
      testMatch: ["**/tests/**/server/**/*.test.js"],
    },

    {
      ...defaultConfig,
      testEnvironment: "jsdom",
      displayName: "frontend",
      collectCoverageFro: ["public/"],
      transformIgnorePatterns: [
        ...defaultConfig.transformIgnorePatterns,
        "server",
      ],
      testMatch: ["**/tests/**/public/**/*.test.js"],
    },
  ],
};
