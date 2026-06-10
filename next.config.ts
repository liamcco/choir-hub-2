import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // allowedDevOrigins: ['192.168.1.17'],
  logging: {
    browserToTerminal: true,
    incomingRequests: {
      ignore: [/^\/api(?:\/|$)/],
    },
  },
};

export default nextConfig;
