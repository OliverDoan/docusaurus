---
sidebar_position: 2
title: "2. Forms & Validation Deep Dive"
---

# Forms & Validation Deep Dive

> *Form là phần FE 'tưởng đơn giản, làm rồi mới biết phức tạp'. Câu hỏi form ở Senior interview chiếm 20-30% thời gian — vì 90% app có form, và form bug là bug user complain nhiều nhất.*

:::note[Ghi nhớ nhanh]

- ⭐ **Controlled vs Uncontrolled** — controlled re-render mỗi keystroke (form to bị lag); `react-hook-form` dùng uncontrolled (ref) nên form nhiều field vẫn nhanh.
- ⭐ **Validation bằng schema** — dùng `Zod`/`Yup` để định nghĩa 1 nguồn chân lý, tự suy ra type và validate cả client lẫn server.
- **Multi-step form (Wizard)** — tách state theo step, validate từng bước, giữ dữ liệu khi back/next.
- **File upload UX** — cần progress, retry, huỷ, validate type/size trước khi gửi.
- **Form accessibility** — `label` gắn với input, `aria-invalid`, thông báo lỗi đọc được bằng screen reader, focus vào lỗi đầu tiên.
- **State persistence** — lưu draft (localStorage/URL/server) để không mất dữ liệu khi reload.

:::

---

## Câu 1: Controlled vs Uncontrolled — chọn cái nào? `[Intermediate]`

### Câu hỏi

> Form em build có 20 field. Em dùng controlled (`value + onChange`) hay uncontrolled (`ref`)?

### Giải thích lý thuyết

| Aspect              | Controlled                          | Uncontrolled                        |
| ------------------- | ----------------------------------- | ----------------------------------- |
| Source of truth     | React state                         | DOM                                 |
| Re-render mỗi keystroke | Có                              | Không                               |
| Validation real-time | Easy                                | Cần subscribe blur/change          |
| Performance         | Slow với form to (10+ field re-render mỗi keystroke) | Fast |
| Submit value        | Đọc từ state                        | Đọc từ ref                          |

**react-hook-form** dùng uncontrolled (ref-based) → form to vẫn fast.
**Formik / Redux Form** dùng controlled → form 20+ field bắt đầu lag.

### Code minh hoạ

```typescript
// Controlled — re-render mỗi keystroke
function ControlledForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState(0);
  // ... 20 useState

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {/* Type vào name → toàn bộ form re-render */}
    </form>
  );
}

// Uncontrolled — ref-based, no re-render
function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      name: nameRef.current?.value,
      email: emailRef.current?.value,
    };
    // submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" />
      <input ref={emailRef} defaultValue="" />
      {/* Type → DOM update, React không re-render */}
    </form>
  );
}

// react-hook-form — uncontrolled với DX của controlled
import { useForm } from "react-hook-form";

function HookForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: "", email: "", age: 0 },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("name", { required: "Name required" })} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email", { pattern: /^.+@.+$/ })} />

      <button type="submit">Submit</button>
    </form>
  );
}

// Hybrid — controlled field cụ thể (autocomplete, masked input)
function HybridForm() {
  const { register, watch, setValue, control } = useForm();

  // Watch chỉ field cần re-render (dùng cho conditional UI)
  const country = watch("country");

  return (
    <form>
      {/* Most field uncontrolled */}
      <input {...register("name")} />

      {/* Conditional field controlled via watch */}
      {country === "VN" && <input {...register("provinceVN")} />}
      {country === "US" && <input {...register("stateUS")} />}

      {/* Custom component cần controlled — dùng Controller */}
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInputMask value={field.value} onChange={field.onChange} />
        )}
      />
    </form>
  );
}
```

### Đáp án mẫu

> "Form 20 field em dùng **react-hook-form** — uncontrolled (ref-based) under the hood nên type không trigger re-render, scaling tốt với form lớn. DX vẫn tốt như controlled qua `register` API. **Controlled raw** với `useState` em chỉ dùng cho form siêu nhỏ (search box, single input). Lý do: 20 field x mỗi keystroke = full form tree re-render → noticeable lag trên Android cũ. **Uncontrolled raw** với `ref` em không dùng vì mất validation real-time + DX kém. **Hybrid pattern**: với form có conditional field (country → province khác nhau), em dùng `watch` chỉ cho field cần observe; với custom component (date picker, mask input, phone), dùng `Controller` để wrap controlled behavior trong uncontrolled form. Form em từng tối ưu: 50 field, controlled với Formik → INP 350ms; switch react-hook-form → INP dưới 80ms, không thay đổi gì khác."

