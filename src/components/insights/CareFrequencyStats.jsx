
import React from "react";
import { Droplets, Leaf, Shovel, Scissors, TrendingUp, TrendingDown } from "lucide-react";
import { differenceInDays } from "date-fns";

const calculateAverageFrequency = (logs, careType) => {
  const typeLogs = logs.filter(log => log.care_type === careType).sort((a, b) => 
    new Date(a.care_date) - new Date(b.care_date)
  );
  
  if (typeLogs.length < 2) return null;
  
  let totalDays = 0;
  for (let i = 1; i < typeLogs.length; i++) {
    totalDays += differenceInDays(new Date(typeLogs[i].care_date), new Date(typeLogs[i-1].care_date));
  }
  
  return totalDays / (typeLogs.length - 1);
};

const careTypeConfig = {
  watering: {
    icon: Droplets,
    label: "Watering",
    color: "#7DD3FC",
    bg: "rgba(125, 211, 252, 0.2)",
    border: "rgba(125, 211, 252, 0.4)",
    idealFrequency: 7,
    unit: "days"
  },
  fertilizing: {
    icon: Leaf,
    label: "Fertilizing",
    color: "#A7F3D0",
    bg: "rgba(167, 243, 208, 0.2)",
    border: "rgba(167, 243, 208, 0.4)",
    idealFrequency: 14,
    unit: "days"
  },
  grooming: {
    icon: Scissors,
    label: "Grooming",
    color: "#F0EBFF",
    bg: "rgba(240, 235, 255, 0.2)",
    border: "rgba(240, 235, 255, 0.4)",
    idealFrequency: 7,
    unit: "days"
  },
  repotting: {
    icon: Shovel,
    label: "Repotting",
    color: "#FCD34D",
    bg: "rgba(252, 211, 77, 0.2)",
    border: "rgba(252, 211, 77, 0.4)",
    idealFrequency: 365,
    unit: "days"
  }
};

export default function CareFrequencyStats({ careLogs }) {
  const stats = Object.keys(careTypeConfig).map(careType => {
    const config = careTypeConfig[careType];
    const avgFrequency = calculateAverageFrequency(careLogs, careType);
    const count = careLogs.filter(log => log.care_type === careType).length;
    
    let comparison = null;
    if (avgFrequency !== null) {
      const diff = avgFrequency - config.idealFrequency;
      const percentDiff = Math.abs((diff / config.idealFrequency) * 100);
      comparison = {
        isMore: diff > 0,
        percent: Math.round(percentDiff)
      };
    }
    
    return {
      careType,
      config,
      avgFrequency,
      count,
      comparison
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map(({ careType, config, avgFrequency, count, comparison }) => {
        const Icon = config.icon;
        
        return (
          <div
            key={careType}
            className={`clay-card rounded-[16px] p-5`}
            style={{
              backgroundColor: config.bg,
              borderColor: config.border,
              borderStyle: 'solid',
              borderWidth: '1px'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="clay-button w-12 h-12 rounded-[14px] bg-white/40 flex items-center justify-center">
                <Icon className="w-6 h-6" style={{ color: config.color }} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs opacity-70">times logged</p>
              </div>
            </div>
            
            <h3 className="font-bold mb-2" style={{ color: config.color }}>{config.label}</h3>
            
            {avgFrequency !== null ? (
              <>
                <p className="text-sm mb-2" style={{ color: config.color }}>
                  Avg: <span className="font-semibold">{avgFrequency.toFixed(1)}</span> {config.unit}
                </p>
                
                {comparison && (
                  <div className="flex items-center gap-1.5 text-xs clay-card px-2 py-1 rounded-[8px] bg-white/30">
                    {comparison.isMore ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>{comparison.percent}% less frequent than ideal</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        <span>{comparison.percent}% more frequent than ideal</span>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm opacity-70">Not enough data yet</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
