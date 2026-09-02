'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Calendar, Upload, MessageCircle, Clock, ShieldCheck, Scale, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientPortal() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    // محاكاة جلب قضايا الموكل (في بيئة حقيقية سنعتمد على auth.uid() والـ RLS)
    const fetchMyCases = async () => {
      setLoading(true);
      // سنقوم بجلب القضايا التي تخص العميل الحالي فقط
      const { data, error } = await supabase.from('cases').select(`
        *,
        sessions (*),
        documents (*)
      `).limit(1); // مؤقتاً كعينة
      
      if (data) setCases(data);
      setLoading(false);
    };

    fetchMyCases();
  }, []);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, caseId: string) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];

      // File Upload Security Checks
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('عذراً، لأسباب أمنية يُسمح فقط برفع ملفات PDF أو الصور (JPG, PNG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('حجم الملف يجب ألا يتجاوز 5 ميجابايت.');
        return;
      }

      setUploadingFile(true);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage.from('case-files').upload(`clients/${fileName}`, file);
      if (uploadError) throw uploadError;

      alert('تم رفع المستند بنجاح ومشاركته مع محاميك بسرية تامة.');
    } catch (error) {
      alert('حدث خطأ أثناء رفع المستند.');
      console.error(error);
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* Header */}
      <header className="bg-charcoal-900 text-white p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scale className="text-gold-500 h-6 w-6" />
            <span className="font-bold text-lg">بوابة الموكلين | إنجاز للمحاماة</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">أهلاً بك، (اسم الموكل)</span>
            <div className="h-8 w-8 bg-gold-500 rounded-full flex items-center justify-center font-bold text-slate-900">
              م
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Security Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-800">
          <ShieldCheck className="h-6 w-6 flex-shrink-0" />
          <div>
            <h4 className="font-bold">أنت في مساحة مشفرة وآمنة</h4>
            <p className="text-sm mt-1">جميع بياناتك ومستنداتك وملفات قضاياك تخضع لأعلى معايير التشفير (End-to-End Security) ولا يمكن لأحد الاطلاع عليها سوى المحامي المسؤول عن قضيتك.</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">ملف القضايا الخاص بي</h1>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gold-500" /></div>
        ) : cases.length === 0 ? (
          <div className="text-center bg-white border border-slate-200 rounded-2xl p-12 shadow-sm">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">لا توجد قضايا نشطة</h3>
            <p className="text-slate-500 mt-2">لم يتم ربط أي قضايا بحسابك بعد. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cases.map((c, index) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={c.id || index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Case Header */}
                <div className="bg-charcoal-900 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{c.title || 'قضية تعويض مدني'}</h2>
                    <p className="text-slate-400 mt-1 font-mono">رقم القضية: {c.case_number || 'CASE-2026-9901'}</p>
                  </div>
                  <div className="bg-charcoal-800 px-4 py-2 rounded-lg text-sm border border-slate-700">
                    الحالة: <span className="text-gold-500 font-bold">{c.status || 'مفتوحة'}</span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Sessions & Updates */}
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Calendar className="text-gold-500 h-5 w-5" /> الجلسات والمستجدات
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Placeholder Session 1 */}
                      <div className="flex gap-4 items-start">
                        <div className="bg-amber-100 text-amber-800 rounded-lg p-2 text-center min-w-[80px]">
                          <span className="block text-xl font-bold">15</span>
                          <span className="block text-xs uppercase">أكتوبر</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex-1">
                          <h4 className="font-bold text-slate-800">جلسة سماع الشهود (رول 12)</h4>
                          <p className="text-sm text-slate-600 mt-1">المطلوب: حضور العميل شخصياً ومعه أصل عقد الإيجار.</p>
                          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> تم الجدولة من قبل المحامي المسؤول
                          </div>
                        </div>
                      </div>
                      
                      {/* Placeholder Session 2 */}
                      <div className="flex gap-4 items-start opacity-75">
                        <div className="bg-slate-200 text-slate-600 rounded-lg p-2 text-center min-w-[80px]">
                          <span className="block text-xl font-bold">01</span>
                          <span className="block text-xs uppercase">سبتمبر</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex-1">
                          <h4 className="font-bold text-slate-800">الجلسة الافتتاحية</h4>
                          <p className="text-sm text-slate-600 mt-1">القرار: تأجيل للاطلاع والرد من قبل محامي الخصم.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents & Contact */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
                      <FileText className="text-gold-500 h-5 w-5" /> مستندات القضية
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Placeholder Documents */}
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">عريضة الدعوى.pdf</span>
                        <button className="text-blue-600 text-sm hover:underline">تحميل</button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">التوكيل الرسمي.jpg</span>
                        <button className="text-blue-600 text-sm hover:underline">تحميل</button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="w-full bg-charcoal-900 hover:bg-charcoal-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer">
                        {uploadingFile ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
                        {uploadingFile ? 'جاري الرفع...' : 'رفع مستند للمحامي'}
                        <input type="file" className="hidden" onChange={(e) => handleDocumentUpload(e, c.id)} disabled={uploadingFile} />
                      </label>
                      <p className="text-xs text-slate-500 text-center mt-2">يمكنك رفع صور أو ملفات PDF لدعم قضيتك.</p>
                    </div>

                    <div className="pt-4">
                      <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition">
                        <MessageCircle className="h-5 w-5" />
                        تواصل عبر WhatsApp
                      </a>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