---

## Câu 2: Validation strategy — Zod, Yup, hay tự viết? `[Intermediate]`

### Câu hỏi

> Em validate form thế nào? Zod, Yup, Joi, hay manual? Tradeoff?

### Giải thích lý thuyết

| Lib       | Type inference         | Bundle  | Ecosystem                | DX                  |
| --------- | ---------------------- | ------- | ------------------------ | ------------------- |
| **Zod**   | Excellent (infer type) | ~13KB   | tRPC, OpenAPI, RHF integration | Modern API     |
| **Yup**   | OK (manual InferType)  | ~30KB   | Formik tích hợp legacy   | Older API           |
| Joi       | Limited                 | ~145KB  | Backend Node             | Verbose             |
| Valibot   | Excellent               | ~3KB    | Modular import           | Newest, Zod-like    |
| ArkType   | Best (string syntax)    | ~11KB   | Newer                    | Different paradigm  |

**Zod dominate** vì: type infer từ schema → single source of truth FE + BE; ecosystem (tRPC, react-hook-form resolver, Next.js Server Action, OpenAPI codegen).

### Code minh hoạ

```typescript
import { z } from "zod";

// 1. Define schema = source of truth
const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email là bắt buộc")
      .email("Email không hợp lệ"),

    password: z
      .string()
      .min(8, "Tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Phải có chữ hoa")
      .regex(/[0-9]/, "Phải có số")
      .regex(/[^a-zA-Z0-9]/, "Phải có ký tự đặc biệt"),

    confirmPassword: z.string(),

    age: z
      .number({ invalid_type_error: "Tuổi phải là số" })
      .int("Tuổi là số nguyên")
      .min(18, "Phải đủ 18 tuổi")
      .max(120),

    role: z.enum(["user", "admin"], { errorMap: () => ({ message: "Role không hợp lệ" }) }),

    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Bạn phải đồng ý điều khoản" }),
    }),

    interests: z.array(z.string()).min(1, "Chọn ít nhất 1 sở thích").max(5),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],  // attach error vào field cụ thể
  });

// 2. Infer TypeScript type
type SignupInput = z.infer<typeof signupSchema>;
// { email: string; password: string; confirmPassword: string; age: number; ... }

// 3. Use trong react-hook-form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",  // validate khi blur, không mỗi keystroke
  });

  const onSubmit = async (data: SignupInput) => {
    // data đã typed + validated
    await api.signup(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <input {...register("age", { valueAsNumber: true })} type="number" />
      {errors.age && <span>{errors.age.message}</span>}

      <button disabled={isSubmitting}>Sign up</button>
    </form>
  );
}

// 4. Share schema FE + BE (single source of truth)
// shared/schemas/user.ts
export const userSchema = z.object({ ... });

// FE: react-hook-form validation
// BE: Server Action validation
"use server";
import { userSchema } from "@/shared/schemas/user";

export async function createUser(input: unknown) {
  const data = userSchema.parse(input);  // throw nếu invalid
  return db.user.create({ data });
}

// 5. Conditional / dependent validation
const schema = z.object({
  paymentMethod: z.enum(["card", "paypal", "bank"]),
  cardNumber: z.string().optional(),
  paypalEmail: z.string().email().optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === "card") return !!data.cardNumber;
    if (data.paymentMethod === "paypal") return !!data.paypalEmail;
    return true;
  },
  {
    message: "Field bắt buộc cho payment method này",
    path: ["paymentMethod"],
  }
);

// 6. Async validation (server check)
const schema = z.object({
  username: z
    .string()
    .min(3)
    .refine(
      async (username) => {
        const res = await fetch(`/api/check-username?u=${username}`);
        const { available } = await res.json();
        return available;
      },
      { message: "Username đã được sử dụng" }
    ),
});

// 7. Transform — parse + transform
const dateSchema = z
  .string()
  .refine((s) => !isNaN(Date.parse(s)), "Date không hợp lệ")
  .transform((s) => new Date(s));

// Input string, output Date object

// 8. Discriminated union
const shapeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("circle"), radius: z.number() }),
  z.object({ kind: z.literal("square"), side: z.number() }),
  z.object({ kind: z.literal("rect"), width: z.number(), height: z.number() }),
]);
```

