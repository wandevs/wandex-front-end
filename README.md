# WanDevs Dex Frontend

[![CircleCI](https://circleci.com/gh/HydroProtocol/hydro-sdk-web.svg?style=svg)](https://circleci.com/gh/HydroProtocol/hydro-sdk-web)
[![microbadger](https://images.microbadger.com/badges/image/hydroprotocolio/hydro-sdk-web.svg)](https://microbadger.com/images/hydroprotocolio/hydro-sdk-web)
[![Docker Pulls](https://img.shields.io/docker/pulls/hydroprotocolio/hydro-sdk-web.svg)](https://hub.docker.com/r/hydroprotocolio/hydro-sdk-web)
[![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/hydroprotocolio/hydro-sdk-web.svg)](https://hub.docker.com/r/hydroprotocolio/hydro-sdk-web)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/hydroprotocolio/hydro-sdk-web.svg)](https://hub.docker.com/r/hydroprotocolio/hydro-sdk-web)

This is the front end of the WanDevs dex project. It's developed using react. The project is created by the [create-react-app](https://github.com/facebook/create-react-app) command.

## How to develop

### Step 0: Install dependences

	yarn

### Step 1: Start server

	yarn start

## How to build

### Step 0: Install dependences

	yarn

### Step 1: Build

	yarn build

## Start with a docker image

	docker-compose up -d

## How to run

You need to set some environment variables to run it.

The testnet version is shown as below:

***TESTNET***
```
REACT_APP_API_URL=https://demodex.wandevs.org:43001
REACT_APP_WS_URL=wss://demodex.wandevs.org:43002
REACT_APP_NODE_URL=https://demodex.wandevs.org:48545
REACT_APP_HYDRO_PROXY_ADDRESS=0x9e57b9f1d836ff1701e441a619cbaad7fc8863d3
REACT_APP_HYDRO_TOKEN_ADDRESS=0x90fb6abca9aa83044abcdaa6f0bf2fb3d63fa45a
REACT_APP_WWAN_TOKEN_ADDRESS=0x916283cc60fdaf05069796466af164876e35d21f
REACT_APP_NETWORK_ID=3
REACT_APP_OPERATOR_ID=1
```

***MAINNET***
```
REACT_APP_API_URL=https://wandex.org/api
REACT_APP_WS_URL=wss://wandex.org/ws
REACT_APP_NODE_URL=https://wandex.org/rpc
REACT_APP_HYDRO_PROXY_ADDRESS=0xff6d4cca7509573faa92013496399b82760cf269
REACT_APP_HYDRO_TOKEN_ADDRESS=0x6e575fade0b6d003ed165dd367b88696d29e2ba1
REACT_APP_WWAN_TOKEN_ADDRESS=0xdabd997ae5e4799be47d6e69d9431615cba28f48
REACT_APP_NETWORK_ID=1
REACT_APP_OPERATOR_ID=1
```

The REACT_APP_OPERATOR_ID is the operator's id. 

# Smart Contract Source Code

[https://github.com/wandevs/wandex-smart-contract/tree/1.1](https://github.com/wandevs/wandex-smart-contract/tree/1.1)
