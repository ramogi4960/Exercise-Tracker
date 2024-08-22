require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// configurations
process.env.MONGO_URI="mongodb+srv://kevobizzi:ramogi4960@cluster0.uvbbx.mongodb.net/Exercise?retryWrites=true&w=majority&appName=Cluster0";


// cloud database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// design the database and its queries
let Person = mongoose.model("Exercises", mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Number,
  }],
}));

// create new username
// const newUsername = (name, next) => {
//   let document = Person({
//     username: name,
//     count: 0,
//     log: [{
//       description: "not yet",
//       duration: 0,
//       date: 0
//     }],
//   });
// };


// end of database design

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));

// homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// handle new username post requests
app.post("/api/users", (req, res) => {
  let document = Person({
    username: req.body.username,
    count: 0,
    log: [{
      description: "not yet",
      duration: 0,
      date: 0
    }],
  });
  document.save();
  console.log(document);
  res.json({
    username: document.username,
    _id: document._id,
  });
});

app.get("/api/users", (req, res) => {
  Person.find({}).select("username").then(data => {
    res.json(data);
  });
});

// testing _id = 66c66a36e1d17c38dbb40a75
app.post("/api/users/:_id/exercises", (req, res) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  Person.findById(req.params._id).then(data => {
    let { username, count, log } = data;
    log[count].description = req.body.description;
    log[count].duration = +req.body.duration;
    log[count].date = new Date(req.body.date).getTime() || new Date();
    log.push({
      description: 'not yet',
      duration: 0,
      date: 0,
    });
    count++;
    Person.findByIdAndUpdate(req.params._id, {
      log: log,
      count: count,
    }).then(data2 => {
      let temp = new Date(req.body.date) || new Date();
      res.json({
        _id: req.params._id,
        username,
        description: req.body.description,
        duration: +req.body.duration,
        date: `${days[temp.getDay()]} ${months[temp.getMonth()]} ${temp.getDate() < 10 ? "0" + temp.getDate() : temp.getDate()} ${temp.getFullYear()}`,
      });
    });
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  Person.findById(req.params._id).select("count log -_id").then(data => {
    res.json({
      count: data.count,
      log: data.log.map((item) => { 
        return {
          description: item.description,
          duration: item.duration,
          date: item.date,
        };
       }),
    });
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
