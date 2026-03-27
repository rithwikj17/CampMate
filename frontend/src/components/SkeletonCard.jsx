import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      {/* Optional Top Image/Banner Area */}
      <div className="h-32 bg-slate-200"></div>
      
      <div className="p-5 space-y-4">
        {/* Badge / Meta */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
        </div>

        {/* Title */}
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>

        {/* Details/Description Lines */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>

        {/* Footer/Button area */}
        <div className="pt-4 flex justify-between items-center border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-10 w-28 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
