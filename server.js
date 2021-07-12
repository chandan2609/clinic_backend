const express = require('express')
const path= require('path')
const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient;
const Schema = mongoose.Schema;
const multer = require('multer');
const excelToJson = require('convert-excel-to-json');
const app = express()

mongoose.connect('mongodb+srv://chandan:12345678a@@cluster0.d7qrv.mongodb.net/task?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})


let newVal = new Schema({
  PracticeName: {
      type: String
  },
  PracticeType: {
      type: String
  },
  FirstName: {
      type: String
  },
  LastName: {
      type: String
  },
  ProfessionalDesignation: {
    type: String
},
Address1: {
  type: String
},
Address2: {
  type: String
},
City: {
  type: String
},
Zip: {
  type: String
},
Phone: {
  type: String
},
Fax: {
  type: String
}
});

var newVal2 = mongoose.model('newVal', newVal );

const excelStore = multer.diskStorage({  
  destination: 'excelFiles', 
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() 
           + path.extname(file.originalname))
  }
});

const excelMongodb = excelToJson({
  sourceFile: 'excelFiles/excelFiles_1626111238385.xlsx',
  sheets:[{
  // Excel Sheet Name
      name: 'Sheet1',
  
  header:{
          rows: 1
      },
  
  // Mapping columns to keys
      columnToKey: {
        A: 'PracticeName',
      B: 'PracticeType',
    C: 'FirstName',
    D: 'LastName',
    E: 'ProfessionalDesignation',
    F: 'Address1',
    G: 'Address2',
    H: 'City',
    I: 'Zip',
    J: 'Phone',
    K: 'Fax',
      }
  }]
  
});

console.log(excelMongodb)

const excelUpload = multer({
  storage: excelStore,
  limits: {
    fileSize: 5000000
  },
}) 


app.use(express.urlencoded({ extended: false }))


app.get('/clinic', async (req, res) => {
  newVal2.find(function(err, clinics) {
    if (err) {
        console.log(err);
    } else {
        res.json(clinics);
    }
});
  })

  app.post('/postclinic', excelUpload.single('excelFiles'), (req, res) => {
    res.send(req.file)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

app.post('/test', (req, res) => {
  newVal2.insertMany(excelMongodb.Sheet1)
        .then(clinic => {
            res.status(200).json({clinic});
        })
        .catch(err => {
            res.status(400).send('adding new clinic failed');
        });
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

  app.get('/clinic/:id', async (req, res) => {
    newVal2.findById(req.params.id,(err, clinic)=> {
      if (err) {
          console.log(err);
      } else {
          res.json(clinic);
      }
  });
  })

app.listen(5000,()=>{
  console.log('started')
})