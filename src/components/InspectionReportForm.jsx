import React from 'react';
import QASign from '../assets/QASign.png';
import OperatorSign from '../assets/OperatorSign.png';
const InspectionReportForm = () => {
    return (
        <div className="flex justify-center bg-gray-100 p-4">
            <div className="w-full max-w-4xl bg-white shadow-md">
                {/* Header */}
                <div className="border border-gray-800">
                    <div className="grid grid-cols-3">
                        {/* Left column - Document info */}
                        <div className="border-r border-gray-800">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Document No. :</td>
                                        <td className="p-1">AGI-DEC-14-04</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Issuance No. :</td>
                                        <td className="p-1">00</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Date of Issue :</td>
                                        <td className="p-1">01.08.2024</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Reviewed by :</td>
                                        <td className="p-1">01.03.2027</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Page :</td>
                                        <td className="p-1">1 of 1</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Prepared By :</td>
                                        <td className="p-1">QQM QC</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-1 font-semibold border-r border-gray-800">Approved by :</td>
                                        <td className="p-1">AVP-QA & SYS</td>
                                    </tr>
                                    <tr>
                                        <td className="p-1 font-semibold border-r border-gray-800">Issued :</td>
                                        <td className="p-1">AVP-QA & SYS</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Middle column - Title */}
                        <div className="border-r border-gray-800 p-2">
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
                                        <span >First Article Inspection Report - COATING</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Logo */}
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <div className="font-bold text-2xl">AGI</div>
                                <div className="text-sm font-bold">GREENPAC</div>
                                <div className="w-16 h-1 bg-black mx-auto mt-1 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Info Section */}
                <div className="border-x border-b border-gray-800">
                    <div className="grid grid-cols-3 text-sm">
                        <div className="border-r border-gray-800">
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Date: </span>
                                <span>29/11/24</span>
                            </div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Product: </span>
                                <span>100 mL Bag Pke.</span>
                            </div>
                            <div className="p-2">
                                <span className="font-semibold">Size No.: </span>
                                <span></span>
                            </div>
                        </div>
                        <div className="border-r border-gray-800">
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Shift: </span>
                                <span>C</span>
                            </div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Variant: </span>
                                <span>Pink matt</span>
                            </div>
                            <div className="p-2"></div>
                        </div>
                        <div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Line No.: </span>
                                <span>02</span>
                            </div>
                            <div className="border-b border-gray-800 p-2">
                                <span className="font-semibold">Customer: </span>
                                <span></span>
                            </div>
                            <div className="p-2">
                                <span className="font-semibold">Sample Size: </span>
                                <span>08 Nos.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lacquer Table */}
                <div>
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
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">1</td>
                                <td className="border border-gray-800 p-2">Clear Extn</td>
                                <td className="border border-gray-800 p-2 text-center">11.74</td>
                                <td className="border border-gray-800 p-2 text-center">2634</td>
                                <td className="border border-gray-800 p-2 text-center">24/10/25</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">2</td>
                                <td className="border border-gray-800 p-2">Red Dye</td>
                                <td className="border border-gray-800 p-2 text-center">121g</td>
                                <td className="border border-gray-800 p-2 text-center">2137</td>
                                <td className="border border-gray-800 p-2 text-center">20/10/25</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">3</td>
                                <td className="border border-gray-800 p-2">Black Dye</td>
                                <td className="border border-gray-800 p-2 text-center">46.7g</td>
                                <td className="border border-gray-800 p-2 text-center">1453</td>
                                <td className="border border-gray-800 p-2 text-center">21/10/25</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">4</td>
                                <td className="border border-gray-800 p-2">Pink Dye</td>
                                <td className="border border-gray-800 p-2 text-center">26.5g</td>
                                <td className="border border-gray-800 p-2 text-center">1140</td>
                                <td className="border border-gray-800 p-2 text-center">10/07/25</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">5</td>
                                <td className="border border-gray-800 p-2">Violet Dye</td>
                                <td className="border border-gray-800 p-2 text-center">18.7g</td>
                                <td className="border border-gray-800 p-2 text-center">1160</td>
                                <td className="border border-gray-800 p-2 text-center">11/07/25</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">6</td>
                                <td className="border border-gray-800 p-2">Matt Bath</td>
                                <td className="border border-gray-800 p-2 text-center">300g</td>
                                <td className="border border-gray-800 p-2 text-center">1156</td>
                                <td className="border border-gray-800 p-2 text-center">12/09/25</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">7</td>
                                <td className="border border-gray-800 p-2">Hardener</td>
                                <td className="border border-gray-800 p-2 text-center">60g</td>
                                <td className="border border-gray-800 p-2 text-center">114</td>
                                <td className="border border-gray-800 p-2 text-center">20/11/25</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">8</td>
                                <td className="border border-gray-800 p-2"></td>
                                <td className="border border-gray-800 p-2 text-center"></td>
                                <td className="border border-gray-800 p-2 text-center"></td>
                                <td className="border border-gray-800 p-2 text-center"></td>
                            </tr>
                        </tbody>
                    </table>
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
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">1</td>
                                <td className="border border-gray-800 p-2">Colour Shade</td>
                                <td className="border border-gray-800 p-2">
                                    <div className="flex justify-around">
                                        <div>Shade 1 :</div>
                                        <div>Shade 2 : OK</div>
                                    </div>
                                </td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">2</td>
                                <td className="border border-gray-800 p-2">(Colour Height)</td>
                                <td className="border border-gray-800 p-2 text-center italic">Full</td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">3</td>
                                <td className="border border-gray-800 p-2">Any Visual defect</td>
                                <td className="border border-gray-800 p-2 text-center italic">No</td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">4</td>
                                <td className="border border-gray-800 p-2">MEK Test</td>
                                <td className="border border-gray-800 p-2 text-center italic">OK</td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">5</td>
                                <td className="border border-gray-800 p-2">Cross Cut Test (Tape Test)</td>
                                <td className="border border-gray-800 p-2 text-center italic">OK</td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">6</td>
                                <td className="border border-gray-800 p-2">
                                    <div>Coating Thickness</div>
                                </td>
                                <td className="border border-gray-800 p-0">
                                    <table className="w-full border-collapse">
                                        <tr>
                                            <td className="border-b border-r border-gray-800 p-2 w-20 text-center font-semibold">Body</td>
                                            <td className="border-b border-gray-800 p-2 text-center italic">20 mic</td>
                                        </tr>
                                        <tr>
                                            <td className="border-r border-gray-800 p-2 text-center font-semibold">Bottom</td>
                                            <td className="p-2 text-center italic">10.2 mic</td>
                                        </tr>
                                    </table>
                                </td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">7</td>
                                <td className="border border-gray-800 p-2">Temperature</td>
                                <td className="border border-gray-800 p-2 text-center italic">117°c</td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">8</td>
                                <td className="border border-gray-800 p-2">Viscosity</td>
                                <td className="border border-gray-800 p-2 text-center italic">25.1s</td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 p-2 text-center">9</td>
                                <td className="border border-gray-800 p-2">Batch Composition</td>
                                <td className="border border-gray-800 p-2 text-xs italic">
                                    <p>Clear Extn 11.74 Red Dye 121g Black Dye 46.7g</p>
                                    <p>Pink Dye 26.5g Violet Dye 18.7g</p>
                                    <p>Matt Bath H-Agent 60g</p>
                                </td>
                                <td className="border border-gray-800 p-2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="border-x border-b border-gray-800">
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center">
                            <div className="font-semibold mr-2">QA Exe.</div>
                            <div className="w-16">
                                <img src={QASign} alt="sign" />
                            </div>
                            {/* <div className="border-b border-gray-800 w-16 text-center">~</div> */}
                        </div>
                        <div></div>
                        <div className="flex items-center">
                            <div className="font-semibold mr-2">Production Sup. / Operator:</div>
                            <div className="w-16">
                                <img src={OperatorSign} alt="sign" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 border-t border-gray-800 p-4">
                        <span className="font-semibold">Time (Final Approval) : </span>
                        <span className="italic">21:30 hrs</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectionReportForm;