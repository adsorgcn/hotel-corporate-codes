# Data releases and citation archives

This repository has two release streams with different data coverage.

| Stream | Source | Publication |
|---|---|---|
| Reviewed source updates | `hotel-data-maintenance`, tags `data-v1.0.N` | Automatic GitHub Releases with reviewed data, change records and checksums |
| Citable dataset snapshots | Reviewed commits on `main`, tags `vX.Y.Z` with an optional version suffix | Separately reviewed Zenodo versions |

The Zenodo concept DOI is [10.5281/zenodo.24061853](https://doi.org/10.5281/zenodo.24061853). Its first version, [10.5281/zenodo.24061854](https://doi.org/10.5281/zenodo.24061854), archives `v1.1.0+doi.1`: 290 hotel records across 10 groups, plus five car-rental records. Maintenance releases use a separate schema and must not be uploaded to this DOI series.

## Publication boundary

The repository's native Zenodo GitHub integration is **disabled**. There is no Zenodo release webhook or automatic Zenodo publishing workflow. GitHub data releases continue independently. A `.zenodo.json` file describes metadata; it does not itself trigger a deposit.

Keep that integration disabled. Do not temporarily enable it to archive a main release: a concurrent maintenance release would also enter the repository-wide integration. Do not place a Zenodo token in the data maintainer or the Pages workflow.

The [official integration guide](https://help.zenodo.org/docs/github/enable-repository/) describes automatic ingestion of new repository releases. The integration does not provide the branch separation required by these two streams.

## Prepare a future citation archive

1. Review the intended main-branch data snapshot and create a dedicated release tag. Do not use a `data-*` tag or merge the entire maintenance branch into main. Verify record counts, source evidence, metadata version, sole creator, license and references.
2. Refresh Git refs, then run the read-only candidate check against the exact reviewed commit and independently reviewed counts. For the first archived release:

   ```bash
   git fetch origin main --tags
   python scripts/check-archive-candidate.py --tag v1.1.0+doi.1 --expected-commit 8ee9e1ba4165d0f512382d4c393223b077d17523 --expected-hotels 290 --expected-groups 10 --expected-car-rentals 5
   ```

   This verifies the remote/local tag, ancestry on current main, the main dataset layout, counts, metadata version and owner. It rejects maintenance tags and maintenance payloads. It does not create a release, upload files or publish a DOI. Also run the repository's data tests for the reviewed candidate.
3. Create a ZIP from the verified tag, record its SHA-256, and inspect its file list. Do not substitute the maintenance release's attachments or a working-directory ZIP.
4. Open the latest record in the existing concept DOI series and use **New version**. Follow Zenodo's [versioning guide](https://help.zenodo.org/docs/deposit/manage-versions/). Upload the reviewed ZIP and version-specific metadata. Confirm the intended parent series before publishing. Do not create an unrelated upload or re-enable the repository integration.
5. Read the published record back. Confirm concept DOI `10.5281/zenodo.24061853`, a new version DOI, expected file hashes, one creator and the intended references. Update README/CFF and site citations; retain the exact version DOI for reproducibility.

Changes confined to README, presentation or the GitHub Pages site do not require a new dataset DOI version. Update DOI metadata when appropriate rather than creating duplicate file archives.

## Verify separation before resuming maintenance releases

Verify that the Zenodo repository toggle is off, no active Zenodo release webhook exists, and no GitHub Actions workflow or maintainer code sends data to Zenodo. Check that the concept series contains only the intended reviewed versions. Once these conditions hold and there is no pending maintenance publication transaction, the normal daily maintainer can resume.

Do not create a synthetic public release to test this boundary. Checking the event subscription and both publishing paths verifies the separation without adding a false data release or DOI version.
