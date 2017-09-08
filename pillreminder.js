'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const Spreadsheet = require('edit-google-spreadsheet')
const BBCMicrobit = require('bbc-microbit')
const pin = 0;
const EVENT_FAMILY = 8888;
const EVENT_VALUE_ANY = 0;

let currentDate = '';
let pointer = 2;

var microbit_;

function getDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return day +'-' + month + "-" + year;
}


function getTime() {
    let date = new Date();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    return hour +':' + min;
}

function UpdateGoogleSheet(pointer){
  Spreadsheet.load({
    debug: false,
    spreadsheetId: 'GOOGLE_SHEETS_SPREADSHEET_ID',
    worksheetName: 'PillReminder',
    oauth : {
      email: 'xxxxxx@appspot.gserviceaccount.com',
      keyFile: 'xx.pem'
    }
  },

  function sheetReady(err, spreadsheet) {
    if (err) {
      throw err;
    }


    spreadsheet.receive(function(err, rows, info) {
      if (err) {
        throw err;
      }

      //console.log(info);
      for (let i=2; i<= info.totalRows; i++) {
        console.log('data:' + rows[i][1]);
      }
     
      console.log(pointer);
      if(pointer <= info.totalRows) {

        let addData = '{' + '"' + pointer + '"' + ': {' + '"2" : "' + getTime() + '" } }';
        spreadsheet.add(JSON.parse(addData));
        spreadsheet.send(function(err) {
          if(err) throw err;
            console.log("Updated Cell");
        });
      }

    });
  })
  return;
}


console.log('Scanning for microbit');
BBCMicrobit.discover(function(microbit) {
  console.log('\tdiscovered microbit: id = %s, address = %s', microbit.id, microbit.address);

  microbit.on('disconnect', function() {
    console.log('\tmicrobit disconnected!');
    process.exit(0);
  });

  microbit.on('pinDataChange', function(pin, value) {
    console.log('\ton -> pin data change: pin = %d, value = %d', pin, value);
    if(value == 2) {
    

      if(currentDate !=  getDate()) {
        currentDate = getDate();
        console.log(currentDate);
        pointer = 2;
      }
      
      UpdateGoogleSheet(pointer);
      pointer = pointer + 1;
      microbit_.writeEvent(19, 8888, function() {
        console.log('Alarm is off');
      });

    }
  });

  console.log('connecting to microbit');
  microbit.connectAndSetUp(function() {
    console.log('\tconnected to microbit');

    console.log('setting pin %d as input', pin);
    microbit.pinInput(pin, function() {
      console.log('\tpin set as input');

      console.log('setting pin %d as analog', pin);
      microbit.pinAnalog(pin, function() {
        console.log('\tpin set as analog');

        console.log('subscribing to pin data');
        microbit.subscribePinData(function() {
          console.log('\tsubscribed to pin data');
        });
      });
    });

    console.log('subscribing to event family, any event value');
    microbit.subscribeEvents(EVENT_VALUE_ANY, EVENT_FAMILY, function() {
      console.log('\tsubscribed to micro:bit events of required type');
    });

    microbit_ = microbit;

  });
});


app.set('port', (process.env.PORT || 8080))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am micro:bit Singapore')
})

app.get('/webhook/', function (req, res) {
  res.sendStatus(200);
})

app.post('/webhook/', function (req, res) {
  let msg = JSON.parse(JSON.stringify(req.body));
  console.log(msg);
  microbit_.writeEvent(18, 8888, function() {
    console.log('Alarm is on');
  });

  res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
