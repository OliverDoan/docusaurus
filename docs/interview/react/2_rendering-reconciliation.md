---
sidebar_position: 2
title: "Virtual DOM, Reconciliation, React Fiber"
---

# Virtual DOM, Reconciliation, React Fiber

Khi phong van React o level senior, ban se gap cac cau hoi ve cach React hoat dong ben duoi -- Virtual DOM, diffing algorithm, Fiber architecture, va Concurrent features. Day la nhung kien thuc giup ban hieu **tai sao** React nhanh, chu khong chi **cach dung** React.

---

## Cau 1: Virtual DOM la gi? Tai sao React can no? `[Intermediate]`

### Giai thich ly thuyet

**Virtual DOM (VDOM)** la mot cay JavaScript object mo ta cau truc UI. Moi khi state thay doi, React tao mot cay VDOM moi, **so sanh** voi cay cu (diffing), roi chi cap nhat nhung phan DOM that su thay doi (patching).

Tai sao can? Vi thao tac DOM that (Real DOM) rat **cham** -- moi lan thay doi DOM, browser phai tinh lai layout, paint, composite. Voi VDOM, React **gom nhom** (batch) cac thay doi va chi apply mot lan, giam so lan browser phai lam viec.

**Luu y quan trong**: VDOM khong phai luc nao cung nhanh hon thao tac DOM truc tiep. Frameworks nhu Svelte hay SolidJS khong dung VDOM ma van nhanh. Loi the cua VDOM la cho phep viet code **declarative** ma van co performance tot.

### Code vi du

```tsx
// Khi ban viet JSX nhu nay:
function App() {
  return (
    <div className="app">
      <h1>Hello</h1>
      <p>World</p>
    </div>
  );
}

// React chuyen thanh VDOM object (don gian hoa):
// {
//   type: 'div',
//   props: {
//     className: 'app',
//     children: [
//       { type: 'h1', props: { children: 'Hello' } },
//       { type: 'p', props: { children: 'World' } }
//     ]
//   }
// }

// Khi state thay doi, React tao cay VDOM moi, diff voi cay cu,
// va chi update phan khac biet tren Real DOM.
```

### Dap an mau

> "Virtual DOM la mot lightweight JavaScript representation cua Real DOM. Khi state thay doi, React tao VDOM moi, dung reconciliation algorithm de tim su khac biet voi VDOM cu, roi batch update Real DOM. Dieu nay cho phep viet code declarative trong khi van co performance tot. Tuy nhien, VDOM co overhead rieng -- no la trade-off giua developer experience va raw performance."

---

## Cau 2: Reconciliation Algorithm (Diffing) hoat dong nhu the nao? `[Senior]`

### Giai thich ly thuyet

Diffing algorithm cua React dua tren 2 gia dinh (heuristics) de dat O(n) thay vi O(n^3):

1. **Hai element khac type** => destroy cay cu, build cay moi hoan toan
2. **Hai element cung type** => giu nguyen DOM node, chi update attributes/props thay doi
3. **key prop** giup React nhan dien element nao da thay doi/them/xoa trong danh sach

**Quy trinh diffing**:
- So sanh root element truoc
- Neu cung type: diff props, roi diff children de quy
- Neu khac type: unmount cay cu, mount cay moi
- Voi danh sach children: dung `key` de matching. Khong co key => so sanh theo thu tu (index)

### Code vi du

