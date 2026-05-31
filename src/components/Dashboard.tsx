/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Printer, 
  Edit2, 
  Trash2, 
  Grid, 
  List,
  Activity, 
  Users, 
  TrendingDown, 
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Award
} from 'lucide-react';
import { HomeVisitRecord, PovertyStatus } from '../types';
import { 
  calculateIncomePerCapita, 
  calculatePovertyIndex,
  getPovertyBadgeProps,
  evaluatePovertyStatus
} from '../data';

interface DashboardProps {
  records: HomeVisitRecord[];
  onAddRecord: () => void;
  onEditRecord: (record: HomeVisitRecord) => void;
  onPrintRecord: (record: HomeVisitRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function Dashboard({ 
  records, 
  onAddRecord, 
  onEditRecord, 
  onPrintRecord, 
  onDeleteRecord 
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // คำนวณข้อมูลสถิติภายในแดชบอร์ด
  const totalCount = records.length;
  
  const extremelyPoorCount = records.filter(r => {
    const peri = calculateIncomePerCapita(r.familyMembers);
    const index = calculatePovertyIndex(r.householdCondition);
    return peri <= 1500 && index.percentage >= 45;
  }).length;

  const poorCount = records.filter(r => {
    const peri = calculateIncomePerCapita(r.familyMembers);
    const index = calculatePovertyIndex(r.householdCondition);
    const isExtPoor = peri <= 1500 && index.percentage >= 45;
    return peri <= 3000 && !isExtPoor;
  }).length;

  const normalCount = totalCount - extremelyPoorCount - poorCount;

  // เอาเฉพาะระเบียบระดับชั้นเรียนที่มีจริงในระบบ
  const gradesList = Array.from(new Set(records.map(r => r.grade)));

  // ตัวกรองและค้นหาหลัก
  const filteredRecords = records.filter(record => {
    const fullName = `${record.studentName} ${record.studentLastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      record.studentCode.includes(searchTerm) ||
      record.citizenId.includes(searchTerm);

    const matchesGrade = selectedGrade === 'ALL' || record.grade === selectedGrade;

    const peri = calculateIncomePerCapita(record.familyMembers);
    const index = calculatePovertyIndex(record.householdCondition);
    const isExtPoor = peri <= 1500 && index.percentage >= 45;
    const isPoor = peri <= 3000 && !isExtPoor;

    let statusType = PovertyStatus.Normal;
    if (isExtPoor) statusType = PovertyStatus.ExtremelyPoor;
    else if (isPoor) statusType = PovertyStatus.Poor;

    const matchesStatus = selectedStatus === 'ALL' || statusType === selectedStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. ส่วนหัวของระบบบริการข้อมูลสะท้อนภาพรวม */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-slate-200 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            ระบบคัดกรองและเยี่ยมบ้านนักเรียนไทยค้ำจุน (CCT)
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            ระบบจัดเก็บข้อมูลนักเรียนรายบุคคล สอดคล้องกับปัจจัยพื้นฐานนักเรียนยากจน (สพฐ. / กสศ. / นร.01) การคำนวณเบี้ยสัมฤทธิ์และพิมพ์เอกสารอย่างเป็นทางการ
          </p>
        </div>
        
        <button
          onClick={onAddRecord}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer grow-0 shrink-0 self-start md:self-center"
          id="btn-add-record-main"
        >
          <Plus className="w-4 h-4" />
          เยี่ยมบ้านเพิ่มนร.ใหม่
        </button>
      </div>

      {/* 2. สถิติภาพรวมผู้รับผลสัมฤทธิ์คัดกรอง (KPIs Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI: ทั้งหมด */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs hover:shadow-sm transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">เยี่ยมบ้านและคัดกรองแล้ว</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{totalCount} คน</span>
          </div>
        </div>

        {/* KPI: ยากจนพิเศษ */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-red-500 block font-bold">กลุ่มยากจนพิเศษ (กสศ.)</span>
            <span className="text-xl font-bold text-red-700 font-mono">{extremelyPoorCount} คน</span>
          </div>
        </div>

        {/* KPI: ยากจน */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-amber-600 block font-semibold">กลุ่มเดือดร้อนยากจน</span>
            <span className="text-xl font-bold text-amber-700 font-mono">{poorCount} คน</span>
          </div>
        </div>

        {/* KPI: ปกติ */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-emerald-600 block font-medium">กลุ่มทั่วไป / ปกติ</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">{normalCount} คน</span>
          </div>
        </div>
      </div>

      {/* 3. แผงควบคุม ค้นหา คัดกรองตัวกรองข้อมูล (Filter Panel) */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* ช่องค้นหา */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="ค้นหานักเรียนด้วยชื่อ, รหัสประจำตัว, หรือเลขบัตรประชาชน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all"
              id="search-input"
            />
          </div>

          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            {/* ตัวเลือกชั้นปี */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              id="select-grade-filter"
            >
              <option value="ALL">ทุกระดับชั้นปี</option>
              {gradesList.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            {/* ความกว้างสิทธิ์ กสศ. */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              id="select-status-filter"
            >
              <option value="ALL">ทุกกลุ่มเกณฑ์คัดกรอง</option>
              <option value="EXTREMELY_POOR">ยากจนพิเศษ (กสศ.)</option>
              <option value="POOR">กลุ่มยากจน</option>
              <option value="NORMAL">ปกติ / ทั่วไป</option>
            </select>

            {/* ปุ่มเลือกระหว่าง Grid และ Table */}
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200" id="toggle-view-mode">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'GRID' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'}`}
                title="แสดงผลแบบการ์ดประเมิน"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'TABLE' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'}`}
                title="แสดงผลแบบตารางสีกระดาษ"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ยอดผลลัพธ์การค้นพบล่าสุด */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>พบสมาชิกนักเรียนจากการคัดกรอง: <strong className="text-slate-800 font-bold">{filteredRecords.length}</strong> รายการ</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              ล้างค่าตารางกรองค้นหา
            </button>
          )}
        </div>
      </div>

      {/* 4. การแสดงผลรายการ (GRID vs TABLE Views) */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-400 border-dashed space-y-2">
          <Activity className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
          <p className="font-medium text-slate-500">ไม่พบข้อมูลการเยี่ยมบ้านนักเรียนที่ตรงตามเงื่อนไขค้นหา</p>
          <p className="text-[11px] text-slate-400">กรุณาลองปรับแก้ไขคำค้นหาใหม่ หรือคลิกปุ่ม "เยี่ยมบ้านเพิ่มนร.ใหม่" เพื่อป้อนข้อมูลชุดแรก</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* 4.1 ตารางแสดงผลแบบ การ์ดประเมินพกพา (Bento-Grid Card style) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="records-grid-view">
          {filteredRecords.map(record => {
            const peri = calculateIncomePerCapita(record.familyMembers);
            const povertyAnalysis = calculatePovertyIndex(record.householdCondition);
            
            const isExtPoor = peri <= 1500 && povertyAnalysis.percentage >= 45;
            const isPoor = peri <= 3000 && !isExtPoor;
            const statePoverty = isExtPoor ? PovertyStatus.ExtremelyPoor : isPoor ? PovertyStatus.Poor : PovertyStatus.Normal;
            const badge = getPovertyBadgeProps(statePoverty);

            return (
              <div 
                key={record.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm duration-150 flex flex-col justify-between"
                id={`record-card-${record.id}`}
              >
                <div>
                  {/* บาร์หัวการ์ดบอกระเบียนพิกัด */}
                  <div className="bg-slate-50/80 p-3.5 px-4 border-b border-slate-150 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="font-mono">{record.gps.lat.toFixed(4)}, {record.gps.lng.toFixed(4)}</span>
                    </div>
                    <span className="text-slate-400 font-mono">นร. {record.studentCode}</span>
                  </div>

                  {/* ตอนกลาง: รูปนักเรียน/บ้านพรีวิวถอดสัมประสิทธิ์ */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img 
                          src={record.photos.withStudentUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600'} 
                          alt="Student-Family" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">
                          {record.studentPrefix}{record.studentName} {record.studentLastName}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{record.grade} | ปีการศึกษา {record.schoolYear}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                      {/* รายได้เฉลี่ย */}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">รายได้เฉลี่ยต่อสมาชิก:</span>
                        <span className="font-mono font-bold text-slate-800">{peri.toLocaleString()} บาท/ด.</span>
                      </div>
                      
                      {/* ดัชนีความขัดสน */}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">ดัชนีครัวเรือน กสศ.:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">{povertyAnalysis.percentage}%</span>
                          <span className="text-[10px] text-slate-400">({povertyAnalysis.level})</span>
                        </div>
                      </div>

                      {/* ส่วนาอธิบายเพิ่มเติมย่อ */}
                      {record.teacherComment && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-150 font-sans mt-1">
                          &ldquo;{record.teacherComment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ส่วนท้าย: ป้ายสถานะเกณฑ์ กสศ. และ การเรียกใช้งานพิมพ์ */}
                <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase">สิทธิการคัดกรอง:</span>
                    <span className={`text-[10px] uppercase font-bold border rounded-full px-2.5 py-0.5 ${badge.bgClass}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* ปุ่ม Action จัดกลุ่ม */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => onPrintRecord(record)}
                      className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg p-2 font-medium cursor-pointer transition-colors"
                      title="ปริ้นแบบบันทึก นร.01 และเยี่ยมบ้าน"
                      id={`btn-open-print-card-${record.id}`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      พิมพ์
                    </button>
                    <button
                      onClick={() => onEditRecord(record)}
                      className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg p-2 font-medium cursor-pointer transition-colors"
                      title="แก้ไขข้อมูลเยี่ยมบ้าน"
                      id={`btn-open-edit-card-${record.id}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบรายงานเยี่ยมบ้านของ ${record.studentPrefix}${record.studentName} หรือไม่?`)) {
                          onDeleteRecord(record.id);
                        }
                      }}
                      className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg p-2 font-medium cursor-pointer transition-colors"
                      title="ลบรายงานนี้ออกจากฐานข้อมูล"
                      id={`btn-open-delete-card-${record.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* 4.2 ตารางแสดงผลแบบ ตารางข้อมูลทางการ (Official Table lists) */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs" id="records-table-view">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-slate-600">
                <th className="p-4 font-semibold text-center w-12">ลำดับ</th>
                <th className="p-4 font-semibold">ชื่อ-นามสกุลนักเรียน</th>
                <th className="p-4 font-semibold">เลขรหัสนักเรียน</th>
                <th className="p-4 font-semibold">ระดับชั้นปี</th>
                <th className="p-4 font-semibold text-right">รายได้เฉลี่ย/ด./คน</th>
                <th className="p-4 font-semibold text-center">ดัชนีขัดสน</th>
                <th className="p-4 font-semibold text-center">สิทธิ กสศ.</th>
                <th className="p-4 font-semibold text-center w-40">ดำเนินการสิทธิ์</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => {
                const peri = calculateIncomePerCapita(record.familyMembers);
                const povertyAnalysis = calculatePovertyIndex(record.householdCondition);
                
                const isExtPoor = peri <= 1500 && povertyAnalysis.percentage >= 45;
                const isPoor = peri <= 3000 && !isExtPoor;
                const statePoverty = isExtPoor ? PovertyStatus.ExtremelyPoor : isPoor ? PovertyStatus.Poor : PovertyStatus.Normal;
                const badge = getPovertyBadgeProps(statePoverty);

                return (
                  <tr key={record.id} className="border-b border-slate-150 hover:bg-slate-50/40" id={`row-record-${record.id}`}>
                    <td className="p-4 text-center text-slate-400 font-mono font-medium">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-800">
                      {record.studentPrefix}{record.studentName} {record.studentLastName}
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-500">{record.studentCode}</td>
                    <td className="p-4 text-slate-600">{record.grade}</td>
                    <td className="p-4 text-right font-mono font-bold text-slate-700">
                      {peri.toLocaleString()} บาท/คน
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 font-mono">{povertyAnalysis.percentage}%</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold border rounded-full px-2.5 py-0.5 ${badge.bgClass}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5 text-xs">
                        <button
                          onClick={() => onPrintRecord(record)}
                          className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg p-2.5 px-3 flex items-center gap-1 cursor-pointer transition-colors"
                          id={`btn-table-print-${record.id}`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          พิมพ์ นร.01
                        </button>
                        <button
                          onClick={() => onEditRecord(record)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg p-2.5"
                          id={`btn-table-edit-${record.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบข้อมูลนี้หรือไม่?`)) {
                              onDeleteRecord(record.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 rounded-lg p-2.5"
                          id={`btn-table-del-${record.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
