'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit, Users, Briefcase, FileText, Loader2, Calendar, LayoutDashboard, FolderOpen, LogOut, CheckCircle, Upload, X, Settings, DollarSign, Globe, PhoneCall, ShieldCheck, UserCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pricing States
  const [prices, setPrices] = useState({
    video_default: 500,
    video_commercial: 1000,
    phone_default: 500,
    phone_commercial: 1000,
    office_default: 1000,
    office_commercial: 1500,
  });
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceSaved, setPriceSaved] = useState(false);

  // Content & Contact States
  const [siteContent, setSiteContent] = useState({
    hero_title: 'شريكك القانوني الموثوق',
    hero_subtitle: 'خبرة قانونية تتجاوز التوقعات',
    hero_description: 'نقدم لك استشارة مبنية على الصدق، السرية، والدقة القانونية. التزام كامل ومتابعة حقيقية لقضاياك لأن القانون ليس مجرد نصوص، بل مسؤولية.',
    feature1_title: 'سرية تامة',
    feature1_desc: 'التزام كامل بالسرية التامة لجميع بيانات وملفات عملائنا.',
    feature2_title: 'شرح مبسّط',
    feature2_desc: 'نقدم لك شرحاً قانونياً مبسّطاً يجعلك على دراية كاملة بموقفك.',
    feature3_title: 'متابعة حقيقية',
    feature3_desc: 'متابعة حقيقية ومستمرة للقضايا لضمان عدم تفويت أي فرصة.',
    feature4_title: 'اهتمام بالتفاصيل',
    feature4_desc: 'ندرس كل ملف بدقة متناهية لأننا نؤمن أن كسب القضايا يبدأ من التفاصيل.'
  });

  const [contactData, setContactData] = useState({
    phone: '01035849900',
    email: 'info@engazlawfirm.com',
    address: 'شارع النصر الرئيسي، بجوار مستشفى كليوباترا، الغردقة، البحر الأحمر، مصر',
    whatsapp: '201035849900',
    facebook: 'https://facebook.com',
    working_hours: 'السبت - الأربعاء: 09:00 - 17:00\nالخميس: 09:00 - 14:00\nالجمعة: مغلق'
  });

  const [settingsSaving, setSettingsSaving] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lawyerForm, setLawyerForm] = useState({ name: '', title: '', experience_years: '', bio: '', image_url: '' });
  const [lawyerImage, setLawyerImage] = useState<File | null>(null);
  const [lawyerImagePreview, setLawyerImagePreview] = useState('');
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'template', content: '' });
  const [caseForm, setCaseForm] = useState({ case_number: '', client_name: '', title: '', status: 'شغالة', client_id: '' });
  const [clientForm, setClientForm] = useState({ name: '', national_id: '', phone: '', email: '', address: '' });
  const [sessionForm, setSessionForm] = useState({ case_id: '', session_date: '', requirements: '', roll_number: '', court_name: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [lawyersRes, consRes, resRes, casesRes, settingsRes, clientsRes, sessionsRes] = await Promise.all([
      supabase.from('lawyers').select('*').order('created_at', { ascending: false }),
      supabase.from('consultations').select('*').order('created_at', { ascending: false }),
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('cases').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*'),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('sessions').select(`*, cases (case_number, title)`).order('session_date', { ascending: true })
    ]);

    if (lawyersRes.data) setLawyers(lawyersRes.data);
    if (consRes.data) setConsultations(consRes.data);
    if (resRes.data) setResources(resRes.data);
    if (casesRes.data) setCases(casesRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    
    // Load Settings
    if (settingsRes.data && settingsRes.data.length > 0) {
      const pricesSetting = settingsRes.data.find(s => s.id === 'consultation_prices');
      if (pricesSetting) setPrices(pricesSetting.value);
      
      const contentSetting = settingsRes.data.find(s => s.id === 'site_content');
      if (contentSetting) setSiteContent(contentSetting.value);
      
      const contactSetting = settingsRes.data.find(s => s.id === 'contact_data');
      if (contactSetting) setContactData(contactSetting.value);
    } else {
      // Fallback to local storage if DB table not created yet
      const p = localStorage.getItem('consultation_prices'); if (p) setPrices(JSON.parse(p));
      const c = localStorage.getItem('site_content'); if (c) setSiteContent(JSON.parse(c));
      const ct = localStorage.getItem('contact_data'); if (ct) setContactData(JSON.parse(ct));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAddLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      
      // Upload lawyer image if provided
      if (lawyerImage) {
        const fileExt = lawyerImage.name.split('.').pop();
        const fileName = `lawyer-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('case-files').upload(`lawyers/${fileName}`, lawyerImage);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('case-files').getPublicUrl(`lawyers/${fileName}`);
        imageUrl = urlData.publicUrl;
      }
      
      const { error } = await supabase.from('lawyers').insert([
        { ...lawyerForm, experience_years: parseInt(lawyerForm.experience_years) || 0, image_url: imageUrl }
      ]);
      if (error) throw error;
      
      setLawyerForm({ name: '', title: '', experience_years: '', bio: '', image_url: '' });
      setLawyerImage(null);
      setLawyerImagePreview('');
      fetchData();
    } catch (error: any) {
      alert('خطأ: ' + (error.message || 'حدث خطأ أثناء الحفظ'));
    }
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
      { 
        case_number: caseForm.case_number, 
        client_name: caseForm.client_name, 
        title: caseForm.title, 
        status: caseForm.status, 
        client_id: caseForm.client_id || null,
        file_url: fileUrl 
      }
    ]);
    
    if (!error) { 
      setCaseForm({ case_number: '', client_name: '', title: '', status: 'شغالة', client_id: '' }); 
      setUploadFile(null);
      fetchData(); 
    }
    else alert('خطأ: ' + error.message);
    setIsSubmitting(false);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('clients').insert([clientForm]);
    if (!error) { 
      setClientForm({ name: '', national_id: '', phone: '', email: '', address: '' }); 
      fetchData(); 
    } else alert('خطأ: ' + error.message);
    setIsSubmitting(false);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('sessions').insert([{ ...sessionForm, status: 'pending' }]);
    if (!error) { 
      setSessionForm({ case_id: '', session_date: '', requirements: '', roll_number: '', court_name: '' }); 
      fetchData(); 
    } else alert('خطأ: ' + error.message);
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
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 pb-4">
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={20}/>, label: 'الرئيسية' },
          { id: 'content', icon: <Globe size={20}/>, label: 'محتوى الموقع' },
          { id: 'contact', icon: <PhoneCall size={20}/>, label: 'بيانات التواصل' },
          { id: 'clients', icon: <UserCheck size={20}/>, label: 'إدارة الموكلين' },
          { id: 'consultations', icon: <Calendar size={20}/>, label: 'الاستشارات' },
          { id: 'lawyers', icon: <Users size={20}/>, label: 'المحامين' },
          { id: 'cases', icon: <FolderOpen size={20}/>, label: 'القضايا' },
          { id: 'sessions', icon: <Clock size={20}/>, label: 'أجندة الجلسات' },
          { id: 'resources', icon: <FileText size={20}/>, label: 'العقود والمقالات' },
          { id: 'pricing', icon: <DollarSign size={20}/>, label: 'أسعار الاستشارات' },
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

          {/* TAB: CONTENT */}
          {activeTab === 'content' && (
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">إدارة محتوى الموقع</h1>
                <button 
                  onClick={async () => {
                    setSettingsSaving(true);
                    const { error } = await supabase.from('settings').upsert({ id: 'site_content', value: siteContent }, { onConflict: 'id' });
                    if (error) localStorage.setItem('site_content', JSON.stringify(siteContent));
                    setSettingsSaving(false); alert('تم الحفظ!');
                  }}
                  disabled={settingsSaving}
                  className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  {settingsSaving ? <Loader2 className="animate-spin h-5 w-5" /> : 'حفظ التغييرات'}
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xl font-bold mb-4 text-gold-500">القسم الرئيسي (Hero)</h3>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">العنوان الصغير فوق (Subtitle)</label>
                    <input type="text" value={siteContent.hero_subtitle} onChange={e => setSiteContent({...siteContent, hero_subtitle: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">العنوان الرئيسي الملون (Title)</label>
                    <input type="text" value={siteContent.hero_title} onChange={e => setSiteContent({...siteContent, hero_title: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">وصف المكتب (Description)</label>
                    <textarea rows={3} value={siteContent.hero_description} onChange={e => setSiteContent({...siteContent, hero_description: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none resize-none" />
                  </div>
                </div>

                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><h3 className="text-xl font-bold text-gold-500">مميزات إنجاز الأربعة</h3></div>
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="bg-charcoal-950 p-4 rounded-xl border border-charcoal-800 space-y-3">
                      <h4 className="font-bold">الميزة {num}</h4>
                      <input type="text" value={(siteContent as any)[`feature${num}_title`]} onChange={e => setSiteContent({...siteContent, [`feature${num}_title`]: e.target.value})} className="w-full bg-charcoal-900 border border-charcoal-800 p-2 rounded outline-none text-sm" placeholder="عنوان الميزة" />
                      <textarea rows={2} value={(siteContent as any)[`feature${num}_desc`]} onChange={e => setSiteContent({...siteContent, [`feature${num}_desc`]: e.target.value})} className="w-full bg-charcoal-900 border border-charcoal-800 p-2 rounded outline-none text-sm resize-none" placeholder="وصف الميزة" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: CONTACT */}
          {activeTab === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">إدارة بيانات التواصل</h1>
                <button 
                  onClick={async () => {
                    setSettingsSaving(true);
                    const { error } = await supabase.from('settings').upsert({ id: 'contact_data', value: contactData }, { onConflict: 'id' });
                    if (error) localStorage.setItem('contact_data', JSON.stringify(contactData));
                    setSettingsSaving(false); alert('تم الحفظ!');
                  }}
                  disabled={settingsSaving}
                  className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  {settingsSaving ? <Loader2 className="animate-spin h-5 w-5" /> : 'حفظ التغييرات'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">رقم الهاتف العام</label>
                    <input type="text" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none font-mono text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">رقم الواتساب (بالكود الدولي دون +)</label>
                    <input type="text" value={contactData.whatsapp} onChange={e => setContactData({...contactData, whatsapp: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none font-mono text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">البريد الإلكتروني</label>
                    <input type="email" value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none font-mono text-left" dir="ltr" />
                  </div>
                </div>

                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">العنوان التفصيلي</label>
                    <input type="text" value={contactData.address} onChange={e => setContactData({...contactData, address: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">رابط صفحة فيسبوك</label>
                    <input type="url" value={contactData.facebook} onChange={e => setContactData({...contactData, facebook: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none font-mono text-left" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">مواعيد العمل (كل سطر بيوم)</label>
                    <textarea rows={4} value={contactData.working_hours} onChange={e => setContactData({...contactData, working_hours: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none resize-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: CLIENTS */}
          {activeTab === 'clients' && (
            <motion.div key="clients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-8">إدارة الموكلين</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl h-fit">
                  <h2 className="text-xl font-bold mb-4">إضافة موكل جديد</h2>
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <input required type="text" placeholder="الاسم الكامل" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="text" placeholder="الرقم القومي" value={clientForm.national_id} onChange={e => setClientForm({...clientForm, national_id: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="text" placeholder="رقم الهاتف" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input type="email" placeholder="البريد الإلكتروني (اختياري)" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <textarea placeholder="العنوان التفصيلي" rows={2} value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none resize-none" />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 p-3 rounded-lg font-bold flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'حفظ الموكل'}</button>
                  </form>
                </div>
                <div className="lg:col-span-2 overflow-x-auto">
                  <table className="w-full text-right bg-charcoal-900 border border-charcoal-800 rounded-2xl">
                    <thead className="text-slate-400 border-b border-charcoal-800">
                      <tr>
                        <th className="p-4">الاسم</th>
                        <th className="p-4">الهاتف</th>
                        <th className="p-4">الرقم القومي</th>
                        <th className="p-4">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {clients.map(c => (
                        <tr key={c.id}>
                          <td className="p-4 font-bold">{c.name}</td>
                          <td className="p-4">{c.phone}</td>
                          <td className="p-4 font-mono text-slate-400">{c.national_id}</td>
                          <td className="p-4">
                            <button onClick={() => deleteRecord('clients', c.id)} className="text-red-500 p-2"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    {/* Image Upload */}
                    <div className="flex flex-col items-center">
                      <label className="w-full cursor-pointer">
                        <div className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${lawyerImagePreview ? 'border-gold-500/50' : 'border-charcoal-800 hover:border-gold-500/30'}`}>
                          {lawyerImagePreview ? (
                            <img src={lawyerImagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-slate-500 mb-2" />
                              <span className="text-sm text-slate-400">اضغط لرفع صورة المحامي</span>
                              <span className="text-xs text-slate-500 mt-1">JPG, PNG (حد أقصى 5MB)</span>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.size > 5 * 1024 * 1024) { alert('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.'); return; }
                            setLawyerImage(file);
                            setLawyerImagePreview(URL.createObjectURL(file));
                          }
                        }} />
                      </label>
                      {lawyerImagePreview && (
                        <button type="button" onClick={() => { setLawyerImage(null); setLawyerImagePreview(''); }} className="text-red-400 text-xs mt-2 hover:text-red-300">إزالة الصورة</button>
                      )}
                    </div>
                    <input required type="text" placeholder="الاسم" value={lawyerForm.name} onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="text" placeholder="المسمى (مثال: محامي نقض)" value={lawyerForm.title} onChange={e => setLawyerForm({...lawyerForm, title: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input required type="number" placeholder="سنوات الخبرة" value={lawyerForm.experience_years} onChange={e => setLawyerForm({...lawyerForm, experience_years: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <textarea placeholder="نبذة عن المحامي" rows={3} value={lawyerForm.bio} onChange={e => setLawyerForm({...lawyerForm, bio: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none resize-none" />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 p-3 rounded-lg font-bold flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'حفظ'}</button>
                  </form>
                </div>
                <div className="lg:col-span-2 grid gap-4">
                  {lawyers.map(l => (
                    <div key={l.id} className="bg-charcoal-900 border border-charcoal-800 p-4 rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        {l.image_url ? (
                          <img src={l.image_url} alt={l.name} className="w-14 h-14 rounded-full object-cover border-2 border-gold-500/30" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-charcoal-800 flex items-center justify-center border-2 border-charcoal-800">
                            <Users size={24} className="text-slate-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{l.name} <span className="text-sm font-normal text-gold-500 bg-gold-500/10 px-2 py-1 rounded ml-2">{l.title}</span></h3>
                          <p className="text-sm text-slate-400 mt-1">خبرة: {l.experience_years} سنوات</p>
                        </div>
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
                    
                    <div className="flex gap-2">
                      <select required value={caseForm.client_id} onChange={e => {
                        const client = clients.find(c => c.id === e.target.value);
                        setCaseForm({...caseForm, client_id: e.target.value, client_name: client ? client.name : ''});
                      }} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none">
                        <option value="">اختر الموكل...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.national_id})</option>)}
                      </select>
                    </div>

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
          {/* TAB: SESSIONS */}
          {activeTab === 'sessions' && (
            <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-8">أجندة الجلسات</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-2xl h-fit">
                  <h2 className="text-xl font-bold mb-4">إضافة جلسة جديدة</h2>
                  <form onSubmit={handleAddSession} className="space-y-4">
                    <select required value={sessionForm.case_id} onChange={e => setSessionForm({...sessionForm, case_id: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none">
                      <option value="">اختر القضية...</option>
                      {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>)}
                    </select>
                    <input required type="date" value={sessionForm.session_date} onChange={e => setSessionForm({...sessionForm, session_date: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none text-white color-scheme-dark" style={{ colorScheme: 'dark' }} />
                    <input type="text" placeholder="اسم المحكمة / الدائرة" value={sessionForm.court_name} onChange={e => setSessionForm({...sessionForm, court_name: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none" />
                    <input type="text" placeholder="رقم الرول" value={sessionForm.roll_number} onChange={e => setSessionForm({...sessionForm, roll_number: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none font-mono text-left" dir="ltr" />
                    <textarea placeholder="المطلوب في الجلسة (مذكرات، حضور الخصم، إلخ)" rows={3} value={sessionForm.requirements} onChange={e => setSessionForm({...sessionForm, requirements: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg outline-none resize-none" />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 p-3 rounded-lg font-bold flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'حفظ الجلسة'}</button>
                  </form>
                </div>
                <div className="lg:col-span-2 overflow-x-auto">
                  <table className="w-full text-right bg-charcoal-900 border border-charcoal-800 rounded-2xl">
                    <thead className="text-slate-400 border-b border-charcoal-800">
                      <tr>
                        <th className="p-4">التاريخ والرول</th>
                        <th className="p-4">القضية والمحكمة</th>
                        <th className="p-4">المطلوب</th>
                        <th className="p-4">القرار</th>
                        <th className="p-4">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sessions.map(s => (
                        <tr key={s.id} className={new Date(s.session_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'opacity-50 grayscale' : ''}>
                          <td className="p-4 font-mono">
                            <span className="text-gold-500">{new Date(s.session_date).toLocaleDateString('ar-EG')}</span>
                            {s.roll_number && <><br/><span className="text-slate-400 text-sm">رول: {s.roll_number}</span></>}
                          </td>
                          <td className="p-4 font-bold">
                            {s.cases?.case_number}
                            <br/><span className="text-sm font-normal text-slate-400">{s.court_name}</span>
                          </td>
                          <td className="p-4 text-sm text-slate-300">{s.requirements}</td>
                          <td className="p-4">
                            <input 
                              type="text" 
                              placeholder="القرار..." 
                              defaultValue={s.decision || ''} 
                              onBlur={async (e) => {
                                await supabase.from('sessions').update({ decision: e.target.value }).eq('id', s.id);
                              }}
                              className="bg-charcoal-950 border border-slate-700 p-2 rounded text-sm outline-none w-full"
                            />
                          </td>
                          <td className="p-4">
                            <button onClick={() => deleteRecord('sessions', s.id)} className="text-red-500 p-2"><Trash2 size={18}/></button>
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

          {/* TAB: PRICING */}
          {activeTab === 'pricing' && (
            <motion.div key="pricing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-8">إدارة أسعار الاستشارات</h1>
              <p className="text-slate-400 mb-8">حدد سعر الاستشارة حسب نوع اللقاء والتخصص القانوني. هذه الأسعار ستظهر تلقائياً للعملاء في نموذج الحجز.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Call Prices */}
                <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal-800">
                    <div className="bg-blue-500/10 p-2 rounded-lg"><Calendar className="text-blue-400 h-5 w-5" /></div>
                    <h3 className="text-lg font-bold text-white">فيديو كول / مكالمة</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">استشارة عادية (ج.م)</label>
                      <input type="number" value={prices.video_default} onChange={e => setPrices({...prices, video_default: Number(e.target.value)})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-gold-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">استشارة تجارية (ج.م)</label>
                      <input type="number" value={prices.video_commercial} onChange={e => setPrices({...prices, video_commercial: Number(e.target.value)})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-gold-500" />
                    </div>
                  </div>
                </div>

                {/* Phone Call Prices */}
                <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal-800">
                    <div className="bg-emerald-500/10 p-2 rounded-lg"><Briefcase className="text-emerald-400 h-5 w-5" /></div>
                    <h3 className="text-lg font-bold text-white">مكالمة هاتفية</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">استشارة عادية (ج.م)</label>
                      <input type="number" value={prices.phone_default} onChange={e => setPrices({...prices, phone_default: Number(e.target.value)})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-gold-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">استشارة تجارية (ج.م)</label>
                      <input type="number" value={prices.phone_commercial} onChange={e => setPrices({...prices, phone_commercial: Number(e.target.value)})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-gold-500" />
                    </div>
                  </div>
                </div>

                {/* Office Visit Prices */}
                <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal-800">
                    <div className="bg-gold-500/10 p-2 rounded-lg"><DollarSign className="text-gold-500 h-5 w-5" /></div>
                    <h3 className="text-lg font-bold text-white">حضور لمقر المكتب</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">استشارة عادية (ج.م)</label>
                      <input type="number" value={prices.office_default} onChange={e => setPrices({...prices, office_default: Number(e.target.value)})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-gold-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">استشارة تجارية (ج.م)</label>
                      <input type="number" value={prices.office_commercial} onChange={e => setPrices({...prices, office_commercial: Number(e.target.value)})} className="w-full bg-charcoal-950 border border-charcoal-800 p-3 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-gold-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button 
                  onClick={async () => {
                    setPriceSaving(true);
                    // Save prices to Supabase settings table
                    const { error } = await supabase.from('settings').upsert({ id: 'consultation_prices', value: prices }, { onConflict: 'id' });
                    if (error) {
                      console.error(error);
                      // Fallback: save to localStorage
                      localStorage.setItem('consultation_prices', JSON.stringify(prices));
                    }
                    setPriceSaving(false);
                    setPriceSaved(true);
                    setTimeout(() => setPriceSaved(false), 3000);
                  }}
                  disabled={priceSaving}
                  className="bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 px-8 py-3 rounded-lg font-bold transition shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center gap-2"
                >
                  {priceSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  حفظ الأسعار
                </button>
                {priceSaved && <span className="text-emerald-400 font-medium">✓ تم حفظ الأسعار بنجاح!</span>}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