```tsx
// Case 1: Khac type => destroy va rebuild
// Truoc
<div>
  <Counter />
</div>

// Sau -- React destroy Counter va tao moi span + Counter
<span>
  <Counter />
</span>

// Case 2: Cung type => chi update props
// Truoc
<div className="old" title="stuff" />
// Sau -- React chi update className, giu nguyen DOM node
<div className="new" title="stuff" />

// Case 3: List khong co key (CHAM)
// React so sanh theo index, nen insert dau danh sach
// se khien TAT CA items re-render
<ul>
  <li>Duke</li>   {/* index 0 */}
  <li>Villanova</li> {/* index 1 */}
</ul>
// Them "Connecticut" o dau => React tuong: Duke->Connecticut, Villanova->Duke, them Villanova
// => Update 2 items + insert 1 = 3 operations

// Case 4: List CO key (NHANH)
<ul>
  <li key="duke">Duke</li>
  <li key="villanova">Villanova</li>
</ul>
// Them "Connecticut" o dau => React biet chi can insert 1 item moi
// => 1 operation
<ul>
  <li key="connecticut">Connecticut</li>
  <li key="duke">Duke</li>
  <li key="villanova">Villanova</li>
</ul>
```

### Dap an mau

> "React reconciliation dung 2 heuristics de dat O(n): khac type thi rebuild, cung type thi diff props. Voi danh sach, key prop giup React map element cu voi moi mot cach chinh xac, tranh unnecessary re-renders. Khong nen dung index lam key khi danh sach co the thay doi thu tu, vi no lam sai lech viec matching va gay bug."

---

## Cau 3: React Fiber la gi? Tai sao React can viet lai core algorithm? `[Senior]`

### Giai thich ly thuyet

**React Fiber** la phien ban viet lai hoan toan cua reconciliation engine, ra mat tu React 16. Truoc Fiber, reconciliation la **dong bo** (synchronous) -- khi bat dau render, React phai chay het moi dung duoc. Voi component tree lon, dieu nay lam **block main thread**, gay lag UI.

**Fiber** bien render thanh **incremental** -- co the:
- **Chia nho** cong viec thanh cac "units of work"
- **Tam dung** va tiep tuc sau
- **Uu tien** cong viec (user input > animation > data fetching)
- **Huy** cong viec khong con can

Moi Fiber node la mot JavaScript object dai dien cho mot component, chua thong tin ve type, state, props, parent, child, sibling, va effect flags.

**2 phase cua Fiber**:
1. **Render phase** (co the bi interrupt): tao Fiber tree moi, diff voi cay cu, danh dau changes. Khong thay doi DOM.
2. **Commit phase** (dong bo, khong bi interrupt): apply tat ca changes len Real DOM mot lan.

### Code vi du

```tsx
// Fiber node (don gian hoa) -- day la cau truc noi bo React
// {
//   type: 'div',               // Component type
//   key: null,
//   stateNode: HTMLDivElement,  // DOM node thuc te
//   child: Fiber | null,       // Con dau tien
//   sibling: Fiber | null,     // Anh em ke tiep
//   return: Fiber | null,      // Parent
//   pendingProps: {},           // Props moi
//   memoizedProps: {},          // Props cu
//   memoizedState: {},          // State hien tai
//   flags: 0,                  // Side effect flags (Placement, Update, Deletion)
//   lanes: 0,                  // Priority level
// }

// Vi du: component tree
function App() {
  return (
    <div>
      <Header />
      <Main>
        <Article />
        <Sidebar />
      </Main>
    </div>
  );
}

// Fiber duyet theo thu tu: App -> div -> Header -> Main -> Article -> Sidebar
// Moi node la 1 unit of work, co the pause giua cac nodes
```

### Dap an mau

> "Fiber la phien ban viet lai cua React reconciler de ho tro incremental rendering. No chia cong viec thanh cac units nho, co the pause, resume, va prioritize. Fiber co 2 phase: render phase (co the interrupt, tinh toan changes) va commit phase (dong bo, apply DOM). Dieu nay la nen tang cho Concurrent features nhu useTransition va Suspense."

---

## Cau 4: Key prop -- tai sao quan trong? Khi nao dung index lam key la ok? `[Intermediate]`

### Giai thich ly thuyet

`key` giup React **identify** element nao da thay doi, duoc them, hoac bi xoa trong mot danh sach. Khong co key, React dung **index** lam key mac dinh, va dieu nay co the gay:

