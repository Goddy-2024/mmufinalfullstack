import express from 'express';
import RegistrationForm from '../models/RegistrationForm.js';
import Member from '../models/Member.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate a new registration form link (Admin only)
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { title, description, maxSubmissions, expiresInDays } = req.body;
    
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const form = new RegistrationForm({
      title: title || 'Fellowship Registration Form',
      description: description || 'Welcome to MMU RHSF Fellowship! Please fill out this form to join our community.',
      maxSubmissions: maxSubmissions || 100,
      expiresAt,
      createdBy: req.user.id
    });

    await form.save();

    res.status(201).json({
      success: true,
      message: 'Registration form created successfully',
      data: {
        formId: form.formId,
        formUrl: form.formUrl,
        title: form.title,
        description: form.description,
        expiresAt: form.expiresAt,
        maxSubmissions: form.maxSubmissions
      }
    });
  } catch (error) {
    console.error('Error generating registration form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate registration form',
      error: error.message
    });
  }
});

// Get all registration forms (Admin only)
router.get('/forms', authenticate, async (req, res) => {
  try {
    const forms = await RegistrationForm.find({ createdBy: req.user.id })
      .populate('submissions.member', 'name email department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: forms.map(form => ({
        ...form.toObject(),
        formUrl: form.formUrl,
        isExpired: form.isExpired,
        isFull: form.isFull,
        canAcceptSubmissions: form.canAcceptSubmissions
      }))
    });
  } catch (error) {
    console.error('Error fetching registration forms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration forms',
      error: error.message
    });
  }
});

// Get specific form details (Public - for form display)
router.get('/forms/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    
    const form = await RegistrationForm.findOne({ formId });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Registration form not found'
      });
    }

    if (!form.canAcceptSubmissions) {
      return res.status(400).json({
        success: false,
        message: form.isExpired ? 'This registration form has expired' : 
                form.isFull ? 'This registration form is full' : 
                'This registration form is not active'
      });
    }

    res.json({
      success: true,
      data: {
        formId: form.formId,
        title: form.title,
        description: form.description,
        currentSubmissions: form.currentSubmissions,
        maxSubmissions: form.maxSubmissions
      }
    });
  } catch (error) {
    console.error('Error fetching form details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form details',
      error: error.message
    });
  }
});

// Submit registration form (Public)
router.post('/forms/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const memberData = req.body;
    
    // Find the form
    const form = await RegistrationForm.findOne({ formId });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Registration form not found'
      });
    }

    if (!form.canAcceptSubmissions) {
      return res.status(400).json({
        success: false,
        message: form.isExpired ? 'This registration form has expired' : 
                form.isFull ? 'This registration form is full' : 
                'This registration form is not active'
      });
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'department'];
    for (const field of requiredFields) {
      if (!memberData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        });
      }
    }

    // Check if email already exists
    const existingMember = await Member.findOne({ email: memberData.email });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'A member with this email already exists'
      });
    }

    // Create new member
    const newMember = new Member({
      name: memberData.name,
      email: memberData.email,
      phone: memberData.phone,
      department: memberData.department,
      address: memberData.address || {},
      emergencyContact: memberData.emergencyContact || {},
      notes: memberData.notes || '',
      status: 'Active'
    });

    await newMember.save();

    // Update form submission count and add submission record
    form.currentSubmissions += 1;
    form.submissions.push({
      member: newMember._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await form.save();

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Welcome to the fellowship.',
      data: {
        memberId: newMember._id,
        name: newMember.name,
        email: newMember.email
      }
    });
  } catch (error) {
    console.error('Error submitting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit registration',
      error: error.message
    });
  }
});

// Deactivate a registration form (Admin only)
router.patch('/forms/:formId/deactivate', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    
    const form = await RegistrationForm.findOne({ 
      formId, 
      createdBy: req.user.id 
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Registration form not found'
      });
    }

    form.isActive = false;
    await form.save();

    res.json({
      success: true,
      message: 'Registration form deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate form',
      error: error.message
    });
  }
});

// Delete a registration form (Admin only)
router.delete('/forms/:formId', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    
    const form = await RegistrationForm.findOneAndDelete({ 
      formId, 
      createdBy: req.user.id 
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Registration form not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete form',
      error: error.message
    });
  }
});

export default router; 

/**2nd kings 2:11
isaiah 26:19-21
Genesis 18:25	
Revelation3:10
Daniel 9:24-27
1st Thess 4:13-18__
Joshua 23:14 =>
Daniel 2:44-45
Isaiah 9:6-7
;
 * 
 * 
 * 
 * 
 * 
 * 
 */