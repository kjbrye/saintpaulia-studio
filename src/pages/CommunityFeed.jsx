import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Users } from "lucide-react";

const LOGO_URL = "/wax seal.svg";

export default function CommunityFeed() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Collection")}>
            <button className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ color: "var(--accent)" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center p-2">
              <img
                src={LOGO_URL}
                alt="Community"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: '0 2px 4px rgba(32, 24, 51, 0.4)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Community
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Feature currently unavailable
              </p>
            </div>
          </div>
        </div>

        <div className="neuro-card rounded-3xl p-12 text-center">
          <div className="neuro-icon-well w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{
            color: 'var(--text-primary)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Community Features Unavailable
          </h2>
          <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
            Community features are currently disabled. You can continue using the app
            to track your African violets, supplies, and care logs.
          </p>
          <Link to={createPageUrl("Collection")}>
            <button className="neuro-accent-raised px-6 py-3 rounded-2xl font-semibold"
              style={{ color: "#F0EBFF" }}>
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
