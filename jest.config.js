
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>", "<rootDir>/node_modules"],
  moduleNameMapper: {
    "^@rustable/utils(.*)$": "<rootDir>/packages/utils/src$1",
    "^@rustable/iter(.*)$": "<rootDir>/packages/iter/src$1",
    "^@rustable/enum(.*)$": "<rootDir>/packages/enum/src$1",
    "^@rustable/trait(.*)$": "<rootDir>/packages/trait/src$1",
    "^@rustable/trait-impls(.*)$": "<rootDir>/packages/trait-impls/src$1",
  },
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: true
};
