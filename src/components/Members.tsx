import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';
import AddMemberModal from './modals/AddMemberModal';
import { membersAPI } from '../services/api';

// 1. Define the type for a Member
interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  joinDate: string;
  status: string;
}

type NewMember = Omit<Member, '_id'>;

type EditMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSubmit: (memberData: Partial<Member>) => void;
};

const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, onClose, member, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Member>>(member || {});

  useEffect(() => {
    setFormData(member || {});
  }, [member]);

  const departments = [
    'Worship',
    'Youth',
    'Media',
    'Ushering',
    'Prayer',
    'Outreach',
    'IT & Video',
    'Administration',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) onSubmit(formData);
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Member</h2>
            <p className="text-sm text-gray-600 mt-1">Update member information.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <Edit className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <select id="department" name="department" value={formData.department || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
            <input type="date" id="joinDate" name="joinDate" value={formData.joinDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">Update Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await membersAPI.getAll({ limit: 100 });
        setMembers(res.members || []);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleAddMember = async (memberData: NewMember) => {
    try {
      await membersAPI.create(memberData);
      const res = await membersAPI.getAll({ limit: 100 });
      setMembers(res.members || []);
    } catch (e) {
      // handle error
    }
  };

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleEditMember = async (memberData: Partial<Member>) => {
    if (!selectedMember) return;
    try {
      await membersAPI.update(selectedMember._id, memberData);
      const res = await membersAPI.getAll({ limit: 100 });
      setMembers(res.members || []);
      setIsEditModalOpen(false);
      setSelectedMember(null);
    } catch (e) {
      // handle error
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await membersAPI.delete(memberId);
      setMembers(members => members.filter(m => m._id !== memberId));
    } catch (err) {
      alert('Failed to delete member.');
    }
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
            <p className="text-gray-600 mt-1">Manage fellowship members and their information</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Members Directory</h3>
                <p className="text-sm text-gray-600">View and manage all fellowship members</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.joinDate ? member.joinDate.split('T')[0] : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => handleEditClick(member)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteMember(member._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedMember(null); }}
        member={selectedMember}
        onSubmit={handleEditMember}
      />
    </>
  );
};

export default Members;
