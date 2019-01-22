import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { BigNumber } from "utils/create-big-number";

import TradingForm from "modules/trading/components/trading--form/trading--form";
import TradingConfirm from "modules/trading/components/trading--confirm/trading--confirm";
import { Close } from "modules/common/components/icons";

import getValue from "utils/get-value";
import { isEqual, keys, pick } from "lodash";
// import { FindReact } from "utils/find-react";
import { SCALAR } from "modules/markets/constants/market-types";
import { BUY, SELL } from "modules/transactions/constants/types";
import Styles from "modules/trading/components/trading--wrapper/trading--wrapper.styles";

class TradingWrapper extends Component {
  static propTypes = {
    market: PropTypes.object.isRequired,
    isLogged: PropTypes.bool.isRequired,
    selectedOrderProperties: PropTypes.object.isRequired,
    availableFunds: PropTypes.instanceOf(BigNumber).isRequired,
    isMobile: PropTypes.bool.isRequired,
    toggleForm: PropTypes.func.isRequired,
    clearTradeInProgress: PropTypes.func.isRequired,
    selectedOutcome: PropTypes.object,
    updateSelectedOrderProperties: PropTypes.func.isRequired,
    handleFilledOnly: PropTypes.func.isRequired,
    gasPrice: PropTypes.number.isRequired,
    updateSelectedOutcome: PropTypes.func.isRequired,
    toggleMobileView: PropTypes.func.isRequired,
    updateTradeCost: PropTypes.func.isRequired,
    updateTradeShares: PropTypes.func.isRequired
  };

  static defaultProps = {
    selectedOutcome: null
  };

  constructor(props) {
    super(props);

    this.state = {
      updatedOrderValues: {
        orderPrice: props.selectedOrderProperties.price || "",
        orderQuantity: props.selectedOrderProperties.quantity || "",
        orderEthEstimate: "",
        selectedNav: props.selectedOrderProperties.selectedNav || BUY
      },
      doNotCreateOrders:
        props.selectedOrderProperties.doNotCreateOrders || false
    };

    this.updateState = this.updateState.bind(this);
    this.clearOrderForm = this.clearOrderForm.bind(this);
    this.updateTradeTotalCost = this.updateTradeTotalCost.bind(this);
    this.updateTradeNumShares = this.updateTradeNumShares.bind(this);
    this.updateOrderProperty = this.updateOrderProperty.bind(this);
  }

  componentWillReceiveProps(nextProps, nextState) {
    const { selectedOrderProperties } = this.props;

    if (
      this.props.selectedOutcome === null ||
      !(nextProps.selectedOutcome || {}).trade
    )
      return this.clearOrderForm();

    // Updates from chart clicks
    if (!isEqual(selectedOrderProperties, nextProps.selectedOrderProperties)) {
      this.updateState({
        updatedOrderValues: {
          event: "RECALCULATE_TRADE",
          ...nextProps.selectedOrderProperties,
          orderEthEstimate: ""
        }
      });
    }

    /*
    const {
      limitPrice,
      numShares,
      totalCost
    } = nextProps.selectedOutcome.trade;
    const { orderPrice, orderQuantity, orderEthEstimate } = this.state;


    if (
      limitPrice !== null &&
      orderPrice !== "" &&
      createBigNumber(limitPrice).eq(createBigNumber(orderPrice))
    ) {
      if (
        createBigNumber(numShares).eq(createBigNumber(orderQuantity || "0")) &&
        createBigNumber(orderEthEstimate || "0").eq(
          createBigNumber(totalCost.formattedValue)
        )
      )
        return;
      // calculating cost when numShares is ""
      let cost =
        orderEthEstimate &&
        createBigNumber(orderEthEstimate).eq(createBigNumber(totalCost.value))
          ? orderEthEstimate
          : totalCost.formattedValue;

      // calculating cost when numShares is filled in
      if (numShares !== orderQuantity) {
        cost = orderEthEstimate;
      }

      this.updateFormValues({
        orderPrice: limitPrice,
        orderQuantity: numShares,
        orderEthEstimate: cost
      });
    }
    */
  }

  // updates from form input
  updateState(stateValues, cb) {
    this.setState({ ...this.state, ...stateValues }, () => cb);
  }

  clearOrderForm() {
    const { clearTradeInProgress, market } = this.props;
    this.setState(
      {
        updatedOrderValues: {
          event: "CLEAR_ORDER_FORM",
          orderPrice: "",
          orderQuantity: "",
          orderEthEstimate: "",
          doNotCreateOrders: false
        }
      },
      () => {
        if (market.id) clearTradeInProgress(market.id);
      }
    );
  }

  updateOrderProperty(property) {
    const values = {
      updatedOrderValues: {
        ...this.state.updatedOrderValues,
        event: "UPDATE_PROPERTY",
        ...property
      }
    };
    this.updateState(values, () => {
      this.props.updateSelectedOrderProperties({
        ...pick(
          values.updatedOrderValues,
          keys(this.props.selectedOrderProperties)
        )
      });
    });
  }

  updateTradeTotalCost(order) {
    const { updateTradeCost, selectedOutcome, market } = this.props;
    updateTradeCost(
      market.id,
      selectedOutcome.id,
      {
        limitPrice: order.orderPrice,
        side: order.selectedNav,
        numShares: order.orderQuantity
      },
      (err, newOrder) => {
        if (err) return console.log(err); // what to do with error here

        console.log(newOrder);

        this.updateState({
          updatedOrderValues: {
            ...this.state.updatedOrderValues,
            ...order,
            event: "UPDATE_EST_ETH",
            orderEthEstimate: newOrder.totalCost.formattedValue
          }
        });
      }
    );
  }

