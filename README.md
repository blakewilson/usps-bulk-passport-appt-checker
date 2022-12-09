# USPS Bulk Passport Appointment Checker

This script looks for nearby USPS passport locations and gathers all available appointments before a given date.

## Usage

### Config

You must first set the `ZIP_CODE` and `NOTIFY_BEFORE_DATE`. The rest of the config is optional.

- `ZIP_CODE` (required): 5 digit zip code. The basis for where you'd like to search for appointments.
- `NOTIFY_BEFORE_DATE` (required): Collect all appointments before this date. Format: 2022/12/31
- `RADIUS`: The mile radius around the `ZIP_CODE` to look for locations. Defaults to `20`.
- `NUM_ADULTS`: The number of adults for the passport appointment. Defaults to `1`.
- `NUM_MINORS`: The number of minors for the passport appointment. Defaults to `0`

Config values can be set like:

```bash
export ZIP_CODE=78701
```

### Run the script

```bash
node script.mjs
```

## Requirements

This script requires Node 18+ (top level await, fetch api)
