import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen font-[Poppins] bg-neutral-50 text-gray-700">
      <div
        className="animate-spin rounded-full h-16 w-16 mb-4 border-4 border-gray-300 border-t-orange-500"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-600">
        👨‍🍳 Yum recipes await thee...
      </h1>
    </div>
  );
};

export default Spinner;