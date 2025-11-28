
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, User, Download, AlertTriangle, RefreshCw, Palette, LayoutGrid, Eye, BarChart3 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import DashboardCustomizer from "../components/dashboard/DashboardCustomizer";

const LOGO_URL = "/wax seal.svg";

const THEME_OPTIONS = [
{
  value: "glassmorphism",
  label: "Studio Violet (Default)",
  description: "Ethereal glass effects over vintage botanical illustrations",
  preview: "linear-gradient(135deg, #201833 0%, #4F3F73 100%)"
},
{
  value: "high_contrast",
  label: "High Contrast",
  description: "Maximum readability with bold contrast",
  preview: "linear-gradient(135deg, #000000 0%, #1A1A1A 100%)",
  accessible: true
},
{
  value: "light",
  label: "Light Mode",
  description: "Clean and bright workspace",
  preview: "linear-gradient(135deg, #FEFEFE 0%, #EDE9FE 100%)"
},
{
  value: "dark",
  label: "Dark Mode",
  description: "Easy on the eyes in low light",
  preview: "linear-gradient(135deg, #0F0A1F 0%, #2D2640 100%)"
},
{
  value: "nature",
  label: "Nature Mode",
  description: "Earthy greens and natural tones",
  preview: "linear-gradient(135deg, #315e26 0%, #7a9f79 100%)"
},
{
  value: "minimal",
  label: "Minimal",
  description: "Clean and distraction-free",
  preview: "#FFFFFF"
}];


