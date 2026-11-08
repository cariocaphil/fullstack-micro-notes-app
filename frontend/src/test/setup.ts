import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import * as doubles from './kolibri-test-doubles'

/**
 * KoliBri Stencil components skip bootstrapping under happy-dom
 * ("No document found. Skipping bootstrapping lazy components"),
 * so React tests use contract-compatible doubles instead.
 */
vi.mock('@public-ui/react-v19', () => doubles)
