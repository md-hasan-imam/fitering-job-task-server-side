const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qm84bpi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
    await client.connect();
    const ordersCollection = client.db('assignment').collection('orders');

    app.get('/orders', async (req, res) => {
      const searchedDate = req.query.date;
      const fullName = req.query.searchedText;

      if (fullName && !searchedDate) {

        const orders = await ordersCollection.find({
          "$expr": {
            "$regexMatch": {
              "input": { "$concat": ["$firstName", " ", "$lastName"] },
              "regex": `${fullName}`
            }
          }
        }).toArray();

        return res.send(orders);

      } else if (!fullName && searchedDate) {

        const orders = await ordersCollection.find().toArray();

        let filteredCustomersWithOrders = [];

        orders.forEach(order => {
          order.orders.forEach(o => {
            if (o.date.substr(0, 10) === searchedDate) {
              filteredCustomersWithOrders.push(order);
            }
          })
        });

        filteredCustomersWithOrders.forEach(o => {
          o.orders = o.orders.filter(d => d.date.substr(0, 10) === searchedDate)
        });

        return res.send(filteredCustomersWithOrders);
      }
      else if (fullName && searchedDate) {

        const customersDetailsfindWithName = await ordersCollection.find({
          "$expr": {
            "$regexMatch": {
              "input": { "$concat": ["$firstName", " ", "$lastName"] },
              "regex": `${fullName}`
            }
          }
        }).toArray();

        customersDetailsfindWithName.forEach(details => {
          details.orders = details.orders.filter(d => d.date.substr(0, 10) === searchedDate)

        });
        return res.send(customersDetailsfindWithName);

      } else {
        const orders = await ordersCollection.find().toArray();
        return res.send(orders);
      }
    });

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`medic pro app listening on port ${port}`)
})