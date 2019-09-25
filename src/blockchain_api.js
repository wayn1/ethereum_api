// import _fs from 'fs'
import web3_function from './web3_function'
import contract_function from './contract_function'

// store verify report into transaction and create smart contract to keep mapping information
const mapping_contract = (user, data, size, callback) => {
  const create_mapping = async () => {
    const tx_addr = await web3_function.trans_data(user, data, size)
    await contract_function.create_contract(user, 'VerifyReport', (addr) => {
      contract_function.storeTxAddr(user, 'VerifyReport', addr, tx_addr, () => {
        callback(addr)
      })
    })
  }
  create_mapping()
}

// query verify report content
const queryReportContent = (addr, solName) => {
  console.log('querying report content ...')
  // const abi = _fs.readFileSync('./mapping_contract.json', 'utf-8')
  const abi = contract_function.compile_contract(solName).abi
  const contract = contract_function.getContract(abi, addr)
  const seq = contract.seq.call()
  const trans = []
  for (let i = 1; i <= seq; i += 1) {
    const tx = contract.datas.call(i)
    // web3_function.unlock(user)
    trans.push(tx)
  }
  const report = web3_function.getTxData(trans)
  // callback(report)
  return JSON.parse(report)
}

export default {
  mapping_contract,
  queryReportContent,
}
