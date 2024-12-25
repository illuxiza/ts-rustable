
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
    "^@rustable/coll$": "<rootDir>/packages/coll/src",
    "^@rustable/utils$": "<rootDir>/packages/utils/src",
    "^@rustable/iter$": "<rootDir>/packages/iter/src",
    "^@rustable/enum$": "<rootDir>/packages/enum/src",
    "^@rustable/trait$": "<rootDir>/packages/trait/src",
    "^@rustable/commons$": "<rootDir>/packages/commons/src",
  },
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: true
};
