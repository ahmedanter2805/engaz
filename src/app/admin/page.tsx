'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit, Users, Briefcase, FileText, Loader2, Calendar, LayoutDashboard, FolderOpen, LogOut, CheckCircle, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lawyerForm, setLawyerForm] = useState({ name: '', title: '', experience_years: '', bio: '', image_url: '' });
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'template', content: '' });
  const [caseForm, setCaseForm] = useState({ case_number: '', client_name: '', title: '', status: 'شغالة' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [lawyersRes, consRes, resRes, casesRes] = await Promise.all([
      supabase.from('lawyers').select('*').order('created_at', { ascending: false }),
      supabase.from('consultations').select('*').order('created_at', { ascending: false }),
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('cases').select('*').order('created_at', { ascending: false })
    ]);

    if (lawyersRes.data) setLawyers(lawyersRes.data);
    if (consRes.data) setConsultations(consRes.data);
    if (resRes.data) setResources(resRes.data);
    if (casesRes.data) setCases(casesRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAddLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('lawyers').insert([
      { ...lawyerForm, experience_years: parseInt(lawyerForm.experience_years) || 0 }
    ]);
    if (!error) { setLawyerForm({ name: '', title: '', experience_years: '', bio: '', image_url: '' }); fetchData(); }
    else alert('خطأ: ' + error.message);
    setIsSubmitting(false);
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let fileUrl = '';
    
    if (uploadFile) {
      const fileName = `${Math.random()}-${uploadFile.name}`;
      const { data, error: uploadError } = await supabase.storage.from('case-files').upload(fileName, uploadFile);
      if (uploadError) {
        alert('خطأ في رفع الملف');
        setIsSubmitting(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('case-files').getPublicUrl(fileName);
      fileUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('resources').insert([
      { ...resourceForm, file_url: fileUrl }
    ]);
    
    if (!error) { 
      setResourceForm({ title: '', type: 'template', content: '' }); 
      setUploadFile(null);
      fetchData(); 
    }
    else alert('خطأ: ' + error.message);
    setIsSubmitting(false);
  };

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let fileUrl = '';
    
    if (uploadFile) {
      const fileName = `${Math.random()}-${uploadFile.name}`;
      const { data, error: uploadError } = await supabase.storage.from('case-files').upload(fileName, uploadFile);
      if (uploadError) {
        alert('خطأ في رفع الملف');
        setIsSubmitting(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('case-files').getPublicUrl(fileName);
      fileUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('cases').insert([
      { ...caseForm, file_url: fileUrl }
    ]);
    
    if (!error) { 
      setCaseForm({ case_number: '', client_name: '', title: '', status: 'شغالة' }); 
      setUploadFile(null);
      fetchData(); 
    }
    else alert('خطأ: ' + error.message);
    setIsSubmitting(false);
  };

  const deleteRecord = async (table: string, id: string) => {
    if (!confirm('هل أنت متأكد من الحذف النهائي؟')) return;
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  const updateConsultationStatus = async (id: string, status: string) => {
    await supabase.from('consultations').update({ status }).eq('id', id);
    fetchData();
  };

  const assignLawyerToConsultation = async (consId: string, lawyerId: string) => {
    await supabase.from('consultations').update({ lawyer_id: lawyerId || null }).eq('id', consId);
    fetchData();
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-charcoal-900 border-l border-charcoal-800 h-screen fixed right-0 top-0 p-5 flex flex-col">
      <h2 className="text-2xl font-bold text-gold-500 mb-10 flex items-center gap-2">
        <Briefcase size={24} /> إنجاز للأدمن
      </h2>
      <nav className="flex-1 space-y-2">
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={20}/>, label: 'الرئيسية' },
          { id: 'consultations', icon: <Calendar size={20}/>, label: 'الاستشارات' },
          { id: 'lawyers', icon: <Users size={20}/>, label: 'المحامين' },
          { id: 'cases', icon: <FolderOpen size={20}/>, label: 'القضايا' },
          { id: 'resources', icon: <FileText size={20}/>, label: 'العقود والمقالات' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-gold-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-charcoal-800 hover:text-white'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors mt-auto p-4">
        <LogOut size={20} /> تسجيل خروج
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 font-sans pr-64">
      <Sidebar />
      
      <div className="p-8 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-bold mb-8">نظرة عامة</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
                  <h3 className="text-slate-400 mb-2">إجمالي المحامين</h3>
                  <p className="text-4xl font-bold text-gold-500">{lawyers.length}</p>
                </div>
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
                  <h3 className="text-slate-400 mb-2">الاستشارات</h3>
                  <p className="text-4xl font-bold text-blue-500">{consultations.length}</p>
                </div>
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
                  <h3 className="text-slate-400 mb-2">القضايا</h3>
                  <p className="text-4xl font-bold text-purple-500">{cases.length}</p>
                </div>
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl">
                  <h3 className="text-slate-400 mb-2">العقود/المقالات</h3>
                  <p className="text-4xl font-bold text-emerald-500">{resources.length}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: CONSULTATIONS */}
          {activeTab === 'consultations' && (
            <motion.div key="cons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-8">إدارة الاستشارات</h1>
              <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-charcoal-800 text-slate-400">
                    <tr>
                      <th className="p-4">العميل</th>
                      <th className="p-4">التفاصيل</th>
                      <th className="p-4">تعيين محامي</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {consultations.map(c => (
                      <tr key={c.id} className="hover:bg-charcoal-800/50">
                        <td className="p-4">
                          <p className="font-bold">{c.client_name}</p>
                          <p className="text-sm text-slate-400">{c.client_phone}</p>
                        </td>
                        <td className="p-4 text-sm">
                          {c.consultation_type} ({c.meeting_type})<br/>
                          <span className="text-gold-500">{c.booking_date} | {c.booking_time}</span>
                        </td>
                        <td className="p-4">
                          <select 
                            value={c.lawyer_id || ''} 
                            onChange={e => assignLawyerToConsultation(c.id, e.target.value)}
                            className="bg-charcoal-950 border border-slate-700 rounded p-2 text-sm w-full outline-none"
                          >
                            <option value="">لم يتم التعيين</option>
                            {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </select>
                        </td>
                        <td className="p-4">
                          <select 
                            value={c.status}
                            onChange={(e) => updateConsultationStatus(c.id, e.target.value)}
                            className="bg-charcoal-950 border border-slate-700 rounded p-2 text-sm outline-none"
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="confirmed">مؤكدة</option>
                            <option value="completed">مكتملة</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button onClick={() => deleteRecord('consultations', c.id)} className="text-red-500 p-2"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: LAWYERS */}
          {activeTab === 'lawyers' && (
            <motion.div key="lawyers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-8">إدارة المحامين</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl h-fit">
                  <h2 className="text-xl font-bold mb-4">إضافة محامي</h2>
                  <form onSubmit={handleAddLawyer} className="space-y-4">
                    <input required type="text" placeholder="الاسم" value={lawyerForm.name} onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="text" placeholder="المسمى (مثال: محامي نقض)" value={lawyerForm.title} onChange={e => setLawyerForm({...lawyerForm, title: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="number" placeholder="سنوات الخبرة" value={lawyerForm.experience_years} onChange={e => setLawyerForm({...lawyerForm, experience_years: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <textarea placeholder="نبذة عن المحامي" rows={3} value={lawyerForm.bio} onChange={e => setLawyerForm({...lawyerForm, bio: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none resize-none" />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 p-3 rounded-lg font-bold flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'حفظ'}</button>
                  </form>
                </div>
                <div className="lg:col-span-2 grid gap-4">
                  {lawyers.map(l => (
                    <div key={l.id} className="bg-charcoal-900 border border-charcoal-800 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{l.name} <span className="text-sm font-normal text-gold-500 bg-gold-500/10 px-2 py-1 rounded ml-2">{l.title}</span></h3>
                        <p className="text-sm text-slate-400 mt-1">خبرة: {l.experience_years} سنوات</p>
                      </div>
                      <button onClick={() => deleteRecord('lawyers', l.id)} className="text-red-500 bg-red-500/10 p-2 rounded-lg hover:bg-red-500/20"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: CASES */}
          {activeTab === 'cases' && (
            <motion.div key="cases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-8">إدارة القضايا</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl h-fit">
                  <h2 className="text-xl font-bold mb-4">فتح ملف قضية</h2>
                  <form onSubmit={handleAddCase} className="space-y-4">
                    <input required type="text" placeholder="رقم القضية (فريد)" value={caseForm.case_number} onChange={e => setCaseForm({...caseForm, case_number: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="text" placeholder="اسم العميل" value={caseForm.client_name} onChange={e => setCaseForm({...caseForm, client_name: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="text" placeholder="عنوان / موضوع القضية" value={caseForm.title} onChange={e => setCaseForm({...caseForm, title: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <select value={caseForm.status} onChange={e => setCaseForm({...caseForm, status: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none">
                      <option>شغالة</option>
                      <option>جاري التحقيق</option>
                      <option>تم الحكم</option>
                    </select>
                    <div className="border border-dashed border-slate-700 p-4 rounded-lg text-center cursor-pointer hover:bg-charcoal-800">
                      <input type="file" onChange={e => e.target.files && setUploadFile(e.target.files[0])} className="w-full text-sm" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 p-3 rounded-lg font-bold flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'حفظ القضية'}</button>
                  </form>
                </div>
                <div className="lg:col-span-2 overflow-x-auto">
                  <table className="w-full text-right bg-charcoal-900 border border-charcoal-800 rounded-2xl">
                    <thead className="text-slate-400 border-b border-charcoal-800">
                      <tr>
                        <th className="p-4">رقم القضية</th>
                        <th className="p-4">العميل والموضوع</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">الملف</th>
                        <th className="p-4">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {cases.map(c => (
                        <tr key={c.id}>
                          <td className="p-4 font-mono text-gold-500">{c.case_number}</td>
                          <td className="p-4 font-bold">{c.client_name} <br/><span className="text-sm font-normal text-slate-400">{c.title}</span></td>
                          <td className="p-4">{c.status}</td>
                          <td className="p-4">
                            {c.file_url ? <a href={c.file_url} target="_blank" className="text-blue-400 hover:underline">عرض</a> : '-'}
                          </td>
                          <td className="p-4">
                            <button onClick={() => deleteRecord('cases', c.id)} className="text-red-500 p-2"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-8">إدارة العقود والمقالات</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl h-fit">
                  <h2 className="text-xl font-bold mb-4">إضافة جديد</h2>
                  <form onSubmit={handleAddResource} className="space-y-4">
                    <input required type="text" placeholder="العنوان" value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <select value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none">
                      <option value="template">نموذج عقد (للطباعة)</option>
                      <option value="article">مقال قانوني</option>
                    </select>
                    <textarea placeholder="المحتوى النصي (اختياري)" rows={4} value={resourceForm.content} onChange={e => setResourceForm({...resourceForm, content: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none resize-none" />
                    <div className="border border-dashed border-slate-700 p-4 rounded-lg text-center cursor-pointer hover:bg-charcoal-800">
                      <p className="text-sm text-slate-400 mb-2">إرفاق ملف PDF للتحميل/الطباعة</p>
                      <input type="file" onChange={e => e.target.files && setUploadFile(e.target.files[0])} className="w-full text-sm" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 p-3 rounded-lg font-bold flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'إضافة للائحة'}</button>
                  </form>
                </div>
                <div className="lg:col-span-2 grid gap-4">
                  {resources.map(r => (
                    <div key={r.id} className="bg-charcoal-900 border border-charcoal-800 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{r.title} <span className="text-xs font-normal text-slate-400 ml-2 border border-slate-700 px-2 rounded">{r.type === 'template' ? 'عقد' : 'مقال'}</span></h3>
                        {r.file_url && <a href={r.file_url} target="_blank" className="text-blue-400 text-sm mt-1 inline-block hover:underline">مرفق ملف</a>}
                      </div>
                      <button onClick={() => deleteRecord('resources', r.id)} className="text-red-500 bg-red-500/10 p-2 rounded-lg hover:bg-red-500/20"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
