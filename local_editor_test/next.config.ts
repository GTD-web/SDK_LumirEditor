import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 로컬 패키지의 소스를 직접 참조하여 빌드 없이 실시간 반영
  transpilePackages: ['@lumir-company/editor'],
};

export default nextConfig;
