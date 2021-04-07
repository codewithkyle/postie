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
<!-- DELETE example showcasing success and error handling -->
<button method="DELETE" endpoint="https://api.example.com/v1/admin/user/1234" onsuccess="location.href = '/';" onerror="alert('Failed to delete account.');">Delete Account</button>

<!-- POST data { "userId": "1234", "source": "demo" } to the resend verification endpoint -->
<button endpoint="https://api.example.com/v1/user/resend-verification" data-user-id="1234" data-source="demo">Resend Verification Email</button>

<!-- Fetch HTML and inject it into the element -->
<button method="GET" accept="text/html" endpoint="/ajax/demo.html">AJAX</button>

<!-- Fetch HTML and inject it into another element using a selector string -->
<div id="target-element"></div>
<button method="GET" accept="text/html" endpoint="/ajax/demo.html" target="#target-element">AJAX</button>

<!-- Fetch HTML and replace the elements outerHTML -->
<button method="GET" accept="text/html" endpoint="/ajax/demo.html" swap="outerHTML">Hotswap Element</button>

<!-- application/json responses (default) inject a "response" object into the error/success callback script -->
<button endpoint="/this/could/fail" onsuccess="console.log(response);" onerror="console.log(response);">AJAX</button>
```
