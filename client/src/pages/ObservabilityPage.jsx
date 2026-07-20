import React, { useEffect, useState } from 'react';
import { Activity, Server, Clock, Database, MessageSquare } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import api from '../services/api';

const COLORS = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#c084fc'];

const StatCard = ({ icon: Icon, title, value, status }) => (
  <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 flex flex-col justify-between h-full shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl text-brand-400">
        <Icon size={24} />
      </div>
      {status && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          status === 'Connected' || status === 'Online' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {status}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

const ObservabilityPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/observability/metrics');
        setMetrics(response.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to load system metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Activity className="w-8 h-8 animate-pulse text-brand-400" />
          <p className="text-sm font-medium">Gathering telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center max-w-md">
          <Server className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Metrics Unavailable</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { health, stats, charts } = metrics;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            <Activity className="text-brand-400" />
            System Observability
          </h1>
          <p className="text-slate-400 text-sm">Real-time telemetry and API usage metrics.</p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Database} 
            title="Database Status" 
            value={health.database} 
            status={health.database}
          />
          <StatCard 
            icon={Clock} 
            title="Avg Response Latency" 
            value={`${stats.averageLatencyMs} ms`} 
          />
          <StatCard 
            icon={MessageSquare} 
            title="Total AI Interactions" 
            value={stats.totalAIMessages} 
          />
          <StatCard 
            icon={Server} 
            title="Active Chat Threads" 
            value={stats.totalChats} 
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Latency Trend Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-lg">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Latency Trends</h3>
              <p className="text-xs text-slate-400">Average daily model response time in milliseconds</p>
            </div>
            
            <div className="h-72 w-full">
              {charts.latencyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.latencyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `${val}ms`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgLatency" 
                      name="Latency"
                      stroke="#818cf8" 
                      strokeWidth={3} 
                      dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, fill: '#fff', stroke: '#818cf8', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <Activity size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">Not enough latency data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Model Usage Chart */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-lg">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Model Usage</h3>
              <p className="text-xs text-slate-400">Total requests per model</p>
            </div>
            
            <div className="h-72 w-full">
              {charts.modelUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.modelUsage} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" name="Requests" radius={[0, 4, 4, 0]} barSize={20}>
                      {charts.modelUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <Server size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No models utilized yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ObservabilityPage;
