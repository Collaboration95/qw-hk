# Job 007 · Update the live "Cover my briefing" page on Revisionpedia

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/007-hashmeta-cover-copy/. Never ask questions; record problems and continue. Do not commit or push. Use the **hashmeta** connector, direct tools only (no Hashmeta AI tasks).

Site projectId `6b7c9fea-8970-469b-871a-1eb4f8db9601`, page path `/cover-my-briefing/`. The live page still shows a "Price placeholder" and promises the enquiry "goes to the directory editor". The approved new copy is in `site/pages/cover-my-briefing.md` (the repo file is the source of truth).

1. With the hashmeta tools, list pages and get the cover-my-briefing page (keep its updatedAt/contentHash). Save the current content to docs/qw-outbox/007-hashmeta-cover-copy/before.txt.
2. Replace ONLY the page's text content so it matches site/pages/cover-my-briefing.md: the intro paragraph, the "Pilot for one briefing" paragraph (replacing any price placeholder), the "Send an enquiry" heading and paragraph, and the closing line. Keep the existing enquiry form block exactly where the `<!-- enquiry-form -->` marker is, keep the page's layout/styles/header/footer, title and SEO fields. Pass back the updatedAt/contentHash you read.
3. Also update form id 1's confirmation message to: "Thank you. Your enquiry has been received. Sending an enquiry does not enrol you in a paid plan." (keep everything else on the form).
4. Publish the changes and wait for publish status to finish.
5. Verify signed out: `curl -sL https://revisionpedia.geo.hashmeta.tech/cover-my-briefing/` contains "Pilot for one briefing" and does NOT contain "placeholder" (case-insensitive); the form is still present (contains "Send enquiry").
6. REPORT.md with PASS/FAIL per step and the verification output, then DONE.
