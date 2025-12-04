# Server API Proxy Setup

This directory contains server-side endpoints that securely proxy requests to external APIs (LLM, hCaptcha) using secrets stored only on the server (not in client builds).

## Files

- `llm.js` - Claude LLM proxy endpoint (`/api/llm`)
- `hcaptcha.js` - hCaptcha verification proxy endpoint (`/api/verify-hcaptcha`)

## Deployment Instructions

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy the project**:
   ```bash
   vercel
   ```

3. **Set server environment variables** in Vercel Dashboard → Project Settings → Environment Variables:
   ```
   INTERNAL_API_KEY=<pick-a-long-random-secret>
   CLAUDE_API_KEY=<your-claude-api-key>
   CLAUDE_MODEL=claude-haiku-4.5
   HCAPTCHA_SECRET=<your-hcaptcha-secret>
   ```

4. **Update frontend `.env.local`**:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=pk_...
   VITE_INTERNAL_API_KEY=<same-value-as-INTERNAL_API_KEY>
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Netlify Functions

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Create `netlify.toml`** in project root (if not exists):
   ```toml
   [build]
   functions = "netlify/functions"
   ```

3. **Rename/move files**:
   - Copy `api/routes/llm.js` → `netlify/functions/llm.js`
   - Copy `api/routes/hcaptcha.js` → `netlify/functions/verify-hcaptcha.js`

4. **Update imports** in renamed files if needed (Netlify uses slightly different export pattern):
   ```javascript
   exports.handler = async (event, context) => { ... }
   ```

5. **Set environment variables** in Netlify dashboard → Build & Deploy → Environment:
   ```
   INTERNAL_API_KEY=<pick-a-long-random-secret>
   CLAUDE_API_KEY=<your-claude-api-key>
   CLAUDE_MODEL=claude-haiku-4.5
   HCAPTCHA_SECRET=<your-hcaptcha-secret>
   ```

6. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 3: Self-Hosted Node Server

1. **Create an Express server** (e.g., `server.js`):
   ```javascript
   import express from 'express';
   import llmHandler from './api/routes/llm.js';
   import hcaptchaHandler from './api/routes/hcaptcha.js';

   const app = express();
   app.use(express.json());

   app.post('/api/llm', (req, res) => llmHandler({ body: req.body, method: req.method, headers: req.headers }, res));
   app.post('/api/verify-hcaptcha', (req, res) => hcaptchaHandler({ body: req.body, method: req.method, headers: req.headers }, res));

   const port = process.env.PORT || 3001;
   app.listen(port, () => console.log(`Server running on port ${port}`));
   ```

2. **Set environment variables** (e.g., in `.env`):
   ```
   INTERNAL_API_KEY=<pick-a-long-random-secret>
   CLAUDE_API_KEY=<your-claude-api-key>
   CLAUDE_MODEL=claude-haiku-4.5
   HCAPTCHA_SECRET=<your-hcaptcha-secret>
   PORT=3001
   ```

3. **Run locally**:
   ```bash
   node server.js
   ```

   Or deploy to a hosting service (Heroku, Render, Railway, etc.).

## Environment Variables

All server-side environment variables should be stored in your hosting platform's secret manager and **NOT** committed to the repository.

| Variable | Value | Secret? |
|----------|-------|---------|
| `INTERNAL_API_KEY` | Random long string (e.g., 32+ chars) | Yes |
| `CLAUDE_API_KEY` | Your Claude API key | Yes |
| `CLAUDE_MODEL` | `claude-haiku-4.5` (or other Claude model) | No |
| `HCAPTCHA_SECRET` | Your hCaptcha secret key | Yes |

## Frontend Configuration

Update your frontend `.env.local` with the shared `INTERNAL_API_KEY` (public, visible in builds):

```env
VITE_INTERNAL_API_KEY=<same-value-as-INTERNAL_API_KEY-on-server>
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=pk_...
```

## Testing

### Test LLM endpoint locally:
```bash
curl -X POST http://localhost:3001/api/llm \
  -H "Content-Type: application/json" \
  -H "x-internal-api-key: <INTERNAL_API_KEY>" \
  -d '{"prompt": "What is African violet care?"}'
```

### Test hCaptcha endpoint locally:
```bash
curl -X POST http://localhost:3001/api/verify-hcaptcha \
  -H "Content-Type: application/json" \
  -H "x-internal-api-key: <INTERNAL_API_KEY>" \
  -d '{"token": "test-token-here"}'
```

## Security Notes

1. **Never commit `.env` files** with actual secrets to the repository.
2. **Always use `INTERNAL_API_KEY`** to prevent unauthorized access to your proxy endpoints.
3. **Rotate `INTERNAL_API_KEY`** regularly.
4. **Use HTTPS** in production (enforced by Vercel, Netlify, etc.).
5. **Rate limit** the endpoints if exposed to the public (add middleware like `express-rate-limit`).
6. **Monitor usage** of Claude and hCaptcha to detect abuse.

## Next Steps

1. Choose a deployment platform (Vercel recommended for fastest setup).
2. Generate a secure `INTERNAL_API_KEY`.
3. Deploy the proxy endpoints with server-side environment variables.
4. Update your frontend `.env.local` with `VITE_INTERNAL_API_KEY`.
5. Rebuild and redeploy the frontend application.
6. Test that LLM and hCaptcha calls work via the new server proxies.
