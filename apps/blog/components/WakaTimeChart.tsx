"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WakaTimeData {
  date: string;
  hours: number;
  language: string;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  className?: string;
  title?: string;
  height?: number;
}

export function WakaTimeChart({ data, className, title, height = 300 }: WakaTimeChartProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Group data by language
  const languageData = data.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = {};
    acc[item.date][item.language] = item.hours;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const dates = Object.keys(languageData);
  const languages = Array.from(new Set(data.map(d => d.language)));

  // Prepare chart data
  const chartData = dates.map(date => {
    const dateObj: any = { date };
    languages.forEach(lang => {
      dateObj[lang] = languageData[date][lang] || 0;
    });
    return dateObj;
  });

  // Get colors for languages
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300",
    "#a4de6c", "#d0ed57", "#ffc0cb", "#00ced1",
    "#ff1493", "#9370db", "#3cb371", "#ff6347"
  ];

  const getLanguageColor = (language: string) => {
    const index = languages.indexOf(language);
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}h
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {languages.map((language) => (
            <button
              key={language}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedLanguage === language
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedLanguage(
                selectedLanguage === language ? null : language
              )}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getLanguageColor(language) }}
              />
              {language}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {languages
              .filter(lang => !selectedLanguage || lang === selectedLanguage)
              .map((language) => (
                <Area
                  key={language}
                  type="monotone"
                  dataKey={language}
                  stroke={getLanguageColor(language)}
                  fill={getLanguageColor(language)}
                  fillOpacity={0.3}
                  stackId="1"
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-gray-500 mt-4">
        <strong>Tip:</strong> Click on language tags to filter/zoom in on specific languages
      </div>
    </div>
  );
}