import React, { useState, useEffect } from 'react';
import Icon from 'react-icons-kit';
import { search } from 'react-icons-kit/feather/search';
import { arrowUp } from 'react-icons-kit/feather/arrowUp';
import { arrowDown } from 'react-icons-kit/feather/arrowDown';
import { droplet } from 'react-icons-kit/feather/droplet';
import { wind } from 'react-icons-kit/feather/wind';
import { activity } from 'react-icons-kit/feather/activity';
import { SphereSpinner } from 'react-spinners-kit';
import { useGetCityDataQuery, useGet5DaysForecastQuery } from './Store/Slices/weatherApi';
import { skipToken } from '@reduxjs/toolkit/query';

const App = () => {
  // city and unit state
  const [city, setCity] = useState('New York');
  const [unit, setUnit] = useState('imperial');
  const [triggerFetch, setTriggerFetch] = useState(false);

  // fetch city data
  const { data: citySearchData, error: citySearchError, isLoading: citySearchLoading, refetch: refetchCityData } = useGetCityDataQuery({ city, unit }, { skip: !triggerFetch && city !== 'New York' });

  // fetch 5 days forecast data
  const { data: forecastData, error: forecastError, isLoading: forecastLoading } = useGet5DaysForecastQuery(
    citySearchData ? { lat: citySearchData.coord.lat, lon: citySearchData.coord.lon, unit } : skipToken,
    { skip: !citySearchData }
  );

  useEffect(() => {
    // Fetch weather data for the default city on initial load
    setTriggerFetch(true);
    refetchCityData();
  }, [refetchCityData]);

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const fetchData = () => {
    setTriggerFetch(true);
    refetchCityData();
  };

  const loadings = citySearchLoading || forecastLoading;

  const filterForecastByFirstObjTime = (forecastData) => {
    if (!forecastData) {
      return [];
    }

    const firstObjTime = forecastData.list[0].dt_txt.split(' ')[1];
    return forecastData.list.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData);

  return (
    <div className="background">
      <div className="box">
        {/* city search form */}
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <label>
            <Icon icon={search} size={20} />
          </label>
          <input
            type="text"
            className="city-input"
            placeholder="Enter City"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            readOnly={loadings}
          />
          <button type="submit" onClick={fetchData}>GO</button>
        </form>

        {/* Current Weather Details Box */}
        <div className="current-weather-details-box">
          <div className="details-box-header">
            <h4>Current Weather</h4>

            <div className="switch" onClick={toggleUnit}>
              <div className={`switch-toggle ${unit === 'metric' ? 'c' : 'f'}`}></div>
              <span className="c">C</span>
              <span className="f">F</span>
            </div>
          </div>
          {loadings ? (
            <div className="loader">
              <SphereSpinner loading={loadings} color="#2fa5ed" size={20} />
            </div>
          ) : (
            <>
              {citySearchError ? (
                <div className="error-msg">{citySearchError.message}</div>
              ) : (
                <>
                  {forecastError ? (
                    <div className="error-msg">{forecastError.message}</div>
                  ) : (
                    <>
                      {citySearchData ? (
                        <div className="weather-details-container">
                          {/* details */}
                          <div className="details">
                            <h4 className="city-name">{citySearchData.name}</h4>

                            <div className="icon-and-temp">
                              <img
                                src={`https://openweathermap.org/img/wn/${citySearchData.weather[0].icon}@2x.png`}
                                alt="icon"
                              />
                              <h1>{citySearchData.main.temp}&deg;</h1>
                            </div>

                            <h4 className="description">{citySearchData.weather[0].description}</h4>
                          </div>

                          {/* metrices */}
                          <div className="metrices">
                            {/* feels like */}
                            <h4>
                              Feels like {citySearchData.main.feels_like}&deg;
                            </h4>

                            {/* min max temp */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={arrowUp} size={20} className="icon" />
                                <span className="value">{citySearchData.main.temp_max}&deg;</span>
                              </div>
                              <div className="key">
                                <Icon icon={arrowDown} size={20} className="icon" />
                                <span className="value">{citySearchData.main.temp_min}&deg;</span>
                              </div>
                            </div>

                            {/* humidity */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={droplet} size={20} className="icon" />
                                <span>Humidity</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.main.humidity}%</span>
                              </div>
                            </div>

                            {/* wind */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={wind} size={20} className="icon" />
                                <span>Wind</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.wind.speed}kph</span>
                              </div>
                            </div>

                            {/* pressure */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={activity} size={20} className="icon" />
                                <span>Pressure</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.main.pressure}hPa</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="error-msg">No Data Found</div>
                      )}
                      {/* extended forecastData */}
                      <h4 className="extended-forecast-heading">Extended Forecast</h4>
                      {filteredForecast.length > 0 ? (
                        <div className="extended-forecasts-container">
                          {filteredForecast.map((data, index) => {
                            const date = new Date(data.dt_txt);
                            const day = date.toLocaleDateString('en-US', {
                              weekday: 'short',
                            });
                            return (
                              <div className="forecast-box" key={index}>
                                <h5>{day}</h5>
                                <img
                                  src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                                  alt="icon"
                                />
                                <h5>{data.weather[0].description}</h5>
                                <h5 className="min-max-temp">
                                  {data.main.temp_max}&deg; / {data.main.temp_min}&deg;
                                </h5>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="error-msg">No Data Found</div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;