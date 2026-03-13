# Hotel Corporate Codes — Open Source Database

The most comprehensive, open-source database of hotel corporate discount codes for Marriott, Hilton, IHG, Hyatt, Wyndham, Best Western, Choice Hotels, Accor, and car rental companies.

**Live site:** [hotelcorporatecodes.com](https://hotelcorporatecodes.com)

## What's Inside

| Brand | Codes | Format |
|-------|-------|--------|
| Marriott Bonvoy | 60 | `data/marriott.json` |
| Hilton Honors | 18 | `data/hilton.json` |
| IHG One Rewards | 24 | `data/ihg.json` |
| World of Hyatt | 9 | `data/hyatt.json` |
| Wyndham Rewards | 3 | `data/wyndham.json` |
| Best Western | 2 | `data/bestwestern.json` |
| Choice Privileges | 2 | `data/choice.json` |
| Accor ALL | 1 | `data/accor.json` |
| Car Rental (Hertz/Avis/Sixt) | 5 | `data/car-rental.json` |

Each code entry includes: code, company name, estimated discount range, region, ID verification risk level, and notes.

## Data Format

```json
{
  "code": "SIE",
  "company": "Siemens",
  "discount": "15-22%",
  "region": "Global",
  "idRequired": "Rarely",
  "note": "Best overall. Personal travel allowed.",
  "verified": "2026-03"
}
```

## Key Features

- **123+ verified codes** across 8 major hotel chains
- **ID verification risk** rated for each code (No / Rarely / Sometimes / Yes)
- **Regional coverage** indicated (Global, NA, EU, Asia)
- **Direct booking links** to hotel websites with codes pre-filled
- **AI Travel Advisor** on the live site recommends the best code for your destination
- Data structured with [I-Lang Protocol](https://ilang.ai) for AI-native parsing

## How Corporate Codes Work

Hotel corporate codes are pre-negotiated discount rates between companies and hotel chains. When entered during booking on a hotel's official website, they unlock rates typically 10-30% below public prices.

Corporate rate bookings earn full loyalty points and count toward elite status at all major chains (Marriott Bonvoy, Hilton Honors, IHG One Rewards, World of Hyatt). Stays, nights, and points accumulate normally.

## Universal Codes (No Company ID Needed)

- **AAA** — American Automobile Association, 5-15% off, works at all major chains
- **AARP** — Senior rate (62+ at most chains, 65+ at Hilton)
- **MEB** — Marriott eBreaks, 20% off weekend stays in North America
- **GOV** — US Government per diem rate (requires government ID)

## Contributing

Found a new code? Used a code and want to share your experience? Visit [hotelcorporatecodes.com](https://hotelcorporatecodes.com) and tell our AI Travel Advisor — your feedback gets added to the database.

## Related Projects

- [Real Address Generator](https://realaddressgenerator.online) — Generate real addresses for 22+ countries
- [I-Lang Protocol](https://ilang.ai) — AI-native communication standard

## Disclaimer

Hotel corporate codes are compiled from publicly available sources and user contributions. Codes may expire or change without notice. Users are responsible for verifying their eligibility. We do not encourage fraudulent use of corporate codes.

## License

MIT
