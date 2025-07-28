import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, Trash2, Eye, Calendar, Users } from 'lucide-react';
import { registrationAPI } from '../../services/api';

interface RegistrationForm {
  _id: string;
  formId: string;
  title: string;
  description: string;
  isActive: boolean;
  expiresAt: string;
  maxSubmissions: number;
  currentSubmissions: number;
  createdAt: string;
  formUrl: string;
  isExpired: boolean;
  isFull: boolean;
  canAcceptSubmissions: boolean;
}

const RegistrationForms: React.FC = () => {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await registrationAPI.getAllForms();
      setForms(response.data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, formId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(formId);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDeactivateForm = async (formId: string) => {
    try {
      await registrationAPI.deactivateForm(formId);
      fetchForms(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating form:', error);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await registrationAPI.deleteForm(formId);
      fetchForms(); // Refresh the list
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const getStatusBadge = (form: RegistrationForm) => {
    if (!form.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    }
    if (form.isExpired) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
    if (form.isFull) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Full</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Registration Forms</h3>
            <p className="text-sm text-gray-600">Manage public registration links</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {forms.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registration forms</h3>
            <p className="text-gray-600">Create your first registration form to start collecting new member applications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div key={form._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{form.title}</h4>
                      {getStatusBadge(form)}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{form.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Expires: {new Date(form.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {form.currentSubmissions}/{form.maxSubmissions} submissions
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Created: {new Date(form.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600">
                        ID: {form.formId.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(form.formUrl, form.formId)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copied === form.formId && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                    
                    <a
                      href={form.formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title="View form"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    {form.isActive && (
                      <button
                        onClick={() => handleDeactivateForm(form.formId)}
                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors duration-200"
                        title="Deactivate form"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteForm(form.formId)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForms; 