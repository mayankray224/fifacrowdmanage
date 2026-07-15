# FIFA CrowdFlow: Security Architecture & Threat Model

This guide documents security standards, threat modeling, and OWASP compliance rules implemented in **FIFA CrowdFlow**.

## Threat Model (STRIDE)

| Threat Category | Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **S**poofing | Unauthorized client pretending to be stadium operations operator | Role-based layout restrictions (FAN, VOLUNTEER, ORGANIZER) |
| **T**ampering | Malicious user intercepting and modifying navigation coordinate inputs | Zod schema validation (checks min/max length and patterns) |
| **R**epudiation | Missing trails of emergency dispatches | Security event log auditing in server console |
| **I**nformation Disclosure | Prompt leakage revealing internal system setup details | Strictly defined system prompts with XML tags enclosing user queries |
| **D**enial of Service | Rapid requests to navigation API exhausting LLM token bounds | Next.js Edge Middleware token bucket rate limiter (Max 60 req/min) |
| **E**levation of Privilege | Fan attempting to dispatch tasks via REST API endpoints | Access tokens checks inside POST `/api/operations/dispatch` |

---

## OWASP Top 10 Compliance Matrix

1. **A01:2021-Broken Access Control**: Strict role validation on page rendering.
2. **A03:2021-Injection**: Zod schemas validate, parse, and sanitize all parameters, stripping HTML tags and preventing XSS or SQL syntax payloads.
3. **A04:2021-Insecure Design**: Static fallback logic protects system in case of GenAI timeout failures.
4. **A09:2021-Security Logging**: Server actions print access errors to standard error streams for auditing.

---

## OWASP LLM Safety Compliance

- **Prompt Injection Defense**: User queries are isolated within `<user_prompt>` tags in our Claude instructions.
- **Model Fallback Routing**: Robust local multilingual dictionary triggers automatically if Claude API calls fail.
- **Strict Content Security Policy (CSP)**:
  `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';`
