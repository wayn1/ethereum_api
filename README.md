# 2017/4 ETHEREUM API (test)
A mechanism to store data into blockchain by using node js and web3.js

* Notice : **data type must be text**

### Build Ethereum Blockchain Environment
#### Install by PPA
```sh
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository -y ppa:ethereum/ethereum
$ sudo apt-get update
$ sudo apt-get install ethereum
```
#### Build by source
```sh
$ git clone https://github.com/ethereum/go-ethereum
$ sudo apt-get install -y build-essential golang
$ cd go-ethereum
$ make geth
```

### Install Service Environment
```sh
$ npm install
```
### Start Service
```sh
$ npm start
```

### API

||API|Parameters|API Description|
|----|----|----|----|
|**GET**|/|null|get all user's account from blockchain|
|**GET**|/build|null|first time to build smart contract of a mapping mechanism|
|**GET**|/file|null|get a test verify report data|
|**POST**|/upload|data<br/>size|upload verify report and set mapping contract
|**GET**|/queryAll|null|query all report from blockchain|
|**GET**|/query|search|query specific report from blockchain|

|Parameter|Type|Parameter Description|
|----|----|----|
|data|**JSON**|verify report data|
|size|**INTEGER**|to set the size of each part of report that divide to store in transaction|
|search|**STRING**|report's appId|
