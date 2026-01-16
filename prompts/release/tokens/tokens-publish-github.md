<<INCLUDE prompts/_base.md>>

Task:
Publish the Tokens release to GitHub.

Preconditions:
- Tokens release tag v1.0.0-tokens already exists locally.
- Repository working tree is clean.
- Tokens are considered CLOSED.

Instructions:
1. Verify repository hygiene:
   - No credentials or secrets.
   - .gitignore respected.
   - No build artifacts accidentally tracked.
2. Verify README:
   - Explains what this repository is.
   - Explains that Tokens are infrastructure.
   - Clarifies that components (e.g. Button) are WIP.
3. Push to remote:
   - Push current branch.
   - Push tag v1.0.0-tokens.
4. Confirm:
   - Tag exists on remote.
   - Commit hash associated with the tag.

Rules:
- Do NOT regenerate tokens.
- Do NOT modify files.
- Do NOT create GitHub Releases unless explicitly requested.

Deliverable:
- Tokens v1.0.0 published on GitHub.
- Confirmation of remote tag and commit hash.