//change these two as needed
const Url = "http://localhost:3000/" //this is the server root url (extensions will be added by other scripts)
const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line

//Populates Date Selection (Generated by chat GPT :)
document.addEventListener("DOMContentLoaded", function() {
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() + 1);

    var year = today.getFullYear();
    var month = today.getMonth() + 1; // Months are zero-based, so add 1
    var day = today.getDate();

    var formattedMonth = month < 10 ? "0" + month : month;
    var formattedDay = day < 10 ? "0" + day : day;

    var formattedYesterdayMonth = yesterday.getMonth() + 1;
    var formattedYesterdayDay = yesterday.getDate();

    formattedYesterdayMonth = formattedYesterdayMonth < 10 ? "0" + formattedYesterdayMonth : formattedYesterdayMonth;
    formattedYesterdayDay = formattedYesterdayDay < 10 ? "0" + formattedYesterdayDay : formattedYesterdayDay;

    var beginningDateField = document.getElementById("endDate");
    beginningDateField.value = yesterday.getFullYear() + "-" + formattedYesterdayMonth + "-" + formattedYesterdayDay;

    var endDateField = document.getElementById("beginningDate");
    endDateField.value = year + "-" + formattedMonth + "-" + formattedDay;
});

//easy time thing
function getTime(){
    const now = new Date(Date.now());
    const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
  
    return formattedDateTime;
}

function formatTime(time){
    var showTimes = document.getElementById("showTimes").checked;

    if (time != null){
        if (showTimes){
            return time.slice(0, 19).replace('T', ' ');
        } else{
            return time.slice(0, 10).replace('T', ' ')
        }
    }else {return "An Error Has Occurred";}
}

function timeMath(startDate , endDate){

    // Calculate the difference in milliseconds
    var diffInMs = new Date(endDate) - new Date(startDate);

    // Calculate the difference in days
    var diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Calculate the difference in hours
    var diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)) % 24;

    // Adjust the difference in days if the time difference is greater than or equal to 12 hours
    if (diffInHours >= 12) {
    diffInDays++;
    }

    if (diffInDays < 1){
        return 1;
    } else {return diffInDays;}

}


function callResults(){
    //get input variables
    var startDatePage = document.getElementById("beginningDate").value;
    var endDatePage = document.getElementById("endDate").value;
    var showTennents = document.getElementById("showTennents").checked;

    //parses user inputs for date and adds a timeStamp to it (minus two hours from current)                                 Possibly modify this
    var currentDate = new Date();
    var startDate = new Date(startDatePage);
        startDate.setHours(currentDate.getHours() - 2);
        startDate.setMinutes(currentDate.getMinutes());
    var endDate = new Date(endDatePage);
        endDate.setHours(currentDate.getHours() - 2);
        endDate.setMinutes(currentDate.getMinutes());


    fetch(Url + "billing", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({startDate, endDate, showTennents})
    })
    .then(function(response) {
        return response.json(); // Parse the JSON response
    })
    .then(function(data) {
        var results = data.results

        //Define and erase the <div id="billingTable"> element
        var outputArea = document.getElementById("billingTable");
        outputArea.replaceChildren();

        //Build text header, format:"Aircraft Billing Report '(dataTime)' "
        var header = document.createElement('h2');
        header.appendChild(document.createTextNode("Aircraft Billing Report - " + getTime()));
        outputArea.appendChild(header);

        //define html <ul> object to be populated
        var table = document.createElement('ul');

        //for loop that runs through (aircraft of results)
        for (aircraft of results){
            //define <ol> element
            var aircraftElement = document.createElement('ol');

            //find min max date, total time 
            //generate header, format:'(tailNumber) - (minDate)(maxDate)'

            var hangerTime = 0;
            var minDate = null;
            var maxDate = null;

            //generate <ol id="aircraftHistory"> element
            var historyElement = document.createElement('ol');
            historyElement.setAttribute('id','aircraftHistory')

            //for loop that enters each (entry of aircraft)
            for (entry of aircraft){
                //generate <li> element
                var historyEntry = document.createElement('li');

                //find diffrence between timeIn and timeOut
                var timeInHanger = timeMath(entry.BlockIn,entry.BlockOut)

                if (minDate == null){minDate = entry.BlockIn;}else{
                    if(minDate > entry.BlockIn){
                        minDate = entry.BlockIn;
                    }
                }
                if (maxDate == null){maxDate = entry.BlockOut;}else{
                    if(maxDate < entry.BlockOut){
                        maxDate = entry.BlockOut;
                    }
                }

                //add (diffrence between timeIn and timeOut) to hangerTime
                if (entry.HangerID > 0){
                    hangerTime += timeInHanger;
                }

                //add text to <li>, format: "(hanger) - ((timeIn)-(timeOut)) - (diffrence between timeIn and timeOut)"
                historyEntry.appendChild(document.createTextNode(
                    "\t"+hangers[entry.HangerID] + " - (" + formatTime(entry.BlockIn) + " - " + formatTime(entry.BlockOut) + ") -  " + timeInHanger+" Days"));

                //close <li> and add it to <ol id="aircraftHistory"> element
                historyElement.appendChild(historyEntry);
            }
            //generate header, format:'(tailNumber) - (minDate)(maxDate)'
            aircraftElement.appendChild(document.createTextNode(aircraft[0].TailNumber + " - (" + formatTime(minDate) + " - " + formatTime(maxDate) + ")"))

            //attach Result Table
            aircraftElement.appendChild(historyElement);

            //generate footer (totalTime), format: 'Total of (totalTime) Nights - (hangerTime) Spent in a Hanger'
            var timeInHanger = timeMath(minDate,maxDate);
            aircraftElement.appendChild(document.createTextNode("Total of (" + timeInHanger + ") Nights - (" + hangerTime + ") Spent in a hanger"))
        
            //close <ol> element and enter it into <ul> element
            table.appendChild(aircraftElement); 
        }

        outputArea.appendChild(table);
    });
}