  updateTradeNumShares(order) {
    const { updateTradeShares, selectedOutcome, market } = this.props;
    updateTradeShares(
      market.id,
      selectedOutcome.id,
      {
        limitPrice: order.orderPrice,
        side: order.selectedNav,
        maxCost: order.orderEthEstimate
      },
      (err, newOrder) => {
        if (err) return console.log(err); // what to do with error here

        console.log(newOrder);

        this.updateState({
          updatedOrderValues: {
            ...this.state.updatedOrderValues,
            ...order,
            event: "UPDATE_QUANTITY",
            orderQuantity: newOrder.totalCost.formattedValue.toString()
          }
        });
      }
    );
  }

  render() {
    const {
      availableFunds,
      isMobile,
      market,
      selectedOutcome,
      gasPrice,
      handleFilledOnly,
      updateSelectedOutcome,
      toggleMobileView
    } = this.props;
    const s = this.state;
    let { selectedNav } = s.updatedOrderValues;
    if (!selectedNav) {
      selectedNav = BUY;
    }

    return (
      <section className={Styles.TradingWrapper}>
        <div className={Styles.TradingWrapper__container}>
          <section className={Styles.TradingWrapper__darkbg}>
            {isMobile && (
              <span
                role="button"
                tabIndex="-1"
                onClick={toggleMobileView}
                className={Styles.TradingWrapper__close}
              >
                {Close}
              </span>
            )}
            <ul
              className={classNames({
                [Styles.TradingWrapper__header_buy]: selectedNav === BUY,
                [Styles.TradingWrapper__header_sell]: selectedNav === SELL
              })}
            >
              <li
                className={classNames({
                  [`${Styles.active_buy}`]: selectedNav === BUY
                })}
              >
                <button
                  onClick={() =>
                    this.updateOrderProperty({
                      event: "RECALCULATE_TRADE",
                      selectedNav: BUY
                    })
                  }
                >
                  <div>Buy Shares</div>
                  <span
                    className={classNames(Styles.TradingWrapper__underline__buy, {
                      [`${Styles.notActive}`]: selectedNav === SELL
                    })}
                  />
                </button>
              </li>
              <li
                className={classNames({
                  [`${Styles.active_sell}`]: selectedNav === SELL
                })}
              >
                <button
                  onClick={() =>
                    this.updateOrderProperty({
                      event: "RECALCULATE_TRADE",
                      selectedNav: SELL
                    })
                  }
                >
                  <div>Sell Shares</div>
                  <span
                    className={classNames(
                      Styles.TradingWrapper__underline__sell,
                      {
                        [`${Styles.notActive}`]: selectedNav === BUY
                      }
                    )}
                  />
                </button>
              </li>
            </ul>
          </section>
          {market.marketType === SCALAR && (
            <div className={Styles.TradingWrapper__scalar__line} />
          )}
          <TradingForm
            market={market}
            marketType={getValue(this.props, "market.marketType")}
            maxPrice={getValue(this.props, "market.maxPrice")}
            minPrice={getValue(this.props, "market.minPrice")}
            updatedOrderValues={s.updatedOrderValues}
            selectedNav={selectedNav}
            doNotCreateOrders={s.doNotCreateOrders}
            selectedOutcome={selectedOutcome}
            updateState={this.updateState}
            updateOrderProperty={this.updateOrderProperty}
            isMobile={isMobile}
            clearOrderForm={this.clearOrderForm}
            updateSelectedOutcome={updateSelectedOutcome}
            updateTradeTotalCost={this.updateTradeTotalCost}
            updateTradeNumShares={this.updateTradeNumShares}
          />
        </div>
        {selectedOutcome &&
          selectedOutcome.trade &&
          (selectedOutcome.trade.shareCost.value !== 0 ||
            selectedOutcome.trade.totalCost.value !== 0) && (
            <TradingConfirm
              numOutcomes={market.numOutcomes}
              marketType={getValue(this.props, "market.marketType")}
              maxPrice={getValue(this.props, "market.maxPrice")}
              minPrice={getValue(this.props, "market.minPrice")}
              trade={selectedOutcome.trade}
              isMobile={isMobile}
              gasPrice={gasPrice}
              availableFunds={availableFunds}
              selectedOutcome={selectedOutcome}
              scalarDenomination={market.scalarDenomination}
            />
          )}
        <div className={Styles.TradingWrapper__actions}>
          <button
            className={classNames(Styles["TradingWrapper__button--submit"], {
              [Styles.long]: selectedNav === BUY,
              [Styles.short]: selectedNav === SELL,
              [Styles.disabled]:
                !selectedOutcome ||
                (selectedOutcome && !selectedOutcome.trade.limitPrice)
            })}
            onClick={e => {
              e.preventDefault();
              market.onSubmitPlaceTrade(
                selectedOutcome.id,
                (err, tradeGroupID) => {
                  // onSent/onFailed CB
                  if (!err) {
                    this.clearOrderForm();
                  }
                },
                res => {
                  if (s.doNotCreateOrders && res.res !== res.sharesToFill)
                    handleFilledOnly(res.tradeInProgress);
                  // onComplete CB
                },
                s.doNotCreateOrders
              );
            }}
          >
            Place {selectedNav === BUY ? "Buy" : "Sell"} Order
          </button>
        </div>
      </section>
    );
  }
}

export default TradingWrapper;
