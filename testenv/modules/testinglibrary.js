import TestingLibraryMatchersDefault, * as TestingLibraryMatchersNamed from '@testing-library/jest-dom/matchers.js'

expect.extend(TestingLibraryMatchersDefault ?? TestingLibraryMatchersNamed)
