---
sidebar_position: 3
title: "3. Webpack cơ bản"
---

# Webpack cơ bản


---

## Mục lục

- [Webpack là gì?](#webpack-là-gì)
- [Tại sao Webpack ra đời?](#tại-sao-webpack-ra-đời)
- [Core Concepts — Loaders, Plugins](#core-concepts--loaders-plugins)
- [Webpack Config cơ bản](#webpack-config-cơ-bản)
- [Dev Server vs Production](#dev-server-vs-production)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Webpack là gì?

**Webpack** là **module bundler** — lấy tất cả JS, CSS, images, ... files, **transform** chúng, **combine** lại thành **bundle** optimize cho browser.

```
src/
├── index.js (import React, CSS, images)
├── App.js
├── App.css
└── logo.png

webpack
    ↓
dist/
├── bundle.js (all JS + CSS + images as data URLs)
└── index.html
```

---

## Tại sao Webpack ra đời?

**Trước Webpack:**
- Manually manage file order: `<script>` tags
- No dependency management
- Global namespace pollution
- Không thể import CSS, images từ JS

**Webpack giải quyết:**
- Automatic dependency resolution
- Module bundling
- Loaders transform files (CSS, images, TypeScript, etc.)
- Plugins optimize bundles

---

## Core Concepts — Loaders, Plugins

### Loaders

**Loaders** transform files trước bundling.

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      // Loader cho TypeScript
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
      // Loader cho CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Loader cho images
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset'
      }
    ]
  }
};
```

### Plugins

**Plugins** optimize bundles hoặc generate files.

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    // Auto generate index.html
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
};
```

---

## Webpack Config cơ bản

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  // Entry point
  entry: './src/index.js',

  // Output
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  // Loaders
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  // Mode
  mode: 'development' // hoặc 'production'
};
```

---

## Dev Server vs Production

```javascript
module.exports = {
  // Development
  mode: 'development',
  devtool: 'source-map', // enable debugging
  devServer: {
    port: 3000,
    hot: true // live reload
  },

  // Production
  mode: 'production', // minify, tree-shake
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all' // code splitting
    }
  }
};
```

---

## Câu hỏi phỏng vấn

### Câu 1: Webpack là gì? Tại sao cần?

**Đáp án:** Webpack module bundler — combines JS files + assets vào optimized bundles. Trước Webpack, phải manually manage script tags. Webpack tự động resolve dependencies, transform files (TypeScript, CSS), minimize/optimize bundles.

### Câu 2: Loaders vs Plugins khác gì?

**Đáp án:** **Loaders** transform specific file types (TypeScript → JS, SCSS → CSS). **Plugins** optimize bundles hoặc generate files (minify, code-split, generate HTML). Loaders = file-level, Plugins = bundle-level.

### Câu 3: Webpack entry vs output?

**Đáp án:** **Entry** = starting point (src/index.js). **Output** = where bundle goes (dist/bundle.js). Webpack start từ entry, resolve tất cả imports, generate output bundle.
