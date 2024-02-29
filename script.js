
fetch('https://api.openf1.org/v1/sessions?session_key=latest')
    .then(response => response.json())
    .then(data => {
        let session = data[0];
        let sessionType = session.session_name;
        let circuitShortName = session.circuit_short_name;
        let endDate = new Date(session.date_end);
        let sessionName = session.session_name;
        let location = session.location;
        let countryName = session.country_name;

        console.log('Session Data:', data);



        let sessionTypeDiv = document.getElementById('sessionType');
        sessionTypeDiv.textContent = sessionType;
        let circuitShortNameDiv = document.getElementById('circuitShortName');
        circuitShortNameDiv.textContent = circuitShortName;


    })
    .catch(error => console.error('Error:', error));


//////////////////////////////////////////////////////////////////////////////////////

fetch('https://api.openf1.org/v1/drivers?session_key=latest')
    .then(response => response.json())
    .then(data => {
        const dropdown = document.getElementById('driversDropdown');

        data.forEach(driver => {
            const option = document.createElement('option');
            option.value = driver.driver_number;
            option.text = driver.full_name;
            dropdown.add(option);
        });
    })
    .catch(error => console.error('Error:', error));



//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



//let timestampIntervalId = setInterval(() => {
// let now = new Date();
// let timestampDiv = document.getElementById('timestamp');
// timestampDiv.textContent = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
// }, 50); // Update approximately 20 times per second



//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////




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




let dropdown = document.getElementById('driversDropdown');
let dataIntervalId;

dropdown.addEventListener('change', function() {
    if (dataIntervalId) {
        clearInterval(dataIntervalId);
    }

    let driverNumber = dropdown.options[dropdown.selectedIndex].value;

    console.log("driver: " + driverNumber);

    let driverNumberDiv = document.getElementById('driverNumber');
    driverNumberDiv.textContent = driverNumber;

    lastTime = "2024-02-29T10:30:00";

    dataIntervalId = setInterval(() => {
        let date = new Date();
        date.setMinutes(date.getMinutes() - 2);
        let timestamp = date.toISOString();

        let apiUrl = `https://api.openf1.org/v1/car_data?driver_number=${driverNumber}&session_key=latest&date>${lastTime}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                let latestData = data[data.length - 1];

                if (latestData) {
                    console.log('Data:', latestData);
                    let headers = ['brake', 'rpm', 'speed', 'throttle'];
                    headers.forEach(header => {
                        smoothUpdate(header, latestData[header], 1000); // duration is 500ms
                    });

                    let time = latestData['date'];
                    lastTime = time;
                    let timeDiv = document.getElementById('timestamp');
                    timeDiv.textContent = time.substring(11, 22);
                    console.log('Time:', time);

                    let nGearDiv = document.getElementById('n_gear');
                    nGearDiv.textContent = latestData['n_gear'];

                    let drsValue = latestData['drs']; // Assuming this is where you get the DRS value from

                    let drsInterpretation;
                    switch (drsValue) {
                        case 0:
                            drsInterpretation = 'OFF';
                            break;
                        case 1:
                            drsInterpretation = 'OFF';
                            break;
                        case 8:
                            drsInterpretation = 'AVAILABLE';
                            break;
                        case 10:
                            drsInterpretation = 'ACTIVE';
                            break;
                        case 12:
                            drsInterpretation = 'ACTIVE';
                            break;
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

    let animatedValue = Ola({value: currentValue}, duration);

    animatedValue.value = targetValue;

    const intervalId = setInterval(() => {
        element.textContent = animatedValue.value.toFixed(2); // You can adjust the precision as needed

        if (animatedValue.value === targetValue) {
            clearInterval(intervalId);
        }
    }, 100);
}