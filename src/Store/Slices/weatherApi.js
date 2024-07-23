import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { appId, hostName } from '../../config/config';

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({ baseUrl: hostName }),
  endpoints: (builder) => ({
    getCityData: builder.query({
      query: ({ city, unit }) => `data/2.5/weather?q=${city}&units=${unit}&APPID=${appId}`,
    }),
    get5DaysForecast: builder.query({
      query: ({ lat, lon, unit }) => `data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&APPID=${appId}`,
    }),
  }),
});

export const { useGetCityDataQuery, useGet5DaysForecastQuery } = weatherApi;