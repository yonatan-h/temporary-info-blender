import express from 'express'
const app = express()
console.log('here')
app.get('/', (req, res) => res.send('Hello World!'))
export default app
