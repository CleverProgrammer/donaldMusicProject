/*
 * juration - a natural language duration parser
 * https://github.com/domchristie/juration
 *
 * Copyright 2011, Dom Christie
 * Licenced under the MIT licence
 *
 */

(function() {

  var UNITS = {
    seconds: {
      patterns: ['second', 'sec', 's'],
      value: 1,
      formats: {
        'chrono': '',
        'micro':  's',
        'short':  'sec',
        'long':   'second'
      }
    },
    minutes: {
      patterns: ['minute', 'min', 'm(?!s)'],
      value: 60,
      formats: {
        'chrono': ':',
        'micro':  'm',
        'short':  'min',
        'long':   'minute'
      }
    },
    hours: {
      patterns: ['hour', 'hr', 'h'],
      value: 3600,
      formats: {
        'chrono': ':',
        'micro':  'h',
        'short':  'hr',
        'long':   'hour'
      }
    },
    days: {
      patterns: ['day', 'dy', 'd'],
      value: 86400,
      formats: {
        'chrono': ':',
        'micro':  'd',
        'short':  'day',
        'long':   'day'
      }
    },
    weeks: {
      patterns: ['week', 'wk', 'w'],
      value: 604800,
      formats: {
        'chrono': ':',
        'micro':  'w',
        'short':  'wk',
        'long':   'week'
      }
    },
    months: {
      patterns: ['month', 'mon', 'mo', 'mth'],
      value: 2628000,
      formats: {
        'chrono': ':',
        'micro':  'm',
        'short':  'mth',
        'long':   'month'
      }
    },
    years: {
      patterns: ['year', 'yr', 'y'],
      value: 31536000,
      formats: {
        'chrono': ':',
        'micro':  'y',
        'short':  'yr',
        'long':   'year'
      }
    }
  };
    
  var stringify = function(seconds, options) {
    
    if(!_isNumeric(seconds)) {
      throw "juration.stringify(): Unable to stringify a non-numeric value";
    }
    
    if((typeof options === 'object' && options.format !== undefined) && (options.format !== 'micro' && options.format !== 'short' && options.format !== 'long' && options.format !== 'chrono')) {
      throw "juration.stringify(): format cannot be '" + options.format + "', and must be either 'micro', 'short', or 'long'";
    }
    
    var defaults = {
      format: 'short',
      units: undefined
    };
    
    var opts = _extend(defaults, options);
    
    var units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'], values = [];
    var remaining = seconds;
    var activeUnits = 0;
    for(var i = 0, len = units.length;
        i < len && (opts.units == undefined || activeUnits < opts.units);
        i++) {
      var unit = UNITS[units[i]];
      values[i] = Math.floor(remaining / unit.value);
      if (values[i] > 0 || activeUnits > 0)
        activeUnits++;

      if(opts.format === 'micro' || opts.format === 'chrono') {
        values[i] += unit.formats[opts.format];
      }
      else {
        values[i] += ' ' + _pluralize(values[i], unit.formats[opts.format]);
      }
      remaining = remaining % unit.value;
    }
    var output = '';
    for(i = 0, len = values.length; i < len; i++) {
      if(values[i].charAt(0) !== "0" && opts.format != 'chrono') {
        output += values[i] + ' ';
      }
      else if (opts.format == 'chrono') {
        output += _padLeft(values[i]+'', '0', i==values.length-1 ? 2 : 3);
      }
    }
    return output.replace(/\s+$/, '').replace(/^(00:)+/g, '').replace(/^0/, '');
  };
  
  var parse = function(string) {
    
    // returns calculated values separated by spaces
    for(var unit in UNITS) {
      for(var i = 0, mLen = UNITS[unit].patterns.length; i < mLen; i++) {
        var regex = new RegExp("((?:\\d+\\.\\d+)|\\d+)\\s?(" + UNITS[unit].patterns[i] + "s?(?=\\s|\\d|\\b))", 'gi');
        string = string.replace(regex, function(str, p1, p2) {
          return " " + (p1 * UNITS[unit].value).toString() + " ";
        });
      }
    }
    
    var sum = 0,
        numbers = string
                    .replace(/(?!\.)\W+/g, ' ')                       // replaces non-word chars (excluding '.') with whitespace
                    .replace(/^\s+|\s+$|(?:and|plus|with)\s?/g, '')   // trim L/R whitespace, replace known join words with ''
                    .split(' ');
    
    for(var j = 0, nLen = numbers.length; j < nLen; j++) {
      if(numbers[j] && isFinite(numbers[j])) {
         sum += parseFloat(numbers[j]);
      } else if(!numbers[j]) {
        throw "juration.parse(): Unable to parse: a falsey value";
      } else {
        // throw an exception if it's not a valid word/unit
        throw "juration.parse(): Unable to parse: " + numbers[j].replace(/^\d+/g, '');
      }
    }
    return sum;
  };
  
  // _padLeft('5', '0', 2); // 05
  var _padLeft = function(s, c, n) {
      if (! s || ! c || s.length >= n) {
        return s;
      }
      
      var max = (n - s.length)/c.length;
      for (var i = 0; i < max; i++) {
        s = c + s;
      }
      
      return s;
  };
  
  var _pluralize = function(count, singular) {
    return count == 1 ? singular : singular + "s";
  };
  
  var _isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  
  var _extend = function(obj, extObj) {
    for (var i in extObj) {
      if(extObj[i] !== undefined) {
        obj[i] = extObj[i];
      }
    }
    return obj;
  };
  
  var juration = {
    parse: parse,
    stringify: stringify,
    humanize: stringify
  };

  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    //loaders that implement the Node module pattern (including browserify)
    module.exports = juration;
  } else {
    // Otherwise expose juration
    window.juration = juration;

    // Register as a named AMD module
    if ( typeof define === "function" && define.amd ) {
      define("juration", [], function () { return juration; } );
    }
  }
})();