### Đáp án mẫu

> "Em dùng **Zod**. Quyết định dựa: type inference excellent (`z.infer<typeof schema>` → single source of truth, không phải maintain TypeScript type và schema runtime riêng); ecosystem mature (tRPC, react-hook-form resolver, Next.js Server Action, OpenAPI codegen đều integrate); modern API. **Yup** em chỉ giữ ở project cũ có Formik. **Joi** quá nặng cho FE (145KB). **Valibot** đang quan tâm — modular import nên bundle nhỏ hơn (~3KB thực dùng vs Zod 13KB) nhưng ecosystem chưa bằng. Pattern em luôn dùng: **schema ở `shared/schemas/`** — FE + BE import cùng schema. FE: `zodResolver` trong react-hook-form. BE: `schema.parse(input)` trong Server Action / Route Handler — runtime validate boundary. Nếu shape thay đổi → 1 chỗ update, cả 2 sync. **Conditional validation** với `refine()` — payment method khác nhau yêu cầu field khác. **Async validation** cho username unique check. **Transform** cho parse + convert (string date → Date object). Validation `mode: 'onBlur'` không mỗi keystroke — UX tốt hơn (không annoy với 'email invalid' khi user vừa gõ 1 ký tự)."

---

## Câu 3: Multi-step form (Wizard) — design pattern `[Senior]`

### Câu hỏi

> Em build wizard 5 step (onboarding). Mỗi step có validation riêng. User có thể back/forward, save draft. Em design state thế nào?

### Giải thích lý thuyết

Multi-step form challenges:
1. **State persistence** — user back rồi forward, data phải còn.
2. **Partial validation** — validate per step, không cả form.
3. **Cross-step dependency** — step 3 dựa data step 2.
4. **Save draft** — refresh không mất.
5. **URL state** — sharable URL với step + draft id.
6. **Progress indicator** — UI feedback.
7. **Conditional steps** — skip step nếu data đáp ứng.

State management options:
- `useState` lifted to wizard parent.
- `useReducer` với step transition machine.
- `react-hook-form` với multiple sub-schema.
- **XState** cho machine phức tạp.
- URL search params + server state.

### Code minh hoạ

