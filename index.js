const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb+srv://kevobizzi:ramogi4960@cluster0.uvbbx.mongodb.net/Exer?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let UserExercise = mongoose.model("UserExercise", mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: String,
  }]
}));

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  let document = await UserExercise({
    username: req.body.username,
    count: 0,
    log: []
  }).save();

  res.json({
    _id: document._id,
    username: document.username,
  });
});

app.get('/api/users', async (req, res) => {
  let all_documents = await UserExercise.find({}).select("username _id");
  res.json(all_documents);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  // first get the log items from the request object
  const { description } = req.body;
  const duration = +req.body.duration;
  let date = new Date(req.body.date).toDateString() === "Invalid Date" ? new Date().toDateString() : new Date(req.body.date).toDateString();
  let document = await UserExercise.findByIdAndUpdate(req.params._id, {
    $inc: {
      count: 1
    },
    $push: {
      log: { description, duration, date }
    }
  }, { new: true });
  res.json({
    _id: document._id,
    username: document.username,
    description, duration, date
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  let document = await UserExercise.findById(req.params._id);
  let { log, count } = document;
  let { from, to, limit } = req.query;
  from = from ? new Date(from).getTime() : 0;
  to = to ? new Date(to).getTime() : new Date().getTime();
  limit = limit ? +limit : count;
  log = log.map(item => ({
    description: item.description,
    duration: item.duration,
    date: item.date,
  })).filter(thing => from < new Date(thing.date).getTime() < to).slice(0, limit);
  res.json({
    count: limit,
    log
  });

});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
