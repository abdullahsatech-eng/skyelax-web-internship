import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config/env';

describe('loadConfig', () => {
  it('fails clearly when MONGODB_URI is missing', () => {
    expect(() => loadConfig({})).toThrow(/MONGODB_URI/);
  });

  it('requires CLIENT_ORIGIN in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production', MONGODB_URI: 'mongodb://x/db' })).toThrow(
      /CLIENT_ORIGIN/,
    );
  });

  it('applies development defaults', () => {
    const config = loadConfig({ MONGODB_URI: 'mongodb://x/db' });
    expect(config).toMatchObject({
      port: 4000,
      nodeEnv: 'development',
      isProduction: false,
      clientOrigins: ['http://localhost:5173'],
    });
  });

  it('parses several origins and strips trailing slashes', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb://x/db',
      CLIENT_ORIGIN: 'https://a.example/, https://b.example',
    });
    expect(config.clientOrigins).toEqual(['https://a.example', 'https://b.example']);
  });

  it('rejects an invalid port', () => {
    expect(() => loadConfig({ MONGODB_URI: 'mongodb://x/db', PORT: 'abc' })).toThrow(/PORT/);
    expect(() => loadConfig({ MONGODB_URI: 'mongodb://x/db', PORT: '70000' })).toThrow(/PORT/);
  });
});
