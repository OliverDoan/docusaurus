import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load .env.local for local development
dotenv.config({ path: '.env.local' });

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const sitePassword = process.env.SITE_PASSWORD || '';
const sitePasswordHash = sitePassword
  ? crypto.createHash('sha256').update(sitePassword).digest('hex')
  : '';

const config: Config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  customFields: {
    sitePasswordHash,
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Frontend',
          position: 'left',
          items: [
            {type: 'docSidebar', sidebarId: 'javascriptSidebar', label: 'JavaScript'},
            {type: 'docSidebar', sidebarId: 'typescriptSidebar', label: 'TypeScript'},
            {type: 'docSidebar', sidebarId: 'reactSidebar', label: 'React'},
            {type: 'docSidebar', sidebarId: 'reactPracticeSidebar', label: 'React Thực hành'},
            {type: 'docSidebar', sidebarId: 'nextjsSidebar', label: 'Next.js'},
            {type: 'docSidebar', sidebarId: 'reactNativeSidebar', label: 'React Native'},
            {type: 'docSidebar', sidebarId: 'microFrontendSidebar', label: 'Micro-frontend'},
          ],
        },
        {
          type: 'dropdown',
          label: 'Backend',
          position: 'left',
          items: [
            {type: 'docSidebar', sidebarId: 'backendSidebar', label: 'Backend'},
            {type: 'docSidebar', sidebarId: 'sqlSidebar', label: 'SQL'},
            // {type: 'docSidebar', sidebarId: 'nodejsSidebar', label: 'Node.js'},
            // {type: 'docSidebar', sidebarId: 'dockerSidebar', label: 'Docker'},
          ],
        },
        {
          type: 'dropdown',
          label: 'Java',
          position: 'left',
          items: [
            {type: 'docSidebar', sidebarId: 'javaSidebar', label: 'Java'},
            {type: 'docSidebar', sidebarId: 'javaGpcoderSidebar', label: 'Java (gpcoder)'},
            {type: 'docSidebar', sidebarId: 'javaPracticeSidebar', label: 'Java Thực hành'},
          ],
        },
        {
          type: 'dropdown',
          label: 'Phỏng vấn',
          position: 'left',
          items: [
            {type: 'docSidebar', sidebarId: 'interviewSidebar', label: 'FE Interview'},
            {type: 'docSidebar', sidebarId: 'javaInterviewSidebar', label: 'Java Interview (Intern)'},
            {type: 'docSidebar', sidebarId: 'javaInterviewProSidebar', label: 'Java Interview (Pro)'},
          ],
        },
        {
          type: 'docSidebar',
          sidebarId: 'webSecuritySidebar',
          position: 'left',
          label: 'Bảo mật web',
        },
        {
          type: 'dropdown',
          label: 'Công cụ',
          position: 'left',
          items: [
            {type: 'docSidebar', sidebarId: 'claudeSidebar', label: 'Claude'},
            {type: 'docSidebar', sidebarId: 'gitSidebar', label: 'Git'},
            // {type: 'docSidebar', sidebarId: 'seoSidebar', label: 'SEO'},
          ],
        },
        {
          type: 'custom-logoutButton',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
