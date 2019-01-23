import { createBigNumber } from "utils/create-big-number";
import { SCALAR } from "modules/markets/constants/market-types";
import { BUY, SELL } from "modules/transactions/constants/types";

function findOrders(filledOrders, accountId, marketType, marketOutcomes, openOrders) {
  const orders = filledOrders.reduce(
    (
      order,
      {
        creator,
        orderId,
        outcome,
        amount,
        price,
        type,
        timestamp,
        transactionHash
      }
    ) => {
      const foundOrder = order.find(({ id }) => id === orderId);
      const amountBN = createBigNumber(amount);
      const priceBN = createBigNumber(price);
      let typeOp = type;
   

      const outcomeInfo =
        marketOutcomes &&
        marketOutcomes.find(
          outcomeValue => outcomeValue.id === outcome.toString()
        );

      let outcomeName =
        outcomeInfo && (outcomeInfo.description || outcomeInfo.name);
      if (marketType === SCALAR) {
        outcomeName = null;
      }

      const amountTotal = foundOrder && accountId === creator ? createBigNumber(foundOrder.amount).plus(amountBN) : amountBN;
      let originalQuantity = amountTotal;

      if (accountId === creator) {
        typeOp = type === BUY ? SELL : BUY; // marketTradingHistory is from filler perspective
        const matchingOpenOrder = openOrders.find(
           openOrder => openOrder.id === orderId
        );
        originalQuantity = matchingOpenOrder && matchingOpenOrder.unmatchedShares && createBigNumber(matchingOpenOrder.unmatchedShares.fullPrecision).plus(amountTotal) || amountTotal;
      }

      if (foundOrder && accountId === creator) {
        foundOrder.trades.push({
          outcome: outcomeName,
          amount: amountTotal,
          price: priceBN,
          type: typeOp,
          timestamp,
          transactionHash,
          originalQuantity: originalQuantity,
        });
       // foundOrder.originalQuantity = foundOrder.oringialQuantity.plus(amountTotal);
        foundOrder.trades.sort((a, b) => b.timestamp - a.timestamp);
        foundOrder.timestamp = foundOrder.trades[0].timestamp;
      } else {
        order.push({
          id: orderId,
          timestamp,
          outcome: outcomeName,
          type: typeOp,
          price: priceBN,
          amount: amountTotal,
          originalQuantity: originalQuantity,
          trades: [
            {
              outcome: outcomeName,
              amount: amountTotal,
              price: priceBN,
              type: typeOp,
              timestamp,
              transactionHash
            }
          ]
        });
      }
      return order;
    },
    []
  );

  return orders;
}
export function selectFilledOrders(
  marketTradeHistory,
  accountId,
  marketType,
  marketOutcomes,
  openOrders
) {
  if (!marketTradeHistory || marketTradeHistory.length < 1) {
    return [];
  }

  const filledOrders = marketTradeHistory.filter(
    trade => trade.creator === accountId || trade.filler === accountId
  );

  const orders = findOrders(
    filledOrders,
    accountId,
    marketType,
    marketOutcomes,
    openOrders
  );
  orders.sort((a, b) => b.timestamp - a.timestamp);
  return orders;
}
