/**
 * Mark Repka
 * SPARSA Week 2 Challenge
 * 
 * *** SPARSA WEEK 2 CHALLENGE ***
 * Write a dirbuster clone in the language of your choice. This time use the website ctf.arch-cloud.com.
 * Try to find hidden directories/files.
 * 
 * [+] DirBuster is designed to brute force directories and files names on web/application servers.
 */

// Import some required core/external libraries to help out
var readline = require('readline');
var fs = require('fs');
var request = require('request');
var sleep = require('sleep');

// Create a reader for the searchspace text file
// This file contains the dict of paths to check
var rl = readline.createInterface({
    input: fs.createReadStream('searchspace.txt')
});

// Set up some local storage to hold useful things
var wordlist = [];
var exists = [];
var counter = 0;
var max = 0;
var endOfLine = require('os').EOL;

// When we get a new line of the input file
// push it onto the wordlist array.
rl.on('line', function (line) {
    wordlist.push(line);
});


// After the wordlist is read in... do stuff!
rl.on('close', function () {
    console.log("Checking " + wordlist.length + " words...");
    max = wordlist.length;
    
    // Start the first word grab to trigger the search
    getWebpage(wordlist[counter]);
});

// This function is a callback from the previous search
// It will start the next request if the search is not done and 
// after a very small timeout.
function checkNext() {
    counter = (counter + 1);
    if (counter > max) {
        cleanup();
    } else {
        // Be slightly nice and wait a quarter of a second between requests
        sleep.usleep(250000);
        
        // Start the next request
        getWebpage(wordlist[counter]);
    }
}

// Takes the current search word, does a GET request for it,
// checks the reponse code to see if there is anything there.
function getWebpage(append) {
    var url = "http://ctf.arch-cloud.com/" + append;
    
    request.get(url).on('response', function (response) {
        // In this case we assume that !404 is 'something' interesting
        if (response.statusCode != 404) {            
            // Log to our results that we found something interesting
            foundUrl(response, append, url);
        }
        
        // Print out the result of the request and trigger the next check
        console.log(response.statusCode + " : " + url + ", count: " + counter);
        checkNext();
    }).on('error', function (error) {
        // Something bad happens! Time out, blocked, etc.
        console.log("Error: " + error);
        
        // Power through anyway....?
        checkNext();
    });
}

// This function is triggered if we DO find something.
// The path will be logged into dirbuster.log so we can take a look later.
function foundUrl(response, path, url) {
    exists.push(path);
    var logmsg = response.statusCode + " | " + path + " | " + url + endOfLine;
    fs.appendFileSync("dirbuster.log", logmsg)
}


// When the entire search is done this function is called.
// It simply prints out how many things we found.
function cleanup() {
    console.log("Checked " + wordlist.length + " words and found " + exists.length + " existing results!");
}
