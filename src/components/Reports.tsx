import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Plus, Save, X } from 'lucide-react';
import { getSettings, type AppSettings } from '../lib/storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CoverageRow {
  group: number;
  studentCount: number;
  date: string;
  coverage: number;
  objectives: string;
}

export default function Reports() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState({
    school: '',
    counselor: '',
    academicYear: '2024/2025',
    level: 'السنة الأولى متوسط',
    groupCount: 4,
    totalStudents: 0,
    coverageRows: [] as CoverageRow[],
    observations: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const newRows: CoverageRow[] = [];
    for (let i = 0; i < reportData.groupCount; i++) {
      const existingRow = reportData.coverageRows[i];
      newRows.push(existingRow || {
        group: i + 1,
        studentCount: 0,
        date: '',
        coverage: 0,
        objectives: ''
      });
    }
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));
  }, [reportData.groupCount]);

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
    setReportData(prev => ({
      ...prev,
      school: loadedSettings.schoolName,
      counselor: loadedSettings.counselorName
    }));
  };

  const handleCoverageRowChange = (index: number, field: keyof CoverageRow, value: any) => {
    const newRows = [...reportData.coverageRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));

    if (field === 'studentCount') {
      const total = newRows.reduce((sum, row) => sum + (row.studentCount || 0), 0);
      setReportData(prev => ({
        ...prev,
        totalStudents: total
      }));
    }
  };

  const handleGeneratePDF = async () => {
    const content = document.getElementById('report-preview');
    if (!content) return;

    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('تقرير_التوجيه.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">إدارة التقارير</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء تقرير جديد</span>
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">تقرير عملية الإعلام</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div id="report-preview" className="bg-white p-8 rounded-lg space-y-6">
              <div className="text-center font-bold text-xl mb-8">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>

              <div className="flex justify-between mb-6">
                <div>مديرية التربية لولاية مستغانم</div>
                <div>مركز التوجيه و الإرشاد المدرسي و المهني</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="underline ml-2">متوسطة</span>
                    <span className="mx-2">:</span>
                    <input
                      type="text"
                      value={reportData.school}
                      onChange={(e) => setReportData(prev => ({ ...prev, school: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[200px] text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="underline ml-2">السنة الدراسية</span>
                    <span className="mx-2">:</span>
                    <input
                      type="text"
                      value={reportData.academicYear}
                      onChange={(e) => setReportData(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 w-24 text-center"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="underline ml-2">مستشار التوجيه</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={reportData.counselor}
                    onChange={(e) => setReportData(prev => ({ ...prev, counselor: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[200px] text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="text-center my-8">
                <div className="text-xl font-bold underline mb-2">تقرير عملية الإعلام</div>
                <div>( الفصل الأول )</div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <span className="underline font-bold ml-2">المستوى</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={reportData.level}
                    onChange={(e) => setReportData(prev => ({ ...prev, level: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[200px] text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <div className="font-bold underline mb-2">التعداد الإجمالي في المستوى:</div>
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="border p-2 font-bold text-right">عدد الأفواج</td>
                        <td className="border p-2 w-32">
                          <input
                            type="number"
                            min="1"
                            value={reportData.groupCount}
                            onChange={(e) => setReportData(prev => ({ 
                              ...prev, 
                              groupCount: Math.max(1, parseInt(e.target.value) || 1)
                            }))}
                            className="w-full text-center outline-none"
                            dir="rtl"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold text-right">العدد الإجمالي للتلاميذ</td>
                        <td className="border p-2 text-center" dir="rtl">
                          {reportData.totalStudents}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold underline mb-2">التغطية الإعلامية:</div>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-right">الأفواج</th>
                        <th className="border p-2 text-right">عدد التلاميذ</th>
                        <th className="border p-2 text-right">تاريخ التدخل</th>
                        <th className="border p-2 text-right">نسبة التغطية</th>
                        <th className="border p-2 text-right">الأهداف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.coverageRows.map((row, index) => (
                        <tr key={index}>
                          <td className="border p-2 text-center" dir="rtl">{row.group}</td>
                          <td className="border p-2">
                            <input
                              type="number"
                              min="0"
                              value={row.studentCount}
                              onChange={(e) => handleCoverageRowChange(index, 'studentCount', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none"
                              dir="rtl"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleCoverageRowChange(index, 'date', e.target.value)}
                              className="w-full text-center outline-none"
                              dir="rtl"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.coverage}
                              onChange={(e) => handleCoverageRowChange(index, 'coverage', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none"
                              dir="rtl"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              value={row.objectives}
                              onChange={(e) => handleCoverageRowChange(index, 'objectives', e.target.value)}
                              className="w-full outline-none text-right"
                              dir="rtl"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold underline mb-2">الملاحظات المستخلصة:</div>
                  <textarea
                    value={reportData.observations}
                    onChange={(e) => setReportData(prev => ({ ...prev, observations: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg min-h-[100px] text-right"
                    placeholder="أدخل الملاحظات هنا..."
                    dir="rtl"
                  />
                </div>

                <div className="flex justify-between mt-16">
                  <div className="text-center">
                    <div className="font-bold underline mb-16">مستشار التوجيه و الإرشاد م.م</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold underline mb-16">مدير المتوسطة</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleGeneratePDF}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>حفظ كـ PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">تقرير عملية الإعلام</h3>
          </div>
          <p className="text-gray-600 mb-6">
            تقرير شامل عن عملية الإعلام والتوجيه للتلاميذ
          </p>
          <button
            onClick={() => setShowPreview(true)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>إنشاء التقرير</span>
          </button>
        </div>
      </div>
    </div>
  );
}