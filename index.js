const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i8hseoh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();

    const productsCollection =client.db("echoMartDB").collection("products")

    app.get("/products", async(req,res)=>{
       
      
      
        const title = req.query.title || ""
        const currentPage = parseInt(req.query.currentPage)
        const perPageProducts = parseInt(req.query.perPageProducts)
        const sort = req.query.sortProd || ""
        const {p,cat,br} = req.query  

        const query = {}

        if(title){
          query.productName =  {$regex : title, $options : 'i'}
        }

        if (p) {
        
          query.price = { $gte: 500, $lte: parseInt(p) };
        }
      
        if (br) {
          query.brandName = { $regex: br, $options: 'i' };
        }
      
        if (cat) {
          query.category = cat;
        }
       
        let sortPrice = {}
        if(sort === "lowToHigh"){
          sortPrice.price = 1
        }
        else if(sort === "highToLow"){
          sortPrice.price = -1
        }
        else if(sort === "dateAdded"){
          sortPrice.productCreationDate = -1
        }
      const result = await productsCollection.find(query).sort(sortPrice).skip((currentPage-1)*perPageProducts).limit(perPageProducts).toArray()
      res.send(result)
    })

    app.get("/pagination", async(req,res)=>{
      const result = await productsCollection.find().toArray()
       res.send(result)
      
    })
    

   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// dfsdfd

app.get("/", (req,res)=>{
    res.send("Echo Mart running now")
})

app.listen(port, ()=>{
    console.log(`Echo mart running on port ${port}`)
})