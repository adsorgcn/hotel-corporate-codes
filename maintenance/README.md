# Hotel data maintenance

Latest prepared data: data-v1.0.3. Downstream consumers must use a published, checksum-verified Release; a branch manifest may still be pending.

[Download data releases](https://github.com/adsorgcn/hotel-corporate-codes/releases/tag/data-v1.0.3)

Schema version 1 uses string codes (leading zeros preserved), stable records and field-specific evidence. `legacy_unverified` means historical import only; `reported` requires two independently originated, dated reports; `source_confirmed` identifies claims supported by the brand or agreement issuer; `booking_observed` is reserved for contextual booking observations and is not collected by this workflow.

Records marked listed may still be unverified. Unknown eligibility, dates and scope remain null. Historic discount, ID and verified values are legacy claims, not current promises. The record evidence level summarizes its strongest field; inspect each claim. Full pages and local logs are not redistributed. No booking, payment or identity use is performed.

Only substantive, reviewed changes produce a patch release. No-change scans stay local. The package, root README and website remain separate and may contain older counts and tables.
