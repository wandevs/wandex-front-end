# Wan DEX introduction

[（WanDex介绍中文版）](./wan-dex-introduction-zh.md)

WanDex is a decentralized exchange framework developed by Wanchain community based on the principle of off chain matching and on chain settlement.

It provides a consumption venue for Wanchain's cross-chain assets, the world's first cross-chain DEX platform.

Support for cross-chain transactions in multiple major currencies, such as BTC, ETH, EOS, and various ERC20 standard tokens on their main chains.

Developers and operators can easily and freely create their own DEX on Wanchain based on this framework.

Customize your DEX rendering based on open source front-end code, adding any preferential policies and other interesting elements.

Multiple DEX can share order book resources for the same trade pair with each other.

Different DEX can have their own characteristic trading pair independently.


![UI](./imgs/img36.png)

The main components of Wan DEX can be divided into three parts:

- fully open source [front-end code](https://github.com/wandevs/dex-front-end)
- fully open source [smart contract source code](https://github.com/wandevs/dex-smart-contract)
- community controls [chain matching engine](https://demodex.wandevs.org:43001/)

Its working mode and cooperation mode are shown as follows:

![working mode and cooperation](./imgs/img37.png)

User assets are controlled in the user's own blockchain wallet and can be searched on the chain at any time.

Different DEX operators modify their multi-platform pages or apps based on open source front-end code for users to browse and place orders.

After the order is completed in the matching engine, it is settled in a smart contract on the chain.

Only orders authorized by the user signature are transferred at settlement time.

Different DEX can enjoy separate trading pairs, handling fees and Shared order sheets.

Its API USES restful mode, real-time change information USES WebSocket interface active notification.

The back-end technical framework is shown in the following figure:

![schematic diagram of back-end frame](./imgs/img38.png)
