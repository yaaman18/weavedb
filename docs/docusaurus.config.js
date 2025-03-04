// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/dracula")

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "WeaveDB",
  tagline: "Decentralized NoSQL Database on Arweave",
  url: "https://weavedb.asteroid.ac",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "asteroid-dao", // Usually your GitHub org/user name.
  projectName: "weavedb", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "WeaveDB",
        logo: {
          alt: "WeaveDB Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Get Started",
          },
          {
            to: "/docs/category/example-dapps",
            label: "Demo Dapps",
            position: "left",
          },
          {
            href: "https://github.com/asteroid-dao/weavedb",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Get Started",
                to: "/docs/intro",
              },
              {
                label: "Demo Dapps",
                to: "/docs/category/example-dapps",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.com/invite/YMe3eqf69M",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/AsteroidDAO",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/asteroid-dao/weavedb",
              },
              {
                label: "ASTΞROIÐ",
                href: "https://asteroid.ac",
              },
            ],
          },
        ],
        copyright: "Built by ASTΞROIÐ",
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
}

module.exports = config
