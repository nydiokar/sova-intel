import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Sova Intel",
  tagline: "On-chain intelligence API for Solana",
  favicon: "img/logo.svg",
  url: "https://docs.sova-intel.com",
  baseUrl: "/",
  organizationName: "nydiokar",
  projectName: "sova-intel",
  trailingSlash: false,
  onBrokenLinks: "warn",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Sova Intel Docs",
      logo: {
        alt: "Sova Intel",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "apiSidebar",
          position: "left",
          label: "API Docs",
        },
        {
          href: "https://www.npmjs.com/package/@sova-intel/sdk",
          label: "npm",
          position: "right",
        },
        {
          href: "https://github.com/nydiokar/sova-intel",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Introduction", to: "/" },
            { label: "Authentication", to: "/authentication" },
            { label: "Pricing", to: "/pricing" },
          ],
        },
        {
          title: "Endpoints",
          items: [
            { label: "Wallet Intel", to: "/endpoints/wallet-intel" },
            { label: "Batch & Token", to: "/endpoints/batch-token" },
            { label: "Async Jobs", to: "/endpoints/async-jobs" },
          ],
        },
        {
          title: "SDK",
          items: [
            { label: "Quickstart", to: "/sdk" },
            {
              label: "npm Package",
              href: "https://www.npmjs.com/package/@sova-intel/sdk",
            },
            {
              label: "GitHub",
              href: "https://github.com/nydiokar/sova-intel",
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Sova Intel`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "typescript", "json"],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
