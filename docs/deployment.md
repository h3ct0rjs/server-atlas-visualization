# Cloudflare deployment

Target: https://datacenter-atlas.h3ct0rjs.dev

The Vite build is hosted by Cloudflare Workers Static Assets. Only `dist/` is uploaded: source files, research notes, and GitHub issue drafts are not public assets. `wrangler.jsonc` binds the `datacenter-atlas` Worker to the exact subdomain. The apex domain is not part of this configuration. Workers.dev and preview URLs are disabled.

## First-time setup

1. Use the Cloudflare account containing the active `h3ct0rjs.dev` zone. Obtain its account ID.
2. Create an API token using Cloudflare's **Edit Cloudflare Workers** template. Scope its account resources to this account and zone resources to `h3ct0rjs.dev`. Ensure permissions cover Worker deployment and Custom Domain/Workers Routes management. If the dashboard requires additional permissions for Custom Domain creation, follow the deployment error and Cloudflare documentation instead of granting unrestricted account access.
3. Add GitHub Actions secrets to `h3ct0rjs/server-atlas-visualization` (repository secrets or the `production` environment):
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`

   Use GitHub's secret UI, or these interactive commands in your own terminal; do not paste tokens into chat, source files, command arguments, or workflow logs:

   ```sh
   gh secret set CLOUDFLARE_ACCOUNT_ID --repo h3ct0rjs/server-atlas-visualization
   gh secret set CLOUDFLARE_API_TOKEN --repo h3ct0rjs/server-atlas-visualization
   ```

4. Check the exact subdomain in Cloudflare DNS and Workers Domains & Routes. DNS currently resolves this hostname, which might come from a wildcard; DNS lookup alone cannot establish whether a dedicated record exists. Resolve any conflicting dedicated record or existing service before the first deployment. Do not delete the apex domain or unrelated records. Cloudflare provisions the custom-domain DNS record and TLS certificate when binding succeeds.
5. Merge the deployment changes into `main`. The workflow validates and then deploys. Alternatively, run **Validate and deploy atlas** with `workflow_dispatch` on `main` once the workflow exists on the default branch.

First production deployment completed on 2026-09-16 through local Wrangler OAuth. The active zone and absence of an existing Worker custom-domain binding were verified before deployment; Wrangler successfully bound the hostname. Version: eda0b372-e890-4dae-ab64-5426b06612b1. GitHub has both CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN. GitHub Actions run 35147951191 successfully validated and deployed production after token setup. Do not store the short-lived local OAuth token in GitHub.

## Pipeline behavior

- Pull requests: `npm ci`, tests, TypeScript/Vite build, and Wrangler dry-run; no deployment secrets or publishing.
- Pushes to `main`: validate, upload the built `dist/` artifact, then deploy that exact artifact to production.
- Manual runs: validation runs on the selected ref; production deployment is allowed only on `main`.
- Production deployments are serialized and are not interrupted halfway through by newer runs.
- Actions are pinned to commit SHAs; Wrangler and Vite are pinned in the lockfile.
- Post-deploy verification checks HTTPS, the current HTML's hashed asset references, and JS/CSS responses. Browser rendering, WebGL, and hash-route interactions still need a browser smoke check.
- Missing secrets fail the deployment explicitly. DNS/certificate propagation can temporarily fail verification even after an upload succeeds; rerun verification after provisioning completes.

GitHub protected-branch rules and required reviews are not changed by this configuration. If needed, require the **Test and build** check in the repository's ruleset.

## Local commands

```sh
npm ci
npm test
npm run build
npm run deploy:check
npm run preview:cloudflare
```

`deploy:check` validates the current build without publishing. `preview:cloudflare` serves the existing `dist/`; run the build first. For a manual authenticated deploy, run `wrangler login` then `npm run deploy`, or supply the same Cloudflare environment variables used by CI. Local OAuth login is separate from the API token required for GitHub Actions.

The app uses `#room`, `#server`, and `#floor`; fragments are handled client-side. SPA fallback is enabled. Hashed assets receive immutable caching; HTML uses the platform's normal cache behavior.

## Rollback

Revert the bad application commit on `main` and push the revert so the validated pipeline republishes the previous implementation. For an urgent operational rollback, select an earlier deployment in Cloudflare's Worker dashboard, then reconcile `main` before the next automatic deployment. Keep artifact retention (7 days) in mind.

## References

- [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [GitHub Actions authentication and deployment](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
