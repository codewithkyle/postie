# Postie

Postie helps you to perform simple CRUD operations using HTML Attributes. Postie is a smaller, simpler, version of [htmx](https://htmx.org/). If you need all the bells and whistles (like CSS transitions) I suggest you use the htmx library instead.

## Install

Install via NPM:

```bash
npm i -S @codewithkyle/postie
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@codewithkyle/postie@1/postie.min.js">
```

## Usage

### Interfaces

```typescript
type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type AcceptHeader = "application/json" | "text/html";

type Prompt = "confirm" | "input" | null;

type Swap = "inner" | "outer" | "innerHTML" | "outerHTML";

interface PostieSettings {
    endpoint: string;
    method?: RequestMethod; // POST
    accept?: AcceptHeader; // application/json
    data?: DOMStringMap; // {}
    prompt?: Prompt; // null
    promptLabel?: string;
    promptValue?: string;
    promptName?: string; // prompt
    success?: string | null;
    error?: string | null;
    preventDisable?: boolean; // false
    once?: boolean; // false
    target?: string; // this.el
    swap?: Swap; // innerHTML
    reset?: number; // 10
};
```

### Examples

```html

```
