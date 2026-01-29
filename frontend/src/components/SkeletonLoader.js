import React from "react";
import "./SkeletonLoader.css";

export const BusinessCardSkeleton = () => {
  return (
    <div className="skeleton-business-card">
      <div className="skeleton-logo shimmer"></div>
      <div className="skeleton-content">
        <div className="skeleton-title shimmer"></div>
        <div className="skeleton-description shimmer"></div>
        <div className="skeleton-description short shimmer"></div>
        <div className="skeleton-meta">
          <div className="skeleton-location shimmer"></div>
          <div className="skeleton-industry shimmer"></div>
        </div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-cta shimmer"></div>
      </div>
    </div>
  );
};

export const IndustryChipSkeleton = () => {
  return (
    <div className="skeleton-industry-chip">
      <div className="skeleton-chip-icon shimmer"></div>
      <div className="skeleton-chip-name shimmer"></div>
    </div>
  );
};
