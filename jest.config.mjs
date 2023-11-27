import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  testPathIgnorePatterns: ['<rootDir>/__tests__/util.js'],
 
  // testEnvironment: 'jest-environment-jsdom',
  // TODO: fixme https://github.com/jsdom/jsdom/issues/3363#issuecomment-1467894943
  testEnvironment: './FixJSDOMEnvironment.ts',
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
