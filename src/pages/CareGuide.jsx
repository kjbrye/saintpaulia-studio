
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Droplets, Sun, Thermometer, Wind, Sparkles, AlertCircle, HelpCircle, ChevronDown, BookOpen, Lightbulb } from "lucide-react";
import { createPageUrl } from "@/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function CareGuide() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const careTopics = [
    {
      icon: Sun,
      title: "Light Requirements",
      color: "#FCD34D",
      gradient: "rgba(252, 211, 77, 0.2)",
      border: "rgba(252, 211, 77, 0.4)",
      content: [
        "Bright, indirect light is ideal - avoid direct sunlight which can scorch leaves",
        "East or west-facing windows work best",
        "12-14 hours of light daily for optimal blooming",
        "Grow lights can supplement natural light, placed 12-18 inches above plants",
        "Rotate plants weekly for even growth"
      ]
    },
    {
      icon: Droplets,
      title: "Watering",
      color: "#7DD3FC",
      gradient: "rgba(125, 211, 252, 0.2)",
      border: "rgba(125, 211, 252, 0.4)",
      content: [
        "Water when top inch of soil feels dry to the touch",
        "Use room temperature water to avoid shocking roots",
        "Bottom watering prevents water spots on leaves",
        "Never let plants sit in standing water",
        "Wick watering systems provide consistent moisture",
        "Avoid getting water on leaves and crown to prevent rot"
      ]
    },
    {
      icon: Leaf,
      title: "Soil & Potting",
      color: "#A7F3D0",
      gradient: "rgba(167, 243, 208, 0.2)",
      border: "rgba(167, 243, 208, 0.4)",
      content: [
        "Use a light, well-draining African violet potting mix",
        "Mix should contain peat moss, perlite, and vermiculite",
        "Repot annually or when roots fill the pot",
        "Choose pots 1/3 the diameter of the plant",
        "Ensure pots have drainage holes",
        "Plastic pots retain moisture better than terra cotta"
      ]
    },
    {
      icon: Thermometer,
      title: "Temperature",
      color: "#FCA5A5",
      gradient: "rgba(252, 165, 165, 0.2)",
      border: "rgba(252, 165, 165, 0.4)",
      content: [
        "Ideal temperature: 65-75°F (18-24°C)",
        "Avoid temperatures below 60°F (15°C)",
        "Keep away from cold drafts and heating vents",
        "Consistent temperatures promote better blooming",
        "Slight temperature drop at night is beneficial"
      ]
    },
    {
      icon: Wind,
      title: "Humidity",
      color: "#C4B5FD",
      gradient: "rgba(196, 181, 253, 0.2)",
      border: "rgba(196, 181, 253, 0.4)",
      content: [
        "Prefer 50-60% relative humidity",
        "Group plants together to increase humidity",
        "Use humidity trays with pebbles and water",
        "Avoid misting leaves directly",
        "Consider a humidifier in dry environments",
        "Good air circulation prevents fungal issues"
      ]
    },
    {
      icon: Sparkles,
      title: "Fertilizing",
      color: "#FCD34D",
      gradient: "rgba(252, 211, 77, 0.2)",
      border: "rgba(252, 211, 77, 0.4)",
      content: [
        "Fertilize every 2-4 weeks during active growth",
        "Use balanced fertilizer (14-12-14 or 20-20-20)",
        "Dilute to 1/4 strength for frequent feeding",
        "Flush soil monthly to prevent salt buildup",
        "Reduce fertilizing during winter months",
        "High phosphorus promotes more blooms"
      ]
    }
  ];

  const commonProblems = [
    {
      problem: "No Blooms",
      causes: ["Insufficient light", "Over-fertilizing with nitrogen", "Low humidity", "Root bound plant"],
      solutions: ["Increase light exposure", "Switch to bloom-boosting fertilizer", "Improve humidity", "Repot into slightly larger container"]
    },
    {
      problem: "Brown Leaf Tips",
      causes: ["Low humidity", "Fertilizer salt buildup", "Water quality issues"],
      solutions: ["Increase humidity", "Flush soil with water", "Use distilled or filtered water"]
    },
    {
      problem: "Yellowing Leaves",
      causes: ["Overwatering", "Underwatering", "Too much light", "Natural aging"],
      solutions: ["Adjust watering schedule", "Check soil moisture regularly", "Move to less intense light", "Remove old leaves"]
    },
    {
      problem: "Crown or Root Rot",
      causes: ["Overwatering", "Water in crown", "Poor drainage", "Cold temperatures"],
      solutions: ["Allow soil to dry out", "Water from bottom only", "Improve drainage", "Increase temperature"]
    },
    {
      problem: "Leggy Growth",
      causes: ["Insufficient light", "Too much nitrogen", "Overcrowding"],
      solutions: ["Provide more light", "Adjust fertilizer", "Remove suckers", "Prune and propagate"]
    }
  ];

  const faqs = [
    {
      question: "How often should I water my African violets?",
      answer: "Water when the top inch of soil feels dry to the touch, typically every 5-7 days. The exact frequency depends on your home's temperature, humidity, pot size, and soil mix. Bottom watering is often preferred as it prevents water spots on leaves and reduces the risk of crown rot."
    },
    {
      question: "Why won't my African violet bloom?",
      answer: "The most common reason is insufficient light. African violets need 12-14 hours of bright, indirect light daily to bloom well. Other factors include over-fertilizing with nitrogen (use a high-phosphorus fertilizer for blooms), low humidity, or the plant being root-bound. Also ensure you're removing spent blooms regularly."
    },
    {
      question: "Can I propagate African violets from leaves?",
      answer: "Yes! Leaf propagation is easy and reliable. Select a healthy leaf with stem, cut the stem at an angle, and insert it into moist vermiculite or African violet potting mix. Cover with plastic to maintain humidity. New plantlets will emerge in 4-8 weeks. Keep soil moist but not soggy."
    },
    {
      question: "What type of water should I use?",
      answer: "Room temperature water is essential. Tap water is usually fine, but if it's heavily chlorinated or has high mineral content, consider using distilled, filtered, or rainwater. Cold water can shock the plant and cause leaf spotting. Always let water reach room temperature before using."
    },
    {
      question: "How do I remove dead leaves and flowers?",
      answer: "Gently pinch or cut off dead flowers and yellowing leaves at their base where they meet the stem. Regular grooming encourages new growth and blooms, prevents disease, and keeps your plant looking attractive. Remove suckers (side crowns) to maintain a single crown for best blooming."
    },
    {
      question: "What size pot should I use?",
      answer: "The pot should be approximately 1/3 the diameter of the plant's width. African violets bloom best when slightly root-bound. Use pots with drainage holes, and plastic pots work better than terra cotta as they retain moisture more consistently."
    },
    {
      question: "Are African violets toxic to pets?",
      answer: "No, African violets (Saintpaulia) are non-toxic to cats, dogs, and other pets according to the ASPCA. They're safe to keep in homes with curious pets. However, it's still best to discourage pets from nibbling on any houseplants."
    },
    {
      question: "How long do African violets live?",
      answer: "With proper care, African violets can live for many years - some plants have been known to thrive for 50+ years! They'll need periodic repotting, grooming, and may need to be propagated and restarted every 5-10 years to maintain vigor."
    },
    {
      question: "Why do my leaves have white or brown spots?",
      answer: "White or brown spots are usually caused by cold water touching the leaves or water droplets acting as magnifying glasses in bright light. Always use room temperature water and avoid getting water on the foliage. If spots appear powdery, it could be powdery mildew - improve air circulation."
    },
    {
      question: "What's the difference between standard, miniature, and trailing violets?",
      answer: "Standard African violets have rosettes 8-16 inches in diameter. Miniatures are under 6 inches, and semi-miniatures are 6-8 inches. Trailing violets have a vining growth habit and work beautifully in hanging baskets. All have similar care requirements."
    }
  ];

  const proTips = [
    "Rotate your plants weekly to ensure even growth on all sides",
    "Keep humidity trays below pots to prevent water from touching the bottom of pots",
    "Use a soft brush to gently clean dusty leaves",
    "Start a care journal to track what works best for your specific environment",
    "Join an African violet society to connect with other enthusiasts",
    "Propagate favorite plants before they get too old",
    "Remove spent blooms promptly to encourage continuous flowering",
    "Consider a self-watering system for consistent moisture"
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl("Collection"))}
            className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
              <BookOpen className="w-8 h-8" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                African Violet Care Guide
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Everything you need to know about Saintpaulia care
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="glass-card rounded-[32px] p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center glow-violet p-2 flex-shrink-0">
              <img 
                src={LOGO_URL} 
                alt="African Violet" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ 
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                About African Violets
              </h2>
              <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                African violets (Saintpaulia) are beloved houseplants native to Tanzania and Kenya. Discovered in 1892, 
                these charming plants have become one of the world's most popular flowering houseplants, prized for their 
                compact growth, colorful blooms, and ability to flower year-round under proper conditions.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                With over 16,000 registered cultivars, African violets offer incredible diversity in flower form, color, 
                and foliage. From classic purple blooms to bi-colors, frilled edges, and fantasy patterns, there's an 
                African violet to suit every taste. With proper care, these plants can bloom continuously and bring joy 
                for many years.
              </p>
            </div>
          </div>
        </div>

        {/* Care Topics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ 
            color: 'var(--text-primary)',
            textShadow: 'var(--heading-shadow)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Essential Care Guide
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {careTopics.map((topic, index) => (
              <div key={index} className="glass-card rounded-[28px] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl"
                    style={{
                      background: topic.gradient,
                      border: `1px solid ${topic.border}`
                    }}>
                    <topic.icon className="w-6 h-6" style={{ color: topic.color, strokeWidth: 1.8 }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ 
                    color: 'var(--text-primary)',
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {topic.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {topic.content.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" 
                        style={{ background: topic.color }} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Common Problems */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-7 h-7" style={{ color: "#FCA5A5", strokeWidth: 1.5 }} />
            <h2 className="text-2xl font-bold" style={{ 
              color: 'var(--text-primary)',
              textShadow: 'var(--heading-shadow)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Common Problems & Solutions
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {commonProblems.map((item, index) => (
              <div key={index} className="glass-card rounded-[28px] p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: "#FCA5A5" }} />
                  {item.problem}
                </h3>
                
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                    Common Causes:
                  </p>
                  <ul className="space-y-1">
                    {item.causes.map((cause, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" 
                          style={{ background: "#FCA5A5", opacity: 0.6 }} />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                    Solutions:
                  </p>
                  <ul className="space-y-1">
                    {item.solutions.map((solution, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" 
                          style={{ background: "#A7F3D0" }} />
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            <h2 className="text-2xl font-bold" style={{ 
              color: 'var(--text-primary)',
              textShadow: 'var(--heading-shadow)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-card rounded-[24px] overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  <h3 className="text-base font-semibold pr-4" style={{ color: 'var(--text-primary)' }}>
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                    style={{ color: '#C4B5FD', strokeWidth: 2 }}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <div className="glass-card rounded-[32px] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-7 h-7" style={{ color: "#FCD34D", strokeWidth: 1.5 }} />
            <h2 className="text-2xl font-bold" style={{ 
              color: 'var(--text-primary)',
              textShadow: 'var(--heading-shadow)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Pro Tips for Success
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {proTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 glass-button rounded-2xl p-4">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-xl"
                  style={{
                    background: "rgba(252, 211, 77, 0.2)",
                    border: "1px solid rgba(252, 211, 77, 0.4)"
                  }}>
                  <Sparkles className="w-4 h-4" style={{ color: "#FCD34D", strokeWidth: 2 }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center glass-card rounded-[28px] p-8">
          <h3 className="text-xl font-bold mb-2" style={{ 
            color: 'var(--text-primary)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Ready to Start Your Collection?
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Track your African violets' care, growth, and blooming cycles with Saintpaulia Studio
          </p>
          <button
            onClick={() => navigate(createPageUrl("AddPlant"))}
            className="glass-accent-lavender px-8 py-4 rounded-3xl font-semibold inline-flex items-center gap-2"
            style={{ color: '#F0EBFF' }}
          >
            <Leaf className="w-5 h-5" style={{ strokeWidth: 2 }} />
            Add Your First Plant
          </button>
        </div>
      </div>
    </div>
  );
}
