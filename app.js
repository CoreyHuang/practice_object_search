const express = require("express")
const app = express()
const axios = require("axios")
const moment = require("moment")
const temp = [] // 多這差一千倍左右速率

app.get("/test", (req, res) => {
  console.log('query', req.query)
  const initialTime_1 = process.hrtime.bigint()

  const search = temp.filter(e => {
    if (e.query === req.query.text && (moment().valueOf() - e.time) < 30000 ) return true
  })
  if (search.length > 0) {
    // console.log("search",search)
    console.log("operation time - 11", process.hrtime.bigint() - initialTime_1)
    return res.json(search[0].data)
  }

  axios.get('https://datacenter.taichung.gov.tw/swagger/OpenData/f116d1db-56f7-4984-bad8-c82e383765c0')
    .then(data => {
      const apiResult = data.data
      let filerArray = []
      const initialTime = moment().valueOf() // 只到ms
      // const initialTime_2 = process.hrtime()
      

      // console.log('@@@@', process.hrtime.bigint() - process.hrtime.bigint()) //約 1200~3600ns 差異，process.hrtime()回傳陣列比較難用


   
        // //error: repeat save same data ( use try...catch to solve it )//////////////////////////////////////
        // apiResult.forEach(e => {
        //   Object.keys(e).forEach(key => {
        //     if (e[key].match(req.query.text))   // match will return query string/index/input/groups message
        //       return filerArray.push(e) 
        //   })
        // });

        // correct : use "some" and if get right data that can use return to break function ////////////////
        apiResult.forEach(e => {
          Object.keys(e).some(key => {
            // if (e[key].match(req.query.text))   // match will return query string/index/input/groups message
            // console.log('@@@1', e.key) // undefined => e.key 會直接抓key的屬性所以無效
            if (e[key].includes(req.query.text))   // includes only return boolean
              return filerArray.push(e)
          })
        });

        // // correct : use map but not recommend //////////////////////////////////////////////////////////////
        // filerArray = apiResult.map(e => {
        //   let result = {}
        //   Object.keys(e).some(key => {
        //     if (e[key].includes(req.query.text)) {    // includes only return boolean
        //       result = e
        //       return true
        //     } 
        //   })
        //   return result
        // });

        // // correct : use filter and some is recommend，139181n 190696n 350966n
        // filerArray = apiResult.filter(e => {   // if content is true that will return element
        //   return Object.keys(e).some(key => {
        //     if (e[key].includes(req.query.text))   // includes only return boolean
        //       return true
        //   })
        // });

        // apiResult.reduce((arr, cur) => {
        //   let judge = Object.keys(cur).some(key => {
        //     if (cur[key].includes(req.query.text))   // includes only return boolean
        //       return true
        //   })
        //   if (judge) return filerArray.push(cur)
        //   return cur
        // }, filerArray)
      
        temp.push({
          query: req.query.text,
          time: moment().valueOf(),
          data: filerArray
        })
        // console.log("temp", temp)

      // console.log("operation time", moment().valueOf() - initialTime)

      //只有第一項error的部分有明顯差異(約多三倍時間)，其他部分皆差不太多，原因可能為資料量不同導致
      console.log("operation time - 1", process.hrtime.bigint() - initialTime_1)

      res.json(filerArray)
    })
    .catch(err => console.log(err))


})




app.listen(3000, () => {
  console.log('server is enable....')
})