```typescript
// 1. Schema chia per step
import { z } from "zod";

const personalInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(2),
});

const preferencesSchema = z.object({
  newsletter: z.boolean(),
  notifications: z.enum(["email", "sms", "none"]),
});

const reviewSchema = z.object({
  acceptTerms: z.literal(true),
});

// Full schema (sau cùng submit)
const fullSchema = personalInfoSchema
  .merge(addressSchema)
  .merge(preferencesSchema)
  .merge(reviewSchema);

type WizardData = z.infer<typeof fullSchema>;

// 2. Wizard với react-hook-form + step navigation
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const STEPS = [
  { name: "personal", schema: personalInfoSchema, fields: ["firstName", "lastName", "email"] },
  { name: "address", schema: addressSchema, fields: ["street", "city", "country"] },
  { name: "preferences", schema: preferencesSchema, fields: ["newsletter", "notifications"] },
  { name: "review", schema: reviewSchema, fields: ["acceptTerms"] },
] as const;

function OnboardingWizard() {
  const [step, setStep] = useState(0);

  // Load draft từ localStorage
  const methods = useForm<WizardData>({
    defaultValues: () => {
      const saved = localStorage.getItem("onboarding-draft");
      return saved ? JSON.parse(saved) : {};
    },
    resolver: zodResolver(fullSchema),
    mode: "onBlur",
  });

  // Auto-save draft
  const formData = methods.watch();
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem("onboarding-draft", JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(id);
  }, [formData]);

  const goNext = async () => {
    // Validate chỉ field của step hiện tại
    const currentStep = STEPS[step];
    const valid = await methods.trigger(currentStep.fields as any);
    if (valid) setStep(step + 1);
  };

  const goPrev = () => setStep(Math.max(0, step - 1));

  const onSubmit = methods.handleSubmit(async (data) => {
    await api.completeOnboarding(data);
    localStorage.removeItem("onboarding-draft");
  });

  return (
    <FormProvider {...methods}>
      <ProgressBar current={step} total={STEPS.length} />

      <form onSubmit={onSubmit}>
        {step === 0 && <PersonalInfoStep />}
        {step === 1 && <AddressStep />}
        {step === 2 && <PreferencesStep />}
        {step === 3 && <ReviewStep />}

        <div className="actions">
          {step > 0 && <button type="button" onClick={goPrev}>Back</button>}
          {step < STEPS.length - 1 && (
            <button type="button" onClick={goNext}>Next</button>
          )}
          {step === STEPS.length - 1 && (
            <button type="submit">Complete</button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

// 3. Step components (consume form context)
function PersonalInfoStep() {
  const { register, formState: { errors } } = useFormContext<WizardData>();
  return (
    <>
      <input {...register("firstName")} placeholder="First name" />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      <input {...register("lastName")} placeholder="Last name" />
      <input {...register("email")} placeholder="Email" />
    </>
  );
}

// 4. URL-based step (sharable, back button browser work)
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function useStepFromURL() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const step = parseInt(searchParams.get("step") ?? "0", 10);

  const setStep = (newStep: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("step", String(newStep));
    router.push(`${pathname}?${params}`);
  };

  return [step, setStep] as const;
}

// 5. Conditional step (skip nếu data đã có)
const stepFlow = {
  0: { next: (data) => (data.hasPaymentMethod ? 2 : 1) },  // skip payment nếu đã setup
  1: { next: () => 2 },
  2: { next: () => 3 },
  3: { next: () => null },  // last
};

// 6. Persist to server (cross-device draft)
async function saveDraft(data: Partial<WizardData>) {
  await fetch("/api/onboarding/draft", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Auto-save throttled
const throttledSave = useThrottledCallback(saveDraft, 2000);
useEffect(() => {
  throttledSave(formData);
}, [formData]);
```

### Đáp án mẫu

> "Em design 5 layer. **Layer 1 — Schema per step + merge cuối**: Zod schema riêng cho từng step (`personalInfoSchema`, `addressSchema`...), merge thành `fullSchema` cho submit. Step navigation chỉ validate field của step hiện tại bằng `methods.trigger(currentStep.fields)` — không validate cả form khi user bấm Next. **Layer 2 — react-hook-form với FormProvider**: parent wrap `FormProvider`, step component consume `useFormContext` — share state across steps mà không prop drill. **Layer 3 — Auto-save draft**: subscribe `watch()` debounce 500ms, save localStorage. Cross-device: gửi server `/api/onboarding/draft` mỗi 2s throttle. **Layer 4 — URL state cho step**: `?step=2` trong searchParams → user back button browser work, link sharable, refresh không mất step. **Layer 5 — Conditional flow**: state machine với `next(data) => stepNumber` — skip step dựa data (ví dụ user đã có payment method → skip). **Edge cases**: refresh giữa step → load từ localStorage; user close mid-wizard → server lưu draft, lần sau resume từ step cuối; submit fail → giữ data form không reset. **Tool advanced**: với wizard phức tạp hơn (nested step, parallel state, conditional branching) em dùng **XState** — visualize flow, force exhaustive transition. Cho wizard 5 step linear thì reducer + RHF đủ."

---

## Câu 4: File upload UX — design pattern `[Senior]`

### Câu hỏi

> User upload nhiều file (10 file ảnh, mỗi file 2-5MB). Em design UI/logic ra sao?

### Giải thích lý thuyết

UX challenges:
1. **Progress per file** — không chỉ tổng.
2. **Cancel individual** — user huỷ 1 file không huỷ hết.
3. **Retry failed** — file fail không phá batch.
4. **Resumable upload** — file lớn, network gián đoạn.
5. **Preview before upload** — image preview, file metadata.
6. **Validation** — size, type, dimension.
7. **Drag-drop** + paste support.
8. **Concurrent vs sequential** — không quá nhiều parallel.

### Code minh hoạ

