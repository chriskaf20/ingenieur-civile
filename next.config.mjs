import createMDX from '@next/mdx';

// Plugins déclarés par leur nom : options sérialisables, compatibles Turbopack.
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-gfm', 'remark-math'],
    rehypePlugins: [['rehype-katex', { strict: 'ignore' }]],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  reactStrictMode: true,
};

export default withMDX(nextConfig);
