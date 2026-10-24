import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: 'standalone',
  experimental: {
    // Build: at most 4 static-generation workers, sized by free memory (124+ docs pages, OG images).
    cpus: 4,
    memoryBasedWorkersCount: true,
    // Dev only: drop in-memory cache after each disk snapshot. Keeps `next dev` within a few GB on
    // shared machines (the default 'auto' relies on OS memory pressure, which cgroup caps don't signal).
    turbopackMemoryEviction: 'full',
    // Run webpack loaders (fumadocs-mdx, PostCSS) as worker threads instead of one child process per
    // CPU core (~120 MB each). `force` because Next falls back on Node >= 24.13.1 (teardown issue).
    turbopackPluginRuntimeStrategy: 'forceWorkerThreads',
  },
};

export default withMDX(config);