```typescript
// State machine cho mỗi file
type FileStatus =
  | { status: "queued"; file: File; preview?: string }
  | { status: "uploading"; file: File; progress: number; abortController: AbortController }
  | { status: "success"; file: File; url: string }
  | { status: "error"; file: File; error: string; canRetry: boolean }
  | { status: "cancelled"; file: File };

interface UploadItem {
  id: string;
  state: FileStatus;
}

function useFileUpload(options: {
  maxFiles?: number;
  maxSize?: number;
  accept?: string[];
  concurrency?: number;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const concurrencyRef = useRef(options.concurrency ?? 3);

  const addFiles = (files: File[]) => {
    const newItems: UploadItem[] = files
      .filter((f) => {
        if (options.maxSize && f.size > options.maxSize) {
          alert(`${f.name} quá lớn (max ${options.maxSize / 1024 / 1024}MB)`);
          return false;
        }
        if (options.accept && !options.accept.includes(f.type)) {
          alert(`${f.name} không đúng định dạng`);
          return false;
        }
        return true;
      })
      .map((f) => ({
        id: crypto.randomUUID(),
        state: {
          status: "queued",
          file: f,
          preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        },
      }));

    setItems((prev) => [...prev, ...newItems].slice(0, options.maxFiles ?? 100));

    // Start uploading
    newItems.forEach((item) => uploadOne(item.id));
  };

  const uploadOne = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.state.status !== "queued") return item;

        const abortController = new AbortController();
        return {
          ...item,
          state: { status: "uploading", file: item.state.file, progress: 0, abortController },
        };
      })
    );

    try {
      const item = items.find((i) => i.id === id);
      if (!item || item.state.status !== "uploading") return;

      const formData = new FormData();
      formData.append("file", item.state.file);

      const response = await uploadWithProgress(formData, {
        signal: item.state.abortController.signal,
        onProgress: (progress) => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id && it.state.status === "uploading"
                ? { ...it, state: { ...it.state, progress } }
                : it
            )
          );
        },
      });

      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, state: { status: "success", file: it.state.file, url: response.url } }
            : it
        )
      );
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, state: { status: "cancelled", file: it.state.file } } : it
          )
        );
      } else {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  state: {
                    status: "error",
                    file: it.state.file,
                    error: (e as Error).message,
                    canRetry: true,
                  },
                }
              : it
          )
        );
      }
    }
  };

  const cancel = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.state.status === "uploading") {
      item.state.abortController.abort();
    }
  };

  const retry = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id && it.state.status === "error"
          ? { ...it, state: { status: "queued", file: it.state.file } }
          : it
      )
    );
    uploadOne(id);
  };

  const remove = (id: string) => {
    cancel(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return { items, addFiles, cancel, retry, remove };
}

// Upload với progress (XHR cho event progress, fetch chưa support natively)
async function uploadWithProgress(
  formData: FormData,
  options: { signal?: AbortSignal; onProgress: (percent: number) => void }
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        options.onProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));

    options.signal?.addEventListener("abort", () => {
      xhr.abort();
      reject(new DOMException("Aborted", "AbortError"));
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}

// Component
function FileUploader() {
  const { items, addFiles, cancel, retry, remove } = useFileUpload({
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024,
    accept: ["image/jpeg", "image/png", "image/webp"],
    concurrency: 3,
  });

  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
      }}
      onPaste={(e) => {
        const files = Array.from(e.clipboardData.files);
        if (files.length) addFiles(files);
      }}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
      />

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.state.preview && <img src={item.state.preview} width={40} height={40} />}
            <span>{item.state.file.name}</span>

            {item.state.status === "uploading" && (
              <>
                <progress value={item.state.progress} max={100} />
                <button onClick={() => cancel(item.id)}>Cancel</button>
              </>
            )}

            {item.state.status === "success" && <span>✓ Uploaded</span>}

            {item.state.status === "error" && (
              <>
                <span>✗ {item.state.error}</span>
                {item.state.canRetry && <button onClick={() => retry(item.id)}>Retry</button>}
              </>
            )}

            <button onClick={() => remove(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Đáp án mẫu

> "Em design với 5 nguyên tắc UX. **Mỗi file là independent state machine** — queued → uploading → success/error/cancelled. Không global 'isUploading' boolean — user phải biết file nào fail, file nào xong. **Cancel + Retry per file** — `AbortController` per upload, retry chỉ file fail không phải batch. **Progress per file** dùng XHR (fetch chưa support progress event native), update state realtime. **Preview before upload**: `URL.createObjectURL(file)` cho image preview ngay, revoke khi unmount. **Validation client** trước khi upload (size, type, dimension) — fail fast, không waste bandwidth. **Concurrency limit**: với 10 file thì upload 3 song song, queue 7 — không spam server, không saturate user bandwidth. **Drag-drop + paste** (Ctrl+V image từ clipboard) — modern UX expectation. **Resumable upload** với tus protocol cho file lớn (dưới 100MB) hoặc S3 multipart — gián đoạn network không phải upload lại từ đầu. **Server-side** vẫn validate lại (xem detail Web Security file): magic bytes check, re-encode qua Sharp, strip EXIF, lưu CDN subdomain riêng. UX detail: progress bar phải smooth (không jump 0% → 100% sau xong) — UX feels slow nếu mọi file 'instant complete'."

---

## Câu 5: Form accessibility — em check gì? `[Senior]`

### Câu hỏi

> Em build form accessible. Checklist em check?

### Giải thích lý thuyết

A11y form checklist:

| Check                          | Why                                              |
| ------------------------------ | ------------------------------------------------ |
| `<label for="">` hoặc wrap     | Screen reader announce field purpose             |
| `aria-required` + `required`   | Both for cross-browser/SR                        |
| `aria-invalid` + error message | SR announce error state                          |
| `aria-describedby`             | Link helper text + error với input               |
| `<fieldset>` + `<legend>`      | Group related field (radio, address block)       |
| Error message với `role="alert"` | SR announce immediately                        |
| Focus management on submit error | Focus first error field                        |
| Keyboard nav (Tab, Enter)      | Submit form bằng Enter trong text input          |
| Color không là duy nhất        | Error có icon + text, không chỉ border đỏ        |
| `autocomplete` attribute       | Browser autofill + assistive tech                |
| Logical tab order              | Theo flow đọc                                    |
| Touch target ≥ 44x44px         | Mobile / motor disability                        |

### Code minh hoạ

```tsx
// 1. Proper labeling
<label htmlFor="email">
  Email <span aria-hidden="true">*</span>
  <span className="sr-only">(bắt buộc)</span>
