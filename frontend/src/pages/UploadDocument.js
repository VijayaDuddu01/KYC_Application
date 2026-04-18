import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadSimple, FileText, CheckCircle, Warning } from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UploadDocument = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState('Aadhaar');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const documentTypes = ['Aadhaar', 'PAN', 'Passport'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a document image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];

        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API}/verify/upload`,
          {
            document_type: documentType,
            image_base64: base64String
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setSuccess(true);
        setTimeout(() => {
          navigate(`/verification/${response.data.request_id}`);
        }, 1500);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="p-8" data-testid="upload-document-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tighter mb-2" style={{ fontFamily: 'Chivo' }}>
          Upload Document
        </h1>
        <p className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
          Upload identity documents for AI-powered verification
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 p-8">
          {success ? (
            <div data-testid="upload-success-message" className="text-center py-12">
              <CheckCircle size={64} weight="duotone" className="text-[#00875A] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Chivo' }}>
                Upload Successful
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
                Processing document with AI validation...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Document Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {documentTypes.map((type) => (
                    <button
                      key={type}
                      data-testid={`select-document-${type.toLowerCase()}`}
                      onClick={() => setDocumentType(type)}
                      className={`px-6 py-4 border rounded-none text-sm font-semibold transition-colors ${
                        documentType === type
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: 'IBM Plex Sans' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div data-testid="upload-error-message" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
                  <Warning size={20} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Upload Image
                </label>

                {!preview ? (
                  <label
                    data-testid="file-upload-dropzone"
                    className="block border-2 border-dashed border-gray-300 rounded-none p-12 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="file-input"
                    />
                    <UploadSimple size={48} weight="duotone" className="text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: 'IBM Plex Sans' }}>
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Mono' }}>
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </label>
                ) : (
                  <div data-testid="image-preview-container" className="border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-gray-600" />
                        <span className="text-sm font-medium" style={{ fontFamily: 'IBM Plex Sans' }}>
                          {selectedFile?.name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview(null);
                        }}
                        data-testid="remove-image-button"
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <img
                      src={preview}
                      alt="Document preview"
                      className="w-full h-auto max-h-96 object-contain border border-gray-200"
                      data-testid="document-preview-image"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  data-testid="submit-upload-button"
                  className="flex-1 bg-black text-white py-3 px-6 rounded-none font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  style={{ fontFamily: 'IBM Plex Sans' }}
                >
                  {uploading ? 'Processing...' : 'Upload & Verify'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  data-testid="cancel-upload-button"
                  className="px-6 py-3 border border-gray-300 text-black rounded-none font-semibold hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'IBM Plex Sans' }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 mb-3" style={{ fontFamily: 'IBM Plex Sans' }}>
            Verification Process
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-none flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'IBM Plex Sans' }}>OCR Extraction</div>
                <div className="text-xs text-gray-600">AI extracts text and data from document image</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-none flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'IBM Plex Sans' }}>AI Validation</div>
                <div className="text-xs text-gray-600">Automated checks for tampering and data consistency</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-none flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'IBM Plex Sans' }}>Human Review</div>
                <div className="text-xs text-gray-600">Manual verification if issues detected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
