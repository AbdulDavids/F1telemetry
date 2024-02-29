// Fetch the data from the API
fetch('https://api.openf1.org/v1/sessions?session_key=latest')
    .then(response => response.json())
    .then(data => {
        // Get the session type, circuit short name, and end date from the first object in the data array
        let session = data[0]; // Assuming the first object is the relevant session
        let sessionType = session.session_type;
        let circuitShortName = session.circuit_short_name;
        let endDate = new Date(session.date_end);
        let sessionName = session.session_name;
        let location = session.location;
        let countryName = session.country_name;

        console.log('Session Data:', data);

        // Check if the current time is less than the end date


        // Update the text content of the divs
        let sessionTypeDiv = document.getElementById('sessionType');
        sessionTypeDiv.textContent = sessionType;
        let circuitShortNameDiv = document.getElementById('circuitShortName');
        circuitShortNameDiv.textContent = circuitShortName;


    })
    .catch(error => console.error('Error:', error));




/////////////////////////////////////////////////////////////////////////////////////
// Load the drivers data from the API and populate the dropdown
fetch('https://api.openf1.org/v1/drivers?session_key=latest')
    .then(response => response.json())
    .then(data => {
        // Get the dropdown element
        const dropdown = document.getElementById('driversDropdown');

        // Populate the dropdown with the data
        data.forEach(driver => {
            const option = document.createElement('option');
            option.value = driver.driver_number; // Use driver_number as the value
            option.text = driver.full_name; // Use full_name as the display text
            dropdown.add(option);
        });
    })
    .catch(error => console.error('Error:', error));



//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



// Set an interval to update the timestamp
//let timestampIntervalId = setInterval(() => {
// let now = new Date();
// let timestampDiv = document.getElementById('timestamp');
// timestampDiv.textContent = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
// }, 50); // Update approximately 20 times per second



//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////




// Set placeholders for each piece of telemetry data
let headers = {
    'brake': '000',
    'driverNumber': '1',
    'drs': 'UNKNOWN',
    'n_gear': 'N',
    'rpm': '00000',
    'speed': '000',
    'throttle': '000',
    'circuitShortName': 'N/A',
};

for (let header in headers) {
    let div = document.getElementById(header);
    div.textContent = headers[header];
}




//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////




// Get the selected driver's number from the dropdown
let dropdown = document.getElementById('driversDropdown');
let dataIntervalId;

dropdown.addEventListener('change', function() {
    // Clear the previous interval if it exists
    if (dataIntervalId) {
        clearInterval(dataIntervalId);
    }

    let driverNumber = dropdown.options[dropdown.selectedIndex].value;

    console.log("driver: " + driverNumber);

    let driverNumberDiv = document.getElementById('driverNumber');
    driverNumberDiv.textContent = driverNumber;

    lastTime = "2024-02-29T10:30:00";

    // Set up an interval to fetch the data
    dataIntervalId = setInterval(() => {
        // Calculate the timestamp for a couple of minutes ago
        let date = new Date();
        date.setMinutes(date.getMinutes() - 2);
        let timestamp = date.toISOString();

        // Construct the API URL
        let apiUrl = `https://api.openf1.org/v1/car_data?driver_number=${driverNumber}&session_key=latest&date>${lastTime}`;

        // Use Fetch API to get the data
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Get the latest telemetry data
                let latestData = data[data.length - 1];

                // Check if latestData is not undefined
                if (latestData) {
                    console.log('Data:', latestData);
                    // Update the placeholders with the latest data
                    let headers = ['brake', 'rpm', 'speed', 'throttle'];
                    headers.forEach(header => {
                        smoothUpdate(header, latestData[header], 1000); // duration is 500ms
                    });

                    let time = latestData['date'];
                    lastTime = time;
                    let timeDiv = document.getElementById('timestamp');
                    timeDiv.textContent = time.substring(11, 22);
                    console.log('Time:', time);

                    // Update 'n_gear' and 'drs' without smooth update
                    let nGearDiv = document.getElementById('n_gear');
                    nGearDiv.textContent = latestData['n_gear'];

                    let drsValue = latestData['drs']; // Assuming this is where you get the DRS value from

                    let drsInterpretation;
                    switch (drsValue) {
                        case 0:
                        case 1:
                            drsInterpretation = 'OFF';
                            break;
                        case 8:
                            drsInterpretation = 'AVAILABLE';
                            break;
                        case 10:
                        case 12:
                        case 14:
                            drsInterpretation = 'ACTIVE';
                            break;
                        default:
                            drsInterpretation = 'UNKNOWN';
                            break;
                    }

                    let drsDiv = document.getElementById('drs');
                    drsDiv.textContent = drsInterpretation;

                } else {
                    console.log('No new data available');
                }
            })
            .catch(error => console.error('Error:', error));
    }, 350); // Fetch data approximately 3.7 times per second
});


//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
function smoothUpdate(elementId, targetValue, duration) {
    const element = document.getElementById(elementId);
    let currentValue = parseFloat(element.textContent);
    targetValue = parseFloat(targetValue);

    // Calculate the difference and the increment per millisecond
    const difference = targetValue - currentValue;
    const increment = difference / duration;

    // Start the interval
    const intervalId = setInterval(() => {
        // Increment the current value
        currentValue += increment;

        // If the current value has reached the target value, stop the interval
        if ((increment > 0 && currentValue >= targetValue) || (increment < 0 && currentValue <= targetValue)) {
            currentValue = targetValue;
            clearInterval(intervalId);
        }

        // Update the text content of the element
        element.textContent = currentValue.toFixed(2); // You can adjust the precision as needed
    }, 100); // Run approximately 1000 times per second
}