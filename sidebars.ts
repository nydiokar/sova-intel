import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  apiSidebar: [
    {
      type: "doc",
      id: "introduction",
      label: "Introduction",
    },
    {
      type: "doc",
      id: "authentication",
      label: "Authentication",
    },
    {
      type: "doc",
      id: "pricing",
      label: "Pricing",
    },
    {
      type: "category",
      label: "Endpoints",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "endpoints/wallet-intel",
          label: "Wallet Intel",
        },
        {
          type: "doc",
          id: "endpoints/batch-token",
          label: "Batch & Token",
        },
        {
          type: "doc",
          id: "endpoints/async-jobs",
          label: "Async Jobs",
        },
      ],
    },
    {
      type: "doc",
      id: "sdk",
      label: "TypeScript SDK",
    },
    {
      type: "doc",
      id: "errors",
      label: "Errors",
    },
  ],
};

export default sidebars;
