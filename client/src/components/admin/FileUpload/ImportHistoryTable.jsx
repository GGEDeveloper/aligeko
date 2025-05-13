import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiFile, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../../../utils/constants';

const ImportHistoryTable = () => {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImportHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/upload/history`);
      if (response.data.success) {
        setImports(response.data.imports || []);
      } else {
        setError('Failed to fetch import history');
      }
    } catch (error) {
      setError('Error fetching import history: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" />;
      case 'failed':
        return <FiAlertTriangle className="text-red-500" />;
      case 'processing':
        return <FiClock className="text-yellow-500" />;
      default:
        return <FiFile className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <FiRefreshCw className="animate-spin h-6 w-6 text-blue-500 mr-2" />
        <span>Loading import history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <p className="flex items-center">
          <FiAlertTriangle className="mr-2" />
          {error}
        </p>
        <button
          onClick={fetchImportHistory}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (imports.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-md">
        <p className="text-gray-500">No import history available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items Processed
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {imports.map((importItem) => (
            <tr key={importItem.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {importItem.fileName || 'Unknown file'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(importItem.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex items-center">
                  {getStatusIcon(importItem.status)}
                  <span className="ml-1 text-sm text-gray-700 capitalize">
                    {importItem.status}
                  </span>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {importItem.itemsProcessed || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => {
                    // View details function would go here
                    alert(`View details for import ${importItem.id}`);
                  }}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportHistoryTable; 