import memoizerific from 'memoizerific';
import { isMarketDataOpen } from '../../../utils/is-market-data-open';
// import { makeDateFromBlock } from '../../../utils/format-number';

import store from '../../../store';

import { assembleMarket } from '../../market/selectors/market';

export default function () {
	const { marketsData, favorites, reports, outcomesData, accountTrades, tradesInProgress, blockchain, selectedSort, priceHistory, marketOrderBooks } = store.getState();
	return selectMarkets(marketsData, favorites, reports, outcomesData, accountTrades, tradesInProgress, blockchain, selectedSort, priceHistory, marketOrderBooks, store.dispatch);
}

export const selectMarkets = memoizerific(1)((marketsData, favorites, reports, outcomesData, accountTrades, tradesInProgress, blockchain, selectedSort, priceHistory, marketOrderBooks, dispatch) => {
	if (!marketsData) {
		return [];
	}

	return Object.keys(marketsData).map(marketID => {
		if (!marketID || !marketsData[marketID]) {
			return {};
		}

		const endDate = new Date((marketsData[marketID].endDate * 1000) || 0);
		const branchReports = reports[marketsData[marketID].branchId];

		return assembleMarket(
			marketID,
			marketsData[marketID],
			priceHistory[marketID],
			isMarketDataOpen(marketsData[marketID]),

			!!favorites[marketID],
			outcomesData[marketID],

			(branchReports) ? branchReports[marketsData[marketID].eventID] : undefined,
			(accountTrades || {})[marketID],
			tradesInProgress[marketID],

			// the reason we pass in the date parts broken up like this, is because date objects are never equal, thereby always triggering re-assembly, and never hitting the memoization cache
			endDate.getFullYear(),
			endDate.getMonth(),
			endDate.getDate(),
			blockchain && blockchain.isReportConfirmationPhase,
			marketOrderBooks[marketID],
			dispatch);

	}).sort((a, b) => {
		const aVal = cleanSortVal(a[selectedSort.prop]);
		const bVal = cleanSortVal(b[selectedSort.prop]);

		if (bVal < aVal) {
			return selectedSort.isDesc ? -1 : 1;
		} else if (bVal > aVal) {
			return selectedSort.isDesc ? 1 : -1;
		}
		return a.id < b.id ? -1 : 1;
	});
});

function cleanSortVal(val) {
	// if a falsy simple value return it to sort as-is
	if (!val) {
		return val;
	}

	// if this is a formatted number object, with a `value` prop, use that for sorting
	if (val.value || val.value === 0) {
		return val.value;
	}

	// if the val is a string, lowercase it
	if (val.toLowerCase) {
		return val.toLowerCase();
	}

	// otherwise the val is probably a number, either way return it as-is
	return val;
}
