import _fs from 'fs'
import _solc from 'solc'
import web3_function from './web3_function'

let web3

// get contract information
const getContract = (abi, addr) => {
  web3 = web3_function.connect()
  return web3.eth.contract(abi).at(addr)
}

// compile smart contract
const compile_contract = (sol_name) => {
  console.log('compile smart contract ...')
  const jsonObj = {
    bytecode: '',
    abi: '',
  }
  const data = _fs.readFileSync(`./Contracts/${sol_name}.sol`, 'utf-8')
  const compiled = _solc.compile(data)
  for (const contractName in compiled.contracts) {
    // console.log(contractName.substring(1, contractName.length));
    if (contractName.substring(1, contractName.length).match(sol_name)) {
      jsonObj.bytecode = compiled.contracts[contractName].bytecode
      jsonObj.abi = JSON.parse(compiled.contracts[contractName].interface)
      console.log('finished..')
      return jsonObj
    }
  }
  return jsonObj
}

// create smart contract with fixed gas limit
const create_contract = (user, sol_name, callback) => {
  console.log(`create smart contract => ${sol_name} ...`)
  web3 = web3_function.connect()
  const compiled = compile_contract(sol_name)
  const _contract = web3.eth.contract(compiled.abi)
  const contract_callback = (err, contract) => {
    // console.log(`contract info : ${contract}`)
    if (err === null) {
      if (typeof contract.address !== 'undefined') {
        console.log(`Contract mined! Address: ${contract.address}`)
        callback(contract.address)
      }
    } else {
      console.log(err)
    }
  }
  web3_function.unlock(user)
  _contract.new({ from: user, data: '0x' + compiled.bytecode, gas: 1500000 }, contract_callback)
  // console.log('contract new result :')
  // console.log(`${JSON.stringify(result)}`)
}

// store transaction address into smart contract
const storeTxAddr = (user, sol_name, contract_addr, tx_addr, callback) => {
  console.log('get data by tx address ...')
  web3 = web3_function.connect()
  const compiled = compile_contract(sol_name)
  // const abi = JSON.parse(_fs.readFileSync('./Contracts/contract_info.json', 'utf-8')).abi
  // console.log(`${JSON.stringify(compiled.abi)}`)
  const _contract = web3.eth.contract(compiled.abi).at(contract_addr)
  // console.log(_contract)
  const event = _contract.succeed({ from: user })
  event.watch((err, result) => {
    if (err) {
      console.log(err)
    }
    if (parseInt(result.args.seq, 0) === tx_addr.length) {
      setTimeout(() => {
        web3_function.unlock(user)
        _contract.IsStorable({ from: user })
      }, 15000)
      callback()
    }
  })
  for (let i = 0; i < tx_addr.length; i += 1) {
    web3_function.unlock(user)
    console.log(`upload -> ${tx_addr[i]}`)
    _contract.uploadData.sendTransaction(tx_addr[i], { from: user, gas: 1500000 })
  }
  // callback()
}

export default {
  getContract,
  compile_contract,
  create_contract,
  storeTxAddr,
}
