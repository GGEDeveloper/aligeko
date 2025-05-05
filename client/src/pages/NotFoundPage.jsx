import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-blue-700">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium"
      >
        Back to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage; 