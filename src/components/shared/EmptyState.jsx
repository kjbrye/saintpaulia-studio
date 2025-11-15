import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
  secondaryActionText,
  secondaryActionLink,
  onSecondaryAction,
  variant = "default",
  size = "large",
  illustration
}) {
  const variants = {
    default: {
      iconBg: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)",
      iconBorder: "1px solid rgba(168, 159, 239, 0.35)",
      iconColor: "#C4B5FD",
      iconShadow: "0 4px 16px rgba(168, 159, 239, 0.25)"
    },
    success: {
      iconBg: "linear-gradient(135deg, rgba(154, 226, 211, 0.18) 0%, rgba(110, 231, 183, 0.15) 100%)",
      iconBorder: "1px solid rgba(154, 226, 211, 0.4)",
      iconColor: "#A7F3D0",
      iconShadow: "0 4px 16px rgba(154, 226, 211, 0.3)"
    },
    warning: {
      iconBg: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.12) 100%)",
      iconBorder: "1px solid rgba(251, 146, 60, 0.35)",
      iconColor: "#FCD34D",
      iconShadow: "0 4px 16px rgba(251, 146, 60, 0.25)"
    },
    info: {
      iconBg: "linear-gradient(135deg, rgba(125, 211, 252, 0.18) 0%, rgba(56, 189, 248, 0.15) 100%)",
      iconBorder: "1px solid rgba(125, 211, 252, 0.4)",
      iconColor: "#7DD3FC",
      iconShadow: "0 4px 16px rgba(125, 211, 252, 0.3)"
    }
  };

  const sizes = {
    small: {
      iconSize: "w-12 h-12",
      iconInnerSize: "w-6 h-6",
      titleSize: "text-lg",
      descSize: "text-sm",
      padding: "py-8"
    },
    medium: {
      iconSize: "w-16 h-16",
      iconInnerSize: "w-8 h-8",
      titleSize: "text-xl",
      descSize: "text-base",
      padding: "py-12"
    },
    large: {
      iconSize: "w-20 h-20",
      iconInnerSize: "w-10 h-10",
      titleSize: "text-2xl",
      descSize: "text-base",
      padding: "py-16"
    }
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  const ActionButton = ({ text, link, onClick, primary = true }) => {
    const button = (
      <button
        onClick={onClick}
        className={`px-8 py-4 rounded-3xl font-semibold inline-flex items-center gap-2 transition-all ${
          primary ? "neuro-accent-raised" : "neuro-button"
        }`}
        style={{ color: primary ? "#F0EBFF" : "var(--text-secondary)" }}
      >
        {text}
      </button>
    );

    if (link) {
      return (
        <Link to={createPageUrl(link)}>
          {button}
        </Link>
      );
    }

    return button;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`text-center ${currentSize.padding}`}
    >
      <div className="max-w-lg mx-auto">
        {/* Icon or Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          {illustration ? (
            <div className="flex justify-center mb-6">
              <img 
                src={illustration} 
                alt={title}
                className="max-w-xs opacity-80"
              />
            </div>
          ) : Icon ? (
            <div 
              className={`${currentSize.iconSize} rounded-3xl flex items-center justify-center mx-auto neuro-icon-well`}
            >
              <Icon 
                className={currentSize.iconInnerSize} 
                style={{ 
                  color: currentVariant.iconColor, 
                  strokeWidth: 1.5 
                }} 
              />
            </div>
          ) : null}
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`${currentSize.titleSize} font-bold mb-3`}
          style={{ 
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.3)"
          }}
        >
          {title}
        </motion.h3>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className={`${currentSize.descSize} mb-8 leading-relaxed`}
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </motion.p>
        )}

        {/* Actions */}
        {(actionText || secondaryActionText) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {actionText && (
              <ActionButton
                text={actionText}
                link={actionLink}
                onClick={onAction}
                primary={true}
              />
            )}
            {secondaryActionText && (
              <ActionButton
                text={secondaryActionText}
                link={secondaryActionLink}
                onClick={onSecondaryAction}
                primary={false}
              />
            )}
          </motion.div>
        )}

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 flex justify-center gap-2"
        >
          <div className="w-2 h-2 rounded-full" style={{ background: currentVariant.iconColor, opacity: 0.4 }} />
          <div className="w-2 h-2 rounded-full" style={{ background: currentVariant.iconColor, opacity: 0.6 }} />
          <div className="w-2 h-2 rounded-full" style={{ background: currentVariant.iconColor, opacity: 0.4 }} />
        </motion.div>
      </div>
    </motion.div>
  );
}