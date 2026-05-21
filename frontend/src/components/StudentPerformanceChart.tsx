"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api, authHeader } from '@/lib/api';

export default function StudentPerformanceChart({ testResults }: { testResults: any[] }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (testResults && testResults.length > 0) {
      const formattedData = testResults.map((result, index) => ({
        name: `Test ${index + 1}`,
        score: Math.round((result.score / (result.test?.totalMarks || 100)) * 100),
        fullTitle: result.test?.title || `Test ${index + 1}`
      }));
      setData(formattedData);
    } else {
      // Mock data if no tests taken yet
      setData([
        { name: 'Week 1', score: 65, fullTitle: 'Mock Test 1' },
        { name: 'Week 2', score: 72, fullTitle: 'Mock Test 2' },
        { name: 'Week 3', score: 68, fullTitle: 'Mock Test 3' },
        { name: 'Week 4', score: 85, fullTitle: 'Mock Test 4' },
        { name: 'Week 5', score: 90, fullTitle: 'Mock Test 5' }
      ]);
    }
  }, [testResults]);

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
          <XAxis dataKey="name" stroke="currentColor" opacity={0.5} tick={{ fontSize: 12 }} />
          <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--outline)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--foreground)' }}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
          />
          <Area type="monotone" dataKey="score" stroke="var(--brand)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
