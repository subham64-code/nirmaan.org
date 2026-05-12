# Nirmaan AI Chatbot - API Key Setup Guide

## Current Status
⚠️ AI API keys are not configured. The chatbot is showing configuration instructions.

## Quick Setup (Choose One)

### Option 1: Google Gemini (Recommended - Free)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_key_here
   ```

### Option 2: DeepSeek AI
1. Go to https://platform.deepseek.com/
2. Create an account
3. Generate an API key
4. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_DEEPSEEK_API_KEY=your_actual_key_here
   ```

### Option 3: Ollama (Local - Free)
1. Install Ollama from https://ollama.com/
2. Run: `ollama run llama2`
3. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_OLLAMA_API_KEY=http://localhost:11434
   ```

## Setup Steps

1. **Create .env.local file** in `frontend/` folder
2. **Add your chosen API key** (see examples above)
3. **Restart the dev server** with Ctrl+C, then `npm run dev`
4. **Test the chatbot** - it should now show AI responses!

## File Location
```
d:\nirmaan.org\frontend\.env.local
```

## Example .env.local
```env
# Choose one or more AI providers
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# NEXT_PUBLIC_OLLAMA_API_KEY=http://localhost:11434
```

## Free Tier Limits
- **Gemini**: 60 requests/minute free
- **DeepSeek**: $5 free credits on signup
- **Ollama**: Completely free (runs locally)

## Troubleshooting
If you see "AI services not configured" after adding keys:
1. Make sure `.env.local` is in the `frontend/` folder
2. Restart the dev server completely
3. Check browser console for errors
4. Verify API key is valid by testing directly

## Note
The chatbot will work without API keys but will show configuration instructions instead of AI responses.