1. **Performance xau**: khi insert dau danh sach, tat ca items bi "shift" index => React tuong tat ca deu thay doi
2. **Bug**: khi items co internal state (input values, checkbox state), state bi gan sai cho item khac

**Khi nao dung index la ok?**
- Danh sach **static** (khong them/xoa/sap xep)
- Items **khong co** internal state
- Items **khong bao gio** thay doi thu tu

### Code vi du

```tsx
// BUG voi index key
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build app' },
  ]);

  const addTodo = () => {
    // Them item vao DAU danh sach
    setTodos([{ id: Date.now(), text: 'New todo' }, ...todos]);
  };

  return (
    <ul>
      {/* SAI: dung index lam key */}
      {todos.map((todo, index) => (
        <li key={index}>
          {/* Input state se bi "nham" khi them item o dau */}
          <input defaultValue={todo.text} />
        </li>
      ))}

      {/* DUNG: dung unique ID */}
      {todos.map(todo => (
        <li key={todo.id}>
          <input defaultValue={todo.text} />
        </li>
      ))}
    </ul>
  );
}

// Key con dung de "reset" component
function UserProfile({ userId }: { userId: string }) {
  // Khi userId thay doi, key thay doi => React unmount va mount moi component
  // => tat ca internal state duoc reset
  return <Profile key={userId} userId={userId} />;
}
```

### Dap an mau

> "key giup React track element trong danh sach qua cac lan render. Dung unique, stable ID lam key -- khong dung index khi danh sach co the thay doi thu tu hoac items co internal state. key con duoc dung de force reset component bang cach thay doi key. Mot meo hay la dung key tren component de reset state thay vi dung useEffect."

---

## Cau 5: Dieu gi trigger re-render trong React? Batching hoat dong ra sao? `[Intermediate]`

### Giai thich ly thuyet

**Cac trigger re-render**:
1. `setState` / `dispatch` duoc goi
2. Parent component re-render (mac dinh, tat ca children re-render)
3. Context value thay doi (tat ca consumers re-render)
4. Custom hook state thay doi

**KHONG trigger re-render**:
- Thay doi `ref.current`
- Thay doi bien ngoai component
- Thay doi props cua component (chi khi parent re-render truyen props moi)

**Batching** (tu React 18):
- Tat ca state updates duoc gom lai, chi render 1 lan
- Ap dung trong moi ngu canh: event handlers, setTimeout, Promises, native events
- Dung `flushSync` neu can force render ngay (hiem khi can)

### Code vi du

```tsx
import { useState } from 'react';
import { flushSync } from 'react-dom';

function BatchingExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  console.log('Render!'); // Chi log 1 lan cho moi click

  const handleClick = () => {
    // React 18: batched => 1 render
    setCount(c => c + 1);
    setFlag(f => !f);
    // 2 state updates, 1 render
  };

  const handleAsync = () => {
    setTimeout(() => {
      // React 18: VAN batched => 1 render
      setCount(c => c + 1);
      setFlag(f => !f);
    }, 100);
  };

  // Force immediate render (hiem khi can)
  const handleFlush = () => {
    flushSync(() => {
      setCount(c => c + 1);
    });
    // DOM da update tai day
    console.log('DOM updated with new count');

    flushSync(() => {
      setFlag(f => !f);
    });
    // => 2 renders rieng biet
  };

  return <button onClick={handleClick}>{count}</button>;
}

// Parent re-render => children re-render (ke ca khi props khong doi)
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      {/* Child re-render moi lan Parent render, du name khong doi */}
      <Child name="static" />
    </div>
  );
}

function Child({ name }: { name: string }) {
  console.log('Child rendered!'); // Log moi lan parent click
  return <p>{name}</p>;
}
```

### Dap an mau

