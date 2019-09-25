import Web3 from 'web3'
import Base64 from 'base-64'
import Utf8 from 'utf8'
// import _fs from 'fs'
import _ip from 'ip'

let web3 = new Web3()
const port = '8545'
const passphrase = '123qwe'

const connect = () => {
  if (web3.currentProvider) {
    web3 = new Web3(web3.currentProvider)
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(`http://${_ip.address()}:${port}`))
  }
  return web3
}

const accountList = () => {
  connect()
  const accounts = web3.eth.accounts
  return accounts
}

const unlock = (user) => {
  connect()
  console.log(`unlock info : ${web3.personal.unlockAccount(user, passphrase, 10000)}`)
}

const trans_data = (user, data, size) => {
  connect()
  let gasEstimate
  const tx_addr = []
  let tempStr = ''
  let tempLength = 0
  let tempSize = 0

  do {
    do {
      tempStr += data.substr(tempLength, 1)
      tempSize = Buffer.byteLength(tempStr, 'utf-8')
      tempLength += 1
      if (tempLength === data.length) {
        break
      }
    } while (tempSize < size * 1024)
    console.log(`data size === ${tempSize}`)
    const encode_utf8 = Utf8.encode(tempStr)
    const encode_base64 = Base64.encode(encode_utf8)
    const encode_hex = new Buffer(encode_base64).toString('hex')
    unlock(user)
    gasEstimate = web3.eth.estimateGas({ to: user, data: '0x' + encode_hex })
    try {
      const sendTrans = web3.eth.sendTransaction({
        from: user,
        data: '0x' + encode_hex,
        gas: gasEstimate + 100000,
      })
      tx_addr.push(sendTrans)
      console.log('Tx : ' + sendTrans)
    } catch (error) {
      console.log(error)
    }
    tempStr = ''
  } while (tempLength < data.length)

  console.log('Tx Address :')
  console.log(tx_addr)
  return tx_addr
}

const getTxData = (trans) => {
  connect()
  console.log('get data from transaction ...')
  let original_report = ''
  for (let i = 0; i < trans.length; i += 1) {
    const tx = web3.eth.getTransaction(trans[i])
    const data = tx.input
    // console.log(data)
    const hex = data.substr(2, data.length - 2)
    const decode_hex = Buffer.from(hex, 'hex')
    // const decode_hex = Buffer.from(data, 'hex')
    const decode_base64 = Base64.decode(decode_hex)
    const part_report = Utf8.decode(decode_base64)
    original_report += part_report
    // console.log(part_report)
  }
  // console.log(original_report)
  return original_report
}

export default {
  connect,
  accountList,
  unlock,
  trans_data,
  getTxData,
}
