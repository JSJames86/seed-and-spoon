import { expect, test, describe } from 'bun:test';

describe('Bun Migration Tests', () => {
  test('Bun runtime is available', () => {
    expect(typeof Bun).toBe('object');
    expect(Bun.version).toBeDefined();
  });

  test('Critical dependencies load correctly', async () => {
    // Test critical imports
    const dateFns = await import('date-fns');
    const nanoid = await import('nanoid');

    expect(dateFns).toBeDefined();
    expect(nanoid.nanoid).toBeTypeOf('function');
  });

  test('Stripe SDK loads', async () => {
    const stripe = await import('stripe');
    expect(stripe.default).toBeTypeOf('function');
  });

  test('React and React-DOM load', async () => {
    const React = await import('react');
    const ReactDOM = await import('react-dom');

    expect(React.default).toBeDefined();
    expect(ReactDOM.default).toBeDefined();
  });

  test('Next.js modules load', async () => {
    const NextImage = await import('next/image');
    const NextLink = await import('next/link');

    expect(NextImage.default).toBeDefined();
    expect(NextLink.default).toBeDefined();
  });

  test('Leaflet modules load', async () => {
    // Leaflet requires DOM, so just check it can be imported
    const leaflet = await import('leaflet');
    expect(leaflet).toBeDefined();
  });

  test('Environment variables load', () => {
    // Test that process.env is accessible
    expect(process.env).toBeDefined();
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('Bun file operations work', async () => {
    const testFile = '/tmp/bun-test.txt';
    const testContent = 'Bun migration test';

    // Write file
    await Bun.write(testFile, testContent);

    // Read file
    const file = Bun.file(testFile);
    const content = await file.text();

    expect(content).toBe(testContent);
  });
});
