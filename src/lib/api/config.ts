/** Base URL of the `rebalancer-api` backend (see
 * `../../../backend/README.md`'s "Running the API" section). Only the
 * sub-portfolios feature needs this - the legacy single-vault `/app`
 * dashboard reads the contract directly and needs no backend at all. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
