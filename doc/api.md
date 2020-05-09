# wandex api document

[API文档中文版](https://github.com/wandevs/dex-front-end/blob/master/doc/api_zh.md)

We provide two ways to call our api : **https** and **websocket**

**HTTP API Server:**

mainnet API server: https://wandex.org/api

testnet API server: https://demodex.wandev.org:43001

**WebSocket API Server:**

mainnet API server: https://wandex.org/ws

testnet API server: https://demodex.wandev.org:43002

## https
| num | action | URL | description |
| :------------ | :------------ | :------------ | :------------ |
| 1  | GET  | /markets  |  Get market list |
| 2  | GET |  /markets/:marketID/orderbook | Get all orders for the market with id marketID  |
| 3  | GET  | /markets/:marketID/trades  | Get all transactions for the market with id marketID  |
| 4 | GET | /markets/:marketID/trades/mine | Get all transactions of mine for the market with id marketID |
| 5 | GET | /markets/:marketID/candles | Get all candle chart data for the market with id marketID |
| 6 |  GET | /fees | Estimate the cost of  the given order |
| 7 |GET | /orders | Get one page pending orders of one user |
| 8 | GET | /orders/:orderID | Get the order information with id  orderID of one user |
| 9 | POST | /orders/build | Build an order and api server will response  with the generated orderID of one user |
|10|POST|/orders| Create an new order with the orderID get from /orders/build of one user |
|11|DELETE|/orders/:orderID|Cancel the order with id orderID of one user |
|12|GET|/account/lockedBalances|Get the locked balances of one user |
|13|GET|/operatormarkets/:operatorID|Get the supported markets of the operator with id operatorID |
|14|GET|/otherorders | Get one page none pending orders of one user |

### API Details
Exceptions，normally returns:
```
{
  "status":-1,       //(-11,...)
  "desc":"something wrong"
}
```
Some interface need provide authorization, and the request header should have the authentication field like below:
```
Hydro-Authentication： address + "#HYDRO-AUTHENTICATION#" + signature
```
or
```
Hydro-Authentication： address + "#HYDRO-AUTHENTICATION"+ "@" + time + "#" + signature
```
e.g.：
```
"Hydro-Authentication":"0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62#HYDRO-AUTHENTICATION#0x5c7071627ac79b7e224791029c0ea3545cfb7be77479416e37144deb9572d58b1d47eae55b146b5908d395a14233cb36e01eceec767f4f2e31c941f5836b59801c"
```
1. /markets, Deprecated -- maybe unsurpported in the future, http GET method. Get all markets from server database. Please use /operatormarkets/:operatorID instead.
e.g. : [https://demodex.wandevs.org:43001/markets](https://demodex.wandevs.org:43001/markets)
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "markets": [
      {
        "id": "WETH-WBTC",
        "baseToken": "WETH",
        "baseTokenProjectUrl": "",
        "baseTokenName": "Wanchain Ethereum Crosschain Token",
        "baseTokenDecimals": 18,
        "baseTokenAddress": "0x46397994a7e1e926ea0de95557a4806d38f10b0d",
        "quoteToken": "WBTC",
        "quoteTokenDecimals": 8,
        "quoteTokenAddress": "0x89a3e1494bc3db81dadc893ded7476d33d47dcbd",
        "minOrderSize": "0.00000001",
        "pricePrecision": 18,
        "priceDecimals": 6,
        "amountDecimals": 2,
        "asMakerFeeRate": "0.0001",
        "asTakerFeeRate": "0.0001",
        "gasFeeAmount": "0",
        "supportedOrderTypes": [
          "limit",
          "market"
        ],
        "marketOrderMaxSlippage": "0.1",
        "lastPriceIncrease": "0",
        "lastPrice": "0",
        "price24h": "0",
        "amount24h": "0",
        "quoteTokenVolume24h": "0"
      }
    ]
  }
}
```
2. /markets/:marketID/orderbook, http GET method, Get all orderbook for the market with id marketID
e.g. : [https://demodex.wandevs.org:43001/markets/RVX-WWAN/orderbook](https://demodex.wandevs.org:43001/markets/RVX-WWAN/orderbook)
If success returns :
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "orderBook": {
      "sequence": 44,
      "bids": [
        [
          "0.44",
          "0.05"
        ],
        [
          "0.43",
          "0.09"
        ]
        [
          "0.42",
          "20.1213"
        ],
        [
          "0.41",
          "20.4209"
        ],
      ],
      "asks": [
        [
          "0.45",
          "19.7761"
        ],
        [
          "0.46",
          "19.5352"
        ],
        [
          "0.48",
          "19.2487"
        ],
        [
          "0.49",
          "18.9663"
        ]
      ]
    }
  }
}
```
3. /markets/:marketID/trades, http GET method, get all finished transactions
e.g. : [https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades](https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades)
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "count": 5,
    "trades": [
      {
        "id": 635,
        "transactionID": 194,
        "transactionHash": "0x87a461a4d310fa3b5d5d850f1c695d9d5aeff86c6e86107d31c59a3cdff14eef",
        "status": "successful",
        "marketID": "RVX-WWAN",
        "maker": "0xe27b7945135af0cb1ab55948d2d3a179203f5f65",
        "taker": "0x36d7caa6628d69584fa71d7aed07e4c000d0c7ab",
        "takerSide": "buy",
        "makerOrderID": "0x2dd7b9b9a24ca2381bb0d761b874a9cd870f6fdbdd8cf980d1d05e4b7522a922",
        "takerOrderID": "0x6e861e75b07cf6307a2e6db71675ab3b4b9746bff069a2f3936ab1bf202d948d",
        "sequence": 0,
        "amount": "0.01",
        "price": "0.45",
        "executedAt": "2019-12-20T06:22:20Z",
        "createdAt": "2019-12-20T06:22:11.522777Z",
        "updatedAt": "2019-12-20T06:22:21.815Z"
      },
      {
        "id": 634,
        "transactionID": 193,
        "transactionHash": "0x77c3a157c6a6df92ddece1d5666fbf6c34526b9401d5eef25b16e01b94e2c81b",
        "status": "successful",
        "marketID": "RVX-WWAN",
        "maker": "0xe27b7945135af0cb1ab55948d2d3a179203f5f65",
        "taker": "0x36d7caa6628d69584fa71d7aed07e4c000d0c7ab",
        "takerSide": "buy",
        "makerOrderID": "0x2dd7b9b9a24ca2381bb0d761b874a9cd870f6fdbdd8cf980d1d05e4b7522a922",
        "takerOrderID": "0xc6f412114cfa36544d586ffcd12f592ac7f1e877a1c99aeb17245cb8f595c745",
        "sequence": 0,
        "amount": "0.01",
        "price": "0.45",
        "executedAt": "2019-12-20T06:22:20Z",
        "createdAt": "2019-12-20T06:22:10.492331Z",
        "updatedAt": "2019-12-20T06:22:21.781Z"
      },
      {
        "id": 633,
        "transactionID": 192,
        "transactionHash": "0xec7edb5af53bb6368ac915b3cc3a33f4fb3dfa02899127260c124d09f4522069",
        "status": "successful",
        "marketID": "RVX-WWAN",
        "maker": "0xe27b7945135af0cb1ab55948d2d3a179203f5f65",
        "taker": "0x36d7caa6628d69584fa71d7aed07e4c000d0c7ab",
        "takerSide": "buy",
        "makerOrderID": "0x2dd7b9b9a24ca2381bb0d761b874a9cd870f6fdbdd8cf980d1d05e4b7522a922",
        "takerOrderID": "0xacf9bcbc64aa4cab6798a55bc905c894c8bac675f8f2361f29d5e9088399eb2d",
        "sequence": 0,
        "amount": "0.01",
        "price": "0.45",
        "executedAt": "2019-12-20T06:22:20Z",
        "createdAt": "2019-12-20T06:22:09.579061Z",
        "updatedAt": "2019-12-20T06:22:21.746Z"
      },
      {
        "id": 632,
        "transactionID": 191,
        "transactionHash": "0x5d07cb7799bc1ead0437a737287cb2d3019f41e52040038e71e74a93a154c897",
        "status": "successful",
        "marketID": "RVX-WWAN",
        "maker": "0xe27b7945135af0cb1ab55948d2d3a179203f5f65",
        "taker": "0x36d7caa6628d69584fa71d7aed07e4c000d0c7ab",
        "takerSide": "buy",
        "makerOrderID": "0x2dd7b9b9a24ca2381bb0d761b874a9cd870f6fdbdd8cf980d1d05e4b7522a922",
        "takerOrderID": "0xf8bef88b3e5591bdd1b98481b0e2b369527a6e287f0fa8e29bb9e02dc7ac2066",
        "sequence": 0,
        "amount": "0.01",
        "price": "0.45",
        "executedAt": "2019-12-20T06:22:10Z",
        "createdAt": "2019-12-20T06:22:08.677936Z",
        "updatedAt": "2019-12-20T06:22:12.784Z"
      },
      {
        "id": 631,
        "transactionID": 190,
        "transactionHash": "0x70a00221ec871355bb0f5fe68fa7b7e5330449889b104470b611dfa7c3954287",
        "status": "successful",
        "marketID": "RVX-WWAN",
        "maker": "0xe27b7945135af0cb1ab55948d2d3a179203f5f65",
        "taker": "0x36d7caa6628d69584fa71d7aed07e4c000d0c7ab",
        "takerSide": "buy",
        "makerOrderID": "0x2dd7b9b9a24ca2381bb0d761b874a9cd870f6fdbdd8cf980d1d05e4b7522a922",
        "takerOrderID": "0x2a41befd4f154af89e97a6b546406891f24f1db2c19fd6339180a2128ed7f17a",
        "sequence": 0,
        "amount": "0.01",
        "price": "0.45",
        "executedAt": "2019-12-20T06:22:10Z",
        "createdAt": "2019-12-20T06:22:07.929727Z",
        "updatedAt": "2019-12-20T06:22:12.76Z"
      }
    ]
  }
}
```
4. /markets/:marketID/trades/mine, http GET method, Get one's transactions of the market with id marketID, should given the authentication field in the request header
e.g.:
[https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades/mine](https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades/mine)
In the request header
```
"Hydro-Authentication":"0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62#HYDRO-AUTHENTICATION#0x5c7071627ac79b7e224791029c0ea3545cfb7be77479416e37144deb9572d58b1d47eae55b146b5908d395a14233cb36e01eceec767f4f2e31c941f5836b59801c"
```
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "order": {
      "id": "0x19d913a4a0ecf77a508b95abfa13d9dd7a5903e5af7071f38fe2be55b2730639",
      "marketID": "RVX-WWAN",
      "side": "buy",
      "type": "limit",
      "price": "0.45",
      "amount": "0.01",
      "json": {
        "trader": "0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62",
        "relayer": "0x93388b4efe13b9b18ed480783c05462409851547",
        "baseTokenAmount": "10000000000000000",
        "quoteTokenAmount": "4500000000000000",
        "baseToken": "0xe12ca561a272c6ebf62fac7ea95dc9496e924e63",
        "quoteToken": "0x916283cc60fdaf05069796466af164876e35d21f",
        "gasTokenAmount": "0",
        "signature": "",
        "data": "0x020000119f853b7000c8012c00007ad5db94a4a13f8400000000000000000000"
      },
      "asMakerFeeRate": "0.002",
      "asTakerFeeRate": "0.003",
      "makerRebateRate": "0",
      "gasFeeAmount": "0",
      "operatorID": 0
    }
  }
}
```
5. /markets/:marketID/candles, http GET method, Get all candle chart data for the market with id marketID
Required params:
```
from: timestep in seconds
to: timestep in seconds
granularity: time interval in seconds
```
e.g: [https://demodex.wandevs.org:43001/markets/WLRC-WWAN/candles?from=1545537484&to=1577073484&granularity=86400](https://demodex.wandevs.org:43001/markets/WLRC-WWAN/candles?from=1545537484&to=1577073484&granularity=86400)
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "candles": [
      {
        "time": 1574294400,
        "open": "0.1437",
        "close": "0.1439",
        "low": "0.1436",
        "high": "0.1439",
        "volume": "9"
      },
      {
        "time": 1574640000,
        "open": "0.1435",
        "close": "0.1432",
        "low": "0.001",
        "high": "0.144",
        "volume": "8004"
      }
    ]
  }
}
```
6. /fees,  http GET method,  Estimate the cost of  the given order,
Required params:
```
price
amount
marketID
operatorID : one operator's ID
```
e.g.：[https://demodex.wandevs.org:43001/fees?price=140&amount=100&marketID=RVX-WWAN&OperatorID=1](https://demodex.wandevs.org:43001/fees?price=140&amount=100&marketID=RVX-WWAN&OperatorID=1)
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "fees": {
      "gasFeeAmount": "0",
      "asMakerTotalFeeAmount": "28",
      "asMakerTradeFeeAmount": "28",
      "asMakerFeeRate": "0.002",
      "asTakerTotalFeeAmount": "42",
      "asTakerTradeFeeAmount": "42",
      "asTakerFeeRate": "0.003"
    }
  }
}
```
7. /orders, http GET method, Get one page pending orders of one user, should given the authentication field in the request header
Required params:
```
marketID: market id
page: page number
status: default is "pending"
PerPage:page size(default is 20)
```
e.g.[https://demodex.wandevs.org:43001/orders?marketID=RVX-WWAN](https://demodex.wandevs.org:43001/orders?marketID=RVX-WWAN)
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "count": 1,
    "orders": [
      {
        "id": "0xe8b3bbba130184100e3b5aa5236be142008a041d3119aec0b1c4306fbd83aaaf",
        "traderAddress": "0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62",
        "marketID": "RVX-WWAN",
        "side": "buy",
        "price": "0.44",
        "amount": "0.01",
        "status": "pending",
        "type": "limit",
        "version": "hydro-v1",
        "availableAmount": "0.01",
        "confirmedAmount": "0",
        "canceledAmount": "0",
        "pendingAmount": "0",
        "makerFeeRate": "0.002",
        "takerFeeRate": "0.003",
        "makerRebateRate": "0",
        "gasFeeAmount": "0",
        "json": "{\"trader\":\"0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62\",\"relayer\":\"0x93388b4efe13b9b18ed480783c05462409851547\",\"baseTokenAmount\":\"10000000000000000\",\"quoteTokenAmount\":\"4400000000000000\",\"baseToken\":\"0xe12ca561a272c6ebf62fac7ea95dc9496e924e63\",\"quoteToken\":\"0x916283cc60fdaf05069796466af164876e35d21f\",\"gasTokenAmount\":\"0\",\"signature\":\"0x1c00000000000000000000000000000000000000000000000000000000000000f9d4e9e71f32e4b9baab8c3b853293c827fc85a4caf9acb6098d7617e8c55ace78813d07edc0ba3bc069a46868ee7693b0679b5844b51dae2c0619df05f3c712\",\"data\":\"0x020000119f86a89000c8012c000006ad5142e81ca05d00000000000000000000\"}",
        "createdAt": "2019-12-23T05:11:38.156896Z",
        "updatedAt": "2019-12-23T05:11:38.161Z"
      }
    ]
  }
}
```
8. /otherorders, http GET method, Get one page none pending orders of one user, should given the authentication field in the request header, usage same as above
9. /orders/nostatus, Deprecated, unsurpported in the future, Get all orders of one user, should given the authentication field in the request header, usage same as above
10. /orders/:orderID, Get the order information with id  orderID of one user, should given the authentication field in the request header,
e.g. : [https://demodex.wandevs.org:43001/orders/0xe8b3bbba130184100e3b5aa5236be142008a041d3119aec0b1c4306fbd83aaaf](https://demodex.wandevs.org:43001/orders/0xe8b3bbba130184100e3b5aa5236be142008a041d3119aec0b1c4306fbd83aaaf)
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "order": {
      "id": "0xe8b3bbba130184100e3b5aa5236be142008a041d3119aec0b1c4306fbd83aaaf",
      "traderAddress": "0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62",
      "marketID": "RVX-WWAN",
      "side": "buy",
      "price": "0.44",
      "amount": "0.01",
      "status": "pending",
      "type": "limit",
      "version": "hydro-v1",
      "availableAmount": "0.01",
      "confirmedAmount": "0",
      "canceledAmount": "0",
      "pendingAmount": "0",
      "makerFeeRate": "0.002",
      "takerFeeRate": "0.003",
      "makerRebateRate": "0",
      "gasFeeAmount": "0",
      "json": "{\"trader\":\"0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62\",\"relayer\":\"0x93388b4efe13b9b18ed480783c05462409851547\",\"baseTokenAmount\":\"10000000000000000\",\"quoteTokenAmount\":\"4400000000000000\",\"baseToken\":\"0xe12ca561a272c6ebf62fac7ea95dc9496e924e63\",\"quoteToken\":\"0x916283cc60fdaf05069796466af164876e35d21f\",\"gasTokenAmount\":\"0\",\"signature\":\"0x1c00000000000000000000000000000000000000000000000000000000000000f9d4e9e71f32e4b9baab8c3b853293c827fc85a4caf9acb6098d7617e8c55ace78813d07edc0ba3bc069a46868ee7693b0679b5844b51dae2c0619df05f3c712\",\"data\":\"0x020000119f86a89000c8012c000006ad5142e81ca05d00000000000000000000\"}",
      "createdAt": "2019-12-23T05:11:38.156896Z",
      "updatedAt": "2019-12-23T05:11:38.161Z"
    }
  }
}
```
11. /orders/build, http POST method. Build order, Build an order and api server will response  with the generated orderID of one user, should given the authentication field in the request header
Request payload:
```
{
  "amount": "0.01",
  "price": "0.44",
  "side": "buy" or "sell",
  "expires": 31536000000,
  "orderType": "limit" or "market",
  "marketID": "RVX-WWAN",
  "operatorID": 1
}
```
e.g. : [https://demodex.wandevs.org:43001/orders/build](https://demodex.wandevs.org:43001/orders/build)
r
```
{
  "amount": "0.01",
  "price": "0.44",
  "side": "buy",
  "expires": 31536000000,
  "orderType": "limit",
  "marketID": "RVX-WWAN",
  "operatorID": 1
}
```
If success returns:
```
{
  "status": 0,
  "desc": "success",
  "data": {
    "order": {
      "id": "0xc8367249a4d68ce3f61c172c85b0e936c99c5329bbb2128860f871524f692054",
      "marketID": "RVX-WWAN",
      "side": "buy",
      "type": "limit",
      "price": "0.44",
      "amount": "0.01",
      "json": {
        "trader": "0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62",
        "relayer": "0x93388b4efe13b9b18ed480783c05462409851547",
        "baseTokenAmount": "10000000000000000",
        "quoteTokenAmount": "4400000000000000",
        "baseToken": "0xe12ca561a272c6ebf62fac7ea95dc9496e924e63",
        "quoteToken": "0x916283cc60fdaf05069796466af164876e35d21f",
        "gasTokenAmount": "0",
        "signature": "",
        "data": "0x020000119f87a4e000c8012c0000693dc85f4dda068300000000000000000000"
      },
      "asMakerFeeRate": "0.002",
      "asTakerFeeRate": "0.003",
      "makerRebateRate": "0",
      "gasFeeAmount": "0",
      "operatorID": 0
    }
  }
}
```
12. /orders, http POST method, create order, need id received from /orders/build, and then signate it with eth_signature method, should given the authentication field in the request header
Request payload:
```
  "orderID": Responsed from server interface /orders/build
  "signature": (eth_signature[64]+27，padded to 32 Bytes) + eth_signature[0~63]
```
e.g. : [https://demodex.wandevs.org:43001/orders](https://demodex.wandevs.org:43001/orders)
Request payload:
```
{
  "orderID": "0xfa74a3902d56ce2cfade530a988de78343a06378f29a1b57cd2afe96fb585b1c",
  "signature": "0x1b00000000000000000000000000000000000000000000000000000000000000360259b3803a1c0c0cbf8e593946197f5248921199216ecb18c65b1f8653eef369780c1a35e1462ea1f87e922726ff8277d433057abbe8b78eea23e51203f2ec"
}
```
If success returns:
```
{"status":0,"desc":"success"}
```
13. /orders/:orderID, http DELETE method, should given the authentication field in the request header
e.g. : [https://demodex.wandevs.org:43001/orders/0xfa74a3902d56ce2cfade530a988de78343a06378f29a1b57cd2afe96fb585b1c](https://demodex.wandevs.org:43001/orders/0xfa74a3902d56ce2cfade530a988de78343a06378f29a1b57cd2afe96fb585b1c)
If success returns:
```
{"status":0,"desc":"success"}
```
14. /operatormarkets/1 Get the supported markets of the operator with id operatorID

## ws

|   number |  type  | description  |
| :------------ | :------------ | :------------ |
| 1  | level2OrderbookSnapshot  | get from OrderBook first snap  |
| 2  | level2OrderbookUpdate  | OrderBook update  |
|  3 |  orderChange |  order changed |
| 4  | lockedBalanceChange  |  when locked balance been changed |
| 5  | tradeChange  | trade status changed |
|  6 | newMarketTrade  | new market trade changed  |
|  7 | candle  | real-time K line  |

Usage:

Such as:

Send the following message to complete the real-time k-chart registration:

```
{
    "type": "subscribe",
    "channels": ["Candle#WBTC-WUSDT#1d"]
}
```
Parameter content is: Candle# trading on # resolution

The resolution currently only supports: 5m, 1h and 1d options

When a new transaction is completed, the latest k-chart results will be pushed in real time:

```
{
  "type": "candle",
  "bar": {
    "time": 1588982400,
    "open": "7733.37",
    "close": "9651.37",
    "low": "7733.37",
    "high": "9667.67",
    "volume": "22.4537"
  }
}
```
