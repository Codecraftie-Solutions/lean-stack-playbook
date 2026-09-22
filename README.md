# The Lean Stack Playbook — Companion Code

Runnable, tested vanilla JavaScript implementations of every pattern in
*The Lean Stack Playbook* by Codecraftie Solutions.

Each file in `src/` corresponds to one chapter of the book:

| File | Chapter | Replaces |
|---|---|---|
| `src/utils.js` | 2 — Utility Functions | lodash |
| `src/dates.js` | 3 — Dates | moment.js / date-fns |
| `src/http.js` | 4 — HTTP | axios |
| `src/dom.js` | 5 — DOM Helpers | classnames / jQuery-style helpers |
| `src/ids.js` | 6 — IDs & Data | uuid / nanoid / lodash.isEqual |
| `src/validation.js` | 7 — Forms & Validation | Yup / Formik validation |

`src/dom.js` requires a browser (or a DOM environment like jsdom) and is not
run by the test suite, since it depends on `document`.

## Usage

```bash
npm test
```

Or import directly into your own project:

```javascript
import { debounce, groupBy } from './src/utils.js';
import { formatDate, relativeTime } from './src/dates.js';
```

No dependencies. No build step. Copy the file you need straight into your project.

## Requirements

Node 18+ (for native `fetch`, `crypto.randomUUID`, and `structuredClone`) or
any modern browser.

---

Companion code for *The Lean Stack Playbook*, available on
[Gumroad](https://codecraftie.gumroad.com/).
