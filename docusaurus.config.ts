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
          type: 'docSidebar',
          sidebarId: 'javascriptSidebar',
          position: 'left',
          label: 'JavaScript',
        },
        {
          type: 'docSidebar',
          sidebarId: 'typescriptSidebar',
          position: 'left',
          label: 'TypeScript',
        },
        {
          type: 'docSidebar',
          sidebarId: 'reactSidebar',
          position: 'left',
          label: 'React',
        },
        {
          type: 'docSidebar',
          sidebarId: 'nextjsSidebar',
          position: 'left',
          label: 'Next.js',
        },
        {
          type: 'docSidebar',
          sidebarId: 'backendSidebar',
          position: 'left',
          label: 'Backend',
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'seoSidebar',
        //   position: 'left',
        //   label: 'SEO',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'javaSidebar',
        //   position: 'left',
        //   label: 'Java',
        // },
        
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'gitSidebar',
        //   position: 'left',
        //   label: 'Git',
        // },
       
        
        
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'interviewSidebar',
        //   position: 'left',
        //   label: 'FE Interview',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'nodejsSidebar',
        //   position: 'left',
        //   label: 'Node.js',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'dockerSidebar',
        //   position: 'left',
        //   label: 'Docker',
        // },
        {
          type: 'custom-logoutButton',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      // links: [
      //   {
      //     title: 'Tài liệu',
      //     items: [
      //       { label: 'Java', to: '/docs/java/basic-java/overview' },
      //       { label: 'React', to: '/docs/react/nen-tang/es6-essentials' },
      //       { label: 'JavaScript', to: '/docs/javascript/nen-tang/overview' },
      //     ],
      //   },
      //   {
      //     title: 'Khám phá thêm',
      //     items: [
      //       { label: 'Next.js', to: '/docs/nextjs/nen-tang/nextjs-la-gi' },
      //       { label: 'Git', to: '/docs/git/nen-tang/git-la-gi' },
      //       { label: 'SEO', to: '/docs/seo/nen-tang/seo-la-gi' },
      //       { label: 'Node.js', to: '/docs/nodejs/nen-tang/nodejs-la-gi' },
      //       { label: 'Docker', to: '/docs/docker/nen-tang/docker-la-gi' },
      //       { label: 'Claude Code', to: '/docs/claude-code/nen-tang/claude-code-la-gi' },
      //       { label: 'IELTS', to: '/docs/ielts/ngu-phap/danh-tu' },
      //     ],
      //   },
      //   {
      //     title: 'Liên kết',
      //     items: [
      //       { label: 'GitHub', href: 'https://github.com/OliverDoan' },
      //     ],
      //   },
      // ],
      copyright: `© ${new Date().getFullYear()} Dev Notes — Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
