document.addEventListener('DOMContentLoaded', () => {
    const apiKeyWeather = "68dafd02defdf46d8603ddb7a5300a9e";
    const apiUrlWeather = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";
    const apiKeyTimeZone = "V6UPKV4LL3B8"; // Replace with your TimeZoneDB API key
    const apiUrlTimeZone = "http://api.timezonedb.com/v2.1/get-time-zone?format=json&by=position";
    const apiUrlEarthquake = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=";
    
    const searchBox = document.querySelector(".search1");
    const searchBtn = document.querySelector(".but");
    const icon = document.querySelector(".im");

    // Function to get the time zone from coordinates
    async function getTimeZone(lat, lon) {
        try {
            const response = await fetch(
                `${apiUrlTimeZone}&lat=${lat}&lng=${lon}&key=${apiKeyTimeZone}`
            );
            const data = await response.json();
            if (data.status === "FAILED") throw new Error(data.message);
            return data.zoneName; // Returns the time zone name (e.g., "Asia/Tokyo")
        } catch (error) {
            console.error("Error fetching time zone:", error.message);
            return null;
        }
    }

    // Function to format time for a given time zone
    function getInternationalDateTime(timeZone) {
        try {
            const options = {
                timeZone: timeZone,
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            return formatter.format(new Date());
        } catch (error) {
            console.error('Invalid time zone:', error.message);
            return "Invalid Time Zone";
        }
    }

    // Function to calculate Earthquake Prediction (based on Hazard × Vulnerability)
    async function getEarthquakeRisk(lat, lon) {
        try {
            // Fetch earthquake data from USGS Earthquake API
            const response = await fetch(`${apiUrlEarthquake}${lat}&longitude=${lon}&maxradius=100`);
            const data = await response.json();

            if (data.features.length === 0) {
                return "No recent earthquakes detected in the area.";
            }

            // For simplicity, we'll use the earthquake magnitude (hazard) as a prediction factor
            const mostRecentEarthquake = data.features[0];
            const magnitude = mostRecentEarthquake.properties.mag;

            let hazard = magnitude; // Hazard factor based on magnitude
            let vulnerability = 0.5; // Assumed vulnerability factor (can be adjusted)

            // Example of risk calculation (hazard × vulnerability)
            const disasterRisk = hazard * vulnerability;

            return ` Earthquake Magnitude: ${magnitude}, Disaster Risk: ${disasterRisk.toFixed(2)}`;
        } catch (error) {
            console.error("Error fetching earthquake data:", error.message);
            return "Error fetching earthquake data.";
        }
    }

    // Function to check weather for a city and display weather and time
    async function checkWeather(city) {
        try {
            const response = await fetch(apiUrlWeather + city + `&appid=${apiKeyWeather}`);
            if (!response.ok) throw new Error("City not found");

            const data = await response.json();
            console.log(data);

            // Populate weather details
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
            document.querySelector(".desc").innerHTML = data.weather[0].main;
            document.querySelector(".humidity").innerHTML = "Humidity: " + data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = "Wind: " + data.wind.speed + " Km/h";

            // Adjust weather icon
            if (data.weather[0].main === "Clouds") {
                icon.src = "./clouds.png";
            } else if (data.weather[0].main === "Rain") {
                icon.src = "./rain.png";
            } else if (data.weather[0].main === "Drizzle") {
                icon.src = "./drizzle.png";
            } else if (data.weather[0].main === "Mist") {
                icon.src = "https://as1.ftcdn.net/v2/jpg/02/57/93/18/1000_F_257931827_TpuS3ufGnaOug9ZLkDaCAOZA4xa0G2za.jpg";
            } else if (data.weather[0].main === "Clear") {
                icon.src = "./clear.png";
            }

            // Fetch and display local time using nearest time zone
            const timeZone = await getTimeZone(data.coord.lat, data.coord.lon);
            if (timeZone) {
                const localTime = getInternationalDateTime(timeZone);
                document.querySelector(".time").innerHTML = "Date & Time: " + localTime;
            } else {
                document.querySelector(".time").innerHTML = "Time Zone Not Found";
            }

            // Get and display earthquake risk for the city
            const earthquakeRisk = await getEarthquakeRisk(data.coord.lat, data.coord.lon);
            document.querySelector(".earthquakeRisk").innerHTML = earthquakeRisk;
        } catch (error) {
            alert(error.message);
        }
    }

    // Event listener to trigger weather and earthquake data check on button click
    searchBtn.addEventListener("click", () => {
        checkWeather(searchBox.value);
    });
});
