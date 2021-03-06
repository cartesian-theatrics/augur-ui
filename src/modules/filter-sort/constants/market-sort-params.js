export const MARKET_VOLUME = "volume";
export const MARKET_CREATION_TIME = "creationTime";
export const MARKET_END_DATE = "endTime";
export const MARKET_RECENTLY_TRADED = "recentlyTraded";
export const MARKET_FEE = "marketFee";
export const MARKET_OPEN_INTEREST = "openInterest";
export const MARKET_LIQUIDITY_10 = "liquidity10";
export const MARKET_LIQUIDITY_15 = "liquidity15";
export const MARKET_LIQUIDITY_20 = "liquidity20";
export const MARKET_LIQUIDITY_100 = "liquidity100";

// The user should be able to sort by:

// Volume
// Recently Traded
// End Date (soonest first)
// Creation Date (most recent first)
// Fee (lowest first)
// The user should be able to filter by market state:

// Open (PRE_REPORTING)
// In Reporting (DESIGNATED_REPORTING, OPEN_REPORTING, CROWDSOURCING_DISPUTE, AWAITING_NEXT_WINDOW)
// Resolved (AWAITING_FINALIZATION, FINALIZED)
