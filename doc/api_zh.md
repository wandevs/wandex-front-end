# wandex api 文档
[English Version](https://github.com/wandevs/dex-front-end/blob/master/doc/api.md)

我们提供了 http和websocket两种方式调用api服务

HTTP服务地址：

主网 API server: https://wandex.org/api

测试网 API server: https://demodex.wandev.org:43001

WebSocket服务地址:

主网 WebSocket server: wss://wandex.org/ws

测试网 WebSocket server: wss://demodex.wandev.org:43002

## https
| 序号 | 动作 | URL | 说明 | 
| :------------ | :------------ | :------------ | :------------ |
| 1  | GET  | /markets  |  已废弃，请使用/operatormarkets/:operatorID， 获取交易市场列表 |
| 2  | GET |  /markets/:marketID/orderbook | 获取id为marketID的市场的订单簿  |
| 3  | GET  | /markets/:marketID/trades  | 获取id为marketID的市场的所有已匹配的交易列表  |
| 4 | GET | /markets/:marketID/trades/mine | 获取自己在id为marketID的市场的已匹配交易列表 |
| 5 | GET | /markets/:marketID/candles | 获取id为marketID的市场的蜡烛图数据(请求中指定交易起止时间，时间间隔最大200s，超过200s的以终止时间向前计算开始时间) |
| 6 |  GET | /fees | 预估某市场订单的手续费 |
| 7 |GET | /orders |获取等待成交的订单列表 |
| 8 | GET | /orders/:orderID | 获取指定ID的订单信息 |
| 9 | POST | /orders/build | 构造新订单，服务器返回订单ID，用户需要在60s内完成签名才能成功创建订单|
|10|POST|/orders|创建订单，其中订单id为请求/orders/build 返回的订单id。|
|11|DELETE|/orders/:orderID|取消一个订单|
|12|GET|/account/lockedBalances|获取帐号所有代币的锁定额度|
|13|GET|/operatormarkets/:operatorID|获取某运营商支持的所有市场|
|14|GET|/otherorders |获取用户非等待成交状态的订单|

### 接口用法
异常，一般返回：
```
{
  "status":-1,
  "desc":"something wrong"
}
```
有些接口需要请求header中，带授权字段，格式一般如下：
```
Hydro-Authentication： "地址" + "#HYDRO-AUTHENTICATION#" + "签名"
```
或
```
Hydro-Authentication： "地址" + "#HYDRO-AUTHENTICATION"+ "@" + "时间" + "#" "签名"
```
例如：
```
"Hydro-Authentication":"0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62#HYDRO-AUTHENTICATION#0x5c7071627ac79b7e224791029c0ea3545cfb7be77479416e37144deb9572d58b1d47eae55b146b5908d395a14233cb36e01eceec767f4f2e31c941f5836b59801c"
```
1. /markets，http GET方法，直接访问即可

（此接口已弃用，请使用/operatormarkets/:operatorID 接口，用法与此接口一致）

比如：访问 [https://demodex.wandevs.org:43001/markets](https://demodex.wandevs.org:43001/markets)

返回：
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
2. /markets/:marketID/orderbook, GET方法，获取市场上的挂单,直接访问即可
例如：[https://demodex.wandevs.org:43001/markets/RVX-WWAN/orderbook](https://demodex.wandevs.org:43001/markets/RVX-WWAN/orderbook)
成功返回：
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
3. /markets/:marketID/trades GET方法，获取已成交交易
例如：[https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades](https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades)
成功返回：
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
4. /markets/:marketID/trades/mine GET方法，获取自己在marketID下的交易，header中需要授权头
例如：
[https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades/mine](https://demodex.wandevs.org:43001/markets/RVX-WWAN/trades/mine)
其中header中带上
```
"Hydro-Authentication":"0xdb9ff5992f81bedd5a0baf462566fe72f3e95a62#HYDRO-AUTHENTICATION#0x5c7071627ac79b7e224791029c0ea3545cfb7be77479416e37144deb9572d58b1d47eae55b146b5908d395a14233cb36e01eceec767f4f2e31c941f5836b59801c"
```
成功返回：
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
5. /markets/:marketID/candles，GET方法，
必须参数:
```
from: 时间戳秒
to: 时间戳秒
granularity: 时间间隔秒
```
例如：[https://demodex.wandevs.org:43001/markets/WLRC-WWAN/candles?from=1545537484&to=1577073484&granularity=86400](https://demodex.wandevs.org:43001/markets/WLRC-WWAN/candles?from=1545537484&to=1577073484&granularity=86400)
成功返回：
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
6. /fees GET方法，获取某运营商的某市场的费率,
必须参数：
```
price:价格
amount:数量
marketID:市场ID
operatorID:运营商ID
```
例如：[https://demodex.wandevs.org:43001/fees?price=140&amount=100&marketID=RVX-WWAN&OperatorID=1](https://demodex.wandevs.org:43001/fees?price=140&amount=100&marketID=RVX-WWAN&OperatorID=1)
成功返回：
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
7. /orders，GET方法，获取一页自己的等待成交的订单，请求header中，需要授权头字段
参数：
```
marketID:市场ID
page：第几页（默认第一页）
status: 默认获取未成交状态的订单
PerPage:页的大小(默认20)
```
例如：[https://demodex.wandevs.org:43001/orders?marketID=RVX-WWAN](https://demodex.wandevs.org:43001/orders?marketID=RVX-WWAN)
成功返回：
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
8. /otherorders ，GET方法，默认获取非等待成交状态的订单，请求header中，需要授权头字段，用法同上
9. /orders/nostatus，获取一页全部订单，请求header中，需要授权头字段，用法同上
10. /orders/:orderID, 获取某个订单的信息，请求header中，需要授权头字段，
例如：[https://demodex.wandevs.org:43001/orders/0xe8b3bbba130184100e3b5aa5236be142008a041d3119aec0b1c4306fbd83aaaf](https://demodex.wandevs.org:43001/orders/0xe8b3bbba130184100e3b5aa5236be142008a041d3119aec0b1c4306fbd83aaaf)
成功返回：
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
11. /orders/build, POST方法，构造订单，返回订单id（在创建订单的时候会用到POST /orders接口有说明），请求header中，需要授权头字段
请求体：
```
{
  "amount": "0.01", (数量)
  "price": "0.44", (价格)
  "side": "buy" 或者 "sell",
  "expires": 31536000000,
  "orderType": "limit"(限价单) 或者 "market"(市价单),
  "marketID": "RVX-WWAN",
  "operatorID": 1 (运营商ID)
}
```
例如：[https://demodex.wandevs.org:43001/orders/build](https://demodex.wandevs.org:43001/orders/build)
请求体：
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
成功返回:
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
12. /orders，POST方法，创建订单，需要给出/orders/build成功后，收到的Order的id，并签名，请求header中，需要授权头字段
请求体：
```
  "orderID": 从/orders/build获得的order的id
  "signature": (以太坊签名[64] + 27，并补奇到32位) + 以太坊签名[0~63]
```
例如：[https://demodex.wandevs.org:43001/orders](https://demodex.wandevs.org:43001/orders)
请求体：
```
{
  "orderID": "0xfa74a3902d56ce2cfade530a988de78343a06378f29a1b57cd2afe96fb585b1c",
  "signature": "0x1b00000000000000000000000000000000000000000000000000000000000000360259b3803a1c0c0cbf8e593946197f5248921199216ecb18c65b1f8653eef369780c1a35e1462ea1f87e922726ff8277d433057abbe8b78eea23e51203f2ec"
}
```
成功返回：
```
{"status":0,"desc":"success"}
```
13. /orders/:orderID, DELETE方法，请求header中，需要授权头字段
例如：[https://demodex.wandevs.org:43001/orders/0xfa74a3902d56ce2cfade530a988de78343a06378f29a1b57cd2afe96fb585b1c](https://demodex.wandevs.org:43001/orders/0xfa74a3902d56ce2cfade530a988de78343a06378f29a1b57cd2afe96fb585b1c)
成功返回：
```
{"status":0,"desc":"success"}
```
14. /operatormarkets/1 获取id为1的运营商支持的市场，用法同/markets，返回某个运营商支持的市场

## ws

|   序号 |  类型  | 说明  |
| :------------ | :------------ | :------------ |
| 1  | level2OrderbookSnapshot  | OrderBook初次快照获得  |
| 2  | level2OrderbookUpdate  | OrderBook更新  |
|  3 |  orderChange |  订单修改 |
| 4  | lockedBalanceChange  |  锁定金额变化 |
| 5  | tradeChange  | 交易变化  |
|  6 | newMarketTrade  | 新的市场交易  |
|  7 | candle  | 实时k线图  |

用法：

例如：

发送下面消息完成实时k线图注册：
```
{
    "type": "subscribe",
    "channels": ["Candle#WBTC-WUSDT#1d"]
}
```
参数内容为：Candle#交易对#分辨率

其中分辨率目前仅支持：5m, 1h, 1d 三种可选项

当有新交易完成时，会实时推送最新的k线图结果：
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



