import _fs from 'fs'
import web3_function from './web3_function'

let web3
let user
let mapping_contract
let report_data
let report_seq = 0
let newestReport = false

// get All verify report
const getAllReports = () => {
  console.log('get all report function working ..')
  let seq = 0
  do {
    seq = mapping_contract.report_seq.call()
  } while (seq === 0)
  const reports = []
  for (let i = 1; i <= seq; i += 1) {
    reports.push(mapping_contract._reports.call(i)[0])
  }
  console.log('get all reports : \n' + reports)
  return reports
}

// create verify report mapping
const create_report_mapping = () => {
  console.log('create report mapping function working ..')
  if (newestReport) {
    const set_event = mapping_contract.setSucceed({ from: user[0] })
    set_event.watch((err, result) => {
      if (!err) {
        console.log('event for set report mapping :')
        console.log(result.args.report_seq)
        return
      }
      console.log(err)
    })
    console.log('create report mapping...')
    web3_function.unlock(user[0])
    mapping_contract.setInfo.sendTransaction(
      report_data.appId,
      report_data.version,
      report_data.operatingSystem, {
        from: user[0],
        gas: 1500000,
      })
    console.log('upload report info :\n' +
      report_data.appId + '/' +
      report_data.version + '/' +
      report_data.operatingSystem)
  }
}

// upload verify report mapping
const upload_mapping_info = (reports) => {
  console.log('upload mapping info...')
  web3_function.unlock(user[0])
  const upload_event = mapping_contract.uploadSucceed({ from: user[0] })
  upload_event.watch((err, result) => {
    if (!err) {
      console.log('event for upload mapping :')
      console.log(result.args.contract_seq)
      return result.args.contract_seq
    }
    console.log(err)
    return err
  })

  for (let i = 0; i < reports.length; i += 1) {
    console.log(report_data.appId + ' <--> ' + reports[i])
    if (report_data.appId === reports[i]) {
      console.log('upload mapping info include :\n' + (i + 1) + '/' +
        report_data.timeStamp + '/' +
        report_data.contract)
      return mapping_contract.upload.sendTransaction(
        i + 1,
        report_data.timeStamp,
        report_data.contract,
        {
          from: user[0],
          gas: 1500000,
        })
    } else if (i === reports.length - 1 && report_data.appId !== reports[i]) {
      create_report_mapping(() => {
        const upload = async () => {
          const _reports = await getAllReports()
          await upload_mapping_info(_reports)
        }
        upload()
      })
    }
  }
}

// set up report information to upload mapping
const set_report_info = async () => {
  console.log('set report info function working ..')
  report_seq = await mapping_contract.report_seq.call()
  if (typeof report_seq !== typeof 0) {
    report_seq = parseInt(report_seq, 0)
  }
  if (report_seq === 0) {
    const res = await create_report_mapping()
    console.log(`created report mapping... ${res}`)
  }
  const reports = await getAllReports()
  await upload_mapping_info(reports)
}

// set verify report mapping
const set_report_mapping = (data) => {
  console.log('(1) function working ..')
  web3 = web3_function.connect()
  user = web3_function.accountList()
  const mapping_contract_info = JSON.parse(_fs.readFileSync('./Contracts/contract_info.json', 'utf-8'))
  const addr = mapping_contract_info.addr
  const abi = mapping_contract_info.abi
  mapping_contract = web3.eth.contract(abi).at(addr)
  report_data = data
  console.log(data)
  newestReport = true
  set_report_info()
}

export default {
  set_report_mapping,
}
