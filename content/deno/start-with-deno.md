---
title: "What you need to start with Deno"
date: 2020-08-02
path: /deno-guide/start-deno/
excerpt: "A quick tour to get started with using Deno."
last_modified_at: 2020-08-02T11:00:23-05:00
categories: [deno-guide]
toc: true
tags: [Deno, Typescript, Tutorials, web development]
---

## Section 1: Deno Foundations

### 4. Why Deno?

- [Deno](https://deno.land)
- Rust by Mozilla
- TypeScript by Microsoft
- V8 Engine by Google

**[⬆ back to top](#table-of-contents)**

### 5. Deno Runtime And V8 Engine

- JS / TS -> V8 Engine -> Mobile / Web

**[⬆ back to top](#table-of-contents)**

### 6. Deno Installation

```console
curl -fsSL https://deno.land/x/install/install.sh | sh
```

- Deno was installed successfully to /Users/chesterheng/.deno/bin/deno
- Manually add the directory to your $HOME/.bash_profile (or similar)
  - export DENO_INSTALL="/Users/chesterheng/.deno"
  - export PATH="$DENO_INSTALL/bin:$PATH"

```console
open /Users/chesterheng/.deno/bin/deno
/Users/chesterheng/.deno/bin/deno --help
deno
```

**[⬆ back to top](#table-of-contents)**

### 7. Quick Note: Installing Deno

[Deno online editor](https://repl.it/languages/deno#index.ts)

**[⬆ back to top](#table-of-contents)**

### 10. Setting Up Our Developer Environment

```console
deno run deno.js
deno run deno2.ts
```

<details>
<summary>deno.js</summary>

```javascript
const food = Deno.args[0];
const parent = Deno.args[1];

if (food === 'love' && parent === 'ryan') {
  console.log('🦕...Deno is born!')
} else {
  console.log('🥚...this egg needs some love')
}

setTimeout(() => {
  console.log('check')
}, 1000)

console.table(Deno.metrics())
```

</details>

<details>
<summary>deno2.ts</summary>

```typescript
const b: string = 'Chester'
console.log(b)
```

</details>

**[⬆ back to top](#table-of-contents)**

### 11. Quick Note: Official VS Code Plugin

- Download and enable [Visual Studio Code Deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
- Enable Deno for your project:
  - Create a file .vscode/settings.json in your project folder:

  ```json
  {
    "deno.enable": true
  }
  ```

**[⬆ back to top](#table-of-contents)**

### 12. Our First Deno App

- [✂️ Copy and 📋 Paste Emoji](https://getemoji.com)
- [deno doc](https://doc.deno.land/builtin/stable)

```console
deno run deno.js 'love'
```

<details>
<summary>deno.js</summary>

```javascript
const food = Deno.args[0]

if(food === 'love') {
  console.log('🦕...Deno is born!')
} else {
  console.log('🥚...this egg needs some love')
}
```

</details>

**[⬆ back to top](#table-of-contents)**

### 13. Exercise: Our First Deno App

```console
deno run deno.js 'love' 'ryan'
```

<details>
<summary>deno.js</summary>

```javascript
const food = Deno.args[0];
const parent = Deno.args[1];
if (food === 'love' && parent === 'ryan') {
   console.log('🦕...Deno is born!')
}
```

</details>

**[⬆ back to top](#table-of-contents)**

### 15. Deno Internals And Architecture

|                  | Node JS | Deno  |
| ---------------- | ------- | ----- |
| Engine           | V8      | V8    |
| Written In       | C++     | Rust  |
| Asynchronous I/O | LIBUV   | TOKIO |

![](section-02/deno-process.jpg)
![](section-02/node-system.jpg)

- [Deno Architecture](https://medium.com/deno-tutorial/deno-architecture-8551fb3be80e)
- [Deno vs Node](https://medium.com/deno-tutorial/deno-vs-node-dc741d85f9d7)

**[⬆ back to top](#table-of-contents)**

### 17. Deno Metrics

![](section-02/deno-matrics.jpg)

```console
deno run deno.js
```

<details>
<summary>deno.js</summary>

```javascript
setTimeout(() => {
  console.log('check')
  console.table(Deno.metrics())
}, 1000)
```

</details>

**[⬆ back to top](#table-of-contents)**

### 18. Exercise: Deno Architecture

When do we run the Rust code?

- Deno.
- window.

|               | Node JS    | Deno      |
| ------------- | ---------- | --------- |
| Window Object | global     | window    |
| window.fetch  | node-fetch | available |

**[⬆ back to top](#table-of-contents)**

## Section 3: Deno vs Node

### 21. Deno Game Changers

Deno

- First class TypeScript
- [ES Modules](https://deno.land/std@0.65.0/examples)
```javascript
import "https://deno.land/std@0.65.0/examples/welcome.ts"
import "https://deno.land/std@0.65.0/examples/chat/server.ts"
```
- Security first
```console
deno run --allow-net deno2.js
```
- ["Decentralized" modules](https://deno.land/x): developer can host modules anywhere -> 
- [Standard Library](https://deno.land/std@0.65.0)
- [Built In Tooling](https://deno.land/manual/tools)
- Browser Compatible API
  - JS can run in browser with no changes
  - same window object with browser
  - fetch is available
- Single Executable: deno
- Async returns Promises
- Opinionated Modules: [Deno Style Guide](https://deno.land/manual/contributing/style_guide)

**[⬆ back to top](#table-of-contents)**

### 24. Single Executable To Rule Them All

["deno compile" into executable](https://github.com/denoland/deno/issues/986)

**[⬆ back to top](#table-of-contents)**

### 25. Deno Security

[Permissions for CLI](https://github.com/denoland/deno/blob/master/cli/permissions.rs)

```ts
pub allow_read: PermissionState,
pub read_allowlist: HashSet<PathBuf>,
pub allow_write: PermissionState,
pub write_allowlist: HashSet<PathBuf>,
pub allow_net: PermissionState,
pub net_allowlist: HashSet<String>,
pub allow_env: PermissionState,
pub allow_run: PermissionState,
pub allow_plugin: PermissionState,
pub allow_hrtime: PermissionState,
```

**[⬆ back to top](#table-of-contents)**

### 26. Deno Permissions

- Whitelisting is the practice of explicitly allowing some identified entities access to a particular privilege, service, mobility, access or recognition. It is the opposite of blacklisting.
- [Drake — a task runner for Deno](https://github.com/srackham/drake)

```bash
deno run --allow-net deno2.js
deno run --allow-env main.ts
deno run --allow-all main.ts
deno run -A main.ts
deno run -help
deno install --allow-env main.ts
section-03
deno run -A Drakefile.ts hello
```

<details>
<summary>deno2.js</summary>

```javascript
import "https://deno.land/std@0.65.0/examples/welcome.ts"
import "https://deno.land/std@0.65.0/examples/chat/server.ts"
```

</details>

<details>
<summary>Drakefile.ts</summary>

```typescript
import { desc, run, task, sh } from "https://deno.land/x/drake@v1.2.6/mod.ts";

desc("Minimal Drake task");
task("hello", [], async function() {
  console.log("Hello from Drake!");
  await sh("deno run --allow-env main.ts");
  await sh("echo Hello World");
});

run()
```

</details>

<details>
<summary>main.ts</summary>

```typescript
console.log("Hello", Deno.env.get("USER"));
```

</details>

**[⬆ back to top](#table-of-contents)**



## Section 4: Deno Modules And Tooling

### 29. How Modules Work In Deno

<details>
<summary>deno info deno3.js</summary>

```console
local: deno3.js
type: JavaScript
deps:
deno3.js
  └── deno2.js
```

</details>

<details>
<summary>deno2.js</summary>

```javascript
export function denode(input) {
  if (input.toLowerCase() === 'node') {
    return input.split("").sort().join("")
  }
  return input;
}
```

</details>

<details>
<summary>deno3.js</summary>

```javascript
import { denode } from './deno2.js'

console.log(denode("NODE"));
```

</details>

**[⬆ back to top](#table-of-contents)**

### 30. URL Modules

<details>
<summary>deno info deno3.js</summary>

```console
Download https://deno.land/std@0.66.0/examples/welcome.ts
local: deno3.js
type: JavaScript
deps:
deno3.js
  ├── deno2.js
  └── https://deno.land/std@0.66.0/examples/welcome.ts
```

</details>

<details>
<summary>deno info https://deno.land/std@0.66.0/examples/welcome.ts</summary>

```console
local: /Users/chesterheng/Library/Caches/deno/deps/https/deno.land/aaa5f7b759111e731af7b564810dc454f6ecbeb452c020834e6e6782a3fd973e
type: TypeScript
compiled: /Users/chesterheng/Library/Caches/deno/gen/https/deno.land/aaa5f7b759111e731af7b564810dc454f6ecbeb452c020834e6e6782a3fd973e.js
deps:
https://deno.land/std@0.66.0/examples/welcome.ts
```

</details>

<details>
<summary>deno2.js</summary>

```javascript
export function denode(input) {
  if (input.toLowerCase() === 'node') {
    return input.split("").sort().join("")
  }
  return input;
}
```

</details>

<details>
<summary>deno3.js</summary>

```javascript
import { denode } from './deno2.js'
import "https://deno.land/std@0.66.0/examples/welcome.ts"

console.log(denode("NODE"));
```

</details>

**[⬆ back to top](#table-of-contents)**

### 31. Standard Library

- [Deno Standard Library](https://deno.land/std@0.66.0)
- Inspired by Go
- Maintained by Deno team
- Dependencies are with the standard library

<details>
<summary>deno info https://deno.land/std/http/server.ts</summary>

```console
Download https://deno.land/std/http/server.ts
Warning Implicitly using latest version (0.66.0) for https://deno.land/std/http/server.ts
Download https://deno.land/std@0.66.0/http/server.ts
Download https://deno.land/std@0.66.0/encoding/utf8.ts
Download https://deno.land/std@0.66.0/io/bufio.ts
Download https://deno.land/std@0.66.0/_util/assert.ts
Download https://deno.land/std@0.66.0/async/mod.ts
Download https://deno.land/std@0.66.0/http/_io.ts
Download https://deno.land/std@0.66.0/async/deferred.ts
Download https://deno.land/std@0.66.0/async/delay.ts
Download https://deno.land/std@0.66.0/async/mux_async_iterator.ts
Download https://deno.land/std@0.66.0/async/pool.ts
Download https://deno.land/std@0.66.0/textproto/mod.ts
Download https://deno.land/std@0.66.0/http/http_status.ts
Download https://deno.land/std@0.66.0/bytes/mod.ts
local: /Users/chesterheng/Library/Caches/deno/deps/https/deno.land/41079ae77abd890bc4e9a389c6b449dda2f6c8e75955df8af2ff39094c277f04
type: TypeScript
compiled: /Users/chesterheng/Library/Caches/deno/gen/https/deno.land/41079ae77abd890bc4e9a389c6b449dda2f6c8e75955df8af2ff39094c277f04.js
deps:
https://deno.land/std/http/server.ts
  ├── https://deno.land/std@0.66.0/encoding/utf8.ts
  ├─┬ https://deno.land/std@0.66.0/io/bufio.ts
  │ ├── https://deno.land/std@0.66.0/bytes/mod.ts
  │ └── https://deno.land/std@0.66.0/_util/assert.ts
  ├── https://deno.land/std@0.66.0/_util/assert.ts
  ├─┬ https://deno.land/std@0.66.0/async/mod.ts
  │ ├── https://deno.land/std@0.66.0/async/deferred.ts
  │ ├── https://deno.land/std@0.66.0/async/delay.ts
  │ ├─┬ https://deno.land/std@0.66.0/async/mux_async_iterator.ts
  │ │ └── https://deno.land/std@0.66.0/async/deferred.ts
  │ └── https://deno.land/std@0.66.0/async/pool.ts
  └─┬ https://deno.land/std@0.66.0/http/_io.ts
    ├── https://deno.land/std@0.66.0/io/bufio.ts
    ├─┬ https://deno.land/std@0.66.0/textproto/mod.ts
    │ ├── https://deno.land/std@0.66.0/bytes/mod.ts
    │ └── https://deno.land/std@0.66.0/encoding/utf8.ts
    ├── https://deno.land/std@0.66.0/_util/assert.ts
    ├── https://deno.land/std@0.66.0/encoding/utf8.ts
    ├─┬ https://deno.land/std@0.66.0/http/server.ts
    │ ├── https://deno.land/std@0.66.0/encoding/utf8.ts
    │ ├── https://deno.land/std@0.66.0/io/bufio.ts
    │ ├── https://deno.land/std@0.66.0/_util/assert.ts
    │ ├── https://deno.land/std@0.66.0/async/mod.ts
    │ └── https://deno.land/std@0.66.0/http/_io.ts
    └── https://deno.land/std@0.66.0/http/http_status.ts
```

</details>

**[⬆ back to top](#table-of-contents)**

### 32. 3rd Party Modules

- [Deno Third Party Modules](https://deno.land/x)
- Deno do not support CommonJS
- Deno need to know the file extension

**[⬆ back to top](#table-of-contents)**

### 33. Deno Caching

[Linking to third party code](https://deno.land/manual/linking_to_external_code)

```console
open $HOME/Library/Caches/deno
```

<details>
<summary>deno run deno3.js</summary>

```console
Download https://deno.land/std@0.66.0/examples/welcome.ts
Check deno3.js
Welcome to Deno 🦕
DENO
```

</details>

<details>
<summary>deno run deno3.js</summary>

```console
Check deno3.js
Welcome to Deno 🦕
DENO
```

</details>

<details>
<summary>deno run --reload deno3.js</summary>

```console
Download https://deno.land/std@0.66.0/examples/welcome.ts
Check deno3.js
Welcome to Deno 🦕
DENO
```

</details>

**[⬆ back to top](#table-of-contents)**


### 35. NPM for Deno
**[⬆ back to top](#table-of-contents)**

### 36. Managing Module Versions
**[⬆ back to top](#table-of-contents)**

### 37. Where the Bleep is package.json?
**[⬆ back to top](#table-of-contents)**

### 38. Deps.ts
**[⬆ back to top](#table-of-contents)**

### 39. Locking Dependencies
**[⬆ back to top](#table-of-contents)**

### 40. Deno Upgrade
**[⬆ back to top](#table-of-contents)**

### 41. Reviewing Deno Modules
**[⬆ back to top](#table-of-contents)**

### 42. Deno Tooling
**[⬆ back to top](#table-of-contents)**





## Section 5: TypeScript

**[⬆ back to top](#table-of-contents)**

## Section 6: Deno File I/O

**[⬆ back to top](#table-of-contents)**
