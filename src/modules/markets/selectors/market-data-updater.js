import memoizerific from 'memoizerific';
import store from '../../../store';
import { loadFullMarket } from '../../market/actions/load-full-market';

const UPDATE_INTERVAL_SECS = 15;

export default function () {
	return {
		updateIntervalSecs: UPDATE_INTERVAL_SECS,
		update: getUpdate(store.dispatch)
	};
}

const getUpdate = memoizerific(1)((dispatch) =>
	(marketId) => {
		dispatch(loadFullMarket(marketId));
	}
);
