import { pathsToModuleNameMapper } from 'ts-jest';

export default {
	collectCoverage: true,
	// moduleFileExtensions: ['js', 'json', 'ts'],
	// roots: [
	//   "<rootDir>/apps/",
	//   "<rootDir>/libs/"
	// ],
	// rootDir: '.',
	// testRegex: '.*\\.spec\\.ts$',
	// transform: {
	//   "^.+\\.(t|j)s$": "ts-jest",
	// },
	// coveragePathIgnorePatterns: ['dist', 'node_modules', 'coverage'],
	// collectCoverageFrom: ['**/*.ts'],
	// coverageDirectory: './coverage',
	// testEnvironment: 'node',
	// coverageThreshold: {
	//   global: {
	//     lines: 90,
	//     statements: 90,
	//     functions: 80,
	//     branches: 60,
	//   },
	// },
	// moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
	//   prefix: '<rootDir>/'
	// }),
	// projects: ['<rootDir>/**/jest.config.js']
	roots: ['<rootDir>/src'],
	preset: 'ts-jest',
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '.',
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coveragePathIgnorePatterns: [
		// Không tạo coverage với mọi index.ts trừ operation folder
		'^(?!.*\\/operations\\/).*\\/index\\.ts$',
	],
	coverageDirectory: './coverage',
	testEnvironment: 'node',
	// "roots": [
	//     "<rootDir>/packages/"
	// ],
	// moduleNameMapper: pathsToModuleNameMapper({}, {
	//     prefix: '<rootDir>/tests'
	// }),
	// projects: ['<rootDir>/**/jest.config.js']
};

// "jest": {
//   "moduleFileExtensions": [
//     "js",
//     "json",
//     "ts"
//   ],
//   "rootDir": ".",
//   "testRegex": ".*\\.spec\\.ts$",
//   "transform": {
//     "^.+\\.(t|j)s$": "ts-jest"
//   },
//   "collectCoverageFrom": [
//     "**/*.(t|j)s"
//   ],
//   "coverageDirectory": "./coverage",
//   "testEnvironment": "node",
//   "roots": [
//     "<rootDir>/apps/",
//     "<rootDir>/libs/"
//   ],
//   "moduleNameMapper": {
//     "^@app/modules(|/.*)$": "<rootDir>/libs/modules/src/$1",
//     "^@app/utils(|/.*)$": "<rootDir>/libs/utils/src/$1"
//   }
// },
