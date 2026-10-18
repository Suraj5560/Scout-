import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'pill' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  rounded = 'md',
  ...props
}) => {
  const roundedClass = {
    sm: 'rounded-md',
    md: 'rounded-[14px]',
    lg: 'rounded-[22px]',
    pill: 'rounded-pill',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`skeleton-shimmer ${roundedClass} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};
