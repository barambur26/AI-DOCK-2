// 🤖 Assistant Badge Component
// Shows which assistant generated an AI response
// Displays as a small badge on AI message bubbles

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AssistantBadgeProps {
  assistantName: string;
  assistantColor?: string;  // Hex color code for the assistant
  isIntroduction?: boolean;
  className?: string;
}

/**
 * Badge component that shows which assistant generated a message
 * 
 * 🎓 LEARNING: Component Design Patterns
 * ======================================
 * This component demonstrates:
 * - Small, focused component with single responsibility
 * - Conditional styling based on message type
 * - Semantic props that convey meaning
 * - Professional badge design with proper typography
 * - Icon usage for visual hierarchy
 */
export const AssistantBadge: React.FC<AssistantBadgeProps> = ({
  assistantName,
  assistantColor,
  isIntroduction = false,
  className = ''
}) => {
  // Use assistant color or fallback to defaults
  const iconColor = assistantColor || (isIntroduction ? '#3B82F6' : '#6B7280');
  const textColor = assistantColor || (isIntroduction ? '#1D4ED8' : '#4B5563');
  const badgeColor = assistantColor ? `${assistantColor}20` : '#DBEAFE'; // 20% opacity
  
  return (
    <div className={`inline-flex items-center space-x-1.5 ${className}`}>
      {/* Color indicator dot */}
      {assistantColor && (
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: assistantColor }}
        ></div>
      )}
      
      {/* Icon varies based on message type with color */}
      {isIntroduction ? (
        <Sparkles 
          className="w-3 h-3" 
          style={{ color: iconColor }}
        />
      ) : (
        <Bot 
          className="w-3 h-3" 
          style={{ color: iconColor }}
        />
      )}
      
      {/* Assistant name with color theming */}
      <span 
        className={`text-xs font-medium ${
          isIntroduction ? 'font-semibold' : ''
        }`}
        style={{ color: textColor }}
      >
        {assistantName}
        {isIntroduction && (
          <span 
            className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: badgeColor,
              color: textColor
            }}
          >
            Introduction
          </span>
        )}
      </span>
    </div>
  );
};

/**
 * 🎨 Component Features:
 * =====================
 * 
 * 1. **Visual Differentiation**: Different icons for introductions vs regular messages
 * 2. **Professional Typography**: Consistent with chat interface design
 * 3. **Conditional Styling**: Introduction messages get special visual treatment
 * 4. **Compact Design**: Small footprint that doesn't overwhelm the message
 * 5. **Semantic Markup**: Clear meaning through props and styling
 * 
 * Usage Examples:
 * ===============
 * 
 * ```tsx
 * // Regular AI response badge with color
 * <AssistantBadge 
 *   assistantName="Customer Support Bot" 
 *   assistantColor="#3B82F6"
 * />
 * 
 * // Introduction message badge with color
 * <AssistantBadge 
 *   assistantName="Creative Writing Assistant" 
 *   assistantColor="#10B981"
 *   isIntroduction={true} 
 * />
 * 
 * // Fallback without color (uses default styling)
 * <AssistantBadge assistantName="Default Assistant" />
 * ```
 */