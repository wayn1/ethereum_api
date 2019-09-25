import _fs from 'fs'
import web3_function from './web3_function'
import blockchain_api from './blockchain_api'

let web3
let _contract
const obj = {
  appId: '',
  version: '',
  operatingSystem: '',
  contract: {
    timeStamp: '',
    addr: '',
  },
  report: '',
}

// get mapping contract's abi and address
const get_contract = () => {
  web3 = web3_function.connect()
  const mapping_contract_info = JSON.parse(_fs.readFileSync('./Contracts/contract_info.json', 'utf-8'))
  const addr = mapping_contract_info.addr
  const abi = mapping_contract_info.abi
  _contract = web3.eth.contract(abi).at(addr)
}

// query all report from smart contract
const queryAll = (callback) => {
  get_contract()
  const reports = []
  const report_seq = parseInt(_contract.report_seq.call(), 0)
  console.log('reports : ' + report_seq)
  for (let i = 1; i <= report_seq; i += 1) {
    const report = _contract._reports.call(i)
    console.log('report : ' + i)
    console.log(report)
    const contract_seq = parseInt(_contract.getContractSeq.call(i), 0)
    console.log('mappings : ' + contract_seq)
    for (let j = 1; j <= contract_seq; j += 1) {
      const reportObj = obj
      reportObj.appId = report[0]
      reportObj.version = report[1]
      reportObj.operatingSystem = parseInt(report[2], 0)
      console.log('mapping : ' + j)
      const c = _contract.getContract.call(i, j)
      console.log('mapping ' + c)
      reportObj.contract.timeStamp = c[0]
      reportObj.contract.addr = c[1]
      // do {

      // } while (reportObj.appId === '')
      const queryReport = async () => {
        reportObj.report = await blockchain_api.queryReportContent(reportObj.contract.addr, 'VerifyReport')
        await reports.push(reportObj)
        const check = () => {
          if (i === report_seq) {
            callback(reports)
          }
        }
        await check()
      }
      queryReport()
    }
  }
}

// query specific report from blockchain
const querySpecific = (appId, callback) => {
  get_contract()
  const reports = []
  const report_seq = parseInt(_contract.report_seq.call(), 0)
  // console.log('reports : ' + report_seq)
  for (let i = 1; i <= report_seq; i += 1) {
    const report = _contract._reports.call(i)
    // console.log(report[0] + '==' + appId)
    if (report[0] === appId) {
      // console.log('report : ' + i)
      // console.log(report)
      const contract_seq = parseInt(_contract.getContractSeq.call(i), 0)
      // console.log('mappings : ' + contract_seq)
      for (let j = 1; j <= contract_seq; j += 1) {
        const reportObj = obj
        reportObj.appId = report[0]
        reportObj.version = report[1]
        reportObj.operatingSystem = report[2]
        // console.log('mapping : ' + j)
        const c = _contract.getContract.call(i, j)
        // console.log(c)
        reportObj.contract.timeStamp = c[0]
        reportObj.contract.addr = c[1]
        do {
          if (reportObj.appId !== '') {
            break
          }
        } while (reportObj.appId === '')
        const queryReport = async () => {
          reportObj.report = await blockchain_api.queryReportContent(reportObj.contract.addr, 'VerifyReport')
          await reports.push(reportObj)
          const check = () => {
            if (i === report_seq) {
              callback(reports)
            }
          }
          await check()
        }
        queryReport()
      }
    }
  }
}

export default {
  queryAll,
  querySpecific,
}
