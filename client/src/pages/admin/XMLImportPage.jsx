import React from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import XMLUploadComponent from '../../components/admin/FileUpload/XMLUploadComponent';
import ImportHistoryTable from '../../components/admin/FileUpload/ImportHistoryTable';
import { FiDatabase, FiInfo } from 'react-icons/fi';

const XMLImportPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">XML Data Import</h1>
            <p className="mt-2 text-gray-600">
              Upload and process GEKO XML files to import product data into the database.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <a
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDatabase className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
              View Products
            </a>
          </div>
        </div>
        
        <XMLUploadComponent />
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start">
            <FiInfo className="mt-0.5 mr-3 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-blue-800">About XML Imports</h3>
              <div className="mt-2 text-sm text-blue-600">
                <p className="mb-2">
                  This tool allows you to upload GEKO XML files to import product data directly into the AliTools database.
                </p>
                <p className="mb-2">
                  The import process handles products, categories, producers, variants, prices, images, documents, and product properties.
                </p>
                <p className="mb-2">
                  <strong>Important:</strong> Large XML files may take several minutes to process. You can safely navigate away from this page
                  after starting the import - the process will continue in the background.
                </p>
                <p>
                  For any issues with the import process, please check the server logs or contact technical support.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">XML Import Guidelines</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">File Requirements</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>File must be valid XML with appropriate structure</li>
                <li>Maximum file size: 50MB</li>
                <li>File should follow GEKO XML format</li>
                <li>All mandatory fields must be present</li>
                <li>Product codes must be unique</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Processing Behavior</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Existing products will be updated with new data</li>
                <li>New products will be created</li>
                <li>Images are imported and linked to products</li>
                <li>Category structure is maintained</li>
                <li>All relationships (variants, prices, etc.) are preserved</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <ImportHistoryTable />
        </div>
      </div>
    </AdminLayout>
  );
};

export default XMLImportPage; 