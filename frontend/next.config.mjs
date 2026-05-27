/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sqlite3", "sqlite", "@libsql/client"]
  }
};

export default nextConfig;
