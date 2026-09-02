"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Scale, FileText, PhoneCall, CheckCircle, Clock, MapPin, Mail, Upload, Printer, Calendar, Users, Download, ArrowLeft, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [consultationType, setConsultationType] = useState('جنائي');
  const [meetingType, setMeetingType] = useState('فيديو كول');
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    fetchLawyers();
    fetchResources();
  }, []);

  async function fetchLawyers() {
    try {
      const { data, error } = await supabase.from('lawyers').select('*');
      if (error) throw error;
      if (data) setLawyers(data);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchResources() {
    try {
      const { data, error } = await supabase.from('resources').select('*');
      if (error) throw error;
      if (data) setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let price = 500;
      if (meetingType === 'زيارة المكتب') price = 1000;
      if (consultationType === 'تجاري') price += 500;

      const { data, error } = await supabase.from('consultations').insert([
        {
          client_name: clientName,
          client_phone: clientPhone,
          consultation_type: consultationType,
          meeting_type: meetingType,
          lawyer_id: selectedLawyer || null,
          booking_date: bookingDate,
          booking_time: bookingTime,
          price: price,
        }
      ]);
      if (error) throw error;
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 5000);
      
      setClientName('');
      setClientPhone('');
      setBookingDate('');
      setBookingTime('');
    } catch (error) {
      console.error('Booking error:', error);
      alert('حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      
      // File Upload Security
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('عذراً، لأسباب أمنية يُسمح فقط برفع ملفات PDF أو الصور (JPG, PNG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب ألا يتجاوز 5 ميجابايت.');
        return;
      }

      setUploadingFile(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage.from('case-files').upload(filePath, file);

      if (uploadError) throw uploadError;
      
      setUploadSuccess('تم رفع الملف بنجاح! سيتم إرفاقه بملفك.');
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('حدث خطأ أثناء الرفع.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-charcoal-950 text-slate-200">
      
      {/* Navigation */}
      <header className="bg-charcoal-900/80 backdrop-blur-md border-b border-gold-500/10 text-white sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex items-center gap-3 group cursor-pointer">
              <img src="/logo.jpg" alt="ENGAZ Logo" className="h-12 w-12 rounded-full border border-gold-500/30 object-cover shadow-[0_0_10px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all" />
              <span className="font-bold text-2xl tracking-tight text-white uppercase group-hover:text-gold-400 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.8)] transition-all duration-300" style={{ letterSpacing: '2px' }}>ENGAZ</span>
              <span className="hidden sm:inline-block text-sm text-gold-400 font-light tracking-widest uppercase ml-2 border-l border-gold-500/30 pl-2">Law Firm</span>
            </a>
            <nav className="hidden md:flex gap-8 items-center mr-auto ml-8">
              <a href="#about" className="text-sm font-medium hover:text-gold-400 transition-colors">عن المكتب</a>
              <a href="#services" className="text-sm font-medium hover:text-gold-400 transition-colors">الخدمات</a>
              <a href="#booking" className="text-sm font-medium hover:text-gold-400 transition-colors">الاستشارات</a>
              <a href="#team" className="text-sm font-medium hover:text-gold-400 transition-colors">فريق المحامين</a>
              <a href="#resources" className="text-sm font-medium hover:text-gold-400 transition-colors">العقود</a>
            </nav>
            <div className="flex items-center gap-4">
              <a href="/client" className="hidden lg:flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors">
                <Users className="h-4 w-4" /> بوابة الموكلين
              </a>
              <a href="#booking" className="bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 px-6 py-2 rounded font-bold transition shadow-[0_0_15px_rgba(212,175,55,0.3)] whitespace-nowrap">
                احجز استشارة
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden print:hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-charcoal-950">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[150px] mix-blend-screen" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-500/30 bg-gold-500/5 text-gold-400 text-sm font-medium mb-8">
              <Shield className="h-4 w-4" />
              <span>خبرة قانونية تتجاوز التوقعات</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.2] text-white">
              شريكك القانوني <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600">
                الموثوق
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
              نقدم لك استشارة مبنية على الصدق، السرية، والدقة القانونية. التزام كامل ومتابعة حقيقية لقضاياك لأن القانون ليس مجرد نصوص، بل مسؤولية.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#booking" className="w-full sm:w-auto bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 px-8 py-4 rounded-md font-bold text-lg transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Calendar className="h-5 w-5" /> حجز استشارة فورية
              </a>
              <a href="#services" className="w-full sm:w-auto bg-transparent border border-slate-600 hover:border-gold-500 hover:text-gold-400 text-slate-300 px-8 py-4 rounded-md font-medium text-lg transition flex items-center justify-center gap-2">
                تصفح تخصصاتنا <ArrowLeft className="h-5 w-5 rtl:-scale-x-100" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-gold-500/50">
          <ChevronDown className="h-8 w-8" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-charcoal-900 border-t border-b border-slate-800/50 print:hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-sm font-bold text-gold-500 uppercase tracking-widest mb-2">مميزات إنجاز</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">لماذا تختار مؤسسة إنجاز؟</h3>
            <div className="h-1 w-20 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'سرية تامة', desc: 'التزام كامل بالسرية التامة لجميع بيانات وملفات عملائنا (Full confidentiality).' },
              { title: 'شرح مبسّط', desc: 'نقدم لك شرحاً قانونياً مبسّطاً يجعلك على دراية كاملة بموقفك القانوني.' },
              { title: 'متابعة حقيقية', desc: 'متابعة حقيقية ومستمرة للقضايا لضمان عدم تفويت أي فرصة لصالحك.' },
              { title: 'اهتمام بالتفاصيل', desc: 'ندرس كل ملف بدقة متناهية لأننا نؤمن أن كسب القضايا يبدأ من دراسة التفاصيل.' }
            ].map((service, index) => (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} key={index} className="bg-charcoal-950 border border-slate-800/80 rounded-xl p-8 hover:border-gold-500/50 transition-colors group">
                <div className="bg-charcoal-900 w-14 h-14 rounded-lg flex items-center justify-center mb-6 border border-slate-800 group-hover:border-gold-500/30 transition-colors">
                  <CheckCircle className="h-7 w-7 text-gold-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{service.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-16 bg-gradient-to-br from-charcoal-800 to-charcoal-950 border border-gold-500/20 rounded-2xl p-10 text-center flex flex-col items-center relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-[30px]" />
            <Upload className="h-10 w-10 text-gold-500 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">وفر وقتك وارفع مستنداتك مسبقاً</h3>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto font-light">
              يمكنك رفع أوراق قضيتك ومستنداتك هنا في بيئة مشفرة تماماً قبل زيارة المكتب. يتم حفظها في أرشيفنا الرقمي المؤمن بأعلى درجات السرية.
            </p>
            <label className="bg-charcoal-900 border border-gold-500/30 hover:border-gold-500 text-gold-400 px-8 py-3 rounded text-sm font-medium transition cursor-pointer flex items-center gap-2 hover:bg-gold-500/10">
              {uploadingFile ? <Loader2 className="animate-spin h-5 w-5" /> : 'اختر الملفات لرفعها'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
            </label>
            {uploadSuccess && <p className="text-green-400 mt-4 text-sm font-medium">{uploadSuccess}</p>}
          </motion.div>
        </div>
      </section>

      {/* Online Consultation Booking Flow */}
      <section id="booking" className="py-24 bg-charcoal-950 text-white print:hidden relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-gold-500 uppercase tracking-widest mb-2">استشارات عبر الإنترنت</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">حجز موعد استشارة</h3>
            <div className="h-1 w-20 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded"></div>
          </div>

          {bookingSuccess ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-charcoal-900 border border-emerald-500/30 rounded-2xl p-12 text-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">تم تسجيل طلب الاستشارة بنجاح</h3>
              <p className="text-slate-400">سيتواصل معك فريق المكتب في أقرب وقت لتأكيد الموعد وترتيب الإجراءات.</p>
            </motion.div>
          ) : (
            <motion.form initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} onSubmit={handleBookingSubmit} className="bg-charcoal-900/50 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">الاسم بالكامل</label>
                  <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-charcoal-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="أدخل اسمك الكريم" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">رقم الهاتف</label>
                  <input required type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-charcoal-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="رقم الموبايل للتواصل" />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">التخصص القانوني</label>
                  <select value={consultationType} onChange={e => setConsultationType(e.target.value)} className="w-full bg-charcoal-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none">
                    <option>جنائي</option>
                    <option>تجاري</option>
                    <option>أحوال شخصية</option>
                    <option>مدني</option>
                    <option>أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">آلية اللقاء</label>
                  <select value={meetingType} onChange={e => setMeetingType(e.target.value)} className="w-full bg-charcoal-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none">
                    <option>فيديو كول (Zoom/Meet)</option>
                    <option>مكالمة هاتفية</option>
                    <option>حضور لمقر المكتب</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">تحديد المحامي (اختياري)</label>
                  <select value={selectedLawyer} onChange={e => setSelectedLawyer(e.target.value)} className="w-full bg-charcoal-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none">
                    <option value="">(بدون تفضيل - سيتم تعيين المحامي الأنسب)</option>
                    {lawyers.map(l => (
                      <option key={l.id} value={l.id}>{l.name} - {l.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">تاريخ الاستشارة</label>
                    <input required type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full bg-charcoal-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">الوقت المفضل</label>
                    <input required type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full bg-charcoal-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">رسوم الاستشارة (تقديرية)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gold-500">
                      {meetingType === 'حضور لمقر المكتب' ? (consultationType === 'تجاري' ? '1500' : '1000') : (consultationType === 'تجاري' ? '1000' : '500')}
                    </span>
                    <span className="text-gold-500/60 font-medium">ج.م</span>
                  </div>
                </div>
                <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 px-10 py-4 rounded font-bold transition shadow-[0_0_15px_rgba(212,175,55,0.2)] text-lg">
                  تأكيد الحجز والدفع
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </section>

      {/* Lawyers Team Section */}
      <section id="team" className="py-24 bg-charcoal-900 print:hidden relative border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-gold-500 uppercase tracking-widest mb-2">النخبة</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">فريق إنجاز القانوني</h3>
            <div className="h-1 w-20 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold-500 h-8 w-8" /></div>
          ) : lawyers.length === 0 ? (
            <div className="text-center text-slate-500 py-10">سيتم إضافة ملفات المحامين قريباً.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lawyers.map((lawyer, idx) => (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} key={lawyer.id} className="bg-charcoal-950 rounded-xl overflow-hidden border border-slate-800/80 hover:border-gold-500/50 transition-colors group">
                  <div className="h-56 bg-charcoal-800 relative border-b border-slate-800 group-hover:border-gold-500/30 transition-colors">
                    {/* Placeholder image style */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                      <Users className="h-16 w-16 mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-widest text-slate-500">Lawyer Profile</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-white mb-1">{lawyer.name}</h3>
                    <p className="text-gold-500 font-medium text-sm mb-4">{lawyer.title}</p>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{lawyer.bio || 'محامي متخصص يتمتع برؤية استراتيجية وخبرة واسعة في إدارة النزاعات المعقدة وتقديم استشارات قانونية دقيقة لحماية مصالح الموكلين.'}</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-5 border-t border-slate-800/80 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> خبرة {lawyer.experience_years} عاماً</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Printable Contracts & Resources */}
      <section id="resources" className="py-24 bg-charcoal-950 relative border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 print:hidden">
            <h2 className="text-sm font-bold text-gold-500 uppercase tracking-widest mb-2">الخدمة الرقمية</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">المكتبة القانونية والعقود</h3>
            <div className="h-1 w-20 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded"></div>
            <p className="mt-6 text-slate-400 max-w-2xl mx-auto">نماذج قانونية معتمدة جاهزة للطباعة الفورية. مصممة لتسهيل الإجراءات في المحاكم والهيئات الرسمية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
            {resources.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-charcoal-900 border border-slate-800 rounded-xl">
                <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">جاري تحديث المكتبة القانونية.</p>
              </div>
            ) : (
              resources.map((resource, idx) => (
                <motion.div initial={{ opacity: 0, x: idx % 2 === 0 ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} key={resource.id} className="border border-slate-800 bg-charcoal-900/30 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold-500/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-charcoal-800 p-3 rounded-lg border border-slate-700">
                      <FileText className="h-6 w-6 text-gold-500 flex-shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{resource.title}</h4>
                      <p className="text-xs text-gold-500/70 uppercase tracking-wider">{resource.type === 'template' ? 'نموذج عقد رسمي' : 'مقال / بحث قانوني'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    {resource.file_url && (
                      <a href={resource.file_url} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none text-center bg-charcoal-800 hover:bg-charcoal-700 border border-slate-700 text-white px-4 py-2 rounded text-sm transition font-medium">
                        تحميل
                      </a>
                    )}
                    <button onClick={handlePrint} className="flex-1 sm:flex-none bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 px-4 py-2 rounded text-sm transition flex items-center justify-center gap-2 font-medium">
                      <Printer className="h-4 w-4" /> طباعة
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* This section only appears when printing window.print() */}
          <div className="hidden print:block font-serif text-black leading-relaxed bg-white h-screen p-10">
            <div className="text-center mb-10 border-b-2 border-black pb-6">
              <h1 className="text-4xl font-bold mb-2">مؤسسة إنجاز للمحاماة</h1>
              <p className="text-xl tracking-widest uppercase">ENGAZ Law Firm</p>
            </div>
            <div className="text-justify mb-8 text-lg">
              <h2 className="text-2xl font-bold mb-6 text-center underline">نموذج مستند قانوني معتمد</h2>
              <p className="leading-loose">
                هذا المستند تم استخراجه وطباعته مباشرة من المنظومة الرقمية لمؤسسة إنجاز للمحاماة وهو جاهز للاستخدام وتقديمه بشكل رسمي للجهات المختصة.
                (هذه المساحة مخصصة لطباعة نصوص العقود والعرائض التي يتم جلبها من قاعدة البيانات للحفاظ على التنسيق النموذجي للورقة A4).
              </p>
              <br/><br/><br/><br/>
              <div className="flex justify-between mt-32 px-10">
                <div className="text-center">
                  <p className="font-bold mb-8">الطرف الأول (المقر بما فيه)</p>
                  <p>.......................................</p>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-8">الطرف الثاني (القابل لذلك)</p>
                  <p>.......................................</p>
                </div>
              </div>
            </div>
            <div className="fixed bottom-10 left-0 w-full text-xs text-gray-500 text-center border-t border-gray-300 pt-4">
              وثيقة صادرة إلكترونياً من نظام إدارة القضايا - ENGAZ Law Firm | www.engazlawfirm.com
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Footer Section */}
      <footer id="contact" className="bg-charcoal-900 border-t border-gold-500/20 pt-20 pb-10 print:hidden relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute bottom-0 center-0 w-full h-1/2 bg-gold-500/5 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="h-8 w-8 text-gold-500" />
                <span className="font-bold text-3xl tracking-tight text-white uppercase" style={{ letterSpacing: '2px' }}>ENGAZ</span>
              </div>
              <p className="text-slate-400 mb-8 max-w-md leading-relaxed font-light">
                شريكك القانوني الموثوق، نقدم استشارات مبنية على الصدق، السرية، والدقة القانونية لحماية مصالحك.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61586711903589" target="_blank" rel="noreferrer" className="bg-charcoal-800 border border-slate-700 hover:border-gold-500 p-3 rounded-full text-slate-300 hover:text-gold-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider">تواصل مباشر</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-400">
                  <PhoneCall className="h-5 w-5 text-gold-500 flex-shrink-0 mt-0.5" />
                  <a href="tel:+201035849900" dir="ltr" className="font-mono text-sm hover:text-gold-400 transition-colors">+20 10 35849900</a>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <Mail className="h-5 w-5 text-gold-500 flex-shrink-0 mt-0.5" />
                  <a href="mailto:info@engazlawfirm.com" className="text-sm font-mono text-slate-300 hover:text-gold-400 transition-colors">info@engazlawfirm.com</a>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <MapPin className="h-5 w-5 text-gold-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">شارع النصر الرئيسي، بجوار مستشفى كليوباترا<br/>الغردقة، البحر الأحمر، مصر</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider">مواعيد العمل</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>السبت - الأربعاء</span>
                  <span className="font-mono text-gold-400">09:00 - 17:00</span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>الخميس</span>
                  <span className="font-mono text-gold-400">09:00 - 14:00</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span>الجمعة</span>
                  <span className="text-red-400/80">مغلق</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} ENGAZ Law Firm. جميع الحقوق محفوظة لـ مؤسسة إنجاز للمحاماة.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gold-400 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-gold-400 transition-colors">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/201035849900" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1ebd5b] text-white p-4 rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-1"
        aria-label="تواصل معنا عبر واتساب"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
