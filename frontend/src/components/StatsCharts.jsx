import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Flame, Clock, PieChart as PieChartIcon } from 'lucide-react';

// Completion Rate Chart (Line Chart)
export const CompletionChart = ({ data, period = 'daily' }) => {
  const chartData = period === 'daily' ? data : data.slice(-7);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {period === 'daily' ? 'Tâches complétées (30 j)' : 'Tâches complétées (7 j)'}
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey={period === 'daily' ? 'dateShort' : 'day'}
            stroke="rgba(0,0,0,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(0,0,0,0.5)" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: 'rgba(0,0,0,0.7)' }} />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Complétées"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Moyenne</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {chartData.length > 0 
              ? Math.round(chartData.reduce((sum, d) => sum + d.completed, 0) / chartData.length)
              : 0
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">par jour</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {chartData.reduce((sum, d) => sum + d.completed, 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">tâches</p>
        </div>
      </div>
    </div>
  );
};

// Streak Counter
export const StreakCounter = ({ streak }) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg shadow-sm border border-orange-200 dark:border-orange-700 p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Série en cours</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Jours consécutifs avec tâches complétées
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-5xl font-bold text-orange-600 dark:text-orange-400">
          {streak}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-900 dark:text-gray-100">jours</p>
          <p className="text-xs mt-1">
            {streak > 0 ? '🔥 Continuez comme ça!' : 'Commencez une série!'}
          </p>
        </div>
      </div>

      {streak > 0 && (
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500"
            style={{ width: `${Math.min(streak * 10, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Average Time By Priority
export const AverageTimeCard = ({ data }) => {
  const priorityColors = {
    'Low': '#6b7280',
    'Medium': '#3b82f6',
    'High': '#f97316',
    'Urgent': '#ef4444'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Temps moyen par priorité</h3>
      </div>

      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: priorityColors[value.label] || '#6b7280' }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {value.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({value.completed}/{value.total})
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {value.days} j
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(value.days * 10, 100)}%`,
                  backgroundColor: priorityColors[value.label] || '#6b7280'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {Object.keys(data).length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Complétez des tâches pour voir les statistiques
        </p>
      )}
    </div>
  );
};

// Priority Breakdown (Pie Chart)
export const PriorityBreakdown = ({ data }) => {
  const chartData = Object.values(data).filter(item => item.count > 0);
  const COLORS = {
    'Low': '#6b7280',
    'Medium': '#3b82f6',
    'High': '#f97316',
    'Urgent': '#ef4444'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Répartition par priorité</h3>
      </div>

      {chartData.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percentage }) => `${label} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.label]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} tâche(s)`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col justify-center space-y-2">
            {chartData.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[item.label] }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {item.count}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Aucune tâche pour le moment
        </p>
      )}
    </div>
  );
};

// Monthly Completion Bar Chart
export const MonthlyCompletionChart = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tâches complétées par mois</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="month"
            stroke="rgba(0,0,0,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(0,0,0,0.5)" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => `${value} tâches`}
          />
          <Bar 
            dataKey="completed" 
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
            name="Complétées"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Total: <strong className="text-gray-900 dark:text-gray-100">{data.reduce((sum, d) => sum + d.completed, 0)}</strong> tâches</p>
      </div>
    </div>
  );
};
