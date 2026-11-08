// eslint-config-next 16 ships a flat config, so it is imported directly.
// The old FlatCompat wrapper tried to read it as a legacy config and crashed
// with "Converting circular structure to JSON".
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'public/**', 'next-env.d.ts'],
  },
  {
    // The React Compiler rules shipped with eslint-config-next 16 flag the
    // mock-data generators (Math.random / Date.now during render). They are
    // real findings but pre-date this config; keep them visible as warnings
    // until the mock generators are replaced by API data.
    rules: {
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default eslintConfig;
