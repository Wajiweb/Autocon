import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { usePlatformStore } from '../../store/usePlatformStore';
import './styles/dashboard.css';

// 1. Custom Plugin for Native Canvas Doughnut Center Text
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: function(chart) {
    if (chart.config.type !== 'doughnut' || !chart.config.options.elements?.center) return;
    const { ctx, width, height } = chart;
    ctx.restore();
    
    const { text, label } = chart.config.options.elements.center;
    
    // Draw Value (e.g. 15)
    ctx.font = 'bold 42px "Outfit", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2 - 8;
    ctx.fillText(text, textX, textY);
    
    // Draw Label (e.g. Total)
    ctx.font = '500 11px "Outfit", sans-serif';
    ctx.fillStyle = '#a1a1aa'; // text-gray-400
    // uppercase tracking-widest emulation
    const lblX = Math.round((width - ctx.measureText(label.toUpperCase()).width) / 2);
    const lblY = height / 2 + 22;
    ctx.fillText(label.toUpperCase(), lblX, lblY);
    
    ctx.save();
  }
};

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, centerTextPlugin);

export default function AnalyticsCharts({ deployments = [], networkName = 'Network' }) {
  const jobs = usePlatformStore(s => s.jobs) || [];
  const stats = usePlatformStore(s => s.stats);

  if (deployments.length === 0 && jobs.length === 0 && !stats) return null;

  const tokens   = deployments.filter(d => d._type === 'ERC-20').length;
  const nfts     = deployments.filter(d => d._type === 'ERC-721').length;
  const auctions = deployments.filter(d => d._type === 'Auction').length;

  // Monthly counts for last 6 months
  const months = [];
  const monthlyCounts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString('en-US', { month: 'short' }).toUpperCase());
    monthlyCounts.push(
      deployments.filter(dep => {
        const c = new Date(dep.createdAt);
        return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
      }).length
    );
  }

  // Brand Colors
  const ORANGE = '#ff6b00';
  const BLUE = '#3b82f6';
  const GREEN = '#22c55e';
  const BG_DARK = '#0a0a0a';

  const doughnutData = deployments.length > 0 ? {
    datasets: [{
      data: [tokens, nfts, auctions],
      backgroundColor: [BLUE, GREEN, ORANGE],
      borderColor: BG_DARK,
      borderWidth: 4,
      hoverOffset: 4,
    }],
  } : {
    datasets: [{
      data: [1],
      backgroundColor: ['#27272a'],
      borderColor: BG_DARK,
      borderWidth: 4,
      hoverOffset: 0,
    }],
  };

  let completedJobs = 0, failedJobs = 0, pendingJobs = 0;
  
  if (stats) {
    completedJobs = (stats.audit?.completed || 0);
    failedJobs    = (stats.audit?.failed || 0);
    pendingJobs   = (stats.audit?.pending || 0) + (stats.audit?.processing || 0);
  } else {
    // fallback if stats not loaded yet
    const auditJobs = jobs.filter(j => j.type === 'audit');
    completedJobs = auditJobs.filter(j => j.status === 'completed').length;
    failedJobs    = auditJobs.filter(j => j.status === 'failed').length;
    pendingJobs   = auditJobs.filter(j => ['pending', 'processing'].includes(j.status)).length;
  }
  const totalJobs = completedJobs + failedJobs + pendingJobs;

  const jobsDoughnutData = totalJobs > 0 ? {
    datasets: [{
      data: [completedJobs, failedJobs, pendingJobs],
      backgroundColor: ['#22c55e', '#ef4444', '#eab308'], // Green, Red, Yellow
      borderColor: BG_DARK,
      borderWidth: 4,
      hoverOffset: 4,
    }],
  } : {
    datasets: [{
      data: [1],
      backgroundColor: ['#27272a'], // zinc-800
      borderColor: BG_DARK,
      borderWidth: 4,
      hoverOffset: 0,
    }],
  };

  const barData = {
    labels: months,
    datasets: [{
      data: monthlyCounts,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(255, 107, 0, 0.9)'); // Solid Orange top
        gradient.addColorStop(1, 'rgba(255, 107, 0, 0.1)'); // Fade to transparent bottom
        return gradient;
      },
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 24,
    }],
  };

  const tooltipDefaults = {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    titleFont: { family: '"Outfit", sans-serif', size: 12, weight: '600' },
    bodyFont: { family: 'var(--db-mono)', size: 14 },
    titleColor: '#a1a1aa',
    bodyColor: '#ffffff',
    padding: 12,
    cornerRadius: 8,
    displayColors: true,
    boxPadding: 4,
  };

  const cardStyle = "bg-[#0a0a0a]/80 border border-white/5 rounded-2xl relative overflow-hidden backdrop-blur-xl p-6 flex flex-col min-h-[340px]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 db-enter db-enter-5">
      
      {/* 1. Donut — Asset Distribution */}
      <div className={cardStyle} style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Asset Distribution</div>
        <div className="text-sm text-gray-500 mb-6 font-mono border-b border-white/5 pb-4">Network · {networkName}</div>
        
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <div className="w-full max-w-[200px] aspect-square relative z-10">
            <Doughnut
              data={doughnutData}
              options={{
                cutout: '82%', responsive: true, maintainAspectRatio: true,
                animation: { duration: 0 }, // Disable update wobbles
                elements: {
                  center: { text: deployments.length.toString(), label: 'Total' }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: deployments.length > 0 ? tooltipDefaults : { enabled: false },
                },
              }}
            />
          </div>
          
          <div className="w-full mt-8 flex flex-col gap-3">
            {[
              { label: 'ERC-20 Tokens', count: tokens,   color: BLUE },
              { label: 'NFT Collections', count: nfts,     color: GREEN },
              { label: 'Auctions', count: auctions, color: ORANGE },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                  <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Bar — Monthly Activity */}
      <div className={cardStyle} style={{ boxShadow: '0 25px 50px -12px rgba(255, 107, 0, 0.05)' }}>
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: 'rgba(255, 107, 0, 0.1)' }} />
        
        <div className="relative z-10">
          <div className="text-xs font-medium text-orange-500 uppercase tracking-widest mb-1">Monthly Activity</div>
          <div className="text-sm text-gray-500 mb-6 font-mono border-b border-white/5 pb-4">Last 6 Months Volume</div>
        </div>

        <div className="flex-1 w-full relative z-10 min-h-[220px]">
          <Bar
            data={barData}
            options={{
              responsive: true, maintainAspectRatio: false,
              animation: { duration: 0 },
              scales: {
                x: {
                  grid: { display: false, drawBorder: false },
                  ticks: { color: '#71717a', font: { size: 10, family: 'var(--db-mono)' }, padding: 10 },
                  border: { display: false }
                },
                y: { 
                  display: false, 
                  beginAtZero: true,
                  grid: { display: false }
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...tooltipDefaults,
                  callbacks: { label: c => ` ${c.raw} Deployments` },
                },
              },
            }}
          />
        </div>
      </div>

      {/* 3. Donut — Security Audits */}
      <div className={cardStyle} style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Security Audits</div>
        <div className="text-sm text-gray-500 mb-6 font-mono border-b border-white/5 pb-4">AI Smart Contract Scanning</div>
        
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <div className="w-full max-w-[200px] aspect-square relative z-10">
            <Doughnut
              data={jobsDoughnutData}
              options={{
                cutout: '82%', responsive: true, maintainAspectRatio: true,
                animation: { duration: 0 },
                elements: {
                  center: { text: totalJobs.toString(), label: 'Total' }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: totalJobs > 0 ? tooltipDefaults : { enabled: false },
                },
              }}
            />
          </div>
          
          <div className="w-full mt-8 flex flex-col gap-3">
            {[
              { label: 'Completed',  count: completedJobs, color: '#22c55e' },
              { label: 'Failed',     count: failedJobs,    color: '#ef4444' },
              { label: 'Pending',    count: pendingJobs,   color: '#eab308' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                  <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
