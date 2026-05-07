/**
 * SportDetail Page - Single sport view with stability timeline.
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useSport,
  useDeleteSport,
  useUpdateSport,
  useAddSportObservation,
  useDeleteSportObservation,
} from '../hooks/useSports';
import { useToast } from '../hooks/useToast';
import HeaderBar from '../components/ui/HeaderBar';
import PremiumGate from '../components/ui/PremiumGate';
import {
  SportObservationList,
  AddObservationModal,
  AvsaRegistrationNudge,
  SportDetailHeader,
  SportDescriptionCard,
  StabilityCard,
  DeleteSportDialog,
} from '../components/sports';
import { calculateStability } from '../utils/sportDescription';
import { usePageTitle } from '../hooks/usePageTitle';

export default function SportDetail() {
  usePageTitle('Sport detail');
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: sport, isLoading, error } = useSport(id);
  const updateSport = useUpdateSport();
  const deleteSport = useDeleteSport();
  const addObservation = useAddSportObservation();
  const deleteObservation = useDeleteSportObservation();

  const [showAddObservation, setShowAddObservation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const observations = useMemo(() => sport?.observations || [], [sport?.observations]);
  const stats = useMemo(() => calculateStability(observations), [observations]);

  if (isLoading || error || !sport) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          {isLoading ? (
            <p className="text-muted">Loading sport…</p>
          ) : (
            <div className="card p-8 text-center max-w-md">
              <p className="heading heading-lg mb-2">Sport not found</p>
              <p className="text-muted mb-4">{error?.message || 'This sport does not exist.'}</p>
              <Link to="/sports">
                <button className="btn btn-primary">Back to Sports</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const showAvsaNudge =
    stats.suggestedStatus === 'stable' && !sport.avsa_registration_number;

  const handleAddObservation = async (data) => {
    await addObservation.mutateAsync({ sport_id: id, ...data });
    const fresh = calculateStability([...observations, data]);
    if (sport.stability_status !== fresh.suggestedStatus) {
      await updateSport.mutateAsync({
        id,
        updates: { stability_status: fresh.suggestedStatus },
      });
    }
    setShowAddObservation(false);
  };

  const handleDelete = async () => {
    await deleteSport.mutateAsync(id);
    toast.success('Sport deleted');
    navigate('/sports');
  };

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="sports">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <SportDetailHeader sport={sport} onDeleteClick={() => setShowDeleteConfirm(true)} />
            <SportDescriptionCard sport={sport} />
            <StabilityCard
              stats={stats}
              observations={observations}
              onAddObservation={() => setShowAddObservation(true)}
            />
            {showAvsaNudge && <AvsaRegistrationNudge />}

            <section className="card p-6 mb-6">
              <h2 className="heading heading-md mb-4">Observations</h2>
              <SportObservationList
                observations={observations}
                onDelete={(obsId) =>
                  deleteObservation.mutate({ id: obsId, sport_id: id })
                }
                isPending={deleteObservation.isPending}
              />
            </section>

            {sport.notes && (
              <section className="card p-6">
                <h2 className="heading heading-md mb-2">Notes</h2>
                <p className="text-body" style={{ whiteSpace: 'pre-wrap' }}>
                  {sport.notes}
                </p>
              </section>
            )}
          </div>
        </main>
      </PremiumGate>

      {showAddObservation && (
        <AddObservationModal
          onConfirm={handleAddObservation}
          onCancel={() => setShowAddObservation(false)}
          isPending={addObservation.isPending || updateSport.isPending}
        />
      )}

      {showDeleteConfirm && (
        <DeleteSportDialog
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isPending={deleteSport.isPending}
        />
      )}
    </div>
  );
}
