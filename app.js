import express from 'express'
import bodyParser from 'body-parser'
import _fs from 'fs'
import blockchain_api from './src/blockchain_api'
import web3_function from './src/web3_function'
import contract_function from './src/contract_function'
import mapping from './src/mapping'

const app = express()
let user

app.use(bodyParser.urlencoded({
  extended: false,
}))

app.get('/', (req, res) => {
  res.send(user).end()
})

app.get('/build', (req, res) => {
  console.log('build...')
  _fs.exists('./Contracts/contract_info.json', (exists) => {
    if (!exists) {
      contract_function.create_contract(user[0], 'ReportMapping', (_addr) => {
        const compiled = contract_function.compile_contract('ReportMapping')
        const output = {
          abi: compiled.abi,
          addr: _addr,
        }
        _fs.writeFileSync('./Contracts/contract_info.json', JSON.stringify(output), 'utf-8')
        res.send(`Successfully built at ${_addr}`).end()
      })
    } else {
      res.send('manager contract existed.. ').end()
    }
  })
})

app.get('/file', (req, res) => {
  const data = _fs.readFileSync(__dirname + '/verify_report_file/VERIFYREPORT', 'utf-8')
  res.type('application/json')
  res.send(data).end()
})

// app.get('/list', (req, res) => {
//   collection.find({}).toArray((err, data) => {
//     if (err) {
//       res.status(err).end()
//     } else {
//       res.type('application/json')
//       res.send(data).end()
//     }
//   })
// })

app.post('/upload', (req, res) => {
  const data = req.body.data
  const size = req.body.size
  const parseData = JSON.parse(data)
  const time = new Date()
  // mapping_contract -> smartContract
  blockchain_api.mapping_contract(user[0], data, size, (result) => {
    const report = {
      appId: parseData.report.appId,
      version: parseData.report.version,
      operatingSystem: parseData.report.operatingSystem,
      timeStamp: time.toLocaleString(),
      contract: result,
    }
    // collection.insert(report)
    mapping.set(report)
    res.type('application/json')
    res.send(report).end()
  })
})

// app.get('/report/get', (req, res) => {
//   const report = {
//     appId: req.query.appId,
//     version: req.query.version,
//     operatingSystem: parseInt(req.query.operatingSystem, 10),
//   }
//   collection.find(report, (err, datas) => {
//     if (err) {
//       res.send(err).end()
//     } else {
//       datas.sort({ timeStamp: -1 }).toArray((_err, data) => {
//         // queryReportContent -> getData
//         blockchain_api.queryReportContent(user[0], data.contract, (_report) => {
//           res.type('application/json')
//           res.send(_report).end()
//         })
//       })
//     }
//   })
// })

// app.post('/report/post', (req, res) => {
//   const report = {
//     appId: req.body.appId,
//     version: req.body.version,
//     operatingSystem: parseInt(req.body.operatingSystem, 10),
//   }
//   collection.find(report, (err, datas) => {
//     if (err) {
//       res.send(err).end()
//     } else {
//       datas.sort({ timeStamp: -1 }).toArray((_err, data) => {
//         // queryReportContent -> getData
//         blockchain_api.queryReportContent(user[0], data.contract, (_report) => {
//           res.type('application/json')
//           res.send(_report).end()
//         })
//       })
//     }
//   })
// })

// app.post('/report/group', (req, res) => {
//   const report = {
//     appId: req.body.appId,
//     version: req.body.version,
//     operatingSystem: parseInt(req.body.operatingSystem, 10),
//   }
//   collection.find(report).toArray((err, datas) => {
//     if (err) {
//       res.send(err).end()
//     } else {
//       res.type('application/json')
//       res.send(datas)
//       res.end()
//     }
//   })
// })

app.get('/queryAll', (req, res) => {
  mapping.queryAll((reports) => {
    res.send(reports).end()
  })
})

app.get('/query', (req, res) => {
  const search = req.query.search
  mapping.querySpecific(search, (report) => {
    res.type('application/json')
    res.send(report).end()
  })
})

app.listen(process.env.PORT || 5555, () => {
  user = web3_function.accountList()
  console.log(user)
  console.log('server listen on port 5555')
})
