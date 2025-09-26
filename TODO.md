# TODO: Fix Google Generative AI Package and Model Error

## Steps to Complete:

1. **Update package.json**: Replace the dependency from `@google/generative-ai` to `@google/genai`.
2. **Update src/services/aiService.ts**: 
   - Change the import from `@google/generative-ai` to `@google/genai`.
   - Replace all instances of model `'gemini-pro'` with `'gemini-1.5-flash'`.
3. **Install dependencies**: Run `npm install` to update the packages.
4. **Test AI functionality**: Verify that the AI service works without errors, e.g., by generating an explanation or quiz.

## Progress:
- [x] Step 1: Update package.json
- [x] Step 2: Update src/services/aiService.ts
- [ ] Step 3: Install dependencies
- [ ] Step 4: Test AI functionality
