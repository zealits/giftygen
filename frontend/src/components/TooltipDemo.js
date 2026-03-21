import React from 'react';
import Tooltip, { FieldTooltip } from './Tooltip';
import './TooltipDemo.css';

const TooltipDemo = () => {
  return (
    <div className="tooltip-demo">
      <h2>Settings Page Tooltip System Demo</h2>
      
      <div className="demo-section">
        <h3>Field Tooltips (Used in Forms)</h3>
        <div className="demo-row">
          <label className="demo-label">
            Business Name
            <FieldTooltip tooltip="Choose a memorable name that represents your brand. This appears on gift cards and your public page." />
          </label>
          <input type="text" className="demo-input" placeholder="Enter your business name" />
        </div>
        
        <div className="demo-row">
          <label className="demo-label">
            Industry
            <FieldTooltip tooltip="Select your business category to customize form fields and options specific to your industry type." />
          </label>
          <select className="demo-input">
            <option>Select an industry</option>
            <option>Restaurant And Fine Dining</option>
            <option>Hotels & Resorts</option>
            <option>Fitness and Wellness</option>
          </select>
        </div>
        
        <div className="demo-row">
          <label className="demo-label">
            Business Hours
            <FieldTooltip tooltip="Set your operating hours so customers know when you're open. The status updates automatically based on current time." />
          </label>
          <input type="time" className="demo-input" />
        </div>
      </div>
      
      <div className="demo-section">
        <h3>Regular Tooltips (Various Positions)</h3>
        <div className="demo-grid">
          <Tooltip content="This tooltip appears on top" position="top">
            <button className="demo-button">Top Tooltip</button>
          </Tooltip>
          
          <Tooltip content="This tooltip appears on the bottom" position="bottom">
            <button className="demo-button">Bottom Tooltip</button>
          </Tooltip>
          
          <Tooltip content="This tooltip appears on the left" position="left">
            <button className="demo-button">Left Tooltip</button>
          </Tooltip>
          
          <Tooltip content="This tooltip appears on the right" position="right">
            <button className="demo-button">Right Tooltip</button>
          </Tooltip>
        </div>
      </div>
      
      <div className="demo-section">
        <h3>Industry-Specific Tooltips</h3>
        <div className="demo-industry-examples">
          <div className="industry-example">
            <h4>🍽️ Restaurant Industry</h4>
            <label className="demo-label">
              Menu Content
              <FieldTooltip tooltip="Add sections (e.g. Starters, Main Course) and items. This appears on your public menu tab and helps customers see what you offer." />
            </label>
          </div>
          
          <div className="industry-example">
            <h4>🏨 Hotel Industry</h4>
            <label className="demo-label">
              Room Types
              <FieldTooltip tooltip="Add each room type with description, size, best for, and photos. This appears on your public rooms tab to help guests choose accommodations." />
            </label>
          </div>
          
          <div className="industry-example">
            <h4>💪 Fitness Industry</h4>
            <label className="demo-label">
              Membership Plans
              <FieldTooltip tooltip="Detail your fitness programs, wellness services, and facilities available to members. This helps potential members understand your offerings." />
            </label>
          </div>
        </div>
      </div>
      
      <div className="demo-section">
        <h3>Features Demonstrated</h3>
        <ul className="features-list">
          <li>✅ <strong>Smart Positioning:</strong> Tooltips automatically adjust to stay visible on screen</li>
          <li>✅ <strong>Industry-Specific Content:</strong> Different tooltip content based on business type</li>
          <li>✅ <strong>Accessible:</strong> Works with keyboard navigation and screen readers</li>
          <li>✅ <strong>Mobile-Friendly:</strong> Adapts to touch devices</li>
          <li>✅ <strong>Professional Design:</strong> Modern styling with animations</li>
          <li>✅ <strong>Flexible Content:</strong> Supports HTML content and custom styling</li>
        </ul>
      </div>
    </div>
  );
};

export default TooltipDemo;