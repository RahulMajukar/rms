import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from './api';
import QASign from '../assets/QASign.png';
import OperatorSign from '../assets/OperatorSign.png';

const ViewInspectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await inspectionFormAPI.getFormById(id);
        setFormData(data);
      } catch (err) {
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  const printPage = () => window.print();

  const downloadPage = () => {
    const element = document.querySelector('form');
    const blob = new Blob([element.outerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection_form_${formData.documentNo || 'form'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-center bg-gray-100 p-4">
      <form className="w-full max-w-4xl bg-white shadow-md pt-2">
        {formData.status !== 'DRAFT' && (
          <div className={`px-4 py-2 text-white font-semibold ${
            formData.status === 'SUBMITTED' ? 'bg-background' : 
            formData.status === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            Form Status: {formData.status}
            {formData.submittedBy && ` - Submitted by ${formData.submittedBy}`}
          </div>
        )}

        <div className="border border-gray-800">
          <div className="grid grid-cols-3">
            <div className="border-r border-gray-800 text-sm p-2">
              <p><strong>Document No.:</strong> {formData.documentNo}</p>
              <p><strong>Issuance No.:</strong> {formData.issuanceNo}</p>
              <p><strong>Date of Issue:</strong> {formData.issueDate}</p>
              <p><strong>Reviewed by:</strong> {formData.reviewedDate}</p>
              <p><strong>Page:</strong> {formData.page}</p>
              <p><strong>Prepared By:</strong> {formData.preparedBy}</p>
              <p><strong>Approved By:</strong> {formData.approvedBy}</p>
              <p><strong>Issued:</strong> {formData.issued}</p>
            </div>

            <div className="border-r border-gray-800 p-2 text-center">
              <h1 className="text-xl font-bold">AGI Greenpac Limited</h1>
              <p className="text-sm mt-1">Unit :- AGI Speciality Glas Division</p>
              <div className="mt-8">
                <p><strong>SCOPE:</strong> AGI / DEC / COATING</p>
                <p className="mt-4"><strong>TITLE:</strong> First Article Inspection Report - COATING</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold text-2xl">AGI</div>
                <div className="text-sm font-bold">GREENPAC</div>
                <div className="w-16 h-1 bg-black mx-auto mt-1 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-x border-b border-gray-800 grid grid-cols-3 text-sm">
          <div className="border-r border-gray-800 p-2">
            <p><strong>Date:</strong> {formData.inspectionDate}</p>
            <p><strong>Product:</strong> {formData.product}</p>
            <p><strong>Size No.:</strong> {formData.sizeNo}</p>
          </div>
          <div className="border-r border-gray-800 p-2">
            <p><strong>Shift:</strong> {formData.shift}</p>
            <p><strong>Variant:</strong> {formData.variant}</p>
          </div>
          <div className="p-2">
            <p><strong>Line No.:</strong> {formData.lineNo}</p>
            <p><strong>Customer:</strong> {formData.customer}</p>
            <p><strong>Sample Size:</strong> {formData.sampleSize}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mt-2">
          <thead>
            <tr>
              <th className="border border-gray-800 p-2">S.No.</th>
              <th className="border border-gray-800 p-2">Lacquer / Dye</th>
              <th className="border border-gray-800 p-2">wt.</th>
              <th className="border border-gray-800 p-2">Batch No.</th>
              <th className="border border-gray-800 p-2">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {formData.lacquers.map((lacquer) => (
              <tr key={lacquer.id}>
                <td className="border border-gray-800 p-2 text-center">{lacquer.id}</td>
                <td className="border border-gray-800 p-2">{lacquer.name}</td>
                <td className="border border-gray-800 p-2 text-center">{lacquer.weight}</td>
                <td className="border border-gray-800 p-2 text-center">{lacquer.batchNo}</td>
                <td className="border border-gray-800 p-2 text-center">{lacquer.expiryDate}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full text-sm border-collapse mt-2">
          <thead>
            <tr>
              <th className="border border-gray-800 p-2">S.No.</th>
              <th className="border border-gray-800 p-2">Characteristic</th>
              <th className="border border-gray-800 p-2">Observations</th>
              <th className="border border-gray-800 p-2">Comments</th>
            </tr>
          </thead>
          <tbody>
            {formData.characteristics.map((char) => (
              <tr key={char.id}>
                <td className="border border-gray-800 p-2 text-center">{char.id}</td>
                <td className="border border-gray-800 p-2">{char.name}</td>
                <td className="border border-gray-800 p-2 text-center">
                  {char.id === 6
                    ? `Body: ${char.bodyThickness || '-'} / Bottom: ${char.bottomThickness || '-'}`
                    : char.observation || '-'}
                </td>
                <td className="border border-gray-800 p-2 text-center">{char.comments || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-x border-b border-gray-800 mt-4">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <div className="font-semibold mr-2">QA Exe.</div>
              <div className="w-16">
                {formData.qaSignature ? (
                  <img src={QASign} alt="QA Signature" />
                ) : (
                  <div className="h-12 border border-dashed border-gray-400 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No signature</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="font-semibold mr-2">Production Sup. / Operator:</div>
              <div className="w-16">
                {formData.operatorSignature ? (
                  <img src={OperatorSign} alt="Operator Signature" />
                ) : (
                  <div className="h-12 border border-dashed border-gray-400 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No signature</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 p-4">
            <p><strong>Time (Final Approval):</strong> {formData.finalApprovalTime}</p>
          </div>
        </div>

        {(formData.submittedBy || formData.reviewedBy || formData.comments) && (
          <div className="border-x border-b border-gray-800 p-4 bg-gray-50 mt-2">
            <h3 className="font-semibold text-gray-700 mb-2">Review Information</h3>
            {formData.submittedBy && (
              <p className="text-sm mb-1">
                <strong>Submitted by:</strong> {formData.submittedBy} on {new Date(formData.submittedAt).toLocaleString()}
              </p>
            )}
            {formData.reviewedBy && (
              <p className="text-sm mb-1">
                <strong>Reviewed by:</strong> {formData.reviewedBy} on {new Date(formData.reviewedAt).toLocaleString()}
              </p>
            )}
            {formData.comments && (
              <div className="text-sm mt-2">
                <strong>Comments:</strong>
                <div className="bg-white p-2 border border-gray-300 rounded mt-1">
                  {formData.comments}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/forms')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Forms
          </button>
          <div className="space-x-2">
            <button
              type="button"
              onClick={printPage}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Print
            </button>
            <button
              type="button"
              onClick={downloadPage}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
            >
              Download
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ViewInspectionForm;
