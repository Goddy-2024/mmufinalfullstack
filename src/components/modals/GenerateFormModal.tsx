import React, { useState } from 'react';
import { X, Copy, ExternalLink } from 'lucide-react';
import { registrationAPI } from '../../services/api';

interface GenerateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormGenerated: (formData: any) => void;
}

const GenerateFormModal: React.FC<GenerateFormModalProps> = ({ isOpen, onClose, onFormGenerated }) => {
  const [formData, setFormData] = useState({
    title: 'Fellowship Registration Form',
    description: 'Welcome to MMU RHSF Fellowship! Please fill out this form to join our community.',
    maxSubmissions: 100,
    expiresInDays: 30
  });
  const [generatedForm, setGeneratedForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await registrationAPI.generateForm(formData);
      setGeneratedForm(response.data);
      onFormGenerated(response.data);
    } catch (error) {
      console.error('Error generating form:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resetForm = () => {
    setGeneratedForm(null);
    setFormData({
      title: 'Fellowship Registration Form',
      description: 'Welcome to MMU RHSF Fellowship! Please fill out this form to join our community.',
      maxSubmissions: 100,
      expiresInDays: 30
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Generate Registration Form</h2>
            <p className="text-sm text-gray-600 mt-1">Create a public registration link for new members</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!generatedForm ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Form Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxSubmissions" className="block text-sm font-medium text-gray-700 mb-2">Max Submissions</label>
                <input
                  type="number"
                  id="maxSubmissions"
                  name="maxSubmissions"
                  value={formData.maxSubmissions}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-2">Expires In (Days)</label>
                <input
                  type="number"
                  id="expiresInDays"
                  name="expiresInDays"
                  value={formData.expiresInDays}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Form'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Form Generated Successfully!</h3>
              <p className="text-green-700">Your registration form is now ready to share with potential members.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generatedForm.formUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedForm.formUrl)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={generatedForm.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                    title="Open form"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {copied && <p className="text-sm text-green-600 mt-1">URL copied to clipboard!</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Form ID:</span>
                  <p className="text-gray-600">{generatedForm.formId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expires:</span>
                  <p className="text-gray-600">{new Date(generatedForm.expiresAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Submissions:</span>
                  <p className="text-gray-600">{generatedForm.maxSubmissions}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-green-600 font-medium">Active</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Generate Another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateFormModal; 