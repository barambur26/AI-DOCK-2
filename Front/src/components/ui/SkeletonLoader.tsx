// 💀 Skeleton Loading Component
// Provides placeholder loading states that match the actual content layout

import React from 'react';

/**
 * SkeletonLoader Component
 * 
 * Learning: Skeleton loading provides better UX by showing content placeholders
 * that match the actual layout. Users understand what's loading and see progress.
 * 
 * Design Pattern: Creates placeholder cards/tables that match the real content
 * structure for seamless loading experience.
 */

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'chart' | 'dashboard';
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  className = '',
  count = 1
}) => {

  // Base skeleton animation classes
  const skeletonBase = 'bg-white/10 animate-pulse rounded-xl';
  const shimmerEffect = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

  // Skeleton variants
  const renderCard = () => (
    <div className={`${skeletonBase} ${shimmerEffect} p-6 space-y-4`}>
      <div className="flex items-center justify-between">
        <div className={`${skeletonBase} h-4 w-24`}></div>
        <div className={`${skeletonBase} h-10 w-10 rounded-2xl`}></div>
      </div>
      <div className="space-y-2">
        <div className={`${skeletonBase} h-8 w-20`}></div>
        <div className={`${skeletonBase} h-4 w-32`}></div>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className={`${skeletonBase} ${shimmerEffect} p-6 space-y-4`}>
      <div className={`${skeletonBase} h-6 w-40`}></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className={`${skeletonBase} h-4 w-32`}></div>
            <div className={`${skeletonBase} h-4 w-20`}></div>
            <div className={`${skeletonBase} h-4 w-16`}></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = () => (
    <div className={`${skeletonBase} ${shimmerEffect} p-6 space-y-4`}>
      <div className={`${skeletonBase} h-6 w-36`}></div>
      <div className="space-y-4">
        <div className={`${skeletonBase} h-48 w-full rounded-lg`}></div>
        <div className="flex space-x-2">
          <div className={`${skeletonBase} h-4 w-16`}></div>
          <div className={`${skeletonBase} h-4 w-20`}></div>
          <div className={`${skeletonBase} h-4 w-18`}></div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${skeletonBase} ${shimmerEffect} p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div className={`${skeletonBase} h-4 w-24`}></div>
              <div className={`${skeletonBase} h-10 w-10 rounded-2xl`}></div>
            </div>
            <div className="space-y-2">
              <div className={`${skeletonBase} h-8 w-20`}></div>
              <div className={`${skeletonBase} h-4 w-32`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={`${skeletonBase} ${shimmerEffect} p-6 space-y-4`}>
            <div className={`${skeletonBase} h-6 w-36`}></div>
            <div className={`${skeletonBase} h-64 w-full rounded-lg`}></div>
          </div>
        ))}
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={`${skeletonBase} ${shimmerEffect} p-6 space-y-4`}>
            <div className={`${skeletonBase} h-6 w-40`}></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center space-x-4">
                  <div className={`${skeletonBase} h-4 w-32`}></div>
                  <div className={`${skeletonBase} h-4 w-20`}></div>
                  <div className={`${skeletonBase} h-4 w-16`}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render based on variant
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCard();
      case 'table':
        return renderTable();
      case 'chart':
        return renderChart();
      case 'dashboard':
        return renderDashboard();
      default:
        return renderCard();
    }
  };

  if (variant === 'dashboard') {
    return (
      <div className={className}>
        {renderSkeleton()}
      </div>
    );
  }

  // For card variant with count > 1, render in grid
  if (variant === 'card' && count > 1) {
    return (
      <>
        {[...Array(count)].map((_, i) => (
          <div key={i} className={`${skeletonBase} ${shimmerEffect} p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div className={`${skeletonBase} h-4 w-24`}></div>
              <div className={`${skeletonBase} h-10 w-10 rounded-2xl`}></div>
            </div>
            <div className="space-y-2">
              <div className={`${skeletonBase} h-8 w-20`}></div>
              <div className={`${skeletonBase} h-4 w-32`}></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={i > 0 ? 'mt-6' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
