
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Leaf, Beaker } from "lucide-react";
import { createPageUrl } from "@/utils";
import PlantCard from "../components/plants/PlantCard";

const LOGO_URL = "/wax seal.svg";

export default function PublicProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  const userEmail = urlParams.get('email');
  const [activeTab, setActiveTab] = useState("plants");

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['publicProfile', userId || userEmail],
    queryFn: () => userId ? base44.entities.User.get(userId) : base44.auth.me(),
    enabled: !!userId || !!userEmail
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const isOwnProfile = currentUser?.email === profileUser?.email || (!userId && userEmail);

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-updated_date'),
    enabled: isOwnProfile,
    initialData: []
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['hybridizationProjects'],
    queryFn: () => base44.entities.HybridizationProject.list('-updated_date'),
    enabled: isOwnProfile,
    initialData: []
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="neuro-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse p-2">
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

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="neuro-card rounded-3xl p-12 text-center">
          <p style={{ color: "var(--text-primary)" }} className="font-medium">User not found</p>
        </div>
      </div>
    );
  }

  const displayName = profileUser.username || profileUser.full_name || profileUser.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl("Collection"))}
            className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="neuro-card rounded-3xl p-6">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden neuro-card"
                  style={{
                    boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
                  }}>
                  {profileUser.profile_picture ? (
                    <img
                      src={profileUser.profile_picture}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                      }}>
                      <User className="w-16 h-16" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold mb-1" style={{
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {displayName}
                </h1>

                {profileUser.bio && (
                  <p className="text-sm mt-3 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {profileUser.bio}
                  </p>
                )}
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate(createPageUrl("ProfileSettings"))}
                  className="neuro-button w-full px-4 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Collection Stats (Own Profile Only) */}
            {isOwnProfile && (
              <div className="neuro-card rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  <Leaf className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                  My Collection
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("plants")}
                    className={`neuro-button rounded-2xl p-3 flex items-center justify-between w-full hover:opacity-80 transition-opacity ${
                      activeTab === "plants" ? "ring-2 ring-offset-0" : ""
                    }`}
                    style={{
                      ringColor: activeTab === "plants" ? "rgba(154, 226, 211, 0.5)" : undefined
                    }}
                  >
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Plants</span>
                    <span className="text-lg font-bold" style={{
                      color: "#A7F3D0",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {plants.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`neuro-button rounded-2xl p-3 flex items-center justify-between w-full hover:opacity-80 transition-opacity ${
                      activeTab === "projects" ? "ring-2 ring-offset-0" : ""
                    }`}
                    style={{
                      ringColor: activeTab === "projects" ? "rgba(154, 226, 211, 0.5)" : undefined
                    }}
                  >
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Projects</span>
                    <span className="text-lg font-bold" style={{
                      color: "#A7F3D0",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {projects.length}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Content based on active tab */}
          <div className="lg:col-span-2">
            {/* Plants Tab (Own Profile Only) */}
            {activeTab === "plants" && isOwnProfile && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    <Leaf className="w-6 h-6" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    My Plant Collection
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    {plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your collection
                  </p>
                </div>

                {plants.length === 0 ? (
                  <div className="neuro-card rounded-[32px] p-12 text-center">
                    <div className="neuro-accent-raised w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                      <Leaf className="w-10 h-10" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{
                      color: 'var(--text-primary)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      No Plants Yet
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Start building your collection
                    </p>
                    <button
                      onClick={() => navigate(createPageUrl("AddPlant"))}
                      className="neuro-accent-raised px-6 py-3 rounded-2xl font-semibold"
                      style={{ color: "#F0EBFF" }}
                    >
                      Add Your First Plant
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plants.map(plant => (
                      <PlantCard key={plant.id} plant={plant} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Projects Tab (Own Profile Only) */}
            {activeTab === "projects" && isOwnProfile && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    <Beaker className="w-6 h-6" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    My Hybridization Projects
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'} in progress
                  </p>
                </div>

                {projects.length === 0 ? (
                  <div className="neuro-card rounded-[32px] p-12 text-center">
                    <div className="neuro-accent-raised w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                      <Beaker className="w-10 h-10" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{
                      color: 'var(--text-primary)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      No Projects Yet
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Start your first hybridization project
                    </p>
                    <button
                      onClick={() => navigate(createPageUrl("AddProject"))}
                      className="neuro-accent-raised px-6 py-3 rounded-2xl font-semibold"
                      style={{ color: "#F0EBFF" }}
                    >
                      Create First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <Link
                        key={project.id}
                        to={createPageUrl(`ProjectDetail?id=${project.id}`)}
                      >
                        <div className="neuro-card rounded-3xl p-6 hover:shadow-2xl transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold mb-1" style={{
                                color: "var(--text-primary)",
                                textShadow: "var(--heading-shadow)",
                                fontFamily: "'Playfair Display', Georgia, serif"
                              }}>
                                {project.project_name}
                              </h3>
                              {project.goal_description && (
                                <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                                  {project.goal_description}
                                </p>
                              )}
                            </div>
                            <span
                              className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl ml-3"
                              style={{
                                background: project.status === "active"
                                  ? "rgba(154, 226, 211, 0.2)"
                                  : "rgba(196, 181, 253, 0.2)",
                                border: project.status === "active"
                                  ? "1px solid rgba(154, 226, 211, 0.4)"
                                  : "1px solid rgba(196, 181, 253, 0.4)",
                                color: project.status === "active" ? "#A7F3D0" : "#C4B5FD"
                              }}
                            >
                              {project.status}
                            </span>
                          </div>
                          {Array.isArray(project.expected_traits) && project.expected_traits.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {project.expected_traits.slice(0, 4).map((trait, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                                  style={{
                                    background: "rgba(168, 159, 239, 0.15)",
                                    border: "1px solid rgba(168, 159, 239, 0.3)",
                                    color: "#C4B5FD"
                                  }}
                                >
                                  {trait}
                                </span>
                              ))}
                              {project.expected_traits.length > 4 && (
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                  +{project.expected_traits.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Non-own profile message */}
            {!isOwnProfile && (
              <div className="neuro-card rounded-3xl p-12 text-center">
                <div className="neuro-icon-well w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{
                  color: 'var(--text-primary)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {displayName}'s Profile
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Profile viewing is limited to your own profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
