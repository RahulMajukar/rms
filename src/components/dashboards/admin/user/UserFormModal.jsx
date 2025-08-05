// UserFormModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaSignature,
  FaUserCircle,
  FaUpload,
  FaCheck,
  FaCamera
} from 'react-icons/fa';

// Updated roles array to match new backend enum
const roles = [
  'SHIFT_ENGINEER',
  'QUALITY_MANAGER',
  'QUALITY_HOD',
  'MASTER',
  // 'MANAGER',
  // 'ADMIN',
  // 'USER'
];

const namePrefixes = ['Mr.', 'Mrs.', 'Miss', 'Ms.', 'Dr.', 'Prof.'];

const UserFormModal = ({ onClose, onSubmit, defaultValues = null, isEdit = false }) => {
  // Safely handle defaultValues
  const safeDefaultValues = defaultValues || {};

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = useForm({
    defaultValues: {
      namePrefix: safeDefaultValues.namePrefix || '',
      firstName: safeDefaultValues.firstName || '',
      lastName: safeDefaultValues.lastName || '',
      userName: safeDefaultValues.username || safeDefaultValues.userName || '', // Note: backend uses 'username'
      email: safeDefaultValues.email || '',
      phone: safeDefaultValues.phone || '',
      role: safeDefaultValues.role || '',
      status: safeDefaultValues.active !== undefined ? safeDefaultValues.active : (safeDefaultValues.status !== undefined ? safeDefaultValues.status : true), // backend uses 'active'
      dateOfBirth: safeDefaultValues.dateOfBirth ?
        new Date(safeDefaultValues.dateOfBirth).toISOString().split('T')[0] : '',
      gender: safeDefaultValues.gender ? safeDefaultValues.gender.toLowerCase() : '', // ensure lowercase for form
      password: '',
      signature: safeDefaultValues.signature || '',
      profilePhoto: safeDefaultValues.profilePhoto || ''
    }
  });

  const [signaturePreview, setSignaturePreview] = useState(
    safeDefaultValues.signaturePath
      ? `http://localhost:8080/api/users/${safeDefaultValues.id}/signature`
      : safeDefaultValues.signature || null
  );

  const [profilePhotoPreview, setProfilePhotoPreview] = useState(
    safeDefaultValues.profilePhotoPath
      ? `http://localhost:8080/api/users/${safeDefaultValues.id}/profile-photo`
      : safeDefaultValues.profilePhoto || null
  );

  const [dragOverSignature, setDragOverSignature] = useState(false);
  const [dragOverPhoto, setDragOverPhoto] = useState(false);
  const [phoneValue, setPhoneValue] = useState(safeDefaultValues.phone || '');
  const [age, setAge] = useState('');

  // Watch dateOfBirth to calculate age
  const watchedDateOfBirth = watch('dateOfBirth');

  // Calculate age when date of birth changes
  useEffect(() => {
    if (watchedDateOfBirth) {
      const today = new Date();
      const birthDate = new Date(watchedDateOfBirth);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setAge(calculatedAge > 0 ? calculatedAge : '');
    } else {
      setAge('');
    }
  }, [watchedDateOfBirth]);

  // Set initial phone value when component mounts or defaultValues change
  useEffect(() => {
    if (safeDefaultValues.phone) {
      setPhoneValue(safeDefaultValues.phone);
      setValue('phone', safeDefaultValues.phone);
    }
  }, [safeDefaultValues.phone, setValue]);

  // Update form values when signature or profile photo changes
  useEffect(() => {
    setValue('signature', signaturePreview || '');
  }, [signaturePreview, setValue]);

  useEffect(() => {
    setValue('profilePhoto', profilePhotoPreview || '');
  }, [profilePhotoPreview, setValue]);

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setSignaturePreview(result);
        setValue('signature', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setProfilePhotoPreview(result);
        setValue('profilePhoto', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    if (type === 'signature') {
      setDragOverSignature(true);
    } else {
      setDragOverPhoto(true);
    }
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    if (type === 'signature') {
      setDragOverSignature(false);
    } else {
      setDragOverPhoto(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    if (type === 'signature') {
      setDragOverSignature(false);
    } else {
      setDragOverPhoto(false);
    }

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        if (type === 'signature') {
          setSignaturePreview(result);
          setValue('signature', result, { shouldValidate: true });
        } else {
          setProfilePhotoPreview(result);
          setValue('profilePhoto', result, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    reset();
    setSignaturePreview(null);
    setProfilePhotoPreview(null);
    setPhoneValue('');
    setAge('');
    onClose();
  };

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SHIFT_ENGINEER':
        return 'Shift Engineer';
      case 'QUALITY_MANAGER':
        return 'Quality Manager';
      case 'QUALITY_HOD':
        return 'Quality HOD';
      case 'MASTER':
        return 'Master';
      // case 'MANAGER':
      //   return 'Manager';
      // case 'ADMIN':
      //   return 'Admin';
      // case 'USER':
      //   return 'User';
      // Keep old role names for backward compatibility
      // case 'SHIFT_INCHARGE':
      //   return 'Shift Engineer';
      // case 'QUALITY_ENGINEER':
      //   return 'Quality Manager';
      default:
        return role;
    }
  };

  const onFormSubmit = (data) => {
    console.log('Form data before submission:', data);
    console.log('Phone value:', phoneValue);
    console.log('Signature preview:', signaturePreview);
    console.log('Profile photo preview:', profilePhotoPreview);

    // Get current form values to ensure we have the latest data
    const currentFormData = getValues();
    console.log('Current form data:', currentFormData);

    // Prepare the data object matching the backend DTO structure
    const formattedData = {
      namePrefix: currentFormData.namePrefix || data.namePrefix || null,
      firstName: currentFormData.firstName || data.firstName || null,
      lastName: currentFormData.lastName || data.lastName || null,
      userName: currentFormData.userName || data.userName || null,
      email: currentFormData.email || data.email || null,
      phone: phoneValue || currentFormData.phone || data.phone || null,
      dateOfBirth: currentFormData.dateOfBirth || data.dateOfBirth || null,
      gender: currentFormData.gender ? currentFormData.gender.toUpperCase() : 
              (data.gender ? data.gender.toUpperCase() : null),
      role: currentFormData.role || data.role || null,
      status: currentFormData.status === true || currentFormData.status === 'true' || 
              data.status === true || data.status === 'true',
      signature: signaturePreview || currentFormData.signature || data.signature || null,
      profilePhoto: profilePhotoPreview || currentFormData.profilePhoto || data.profilePhoto || null,
    };

    // Only include password for new users
    if (!isEdit && (currentFormData.password || data.password)) {
      formattedData.password = currentFormData.password || data.password;
    }

    console.log('Formatted data for API:', formattedData);

    // Send the formatted data directly
    onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaUserCircle className="mr-3 text-blue-900" />
              {isEdit ? 'Edit User' : 'Create User'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Personal Information and Account Information in Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-900" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Prefix</label>
                    <select
                      {...register("namePrefix", { required: "Name prefix is required" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                    >
                      <option value="">Select</option>
                      {namePrefixes.map(prefix => (
                        <option key={prefix} value={prefix}>{prefix}</option>
                      ))}
                    </select>
                    {errors.namePrefix && <p className="text-red-500 text-xs mt-1 text-left">{errors.namePrefix.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">First Name</label>
                    <input
                      {...register("firstName", { required: "First Name is required" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1 text-left">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Last Name</label>
                    <input
                      {...register("lastName", { required: "Last Name is required" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1 text-left">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">User Name</label>
                  <input
                    {...register("userName", { required: "User Name is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                    placeholder="Enter user name"
                  />
                  {errors.userName && <p className="text-red-500 text-xs mt-1 text-left">{errors.userName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left flex items-center">
                      <FaBirthdayCake className="mr-1 text-pink-500" />
                      Date of Birth
                    </label>
                    <input
                      {...register("dateOfBirth", { required: "Date of birth is required" })}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 text-left">{errors.dateOfBirth.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Age</label>
                    <input
                      type="text"
                      value={age ? `${age} years` : ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      placeholder="Age will be calculated"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left flex items-center">
                    <FaPhone className="mr-1 text-green-500" />
                    Phone Number
                  </label>
                  <PhoneInput
                    country={'in'}
                    value={phoneValue}
                    onChange={(phone) => {
                      setPhoneValue(phone);
                      setValue('phone', phone, { shouldValidate: true, shouldDirty: true });
                    }}
                    inputClass="!w-full !px-3 !py-2 !border !border-gray-300 !rounded-lg !focus:ring-2 !focus:ring-blue-800 !focus:border-transparent !transition-all"
                    containerClass="!w-full"
                    buttonClass="!border !border-gray-300 !rounded-l-lg"
                  />
                  
                  {/* Hidden input for form registration */}
                  <input
                    {...register("phone")}
                    type="hidden"
                    value={phoneValue}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 text-left">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-blue-600" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Email Address</label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address"
                      }
                    })}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 text-left">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Gender</label>
                  <select
                    {...register("gender", { required: "Gender is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1 text-left">{errors.gender.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Role</label>
                  <select
                    {...register("role", { required: "Role is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                    ))}
                  </select>
                  {errors.role && <p className="text-red-500 text-xs mt-1 text-left">{errors.role.message}</p>}
                </div>

                {!isEdit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Password</label>
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters"
                        }
                      })}
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                      placeholder="Enter password"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1 text-left">{errors.password.message}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Status</label>
                  <select
                    {...register("status")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Photo and Digital Signature Section - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Photo Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaCamera className="mr-2 text-blue-900" />
                Profile Photo
              </h3>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOverPhoto ? 'border-blue-800 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDragOver={(e) => handleDragOver(e, 'photo')}
                  onDragLeave={(e) => handleDragLeave(e, 'photo')}
                  onDrop={(e) => handleDrop(e, 'photo')}
                >
                  {profilePhotoPreview ? (
                    <div className="space-y-3">
                      <img
                        src={profilePhotoPreview}
                        alt="Profile preview"
                        className="mx-auto w-24 h-24 object-cover rounded-full border-2 border-gray-300"
                        onError={(e) => {
                          console.error('Error loading profile photo:', e);
                          setProfilePhotoPreview(null);
                        }}
                      />
                      <p className="text-sm text-gray-600">Profile photo uploaded successfully</p>
                      <button
                        type="button"
                        onClick={() => {
                          setProfilePhotoPreview(null);
                          setValue('profilePhoto', '', { shouldValidate: true });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <FaCamera className="mx-auto text-3xl text-gray-400" />
                      <div>
                        <p className="text-gray-600">Drag and drop profile photo here, or</p>
                        <label className="inline-block mt-2 px-4 py-2 bg-blue-900 text-white rounded-lg cursor-pointer hover:bg-background transition-colors">
                          Choose Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Digital Signature Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaSignature className="mr-2 text-purple-600" />
                Digital Signature
              </h3>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOverSignature ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDragOver={(e) => handleDragOver(e, 'signature')}
                  onDragLeave={(e) => handleDragLeave(e, 'signature')}
                  onDrop={(e) => handleDrop(e, 'signature')}
                >
                  {signaturePreview ? (
                    <div className="space-y-3">
                      <img
                        src={signaturePreview}
                        alt="Signature preview"
                        className="mx-auto max-h-24 border rounded"
                        onError={(e) => {
                          console.error('Error loading signature:', e);
                          setSignaturePreview(null);
                        }}
                      />
                      <p className="text-sm text-gray-600">Signature uploaded successfully</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSignaturePreview(null);
                          setValue('signature', '', { shouldValidate: true });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove signature
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <FaUpload className="mx-auto text-3xl text-gray-400" />
                      <div>
                        <p className="text-gray-600">Drag and drop signature image here, or</p>
                        <label className="inline-block mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600 transition-colors">
                          Choose Signature
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-background text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <FaCheck className="mr-2" />
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;