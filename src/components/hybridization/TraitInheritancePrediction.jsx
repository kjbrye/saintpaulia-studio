import React, { useState } from "react";
import { Sparkles, TrendingUp, Info, ChevronDown, ChevronUp } from "lucide-react";

// Trait inheritance patterns and dominance
const TRAIT_GENETICS = {
  blossom_type: {
    name: "Blossom Type",
    dominance: {
      double: 3,
      "semi-double": 2,
      single: 1,
      star: 2,
      frilled: 2,
      fantasy: 1,
      chimera: 1
    },
    description: "Double blooms are typically dominant over single blooms"
  },
  leaf_type: {
    name: "Leaf Type",
    dominance: {
      variegated: 3,
      plain: 1,
      boy: 2,
      girl: 1,
      serrated: 2,
      ruffled: 2,
      quilted: 2
    },
    description: "Variegated and boy leaves tend to be dominant traits"
  },
  blossom_color: {
    name: "Blossom Color",
    inheritance: "intermediate",
    description: "Colors often blend or show intermediate inheritance patterns"
  }
};

function TraitPredictionCard({ trait, seedValue, pollenValue, prediction }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="text-left">
          <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {trait.name}
          </h4>
          <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
            Click to see details
          </p>
        </div>
        {expanded ? 
          <ChevronUp className="w-5 h-5" style={{ color: "var(--text-secondary)" }} /> :
          <ChevronDown className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        }
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 pt-4" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
          {/* Parent Values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-button rounded-xl p-3">
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Seed Parent ♀
              </p>
              <p className="text-sm font-bold" style={{ color: "#C4B5FD" }}>
                {seedValue || "Unknown"}
              </p>
            </div>
            <div className="glass-button rounded-xl p-3">
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Pollen Parent ♂
              </p>
              <p className="text-sm font-bold" style={{ color: "#C4B5FD" }}>
                {pollenValue || "Unknown"}
              </p>
            </div>
          </div>

          {/* Prediction */}
          <div className="glass-accent-raised rounded-xl p-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "#A7F3D0" }}>
              Predicted Offspring Traits:
            </p>
            <div className="space-y-2">
              {prediction.outcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#F0EBFF" }}>
                    {outcome.trait}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(0, 0, 0, 0.3)" }}>
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${outcome.probability}%`,
                          background: "linear-gradient(90deg, rgba(154, 226, 211, 0.8) 0%, rgba(110, 231, 183, 0.8) 100%)"
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold w-12 text-right" style={{ color: "#A7F3D0" }}>
                      {outcome.probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genetic Info */}
          <div className="flex items-start gap-2 p-3 rounded-xl"
            style={{
              background: "rgba(168, 159, 239, 0.1)",
              border: "1px solid rgba(168, 159, 239, 0.2)"
            }}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#C4B5FD" }} />
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {trait.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TraitInheritancePrediction({ seedParent, pollenParent }) {
  if (!seedParent || !pollenParent) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: "rgba(168, 159, 239, 0.2)",
            border: "1px solid rgba(168, 159, 239, 0.3)"
          }}>
          <Sparkles className="w-8 h-8" style={{ color: "#C4B5FD" }} />
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Trait predictions require both seed and pollen parent information
        </p>
      </div>
    );
  }

  // Calculate predictions for each trait category
  const predictions = [];

  // Blossom Type Prediction
  if (seedParent.blossom_type && pollenParent.blossom_type) {
    const seedDominance = TRAIT_GENETICS.blossom_type.dominance[seedParent.blossom_type] || 1;
    const pollenDominance = TRAIT_GENETICS.blossom_type.dominance[pollenParent.blossom_type] || 1;
    
    const outcomes = [];
    
    if (seedDominance > pollenDominance) {
      outcomes.push({ trait: seedParent.blossom_type, probability: 75 });
      outcomes.push({ trait: pollenParent.blossom_type, probability: 25 });
    } else if (pollenDominance > seedDominance) {
      outcomes.push({ trait: pollenParent.blossom_type, probability: 75 });
      outcomes.push({ trait: seedParent.blossom_type, probability: 25 });
    } else {
      outcomes.push({ trait: seedParent.blossom_type, probability: 50 });
      outcomes.push({ trait: pollenParent.blossom_type, probability: 50 });
    }

    predictions.push({
      trait: TRAIT_GENETICS.blossom_type,
      seedValue: seedParent.blossom_type,
      pollenValue: pollenParent.blossom_type,
      prediction: { outcomes }
    });
  }

  // Blossom Color Prediction (intermediate inheritance)
  if (seedParent.blossom_color && pollenParent.blossom_color) {
    const outcomes = [];
    
    if (seedParent.blossom_color.toLowerCase() === pollenParent.blossom_color.toLowerCase()) {
      outcomes.push({ trait: seedParent.blossom_color, probability: 100 });
    } else {
      outcomes.push({ trait: seedParent.blossom_color, probability: 25 });
      outcomes.push({ trait: pollenParent.blossom_color, probability: 25 });
      outcomes.push({ 
        trait: `Blend of ${seedParent.blossom_color} & ${pollenParent.blossom_color}`, 
        probability: 50 
      });
    }

    predictions.push({
      trait: TRAIT_GENETICS.blossom_color,
      seedValue: seedParent.blossom_color,
      pollenValue: pollenParent.blossom_color,
      prediction: { outcomes }
    });
  }

  // Leaf Type Predictions
  const seedLeafTypes = seedParent.leaf_types || [];
  const pollenLeafTypes = pollenParent.leaf_types || [];
  
  if (seedLeafTypes.length > 0 && pollenLeafTypes.length > 0) {
    // Check for variegation
    const seedVariegated = seedLeafTypes.includes("variegated");
    const pollenVariegated = pollenLeafTypes.includes("variegated");
    
    if (seedVariegated || pollenVariegated) {
      const outcomes = [];
      if (seedVariegated && pollenVariegated) {
        outcomes.push({ trait: "Variegated", probability: 100 });
      } else {
        outcomes.push({ trait: "Variegated", probability: 75 });
        outcomes.push({ trait: "Plain", probability: 25 });
      }
      
      predictions.push({
        trait: { name: "Leaf Variegation", description: "Variegation is a dominant trait" },
        seedValue: seedVariegated ? "Variegated" : "Plain",
        pollenValue: pollenVariegated ? "Variegated" : "Plain",
        prediction: { outcomes }
      });
    }

    // Check for boy/girl foliage
    const seedBoy = seedLeafTypes.includes("boy");
    const pollenBoy = pollenLeafTypes.includes("boy");
    const seedGirl = seedLeafTypes.includes("girl");
    const pollenGirl = pollenLeafTypes.includes("girl");
    
    if ((seedBoy || seedGirl) && (pollenBoy || pollenGirl)) {
      const outcomes = [];
      
      if ((seedBoy && pollenBoy) || (seedBoy && !pollenGirl) || (pollenBoy && !seedGirl)) {
        outcomes.push({ trait: "Boy foliage", probability: 75 });
        outcomes.push({ trait: "Girl foliage", probability: 25 });
      } else if (seedGirl && pollenGirl) {
        outcomes.push({ trait: "Girl foliage", probability: 100 });
      } else {
        outcomes.push({ trait: "Boy foliage", probability: 50 });
        outcomes.push({ trait: "Girl foliage", probability: 50 });
      }
      
      predictions.push({
        trait: { name: "Foliage Type", description: "Boy foliage (smooth, waxy) is typically dominant over girl foliage (hairy)" },
        seedValue: seedBoy ? "Boy" : "Girl",
        pollenValue: pollenBoy ? "Boy" : "Girl",
        prediction: { outcomes }
      });
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(154, 226, 211, 0.2) 0%, rgba(110, 231, 183, 0.15) 100%)",
            border: "1px solid rgba(154, 226, 211, 0.4)"
          }}>
          <Sparkles className="w-6 h-6" style={{ color: "#A7F3D0" }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Trait Inheritance Predictions
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Based on Mendelian genetics and African violet breeding patterns
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 rounded-2xl backdrop-blur-xl"
        style={{
          background: "rgba(168, 159, 239, 0.1)",
          border: "1px solid rgba(168, 159, 239, 0.3)"
        }}>
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#C4B5FD" }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Prediction Accuracy
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              These predictions are statistical probabilities based on known genetics. Actual results may vary due to recessive genes, 
              mutations, and complex inheritance patterns. Use as a guide, not a guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* Predictions */}
      {predictions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Not enough trait information available for both parents to make predictions.
            <br />
            Add more details to parent plants for better predictions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((pred, idx) => (
            <TraitPredictionCard
              key={idx}
              trait={pred.trait}
              seedValue={pred.seedValue}
              pollenValue={pred.pollenValue}
              prediction={pred.prediction}
            />
          ))}
        </div>
      )}

      {/* Additional Notes */}
      <div className="mt-6 p-4 rounded-2xl"
        style={{
          background: "rgba(154, 226, 211, 0.05)",
          border: "1px solid rgba(154, 226, 211, 0.2)"
        }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#A7F3D0" }}>
          💡 Breeding Tips:
        </p>
        <ul className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
          <li>• Select parents with complementary traits to increase desired outcomes</li>
          <li>• Hidden recessive genes may surprise you - keep detailed records of all offspring</li>
          <li>• Multiple crosses increase your chances of achieving target traits</li>
          <li>• Some traits (like chimera patterns) require specific breeding techniques</li>
        </ul>
      </div>
    </div>
  );
}