export default function ProfileSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [showDashboardCustomizer, setShowDashboardCustomizer] = useState(false);
  const previousEmailRef = useRef(null);

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profile_picture: "",
    theme: "glassmorphism",
    email_notifications: true,
    care_reminders: true
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        profile_picture: currentUser.profile_picture || "",
        theme: currentUser.theme || "glassmorphism",
        email_notifications: currentUser.email_notifications !== false,
        care_reminders: currentUser.care_reminders !== false
      });
      previousEmailRef.current = currentUser.email || null;
    } else {
      previousEmailRef.current = null;
    }
  }, [currentUser]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser, variables) => {
      const appliedUpdates = updatedUser || variables;

      if (appliedUpdates) {
        const sanitizedUpdates = Object.fromEntries(
          Object.entries(appliedUpdates).filter(([key, value]) =>
            value !== undefined &&
            [
              'username',
              'bio',
              'profile_picture',
              'email_notifications',
              'care_reminders',
              'theme',
            ].includes(key)
          )
        );

        if (Object.keys(sanitizedUpdates).length > 0) {
          setFormData((previous) => ({
            ...previous,
            ...sanitizedUpdates,
          }));

          queryClient.setQueryData(['currentUser'], (previous) =>
            previous ? { ...previous, ...sanitizedUpdates } : previous
          );

          const email = previousEmailRef.current;
          if (email) {
            queryClient.setQueryData(['userProfile', email], (previous) =>
              previous ? { ...previous, ...sanitizedUpdates } : previous
            );
            queryClient.setQueryData(['publicProfile', email], (previous) =>
              previous ? { ...previous, ...sanitizedUpdates } : previous
            );
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      if (previousEmailRef.current) {
        queryClient.invalidateQueries({ queryKey: ['userProfile', previousEmailRef.current] });
        queryClient.invalidateQueries({ queryKey: ['publicProfile', previousEmailRef.current] });
      }

      toast.success("Profile updated!", {
        description: "Your changes have been saved."
      });
    },
    onError: (error) => {
      toast.error("Update failed", {
        description: error.message || "Please try again."
      });
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: (theme) => base44.auth.updateMe({ theme }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success("Theme changed!", {
        description: "Your appearance has been updated."
      });
    },
    onError: (error) => {
      toast.error("Theme update failed", {
        description: error.message || "Please try again."
      });
    }
  });

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      const [
      plants,
      careLogs,
      healthLogs,
      journalEntries,
      bloomLogs,
      propagationProjects,
      propagationLogs,
      propagationBatches,
      hybridizationProjects,
      hybridizationLogs,
      offspring,
      plantCollections,
      wishlistItems] =
      await Promise.all([
      base44.entities.Plant.list(),
      base44.entities.CareLog.list(),
      base44.entities.HealthLog.list(),
      base44.entities.JournalEntry.list(),
      base44.entities.BloomLog.list(),
      base44.entities.PropagationProject.list(),
      base44.entities.PropagationLog.list(),
      base44.entities.PropagationBatch.list(),
      base44.entities.HybridizationProject.list(),
      base44.entities.HybridizationLog.list(),
      base44.entities.Offspring.list(),
      base44.entities.PlantCollection.list(),
      base44.entities.Wishlist.list()]
      );

      await Promise.all([
      ...careLogs.map((item) => base44.entities.CareLog.delete(item.id)),
      ...healthLogs.map((item) => base44.entities.HealthLog.delete(item.id)),
      ...journalEntries.map((item) => base44.entities.JournalEntry.delete(item.id)),
      ...bloomLogs.map((item) => base44.entities.BloomLog.delete(item.id)),
      ...propagationLogs.map((item) => base44.entities.PropagationLog.delete(item.id)),
      ...propagationBatches.map((item) => base44.entities.PropagationBatch.delete(item.id)),
      ...hybridizationLogs.map((item) => base44.entities.HybridizationLog.delete(item.id)),
      ...offspring.map((item) => base44.entities.Offspring.delete(item.id))]
      );

      await Promise.all([
      ...propagationProjects.map((item) => base44.entities.PropagationProject.delete(item.id)),
      ...hybridizationProjects.map((item) => base44.entities.HybridizationProject.delete(item.id)),
      ...plantCollections.map((item) => base44.entities.PlantCollection.delete(item.id)),
      ...wishlistItems.map((item) => base44.entities.Wishlist.delete(item.id))]
      );

      await Promise.all(
        plants.map((item) => base44.entities.Plant.delete(item.id))
      );

      return {
        plantsDeleted: plants.length,
        totalItemsDeleted: plants.length + careLogs.length + healthLogs.length +
        journalEntries.length + bloomLogs.length + propagationProjects.length +
        propagationLogs.length + propagationBatches.length + hybridizationProjects.length +
        hybridizationLogs.length + offspring.length + plantCollections.length +
        wishlistItems.length
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setShowResetConfirmation(false);
      setResetConfirmText("");
      toast.success("Collection reset complete!", {
        description: `${data.totalItemsDeleted} items deleted. Your collection is now empty.`
      });
      setTimeout(() => {
        navigate(createPageUrl("Collection"));
      }, 1000);
    },
    onError: (error) => {
      toast.error("Reset failed", {
        description: error.message || "Please try again."
      });
      setShowResetConfirmation(false);
      setResetConfirmText("");
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData((prev) => ({ ...prev, profile_picture: file_url }));
    } catch {
      toast.error("Upload failed", {
        description: "Could not upload image. Please try again."
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataWithoutTheme = { ...formData };
    delete dataWithoutTheme.theme;
    updateMutation.mutate(dataWithoutTheme);
  };

  const handleThemeChange = (newTheme) => {
    setFormData((prev) => ({ ...prev, theme: newTheme }));
    updateThemeMutation.mutate(newTheme);
  };

  const handleResetData = () => {
    if (resetConfirmText === "RESET MY DATA") {
      resetDataMutation.mutate();
    } else {
      toast.error("Confirmation text doesn't match", {
        description: 'Please type "RESET MY DATA" exactly to confirm.'
      });
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
          <img
            src={LOGO_URL}
            alt="Loading"
            className="w-full h-full object-contain"
            style={{ opacity: 0.6 }} />

        </div>
      </div>);

  }

  const currentTheme = currentUser?.theme || "glassmorphism";
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl("Collection"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "var(--accent)" }}>

          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div className="flex items-center gap-4">
          <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
            <img
              src={LOGO_URL}
              alt="Profile Settings"
              className="w-full h-full object-contain" />

          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{
              color: 'var(--text-primary)',
              textShadow: 'var(--heading-shadow)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Profile Settings
            </h1>
            <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
              Manage your profile and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Admin Sections */}
      {isAdmin && (
        <div className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                <BarChart3 className="w-5 h-5" style={{ color: "#C4B5FD" }} />
                Platform Analytics
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                View insights on user behavior and app usage
              </p>
            </div>
            <button
              onClick={() => navigate(createPageUrl("AdminAnalyticsDashboard"))}
              className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
              style={{ color: "#F0EBFF" }}>

              <BarChart3 className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">View Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Customization Section */}
      <div className="glass-card rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              <LayoutGrid className="w-5 h-5" style={{ color: "#C4B5FD" }} />
              Dashboard Layout
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Choose which widgets appear on your main dashboard
            </p>
          </div>
          <button
            onClick={() => setShowDashboardCustomizer(true)}
            className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
            style={{ color: "#F0EBFF" }}>

            <LayoutGrid className="w-5 h-5" style={{ strokeWidth: 2 }} />
            <span className="hidden sm:inline">Customize</span>
          </button>
        </div>
      </div>

      {/* View Public Profile Section */}
      <div className="glass-card rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              <Eye className="w-5 h-5" style={{ color: "#C4B5FD" }} />
              Public Profile Preview
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              View your profile and collection summary
            </p>
          </div>
          <button
            onClick={() => navigate(createPageUrl(`PublicProfile?email=${currentUser?.email}`))}
            className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
            style={{ color: "#F0EBFF" }}>

            <Eye className="w-5 h-5" style={{ strokeWidth: 2 }} />
            <span className="hidden sm:inline">View Public Profile</span>
          </button>
        </div>
      </div>

      {/* Export Data Section */}
      <div className="glass-card rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2" style={{
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Export Your Data
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Download your plant collection, care logs, and all other data as CSV files
            </p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("ExportData"))}
            className="glass-accent-moss px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
            style={{ color: "#A7F3D0" }}>

            <Download className="w-5 h-5" style={{ strokeWidth: 2 }} />
            <span className="hidden sm:inline">Export Data</span>
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Profile Picture
          </label>
          <div className="flex items-start gap-4 flex-col sm:flex-row">
            <div className="w-32 h-32 rounded-full overflow-hidden glass-card"
            style={{
              boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
            }}>
              {formData.profile_picture ?
              <img
                src={formData.profile_picture}
                alt="Profile preview"
                className="w-full h-full object-cover" /> :


              <div className="w-full h-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
              }}>
                  <User className="w-16 h-16" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                </div>
              }
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-picture-upload"
                disabled={uploading} />

              <label
                htmlFor="profile-picture-upload"
                className="glass-button inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium cursor-pointer hover:opacity-90 transition-opacity"
                style={{ color: "var(--text-secondary)" }}>

                {uploading ?
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </> :

                <>
                    <Upload className="w-4 h-4" />
                    Choose Photo
                  </>
                }
              </label>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
                Upload a profile picture to personalize your account
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Your display name"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }} />

          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell the community about yourself and your love for African violets..."
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "var(--text-primary)" }} />

          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Email
            </label>
            <input
              type="email"
              value={currentUser?.email || ""}
              disabled
              className="glass-input w-full px-4 py-3 rounded-2xl opacity-60 cursor-not-allowed"
              style={{ color: "var(--text-primary)" }} />

            <p className="text-xs mt-1" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <Palette className="w-5 h-5" style={{ color: "#C4B5FD" }} />
            Appearance Theme
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Choose how the app looks and feels. Changes apply instantly.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {THEME_OPTIONS.map((theme) =>
            <button
              key={theme.value}
              type="button"
              onClick={() => handleThemeChange(theme.value)}
              disabled={updateThemeMutation.isPending}
              className={`text-left p-4 rounded-2xl transition-all ${
              formData.theme === theme.value ? "glass-accent-lavender" : "glass-button"} disabled:opacity-50`
              }
              style={{ color: formData.theme === theme.value ? "#F0EBFF" : "var(--text-secondary)" }}>

                <div className="flex items-center gap-3 mb-3">
                  <div
                  className="w-12 h-12 rounded-xl flex-shrink-0"
                  style={{
                    background: theme.preview,
                    border: formData.theme === theme.value ?
                    "2px solid rgba(227, 201, 255, 0.6)" :
                    "1px solid rgba(227, 201, 255, 0.3)"
                  }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{theme.label}</p>
                      {theme.accessible &&
                    <span className="text-xs px-2 py-0.5 rounded-lg"
                    style={{
                      background: "rgba(110, 231, 183, 0.2)",
                      border: "1px solid rgba(110, 231, 183, 0.4)",
                      color: "#A7F3D0"
                    }}>
                          A11y
                        </span>
                    }
                    </div>
                    <p className="text-xs mt-1 opacity-80 line-clamp-2">{theme.description}</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Notification Preferences
          </h3>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Email Notifications
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                Receive reminders and updates via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => setFormData((prev) => ({ ...prev, email_notifications: e.target.checked }))}
                className="sr-only peer" />

              <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{
                background: formData.email_notifications ?
                "linear-gradient(135deg, rgba(154, 226, 211, 0.4) 0%, rgba(154, 226, 211, 0.3) 100%)" :
                "rgba(107, 114, 128, 0.3)",
                border: formData.email_notifications ?
                "1px solid rgba(154, 226, 211, 0.6)" :
                "1px solid rgba(107, 114, 128, 0.4)"
              }} />

            </label>
          </div>

          <div className="flex items-center justify-between py-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Care Reminders
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                Receive notifications when your plants need watering, fertilizing, or grooming
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.care_reminders}
                onChange={(e) => setFormData((prev) => ({ ...prev, care_reminders: e.target.checked }))}
                className="sr-only peer" />

              <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{
                background: formData.care_reminders ?
                "linear-gradient(135deg, rgba(154, 226, 211, 0.4) 0%, rgba(154, 226, 211, 0.3) 100%)" :
                "rgba(107, 114, 128, 0.3)",
                border: formData.care_reminders ?
                "1px solid rgba(154, 226, 211, 0.6)" :
                "1px solid rgba(107, 114, 128, 0.4)"
              }} />

            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl("Collection"))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}>

            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="glass-accent-lavender flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#F0EBFF" }}>

            {updateMutation.isPending ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Danger Zone - Reset Data */}
      <div className="mt-8 p-6 rounded-3xl backdrop-blur-md"
      style={{
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        boxShadow: "0 4px 16px rgba(239, 68, 68, 0.2)"
      }}>
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: "#FCA5A5" }} />
          <div>
            <h3 className="mb-2 text-lg font-bold" style={{
              color: currentTheme === 'light' || currentTheme === 'minimal' ? "#7F1D1D" : "#FCA5A5",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>Danger Zone 
            </h3>
            <p className="text-sm mb-4" style={{ 
              color: currentTheme === 'light' || currentTheme === 'minimal' ? "#991B1B" : "#FCA5A5", 
              opacity: 0.9 
            }}>
              Permanently delete all your plant data and start fresh. This action cannot be undone.
            </p>
            <div className="glass-button rounded-2xl p-3 mb-4"
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.3)"
            }}>
              <p className="text-xs font-semibold mb-2" style={{ 
                color: currentTheme === 'light' || currentTheme === 'minimal' ? "#7F1D1D" : "#FCA5A5" 
              }}>
                This will permanently delete:
              </p>
              <ul className="text-xs space-y-1" style={{ 
                color: currentTheme === 'light' || currentTheme === 'minimal' ? "#991B1B" : "#FCA5A5", 
                opacity: 0.9 
              }}>
                <li>• All plants in your collection</li>
                <li>• All care logs, health observations, and journal entries</li>
                <li>• All breeding and propagation projects</li>
                <li>• All collections and wishlist items</li>
                <li>• All other data associated with your account</li>
              </ul>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowResetConfirmation(true)}
          disabled={resetDataMutation.isPending}
          className="w-full px-6 py-3 rounded-2xl font-semibold backdrop-blur-md transition-all disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.3) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            color: currentTheme === 'light' || currentTheme === 'minimal' ? "#7F1D1D" : "#FCA5A5",
            boxShadow: "0 2px 12px rgba(239, 68, 68, 0.3)"
          }}>

          <RefreshCw className="w-5 h-5" style={{ strokeWidth: 2 }} />
          {resetDataMutation.isPending ? "Resetting..." : "Reset All Collection Data"}
        </button>
      </div>
      {/* Dashboard Customizer Modal */}
      {showDashboardCustomizer &&
      <DashboardCustomizer
        currentUser={currentUser}
        onClose={() => setShowDashboardCustomizer(false)} />

      }

      {/* Reset Confirmation Modal */}
      {showResetConfirmation &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-3xl w-full max-w-md p-8"
        style={{
          background: "linear-gradient(135deg, rgba(79, 63, 115, 0.95) 0%, rgba(60, 46, 90, 0.95) 100%)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          boxShadow: "0 8px 32px rgba(239, 68, 68, 0.4)"
        }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.5)"
            }}>
                <AlertTriangle className="w-6 h-6" style={{ color: "#FCA5A5" }} />
              </div>
              <h2 className="text-2xl font-bold" style={{
              color: "#FCA5A5",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
                Reset Collection Data?
              </h2>
            </div>

            <div className="mb-6">
              <p className="text-sm mb-4" style={{ color: "#F5F3FF" }}>
                This will <strong>permanently delete all your data</strong>. This action cannot be undone.
              </p>
              <p className="text-sm mb-4" style={{ color: "#DDD6FE" }}>
                To confirm, please type <strong style={{ color: "#FCA5A5" }}>RESET MY DATA</strong> below:
              </p>
              <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Type here to confirm..."
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{
                color: "#F5F3FF",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(239, 68, 68, 0.4)"
              }}
              autoFocus />

            </div>

            <div className="flex gap-3">
              <button
              onClick={() => {
                setShowResetConfirmation(false);
                setResetConfirmText("");
              }}
              disabled={resetDataMutation.isPending}
              className="flex-1 glass-button px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
              style={{ color: "var(--text-secondary)" }}>

                Cancel
              </button>
              <button
              onClick={handleResetData}
              disabled={resetDataMutation.isPending || resetConfirmText !== "RESET MY DATA"}
              className="flex-1 px-6 py-3 rounded-2xl font-semibold backdrop-blur-md transition-all disabled:opacity-30"
              style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.3) 100%)",
                border: "1px solid rgba(239, 68, 68, 0.6)",
                color: "#FCA5A5",
                boxShadow: "0 2px 12px rgba(239, 68, 68, 0.4)"
              }}>

                {resetDataMutation.isPending ?
              <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </span> :

              "Reset All Data"
              }
              </button>
            </div>

            <p className="text-xs text-center mt-4" style={{ color: "#DDD6FE", opacity: 0.7 }}>
              Your profile settings and account will not be affected
            </p>
          </div>
        </div>
      }
    </div>);

}
