// const process_name = process.argv.slice(2)[0];
// count = 0
// while (true){
//     count ++
//     if (count ==2000 || count == 4000) {
//         console.log(`${process_name} : ${count}`);
//     }
// }

const express = require('express')
const { Worker } = require("worker_threads")
const app = express()
const port = 3000
const THREAD_COUNT = 12

app.get("/non-blocking", (req, res) => {
    res.status(200).send("This is not blocking request")
})

//create worker thread for doing rest of task, so main thread is free to handle new request
function createWorker() {
    return new Promise(function (resolve, reject) {
      const worker = new Worker("./worker.js", {
        workerData: { thread_count: THREAD_COUNT },
      });
      worker.on("message", (data) => {
        resolve(data);
      });
      worker.on("error", (msg) => {
        reject(`An error ocurred: ${msg}`);
      });
    });
  }

app.get("/blocking", async (req, res) => {
    try {
        const workerPromises = []
        for (let i = 0; i < THREAD_COUNT; i++) {
            workerPromises.push(createWorker())
        }
    
        const thread_result = await Promise.all(workerPromises);
        const total = thread_result.reduce((a,sum)=>a+sum,0)
        // const total =
        //     thread_result[0] +
        //     thread_result[1] +
        //     thread_result[2] +
        //     thread_result[3];
        res.status(200).send(`result is ${total}`);
    } catch (error) {
        console.error('An error occurred while requiring the module:', error);

    }
})

// use command to identify your request time : time curl --get http://localhost:3000/blocking 
// use your local terminal
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})