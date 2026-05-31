/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, ArrowLeft, Check, MapPin } from 'lucide-react';
import { HomeVisitRecord, PovertyStatus } from '../types';
import {
  calculateIncomePerCapita,
  calculatePovertyIndex,
  getPovertyBadgeProps,
} from '../data';

interface PrintDocProps {
  record: HomeVisitRecord;
  onBack: () => void;
}

export default function PrintDoc({ record, onBack }: PrintDocProps) {
  const perCapitaIncome = calculateIncomePerCapita(record.familyMembers);
  const povertyAnalysis = calculatePovertyIndex(record.householdCondition);
  const badgeProps = getPovertyBadgeProps(
    perCapitaIncome <= 1500 && povertyAnalysis.percentage >= 45
      ? PovertyStatus.ExtremelyPoor
      : perCapitaIncome <= 3000
      ? PovertyStatus.Poor
      : PovertyStatus.Normal
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans print:p-0 print:bg-white text-slate-800">
      {/* ส่วนหัวสำหรับควบคุม - จะถูกซ่อนเวลาสั่งปริ้นท์ */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden" id="print-controls">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
            id="btn-back-print"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับแดชบอร์ด
          </button>
          <div>
            <h2 className="font-semibold text-slate-800">มุมมองตัวอย่างก่อนพิมพ์</h2>
            <p className="text-xs text-slate-500">ระบบฟอร์มคัดกรองผู้ยากจน นร.01 และบันทึกเยี่ยมบ้าน</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
          id="btn-trigger-print"
        >
          <Printer className="w-4 h-4" />
          สั่งพิมพ์เอกสารพรีเมียม (PDF/A4)
        </button>
      </div>

      {/* แผ่นกระดาษจริงที่จะแสดงบนหน้าจอและจัดพิมพ์ */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-md border border-slate-200/60 rounded-sm print:shadow-none print:border-none print:p-0 relative" id="printable-area">
        
        {/* สัญลักษณ์ตราครุฑ หรือ ตราสัญลักษณ์ในเวอร์ชันลายเส้น SVG เกรดทางการ */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-300 pb-4">
          <div className="w-16 h-16 flex items-center justify-center text-slate-700">
            <svg className="w-14 h-14" viewBox="0 0 100 100" fill="currentColor">
              {/* ตราครุฑแบบมีลายเส้นทรงเกียรติยศ */}
              <path d="M50,10 C53,20 62,25 72,25 C68,40 68,52 64,68 C58,62 54,64 50,70 C46,64 42,62 36,68 C32,52 32,40 28,25 C38,25 47,20 50,10 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M50,22 L50,68 M35,25 C42,32 45,45 42,60 M65,25 C58,32 55,45 58,60" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="22" r="2.5" fill="currentColor" />
              <text x="50" y="88" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="sans-serif">แบบ นร.01</text>
            </svg>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">แบบประเมินคัดกรองและเยี่ยมบ้านนักเรียน</h1>
            <p className="text-xs text-slate-600 font-medium">โครงการปัจจัยพื้นฐานยากจนพิเศษ (กสศ. - คณะกรรมการการศึกษาขั้นพื้นฐาน)</p>
            <p className="text-xs text-slate-500 mt-0.5">ปีการศึกษา {record.schoolYear} | วันที่ประเมิน {record.surveyDate}</p>
          </div>
        </div>

        {/* ส่วนข้อมูลโรงเรียนและนักเรียนต้นสังกัด */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-6">
          <div>
            <span className="text-slate-500 block">ชื่อนักเรียน:</span>
            <span className="font-semibold text-slate-800">{record.studentPrefix}{record.studentName} {record.studentLastName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">รหัสนักเรียน:</span>
            <span className="font-mono font-semibold text-slate-800">{record.studentCode}</span>
          </div>
          <div>
            <span className="text-slate-500 block">เลขประจำตัวประชาชน:</span>
            <span className="font-mono font-semibold text-slate-800">{record.citizenId}</span>
          </div>
          <div>
            <span className="text-slate-500 block">ระดับชั้นเรียน:</span>
            <span className="font-semibold text-slate-800">{record.grade}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block">ชื่อสถานศึกษา:</span>
            <span className="font-semibold text-slate-800">{record.schoolName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">พิกัดทางภูมิศาสตร์:</span>
            <span className="font-mono text-[11px] text-slate-800 font-semibold">{record.gps.lat.toFixed(5)}, {record.gps.lng.toFixed(5)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">ผลการวิเคราะห์ระดับเบื้องต้น:</span>
            <span className={`font-bold text-[11px] px-1.5 py-0.5 rounded-sm border inline-block ${badgeProps.bgClass}`}>
              {badgeProps.label}
            </span>
          </div>
        </div>

        {/* ตอนที่ 1: ข้อมูลสมาชิกในครัวเรือน (Household Members) */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-2 mb-2">
            ตอนที่ 1: รายการสมาชิกครัวเรือน รายได้ และภาระพึ่งพิง
          </h3>
          <p className="text-[11px] text-slate-500 mb-2">
            * เกณฑ์ยากจนพิเศษ (กสศ.) พิจารณาจากรายได้สมาชิกเฉลี่ยต่อเดือนหารด้วยจำนวนสมาชิก (รายได้เฉลี่ยต่อคนต่อเดือนต้องไม่เกิน 1,500 บาท และมีคะแนนสภาพที่อยู่อาศัยที่บ่งบอกความแร้นแค้น)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-slate-700">
                  <th className="p-2 border-r border-slate-200">ลำดับ</th>
                  <th className="p-2 border-r border-slate-200">ความสัมพันธ์กับนักเรียน</th>
                  <th className="p-2 border-r border-slate-200 text-center">อายุ (ปี)</th>
                  <th className="p-2 border-r border-slate-200">ระดับการศึกษาสูงสุด</th>
                  <th className="p-2 border-r border-slate-200">อาชีพหลัก</th>
                  <th className="p-2 border-r border-slate-200 text-right">รายได้ต่อเดือน (บาท)</th>
                  <th className="p-2 text-center">ทุพพลภาพ/เจ็บป่วยเรื้อรัง</th>
                </tr>
              </thead>
              <tbody>
                {record.familyMembers.map((member, idx) => (
                  <tr key={member.id} className="border-b border-slate-200">
                    <td className="p-2 text-center border-r border-slate-200 font-mono">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-medium">{member.relation}</td>
                    <td className="p-2 text-center border-r border-slate-200 font-mono">{member.age}</td>
                    <td className="p-2 border-r border-slate-200">{member.education || 'ไม่มี / ไม่ระบุ'}</td>
                    <td className="p-2 border-r border-slate-200">{member.occupation || 'ไม่ได้ประกอบอาชีพ'}</td>
                    <td className="p-2 text-right border-r border-slate-200 font-mono">{member.monthlyIncome.toLocaleString()}</td>
                    <td className="p-2 text-center font-semibold text-slate-700">
                      {member.disabilityOrChronicIllness ? '✓ มีภาวะพึ่งพิง' : '-'}
                    </td>
                  </tr>
                ))}
                {/* สรุปคะแนนรายได้ */}
                <tr className="bg-slate-50 font-semibold border-t border-slate-300">
                  <td colSpan={5} className="p-2 text-right border-r border-slate-200">รวมรายได้ครัวเรือนทั้งสิ้นต่อเดือน:</td>
                  <td className="p-2 text-right border-r border-slate-200 font-mono">
                    {record.familyMembers.reduce((sum, m) => sum + m.monthlyIncome, 0).toLocaleString()} บาท
                  </td>
                  <td className="p-2"></td>
                </tr>
                <tr className="bg-emerald-50/50 font-bold text-emerald-900 border-b border-slate-300">
                  <td colSpan={5} className="p-2 text-right border-r border-slate-200">รายได้ครัวเรือนเฉลี่ยรายบุคคล (Per Capita Income):</td>
                  <td className="p-2 text-right border-r border-slate-200 font-mono text-emerald-800">
                    {perCapitaIncome.toLocaleString()} บาท/คน/เดือน
                  </td>
                  <td className="p-2 text-[11px] text-center text-slate-600">
                    {perCapitaIncome <= 1500 ? 'เข้าเกณฑ์ยากจนพิเศษ (<=1,500)' : perCapitaIncome <= 3000 ? 'เข้าเกณฑ์ยากจน (<=3,000)' : 'ปกติ (>3,000)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ตอนที่ 2: สภาพและสิ่งแวดล้อมที่อยู่อาศัย (Household Condition Scoring Checkbox) */}
        <div className="mb-6 break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-2 mb-2">
            ตอนที่ 2: ดัชนีชีวัดสถานะความเป็นอยู่ของครัวเรือน (CCT Poverty Indicators)
          </h3>
          <p className="text-[11px] text-slate-500 mb-2">
            * บันทึกตรวจจับวัสดุก่อสร้างหลัก เครื่องอุปโภคบริโภค และสิ่งสาธารณูปโภคประจำตัวบ้านจริง เพื่อแปลงเป็นสถิติมัธยฐานความขัดสน
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* ฝั่งซ้าย: โครงสร้างหลัก */}
            <div className="border border-slate-200 rounded-lg p-3">
              <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs">1. สภาพโครงสร้างทางกายภาพของบ้าน</h4>
              
              {/* วัสดุหลังคา */}
              <div className="mb-3">
                <span className="font-semibold text-slate-700 block mb-1">วัสดุมุงหลังคาหลัก:</span>
                <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.roof === 'NATURAL' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.roof === 'NATURAL' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>หญ้าคา/ใบจาก/วัสดุธรรมชาติ (3 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.roof === 'ZINC_OLD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.roof === 'ZINC_OLD' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>สังกะสีเก่า ผุพัง (2 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.roof === 'ZINC_GOOD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.roof === 'ZINC_GOOD' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>สังกะสีดี/กระเบื้องลอน (1 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.roof === 'TILE_CONCRETE' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.roof === 'TILE_CONCRETE' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>คอนกรีต/กระเบื้องเซรามิก (0 คะแนน)</span>
                  </div>
                </div>
              </div>

              {/* วัสดุฝาผนัง */}
              <div className="mb-3">
                <span className="font-semibold text-slate-700 block mb-1">วัสดุผนังฝาบ้านหลัก:</span>
                <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.wall === 'NATURAL' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.wall === 'NATURAL' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>ไม้ไผ่/ไม่มีฝาผุพัง (3 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.wall === 'WOOD_OLD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.wall === 'WOOD_OLD' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>ไม้กระดานผุ/สังกะสีแปะ (2 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.wall === 'WOOD_GOOD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.wall === 'WOOD_GOOD' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>ผนังไม้แผ่นสมบูรณ์ (1 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.wall === 'BRICK_CONCRETE' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.wall === 'BRICK_CONCRETE' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>ปูนฉาบ/อิฐบล็อกสากล (0 คะแนน)</span>
                  </div>
                </div>
              </div>

              {/* สภาพห้องสุขา */}
              <div className="mb-1">
                <span className="font-semibold text-slate-700 block mb-1">สภาพห้องสุขา:</span>
                <div className="flex flex-col gap-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.toilet === 'NONE_OR_SHARED_OLD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.toilet === 'NONE_OR_SHARED_OLD' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>ไม่มีส้วมเฉพาะตัว / ชำรุดวิกฤต / ร่วมกับบ้านอื่น (3 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.toilet === 'OWN_GOOD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.toilet === 'OWN_GOOD' && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span>มีส้วมซึม/ส้วมราดน้ำ มีอนามัยที่ดีครบครัน (0 คะแนน)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ฝั่งขวา: ทรัพย์สินและสาธารณูปโภค */}
            <div className="border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs">2. สภาพอำนวยความสะดวกสะท้อนทรัพย์สิน</h4>
                
                {/* พลังงานไฟฟ้า */}
                <div className="mb-3">
                  <span className="font-semibold text-slate-700 block mb-1">ไฟฟ้าในบ้าน:</span>
                  <div className="flex flex-col gap-1.5 text-slate-600">
                    <div className="flex items-center gap-1.5 opacity-90">
                      <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.electricity === 'NONE_OR_SHARED' ? 'bg-slate-900 text-white' : ''}`}>
                        {record.householdCondition.electricity === 'NONE_OR_SHARED' && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span>ไม่มีไฟฟ้าหรือต้องต่อพ่วงพาดสายลำลอง (3 คะแนน)</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-90">
                      <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.electricity === 'METER_OWN' ? 'bg-slate-900 text-white' : ''}`}>
                        {record.householdCondition.electricity === 'METER_OWN' && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span>มีหม้อวัดกระแสไฟฟ้าส่วนตัวของการไฟฟ้าหลัก (0 คะแนน)</span>
                    </div>
                  </div>
                </div>

                {/* แหล่งน้ำบริโภค */}
                <div className="mb-3">
                  <span className="font-semibold text-slate-700 block mb-1">แหล่งน้ำบริโภคหลัก:</span>
                  <div className="flex flex-col gap-1.5 text-slate-600">
                    <div className="flex items-center gap-1.5 opacity-90">
                      <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.water === 'NATURAL_OR_BUY' ? 'bg-slate-900 text-white' : ''}`}>
                        {record.householdCondition.water === 'NATURAL_OR_BUY' && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span>แหล่งน้ำธรรมชาติที่ไม่ได้ผ่านการกรอง / แหล่งซื้อถังพ่วง (2 คะแนน)</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-90">
                      <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.water === 'PIPED_OR_ARTESIAN' ? 'bg-slate-900 text-white' : ''}`}>
                        {record.householdCondition.water === 'PIPED_OR_ARTESIAN' && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span>ประปาของภูมิภาค/การครรลองกรองบาดาลได้มาตรฐาน (0 คะแนน)</span>
                    </div>
                  </div>
                </div>

                {/* การครอบครองที่ดิน */}
                <div className="mb-3">
                  <span className="font-semibold text-slate-700 block mb-1">การครอบครองที่ดินเพื่อการเกษตรกรรม:</span>
                  <div className="grid grid-cols-2 gap-1 text-slate-600">
                    <div className="flex items-center gap-1.5 opacity-90">
                      <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.land === 'NONE' ? 'bg-slate-900 text-white' : ''}`}>
                        {record.householdCondition.land === 'NONE' && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span>ไม่มีเลย/เช่าอาศัย (2 คะแนน)</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-90">
                      <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.land === 'LESS_EQUAL_ONE_RAI' ? 'bg-slate-900 text-white' : ''}`}>
                        {record.householdCondition.land === 'LESS_EQUAL_ONE_RAI' && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span>มีน้อยกว่าหรือเท่ากับ 1 ไร่ (1 คะแนน)</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-90 col-span-2">
                      <span className={`w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center font-bold text-xs ${record.householdCondition.land === 'MORE_THAN_ONE_RAI' ? 'bg-slate-900 text-white' : ''}`}>
                        {record.householdCondition.land === 'MORE_THAN_ONE_RAI' && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span>มีกรรมสิทธิ์การทำกินมากกว่า 1 ไร่ (0 คะแนน)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ยานพาหนะหลัก */}
              <div className="border-t border-slate-150 pt-2 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">การครอบครองยานพาหนะครอบครัว:</span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 border border-slate-400 rounded-xs flex items-center justify-center text-[9px] ${record.householdCondition.vehicle === 'NONE' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.vehicle === 'NONE' && '✓'}
                    </span>
                    <span>มีแต่จักรยาน/ไม่มีเลย (3 คะแนน &times; 1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 border border-slate-400 rounded-xs flex items-center justify-center text-[9px] ${record.householdCondition.vehicle === 'MOTORCYCLE_OLD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.vehicle === 'MOTORCYCLE_OLD' && '✓'}
                    </span>
                    <span>มอเตอร์ไซค์คันดั้งเดิม (2 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 border border-slate-400 rounded-xs flex items-center justify-center text-[9px] ${record.householdCondition.vehicle === 'MOTORCYCLE_GOOD_OR_CAR_OLD' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.vehicle === 'MOTORCYCLE_GOOD_OR_CAR_OLD' && '✓'}
                    </span>
                    <span>มอเตอร์ไซค์คุณสภาพดีพิเศษ (1 คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 border border-slate-400 rounded-xs flex items-center justify-center text-[9px] ${record.householdCondition.vehicle === 'CAR_GOOD_OR_TRUCK' ? 'bg-slate-900 text-white' : ''}`}>
                      {record.householdCondition.vehicle === 'CAR_GOOD_OR_TRUCK' && '✓'}
                    </span>
                    <span>รถยนต์ดี / รถปิคอัพพ่วง (0 คะแนน)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* สรุปคะแนนประเมินสภาพที่อยู่อาศัย */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-slate-500">รวมคะแนนดิบสภาพคร่าวๆ:</span>
                <span className="font-bold font-mono ml-2 text-slate-800">{povertyAnalysis.score} / {povertyAnalysis.maxScore} คะแนน</span>
              </div>
              <div>
                <span className="text-slate-500">ดัชนีชี้วัดความแร้นแค้นที่อยู่อาศัย:</span>
                <span className="font-bold ml-2 text-red-600 font-mono">{povertyAnalysis.percentage}%</span>
              </div>
              <div>
                <span className="text-slate-500">ดัชนีสะท้อนความเสี่ยง:</span>
                <span className="font-bold ml-2 text-slate-800">{povertyAnalysis.level}</span>
              </div>
            </div>

            {/* อุปกรณ์ไอที / สหภาพไฟฟ้าครัวเรือนทางหักคะแนน */}
            <div className="flex gap-2 text-[10px] text-slate-500 flex-wrap justify-end">
              <span>{record.householdCondition.hasComputer ? '[✓ มีอมพิวเตอร์]' : '[ไม่มีคอม]'}</span>
              <span>{record.householdCondition.hasRefrigerator ? '[✓ มีตู้เย็น]' : '[ไม่มีตู้เย็น]'}</span>
              <span>{record.householdCondition.hasWashingMachine ? '[✓ มีเครื่องซักผ้า]' : '[ไม่มีเคร่องซัก]'}</span>
              <span>{record.householdCondition.hasAirConditioner ? '[✓ มีแอร์]' : '[ไม่มีแอร์]'}</span>
            </div>
          </div>
        </div>

        {/* ตอนที่ 3: ภาพถ่ายเชิงจรรยาบรรณ และ จุดพิกัดภูมิศาสตร์ (GPS & Visual Evidence) */}
        <div className="mb-6 break-inside-avoid shadow-xs border border-slate-100 rounded-lg p-3">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-2 mb-3">
            ตอนที่ 3: ข้อมูลยืนยันด้วยภาพถ่ายจริงและหลักฐานพิกัดดาวเทียม
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="relative border border-slate-200 bg-slate-50 rounded-lg overflow-hidden flex flex-col justify-between">
              <div className="aspect-video w-full">
                <img
                  src={record.photos.frontUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'}
                  alt="ภาพถ่ายหน้าบ้านนักเรียน"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  id="img-front-print"
                />
              </div>
              <div className="p-1.5 bg-slate-950/80 text-white text-[9px] text-center font-medium absolute bottom-0 left-0 right-0">
                1. สภาพหน้าบ้าน (ผนัง/หลังคา)
              </div>
            </div>

            <div className="relative border border-slate-200 bg-slate-50 rounded-lg overflow-hidden flex flex-col justify-between">
              <div className="aspect-video w-full">
                <img
                  src={record.photos.insideUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600'}
                  alt="ภาพถ่ายสภาพภายในบ้าน"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  id="img-inside-print"
                />
              </div>
              <div className="p-1.5 bg-slate-950/80 text-white text-[9px] text-center font-medium absolute bottom-0 left-0 right-0">
                2. สภาพพื้นหรือหลังคาภายในบ้าน
              </div>
            </div>

            <div className="relative border border-slate-200 bg-slate-50 rounded-lg overflow-hidden flex flex-col justify-between">
              <div className="aspect-video w-full">
                <img
                  src={record.photos.withStudentUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'}
                  alt="ภาพถ่ายร่วมผู้ปกครองนักเรียน"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  id="img-with-student-print"
                />
              </div>
              <div className="p-1.5 bg-slate-950/80 text-white text-[9px] text-center font-medium absolute bottom-0 left-0 right-0">
                3. นักเรียนคู่ผู้ปกครองถ่ายในพื้นที่
              </div>
            </div>
          </div>

          <div className="flex border border-slate-200 bg-slate-50 rounded-md p-2 justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="text-red-500 w-4 h-4 shrink-0" />
              <span>ตำแหน่งละติจูด-ลองจิจูดของสิ่งปลูกสร้าง:</span>
              <span className="font-mono font-bold text-slate-800">{record.gps.lat.toFixed(6)} , {record.gps.lng.toFixed(6)}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              * ข้อมูลระบุพิกัดดาวเทียมเชื่อมตรงระบบฐานข้อมูล กสศ. ป้องกันการสับสนพื้นที่ซับซ้อน
            </div>
          </div>
        </div>

        {/* ตอนที่ 4: บันทึกของครูและข้อเสนอแนะความต้องการช่วยเหลือ (Teacher Evaluation Details) */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-2 mb-2">
            ตอนที่ 4: สรุปความต้องการเร่งด่วนและการประเมินเชิงรุกของครูประจำชั้น
          </h3>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs mb-3">
            <span className="font-bold text-slate-800 block mb-1">ความต้องการความช่วยเหลือเร่งด่วนที่ขอรับสิทธิการฟื้นฟูเสริมสร้าง:</span>
            {record.assistanceRequired && record.assistanceRequired.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {record.assistanceRequired.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">- ไม่มีการระบุความต้องการเพิ่มเติม -</p>
            )}
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-white text-xs">
            <span className="font-bold text-slate-800 block mb-1">บันทึกใจความการเยี่ยมและสังเกตการณ์เสริม:</span>
            <p className="text-slate-700 leading-relaxed font-sans indent-6">
              {record.teacherComment || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>
          </div>
        </div>

        {/* ผู้รับรองเอกสารและพยานลงนามร่วม (Certifications) */}
        <div className="mt-12 border-t border-slate-300 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 break-inside-avoid">
          {/* ฝั่งซ้าย: ผู้เยี่ยมและกรอกประเมิน */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-9 text-center">
              ขอรับรองว่า ข้อมูลผู้สมัครคัดกรอง ข้อมูลการเยี่ยมบ้าน สภาพแวดล้อม <br />
              และรายรับรายจ่ายทั้งสิ้นที่ระบุเป็นความสัตย์จริงทุกประการ
            </p>
            <div className="w-1/2 border-b border-dashed border-slate-400 mb-2 mt-4"></div>
            <p className="text-xs font-bold text-slate-800 text-center">({record.evaluatorTeacherName})</p>
            <p className="text-[11px] text-slate-500 text-center mt-1">{record.evaluatorTeacherPosition}</p>
            <p className="text-[10px] text-slate-400 text-center">ผู้รายงานตรวจประเมินบ้านนักเรียน</p>
          </div>

          {/* ฝั่งขวา: พยานชุมชนลงลายมือชื่อพยาน (ตามระเบียบคัดกรอง นร.01) */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-9 text-center">
              ข้าพเจ้าในฐานะตัวแทนชุนชน/ส่วนท้องถิ่น ได้รับรู้ร่วมตรวจดูสภาพที่บ้านจริง <br />
              และขอรับรองว่าสภาพแวดล้อมที่อยู่อาศัยเป็นไปตามข้อมูลที่บันทึกไว้จริง
            </p>
            <div className="w-1/2 border-b border-dashed border-slate-400 mb-2 mt-4"></div>
            <p className="text-xs font-bold text-slate-800 text-center">({record.villageHeadmanName})</p>
            <p className="text-[11px] text-slate-500 text-center mt-1">ผู้ใหญ่บ้าน / อสม. ประจำตำบลพยานคู่คัดกรอง</p>
            <p className="text-[10px] text-slate-400 text-center">พยานชุมชนผู้ร่วมตรวจสอบสิทธิ</p>
          </div>
        </div>

        {/* ท้ายแผ่นแบบฟอร์ม - สำหรับข้อกำหนดระเบียบที่จำเป็น */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[9px] text-slate-400">
          <p>จัดพิมพ์โดยระบบสแกนเอกสารเยี่ยมบ้านนักเรียนระดับภูมิภาค โรงเรียนสุขเกษมศึกษา ปีงบประมาณการคัดกรอง {record.schoolYear}</p>
          <p>ข้อมูลทั้งหมดถือเป็นความลับส่วนบุคคลขั้นสูงสุดตามพระราชบัญญัติข้อมูลข่าวสารราชการและเกณฑ์เพื่อผลประโยชน์แก่เด็กยากจนเท่านั้น</p>
        </div>

      </div>
    </div>
  );
}
