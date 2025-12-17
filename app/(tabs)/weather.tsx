import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Cloud, 
  Sun, 
  Wind, 
  Droplets, 
  MapPin, 
  Navigation, 
  Clock, 
  AlertTriangle, 
  CloudRain,
  Eye,
  Gauge,
  Umbrella,
  CloudSnow,
  CloudLightning,
  Sunrise,
  Sunset,
  Car,
  Shield,
  RefreshCw,
  ChevronRight,
  Waves,
  Zap,
  Moon,
  CloudFog
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    cloudCover: number;
    precipitation: number;
    weatherCode: number;
  };
  hourly: {
    time: string;
    temperature: number;
    weatherCode: number;
    precipitationProbability: number;
  }[];
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    precipitationProbability: number;
    sunrise: string;
    sunset: string;
    uvIndexMax: number;
  }[];
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    category: string;
  };
}

interface TrafficAlert {
  id: string;
  type: "accident" | "construction" | "congestion" | "weather" | "closure";
  title: string;
  description: string;
  distance: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
}

interface DrivingCondition {
  category: string;
  status: "excellent" | "good" | "fair" | "poor" | "dangerous";
  description: string;
  icon: React.ReactNode;
}

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear Sky", icon: "sun" },
  1: { label: "Mainly Clear", icon: "sun" },
  2: { label: "Partly Cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Foggy", icon: "fog" },
  48: { label: "Rime Fog", icon: "fog" },
  51: { label: "Light Drizzle", icon: "drizzle" },
  53: { label: "Moderate Drizzle", icon: "drizzle" },
  55: { label: "Dense Drizzle", icon: "drizzle" },
  61: { label: "Slight Rain", icon: "rain" },
  63: { label: "Moderate Rain", icon: "rain" },
  65: { label: "Heavy Rain", icon: "rain" },
  71: { label: "Slight Snow", icon: "snow" },
  73: { label: "Moderate Snow", icon: "snow" },
  75: { label: "Heavy Snow", icon: "snow" },
  80: { label: "Rain Showers", icon: "rain" },
  81: { label: "Moderate Showers", icon: "rain" },
  82: { label: "Violent Showers", icon: "rain" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm + Hail", icon: "storm" },
  99: { label: "Severe Storm", icon: "storm" },
};

const getWeatherIcon = (code: number, size: number = 24, isNight: boolean = false) => {
  const iconType = WEATHER_CODES[code]?.icon || "sun";
  const props = { size, strokeWidth: 1.5 };
  
  switch (iconType) {
    case "sun":
      return isNight ? <Moon {...props} color="#E2E8F0" /> : <Sun {...props} color="#FDB813" fill="#FDB813" />;
    case "cloud-sun":
      return <Cloud {...props} color="#94A3B8" />;
    case "cloud":
      return <Cloud {...props} color="#64748B" fill="#64748B" />;
    case "fog":
      return <CloudFog {...props} color="#94A3B8" />;
    case "drizzle":
      return <CloudRain {...props} color="#60A5FA" />;
    case "rain":
      return <CloudRain {...props} color="#3B82F6" fill="#3B82F6" />;
    case "snow":
      return <CloudSnow {...props} color="#E2E8F0" fill="#E2E8F0" />;
    case "storm":
      return <CloudLightning {...props} color="#F59E0B" />;
    default:
      return <Sun {...props} color="#FDB813" />;
  }
};

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return "#22C55E";
  if (aqi <= 100) return "#EAB308";
  if (aqi <= 150) return "#F97316";
  if (aqi <= 200) return "#EF4444";
  if (aqi <= 300) return "#A855F7";
  return "#7C2D12";
};

const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const getUVCategory = (uv: number): { label: string; color: string } => {
  if (uv <= 2) return { label: "Low", color: "#22C55E" };
  if (uv <= 5) return { label: "Moderate", color: "#EAB308" };
  if (uv <= 7) return { label: "High", color: "#F97316" };
  if (uv <= 10) return { label: "Very High", color: "#EF4444" };
  return { label: "Extreme", color: "#A855F7" };
};

