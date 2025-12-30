/**
 * PlantDetail Page - Individual plant view with care management
 */

import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { usePlant } from '../hooks/usePlants';
import { useCareLogs, useLogCare } from '../hooks/useCare';
import { getPlantCareStatuses } from '../utils/careStatus';
import {
  PlantHeader,
  CareStatusCard,
  QuickCareActions,
  CareHistory,
} from '../components/detail';

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: plant, isLoading, error } = usePlant(id);
  const { data: careLogs = [], isLoading: logsLoading } = useCareLogs({
    plantId: id,
    limit: 10,
  });
  const { mutateAsync: logCare, isPending } = useLogCare();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading plant details...</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <p className="heading heading-lg mb-2">Plant not found</p>
          <p className="text-muted mb-4">
            {error?.message || "This plant doesn't exist or was deleted."}
          </p>
          <Link to="/library">
            <button className="btn btn-primary">Back to Library</button>
          </Link>
        </div>
      </div>
    );
  }

  const careStatuses = getPlantCareStatuses(plant);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="icon-container"
          >
            <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
          </button>

          <div className="flex items-center gap-2">
            <Link to={`/plants/${id}/edit`}>
              <button className="icon-container">
                <Edit size={18} style={{ color: 'var(--sage-600)' }} />
              </button>
            </Link>
          </div>
        </header>

        {/* Plant Header */}
        <PlantHeader plant={plant} />

        {/* Care Status Grid */}
        <section className="mb-6">
          <h2 className="heading heading-md mb-4">Care Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CareStatusCard
              careType="watering"
              status={careStatuses.watering}
              lastDate={plant.last_watered}
            />
            <CareStatusCard
              careType="fertilizing"
              status={careStatuses.fertilizing}
              lastDate={plant.last_fertilized}
            />
            <CareStatusCard
              careType="grooming"
              status={careStatuses.grooming}
              lastDate={plant.last_groomed}
            />
          </div>
        </section>

        {/* Quick Care Actions */}
        <QuickCareActions
          plantId={id}
          onLogCare={logCare}
          isPending={isPending}
        />

        {/* Care History */}
        <CareHistory logs={careLogs} isLoading={logsLoading} />
      </div>
    </div>
  );
}
