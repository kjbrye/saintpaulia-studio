/**
 * Wishlist Page — cultivars the user wants to acquire.
 *
 * Active tab lists items the user is hoping to add; the Acquired button
 * navigates to AddPlant pre-filled with the wishlist item's data and the
 * wishlist_item_id query param so the form can mark the item acquired only
 * after the plant insert succeeds.
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Heart } from 'lucide-react';
import {
  useWishlistItems,
  useCreateWishlistItem,
  useUpdateWishlistItem,
  useDeleteWishlistItem,
} from '../hooks/useWishlist';
import { usePlants } from '../hooks/usePlants';
import { useToast } from '../hooks/useToast';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  PRIORITY_RANK,
  SORT_OPTIONS,
  WISHLIST_COPY,
} from '../constants/wishlistOptions';
import WishlistItemRow from '../components/wishlist/WishlistItemRow';
import WishlistFormModal from '../components/wishlist/WishlistFormModal';

function buildAcquireUrl(item) {
  const params = new URLSearchParams();
  params.set('wishlist_item_id', item.id);
  if (item.cultivar_name) params.set('cultivar_name', item.cultivar_name);
  if (item.hybridizer) params.set('hybridizer', item.hybridizer);
  if (item.source) params.set('source', item.source);
  if (item.notes) params.set('notes', item.notes);
  return `/plants/new?${params.toString()}`;
}

export default function Wishlist() {
  usePageTitle('Wishlist');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: items = [], isLoading, error } = useWishlistItems();
  const { data: plants = [] } = usePlants();
  const createItem = useCreateWishlistItem();
  const updateItem = useUpdateWishlistItem();
  const deleteItem = useDeleteWishlistItem();

  const [tab, setTab] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const plantNamesById = useMemo(() => {
    const map = new Map();
    for (const p of plants) {
      map.set(p.id, p.nickname || p.cultivar_name || 'plant');
    }
    return map;
  }, [plants]);

  const activeItems = useMemo(
    () => items.filter((i) => i.status === 'active'),
    [items],
  );
  const acquiredItems = useMemo(
    () => items.filter((i) => i.status === 'acquired'),
    [items],
  );

  const sources = useMemo(() => {
    const set = new Set();
    for (const i of items) {
      if (i.source && i.source.trim()) set.add(i.source.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const visibleItems = useMemo(() => {
    const pool = tab === 'active' ? activeItems : acquiredItems;
    let result = pool;
    if (priorityFilter !== 'all') {
      result = result.filter((i) => i.priority === priorityFilter);
    }
    if (sourceFilter !== 'all') {
      result = result.filter((i) => i.source === sourceFilter);
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.cultivar_name || '').localeCompare(b.cultivar_name || '');
        case 'hybridizer':
          return (a.hybridizer || '').localeCompare(b.hybridizer || '');
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'priority':
        default: {
          const ra = PRIORITY_RANK[a.priority] ?? 99;
          const rb = PRIORITY_RANK[b.priority] ?? 99;
          if (ra !== rb) return ra - rb;
          return new Date(b.created_at) - new Date(a.created_at);
        }
      }
    });
    return result;
  }, [tab, activeItems, acquiredItems, priorityFilter, sourceFilter, sortBy]);

  const highCount = useMemo(
    () => activeItems.filter((i) => i.priority === 'high').length,
    [activeItems],
  );

  const subtitle = (() => {
    if (activeItems.length === 0 && acquiredItems.length === 0) {
      return WISHLIST_COPY.emptySubtitle;
    }
    return WISHLIST_COPY.subtitle(activeItems.length, highCount);
  })();

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateItem.mutateAsync({ id: editing.id, updates: values });
        toast.success('Wishlist item updated');
      } else {
        await createItem.mutateAsync(values);
        toast.success('Added to wishlist');
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error('Could not save. Please try again.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.cultivar_name}" from your wishlist?`)) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Could not delete. Please try again.');
    }
  };

  const handleAcquire = (item) => {
    toast.success(WISHLIST_COPY.acquiredToast(item.cultivar_name));
    navigate(buildAcquireUrl(item));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading your wishlist…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <p className="heading heading-lg mb-2">Failed to load</p>
          <p className="text-muted mb-4">{error.message}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const showActiveEmpty = tab === 'active' && visibleItems.length === 0;
  const totalActive = activeItems.length;
  const totalAcquired = acquiredItems.length;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-start gap-4">
            <Link to="/">
              <button className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
            </Link>
            <div>
              <h1 className="heading heading-xl">{WISHLIST_COPY.pageTitle}</h1>
              <p
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'var(--purple-500)',
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          <button className="btn btn-primary mt-2" onClick={openAdd}>
            <Plus size={18} />
            <span className="hidden sm:inline">Add to wishlist</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        {/* Tabs */}
        <div
          className="flex items-center gap-6 mb-5"
          style={{ borderBottom: '1px solid var(--sage-200)' }}
        >
          <TabButton
            active={tab === 'active'}
            onClick={() => setTab('active')}
            label="Active"
            count={totalActive}
          />
          <TabButton
            active={tab === 'acquired'}
            onClick={() => setTab('acquired')}
            label="Acquired"
            count={totalAcquired}
          />
        </div>

        {/* Filter / sort row */}
        {(totalActive > 0 || totalAcquired > 0) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="flex flex-wrap gap-3 flex-1">
              <select
                className="input"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                className="input"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                disabled={sources.length === 0}
              >
                <option value="all">All sources</option>
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="input sm:ml-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort wishlist"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Empty states */}
        {showActiveEmpty && totalActive === 0 && (
          <EmptyState
            title={
              totalAcquired > 0
                ? 'Wishlist clear.'
                : WISHLIST_COPY.emptyActiveTitle
            }
            subtext={
              totalAcquired > 0
                ? `${totalAcquired} acquired so far.`
                : WISHLIST_COPY.emptyActiveSubtext
            }
            onAdd={openAdd}
            compact={totalAcquired > 0}
          />
        )}

        {tab === 'acquired' && visibleItems.length === 0 && (
          <EmptyState
            title="No acquired items yet"
            subtext={WISHLIST_COPY.emptyAcquired}
          />
        )}

        {tab === 'active' &&
          totalActive > 0 &&
          visibleItems.length === 0 && (
            <p
              className="text-muted text-center py-8"
              style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}
            >
              No items match these filters.
            </p>
          )}

        {/* List */}
        {visibleItems.length > 0 && (
          <div className="flex flex-col gap-3">
            {visibleItems.map((item) => (
              <WishlistItemRow
                key={item.id}
                item={item}
                acquiredPlantName={
                  item.acquired_plant_id
                    ? plantNamesById.get(item.acquired_plant_id)
                    : null
                }
                onAcquire={handleAcquire}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <WishlistFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editing}
        isSubmitting={createItem.isPending || updateItem.isPending}
      />
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pb-2 -mb-px transition-colors"
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: 18,
        color: active ? 'var(--sage-700)' : 'var(--text-muted)',
        borderBottom: active ? '2px solid var(--sage-500)' : '2px solid transparent',
      }}
    >
      {label}
      <span
        className="ml-1.5"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 600,
          color: active ? 'var(--sage-500)' : 'var(--text-muted)',
        }}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState({ title, subtext, onAdd, compact = false }) {
  return (
    <div
      className="card p-8 text-center"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        className="icon-container-cream"
        style={{ width: 56, height: 56 }}
      >
        <Heart size={22} style={{ color: 'var(--copper-500)' }} />
      </div>
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontSize: 20,
          color: 'var(--sage-700)',
        }}
      >
        {title}
      </p>
      {subtext && (
        <p className="text-muted text-small" style={{ maxWidth: 360 }}>
          {subtext}
        </p>
      )}
      {onAdd && (
        <button
          className={compact ? 'btn btn-secondary mt-2' : 'btn btn-primary mt-2'}
          onClick={onAdd}
        >
          <Plus size={16} /> Add to wishlist
        </button>
      )}
    </div>
  );
}