</label>
<input
  id="email"
  type="email"
  name="email"
  required
  aria-required="true"
  autoComplete="email"
  aria-describedby="email-helper email-error"
/>
<span id="email-helper" className="helper">Email công ty</span>
{errors.email && (
  <span id="email-error" role="alert" className="error">
    {errors.email.message}
  </span>
)}

// 2. Fieldset cho group
<fieldset>
  <legend>Địa chỉ giao hàng</legend>
  <label htmlFor="street">Đường</label>
  <input id="street" name="street" autoComplete="street-address" />
  <label htmlFor="city">Thành phố</label>
  <input id="city" name="city" autoComplete="address-level2" />
  <label htmlFor="country">Quốc gia</label>
  <select id="country" name="country" autoComplete="country">
    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
  </select>
</fieldset>

// 3. Radio group với fieldset
<fieldset>
  <legend>Phương thức thanh toán</legend>
  <label>
    <input type="radio" name="payment" value="card" /> Thẻ tín dụng
  </label>
  <label>
    <input type="radio" name="payment" value="paypal" /> PayPal
  </label>
</fieldset>

// 4. Focus first error sau submit
import { useForm } from "react-hook-form";

function Form() {
  const { register, handleSubmit, formState: { errors }, setFocus } = useForm();

  const onSubmit = handleSubmit(
    (data) => api.submit(data),
    (errors) => {
      // Focus first error field
      const firstError = Object.keys(errors)[0];
      if (firstError) setFocus(firstError as any);
    }
  );

  return <form onSubmit={onSubmit}>...</form>;
}

// 5. Error message với role="alert" — SR announce ngay
<div role="alert" aria-live="assertive">
  {errors.email && <p>Email không hợp lệ</p>}
</div>

// 6. Submit button disabled state
<button
  type="submit"
  disabled={isSubmitting}
  aria-busy={isSubmitting}
>
  {isSubmitting ? "Đang gửi..." : "Gửi"}
</button>

// 7. Loading state với SR feedback
{isSubmitting && (
  <div role="status" aria-live="polite" className="sr-only">
    Đang xử lý, vui lòng đợi
  </div>
)}

// 8. Success message after submit
{isSuccess && (
  <div role="status" aria-live="polite">
    Đã gửi thành công!
  </div>
)}

