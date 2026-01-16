<<INCLUDE prompts/_base.md>>

Task:
Prepare and close a Tokens release.

Release target:
- Tokens version: v1.0.0-tokens

Preconditions:
- Tokens pipeline has been validated end-to-end:
  - tokens:sync
  - tokens:transform
  - tokens:publish
  - tokens:css
  - tokens:build
- Dev-app reflects latest token values.
- Button and other components are WIP and must NOT be versioned.

Instructions:
1. Verify repository state:
   - Working tree must be clean OR only contain token-related changes.
   - No component code changes pending.
2. Verify required artifacts exist:
   - figma/variables.*.json
   - public/tokens/
   - src/styles/tokens.css
   - src/tokens/tokens-data.json
3. Print a summary of token artifacts (file counts and sizes).
4. Create a git tag:
   - Tag name: v1.0.0-tokens
   - Tag message: "Tokens v1.0.0 — infrastructure stable"

Rules:
- Do NOT run token generation commands.
- Do NOT modify any files.
- Do NOT push the tag.

Deliverable:
- Local git tag created.
- Confirmation that Tokens are formally closed.