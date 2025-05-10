import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiCheck, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../../../utils/constants';

const XMLUploadComponent = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);
  const progressInterval = useRef(null);
  
  // Handle file selection from input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // Validate file type and size
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    
    // Check file type
    if (!selectedFile.name.endsWith('.xml')) {
      setErrorMessage('Only XML files are allowed');
      setUploadStatus('error');
      return;
    }
    
    // Check file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMessage('File size cannot exceed 50MB');
      setUploadStatus('error');
      return;
    }
    
    setFile(selectedFile);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle button click to open file dialog
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Upload file to server
  const handleUpload = async () => {
    if (!file) return;
    
    setUploadStatus('uploading');
    setProgress(0);
    
    const formData = new FormData();
    formData.append('xmlFile', file);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/upload/xml`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });
      
      if (response.data.success) {
        setJobId(response.data.job.id);
        setUploadStatus('processing');
        pollJobStatus(response.data.job.id);
      } else {
        setErrorMessage(response.data.message || 'Upload failed');
        setUploadStatus('error');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || 'Upload failed');
      setUploadStatus('error');
    }
  };

  // Poll job status
  const pollJobStatus = (id) => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    progressInterval.current = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/upload/jobs/${id}`);
        
        if (response.data.success) {
          const job = response.data.job;
          setProgress(job.progress || 0);
          
          if (job.status === 'completed') {
            clearInterval(progressInterval.current);
            setUploadStatus('completed');
            setResult(job.result);
          } else if (job.status === 'failed') {
            clearInterval(progressInterval.current);
            setUploadStatus('error');
            setErrorMessage(job.error || 'Import failed');
          } else if (job.status === 'cancelled') {
            clearInterval(progressInterval.current);
            setUploadStatus('idle');
            setErrorMessage('Import was cancelled');
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Cancel job
  const handleCancel = async () => {
    if (!jobId) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/upload/jobs/${jobId}`);
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      setUploadStatus('idle');
      setErrorMessage('Import cancelled by user');
    } catch (error) {
      setErrorMessage('Failed to cancel import');
    }
  };

  // Reset state for a new upload
  const handleReset = () => {
    setFile(null);
    setUploadStatus('idle');
    setProgress(0);
    setJobId(null);
    setErrorMessage('');
    setResult(null);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Import GEKO XML Product Data</h2>
      
      {/* File upload area */}
      {uploadStatus === 'idle' && (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center justify-center">
            <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">XML files only (MAX. 50MB)</p>
            
            <button
              type="button"
              onClick={handleButtonClick}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Select File
            </button>
          </div>
        </div>
      )}
      
      {/* Selected file */}
      {file && uploadStatus === 'idle' && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center">
            <FiFile className="w-6 h-6 text-blue-500 mr-2" />
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Upload & Process
            </button>
          </div>
        </div>
      )}
      
      {/* Upload/Processing progress */}
      {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
        <div className="mt-6">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-700">
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing XML data...'}
            </span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {uploadStatus === 'processing' && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cancel Import
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="mt-6 p-4 border border-red-300 rounded-lg bg-red-50">
          <div className="flex items-start">
            <FiAlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Result summary */}
      {uploadStatus === 'completed' && result && (
        <div className="mt-6 p-4 border border-green-300 rounded-lg bg-green-50">
          <div className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Import Completed Successfully</p>
              <div className="mt-2 text-sm text-green-600">
                <p>Duration: {result.duration.toFixed(2)} seconds</p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  <p>Total Products: {result.stats.totalProducts}</p>
                  <p>Imported Products: {result.stats.importedProducts}</p>
                  <p>Categories: {result.stats.categoriesCount}</p>
                  <p>Producers: {result.stats.producersCount}</p>
                  <p>Variants: {result.stats.variantsCount}</p>
                  <p>Prices: {result.stats.pricesCount}</p>
                  <p>Images: {result.stats.imagesCount}</p>
                  <p>Documents: {result.stats.documentsCount}</p>
                  <p>Properties: {result.stats.propertiesCount}</p>
                  <p>Errors: {result.stats.errorsCount}</p>
                </div>
                
                {result.stats.errorsCount > 0 && (
                  <p className="mt-2 text-yellow-600">
                    Warning: {result.stats.errorsCount} errors occurred during import. Check the logs for details.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Reset button */}
      {(uploadStatus === 'completed' || uploadStatus === 'error') && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
};

export default XMLUploadComponent; 