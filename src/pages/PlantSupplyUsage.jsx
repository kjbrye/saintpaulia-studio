import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package } from "lucide-react";
import { createPageUrl } from "@/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function PlantSupplyUsage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const plantId = urlParams.get('id');

  const { data: plant, isLoading: plantLoading } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => base44.entities.Plant.filter({ id: plantId }).then(plants => plants[0]),
    enabled: !!plantId
  });

  const { data: allUsageLogs = [] } = useQuery({
    queryKey: ['allSupplyUsage'],
    queryFn: () => base44.entities.SupplyUsageLog.list('-usage_date'),
    initialData: []
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ['supplies'],
    queryFn: () => base44.entities.Supply.list(),
    initialData: []
  });

  // Filter usage logs for this plant
  const plantUsageLogs = allUsageLogs.filter(log => log.plant_id === plantId);

  // Group by supply
  const usageBySupply = plantUsageLogs.reduce((acc, log) => {
    if (!acc[log.supply_id]) {
      acc[log.supply_id] = [];
    }
    acc[log.supply_id].push(log);
    return acc;
  }, {});

  if (plantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
          <img 
            src={LOGO_URL} 
            alt="Loading" 
            className="w-full h-full object-contain"
            style={{ opacity: 0.6 }}
          />
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p style={{ color: "#F5F3FF" }} className="font-medium">Plant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl(`PlantDetail?id=${plantId}`))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "#E3C9FF" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Supply Usage History
          </h1>
          <p style={{ color: "#DDD6FE" }}>{plant.cultivar_name}</p>
        </div>
      </div>

      {/* Content */}
      {plantUsageLogs.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: "#C4B5FD", opacity: 0.5 }} />
          <h3 className="text-xl font-bold mb-2" style={{ 
            color: '#F5F3FF',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            No Supply Usage Yet
          </h3>
          <p style={{ color: '#DDD6FE' }}>
            Supply usage will be tracked here when you log care activities
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(usageBySupply).map(([supplyId, logs]) => {
            const supply = supplies.find(s => s.id === supplyId);
            if (!supply) return null;

            const totalUsed = logs.reduce((sum, log) => sum + log.quantity_used, 0);

            return (
              <div key={supplyId} className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Link to={createPageUrl(`SupplyDetail?id=${supplyId}`)}>
                      <h3 className="text-lg font-bold hover:opacity-80 transition-opacity" style={{ 
                        color: "#F5F3FF",
                        fontFamily: "'Playfair Display', Georgia, serif"
                      }}>
                        {supply.name}
                      </h3>
                    </Link>
                    <p className="text-sm" style={{ color: "#DDD6FE" }}>
                      Total used: {totalUsed} {supply.unit} • {logs.length} {logs.length === 1 ? 'time' : 'times'}
                    </p>
                  </div>
                  <Package className="w-6 h-6" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
                </div>

                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="glass-button rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
                          {log.quantity_used} {supply.unit}
                        </p>
                        <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                          {new Date(log.usage_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {log.purpose && (
                        <p className="text-xs" style={{ color: "#DDD6FE" }}>
                          {log.purpose}
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-xs mt-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}