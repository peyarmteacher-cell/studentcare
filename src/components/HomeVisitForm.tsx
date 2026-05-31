/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  MapPin, 
  Camera, 
  ArrowLeft, 
  Save, 
  Info, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  HomeVisitRecord, 
  RoofMaterial, 
  WallMaterial, 
  ToiletStatus, 
  WaterSource, 
  ElectricityStatus, 
  VehicleOwnership, 
  LandStatus, 
  FamilyMember,
  PovertyStatus
} from '../types';
import { 
  calculateIncomePerCapita, 
  calculatePovertyIndex 
} from '../data';

interface HomeVisitFormProps {
  initialRecord?: HomeVisitRecord | null;
  onSave: (record: HomeVisitRecord) => void;
  onCancel: () => void;
}

export default function HomeVisitForm({ initialRecord, onSave, onCancel }: HomeVisitFormProps) {
  const [step, setStep] = useState<number>(1);
  
  // สร้างค่าเริ่มต้น
  const [studentPrefix, setStudentPrefix] = useState<'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว'>('เด็กชาย');
  const [studentName, setStudentName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [grade, setGrade] = useState('ประถมศึกษาปีที่ 1/1');
  const [schoolYear, setSchoolYear] = useState('2569');
  const [birthDate, setBirthDate] = useState('2018-05-15');
  const [citizenId, setCitizenId] = useState('');
  const [schoolName, setSchoolName] = useState('โรงเรียนสุขเกษมศึกษา');

  // ครัวเรือนและการเดินทาง
  const [distanceToSchool, setDistanceToSchool] = useState<number>(5);
  const [travelMethod, setTravelMethod] = useState('เดินเท้า');
  const [travelCostPerDay, setTravelCostPerDay] = useState<number>(0);

  // สมาชิกครัวเรือน
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: 'student-self',
      relation: 'ตัวนักเรียน',
      age: 8,
      education: 'ป.1',
      occupation: 'นักเรียน',
      monthlyIncome: 0,
      disabilityOrChronicIllness: false,
      singleParentStatus: false
    }
  ]);

  // สภาพครัวเรือน
  const [roof, setRoof] = useState<RoofMaterial>(RoofMaterial.ZincGood);
  const [wall, setWall] = useState<WallMaterial>(WallMaterial.WoodGood);
  const [toilet, setToilet] = useState<ToiletStatus>(ToiletStatus.OwnGood);
  const [water, setWater] = useState<WaterSource>(WaterSource.PipedOrArtesian);
  const [electricity, setElectricity] = useState<ElectricityStatus>(ElectricityStatus.MeterOwn);
  const [vehicle, setVehicle] = useState<VehicleOwnership>(VehicleOwnership.MotorcycleOld);
  const [land, setLand] = useState<LandStatus>(LandStatus.None);
  
  // อุปกรณ์เครื่องใช้
  const [hasComputer, setHasComputer] = useState(false);
  const [hasRefrigerator, setHasRefrigerator] = useState(false);
  const [hasWashingMachine, setHasWashingMachine] = useState(false);
  const [hasAirConditioner, setHasAirConditioner] = useState(false);

  // พิกัด GPS
  const [lat, setLat] = useState<number>(14.1205);
  const [lng, setLng] = useState<number>(100.6140);

  // รูปภาพ
  const [frontImage, setFrontImage] = useState<string>('');
  const [insideImage, setInsideImage] = useState('');
  const [withStudentImage, setWithStudentImage] = useState('');

  // ความเห็นครูผู้เยี่ยมบ้านและพยาน
  const [teacherComment, setTeacherComment] = useState('');
  const [assistanceRequired, setAssistanceRequired] = useState<string[]>([]);
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split('T')[0]);
  const [evaluatorTeacherName, setEvaluatorTeacherName] = useState('');
  const [evaluatorTeacherPosition, setEvaluatorTeacherPosition] = useState('ครูประจำชั้น');
  const [villageHeadmanName, setVillageHeadmanName] = useState('');

  // โหลดเมื่อกรณีต้องการ Edit Record
  useEffect(() => {
    if (initialRecord) {
      setStudentPrefix(initialRecord.studentPrefix);
      setStudentName(initialRecord.studentName);
      setStudentLastName(initialRecord.studentLastName);
      setStudentCode(initialRecord.studentCode);
      setGrade(initialRecord.grade);
      setSchoolYear(initialRecord.schoolYear);
      setBirthDate(initialRecord.birthDate);
      setCitizenId(initialRecord.citizenId);
      setSchoolName(initialRecord.schoolName);
      setDistanceToSchool(initialRecord.distanceToSchool);
      setTravelMethod(initialRecord.travelMethod);
      setTravelCostPerDay(initialRecord.travelCostPerDay);
      setFamilyMembers(initialRecord.familyMembers);
      
      // สถานะครัวเรือน
      const cond = initialRecord.householdCondition;
      setRoof(cond.roof);
      setWall(cond.wall);
      setToilet(cond.toilet);
      setWater(cond.water);
      setElectricity(cond.electricity);
      setVehicle(cond.vehicle);
      setLand(cond.land);
      setHasComputer(cond.hasComputer);
      setHasRefrigerator(cond.hasRefrigerator);
      setHasWashingMachine(cond.hasWashingMachine);
      setHasAirConditioner(cond.hasAirConditioner);

      // พิกัด
      setLat(initialRecord.gps.lat);
      setLng(initialRecord.gps.lng);

      // รูปภาพ
      setFrontImage(initialRecord.photos.frontUrl);
      setInsideImage(initialRecord.photos.insideUrl);
      setWithStudentImage(initialRecord.photos.withStudentUrl);

      // คุณครูและพยาน
      setTeacherComment(initialRecord.teacherComment);
      setAssistanceRequired(initialRecord.assistanceRequired || []);
      setSurveyDate(initialRecord.surveyDate);
      setEvaluatorTeacherName(initialRecord.evaluatorTeacherName);
      setEvaluatorTeacherPosition(initialRecord.evaluatorTeacherPosition);
      setVillageHeadmanName(initialRecord.villageHeadmanName);
    }
  }, [initialRecord]);

  // สุ่มพิกัดที่ใกล้เคียงแถวนั้นเพื่อจำลองความรวดเร็ว
  const handleGenerateGPS = () => {
    const randomLat = 14.1200 + (Math.random() - 0.5) * 0.05;
    const randomLng = 100.6100 + (Math.random() - 0.5) * 0.05;
    setLat(randomLat);
    setLng(randomLng);
  };

  // จัดการการเข้ารหัสภาพถ่ายที่อัปโหลดเป็น Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'inside' | 'with_student') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'front') setFrontImage(reader.result);
          else if (type === 'inside') setInsideImage(reader.result);
          else if (type === 'with_student') setWithStudentImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // จัดการสมาชิกครอบครัว
  const handleAddFamilyMember = () => {
    const newMember: FamilyMember = {
      id: 'mem-' + Math.random().toString(36).substring(2, 9),
      relation: '',
      age: 30,
      education: 'ไม่ได้เรียนหนังสือ',
      occupation: '',
      monthlyIncome: 0,
      disabilityOrChronicIllness: false,
      singleParentStatus: false
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const handleUpdateFamilyMember = (id: string, field: keyof FamilyMember, val: any) => {
    const updated = familyMembers.map(m => {
      if (m.id === id) {
        return { ...m, [field]: val };
      }
      return m;
    });
    setFamilyMembers(updated);
  };

  const handleRemoveFamilyMember = (id: string) => {
    const current = familyMembers.filter(m => m.id !== id);
    if (current.length === 0) return;
    setFamilyMembers(current);
  };

  // แหล่งช่วยเหลือต้องการที่เลือก
  const toggleAssistance = (item: string) => {
    if (assistanceRequired.includes(item)) {
      setAssistanceRequired(assistanceRequired.filter(x => x !== item));
    } else {
      setAssistanceRequired([...assistanceRequired, item]);
    }
  };

  // คำนวณรายได้และดัชนีคัดกรองเบื้องต้น สังเกตการณ์บนแถบข้าง Form
  const tempCondition = {
    roof, wall, toilet, water, electricity, vehicle, land,
    hasComputer, hasRefrigerator, hasWashingMachine, hasAirConditioner
  };
  const incomePerCapita = calculateIncomePerCapita(familyMembers);
  const povertyAnalysis = calculatePovertyIndex(tempCondition);

  // ตรวจคำนวณสากล
  const estimatedPovertyStatus = 
    incomePerCapita <= 1500 && povertyAnalysis.percentage >= 45
      ? PovertyStatus.ExtremelyPoor
      : incomePerCapita <= 3000
      ? PovertyStatus.Poor
      : PovertyStatus.Normal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentLastName || !studentCode) {
      alert('กรุณากรอกข้อมูลพื้นฐานนักเรียน ให้ครบถ้วน!');
      setStep(1);
      return;
    }

    const payload: HomeVisitRecord = {
      id: initialRecord?.id || 'visit-' + Math.random().toString(36).substring(2, 9),
      studentId: initialRecord?.studentId || 'std-' + Math.random().toString(36).substring(2, 9),
      studentCode,
      studentPrefix,
      studentName,
      studentLastName,
      grade,
      schoolYear,
      birthDate,
      citizenId,
      schoolName,
      distanceToSchool,
      travelMethod,
      travelCostPerDay,
      familyMembers,
      householdCondition: tempCondition,
      gps: { lat, lng },
      photos: {
        frontUrl: frontImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
        insideUrl: insideImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
        withStudentUrl: withStudentImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
      },
      teacherComment,
      assistanceRequired,
      surveyDate,
      evaluatorTeacherName: evaluatorTeacherName || 'คุณครูหัวหน้าสายชั้น',
      evaluatorTeacherPosition,
      villageHeadmanName: villageHeadmanName || 'ผู้ใหญ่บ้าน / ตัวแทน อสม.'
    };

    onSave(payload);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* ฝั่งซ้าย: ข้อมูลสรุปไลฟ์อัปเดต คะแนนประเมิน กสศ.*/}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 sticky top-4 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5 border-b border-slate-150 pb-2">
          <Info className="w-4 h-4 text-emerald-600" />
          การคำนวณสิทธิ์ตามเกณฑ์ กสศ. Real-time
        </h3>

        <div className="space-y-4 text-xs">
          {/* ส่วนรายได้เฉลี่ย */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">รายได้สมาชิกรวมเฉลี่ย:</span>
            <div className="text-lg font-bold text-slate-800 tracking-tight font-mono">
              {incomePerCapita.toLocaleString()} บาท/คน/เดือน
            </div>
            <div className="mt-1 flex items-center gap-1">
              {incomePerCapita <= 1500 ? (
                <span className="text-red-600 font-semibold text-[11px] flex items-center gap-0.5">
                  <AlertCircle className="w-3.5 h-3.5" /> ผ่านเกณฑ์ยากจนพิเศษ (&le; 1,500)
                </span>
              ) : incomePerCapita <= 3000 ? (
                <span className="text-amber-600 font-semibold text-[11px] flex items-center gap-0.5">
                  <AlertCircle className="w-3.5 h-3.5" /> ผ่านเกณฑ์ยากจน (&le; 3,000)
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold text-[11px]">
                  &times; ไม่ตรงเกณฑ์ขัดสน (&gt; 3,000)
                </span>
              )}
            </div>
          </div>

          {/* แนบสภาพความแร้นแค้นบ้าน */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-slate-500 mb-1">
              <span>คะแนนดัชนีครัวเรือน:</span>
              <span className="font-bold text-slate-800 font-mono">{povertyAnalysis.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${povertyAnalysis.percentage >= 60 ? 'bg-red-500' : povertyAnalysis.percentage >= 45 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${povertyAnalysis.percentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-[11px] flex justify-between">
              <span className="text-slate-500">ความระแวดระวัง:</span>
              <span className="font-semibold text-slate-700">{povertyAnalysis.level}</span>
            </div>
          </div>

          {/* สรุปสถานะการอนุมัติสิทธิ์ */}
          <div className="p-3 border rounded-xl flex flex-col gap-1 items-center justify-center text-center">
            <span className="text-slate-500 text-[10px]">ระดับประเมินความเดือดร้อนของคุณครู:</span>
            {estimatedPovertyStatus === PovertyStatus.ExtremelyPoor ? (
              <span className="bg-red-50 text-red-700 font-bold border border-red-200 px-3 py-1 rounded-full text-xs">
                ผ่านเกณฑ์ยากจนพิเศษ (กสศ.)
              </span>
            ) : estimatedPovertyStatus === PovertyStatus.Poor ? (
              <span className="bg-amber-50 text-amber-700 font-bold border border-amber-200 px-3 py-1 rounded-full text-xs">
                เข้าเกณฑ์กลุ่มยากจน
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 px-3 py-1 rounded-full text-xs">
                กลุ่มทั่วไป / อาชีพอิสระปกติ
              </span>
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              * ข้อมูลปรับอัตโนมัติเมื่อเลือกแบบมุงหลังคา ฝาบ้าน และรายได้ครอบครัว
            </p>
          </div>
        </div>

        {/* แนะนำขั้นตอนการบันทึก */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold text-slate-600 mb-2">มินิไกด์ไลน์ (5 ขั้นตอน):</h4>
          <div className="space-y-1 text-[11px] text-slate-500">
            <div className={`p-1.5 rounded flex items-center gap-1.5 ${step === 1 ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}>
              <span className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-mono">1</span>
              <span>ประวัตินักเรียนและการเดินทาง</span>
            </div>
            <div className={`p-1.5 rounded flex items-center gap-1.5 ${step === 2 ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}>
              <span className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-mono">2</span>
              <span>สมาชิกในบ้านและรายได้</span>
            </div>
            <div className={`p-1.5 rounded flex items-center gap-1.5 ${step === 3 ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}>
              <span className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-mono">3</span>
              <span>สำรวจที่อยู่โครงสร้างทางกายภาพ</span>
            </div>
            <div className={`p-1.5 rounded flex items-center gap-1.5 ${step === 4 ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}>
              <span className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-mono">4</span>
              <span>อัปเดตรูปถ่าย / พิกัด GPS</span>
            </div>
            <div className={`p-1.5 rounded flex items-center gap-1.5 ${step === 5 ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}>
              <span className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-mono">5</span>
              <span>การรับรองโดยพยานและครูประจำชั้น</span>
            </div>
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: รายละเอียดขั้นตอนฟอร์มคัดกรองกรอกประวัติ */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialRecord ? 'แก้ไขรายงานการเยี่ยมบ้านนักเรียน' : 'บันทึกประเมินการเยี่ยมบ้าน / นร.01 ใหม่'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">แบบคัดกรองปัจจัยพื้นฐาน นักเรียนที่มีผลสัมฤทธิ์ทางการเงินขัดสน</p>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            id="btn-cancel-form"
          >
            ยกเลิกการกรอก
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* ===================== STEP 1: ข้อมูลนักเรียนและการเดินทาง ===================== */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2">
                ขั้นตอนที่ 1: ประวัตินักเรียนและสถานภาพเชิงลึก
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">คำนำหน้าชื่อ *</label>
                  <select
                    value={studentPrefix}
                    onChange={(e: any) => setStudentPrefix(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ชื่อนักเรียน *</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    placeholder="ไม่ต้องใส่คำนำหน้า"
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    id="input-std-name"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">นามสกุลนักเรียน *</label>
                  <input
                    type="text"
                    value={studentLastName}
                    onChange={(e) => setStudentLastName(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    id="input-std-lname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">รหัสประจำตัวนักเรียน *</label>
                  <input
                    type="text"
                    placeholder="เช่น 69101"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    id="input-std-code"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">เลขบัตรประชาชน 13 หลัก</label>
                  <input
                    type="text"
                    placeholder="เช่น 1-1002-34928-11-2"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    id="input-std-citizen"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ระดับชั้นเรียน</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="อนุบาล 2">อนุบาล 2</option>
                    <option value="อนุบาล 3">อนุบาล 3</option>
                    <option value="ประถมศึกษาปีที่ 1/1">ประถมศึกษาปีที่ 1/1</option>
                    <option value="ประถมศึกษาปีที่ 1/2">ประถมศึกษาปีที่ 1/2</option>
                    <option value="ประถมศึกษาปีที่ 2/1">ประถมศึกษาปีที่ 2/1</option>
                    <option value="ประถมศึกษาปีที่ 3/1">ประถมศึกษาปีที่ 3/1</option>
                    <option value="ประถมศึกษาปีที่ 4/1">ประถมศึกษาปีที่ 4/1</option>
                    <option value="ประถมศึกษาปีที่ 4/2">ประถมศึกษาปีที่ 4/2</option>
                    <option value="ประถมศึกษาปีที่ 5/1">ประถมศึกษาปีที่ 5/1</option>
                    <option value="ประถมศึกษาปีที่ 6/1">ประถมศึกษาปีที่ 6/1</option>
                    <option value="มัธยมศึกษาปีที่ 1/1">มัธยมศึกษาปีที่ 1/1</option>
                    <option value="มัธยมศึกษาปีที่ 2/1">มัธยมศึกษาปีที่ 2/1</option>
                    <option value="มัธยมศึกษาปีที่ 3/1">มัธยมศึกษาปีที่ 3/1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-center font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">วันเสด็จพระราชสมภพ / วันเกิด</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ชื่อสถาบันสุทธิการศึกษา</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-600"
                  />
                </div>
              </div>

              {/* การคมนาคมของเด็กนักเรียน */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 text-xs">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-150">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  สภาพระยะทางคมนาคมมาโรงเรียน
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">วิธีการเดินทางหลัก</label>
                    <select
                      value={travelMethod}
                      onChange={(e) => setTravelMethod(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 focus:outline-none focus:ring-1"
                    >
                      <option value="เดินเท้า">เดินเท้า</option>
                      <option value="รถจักรยานส่วนตัว">รถจักรยานส่วนตัว</option>
                      <option value="รถจักรยานยนต์ส่วนตัวของผู้ปกครอง">รถจักรยานยนต์ส่วนตัวของผู้ปกครอง</option>
                      <option value="รถรับส่งนักเรียนหมู่บ้าน">รถรับส่งนักเรียนหมู่บ้าน</option>
                      <option value="รถโดยสารประจําทาง">รถโดยสารประจำทาง</option>
                      <option value="รถตู้/พ่วงข้างรับส่งโดยโรงเรียน">รถตู้/พ่วงข้างรับส่งโดยโรงเรียน</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ระยะทางจริงทิศทางเดียว (กิโลเมตร)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={distanceToSchool}
                      onChange={(e) => setDistanceToSchool(parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ค่าใช้จ่ายเดินทางเฉลี่ย (บาทต่อวัน)</label>
                    <input
                      type="number"
                      value={travelCostPerDay}
                      onChange={(e) => setTravelCostPerDay(parseInt(e.target.value) || 0)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 2: สมาชิกครอบครัวและรายได้ ===================== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2">
                  ขั้นตอนที่ 2: สมาชิกภายใต้ชายคาเดียวกันและรายได้เฉลี่ยรายคน
                </h3>
                <button
                  type="button"
                  onClick={handleAddFamilyMember}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all"
                  id="btn-add-family-row"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มสมาชิกครัวเรือน
                </button>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>คำอธิบาย:</strong> สมาชิกในครัวเรือน หมายถึง บุคคลที่อาศัยอยู่ในที่อยู่อาศัยเดียวกันร่วมกันอย่างน้อย 3 เดือน และร่วมกันประกอบอาหารใช้สอยร่วมกัน กรอกอายุ อาชีพ และรายได้ตรงตามสภาพจริงเพื่อคำนวณเบี้ยสัมฤทธิ์
                </div>
              </div>

              <div className="space-y-3">
                {familyMembers.map((member, idx) => (
                  <div 
                    key={member.id} 
                    className="p-4 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50/50 space-y-3 relative text-xs transition-all"
                    id={`row-member-${idx}`}
                  >
                    <div className="flex justify-between items-center bg-slate-100 p-1.5 px-3 rounded-lg">
                      <span className="font-bold text-slate-700">ลำดับที่ {idx + 1} ({member.relation || 'โปรดกรอกความสัมพันธ์'})</span>
                      {familyMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFamilyMember(member.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          title="ลบรายชื่อสมาชิกนี้"
                          id={`btn-del-member-${idx}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">ความสัมพันธ์หลัก</label>
                        <input
                          type="text"
                          placeholder="เช่น มารดา, ปู่, พี่เขย, ตัวนักเรียน"
                          value={member.relation}
                          onChange={(e) => handleUpdateFamilyMember(member.id, 'relation', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">อายุ (ปี)</label>
                        <input
                          type="number"
                          value={member.age}
                          onChange={(e) => handleUpdateFamilyMember(member.id, 'age', parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-300 bg-white rounded-lg p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">อาชีพหลัก</label>
                        <input
                          type="text"
                          placeholder="เช่น รับจ้างก่อสร้างชั่วคราว"
                          value={member.occupation}
                          onChange={(e) => handleUpdateFamilyMember(member.id, 'occupation', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">รายได้ต่อเดือนหลัก (บาท) *</label>
                        <input
                          type="number"
                          value={member.monthlyIncome}
                          onChange={(e) => handleUpdateFamilyMember(member.id, 'monthlyIncome', parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-300 bg-white rounded-lg p-2 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1 bg-white/70 p-2 rounded-lg">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={member.disabilityOrChronicIllness}
                          onChange={(e) => handleUpdateFamilyMember(member.id, 'disabilityOrChronicIllness', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <span>มีความทุพพลภาพ / พิการ / เจ็บป่วยเรื้อรังจำเจเป็นภาระพึ่งพิง</span>
                      </label>

                      {idx === 0 || idx === 1 ? (
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={member.singleParentStatus}
                            onChange={(e) => handleUpdateFamilyMember(member.id, 'singleParentStatus', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <span>เป็นผู้ครอบครองสถานะคุณแม่/คุณพ่อเลี้ยงเดี่ยว (Single Parent)</span>
                        </label>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== STEP 3: สภาพครัวเรือนและที่อยู่อาศัย ===================== */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2 pb-1 border-b border-slate-100">
                ขั้นตอนที่ 3: สถานะทางกายภาพของโครงสร้างบ้านเรือนจริง (นร.01)
              </h3>

              {/* 3.1 วัสดุมุงหลังคา */}
              <div className="bg-slate-50/60 p-4 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-800 block mb-2 text-indigo-900">1. วัสดุมุงหลังคาหลักของบ้าน</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${roof === RoofMaterial.Natural ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">หญ้าคา/ใบจาก/แฝก</span>
                      <input type="radio" name="roof_mat" checked={roof === RoofMaterial.Natural} onChange={() => setRoof(RoofMaterial.Natural)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-red-500 mt-2 block">สูงสุด (3 คะแนนความยากจน)</span>
                  </label>

                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${roof === RoofMaterial.ZincOld ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">สังกะสีเก่า ผุพัง</span>
                      <input type="radio" name="roof_mat" checked={roof === RoofMaterial.ZincOld} onChange={() => setRoof(RoofMaterial.ZincOld)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-amber-500 mt-2 block">วิกฤต (2 คะแนนความยากจน)</span>
                  </label>

                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${roof === RoofMaterial.ZincGood ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">สังกะสีดี/กระเบื้องคู่</span>
                      <input type="radio" name="roof_mat" checked={roof === RoofMaterial.ZincGood} onChange={() => setRoof(RoofMaterial.ZincGood)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block">ปกติ (1 คะแนนความยากจน)</span>
                  </label>

                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${roof === RoofMaterial.TileConcrete ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">คอนกรีต/กระเบื้องแกรนิต</span>
                      <input type="radio" name="roof_mat" checked={roof === RoofMaterial.TileConcrete} onChange={() => setRoof(RoofMaterial.TileConcrete)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-green-600 mt-2 block">มั่งคง (0 คะแนน)</span>
                  </label>
                </div>
              </div>

              {/* 3.2 วัสดุฝาบ้าน */}
              <div className="bg-slate-50/60 p-4 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-800 block mb-2 text-indigo-900">2. วัสดุที่ทำเป็นผนังหรือฝาบ้านหลัก</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${wall === WallMaterial.Natural ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">ไม้ไผ่/ไม่มีผนังรอบตัวบ้าน</span>
                      <input type="radio" name="wall_mat" checked={wall === WallMaterial.Natural} onChange={() => setWall(WallMaterial.Natural)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-red-500 mt-2 block">สูงสุด (3 คะแนนความยากจน)</span>
                  </label>

                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${wall === WallMaterial.WoodOld ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">แผ่นไม้ผุกร่อนสังกะสีปะ</span>
                      <input type="radio" name="wall_mat" checked={wall === WallMaterial.WoodOld} onChange={() => setWall(WallMaterial.WoodOld)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-amber-500 mt-2 block">วิกฤต (2 คะแนน)</span>
                  </label>

                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${wall === WallMaterial.WoodGood ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">ผนังแผ่นไม้มั่นคงดี/เฌอร่า</span>
                      <input type="radio" name="wall_mat" checked={wall === WallMaterial.WoodGood} onChange={() => setWall(WallMaterial.WoodGood)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block">ปกติ (1 คะแนน)</span>
                  </label>

                  <label className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${wall === WallMaterial.BrickConcrete ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-700">ปูนก่อ/อิฐบล็อกสำเร็จ</span>
                      <input type="radio" name="wall_mat" checked={wall === WallMaterial.BrickConcrete} onChange={() => setWall(WallMaterial.BrickConcrete)} className="mt-1" />
                    </div>
                    <span className="text-[10px] text-green-600 mt-2 block">ดีเยี่ยม (0 คะแนน)</span>
                  </label>
                </div>
              </div>

              {/* ส้วม, แหล่งน้ำ, ไฟฟ้า */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* ส้วม */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-slate-800 block mb-2 text-indigo-900">3. สุขาและสุขลักษณะห้องน้ำ</span>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="radio" name="toilet_st" checked={toilet === ToiletStatus.NoneOrSharedOld} onChange={() => setToilet(ToiletStatus.NoneOrSharedOld)} className="mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700 block">ซอมซ่อมาก/ไม่มีสุขา/ใช้ร่วมกับบุคคลภายนอก</span>
                        <span className="text-[10px] text-red-500">(3 คะแนนยากจน)</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="radio" name="toilet_st" checked={toilet === ToiletStatus.OwnGood} onChange={() => setToilet(ToiletStatus.OwnGood)} className="mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700 block">มีเฉพาะที่บ้าน อ่อนอนามัยถูกต้องปกป้องกัน</span>
                        <span className="text-[10px] text-green-600">(0 คะแนน)</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* แหล่งน้ำดื่ม */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-slate-800 block mb-2 text-indigo-900">4. แหล่งน้ำหลักของการดื่ม-น้ำใช้</span>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="radio" name="water_st" checked={water === WaterSource.NaturalOrBuy} onChange={() => setWater(WaterSource.NaturalOrBuy)} className="mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700 block">ห้วยหนองคลองบึง/บ่อน้ำไม่สะอาด/ต้องซื้อถังเสม็ด</span>
                        <span className="text-[10px] text-amber-500">(2 คะแนนยากจน)</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="radio" name="water_st" checked={water === WaterSource.PipedOrArtesian} onChange={() => setWater(WaterSource.PipedOrArtesian)} className="mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700 block">น้ำประปาแบรนด์/หน่วยบริหารท้องถิ่น/ผ่านเครื่องกรอง</span>
                        <span className="text-[10px] text-green-600">(0 คะแนน)</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ไฟฟ้า */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-slate-800 block mb-2 text-indigo-900">5. กระแสพลังงานไฟฟ้าส่องสว่าง</span>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="radio" name="elec_st" checked={electricity === ElectricityStatus.NoneOrShared} onChange={() => setElectricity(ElectricityStatus.NoneOrShared)} className="mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700 block">ไม่มีเลย/เทียน/แบตเตอรี่พ่วงสายลำลองข้างบ้าน</span>
                        <span className="text-[10px] text-red-500">(3 คะแนนยากจน)</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="radio" name="elec_st" checked={electricity === ElectricityStatus.MeterOwn} onChange={() => setElectricity(ElectricityStatus.MeterOwn)} className="mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700 block">มีหม้อวัดมาตรฐานจดแจ้งจากการไฟฟ้าส่วนตัว</span>
                        <span className="text-[10px] text-green-600">(0 คะแนน)</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ยานพาหนะ และกรรมสิทธิ์ที่ดิน */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* ยานพาหนะ */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-slate-800 block mb-2 text-indigo-900">6. ยานพาหนะเดินทางของครอบครัว</span>
                  <div className="space-y-2.5 text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vehicle_st" checked={vehicle === VehicleOwnership.None} onChange={() => setVehicle(VehicleOwnership.None)} />
                      <span>ไม่มีรถเลย หรือมีเพียงรถจักรยานเฉยๆ (3 คะแนน)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vehicle_st" checked={vehicle === VehicleOwnership.MotorcycleOld} onChange={() => setVehicle(VehicleOwnership.MotorcycleOld)} />
                      <span>รถจักรยานยนต์คันเดิมๆ เก่าเกิน 5-10 ปี (2 คะแนน)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vehicle_st" checked={vehicle === VehicleOwnership.MotorcycleGoodOrCarOld} onChange={() => setVehicle(VehicleOwnership.MotorcycleGoodOrCarOld)} />
                      <span>รถจักรยานยนต์ขนาดใหญ่สภาพดีเยี่ยม / มีรถกระบะเก่ามากทำงาน (1 คะแนน)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vehicle_st" checked={vehicle === VehicleOwnership.CarGoodOrTruck} onChange={() => setVehicle(VehicleOwnership.CarGoodOrTruck)} />
                      <span>รถยนต์ส่วนบุคคลดีมีแอร์ / ปิคอัพคันสวยเชิงเกษตร (0 คะแนน)</span>
                    </label>
                  </div>
                </div>

                {/* ที่ดินทำกิน */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block mb-2 text-indigo-900">7. สิทธิ์ครอบครองที่กินทำการเกษตร</span>
                    <div className="space-y-2.5 text-slate-600">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="land_st" checked={land === LandStatus.None} onChange={() => setLand(LandStatus.None)} />
                        <span>ไม่มีที่ดินเลย / เช่าเพื่อสร้างบ้าน / อาศัยอยู่ในที่วัดวาพนาพาล (2 คะแนน)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="land_st" checked={land === LandStatus.LessEqualOneRai} onChange={() => setLand(LandStatus.LessEqualOneRai)} />
                        <span>มีที่ดินแต่น้อยกว่าหรือเท่ากับ 1 ไร่ (1 คะแนน)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="land_st" checked={land === LandStatus.MoreThanOneRai} onChange={() => setLand(LandStatus.MoreThanOneRai)} />
                        <span>มีกรรมสิทธิ์พืชไร่เกิน 1 ไร่ขึ้นไป (0 คะแนน)</span>
                      </label>
                    </div>
                  </div>

                  {/* สกัดขัดสิทธิเครื่องใช้ไฟฟ้ารุ่นใหญ่ */}
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <span className="font-semibold text-[11px] text-slate-700 block mb-1">สิ่งอำนวยความสะดวกราคาสูงในครอบครัว (หักลบเกณฑ์คัดกรอง):</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={hasComputer} onChange={(e) => setHasComputer(e.target.checked)} />
                        <span>คอมพิวเตอร์ (-1)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={hasRefrigerator} onChange={(e) => setHasRefrigerator(e.target.checked)} />
                        <span>ตู้เย็น (-1)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={hasWashingMachine} onChange={(e) => setHasWashingMachine(e.target.checked)} />
                        <span>เครื่องซักผ้า (-2)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={hasAirConditioner} onChange={(e) => setHasAirConditioner(e.target.checked)} />
                        <span>เครื่องปรับอากาศ (-3)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 4: แผนที่ พิกัด และรูปถ่ายบ้าน ===================== */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2 pb-1 border-b border-slate-100">
                ขั้นตอนที่ 4: พิกัดภูมิศาสตร์ (GPS) และรูปถ่ายแสดงข้อมูลจริงทางจรรยาบรรณ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* พิกัด GPS */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">ยืนยันพิกัดที่ดินสิ่งปลูกสร้าง</h4>
                    <p className="text-[11px] text-slate-500 mb-3">กรุณาระบุละติจูด-ลองจิจูดจริงจากการถ่ายในสถานที่ หรือสุ่มตำแหน่งใกล้เคียง</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">ละติจูด (Latitude)</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={lat}
                          onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-300 bg-white rounded-lg p-2.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">ลองจิจูด (Longitude)</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={lng}
                          onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-300 bg-white rounded-lg p-2.5 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateGPS}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-lg font-medium transition-all cursor-pointer"
                    id="btn-gen-gps"
                  >
                    <MapPin className="w-4 h-4 text-red-400" />
                    ดึงพิกัดดาวเทียมโรงเรียน (สุ่มพิกัดที่พักอาศัยใกล้เคียง)
                  </button>
                </div>

                {/* ภาพ 1: ภาพหน้าบ้าน */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 mb-1">1. อัปโหลดภาพหน้าบ้านจริง (เห็นหลังคาและโครงสร้างผนัง)</h4>
                  <p className="text-[10px] text-slate-500 mb-3">คำแนะนำ: ถ่ายหน้าบ้านห่าง 5-10 เมตร ให้ครบถ้วน</p>
                  
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:bg-slate-50 transition-colors relative h-36 overflow-hidden">
                    {frontImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={frontImage} 
                          alt="Front review" 
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setFrontImage('')}
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-[10px] px-2"
                        >
                          ลบภาพ
                        </button>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <Camera className="w-8 h-8 text-slate-400 mb-1.5" />
                        <span className="text-slate-500 block">คลิกอัปโหลด หรือ ลากวางไฟล์ภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'front')}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          id="file-front-image"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* ภาพ 2: ภาพภายในบ้าน */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 mb-1">2. ภาพสภาพภายในบ้านจริง (แสดงพื้น หลังคา และการอยู่)</h4>
                  <p className="text-[10px] text-slate-500 mb-3">คำแนะนำ: ถ่ายบริเวณห้องรับแขก ประตูกลาง หรือจุดปูที่นอน</p>
                  
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:bg-slate-50 transition-colors relative h-36 overflow-hidden">
                    {insideImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={insideImage} 
                          alt="Inside review" 
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setInsideImage('')}
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-[10px] px-2"
                        >
                          ลบภาพ
                        </button>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <Camera className="w-8 h-8 text-slate-400 mb-1.5" />
                        <span className="text-slate-500 block">คลิกอัปโหลด หรือ ลากวางไฟล์ภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'inside')}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          id="file-inside-image"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ภาพ 3: ภาพถ่ายหมู่ */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 mb-1">3. ภาพครอบครัว (นักเรียนร่วมถ่ายคู่กับผู้ปกครองหลักที่พำนักจริง)</h4>
                  <p className="text-[10px] text-slate-500 mb-3">คำแนะนำ: ถ่ายภาพร่วมยืนบริเวณรอบตัวบ้าน เพื่อเป็นพยานเชิงสิทธิการพำนักจริง</p>
                  
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:bg-slate-50 transition-colors relative h-36 overflow-hidden">
                    {withStudentImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={withStudentImage} 
                          alt="Family student review" 
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setWithStudentImage('')}
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-[10px] px-2"
                        >
                          ลบภาพ
                        </button>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <Camera className="w-8 h-8 text-slate-400 mb-1.5" />
                        <span className="text-slate-500 block">คลิกอัปโหลด หรือ ลากวางไฟล์ภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'with_student')}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          id="file-with-student-image"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 5: การประเมินและการบันทึกโดยคุณครู ===================== */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2 pb-1 border-b border-slate-100">
                ขั้นตอนที่ 5: สรุปความต้องการเร่งด่วนและข้อมูลผู้เยี่ยมบ้านลงนามรักษาสิทธิ์
              </h3>

              {/* ข้อเสนอความต้องการช่วนเหลือ */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-800 block mb-2.5 text-indigo-900">
                  ความต้องการรับความช่วยเหลือ/การพัฒนาที่จำเจเร่งด่วนที่สุด (เลือกได้มากกว่า 1 ข้อหลัก):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={assistanceRequired.includes('ทุนการศึกษาทุนปัจจัยพื้นฐาน')} 
                      onChange={() => toggleAssistance('ทุนการศึกษาทุนปัจจัยพื้นฐาน')} 
                      className="w-4 h-4"
                    />
                    <span>ทุนการศึกษาสำหรับครอบครัวรายได้ต้อยลิ่ว</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={assistanceRequired.includes('เครื่องอุปโภคบริโภค/ข้าวสารอาหารแห้ง')} 
                      onChange={() => toggleAssistance('เครื่องอุปโภคบริโภค/ข้าวสารอาหารแห้ง')} 
                      className="w-4 h-4"
                    />
                    <span>การจัดถุงยังชีพอาหารเสริม/เครื่องอุปโภคหลัก</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={assistanceRequired.includes('ซ่อมแซมฝาบ้านและหลังคากันฝน')} 
                      onChange={() => toggleAssistance('ซ่อมแซมฝาบ้านและหลังคากันฝน')} 
                      className="w-4 h-4"
                    />
                    <span>บูรณะความปลอดภัยซ่อมแซมฝาบ้าน/หลังคาด่วน</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={assistanceRequired.includes('ชุดนักเรียน อุปกรณ์สแตนดาร์ด และเครื่องเขียน')} 
                      onChange={() => toggleAssistance('ชุดนักเรียน อุปกรณ์สแตนดาร์ด และเครื่องเขียน')} 
                      className="w-4 h-4"
                    />
                    <span>ชุดเครื่องแบบนักเรียนและอุปกรณ์การเรียนเครื่องกีฬา</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={assistanceRequired.includes('อาหารเสริมพรีเมี่ยมและนมเพื่อการเจริญเติบโต')} 
                      onChange={() => toggleAssistance('อาหารเสริมพรีเมี่ยมและนมเพื่อการเจริญเติบโต')} 
                      className="w-4 h-4"
                    />
                    <span>ค่านมพ่วงและอาหารเสริมบำรุงส่วนบุคคล</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={assistanceRequired.includes('แพ็คเกจตรวจสุขภาพคุณปู่คุณย่าในบ้าน')} 
                      onChange={() => toggleAssistance('แพ็คเกจตรวจสุขภาพคุณปู่คุณย่าในบ้าน')} 
                      className="w-4 h-4"
                    />
                    <span>สิทธิ์การรักษาสนับสนุนเยี่ยมบ้านคุณปู่ย่าทรุดโทรม</span>
                  </label>
                </div>
              </div>

              {/* ข้อความเพิ่มเติมจากการเยี่ยมบ้าน */}
              <div className="text-xs">
                <label className="block text-slate-700 font-bold mb-1 border-b pb-1">
                  บันทึกความเห็น/บันทึกสังเกตการณ์ที่อยู่อาศัยเพื่ออ้างสิทธิ์ (ครูประจำชั้นบันทึกตามจริง) *
                </label>
                <textarea
                  rows={4}
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  placeholder="เขียนอธิบายพฤติกรรม สภาพความเป็นอยู่จริงหลังคาและฝาผนัง และจุดที่ค่อนข้างวิกฤตต้องการความช่วยเหลือเร่งด่วน เพื่อใช้ในการทำวิจัยและอนุมัติหลักเกณฑ์"
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
                  id="input-teacher-comment"
                />
              </div>

              {/* ฟิลด์ลงนามผู้รับผิดชอบ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
                <div className="space-y-3 p-3 bg-indigo-50/50 rounded-xl">
                  <span className="font-bold text-slate-700 block text-indigo-900 border-b pb-1 text-[11px]">ส่วนที่ 5.1: รายชื่อคุณครูผู้ประเมินและเยี่ยมบ้าน</span>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ชื่อ-สกุลคุณครูชาวเยี่ยมบ้าน *</label>
                    <input
                      type="text"
                      placeholder="เช่น คุณครูบุญลือ สมดี"
                      value={evaluatorTeacherName}
                      onChange={(e) => setEvaluatorTeacherName(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 shrink"
                      id="input-teacher-name"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ตำแหน่งคุณครูในสังกัด</label>
                    <input
                      type="text"
                      placeholder="เช่น ครูประจำชั้น ป.4/2 หรือ ครูประจำสายชั้นศึกษา"
                      value={evaluatorTeacherPosition}
                      onChange={(e) => setEvaluatorTeacherPosition(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-3 bg-indigo-50/50 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-700 block text-indigo-900 border-b pb-1 text-[11px]">ส่วนที่ 5.2: พยานท้องถิ่นยืนร่วมตรวจสิทธิ (นร.01)</span>
                    <label className="block text-slate-600 font-medium mb-1 mt-2">ชื่อ-นามสกุลพยานชุมชน (ผู้ใหญ่บ้าน/กำนัน/อสม./ตัวแทนท้องถิ่น) *</label>
                    <input
                      type="text"
                      placeholder="เช่น นายประเสริฐ เก่งการงาน (ผู้ใหญ่บ้านหมู่ 4)"
                      value={villageHeadmanName}
                      onChange={(e) => setVillageHeadmanName(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 font-medium"
                      id="input-headman-name"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-[10px]">วันที่ประเมินคัดกรองข้อมูล</label>
                    <input
                      type="date"
                      value={surveyDate}
                      onChange={(e) => setSurveyDate(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ป้ายควบคุมนำผู้ใช้ก้าวผ่านขั้นตอน Form */}
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mt-8 text-xs">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 p-2.5 px-4 rounded-lg font-medium transition-all duration-150 cursor-pointer"
                id="btn-form-prev"
              >
                <ChevronLeft className="w-4 h-4" />
                ย้อนกลับ
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-2">
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white p-2.5 px-5 rounded-lg font-bold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
                  id="btn-form-next"
                >
                  หน้าถัดไป
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 px-6 rounded-lg font-bold shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
                  id="btn-form-submit"
                >
                  <Save className="w-4 h-4" />
                  บันทึกข้อมูลเยี่ยมบ้านเรียบร้อย
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
