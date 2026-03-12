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
      label: "API Reference",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "endpoints/wallet-intel",
          label: "Wallet Intelligence",
        },
        {
          type: "doc",
          id: "endpoints/batch-token",
          label: "Holder Profiles & Similarity",
        },
        {
          type: "doc",
          id: "endpoints/async-jobs",
          label: "Job Polling",
        },
      ],
    },
    {
      type: "doc",
      id: "reference",
      label: "Behavior Reference",
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