let songs = [
    {'title': 'Dirty','artist': 'Me','length': 112, 'location': new Audio('audio/dirty.wav'),}, //song1
    {'title': 'SnakeBit','artist': 'Me','length': 158, 'location': new Audio('audio/Snakebit.wav'),}, //song2
    {'title': 'Lead Way', 'artist': 'Me', 'length': 200, 'location': new Audio('audio/leadWay.wav'),},
    {'title': 'Longest Road', 'artist': 'Me', 'length': 230, 'location': new Audio('audio/longestRoad.wav'),},
]

function getSongsDuration() {
    // console.log(songs[0].location)
    const songOneTime = songs[0].location;
    console.log(songOneTime.duration);
}



var header = document.getElementById('page-top');
header.innerText = "Simply Music";




var songRows = 0;
var songsCount = songs.length;

// adds the buttons to the first cell

// adds a row and 4 data cells
function addNewRow () {
    for (let i = 0; i < songsCount; i++) {

        
        // gets element by ID then by Tag name
        var tableRef = document.getElementById('table-top').getElementsByTagName('tbody')[0];     

        // adds a row 
        var newRow   = tableRef.insertRow();

                   

        // adds a new cell and buttons
        var newCell = newRow.insertCell();
        var button = document.createElement("button");
        
        button.innerHTML = 'Play';
        newCell.appendChild(button);
        
        
        
        button = document.createElement("button");
        button.innerHTML = 'Pause';
        newCell.appendChild(button);
        document.getElementsByTagName("button")


        // new cell for title 
        newCell = newRow.insertCell();
        var cellEntry = document.createTextNode(`${songs[i]['title']}`);       
        newCell.appendChild(cellEntry);

        // new cell for artist
        newCell = newRow.insertCell();
        cellEntry = document.createTextNode(`${songs[i]['artist']}`);
        newCell.appendChild(cellEntry);

        // cell for length (needs a duration function?)
        newCell = newRow.insertCell();
        cellEntry = document.createTextNode(`${juration.stringify(songs[i]['length'])}`);
        newCell.appendChild(cellEntry);

        
        songRows ++;
  
    
    }
    
}

addNewRow();

// Gets the created buttons
var allButtons = document.getElementsByTagName('button');

// Creates the play functions (can I do this more efficiently?)
function playSongOne() {
    songs[0].location.play();
}

function playSongTwo() {
    songs[1].location.play();
}

function playSongThree() {
    songs[2].location.play();
}

function playSongFour() {
    songs[3].location.play();
}

//Pause functions (Again, is there a better way?)
function pauseSongOne() {
    songs[0].location.pause();
}

function pauseSongTwo() {
    songs[1].location.pause();
}

function pauseSongThree() {
    songs[2].location.pause();
}

function pauseSongFour() {
    songs[3].location.pause();
}

// EventListeners for all my buttons
allButtons[0].addEventListener('click', playSongOne);
allButtons[2].addEventListener('click', playSongTwo);
allButtons[4].addEventListener('click', playSongThree);
allButtons[6].addEventListener('click', playSongFour);

allButtons[1].addEventListener('click', pauseSongOne);
allButtons[3].addEventListener('click', pauseSongTwo);
allButtons[5].addEventListener('click', pauseSongThree);
allButtons[7].addEventListener('click', pauseSongFour);



// Create a non-dom allocated Audio element
var au = document.createElement('audio');

// Define the URL of the MP3 audio file
au.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

// Once the metadata has been loaded, display the duration in the console
au.addEventListener('loadedmetadata', function(){
    // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
    var duration = au.duration;

    // example 12.3234 seconds
    console.log("The duration of the song is of: " + duration + " seconds");
    // Alternatively, just display the integer value with
    // parseInt(duration)
    // 12 seconds
},false);


console.log('👉🔥', juration.stringify(500));