// 9. Inline validation với debounce + aria-live
function EmailField() {
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    if (!debouncedEmail) {
      setValidationMessage("");
      return;
    }

    const result = emailSchema.safeParse(debouncedEmail);
    setValidationMessage(result.success ? "" : result.error.errors[0].message);
  }, [debouncedEmail]);

  return (
    <>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!validationMessage}
        aria-describedby="email-status"
        autoComplete="email"
      />
      <span id="email-status" aria-live="polite">
        {validationMessage}
      </span>
    </>
  );
}

// 10. Visible focus indicator
// CSS — đảm bảo focus visible
input:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

// KHÔNG: outline: none mà không thay thế
```

### Đáp án mẫu

> "Em checklist 10 item. **Label**: `<label htmlFor>` hoặc wrap input — SR announce field purpose. **autoComplete** attribute đúng cho mọi field (`email`, `street-address`, `cc-number`, `one-time-code`) — browser autofill + assistive tech. **Required**: `required` (HTML) + `aria-required='true'` (cross-browser/SR). **Error**: `aria-invalid` + `aria-describedby` link error message, error wrap trong `role='alert' aria-live='assertive'` — SR announce ngay. **Helper text** link qua `aria-describedby`. **Fieldset + legend** cho group field liên quan (radio, address block, payment method). **Focus management**: sau submit fail, focus first error field — user không phải scroll tìm error. **Keyboard nav**: Tab order theo flow đọc, Enter submit trong text input. **Color không là duy nhất**: error có icon + text, không chỉ red border (color-blind miss). **Touch target ≥ 44x44px** mobile. **Loading state**: `aria-busy`, `role='status' aria-live='polite'` announce 'đang xử lý'. **Visible focus**: KHÔNG `outline: none` mà không thay thế — keyboard user mất tracking. Test với screen reader (VoiceOver iOS, TalkBack Android, NVDA Windows) — Lighthouse a11y audit chỉ là start, manual test mới catch real issue."

---

## Câu 6: Form state persistence — các pattern `[Senior]`

### Câu hỏi

> User mở form, gõ data, accidentally close tab. Quay lại form mất hết. Em fix thế nào?

### Giải thích lý thuyết

Persistence options + tradeoff:

| Storage         | Speed   | Capacity | Cross-device | Sensitive data OK | Complexity |
| --------------- | ------- | -------- | ------------ | ----------------- | ---------- |
| localStorage    | Fast    | ~5MB     | No           | No (XSS readable) | Low        |
| sessionStorage  | Fast    | ~5MB     | No, tab-only | No                | Low        |
| IndexedDB       | Medium  | ~50MB+   | No           | No                | Medium     |
| URL params      | Instant | ~2KB     | Yes (link)   | No                | Low        |
| Server (DB)     | Slow    | Unlimited| Yes          | Yes               | High       |
| Cookie          | Auto    | 4KB      | No           | No                | Low        |

Best for form: **localStorage** auto-save cho UX + **server-side draft** cho cross-device + recovery.

### Code minh hoạ

```typescript
// 1. Auto-save localStorage with throttle
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const STORAGE_KEY = "form-draft-onboarding";

function useFormPersistence<T>(formMethods: ReturnType<typeof useForm>) {
  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        formMethods.reset(data, { keepDefaultValues: true });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Auto-save on change
  const formData = formMethods.watch();

  useEffect(() => {
    const id = setTimeout(() => {
      // Don't save sensitive field
      const { password, creditCard, cvv, ssn, ...safe } = formData as any;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    }, 500);
    return () => clearTimeout(id);
  }, [formData]);

  // Clear on successful submit
  const clearDraft = () => localStorage.removeItem(STORAGE_KEY);

  return { clearDraft };
}

// Usage
function Form() {
  const methods = useForm();
  const { clearDraft } = useFormPersistence(methods);

  const onSubmit = methods.handleSubmit(async (data) => {
    await api.submit(data);
    clearDraft();
  });

  return <form onSubmit={onSubmit}>...</form>;
}

