/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/dashboard/recruiter/independent",
        destination: "/dashboard/independent-recruiter",
      },
      {
        source: "/dashboard/recruiter/independent/employment-history",
        destination: "/dashboard/independent-recruiter/recruiter-history",
      },
      {
        source: "/dashboard/recruiter/independent/:path*",
        destination: "/dashboard/independent-recruiter/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard/independent-recuiter/:path*",
        destination: "/dashboard/independent-recruiter/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
