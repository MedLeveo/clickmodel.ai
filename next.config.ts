import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Suprimir avisos de hydration causados por extensões do navegador
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Configurações para produção
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