const getDrivingScore = (weather: WeatherData): number => {
  let score = 100;
  
  if (weather.current.precipitation > 0) score -= 20;
  if (weather.current.precipitation > 5) score -= 15;
  if (weather.current.visibility < 5000) score -= 15;
  if (weather.current.visibility < 1000) score -= 20;
  if (weather.current.windSpeed > 40) score -= 15;
  if (weather.current.windSpeed > 60) score -= 15;
  if (weather.current.weatherCode >= 95) score -= 25;
  if (weather.airQuality.aqi > 150) score -= 10;
  
  return Math.max(0, score);
};

export default function WeatherScreen() {
  const [activeTab, setActiveTab] = useState<"weather" | "traffic" | "driving">("weather");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [location] = useState({ name: "Mumbai, India", lat: 19.076, lon: 72.8777 });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const fetchWeatherData = useCallback(async () => {
    try {
      console.log("Fetching weather data for:", location.name);
      
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
      
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,european_aqi`;
      
      const [weatherResponse, aqResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(airQualityUrl)
      ]);
      
      const weatherJson = await weatherResponse.json();
      const aqJson = await aqResponse.json();
      
      console.log("Weather API response received");
      
      const currentHour = new Date().getHours();
      
      const processedData: WeatherData = {
        current: {
          temperature: Math.round(weatherJson.current?.temperature_2m || 28),
          feelsLike: Math.round(weatherJson.current?.apparent_temperature || 30),
          humidity: weatherJson.current?.relative_humidity_2m || 65,
          windSpeed: Math.round(weatherJson.current?.wind_speed_10m || 12),
          windDirection: weatherJson.current?.wind_direction_10m || 180,
          pressure: Math.round(weatherJson.current?.pressure_msl || 1013),
          visibility: 10000,
          uvIndex: weatherJson.daily?.uv_index_max?.[0] || 6,
          cloudCover: weatherJson.current?.cloud_cover || 25,
          precipitation: weatherJson.current?.precipitation || 0,
          weatherCode: weatherJson.current?.weather_code || 0,
        },
        hourly: (weatherJson.hourly?.time || []).slice(currentHour, currentHour + 24).map((time: string, index: number) => ({
          time: new Date(time).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
          temperature: Math.round(weatherJson.hourly?.temperature_2m?.[currentHour + index] || 28),
          weatherCode: weatherJson.hourly?.weather_code?.[currentHour + index] || 0,
          precipitationProbability: weatherJson.hourly?.precipitation_probability?.[currentHour + index] || 0,
        })),
        daily: (weatherJson.daily?.time || []).slice(0, 7).map((date: string, index: number) => ({
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          tempMax: Math.round(weatherJson.daily?.temperature_2m_max?.[index] || 32),
          tempMin: Math.round(weatherJson.daily?.temperature_2m_min?.[index] || 24),
          weatherCode: weatherJson.daily?.weather_code?.[index] || 0,
          precipitationProbability: weatherJson.daily?.precipitation_probability_max?.[index] || 0,
          sunrise: new Date(weatherJson.daily?.sunrise?.[index] || Date.now()).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          sunset: new Date(weatherJson.daily?.sunset?.[index] || Date.now()).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          uvIndexMax: weatherJson.daily?.uv_index_max?.[index] || 6,
        })),
        airQuality: {
          aqi: aqJson.current?.european_aqi || 45,
          pm25: Math.round(aqJson.current?.pm2_5 || 12),
          pm10: Math.round(aqJson.current?.pm10 || 25),
          no2: Math.round(aqJson.current?.nitrogen_dioxide || 15),
          o3: Math.round(aqJson.current?.ozone || 45),
          category: getAQICategory(aqJson.current?.european_aqi || 45),
        },
      };
      
      setWeatherData(processedData);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeatherData(getMockWeatherData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location]);

  const getMockWeatherData = (): WeatherData => ({
    current: {
      temperature: 28,
      feelsLike: 31,
      humidity: 65,
      windSpeed: 12,
      windDirection: 180,
      pressure: 1013,
      visibility: 10000,
      uvIndex: 6,
      cloudCover: 25,
      precipitation: 0,
      weatherCode: 1,
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      time: `${(new Date().getHours() + i) % 24}:00`,
      temperature: 26 + Math.floor(Math.random() * 6),
      weatherCode: [0, 1, 2, 3][Math.floor(Math.random() * 4)],
      precipitationProbability: Math.floor(Math.random() * 30),
    })),
    daily: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        tempMax: 30 + Math.floor(Math.random() * 4),
        tempMin: 24 + Math.floor(Math.random() * 3),
        weatherCode: [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)],
        precipitationProbability: Math.floor(Math.random() * 50),
        sunrise: "6:15 AM",
        sunset: "6:45 PM",
        uvIndexMax: 6 + Math.floor(Math.random() * 3),
      };
    }),
    airQuality: {
      aqi: 45,
      pm25: 12,
      pm10: 25,
      no2: 15,
      o3: 45,
      category: "Good",
    },
  });

  const loadTrafficAlerts = useCallback(() => {
    const mockAlerts: TrafficAlert[] = [
      {
        id: "1",
        type: "accident",
        title: "Accident Reported",
        description: "Near Bandra-Worli Sea Link - Right lane blocked",
        distance: "3.2 km",
        severity: "high",
        timestamp: "5 min ago",
      },
      {
        id: "2",
        type: "construction",
        title: "Road Construction",
        description: "Andheri Flyover - Lane diversions in effect",
        distance: "5.8 km",
        severity: "medium",
        timestamp: "Updated 15 min ago",
      },
      {
        id: "3",
        type: "congestion",
        title: "Heavy Traffic",
        description: "Western Express Highway - Slow moving near Goregaon",
        distance: "8.1 km",
        severity: "medium",
        timestamp: "Live",
      },
      {
        id: "4",
        type: "weather",
        title: "Weather Warning",
        description: "Heavy rain expected - Reduced visibility on highways",
        distance: "Route-wide",
        severity: "high",
        timestamp: "Next 2 hours",
      },
      {
        id: "5",
        type: "closure",
        title: "Road Closure",
        description: "Marine Drive - Event closure from 4 PM to 10 PM",
        distance: "2.1 km",
        severity: "low",
        timestamp: "Scheduled",
      },
    ];
    setTrafficAlerts(mockAlerts);
  }, []);

  useEffect(() => {
    fetchWeatherData();
    loadTrafficAlerts();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const weatherInterval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    const trafficInterval = setInterval(loadTrafficAlerts, 5 * 60 * 1000);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(trafficInterval);
    };
  }, [fetchWeatherData, loadTrafficAlerts, fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeatherData();
    loadTrafficAlerts();
  }, [fetchWeatherData, loadTrafficAlerts]);

  const getDrivingConditions = (): DrivingCondition[] => {
    if (!weatherData) return [];
    
    const conditions: DrivingCondition[] = [
      {
        category: "Road Visibility",
        status: weatherData.current.visibility > 5000 ? "excellent" : 
                weatherData.current.visibility > 2000 ? "good" : 
                weatherData.current.visibility > 500 ? "fair" : "poor",
        description: weatherData.current.visibility > 5000 ? "Clear visibility" : 
                     weatherData.current.visibility > 2000 ? "Slightly reduced" : 
                     "Use fog lights",
        icon: <Eye size={20} color="#60A5FA" />,
      },
      {
        category: "Wind Conditions",
        status: weatherData.current.windSpeed < 20 ? "excellent" : 
                weatherData.current.windSpeed < 40 ? "good" : 
                weatherData.current.windSpeed < 60 ? "fair" : "dangerous",
        description: `${weatherData.current.windSpeed} km/h ${getWindDirection(weatherData.current.windDirection)}`,
        icon: <Wind size={20} color="#22D3EE" />,
      },
      {
        category: "Precipitation",
        status: weatherData.current.precipitation === 0 ? "excellent" : 
                weatherData.current.precipitation < 2 ? "good" : 
                weatherData.current.precipitation < 7 ? "fair" : "poor",
        description: weatherData.current.precipitation === 0 ? "No rain expected" : 
                     `${weatherData.current.precipitation} mm/h - Drive carefully`,
        icon: <Umbrella size={20} color="#818CF8" />,
      },
      {
        category: "Air Quality",
        status: weatherData.airQuality.aqi <= 50 ? "excellent" : 
                weatherData.airQuality.aqi <= 100 ? "good" : 
                weatherData.airQuality.aqi <= 150 ? "fair" : "poor",
        description: `AQI ${weatherData.airQuality.aqi} - ${weatherData.airQuality.category}`,
        icon: <Waves size={20} color="#34D399" />,
      },
    ];
    
    return conditions;
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "excellent": return "#22C55E";
      case "good": return "#84CC16";
      case "fair": return "#EAB308";
      case "poor": return "#F97316";
      case "dangerous": return "#EF4444";
      default: return "#64748B";
    }
  };

  const getAlertIcon = (type: TrafficAlert["type"]) => {
    switch (type) {
      case "accident": return <AlertTriangle size={20} color="#EF4444" />;
      case "construction": return <AlertTriangle size={20} color="#F59E0B" />;
      case "congestion": return <Clock size={20} color="#3B82F6" />;
      case "weather": return <CloudRain size={20} color="#8B5CF6" />;
      case "closure": return <Navigation size={20} color="#64748B" />;
      default: return <AlertTriangle size={20} color="#94A3B8" />;
    }
  };

  const getSeverityColor = (severity: TrafficAlert["severity"]): string => {
    switch (severity) {
      case "high": return "#EF4444";
      case "medium": return "#F59E0B";
      case "low": return "#22C55E";
      default: return "#64748B";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const drivingScore = weatherData ? getDrivingScore(weatherData) : 100;
  const drivingConditions = getDrivingConditions();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weather & Road</Text>
          <Text style={styles.lastUpdated}>
            Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {["weather", "traffic", "driving"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as typeof activeTab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {activeTab === "weather" && weatherData && (
          <View style={styles.weatherSection}>
            <LinearGradient
              colors={weatherData.current.weatherCode >= 61 ? ["#1E3A5F", "#0F172A"] : ["#3B82F6", "#1D4ED8"]}
              style={styles.mainWeatherCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.locationRow}>
                <MapPin color="white" size={16} />
                <Text style={styles.locationText}>{location.name}</Text>
              </View>

              <View style={styles.weatherMain}>
                <View>
                  <Text style={styles.tempText}>{weatherData.current.temperature}°</Text>
                  <Text style={styles.conditionText}>
                    {WEATHER_CODES[weatherData.current.weatherCode]?.label || "Clear"}
                  </Text>
                  <Text style={styles.feelsLikeText}>Feels like {weatherData.current.feelsLike}°</Text>
                </View>
                {getWeatherIcon(weatherData.current.weatherCode, 72)}
              </View>

              <View style={styles.weatherStatsGrid}>
                <View style={styles.statItem}>
                  <Wind color="rgba(255,255,255,0.7)" size={16} />
                  <Text style={styles.statValue}>{weatherData.current.windSpeed}</Text>
                  <Text style={styles.statLabel}>km/h</Text>
                </View>
                <View style={styles.statItem}>
                  <Droplets color="rgba(255,255,255,0.7)" size={16} />
                  <Text style={styles.statValue}>{weatherData.current.humidity}</Text>
                  <Text style={styles.statLabel}>%</Text>
                </View>
                <View style={styles.statItem}>
                  <Gauge color="rgba(255,255,255,0.7)" size={16} />
                  <Text style={styles.statValue}>{weatherData.current.pressure}</Text>
                  <Text style={styles.statLabel}>hPa</Text>
                </View>
                <View style={styles.statItem}>
                  <Zap color="rgba(255,255,255,0.7)" size={16} />
                  <Text style={styles.statValue}>{weatherData.current.uvIndex}</Text>
                  <Text style={styles.statLabel}>UV</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.rowCards}>
              <View style={[styles.miniCard, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
                <View style={styles.miniCardHeader}>
                  <Sunrise size={18} color="#22C55E" />
                  <Text style={styles.miniCardTitle}>Sunrise</Text>
                </View>
                <Text style={styles.miniCardValue}>{weatherData.daily[0]?.sunrise}</Text>
              </View>
              <View style={[styles.miniCard, { backgroundColor: "rgba(249, 115, 22, 0.15)" }]}>
                <View style={styles.miniCardHeader}>
                  <Sunset size={18} color="#F97316" />
                  <Text style={styles.miniCardTitle}>Sunset</Text>
                </View>
                <Text style={styles.miniCardValue}>{weatherData.daily[0]?.sunset}</Text>
              </View>
            </View>

            <View style={styles.aqiCard}>
              <View style={styles.aqiHeader}>
                <Text style={styles.sectionTitle}>Air Quality Index</Text>
                <View style={[styles.aqiBadge, { backgroundColor: getAQIColor(weatherData.airQuality.aqi) }]}>
                  <Text style={styles.aqiBadgeText}>{weatherData.airQuality.category}</Text>
                </View>
              </View>
              <View style={styles.aqiMain}>
                <Text style={[styles.aqiValue, { color: getAQIColor(weatherData.airQuality.aqi) }]}>
                  {weatherData.airQuality.aqi}
                </Text>
                <View style={styles.aqiDetails}>
                  <View style={styles.aqiDetailItem}>
                    <Text style={styles.aqiDetailLabel}>PM2.5</Text>
                    <Text style={styles.aqiDetailValue}>{weatherData.airQuality.pm25} µg/m³</Text>
                  </View>
                  <View style={styles.aqiDetailItem}>
                    <Text style={styles.aqiDetailLabel}>PM10</Text>
                    <Text style={styles.aqiDetailValue}>{weatherData.airQuality.pm10} µg/m³</Text>
                  </View>
                  <View style={styles.aqiDetailItem}>
                    <Text style={styles.aqiDetailLabel}>O₃</Text>
                    <Text style={styles.aqiDetailValue}>{weatherData.airQuality.o3} µg/m³</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Hourly Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
              {weatherData.hourly.slice(0, 12).map((item, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastTime}>{index === 0 ? "Now" : item.time}</Text>
                  {getWeatherIcon(item.weatherCode, 24)}
                  <Text style={styles.forecastTemp}>{item.temperature}°</Text>
                  {item.precipitationProbability > 0 && (
                    <View style={styles.precipRow}>
                      <Droplets size={10} color="#60A5FA" />
                      <Text style={styles.precipText}>{item.precipitationProbability}%</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            <View style={styles.dailyForecast}>
              {weatherData.daily.map((day, index) => (
                <View key={index} style={styles.dailyItem}>
                  <Text style={styles.dailyDay}>{index === 0 ? "Today" : day.date.split(",")[0]}</Text>
                  <View style={styles.dailyIconWrap}>
                    {getWeatherIcon(day.weatherCode, 22)}
                    {day.precipitationProbability > 20 && (
                      <Text style={styles.dailyPrecip}>{day.precipitationProbability}%</Text>
                    )}
                  </View>
                  <View style={styles.dailyTempBar}>
                    <Text style={styles.dailyTempMin}>{day.tempMin}°</Text>
                    <View style={styles.tempBarTrack}>
                      <View
                        style={[
                          styles.tempBarFill,
                          {
                            left: `${((day.tempMin - 20) / 20) * 100}%`,
                            width: `${((day.tempMax - day.tempMin) / 20) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.dailyTempMax}>{day.tempMax}°</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.uvCard}>
              <View style={styles.uvHeader}>
                <Zap size={20} color={getUVCategory(weatherData.current.uvIndex).color} />
                <Text style={styles.uvTitle}>UV Index</Text>
              </View>
              <Text style={[styles.uvValue, { color: getUVCategory(weatherData.current.uvIndex).color }]}>
                {weatherData.current.uvIndex}
              </Text>
              <Text style={[styles.uvCategory, { color: getUVCategory(weatherData.current.uvIndex).color }]}>
                {getUVCategory(weatherData.current.uvIndex).label}
              </Text>
              <Text style={styles.uvAdvice}>
                {weatherData.current.uvIndex > 5 ? "Wear sunscreen & sunglasses" : "Safe for outdoor activities"}
              </Text>
            </View>
          </View>
        )}

        {activeTab === "traffic" && (
          <View style={styles.trafficSection}>
            <View style={styles.trafficSummary}>
              <View style={styles.trafficSummaryIcon}>
                <Navigation size={28} color="#EF4444" />
              </View>
              <View style={styles.trafficSummaryContent}>
                <Text style={styles.trafficSummaryTitle}>Route Status</Text>
                <Text style={styles.trafficSummarySubtitle}>3 alerts on your frequent routes</Text>
              </View>
              <View style={styles.trafficDelay}>
                <Text style={styles.delayValue}>+18</Text>
                <Text style={styles.delayLabel}>min</Text>
              </View>
            </View>

            <View style={styles.mapPlaceholder}>
              <View style={styles.mapOverlay}>
                <MapPin size={32} color="#3B82F6" />
                <Text style={styles.mapText}>Live Traffic Map</Text>
                <Text style={styles.mapSubtext}>Real-time route visualization</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {trafficAlerts.map((alert) => (
              <TouchableOpacity key={alert.id} style={styles.alertCard} activeOpacity={0.7}>
                <View style={[styles.alertSeverity, { backgroundColor: getSeverityColor(alert.severity) }]} />
                <View style={styles.alertIconWrap}>{getAlertIcon(alert.type)}</View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDesc}>{alert.description}</Text>
                  <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
                </View>
                <View style={styles.alertRight}>
                  <Text style={styles.alertDist}>{alert.distance}</Text>
                  <ChevronRight size={16} color="#64748B" />
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.updateInfo}>
              <Clock size={14} color="#64748B" />
              <Text style={styles.updateText}>Traffic updates every 5 minutes</Text>
            </View>
          </View>
        )}

        {activeTab === "driving" && weatherData && (
          <View style={styles.drivingSection}>
            <LinearGradient
              colors={drivingScore >= 80 ? ["#166534", "#14532D"] : 
                     drivingScore >= 60 ? ["#854D0E", "#713F12"] : 
                     ["#991B1B", "#7F1D1D"]}
              style={styles.drivingScoreCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.drivingScoreHeader}>
                <Car size={24} color="white" />
                <Text style={styles.drivingScoreTitle}>Driving Conditions</Text>
              </View>
              <View style={styles.drivingScoreMain}>
                <Text style={styles.drivingScoreValue}>{drivingScore}</Text>
                <Text style={styles.drivingScoreLabel}>
                  {drivingScore >= 80 ? "Excellent" : 
                   drivingScore >= 60 ? "Good" : 
                   drivingScore >= 40 ? "Fair" : "Poor"}
                </Text>
              </View>
              <View style={styles.drivingScoreBar}>
                <View style={[styles.drivingScoreFill, { width: `${drivingScore}%` }]} />
              </View>
              <Text style={styles.drivingAdvice}>
                {drivingScore >= 80 ? "Great conditions for driving" : 
                 drivingScore >= 60 ? "Drive with caution" : 
                 "Consider postponing non-essential travel"}
              </Text>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Condition Breakdown</Text>
            {drivingConditions.map((condition, index) => (
              <View key={index} style={styles.conditionCard}>
                <View style={styles.conditionIcon}>{condition.icon}</View>
                <View style={styles.conditionContent}>
                  <Text style={styles.conditionCategory}>{condition.category}</Text>
                  <Text style={styles.conditionDesc}>{condition.description}</Text>
                </View>
                <View style={[styles.conditionStatus, { backgroundColor: getStatusColor(condition.status) }]}>
                  <Text style={styles.conditionStatusText}>
                    {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.safetyTips}>
              <View style={styles.safetyHeader}>
                <Shield size={20} color="#F59E0B" />
                <Text style={styles.safetyTitle}>Safety Tips</Text>
              </View>
              <View style={styles.tipsList}>
                {weatherData.current.precipitation > 0 && (
                  <Text style={styles.tipItem}>• Reduce speed and increase following distance</Text>
                )}
                {weatherData.current.windSpeed > 30 && (
                  <Text style={styles.tipItem}>• Hold steering wheel firmly, watch for debris</Text>
                )}
                {weatherData.airQuality.aqi > 100 && (
                  <Text style={styles.tipItem}>• Keep windows closed, use recirculated air</Text>
                )}
                {weatherData.current.uvIndex > 6 && (
                  <Text style={styles.tipItem}>• Use sun visor, consider polarized sunglasses</Text>
                )}
                <Text style={styles.tipItem}>• Check tire pressure before long trips</Text>
                <Text style={styles.tipItem}>• Ensure all lights are working properly</Text>
              </View>
            </View>

            <View style={styles.nextHoursCard}>
              <Text style={styles.nextHoursTitle}>Next 6 Hours</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {weatherData.hourly.slice(0, 6).map((hour, index) => (
                  <View key={index} style={styles.nextHourItem}>
                    <Text style={styles.nextHourTime}>{index === 0 ? "Now" : hour.time}</Text>
                    {getWeatherIcon(hour.weatherCode, 20)}
                    <Text style={styles.nextHourTemp}>{hour.temperature}°</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "white",
    letterSpacing: -0.5,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  activeTab: {
    backgroundColor: "#3B82F6",
  },
  tabText: {
    color: "#94A3B8",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  weatherSection: {
    gap: 16,
  },
  mainWeatherCard: {
    padding: 20,
    borderRadius: 24,
    width: "100%",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500" as const,
  },
  weatherMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tempText: {
    fontSize: 64,
    fontWeight: "200" as const,
    color: "white",
    lineHeight: 70,
  },
  conditionText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500" as const,
  },
  feelsLikeText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  weatherStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
  },
  rowCards: {
    flexDirection: "row",
    gap: 12,
  },
  miniCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
  },
  miniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  miniCardTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500" as const,
  },
  miniCardValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  aqiCard: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 20,
    padding: 16,
  },
  aqiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aqiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aqiBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  aqiMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  aqiValue: {
    fontSize: 48,
    fontWeight: "700" as const,
  },
  aqiDetails: {
    flex: 1,
    gap: 6,
  },
  aqiDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  aqiDetailLabel: {
    color: "#64748B",
    fontSize: 13,
  },
  aqiDetailValue: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500" as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "white",
    marginTop: 8,
    marginBottom: 12,
  },
  forecastScroll: {
    marginBottom: 8,
  },
  forecastItem: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    marginRight: 10,
    width: 72,
    gap: 8,
  },
  forecastTime: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500" as const,
  },
  forecastTemp: {
    color: "white",
    fontWeight: "600" as const,
    fontSize: 16,
  },
  precipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  precipText: {
    color: "#60A5FA",
    fontSize: 10,
  },
  dailyForecast: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 20,
    padding: 4,
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  dailyDay: {
    color: "white",
    fontSize: 14,
    fontWeight: "500" as const,
    width: 60,
  },
  dailyIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  dailyPrecip: {
    color: "#60A5FA",
    fontSize: 11,
  },
  dailyTempBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dailyTempMin: {
    color: "#64748B",
    fontSize: 14,
    width: 30,
    textAlign: "right" as const,
  },
  dailyTempMax: {
    color: "white",
    fontSize: 14,
    fontWeight: "500" as const,
    width: 30,
  },
  tempBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  tempBarFill: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  uvCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  uvHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  uvTitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  uvValue: {
    fontSize: 48,
    fontWeight: "700" as const,
  },
  uvCategory: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  uvAdvice: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center" as const,
  },
  trafficSection: {
    gap: 16,
  },
  trafficSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  trafficSummaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  trafficSummaryContent: {
    flex: 1,
  },
  trafficSummaryTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  trafficSummarySubtitle: {
    color: "#94A3B8",
    fontSize: 13,
  },
  trafficDelay: {
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  delayValue: {
    color: "#EF4444",
    fontSize: 20,
    fontWeight: "700" as const,
  },
  delayLabel: {
    color: "#EF4444",
    fontSize: 11,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  mapOverlay: {
    alignItems: "center",
    gap: 8,
  },
  mapText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  mapSubtext: {
    color: "#64748B",
    fontSize: 13,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 16,
    overflow: "hidden",
  },
  alertSeverity: {
    width: 4,
    alignSelf: "stretch",
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  alertContent: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
  },
  alertTitle: {
    color: "white",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  alertDesc: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  alertTimestamp: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },
  alertRight: {
    alignItems: "flex-end",
    paddingRight: 12,
    gap: 4,
  },
  alertDist: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500" as const,
  },
  updateInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  updateText: {
    color: "#64748B",
    fontSize: 12,
  },
  drivingSection: {
    gap: 16,
  },
  drivingScoreCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  drivingScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  drivingScoreTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  drivingScoreMain: {
    alignItems: "center",
    marginBottom: 16,
  },
  drivingScoreValue: {
    fontSize: 72,
    fontWeight: "200" as const,
    color: "white",
    lineHeight: 80,
  },
  drivingScoreLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    fontWeight: "500" as const,
  },
  drivingScoreBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 16,
  },
  drivingScoreFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 3,
  },
  drivingAdvice: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center" as const,
  },
  conditionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  conditionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  conditionContent: {
    flex: 1,
  },
  conditionCategory: {
    color: "white",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  conditionDesc: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  conditionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  conditionStatusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600" as const,
  },
  safetyTips: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 20,
    padding: 16,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  safetyTitle: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },
  nextHoursCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 20,
    padding: 16,
  },
  nextHoursTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  nextHourItem: {
    alignItems: "center",
    marginRight: 16,
    gap: 6,
  },
  nextHourTime: {
    color: "#64748B",
    fontSize: 12,
  },
  nextHourTemp: {
    color: "white",
    fontWeight: "500" as const,
    fontSize: 14,
  },
});