// 2. Restore prompt — UX clear
function Form() {
  const methods = useForm();
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setDraftData(JSON.parse(saved));
      setHasDraft(true);
    }
  }, []);

  const restore = () => {
    methods.reset(draftData);
    setHasDraft(false);
  };

  const discard = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
  };

  return (
    <>
      {hasDraft && (
        <div role="alert">
          <p>Bạn có form chưa hoàn thành. Khôi phục?</p>
          <button onClick={restore}>Khôi phục</button>
          <button onClick={discard}>Bỏ qua</button>
        </div>
      )}
      <form>...</form>
    </>
  );
}

// 3. Server-side draft (cross-device)
"use server";
async function saveDraft(userId: string, formId: string, data: unknown) {
  await db.formDraft.upsert({
    where: { userId_formId: { userId, formId } },
    create: { userId, formId, data: JSON.stringify(data) },
    update: { data: JSON.stringify(data), updatedAt: new Date() },
  });
}

async function getDraft(userId: string, formId: string) {
  const draft = await db.formDraft.findUnique({
    where: { userId_formId: { userId, formId } },
  });
  return draft ? JSON.parse(draft.data) : null;
}

// Hybrid: local-first, sync to server when online
function useHybridPersistence(formId: string) {
  const methods = useForm();
  const formData = methods.watch();

  // Local save instant
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(`form-${formId}`, JSON.stringify(formData));
    }, 300);
    return () => clearTimeout(id);
  }, [formData]);

  // Server sync throttled
  const throttledServerSave = useThrottledCallback(async (data) => {
    if (navigator.onLine) {
      try {
        await saveDraft(userId, formId, data);
      } catch {
        // Server fail OK, local sẽ retry sau
      }
    }
  }, 5000);

  useEffect(() => throttledServerSave(formData), [formData]);
}

// 4. Conflict resolution (local vs server)
async function resolveDraft(formId: string) {
  const local = JSON.parse(localStorage.getItem(`form-${formId}`) ?? "null");
  const server = await getDraft(userId, formId);

  if (!local && !server) return null;
  if (!local) return server;
  if (!server) return local;

  // Compare timestamps
  if (local.updatedAt > server.updatedAt) {
    // Local newer — push to server
    await saveDraft(userId, formId, local);
    return local;
  }

  return server;
}

// 5. Browser beforeunload warning
function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}

function Form() {
  const { formState: { isDirty } } = useForm();
  useUnsavedChanges(isDirty);
  // Browser native dialog "Are you sure you want to leave?"
}
```

### Đáp án mẫu

> "Em design 3 layer. **Layer 1 — Auto-save localStorage**: subscribe `watch()` debounce 500ms, lưu `localStorage`. KHÔNG lưu sensitive field (password, credit card, CVV, SSN) — exclude trong serialize. Clear khi submit thành công. **Layer 2 — Restore prompt UX**: load draft on mount, hiện prompt 'Bạn có form chưa hoàn thành. Khôi phục?' — user choose, không silent restore (vì có thể là form khác). **Layer 3 — Server-side draft (cross-device)**: save vào DB throttle 5s. User mở form trên mobile, switch laptop → draft sync. Conflict resolution: compare timestamp, newer wins, hoặc UI 'You have draft on phone — restore?'. **Browser beforeunload warning**: nếu form dirty (`isDirty: true`), `beforeunload` event → browser native dialog 'Are you sure to leave?'. Hữu ích catch accidental close. **Pattern em tránh**: silently restore (user surprise, có thể restore data không liên quan); save mọi keystroke (lag); persist sensitive data localStorage (XSS readable); rely solely server (offline scenario broken). **Edge case quan trọng**: user fill form, lỗi mạng khi submit → preserve data, retry. KHÔNG clear localStorage trước khi server confirm success."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "useState cho mọi field"                               | Form to → react-hook-form (uncontrolled) tốt hơn                    |
| "Manual validation với regex string trong code"        | Schema validation (Zod) — sustainable + type-safe                    |
| "Validate mỗi keystroke"                               | Annoy user — onBlur tốt hơn                                          |
| "Multi-step form = single form chia step UI"           | Cần partial validation + draft persistence + URL state              |
| "File upload = 1 input multiple"                       | Cần state machine per file, cancel, retry, preview                  |
| "Form a11y = thêm label"                               | Còn aria-required, aria-invalid, focus management, fieldset...     |
| "localStorage tự lưu form là đủ"                       | Cần restore prompt + clear khi submit + tránh sensitive data        |
