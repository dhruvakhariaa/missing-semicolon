'use client';

import { useState, useEffect } from 'react';

export function WeatherWidget() {
    const [weather, setWeather] = useState<any>(null);

    useEffect(() => {
        fetch('http://localhost:3002/api/agriculture/weather?location=Village')
            .then(res => res.json())
            .then(data => {
                if (data.success) setWeather(data.data);
            })
            .catch(err => console.error(err));
    }, []);

    if (!weather) return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;

    const today = weather.forecast[0];

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{weather.location}</h2>
                    <p className="opacity-90">{today.condition}</p>
                </div>
                <div className="text-4xl font-bold">{today.temp}°C</div>
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-medium opacity-80 mb-3">7-Day Forecast</h4>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {weather.forecast.map((day: any, idx: number) => (
                        <div key={idx} className="flex-shrink-0 text-center bg-white/10 rounded p-2 min-w-[3.5rem]">
                            <p className="text-xs font-medium">{day.day}</p>
                            <p className="text-lg font-bold my-1">{day.temp}°</p>
                            <p className="text-[10px] opacity-80">{day.condition}</p>
                        </div>
                    ))}
                </div>
            </div>

            {today.alert !== 'Normal' && (
                <div className="mt-4 bg-red-500/90 p-3 rounded-md text-sm font-medium flex items-center gap-2">
                    ⚠️ {today.alert}
                </div>
            )}
        </div>
    );
}
