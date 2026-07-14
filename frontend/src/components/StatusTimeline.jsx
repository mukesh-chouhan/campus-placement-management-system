import React from 'react';
import { motion } from 'framer-motion';

const StatusTimeline = ({ currentStatus }) => {
  const steps = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'ONLINE_ASSESSMENT', label: 'Online Assessment' },
    { key: 'TECHNICAL_INTERVIEW', label: 'Technical Interview' },
    { key: 'HR_INTERVIEW', label: 'HR Interview' },
    { key: 'SELECTED', label: 'Selected' }
  ];

  const getStepStatus = (stepKey, index) => {
    if (currentStatus === 'REJECTED' && index === steps.length - 1) {
      return 'rejected';
    }

    const currentIndex = steps.findIndex(s => s.key === currentStatus);
    
    if (currentStatus === 'REJECTED') {
      const lastAppIndex = steps.findIndex(s => s.key === 'HR_INTERVIEW');
      if (index <= lastAppIndex) return 'completed';
      return 'inactive';
    }

    if (stepKey === currentStatus) {
      return 'active';
    }

    if (index < currentIndex || (currentStatus === 'SELECTED' && index === steps.length - 1)) {
      return 'completed';
    }

    return 'inactive';
  };

  const getDisplayLabel = (step) => {
    if (step.key === 'SELECTED' && currentStatus === 'REJECTED') {
      return 'Rejected';
    }
    return step.label;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="timeline"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(step.key, index);
        
        let className = 'timeline-item';
        if (stepStatus === 'active') className += ' active';
        else if (stepStatus === 'completed') className += ' completed';
        else if (stepStatus === 'rejected') className += ' rejected';

        return (
          <motion.div 
            key={step.key} 
            className={className}
            variants={itemVariants}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <span className="timeline-title" style={{ 
                fontWeight: stepStatus === 'active' ? '700' : '600',
                color: stepStatus === 'active' ? 'var(--primary)' : 'inherit'
              }}>
                {getDisplayLabel(step)}
              </span>
              <span className="timeline-date">
                {stepStatus === 'active' && 'Current Stage'}
                {stepStatus === 'completed' && 'Completed'}
                {stepStatus === 'rejected' && 'Application Closed'}
                {stepStatus === 'inactive' && 'Pending'}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatusTimeline;
