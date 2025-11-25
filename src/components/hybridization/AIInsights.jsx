import React, { useState } from "react";
import { Sparkles, Loader2, TrendingUp, Target, Award, Lightbulb, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function AIInsights({ project, offspring, logs, allPlants }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getSeedParent = () => allPlants.find(p => p.id === project.seed_parent_id);
  const getPollenParent = () => allPlants.find(p => p.id === project.pollen_parent_id);

  const generateAnalysis = async () => {
    setAnalyzing(true);
    setExpanded(true);

    const seedParent = getSeedParent();
    const pollenParent = getPollenParent();

    // Prepare data for AI
    const projectData = {
      name: project.project_name,
      type: project.project_type,
      goal: project.goal_description,
      expected_traits: project.expected_traits || [],
      seed_parent: seedParent ? {
        name: seedParent.cultivar_name,
        blossom_type: seedParent.blossom_type,
        blossom_color: seedParent.blossom_color,
        leaf_types: seedParent.leaf_types,
        variegation: seedParent.variegation
      } : null,
      pollen_parent: pollenParent ? {
        name: pollenParent.cultivar_name,
        blossom_type: pollenParent.blossom_type,
        blossom_color: pollenParent.blossom_color,
        leaf_types: pollenParent.leaf_types,
        variegation: pollenParent.variegation
      } : null
    };

    const offspringData = offspring.map(o => ({
      number: o.offspring_number,
      status: o.status,
      observed_traits: o.observed_traits || [],
      flower_color: o.flower_color,
      leaf_type: o.leaf_type,
      germination_date: o.germination_date,
      bloom_date: o.bloom_date
    }));

    const logData = logs.map(l => ({
      date: l.log_date,
      observation: l.observation,
      traits_observed: l.traits_observed || [],
      milestone: l.milestone
    }));

    const prompt = `You are an expert African violet hybridizer and geneticist. Analyze this hybridization project and provide detailed insights.

**Project Information:**
- Name: ${projectData.name}
- Type: ${projectData.type}
- Goal: ${projectData.goal || "Experimental breeding"}
- Expected Traits: ${projectData.expected_traits.join(", ") || "Not specified"}

**Parent Plants:**
Seed Parent (♀): ${projectData.seed_parent ? `
  - Name: ${projectData.seed_parent.name}
  - Blossom: ${projectData.seed_parent.blossom_color || "Unknown"} ${projectData.seed_parent.blossom_type || ""}
  - Foliage: ${(projectData.seed_parent.leaf_types && projectData.seed_parent.leaf_types.length > 0) ? projectData.seed_parent.leaf_types.join(", ") : "Unknown"}${projectData.seed_parent.variegation ? `, ${projectData.seed_parent.variegation}` : ""}
` : "Not specified"}

Pollen Parent (♂): ${projectData.pollen_parent ? `
  - Name: ${projectData.pollen_parent.name}
  - Blossom: ${projectData.pollen_parent.blossom_color || "Unknown"} ${projectData.pollen_parent.blossom_type || ""}
  - Foliage: ${(projectData.pollen_parent.leaf_types && projectData.pollen_parent.leaf_types.length > 0) ? projectData.pollen_parent.leaf_types.join(", ") : "Unknown"}${projectData.pollen_parent.variegation ? `, ${projectData.pollen_parent.variegation}` : ""}
` : "Not specified"}

**Offspring Results (${offspringData.length} total):**
${offspringData.length > 0 ? offspringData.map(o => `
- Seedling ${o.number}: ${o.status}${o.flower_color ? `, ${o.flower_color} blooms` : ""}${o.observed_traits.length > 0 ? `, Traits: ${o.observed_traits.join(", ")}` : ""}
`).join("") : "No offspring recorded yet"}

**Log Observations (${logData.length} entries):**
${logData.length > 0 ? logData.slice(0, 5).map(l => `
- ${l.date}${l.milestone ? ` [${l.milestone}]` : ""}: ${l.observation.substring(0, 100)}...${l.traits_observed.length > 0 ? ` (Traits: ${l.traits_observed.join(", ")})` : ""}
`).join("") : "No logs yet"}

Please provide a comprehensive analysis with:

## 1. Trait Inheritance Patterns
Analyze which parent traits are appearing in offspring and inheritance patterns observed.

## 2. Success Evaluation
Evaluate how well the offspring match the expected traits and project goals.

## 3. Promising Offspring Identification
Identify which specific seedlings show the most promise and why. Reference them by their seedling numbers.

## 4. Genetic Insights
Explain any interesting genetic phenomena observed (dominant/recessive traits, unexpected combinations, etc.).

## 5. Recommendations
Provide specific recommendations for:
- Which offspring to select for further propagation
- Future crosses that could improve results
- What to watch for in ongoing seedlings

Be specific, reference actual seedling numbers, and provide actionable insights based on the data.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAnalysis(response);
    } catch (error) {
      console.error("AI analysis failed:", error);
      setAnalysis("Failed to generate analysis. Please try again.");
    }

    setAnalyzing(false);
  };

  if (!expanded) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <button
          onClick={generateAnalysis}
          disabled={analyzing}
          className="w-full glass-accent-lavender rounded-2xl p-6 hover:opacity-90 transition-all"
          style={{ color: "#F0EBFF" }}
        >
          <div className="flex items-center justify-center gap-3">
            {analyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-semibold">Analyzing hybridization data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" style={{ strokeWidth: 2 }} />
                <span className="font-semibold">Generate AI Insights</span>
              </>
            )}
          </div>
          {!analyzing && (
            <p className="text-sm mt-2 opacity-80">
              Get AI-powered analysis of trait inheritance, promising offspring, and breeding recommendations
            </p>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="glass-accent-lavender w-12 h-12 rounded-2xl flex items-center justify-center glow-violet">
            <Sparkles className="w-6 h-6" style={{ color: "#F0EBFF", strokeWidth: 2 }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ 
              color: "#F5F3FF",
              textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              AI Breeding Insights
            </h2>
            <p className="text-xs" style={{ color: "#DDD6FE" }}>
              AI-powered analysis of your hybridization project
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="glass-button w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ color: "#DDD6FE" }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: "#C4B5FD" }} />
          <p className="text-sm" style={{ color: "#DDD6FE" }}>
            Analyzing trait inheritance patterns...
          </p>
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mt-6 mb-3" style={{ 
                    color: "#F5F3FF",
                    textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mt-5 mb-2 flex items-center gap-2" style={{ 
                    color: "#F5F3FF",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {String(children).includes("Trait Inheritance") && <TrendingUp className="w-5 h-5" style={{ color: "#A7F3D0" }} />}
                    {String(children).includes("Success Evaluation") && <Target className="w-5 h-5" style={{ color: "#C4B5FD" }} />}
                    {String(children).includes("Promising Offspring") && <Award className="w-5 h-5" style={{ color: "#FCD34D" }} />}
                    {String(children).includes("Genetic Insights") && <Sparkles className="w-5 h-5" style={{ color: "#F0EBFF" }} />}
                    {String(children).includes("Recommendations") && <Lightbulb className="w-5 h-5" style={{ color: "#A7F3D0" }} />}
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "#F0EBFF" }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-2 leading-relaxed" style={{ color: "#DDD6FE" }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 ml-6 space-y-1 list-disc" style={{ color: "#DDD6FE" }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 ml-6 space-y-1 list-decimal" style={{ color: "#DDD6FE" }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold" style={{ color: "#F5F3FF" }}>
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded text-xs" 
                    style={{ 
                      background: "rgba(154, 226, 211, 0.15)",
                      border: "1px solid rgba(154, 226, 211, 0.3)",
                      color: "#A7F3D0"
                    }}>
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 pl-4 my-3" 
                    style={{ borderColor: "rgba(168, 159, 239, 0.4)" }}>
                    {children}
                  </blockquote>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={generateAnalysis}
              disabled={analyzing}
              className="glass-button flex-1 px-4 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
              style={{ color: "#DDD6FE" }}
            >
              <Sparkles className="w-4 h-4" />
              Regenerate Analysis
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}