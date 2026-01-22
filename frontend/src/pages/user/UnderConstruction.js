import React from "react";
import { useTranslation } from "react-i18next";
import "./UnderConstruction.css";

function UnderConstruction() {
  const { t } = useTranslation();

  return (
    <div className="under-construction">
      <div className="under-construction__container">
        <div className="under-construction__icon">🚧</div>
        <h1 className="under-construction__title">Page Under Construction</h1>
        <p className="under-construction__message">
          We're working hard to bring you something amazing. This page will be available soon!
        </p>
        <div className="under-construction__progress">
          <div className="under-construction__progress-bar">
            <div className="under-construction__progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnderConstruction;
