import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import MarketHeader from "modules/market/components/market-header/market-header";
import { ZERO } from "modules/trades/constants/numbers";
import { selectMarket } from "modules/markets/selectors/market";
import marketDisputeOutcomes from "modules/reports/selectors/select-market-dispute-outcomes";
import { sendFinalizeMarket } from "modules/markets/actions/finalize-market";
import { toggleFavorite } from "modules/markets/actions/update-favorites";

const mapStateToProps = (state, ownProps) => {
  const market = selectMarket(ownProps.marketId);
  const disputeOutcomes = marketDisputeOutcomes() || {};

  return {
    description: market.description || "",
    details: market.details || "",
    marketType: market.marketType,
    maxPrice: market.maxPrice || ZERO,
    minPrice: market.minPrice || ZERO,
    scalarDenomination: market.scalarDenomination,
    resolutionSource: market.resolutionSource,
    currentTime: (state.blockchain || {}).currentAugurTimestamp,
    tentativeWinner:
      disputeOutcomes[ownProps.marketId] &&
      disputeOutcomes[ownProps.marketId].find(o => o.tentativeWinning),
    isLogged: state.authStatus.isLogged,
    isForking: state.universe.isForking,
    isDesignatedReporter:
      market.designatedReporter === state.loginAccount.address,
    isMobileSmall: state.appStatus.isMobileSmall,
    market,
    isFavorite: !!state.favorites[ownProps.marketId]
  };
};

const mapDispatchToProps = dispatch => ({
  finalizeMarket: (marketId, cb) => dispatch(sendFinalizeMarket(marketId, cb)),
  toggleFavorite: marketId => dispatch(toggleFavorite(marketId))
});

const MarketHeaderContainer = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MarketHeader)
);

export default MarketHeaderContainer;
