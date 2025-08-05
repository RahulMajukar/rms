import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { inspectionFormAPI } from './services/api';
import QASign from '../assets/QASign.png';
import OperatorSign from '../assets/OperatorSign.png';
import EmailModal from './EmailModal';

const EditableInspectionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // State for email modal
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // Define permissions based on user role and form status
    const [permissions, setPermissions] = useState({
        canEditDocumentInfo: false,
        canEditInspectionDetails: false,
        canEditLacquers: false,
        canEditCharacteristics: false,
        canSubmit: false,
        canApprove: false,
        canReject: false,
        canSaveDraft: false,
        canDownloadPdf: false
    });

    // State for form data
    const [formData, setFormData] = useState({
        documentNo: '',
        issuanceNo: '00',
        issueDate: new Date().toISOString().split('T')[0],
        reviewedDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
        page: '1 of 1',
        preparedBy: 'QQM QC',
        approvedBy: 'AVP-QA & SYS',
        issued: 'AVP-QA & SYS',
        inspectionDate: new Date().toISOString().split('T')[0],
        product: '100 mL Bag Pke.',
        sizeNo: '',
        shift: 'C',
        variant: 'Pink matt',
        lineNo: '02',
        customer: '',
        sampleSize: '08 Nos.',
        lacquers: [
            { id: 1, name: 'Clear Extn', weight: '', batchNo: '', expiryDate: '' },
            { id: 2, name: 'Red Dye', weight: '', batchNo: '', expiryDate: '' },
            { id: 3, name: 'Black Dye', weight: '', batchNo: '', expiryDate: '' },
            { id: 4, name: 'Pink Dye', weight: '', batchNo: '', expiryDate: '' },
            { id: 5, name: 'Violet Dye', weight: '', batchNo: '', expiryDate: '' },
            { id: 6, name: 'Matt Bath', weight: '', batchNo: '', expiryDate: '' },
            { id: 7, name: 'Hardener', weight: '', batchNo: '', expiryDate: '' },
            { id: 8, name: '', weight: '', batchNo: '', expiryDate: '' },

        ],
        characteristics: [
            { id: 1, name: 'Colour Shade', observation: '', comments: '' },
            { id: 2, name: '(Colour Height)', observation: '', comments: '' },
            { id: 3, name: 'Any Visual defect', observation: '', comments: '' },
            { id: 4, name: 'MEK Test', observation: '', comments: '' },
            { id: 5, name: 'Cross Cut Test (Tape Test)', observation: '', comments: '' },
            { id: 6, name: 'Coating Thickness', bodyThickness: '', bottomThickness: '', comments: '' },
            { id: 7, name: 'Temperature', observation: '', comments: '' },
            { id: 8, name: 'Viscosity', observation: '', comments: '' },
            { id: 9, name: 'Batch Composition', observation: '', comments: '' }
        ],
        qaExecutive: '',
        qaSignature: null,
        productionOperator: '',
        operatorSignature: null,
        finalApprovalTime: '',
        status: 'DRAFT',
        submittedBy: '',
        submittedAt: null,
        reviewedBy: '',
        reviewedAt: null,
        comments: ''
    });

    // Fetch form data if editing an existing form 
    useEffect(() => {
        if (id) {
            const fetchForm = async () => {
                try {
                    setLoading(true);
                    const data = await inspectionFormAPI.getFormById(id);
                    setFormData(data);
                } catch (error) {
                    console.error('Error fetching form:', error);
                    setError('Failed to load inspection form. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            fetchForm();
        }
    }, [id]);

    // Update permissions based on user role and form status
    useEffect(() => {
        if (user && formData) {
            const isOperator = user.role === 'operator';
            const isQA = user.role === 'qa';
            const isAVP = user.role === 'avp';
            const isMaster = user.role === 'master';

            const isDraft = formData.status === 'DRAFT';
            const isSubmitted = formData.status === 'SUBMITTED';
            const isApproved = formData.status === 'APPROVED';
            const isRejected = formData.status === 'REJECTED';

            setPermissions({
                // Admin can edit anything
                canEditDocumentInfo: (isOperator && isDraft),

                // Operators can edit details in draft state
                canEditInspectionDetails: (isOperator && isDraft),

                // Operators can edit lacquers in draft state
                canEditLacquers: (isOperator && isDraft),

                // QA can edit characteristics when submitted
                canEditCharacteristics: (isQA && isSubmitted) || (isOperator && isDraft),

                // Operators can submit drafts
                canSubmit: (isOperator && isDraft),

                // QA can submit the form after reviewing
                canQASubmit: (isQA && isSubmitted),

                // QA can reject
                canQAReject: (isQA && isSubmitted),

                // AVP can approve submitted forms
                canApprove: (isAVP && isSubmitted),

                // AVP can reject submitted forms
                canReject: (isAVP && isSubmitted),

                // Operator can save as draft
                canSaveDraft: (isOperator && isDraft),

                // Master can download PDF anytime, others only when approved
                canDownloadPdf: isApproved
            });
        }
    }, [user, formData]);



    // Variant options
    const variantOptions = ['Pink matt', 'Blue matt', 'Green matt', 'Yellow matt'];

    // Shift options
    const shiftOptions = ['A', 'B', 'C'];

    // Line number options
    const lineOptions = ['01', '02', '03', '04', '05'];

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // NEW: Function to handle email sending
    const handleSendEmail = async (emailData) => {
        if (!id) return;

        try {
            setSendingEmail(true);
            console.log("Starting to send email for form ID:", id);
            console.log("Email data:", emailData);

            // Call the API to send email with attached PDF
            const result = await inspectionFormAPI.sendEmailWithPdf(id, emailData);
            console.log("Email API response:", result);

            // Show success message and close modal
            alert('Email sent successfully!');
            setIsEmailModalOpen(false);
        } catch (error) {
            console.error('Error sending email:', error);
            alert(`Failed to send email: ${error.message || 'Please try again'}`);
        } finally {
            setSendingEmail(false);
        }
    };

    // Handle lacquer changes
    const handleLacquerChange = (index, field, value) => {
        const updatedLacquers = [...formData.lacquers];
        updatedLacquers[index] = {
            ...updatedLacquers[index],
            [field]: value
        };

        // Update batch composition if necessary
        const batchCompositionIndex = formData.characteristics.findIndex(c => c.name === 'Batch Composition');
        if (batchCompositionIndex !== -1) {
            const composition = generateBatchComposition(updatedLacquers);
            const updatedCharacteristics = [...formData.characteristics];
            updatedCharacteristics[batchCompositionIndex] = {
                ...updatedCharacteristics[batchCompositionIndex],
                observation: composition
            };

            setFormData({
                ...formData,
                lacquers: updatedLacquers,
                characteristics: updatedCharacteristics
            });
        } else {
            setFormData({
                ...formData,
                lacquers: updatedLacquers
            });
        }
    };

    // Generate batch composition text
    const generateBatchComposition = (lacquers) => {
        return lacquers
            .filter(l => l.name && l.weight)
            .map(l => `${l.name} ${l.weight}`)
            .join(' ');
    };

    // Handle characteristic changes
    const handleCharChange = (index, field, value) => {
        const updatedChars = [...formData.characteristics];
        updatedChars[index] = {
            ...updatedChars[index],
            [field]: value
        };

        setFormData({
            ...formData,
            characteristics: updatedChars
        });
    };

    // Save the form (create or update)
    const saveForm = async (status = formData.status) => {
        try {
            setSaving(true);

            // Add operator info if missing
            let updatedFormData = {
                ...formData,
                status: status
            };

            // Add submission information if submitting (user name and timestamp)
            if (status === 'SUBMITTED' && user.role === 'operator') {
                updatedFormData = {
                    ...updatedFormData,
                    submittedBy: user.name,
                    submittedAt: new Date().toISOString(),
                };
            }

            // Add operator signature if user is operator
            if (user.role === 'operator' && !updatedFormData.productionOperator) {
                updatedFormData = {
                    ...updatedFormData,
                    productionOperator: user.name,
                    operatorSignature: `signed_by_${user.name.toLowerCase().replace(/\\s/g, '_')}`
                };
            }

            let result;
            if (id) {
                // Update existing form
                result = await inspectionFormAPI.updateForm(id, updatedFormData);
            } else {
                // Create new form
                result = await inspectionFormAPI.createForm(updatedFormData);
            }

            alert(`Form ${id ? 'updated' : 'created'} successfully!`);

            // Navigate back to form list or to the newly created form
            if (!id) {
                navigate(`/inspection-form/${result.id}`);
            }

            return result;
        } catch (error) {
            console.error('Error saving form:', error);
            alert(`Failed to ${id ? 'update' : 'create'} form. Please try again.`);
            throw error;
        } finally {
            setSaving(false);
        }
    };

    // Save as draft
    const saveDraft = async () => {
        try {
            await saveForm('DRAFT');
            alert('Form saved as draft!');
            navigate('/forms');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save form as draft. Please try again.');
        }
    };

    // Submit the form for approval (by operator)
    const submitForm = async () => {
        try {
            const saved = await saveForm('SUBMITTED');
            alert('Form submitted for approval!');
            navigate('/forms');
            return saved;
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form for approval. Please try again.');
        }
    };

    // QA submits the form after review
    // QA submits the form after review
    const qaSubmitForm = async () => {
        try {
            setSaving(true);

            // Create an updated form data object with QA information
            const updatedFormData = {
                ...formData,
                qaExecutive: user.name,
                qaSignature: `signed_by_${user.name.toLowerCase().replace(/\s/g, '_')}`,
                reviewedBy: user.name,
                reviewedAt: new Date().toISOString(),
                status: 'SUBMITTED'
            };

            // Update the form
            const result = await inspectionFormAPI.updateForm(id, updatedFormData);

            alert('Form submitted to AVP for approval!');
            navigate('/forms');

            return result;
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form to AVP. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // QA rejects the form
    const qaRejectForm = async () => {
        if (!id) return;

        try {
            setSaving(true);

            const comments = window.prompt('Please provide rejection reason:');
            if (!comments) {
                alert('Rejection reason is required.');
                return;
            }

            const updatedFormData = {
                ...formData,
                reviewedBy: user.name,
                reviewedAt: new Date().toISOString(),
                status: 'REJECTED',
                comments: comments
            };

            // Update the form
            const result = await inspectionFormAPI.updateForm(id, updatedFormData);

            alert('Form rejected successfully!');
            navigate('/forms');

            return result;
        } catch (error) {
            console.error('Error rejecting form:', error);
            alert('Failed to reject form. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Approve the form (by AVP)
    // Approve the form (by AVP)
    const approveForm = async () => {
        if (!id) return;

        try {
            setSaving(true);

            // Create an updated form data object with QA info
            let updatedFormData = {
                ...formData,
                qaExecutive: user.name,
                qaSignature: `signed_by_${user.name.toLowerCase().replace(/\s/g, '_')}`,
                finalApprovalTime: new Date().toLocaleTimeString(),
                status: 'APPROVED'  // Ensuring status is set to APPROVED
            };

            // Update the local state immediately for UI display
            setFormData(updatedFormData);

            const comments = window.prompt('Add any approval comments (optional):');
            if (comments) {
                updatedFormData.comments = comments;
            }

            // Update the form with the signature information and approval
            const result = await inspectionFormAPI.updateForm(id, updatedFormData);

            // Update local state with the returned data from the server
            setFormData(result);

            alert('Form approved successfully!');
            navigate('/forms');

            return result;
        } catch (error) {
            console.error('Error approving form:', error);
            alert('Failed to approve form. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Reject the form (by AVP)
    const rejectForm = async () => {
        if (!id) return;

        try {
            setSaving(true);

            const comments = window.prompt('Please provide rejection reason:');
            if (!comments) {
                alert('Rejection reason is required.');
                return;
            }

            const updatedFormData = {
                ...formData,
                qaExecutive: user.name,
                qaSignature: `signed_by_${user.name.toLowerCase().replace(/\\s/g, '_')}`,
                finalApprovalTime: new Date().toLocaleTimeString(),
                status: 'REJECTED',
                comments: comments
            };

            // Update the form
            const result = await inspectionFormAPI.updateForm(id, updatedFormData);

            alert('Form rejected successfully!');
            navigate('/forms');

            return result;
        } catch (error) {
            console.error('Error rejecting form:', error);
            alert('Failed to reject form. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Download PDF
    const downloadPdf = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userName = user?.name;

            await inspectionFormAPI.downloadPdf(id, userName);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        await saveForm();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-lg text-gray-600">Loading inspection form...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-lg text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white shadow-md pt-2">

                {/* Email Modal Component */}
                <EmailModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    formId={id}
                    onSuccess={() => console.log("Email sent successfully!")}
                />

                {/* Form Status Banner */}
                {formData.status !== 'DRAFT' && (
                    <div className={`px-4 py-2 text-white font-semibold ${formData.status === 'SUBMITTED' ? 'bg-background' :
                        formData.status === 'APPROVED' ? 'bg-green-600' :
                            'bg-red-600'
                        }`}>
                        Form Status: {formData.status}
                        {formData.submittedBy && ` - Submitted by ${formData.submittedBy}`}
                    </div>
                )}

                {/* Header */}
                <div className="border border-gray-800">
                    <div className="grid grid-cols-3">
                        {/* Left column - Document info */}
                        <div className="border-r border-gray-800">
                            <table className=" text-sm p-6 pt-4">
                                <tbody>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Document No. :</td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                name="documentNo"
                                                value={formData.documentNo}
                                                onChange={handleChange}
                                                disabled={true}
                                                className="w-full px-1 py-2 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Issuance No. :</td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                name="issuanceNo"
                                                value={formData.issuanceNo}
                                                onChange={handleChange}
                                                disabled={!permissions.canEditDocumentInfo}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Date of Issue :</td>
                                        <td className="p-1">
                                            <input
                                                type="date"
                                                name="issueDate"
                                                value={formData.issueDate}
                                                onChange={handleChange}
                                                disabled={!permissions.canEditDocumentInfo}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Reviewed by :</td>
                                        <td className="p-1">
                                            <input
                                                type="date"
                                                name="reviewedDate"
                                                value={formData.reviewedDate}
                                                onChange={handleChange}
                                                disabled={!permissions.canEditDocumentInfo}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Page :</td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                name="page"
                                                value={formData.page}
                                                onChange={handleChange}
                                                disabled={!permissions.canEditDocumentInfo}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Prepared By :</td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                name="preparedBy"
                                                value={formData.preparedBy}
                                                onChange={handleChange}
                                                disabled={!permissions.canEditDocumentInfo}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Approved by :</td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                name="approvedBy"
                                                value={formData.approvedBy}
                                                onChange={handleChange}
                                                disabled={!permissions.canEditDocumentInfo}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-1 font-semibold border-r border-gray-800">Issued :</td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                name="issued"
                                                value={formData.issued}
                                                onChange={handleChange}
                                                disabled={!permissions.canEditDocumentInfo}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Middle column - Title */}
                        <div className="border-r border-gray-800 p-2 flex-1 content-center align-super">
                            <div className="text-center">
                                <h1 className="text-xl font-bold">AGI Greenpac Limited</h1>
                                <p className="text-sm mt-1">Unit :- AGI Speciality Glas Division</p>
                                <div className="mt-8">
                                    <p className="text-sm">
                                        <span className="font-bold">SCOPE : </span>
                                        <span className="uppercase">AGI / DEC / COATING</span>
                                    </p>
                                    <p className="text-sm mt-4">
                                        <span className="font-bold">TITLE : </span>
                                        <span className="uppercase">First Article Inspection Report - COATING</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className=" flex justify-center m-9">
                            <img
                                src="https://camo.githubusercontent.com/23528efa2ac40a4438536df8a46ff30e8d90f42a342b6bf6dbb6decb55ab8e86/68747470733a2f2f656e637279707465642d74626e302e677374617469632e636f6d2f696d616765733f713d74626e3a414e64394763517336636a7049706377394a4c4d4b6b796d3366506a746d563163506b533535784e66512673"
                                alt="AGI Logo"
                                className="w-18 h-auto"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-x border-b border-gray-800">
                    <div className="grid grid-cols-3 text-sm">
                        <div className="border-r border-gray-800">
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Date: </span>
                                {formData.status === 'APPROVED' ? (
                                    <span>{formData.inspectionDate}</span>
                                ) : (
                                    <input
                                        type="date"
                                        name="inspectionDate"
                                        value={formData.inspectionDate}
                                        onChange={handleChange}
                                        disabled={!permissions.canEditInspectionDetails}
                                        className="px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                )}
                            </div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Product: </span>
                                {formData.status === 'APPROVED' ? (
                                    <span>{formData.product}</span>
                                ) : (
                                    <input
                                        type="text"
                                        name="product"
                                        value={formData.product}
                                        onChange={handleChange}
                                        disabled={!permissions.canEditInspectionDetails}
                                        className="px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                )}
                            </div>
                            <div className="p-2">
                                <span className="font-semibold">Size No.: </span>
                                {formData.status === 'APPROVED' ? (
                                    <span>{formData.sizeNo}</span>
                                ) : (
                                    <input
                                        type="text"
                                        name="sizeNo"
                                        value={formData.sizeNo}
                                        onChange={handleChange}
                                        disabled={!permissions.canEditInspectionDetails}
                                        className="px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="border-r border-gray-800">
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Shift: </span>
                                {formData.status === 'APPROVED' || !permissions.canEditInspectionDetails ? (
                                    <span>{formData.shift}</span>
                                ) : (
                                    <select
                                        name="shift"
                                        value={formData.shift}
                                        onChange={handleChange}
                                        className="px-2 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200"
                                    >
                                        {shiftOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Variant: </span>
                                {formData.status === 'APPROVED' || !permissions.canEditInspectionDetails ? (
                                    <span>{formData.variant}</span>
                                ) : (
                                    <select
                                        name="variant"
                                        value={formData.variant}
                                        onChange={handleChange}
                                        className="px-2 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200"
                                    >
                                        {variantOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="p-2"></div>
                        </div>
                        <div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Line No.: </span>
                                {formData.status === 'APPROVED' || !permissions.canEditInspectionDetails ? (
                                    <span>{formData.lineNo}</span>
                                ) : (
                                    <select
                                        name="lineNo"
                                        value={formData.lineNo}
                                        onChange={handleChange}
                                        className="px-2 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200"
                                    >
                                        {lineOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Customer: </span>
                                {formData.status === 'APPROVED' || !permissions.canEditInspectionDetails ? (
                                    <span>{formData.customer}</span>
                                ) : (
                                    <input
                                        type="text"
                                        name="customer"
                                        value={formData.customer}
                                        onChange={handleChange}
                                        className="px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200"
                                    />
                                )}
                            </div>
                            <div className="p-2">
                                <span className="font-semibold">Sample Size: </span>
                                {formData.status === 'APPROVED' || !permissions.canEditInspectionDetails ? (
                                    <span>{formData.sampleSize}</span>
                                ) : (
                                    <input
                                        type="text"
                                        name="sampleSize"
                                        value={formData.sampleSize}
                                        onChange={handleChange}
                                        className="px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lacquer Table */}
                <div className="relative">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-gray-800 p-2 w-12 bg-gray-200">S.No.</th>
                                <th className="border border-gray-800 p-2 bg-gray-200">Lacquer / Dye</th>
                                <th className="border border-gray-800 p-2 bg-gray-200">wt.</th>
                                <th className="border border-gray-800 p-2 bg-gray-200">Batch No.</th>
                                <th className="border border-gray-800 p-2 bg-gray-200">Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.lacquers.map((lacquer, index) => {
                                // Define unit based on the selected lacquer/dye
                                let unit = "GM";
                                if (lacquer.name === "Clear Extn") {
                                    unit = "KG";
                                }

                                return (
                                    <tr key={lacquer.id}>
                                        <td className="border border-gray-800 p-2 text-center">{lacquer.id}</td>
                                        <td className="border border-gray-800 p-2">
                                            {formData.status === 'APPROVED' || !permissions.canEditLacquers ? (
                                                <div className="px-1 py-1">{lacquer.name}</div>
                                            ) : (
                                                <select
                                                    value={lacquer.name}
                                                    onChange={(e) => handleLacquerChange(index, 'name', e.target.value)}
                                                    className="w-full px-1 py-1 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200"
                                                >
                                                    <option value="">Select Lacquer/Dye</option>
                                                    <option value="Clear Extn">Clear Extn</option>
                                                    <option value="Red Dye">Red Dye</option>
                                                    <option value="Black Dye">Black Dye</option>
                                                    <option value="Pink Dye">Pink Dye</option>
                                                    <option value="Violet Dye">Violet Dye</option>
                                                    <option value="Matt Bath">Matt Bath</option>
                                                    <option value="Hardener">Hardener</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="border border-gray-800 p-2 text-center">
                                            <div className="flex items-center">
                                                {formData.status === 'APPROVED' ? (
                                                    <div>
                                                        {lacquer.weight} {lacquer.name && unit}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={lacquer.weight}
                                                            onChange={(e) => handleLacquerChange(index, 'weight', e.target.value)}
                                                            disabled={!permissions.canEditLacquers}
                                                            className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                                        />
                                                        {lacquer.name && (
                                                            <span className="ml-1 text-gray-500 text-xs whitespace-nowrap">{unit}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="border border-gray-800 p-2 text-center">
                                            {formData.status === 'APPROVED' ? (
                                                <div>{lacquer.batchNo}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={lacquer.batchNo}
                                                    onChange={(e) => handleLacquerChange(index, 'batchNo', e.target.value)}
                                                    disabled={!permissions.canEditLacquers}
                                                    className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                                />
                                            )}
                                        </td>
                                        <td className="border border-gray-800 p-2 text-center">
                                            {formData.status === 'APPROVED' ? (
                                                <div>{lacquer.expiryDate}</div>
                                            ) : (
                                                <input
                                                    type="date"
                                                    value={lacquer.expiryDate}
                                                    onChange={(e) => handleLacquerChange(index, 'expiryDate', e.target.value)}
                                                    disabled={!permissions.canEditLacquers}
                                                    className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* For the Add Row button in the Lacquer table */}
                    {formData.status !== 'APPROVED' && permissions.canEditLacquers && (
                        <button
                            type="button"
                            onClick={() => {
                                const newId = formData.lacquers.length > 0
                                    ? Math.max(...formData.lacquers.map(l => l.id)) + 1
                                    : 1;

                                const updatedLacquers = [
                                    ...formData.lacquers,
                                    { id: newId, name: '', weight: '', batchNo: '', expiryDate: '' }
                                ];

                                setFormData({
                                    ...formData,
                                    lacquers: updatedLacquers
                                });
                            }}
                            className="mt-2 flex items-center bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Row
                        </button>
                    )}
                </div>

                {/* Characteristics Table */}
                <div className="mt-px">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-gray-800 p-2 w-12 bg-gray-200">S.No.</th>
                                <th className="border border-gray-800 p-2 bg-gray-200">Characteristic</th>
                                <th className="border border-gray-800 p-2 bg-gray-200">
                                    <div>As per Reference sample no. X-211</div>
                                    <div>Observations</div>
                                </th>
                                <th className="border border-gray-800 p-2 bg-gray-200">Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.characteristics.map((char, index) => (
                                <tr key={char.id}>
                                    <td className="border border-gray-800 p-2 text-center">{char.id}</td>
                                    <td className="border border-gray-800 p-2">
                                        <input
                                            type="text"
                                            value={char.name}
                                            onChange={(e) => handleCharChange(index, 'name', e.target.value)}
                                            disabled={!permissions.canEditCharacteristics}
                                            className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </td>
                                    <td className="border border-gray-800">
                                        {char.id === 6 ? (
                                            <table className="w-full border-collapse">
                                                <tbody>
                                                    <tr>
                                                        <td className="border-b border-r border-gray-800 p-2 w-30 text-center font-semibold h-12">Body</td>
                                                        <td className="border-b border-gray-800 p-2 text-center h-12">
                                                            <input
                                                                type="text"
                                                                value={char.bodyThickness}
                                                                onChange={(e) => handleCharChange(index, 'bodyThickness', e.target.value)}
                                                                disabled={!permissions.canEditCharacteristics}
                                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border-r border-gray-800 text-center font-semibold h-12">Bottom</td>
                                                        <td className="p-2 text-center h-12">
                                                            <input
                                                                type="text"
                                                                value={char.bottomThickness}
                                                                onChange={(e) => handleCharChange(index, 'bottomThickness', e.target.value)}
                                                                disabled={!permissions.canEditCharacteristics}
                                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        ) : (
                                            <input
                                                type="text"
                                                value={char.observation}
                                                onChange={(e) => handleCharChange(index, 'observation', e.target.value)}
                                                disabled={!permissions.canEditCharacteristics}
                                                className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        )}
                                    </td>
                                    <td className="border border-gray-800 p-2">
                                        <input
                                            type="text"
                                            value={char.comments}
                                            onChange={(e) => handleCharChange(index, 'comments', e.target.value)}
                                            disabled={!permissions.canEditCharacteristics}
                                            className="w-full px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="border-x border-b border-gray-800">
                    <div className="flex justify-between items-center p-4">
                        {/* QA Signature Display */}
                        <div className="flex items-center">
                            <div className="font-semibold mr-2">QA Exe.</div>
                            <div className="w-16">
                                {formData.qaSignature ? (
                                    <div className="h-12 flex items-center">
                                        {/* Attempt to load the image */}
                                        <img
                                            src={QASign}
                                            alt="QA Signature"
                                            onError={(e) => {
                                                console.error('Failed to load QA signature image');
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        {/* Fallback if image fails to load */}
                                        <div
                                            className="h-12 border border-dashed border-gray-400 hidden items-center justify-center w-full"
                                            title={`Signed by: ${formData.qaExecutive}`}
                                        >
                                            <span className="text-xs text-gray-500">Signed digitally</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-12 border border-dashed border-gray-400 flex items-center justify-center">
                                        <span className="text-xs text-gray-500">No signature</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Operator Signature Display */}
                        <div className="flex items-center">
                            <div className="font-semibold mr-2">Production Sup. / Operator:</div>
                            <div className="w-16">
                                {formData.operatorSignature ? (
                                    <div className="h-12 flex items-center">
                                        {/* Attempt to load the image */}
                                        <img
                                            src={OperatorSign}
                                            alt="Operator Signature"
                                            onError={(e) => {
                                                console.error('Failed to load Operator signature image');
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        {/* Fallback if image fails to load */}
                                        <div
                                            className="h-12 border border-dashed border-gray-400 hidden items-center justify-center w-full"
                                            title={`Signed by: ${formData.productionOperator}`}
                                        >
                                            <span className="text-xs text-gray-500">Signed digitally</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-12 border border-dashed border-gray-400 flex items-center justify-center">
                                        <span className="text-xs text-gray-500">No signature</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 border-t border-gray-800 p-4">
                        <span className="font-semibold">Time (Final Approval) : </span>
                        <input
                            type="text"
                            name="finalApprovalTime"
                            value={formData.finalApprovalTime}
                            onChange={handleChange}
                            disabled={!(permissions.canApprove || permissions.canEditDocumentInfo)}
                            className="px-1 py-0 border-gray-300 focus:border-blue-800 focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>
                </div>

                {/* Review Information */}
                {
                    (formData.status === 'SUBMITTED' || formData.status === 'APPROVED' || formData.status === 'REJECTED') && (
                        <div className="border-x border-b border-gray-800 p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-700 mb-2">Review Information</h3>

                            {formData.submittedBy && (
                                <div className="text-sm mb-1">
                                    <span className="font-medium">Submitted by:</span> {formData.submittedBy}
                                    {formData.submittedAt && (
                                        <span className="ml-1 text-gray-500">
                                            on {new Date(formData.submittedAt).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            )}

                            {formData.reviewedBy && (
                                <div className="text-sm mb-1">
                                    <span className="font-medium">Reviewed by:</span> {formData.reviewedBy}
                                    {formData.reviewedAt && (
                                        <span className="ml-1 text-gray-500">
                                            on {new Date(formData.reviewedAt).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            )}

                            {formData.comments && (
                                <div className="mt-2">
                                    <span className="font-medium text-sm">Comments:</span>
                                    <div className="p-2 bg-white border border-gray-300 rounded mt-1 text-sm">
                                        {formData.comments}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Action Buttons */}
                <div className="p-4 bg-gray-100 flex justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/forms')}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Back to Forms
                    </button>

                    <div className="space-x-2">
                        {/* Operator buttons */}
                        {permissions.canSaveDraft && (
                            <button
                                type="button"
                                onClick={saveDraft}
                                disabled={saving}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-yellow-300"
                            >
                                {saving ? 'Saving...' : 'Save as Draft'}
                            </button>
                        )}

                        {permissions.canSubmit && (
                            <button
                                type="button"
                                onClick={submitForm}
                                disabled={saving}
                                className="bg-blue-800 hover:bg-background text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-blue-300"
                            >
                                {saving ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        )}

                        {/* QA buttons */}
                        {permissions.canQAReject && (
                            <button
                                type="button"
                                onClick={qaRejectForm}
                                disabled={saving}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-red-300"
                            >
                                {saving ? 'Rejecting...' : 'Reject Form'}
                            </button>
                        )}

                        {permissions.canQASubmit && (
                            <button
                                type="button"
                                onClick={qaSubmitForm}
                                disabled={saving}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-indigo-300"
                            >
                                {saving ? 'Submitting...' : 'Submit to AVP'}
                            </button>
                        )}

                        {/* AVP buttons */}
                        {permissions.canReject && (
                            <button
                                type="button"
                                onClick={rejectForm}
                                disabled={saving}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-red-300"
                            >
                                {saving ? 'Rejecting...' : 'Reject Form'}
                            </button>
                        )}

                        {permissions.canApprove && (
                            <button
                                type="button"
                                onClick={approveForm}
                                disabled={saving}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-green-300"
                            >
                                {saving ? 'Approving...' : 'Approve Form'}
                            </button>
                        )}

                        {/* Download PDF button - visible to master and when approved */}
                        {permissions.canDownloadPdf && (
                            <button
                                type="button"
                                onClick={downloadPdf}
                                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                                Download PDF
                            </button>
                        )}
                        {permissions.canDownloadPdf && (
                            <button
                                type="button"
                                onClick={() => setIsEmailModalOpen(true)}
                                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
                            >
                                Send Email
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditableInspectionForm;     