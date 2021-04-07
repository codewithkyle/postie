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

<!-- Prevent Postie from applying the [disabled] attribute to the element -->
<button prevent-disable method="GET" accept="text/html" endpoint="/ajax/demo.html">AJAX</button>
<button no-disable method="GET" accept="text/html" endpoint="/ajax/demo.html">AJAX</button>

<!-- Stop Postie from preventing the default event behavior -->
<button allow-default method="GET" accept="text/html" endpoint="/ajax/demo.html">AJAX</button>

<!-- Tell Postie the action can only be performed once -->
<button once method="GET" accept="text/html" endpoint="/ajax/demo.html">AJAX</button>

<!-- Change the reset timeout -- defaults to 10 (seconds) -->
<button reset="5" endpoint="https://api.example.com/v1/user/resend-verification" data-user-id="1234" data-source="demo">Resend Verification Email</button>

<!-- Prompt the user to confirm their action -->
<button prompt="confirm" prompt-label="Are you sure you want to delete your account? This action cannot be undone." method="DELETE" endpoint="https://api.example.com/v1/admin/user/1234" onsuccess="location.href = '/';" onerror="alert('Failed to delete account.');">Delete Account</button>

<!-- Prompt the user for an input before processing their action -->
<button prompt="input" prompt-label="Enter your password to confirm account deletion." method="DELETE" endpoint="https://api.example.com/v1/admin/user/1234" onsuccess="location.href = '/';" onerror="alert('Failed to delete account.');">Delete Account</button>

<!-- Control the prompts body param key: { "password": "" } -->
<button prompt-name="password" prompt="input" prompt-label="Enter your password to confirm account deletion." method="DELETE" endpoint="https://api.example.com/v1/admin/user/1234" onsuccess="location.href = '/';" onerror="alert('Failed to delete account.');">Delete Account</button>

<!-- Prefill the input prompts value -->
<button prompt-value="prefill prompt value" prompt-name="password" prompt="input" prompt-label="Enter your password to confirm account deletion." method="DELETE" endpoint="https://api.example.com/v1/admin/user/1234" onsuccess="location.href = '/';" onerror="alert('Failed to delete account.');">Delete Account</button>
```

### CSS

```scss
button{
    &[postie="idling"]{
        // Default postie element state
    }
    &[postie="processing"]{
        // Show a loading spinner or something
    }
    &[postie="success"]{
        // Success!
    }
    &[postie="error"]{
        // Oh sh*t.
    }
    &[disabled],
    &:disabled{
        // Postie disabled this element
    }
}
```
