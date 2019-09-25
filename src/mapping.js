import report_mapping from './report_mapping'
import mapping_set from './mapping_set'
import mapping_get from './mapping_get'

const build = () => {
  report_mapping.build_report_mapping()
}

const set = (data) => {
  console.log('set report mapping ...')
  mapping_set.set_report_mapping(data)
}

const queryAll = (callback) => {
  mapping_get.queryAll((result) => {
    callback(result)
  })
}

const querySpecific = (appId, callback) => {
  console.log('get specific report ...')
  mapping_get.querySpecific(appId, (result) => {
    callback(result)
  })
}

export default {
  build,
  set,
  queryAll,
  querySpecific,
}
