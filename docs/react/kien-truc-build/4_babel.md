---
sidebar_position: 4
title: "4. Babel"
---

# Babel


---

## Mục lục

- [Babel là gì?](#babel-là-gì)
- [Tại sao Babel ra đời?](#tại-sao-babel-ra-đời)
- [Plugins & Presets](#plugins--presets)
- [Babel Config](#babel-config)
- [JSX transformation](#jsx-transformation)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Babel là gì?

**Babel** là **JavaScript transpiler** — chuyển đổi modern JavaScript (ES6+, JSX) thành **older JavaScript (ES5)** có thể chạy trên old browsers.

```
Modern JavaScript:
const greet = (name) => `Hello ${name}`;
const x = [1, 2, 3].map(n => n * 2);
<Button onClick={() => handleClick()} />

Babel transpile
    ↓
ES5 (IE11 compatible):
var greet = function(name) { return "Hello " + name; };
var x = [1, 2, 3].map(function(n) { return n * 2; });
React.createElement(Button, { onClick: function() { handleClick(); } })
```

---

## Tại sao Babel ra đời?

Modern JavaScript features (arrow functions, destructuring, async/await, JSX) không hỗ trợ trên old browsers.

**Babel giải quyết:**
- Write modern code, Babel transforms để old browsers support
- JSX → JavaScript (React needs this)
- TypeScript, Flow → JavaScript

---

## Plugins & Presets

### Plugins

Plugins **transform specific features**.

```javascript
// .babelrc
{
  "plugins": [
    "@babel/plugin-proposal-class-properties", // class fields
    "@babel/plugin-proposal-optional-chaining" // optional chaining (?.)
  ]
}
```

### Presets

Presets là **bundle của plugins**.

```javascript
{
  "presets": [
    "@babel/preset-env", // all modern JS features
    "@babel/preset-react", // JSX
    "@babel/preset-typescript" // TypeScript
  ]
}
```

---

## Babel Config

```javascript
// .babelrc.js hoặc babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { browsers: ["last 2 versions", "ie 11"] }
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-proposal-decorators",
    "@babel/plugin-transform-runtime" // reduce bundle size
  ]
};
```

---

## JSX transformation

Babel transforms JSX → React.createElement():

```javascript
// Input (JSX)
<Button color="blue">Click me</Button>

// Babel output
React.createElement(Button, { color: "blue" }, "Click me")

// React 17+ (automatic JSX transform)
const jsx = <Button color="blue">Click me</Button>;
// No need to import React!
```

---

## Câu hỏi phỏng vấn

### Câu 1: Babel là gì? Tại sao cần?

**Đáp án:** Babel transpiler — transforms modern JavaScript (ES6+, JSX) → older JS (ES5) compatible với old browsers. Cho phép write modern code without worrying about browser support.

### Câu 2: Babel plugins vs presets?

**Đáp án:** **Plugins** transform specific features (e.g., @babel/plugin-proposal-optional-chaining). **Presets** bundle của plugins (@babel/preset-env bao gồm tất cả modern JS features). Presets = shortcuts cho multiple plugins.

### Câu 3: Babel config trong React project?

**Đáp án:** Cần @babel/preset-env (modern JS), @babel/preset-react (JSX), @babel/preset-typescript (TypeScript). Create React App tự config, nhưng eject hoặc custom setup cần config manually.
