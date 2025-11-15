import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Edit, Trash2, Loader2, FolderOpen, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";

const COLOR_OPTIONS = [
  { value: "lavender", label: "Lavender", bg: "rgba(227, 201, 255, 0.2)", border: "rgba(227, 201, 255, 0.4)", text: "#F0EBFF" },
  { value: "moss", label: "Moss", bg: "rgba(154, 226, 211, 0.2)", border: "rgba(154, 226, 211, 0.4)", text: "#A7F3D0" },
  { value: "mint", label: "Mint", bg: "rgba(167, 243, 208, 0.2)", border: "rgba(167, 243, 208, 0.4)", text: "#A7F3D0" },
  { value: "rose", label: "Rose", bg: "rgba(251, 113, 133, 0.2)", border: "rgba(251, 113, 133, 0.4)", text: "#FCA5A5" },
  { value: "amber", label: "Amber", bg: "rgba(251, 191, 36, 0.2)", border: "rgba(251, 191, 36, 0.4)", text: "#FCD34D" },
  { value: "sky", label: "Sky", bg: "rgba(125, 211, 252, 0.2)", border: "rgba(125, 211, 252, 0.4)", text: "#7DD3FC" }
];

export default function CollectionManager({ onClose }) {
  const queryClient = useQueryClient();
  const [editingCollection, setEditingCollection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "lavender"
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['plantCollections'],
    queryFn: () => base44.entities.PlantCollection.list('-updated_date'),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (collectionData) => base44.entities.PlantCollection.create({
      ...collectionData,
      plant_ids: []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantCollections'] });
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlantCollection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantCollections'] });
      setEditingCollection(null);
      setShowForm(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlantCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantCollections'] });
    }
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "lavender" });
    setEditingCollection(null);
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      color: collection.color || "lavender"
    });
    setShowForm(true);
  };

  const handleDelete = (collection) => {
    if (window.confirm(`Delete collection "${collection.name}"? Plants will not be deleted.`)) {
      deleteMutation.mutate(collection.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCollection) {
      updateMutation.mutate({
        id: editingCollection.id,
        data: { ...formData, plant_ids: editingCollection.plant_ids }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getPlantCount = (collection) => {
    return collection.plant_ids?.length || 0;
  };

  const getColorConfig = (colorValue) => {
    return COLOR_OPTIONS.find(c => c.value === colorValue) || COLOR_OPTIONS[0];
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur-2xl rounded-t-[32px] p-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
            borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
          }}>
          <h2 className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Manage Collections
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Collection Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="glass-accent-lavender w-full px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
              style={{ color: "#F0EBFF" }}
            >
              <Plus className="w-5 h-5" />
              Create New Collection
            </button>
          )}

          {/* Collection Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold" style={{ color: "#F5F3FF" }}>
                {editingCollection ? "Edit Collection" : "New Collection"}
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Show Winners, Miniatures"
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add notes about this collection..."
                  rows={3}
                  className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Badge Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`px-4 py-3 rounded-2xl font-medium transition-all ${
                        formData.color === color.value ? "ring-2 ring-offset-0" : ""
                      }`}
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        color: color.text,
                        ringColor: color.border
                      }}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="glass-button px-6 py-3 rounded-2xl font-semibold"
                  style={{ color: "#DDD6FE" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="glass-accent-moss flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
                  style={{ color: "#A7F3D0" }}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCollection ? "Update Collection" : "Create Collection"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Collections List */}
          <div className="space-y-3">
            {collections.length === 0 ? (
              <div className="text-center py-12">
                <div className="glass-accent-lavender w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-violet">
                  <FolderOpen className="w-8 h-8" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
                </div>
                <p style={{ color: "#DDD6FE" }}>No collections yet. Create your first one!</p>
              </div>
            ) : (
              collections.map(collection => {
                const colorConfig = getColorConfig(collection.color);
                const plantCount = getPlantCount(collection);

                return (
                  <div
                    key={collection.id}
                    className="glass-card rounded-3xl p-5 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Link to={createPageUrl(`CollectionDetail?id=${collection.id}`)}>
                          <div
                            className="px-3 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-xl hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-2"
                            style={{
                              background: colorConfig.bg,
                              border: `1px solid ${colorConfig.border}`,
                              color: colorConfig.text
                            }}
                          >
                            {collection.name}
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </Link>
                        <span className="text-sm" style={{ color: "#DDD6FE" }}>
                          {plantCount} {plantCount === 1 ? "plant" : "plants"}
                        </span>
                      </div>
                      {collection.description && (
                        <p className="text-sm" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(collection)}
                        className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ color: "#C4B5FD" }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(collection)}
                        className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ color: "#FCA5A5" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}