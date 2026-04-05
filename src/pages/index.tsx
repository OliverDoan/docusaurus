import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import type { ReactNode } from 'react';

interface DocCard {
  title: string;
  emoji: string;
  description: string;
  link: string;
  articles: number;
  color: string;
}

const docCards: DocCard[] = [
  {
    title: 'Java',
    emoji: '☕',
    description: 'Từ cơ bản đến OOP, Collections, Exception Handling và các nguyên lý lập trình.',
    link: '/docs/java/basic-java/overview',
    articles: 47,
    color: '#f89820',
  },
  {
    title: 'React',
    emoji: '⚛️',
    description: 'Hooks, State Management, Performance, Testing và các pattern thực tế.',
    link: '/docs/react/nen-tang/es6-essentials',
    articles: 34,
    color: '#61dafb',
  },
  {
    title: 'JavaScript',
    emoji: '📜',
    description: 'ES6+, Async/Await, Closures, Prototypes và các khái niệm nâng cao.',
    link: '/docs/javascript/nen-tang/overview',
    articles: 33,
    color: '#f7df1e',
  },
  {
    title: 'Next.js',
    emoji: '▲',
    description: 'App Router, SSR, SSG, API Routes, Middleware và deployment.',
    link: '/docs/nextjs/nen-tang/nextjs-la-gi',
    articles: 25,
    color: '#000000',
  },
  {
    title: 'Git',
    emoji: '🌿',
    description: 'Branching, Merging, Rebase, CI/CD workflows và best practices.',
    link: '/docs/git/nen-tang/git-la-gi',
    articles: 25,
    color: '#f05032',
  },
  {
    title: 'SEO',
    emoji: '🔍',
    description: 'On-page, Technical SEO, Structured Data, Core Web Vitals và chiến lược nâng cao.',
    link: '/docs/seo/nen-tang/seo-la-gi',
    articles: 25,
    color: '#4285f4',
  },
  {
    title: 'Node.js',
    emoji: '🟢',
    description: 'Express, MongoDB, PostgreSQL, JWT Authentication, WebSocket và deployment.',
    link: '/docs/nodejs/nen-tang/nodejs-la-gi',
    articles: 25,
    color: '#339933',
  },
];

function HeroSection(): ReactNode {
  return (
    <div className="hero-section">
      <div className="container">
        <h1 className="hero-section__title">
          Dev Notes
        </h1>
        <p className="hero-section__subtitle">
          Tài liệu học tập cá nhân — tổng hợp kiến thức lập trình web từ cơ bản đến nâng cao.
        </p>
        <div className="hero-section__stats">
          <div className="hero-section__stat">
            <span className="hero-section__stat-number">214+</span>
            <span className="hero-section__stat-label">Bài viết</span>
          </div>
          <div className="hero-section__stat">
            <span className="hero-section__stat-number">7</span>
            <span className="hero-section__stat-label">Chủ đề</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocCardItem({ title, emoji, description, link, articles, color }: DocCard): ReactNode {
  return (
    <Link to={link} className="doc-card" style={{ '--card-accent': color } as React.CSSProperties}>
      <div className="doc-card__emoji">{emoji}</div>
      <h3 className="doc-card__title">{title}</h3>
      <p className="doc-card__description">{description}</p>
      <div className="doc-card__footer">
        <span className="doc-card__count">{articles} bài viết</span>
        <span className="doc-card__arrow">→</span>
      </div>
    </Link>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Trang chủ"
      description="Tài liệu học tập lập trình web — Java, React, JavaScript, Next.js, Git, SEO">
      <HeroSection />
      <section className="doc-cards-section">
        <div className="container">
          <div className="doc-cards-grid">
            {docCards.map((card) => (
              <DocCardItem key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
