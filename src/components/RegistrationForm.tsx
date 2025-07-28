import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { registrationAPI } from '../services/api';

interface FormData {
  formId: string;
  title: string;
  description: string;
  currentSubmissions: number;
  maxSubmissions: number;
}

interface MemberData {
  name: string;
  email: string;
  phone: string;
  department: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
}

const RegistrationForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [memberData, setMemberData] = useState<MemberData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const departments = [
    'Worship',
    'Youth',
    'Media',
    'Ushering',
    'Prayer',
    'Outreach',
    'IT & Video',
    'Administration'
  ];

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId) return;
      
      try {
        const response = await registrationAPI.getFormDetails(formId);
        setFormData(response.data);
      } catch (error: any) {
        setError(error.message || 'Failed to load registration form');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setMemberData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof MemberData],
          [child]: value
        }
      }));
    } else {
      setMemberData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await registrationAPI.submitForm(formId!, memberData);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for registering with MMU RHSF Fellowship. We're excited to have you join our community!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will receive a confirmation email shortly with more information about upcoming events and activities.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">{formData?.title}</h1>
            <p className="text-blue-100">{formData?.description}</p>
            <div className="mt-4 text-sm text-blue-200">
              {formData?.currentSubmissions} of {formData?.maxSubmissions} spots filled
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={memberData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={memberData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={memberData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={memberData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Address Information
              </h2>
              
              <div>
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={memberData.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={memberData.address.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={memberData.address.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    value={memberData.address.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Emergency Contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={memberData.emergencyContact.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    value={memberData.emergencyContact.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  id="emergencyContact.relationship"
                  name="emergencyContact.relationship"
                  value={memberData.emergencyContact.relationship}
                  onChange={handleChange}
                  placeholder="e.g., Spouse, Parent, Friend"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Additional Information
              </h2>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes or Comments
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={memberData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional information you'd like to share..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting Registration...
                  </div>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm; 