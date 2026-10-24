import { createMDX } from 'fumadocs-mdx/next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const withMDX = createMDX();

/** @type {(phase: string) => import('next').NextConfig} */
export default function config(phase) {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return withMDX({
    reactStrictMode: true,
    // Self-contained server bundle for the Docker image (see Dockerfile).
    output: 'standalone',
    experimental: {
      // Build: at most 4 static-generation workers, sized by free memory (124+ docs pages, OG images).
      cpus: 4,
      memoryBasedWorkersCount: true,
      ...(dev && {
        // `next dev` memory on shared machines. Dev only: worker-thread loaders are experimental and
        // made a production build fail intermittently in CI (PostCSS "Error evaluating Node.js code").
        // Drop the in-memory cache after each disk snapshot (the default 'auto' relies on OS memory
        // pressure, which cgroup caps don't signal).
        turbopackMemoryEviction: 'full',
        // Run loaders (fumadocs-mdx, PostCSS) as worker threads instead of one ~120 MB child process
        // per CPU core. `force` because Next falls back on Node >= 24.13.1 (teardown issue).
        turbopackPluginRuntimeStrategy: 'forceWorkerThreads',
      }),
    },
  });
}
