/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable remote images from Unsplash for the popup sponsor and random sponsors
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  // Existing config placeholders (if any) can be added here
};

module.exports = nextConfig;
