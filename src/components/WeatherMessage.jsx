import { useEffect, useState, useRef } from "react";

const weatherBackgrounds = {
  clear: "from-yellow-400 to-orange-500",
  rain: "from-blue-600 to-indigo-700",
  cloudy: "from-gray-400 to-gray-600",
  snow: "from-blue-200 to-blue-400",
  thunderstorm: "from-purple-800 to-purple-900",
  default: "from-gray-300 to-gray-500",
};

const getWeatherType = (condition) => {
  condition = condition.toLowerCase();
  if (condition.includes("rain")) return "rain";
  if (condition.includes("cloud")) return "cloudy";
  if (condition.includes("snow")) return "snow";
  if (condition.includes("thunder")) return "thunderstorm";
  if (condition.includes("clear") || condition.includes("sunny")) return "clear";
  return "default";
};

const WeatherMessage = () => {
  const [message, setMessage] = useState("Checking weather...");
  const [temp, setTemp] = useState(null);
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(true);
  const [localtime, setLocaltime] = useState("");
  const [location, setLocation] = useState("Bellandur, Bengaluru");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const intervalRef = useRef(null);

  const fetchWeather = async (loc) => {
    setLoading(true);
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const query = loc || location;
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
      const res = await fetch(proxyUrl);
      const jsonWrapped = await res.json();
      const data = JSON.parse(jsonWrapped.contents);

      const condText = data.current.condition.text;
      const tempC = data.current.temp_c;
      const locName = `${data.location.name}, ${data.location.region || ""}`.trim();
      const localtimeStr = data.location.localtime;

      setCondition(condText);
      setTemp(tempC);
      setLocation(locName);
      setLocaltime(localtimeStr);

      if (condText.toLowerCase().includes("rain")) {
        setMessage("🌧️ It's raining today. Consider working from home.");
      } else {
        setMessage("☀️ Weather is clear. You can go to the office.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("❌ Failed to fetch weather.");
      setCondition("");
      setTemp(null);
      setLocaltime("");
      setLocation("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchWeather(location);
    }, 60000);

    return () => clearInterval(intervalRef.current);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() !== "") {
      setLocation(search.trim());
      setSearch("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion);
    setSearch("");
    setSuggestions([]);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${encodeURIComponent(search)}`);
        const data = await res.json();
        const indianCities = data.filter((loc) => loc.country === "India").map((loc) => `${loc.name}, ${loc.region}`);
        setSuggestions(indianCities);
      } catch (error) {
        console.error("Suggestion fetch error:", error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [search]);

  const weatherType = getWeatherType(condition);
  const bgClass = weatherBackgrounds[weatherType];

  return (
    <div
      className={`h-screen w-screen flex flex-col pb-12 pt-8 items-center justify-center bg-gradient-to-br ${bgClass} font-poppins relative overflow-hidden text-white px-4`}
    >
      <form
        onSubmit={handleSearch}
        className="absolute z-50 top-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4"
      >
        <input
          type="text"
          placeholder="Search location (e.g. Chikkamagaluru)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full py-3 px-5 text-gray-900 font-semibold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Search location"
        />
        {suggestions.length > 0 && (
          <ul className="absolute bg-white text-black w-full rounded-lg mt-2 max-h-60 overflow-y-auto shadow-lg z-100">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 cursor-pointer hover:bg-yellow-100"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* Animated clouds */}
      <div className="absolute top-20 left-6 opacity-30 animate-floatClouds pointer-events-none select-none hidden md:block">
        <svg width="120" height="60" fill="white" viewBox="0 0 64 39">
          <ellipse cx="20" cy="20" rx="20" ry="12" />
          <ellipse cx="40" cy="20" rx="20" ry="12" />
        </svg>
      </div>
      <div className="absolute top-32 right-6 opacity-20 animate-floatCloudsSlow pointer-events-none select-none hidden md:block">
        <svg width="150" height="80" fill="white" viewBox="0 0 64 39">
          <ellipse cx="20" cy="20" rx="20" ry="12" />
          <ellipse cx="40" cy="20" rx="20" ry="12" />
        </svg>
      </div>

      {/* Weather Card */}
      <div
        className="relative bg-black bg-opacity-40 rounded-3xl p-6 max-w-lg w-full shadow-2xl backdrop-blur-md flex flex-col items-center text-center animate-fadeIn mt-20 sm:mt-28"
      >
        {loading ? (
          <div className="flex justify-center py-20">
            <svg
              className="animate-spin h-12 w-12 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 tracking-tight">
              WFH Weather Notifier
            </h1>
            <p className="text-lg sm:text-2xl mb-6 px-2">{message}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-10">
              <img
                src={`https:${condition
                  .toLowerCase().includes("rain")
                    ? "//cdn.weatherapi.com/weather/128x128/day/296.png"
                    : condition.toLowerCase().includes("cloud")
                    ? "//cdn.weatherapi.com/weather/128x128/day/119.png"
                    : condition.toLowerCase().includes("clear")
                    ? "//cdn.weatherapi.com/weather/128x128/day/113.png"
                    : "//cdn.weatherapi.com/weather/128x128/day/116.png"
                }`}
                alt={condition}
                className="w-20 h-20 sm:w-32 sm:h-32 drop-shadow-lg animate-bounce-slow"
              />
              <div className="text-left">
                <p className="text-5xl sm:text-7xl font-extrabold">{temp !== null ? temp : "--"}°C</p>
                <p className="text-xl sm:text-2xl opacity-90 mt-1">{condition || "No data"}</p>
              </div>
            </div>

            <div className="mt-8 opacity-70 text-base sm:text-lg">
              <p className="font-semibold">{location || "Unknown location"}</p>
              <p>{localtime || ""}</p>
            </div>
          </>
        )}
      </div>

      {/* Animations and fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
        @keyframes floatClouds {
          0% { transform: translateX(0); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(0); }
        }
        .animate-floatClouds {
          animation: floatClouds 9s ease-in-out infinite;
        }
        @keyframes floatCloudsSlow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-15px); }
          100% { transform: translateX(0); }
        }
        .animate-floatCloudsSlow {
          animation: floatCloudsSlow 14s ease-in-out infinite;
        }
        @keyframes fadeIn {
          0% {opacity: 0; transform: translateY(10px);}
          100% {opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
      `}</style>
      <p className="text-sm text-white mt-4 flex items-center justify-center space-x-2 select-none">
  <span>Developed by <span className="font-semibold">Sumedh M Anvekar</span> -</span>
  <a
    href="https://www.linkedin.com/in/sumedhmanvekar"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-1 underline text-yellow-300 hover:text-yellow-400 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.21 8.82h4.56V24H.21zM8.75 8.82h4.37v2.07h.06c.61-1.16 2.12-2.39 4.36-2.39 4.67 0 5.53 3.07 5.53 7.05V24h-4.56v-7.81c0-1.86-.03-4.25-2.6-4.25-2.6 0-3 2.04-3 4.14V24H8.75z" />
    </svg>
    <span>LinkedIn</span>
  </a>
</p>


    </div>
  );
};

export default WeatherMessage;