> "Re-render xay ra khi state thay doi, parent re-render, hoac context value thay doi. Tu React 18, tat ca state updates deu duoc automatic batching -- ke ca trong async code. Dung React.memo de ngan child re-render khi props khong doi. flushSync co the force immediate render nhung hiem khi can dung."

---

## Cau 6: Concurrent Features -- useTransition va useDeferredValue `[Senior]`

### Giai thich ly thuyet

**Concurrent React** cho phep React **ngat** render khong khan cap de xu ly cong viec khan cap truoc (nhu user input). 2 hooks chinh:

**useTransition**:
- Danh dau state update la "non-urgent" (transition)
- React uu tien render urgent updates truoc (nhu typing)
- Tra ve `[isPending, startTransition]`

**useDeferredValue**:
- Tao mot phien ban "lag" cua gia tri
- Giong useTransition nhung cho **gia tri** thay vi **action**
- Huu ich khi khong kiem soat duoc state update (VD: props tu parent)

### Code vi du

```tsx
import { useState, useTransition, useDeferredValue, memo } from 'react';

// useTransition: uu tien input, defer ket qua tim kiem
function SearchPage() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Urgent: cap nhat input ngay lap tuc
    setQuery(e.target.value);

    // Non-urgent: cap nhat ket qua tim kiem
    startTransition(() => {
      // React co the interrupt render nay neu co input moi
      setSearchResults(filterResults(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Dang tim kiem...</p>}
      <SearchResults />
    </div>
  );
}

// useDeferredValue: defer gia tri heavy to render
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  // HeavyList render voi gia tri "cu" trong khi user dang go
  // Khi user ngung go, React render lai voi gia tri moi
  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      <HeavyList query={deferredQuery} />
    </div>
  );
}

const HeavyList = memo(({ query }: { query: string }) => {
  // Gia su: render 10,000 items
  const items = generateItems(query); // heavy computation

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

### Bang so sanh

| Tieu chi | `useTransition` | `useDeferredValue` |
|----------|----------------|-------------------|
| Kiem soat | **State update** (action) | **Gia tri** (value) |
| Khi dung | Khi ban kiem soat setState | Khi nhan gia tri tu props/parent |
| Tra ve | `[isPending, startTransition]` | Deferred value |
| isPending | Co | Tu tinh: `value !== deferredValue` |
| Vi du | Filter khi search | Defer props cho heavy child |

### Dap an mau

> "Concurrent features cho phep React uu tien cong viec quan trong (user input) va defer cong viec it khan cap (render danh sach lon). useTransition danh dau state update la non-urgent, useDeferredValue tao phien ban 'lag' cua gia tri. Ca hai giup giu UI responsive khi render nang. Chung la nen tang cua Fiber architecture -- kha nang interrupt va prioritize render."

---

## Loi thuong gap khi tra loi

1. **Noi "Virtual DOM nhanh hon Real DOM"** -- Khong chinh xac. VDOM co overhead rieng. Dung hon la "VDOM cho phep declarative code voi performance chap nhan duoc bang cach batch DOM updates."

2. **Khong biet Fiber la gi** -- Fiber la nen tang cua React hien dai. Neu ban dung useTransition, Suspense, hay bat ky concurrent feature nao, ban dang dung Fiber.

3. **Nham "render" voi "DOM update"** -- Render phase tinh toan VDOM, commit phase moi update DOM. Component co the render nhieu lan ma DOM khong doi.

4. **Dung index lam key roi noi "khong sao dau"** -- Chi ok khi danh sach static. Voi danh sach dynamic, index key gay bug kho debug lien quan den internal state.

5. **Khong biet batching trong React 18** -- Truoc 18, chi batch trong event handlers. Tu 18, automatic batching moi noi. Day la thay doi quan trong can biet.

6. **Nham useTransition va useDeferredValue** -- useTransition cho action (setState), useDeferredValue cho value (props). Chon sai hook se khong dat hieu qua mong muon.
