"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Scale, FileText, PhoneCall, CheckCircle, Clock, MapPin, Mail, Upload, Printer, Calendar, Users, Download } from 'lucide-react';
import Image from 'next/image';

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
      let price = 500; // Base price
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
      
      // Reset form
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
      setUploadingFile(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('case-files')
        .upload(filePath, file);

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* Header & Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-amber-500" />
              <span className="font-bold text-2xl tracking-tight">ENGAZ Law Firm</span>
            </div>
            <nav className="hidden md:flex space-x-8 space-x-reverse">
              <a href="#about" className="hover:text-amber-500 transition">عن المكتب</a>
              <a href="#services" className="hover:text-amber-500 transition">الخدمات</a>
              <a href="#booking" className="hover:text-amber-500 transition">الاستشارات</a>
              <a href="#team" className="hover:text-amber-500 transition">فريق المحامين</a>
              <a href="#resources" className="hover:text-amber-500 transition">العقود والمقالات</a>
              <a href="#contact" className="hover:text-amber-500 transition">اتصل بنا</a>
            </nav>
            <div>
              <a href="#booking" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md font-medium transition shadow-lg">
                احجز استشارة فورية
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-slate-800 text-white print:hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* A dark overlay over a subtle background pattern */}
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <Shield className="h-16 w-16 text-amber-500 mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            حمايتك القانونية هي <span className="text-amber-500">مهمتنا الأولى</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10">
            مؤسسة إنجاز للمحاماة والاستشارات القانونية. خبرة تمتد لسنوات في مختلف المجالات القانونية لضمان حقوقك وحل أعقد القضايا بكفاءة وسرية تامة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#booking" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-md font-bold text-lg transition shadow-lg flex items-center justify-center gap-2">
              <PhoneCall className="h-5 w-5" /> ابدأ استشارتك الآن
            </a>
            <a href="#services" className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-md font-bold text-lg transition flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" /> تعرف على خدماتنا
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">التخصصات القانونية</h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto rounded"></div>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">نقدم مجموعة شاملة من الخدمات القانونية متضمنة التمثيل أمام المحاكم والاستشارات في شتى فروع القانون.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'القضاء الجنائي', desc: 'دفاع جنائي متمرس في القضايا الجنائية والجنح بجميع درجات التقاضي.' },
              { title: 'القانون التجاري والشركات', desc: 'تأسيس شركات، صياغة عقود تجارية، وحل النزاعات التجارية للشركات.' },
              { title: 'الأحوال الشخصية', desc: 'قضايا الأسرة، المواريث، وكل ما يتعلق بالأحوال الشخصية بسرية تامة.' },
              { title: 'القضاء المدني', desc: 'التعويضات، المنازعات العقارية، وصياغة وتوثيق العقود المدنية.' }
            ].map((service, index) => (
              <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-6 hover:shadow-lg transition">
                <CheckCircle className="h-10 w-10 text-amber-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 mb-6">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-blue-50 border border-blue-100 rounded-xl p-8 text-center flex flex-col items-center">
            <Upload className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">وفر وقتك وارفع مستنداتك مسبقاً</h3>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              يمكنك رفع أوراق قضيتك وصور المستندات هنا قبل زيارة المكتب. يتم حفظها في قاعدة بياناتنا المشفرة بأعلى درجات الأمان.
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition cursor-pointer flex items-center gap-2">
              {uploadingFile ? 'جاري الرفع...' : 'اختر الملفات لرفعها'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
            </label>
            {uploadSuccess && <p className="text-green-600 mt-4 font-medium">{uploadSuccess}</p>}
          </div>
        </div>
      </section>

      {/* Online Consultation Booking Flow */}
      <section id="booking" className="py-20 bg-slate-900 text-white print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">احجز استشارتك الأونلاين</h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto rounded"></div>
            <p className="mt-4 text-slate-300">حدد نوع الاستشارة، اختر المحامي الأنسب، وحدد الموعد الذي يناسبك.</p>
          </div>

          {bookingSuccess ? (
            <div className="bg-green-800/30 border border-green-500 rounded-xl p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">تم استلام طلب الحجز بنجاح!</h3>
              <p className="text-green-100">سيتواصل معك فريقنا لتأكيد الموعد وإتمام الدفع.</p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الاسم بالكامل</label>
                  <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="أدخل اسمك" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">رقم الهاتف</label>
                  <input required type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="رقم الموبايل للتواصل" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">نوع الاستشارة</label>
                  <select value={consultationType} onChange={e => setConsultationType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>جنائي</option>
                    <option>تجاري</option>
                    <option>أحوال شخصية</option>
                    <option>مدني</option>
                    <option>أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">طريقة اللقاء</label>
                  <select value={meetingType} onChange={e => setMeetingType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>فيديو كول</option>
                    <option>مكالمة صوتية</option>
                    <option>زيارة المكتب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">اختيار المحامي (اختياري)</label>
                  <select value={selectedLawyer} onChange={e => setSelectedLawyer(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">أي محامي متاح</option>
                    {lawyers.map(l => (
                      <option key={l.id} value={l.id}>{l.name} - {l.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">التاريخ</label>
                    <input required type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">الوقت</label>
                    <input required type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <p className="text-slate-400 text-sm mb-1">التكلفة التقديرية للاستشارة:</p>
                  <p className="text-3xl font-bold text-amber-500">
                    {meetingType === 'زيارة المكتب' ? (consultationType === 'تجاري' ? '1500' : '1000') : (consultationType === 'تجاري' ? '1000' : '500')} ج.م
                  </p>
                </div>
                <button type="submit" className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-md font-bold text-lg transition">
                  تأكيد الحجز والدفع
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Lawyers Team Section */}
      <section id="team" className="py-20 bg-slate-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">فريق المحامين</h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto rounded"></div>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">نخبة من أفضل المحامين والمستشارين القانونيين ذوي الخبرة الواسعة.</p>
          </div>

          {loading ? (
            <div className="text-center text-slate-500">جاري تحميل البيانات...</div>
          ) : lawyers.length === 0 ? (
            <div className="text-center text-slate-500">سيتم إضافة فريق المحامين قريباً.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lawyers.map(lawyer => (
                <div key={lawyer.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
                  <div className="h-48 bg-slate-200 relative">
                    {/* Placeholder for lawyer image */}
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <Users className="h-16 w-16" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{lawyer.name}</h3>
                    <p className="text-amber-600 font-medium text-sm mb-3">{lawyer.title}</p>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{lawyer.bio || 'محامي متخصص ذو خبرة وكفاءة عالية في مجال تخصصه.'}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> خبرة {lawyer.experience_years} سنوات</span>
                      <span className="flex items-center gap-1 text-yellow-500">⭐ {lawyer.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Printable Contracts & Resources */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 print:hidden">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">العقود والمقالات (جاهزة للطباعة)</h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto rounded"></div>
            <p className="mt-4 text-slate-600">نماذج عقود قانونية جاهزة للتحميل والطباعة مباشرة من المتصفح للاستخدام في المحكمة أو المكتب.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
            {resources.length === 0 ? (
              <div className="col-span-full text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">لا توجد مستندات متاحة حالياً.</p>
              </div>
            ) : (
              resources.map(resource => (
                <div key={resource.id} className="border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">{resource.title}</h4>
                      <p className="text-sm text-slate-500">{resource.type === 'template' ? 'نموذج عقد' : 'مقال قانوني'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {resource.file_url && (
                      <a href={resource.file_url} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none text-center bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-md font-medium text-sm transition">
                        تحميل
                      </a>
                    )}
                    <button onClick={handlePrint} className="flex-1 sm:flex-none bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-2">
                      <Printer className="h-4 w-4" /> طباعة
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* This section only appears when printing window.print() */}
          <div className="hidden print:block font-serif text-black leading-relaxed">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-bold">مؤسسة إنجاز للمحاماة</h1>
              <p className="text-lg">ENGAZ Law Firm</p>
            </div>
            <div className="text-justify mb-8">
              <h2 className="text-2xl font-bold mb-4">نموذج مستند قانوني</h2>
              <p>
                هذا المستند تم طباعته مباشرة من نظام مؤسسة إنجاز للمحاماة وهو جاهز لتقديمه رسمياً.
                (هذا مجرد نص تجريبي يظهر عند الطباعة لضمان التنسيق النظيف للورقة A4).
              </p>
              <br/><br/><br/><br/>
              <div className="flex justify-between mt-20">
                <div className="text-center">
                  <p className="font-bold">توقيع الطرف الأول</p>
                  <p>......................</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">توقيع الطرف الثاني</p>
                  <p>......................</p>
                </div>
              </div>
            </div>
            <div className="mt-12 text-sm text-gray-500 text-center border-t border-gray-300 pt-4 opacity-50">
              وثيقة صادرة من نظام ENGAZ Law Firm
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">تواصل معنا</h2>
              <p className="text-slate-300 mb-8 max-w-md">نسعد باستقبال استفساراتكم وترتيب المواعيد من خلال قنوات التواصل الرسمية للمكتب.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">مقر المكتب</h4>
                    <p className="text-slate-400">القاهرة، مصر (العنوان التفصيلي)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">مواعيد العمل</h4>
                    <p className="text-slate-400">السبت إلى الخميس: 9:00 صباحاً - 5:00 مساءً</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <PhoneCall className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">أرقام الهواتف</h4>
                    <p className="text-slate-400">+20 100 000 0000</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">البريد الإلكتروني</h4>
                    <p className="text-slate-400">info@engazlawfirm.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a href="https://www.facebook.com/profile.php?id=61586711903589" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                  تابعنا على فيسبوك
                </a>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl overflow-hidden h-96 flex items-center justify-center border border-slate-700">
              {/* Interactive map placeholder */}
              <div className="text-center text-slate-400 p-6">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>مكان الخريطة التفاعلية (Google Maps)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-900 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Scale className="h-6 w-6 text-amber-500" />
            <span className="font-bold text-lg tracking-tight">ENGAZ Law Firm</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} مؤسسة إنجاز للمحاماة. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
