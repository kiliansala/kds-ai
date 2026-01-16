<<INCLUDE prompts/_base.md>>

Task:
Create a backup snapshot for the Tokens release.

Target version:
- v1.0.0-tokens

Backup scope (MUST include):
- figma/variables.*.json
- public/tokens/
- src/styles/tokens.css
- src/tokens/tokens-data.json
- docs/

Instructions:
1. Create a backup directory OUTSIDE the repository:
   - Name: kds-ai-tokens-v1.0.0
2. Copy the listed artifacts preserving directory structure.
3. Verify backup integrity:
   - File counts match source
   - JSON files are valid
4. Print:
   - backup path
   - list of copied directories/files
   - total size

Rules:
- Do NOT modify the repository.
- Do NOT commit anything.
- Backup must be read-only.

Deliverable:
- Verified backup snapshot for Tokens v1.0.0.