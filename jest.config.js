module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/ios/',
        '<rootDir>/android/',
    ],
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-navigation|@getpara|@tanstack)/)',
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{ts,tsx}',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
};
