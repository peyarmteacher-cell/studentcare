/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HomeVisitRecord,
  RoofMaterial,
  WallMaterial,
  ToiletStatus,
  WaterSource,
  ElectricityStatus,
  VehicleOwnership,
  LandStatus,
  PovertyStatus,
  FamilyMember,
  HouseholdCondition
} from './types';

// คำนวณคะแนนความยากจนของสภาพที่อยู่อาศัย (0 - 100)
export function calculatePovertyIndex(condition: HouseholdCondition): {
  score: number;
  maxScore: number;
  percentage: number;
  level: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงมาก (วิกฤต)';
} {
  let score = 0;
  
  // 1. หลังคา (สูงสุด 3 คะแนน)
  if (condition.roof === RoofMaterial.Natural) score += 3;
  else if (condition.roof === RoofMaterial.ZincOld) score += 2;
  else if (condition.roof === RoofMaterial.ZincGood) score += 1;
  else if (condition.roof === RoofMaterial.TileConcrete) score += 0;

  // 2. ฝาผนัง (สูงสุด 3 คะแนน)
  if (condition.wall === WallMaterial.Natural) score += 3;
  else if (condition.wall === WallMaterial.WoodOld) score += 2;
  else if (condition.wall === WallMaterial.WoodGood) score += 1;
  else if (condition.wall === WallMaterial.BrickConcrete) score += 0;

  // 3. สุขา (สูงสุด 3 คะแนน)
  if (condition.toilet === ToiletStatus.NoneOrSharedOld) score += 3;
  else if (condition.toilet === ToiletStatus.OwnGood) score += 0;

  // 4. แหล่งน้ำ (สูงสุด 2 คะแนน)
  if (condition.water === WaterSource.NaturalOrBuy) score += 2;
  else if (condition.water === WaterSource.PipedOrArtesian) score += 0;

  // 5. ไฟฟ้า (สูงสุด 3 คะแนน)
  if (condition.electricity === ElectricityStatus.NoneOrShared) score += 3;
  else if (condition.electricity === ElectricityStatus.MeterOwn) score += 0;

  // 6. ยานพาหนะ (สูงสุด 3 คะแนน)
  if (condition.vehicle === VehicleOwnership.None) score += 3;
  else if (condition.vehicle === VehicleOwnership.MotorcycleOld) score += 2;
  else if (condition.vehicle === VehicleOwnership.MotorcycleGoodOrCarOld) score += 1;
  else if (condition.vehicle === VehicleOwnership.CarGoodOrTruck) score += 0;

  // 7. ที่ดิน (สูงสุด 2 คะแนน)
  if (condition.land === LandStatus.None) score += 2;
  else if (condition.land === LandStatus.LessEqualOneRai) score += 1;
  else if (condition.land === LandStatus.MoreThanOneRai) score += 0;

  // หักลบความยากจนตามเครื่องใช้ไฟฟ้าที่มี (เกณฑ์คัดกรอง)
  let assetDeductions = 0;
  if (condition.hasComputer) assetDeductions += 1;
  if (condition.hasRefrigerator) assetDeductions += 1;
  if (condition.hasWashingMachine) assetDeductions += 2;
  if (condition.hasAirConditioner) assetDeductions += 3;

  const rawScore = Math.max(0, score - assetDeductions);
  const maxScore = 19; // 3+3+3+2+3+3+2
  const percentage = Math.round((rawScore / maxScore) * 100);

  let level: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงมาก (วิกฤต)' = 'ต่ำ';
  if (percentage >= 75) level = 'สูงมาก (วิกฤต)';
  else if (percentage >= 50) level = 'สูง';
  else if (percentage >= 25) level = 'ปานกลาง';

  return {
    score: rawScore,
    maxScore,
    percentage,
    level,
  };
}

// คำนวณรายได้เฉลี่ยสมาชิกครอบครัวต่อคนต่อเดือน
export function calculateIncomePerCapita(members: FamilyMember[]): number {
  if (members.length === 0) return 0;
  const totalIncome = members.reduce((sum, member) => sum + (member.monthlyIncome || 0), 0);
  return Math.round(totalIncome / members.length);
}

// ประเมินกลุ่มสถานะความยากจนสอดคล้องสถานะ กสศ.
export function evaluatePovertyStatus(record: {
  familyMembers: FamilyMember[];
  householdCondition: HouseholdCondition;
}): PovertyStatus {
  const perCapitaIncome = calculateIncomePerCapita(record.familyMembers);
  const { percentage } = calculatePovertyIndex(record.householdCondition);

  // เกณฑ์ กสศ. / ปัจจัยพื้นฐานนักเรียนยากจน:
  // - ยากจนพิเศษ: รายได้เฉลี่ยครอบครัวต่อคนต่อเดือน <= 1,500 บาท และสภาพบ้านมีความแร้นแค้นสูง (คะแนนสภาพครัวเรือน >= 50%)
  // - ยากจน: รายได้เฉลี่ยครอบครัวต่อคนต่อเดือน <= 3,000 บาท
  // - ปกติ: รายได้เฉลี่ยต่อคนต่อเดือน > 3,000 บาท
  if (perCapitaIncome <= 1500 && percentage >= 45) {
    return PovertyStatus.ExtremelyPoor;
  } else if (perCapitaIncome <= 3000) {
    return PovertyStatus.Poor;
  } else {
    return PovertyStatus.Normal;
  }
}

export function getPovertyBadgeProps(status: PovertyStatus): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  switch (status) {
    case PovertyStatus.ExtremelyPoor:
      return {
        label: 'ยากจนพิเศษ (กสศ.)',
        bgClass: 'bg-red-50 border-red-200 text-red-700',
        bgClassPlain: 'bg-red-500',
        textClass: 'text-red-700',
      } as any;
    case PovertyStatus.Poor:
      return {
        label: 'ยากจน',
        bgClass: 'bg-amber-50 border-amber-200 text-amber-700',
        bgClassPlain: 'bg-amber-500',
        textClass: 'text-amber-700',
      } as any;
    case PovertyStatus.Normal:
      return {
        label: 'ทั่วไป / ปกติ',
        bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        bgClassPlain: 'bg-emerald-500',
        textClass: 'text-emerald-700',
      } as any;
  }
}

// ข้อมูลตัวอย่างที่สอดคล้องกับสภาพความเป็นจริงสำหรับการนำเสนอและปริ้นท์ นร.01
export const initialHomeVisits: HomeVisitRecord[] = [
  {
    id: 'visit-01',
    studentId: 'std-201',
    studentCode: '69101',
    studentPrefix: 'เด็กชาย',
    studentName: 'ภูมิพัฒน์',
    studentLastName: 'ทองสุก',
    grade: 'ประถมศึกษาปีที่ 4/2',
    schoolYear: '2569',
    birthDate: '2016-10-15',
    citizenId: '1-1002-34928-11-2',
    schoolName: 'โรงเรียนสุขเกษมศึกษา',
    distanceToSchool: 8.5,
    travelMethod: 'รถจักรยานยนต์ส่วนตัวของผู้ปกครอง',
    travelCostPerDay: 25,
    familyMembers: [
      {
        id: 'mem-1',
        relation: 'มารดา (มารดาเลี้ยงเดี่ยว)',
        age: 38,
        education: 'ประถมศึกษาปีที่ 6',
        occupation: 'รับจ้างเย็บผ้า/ทำความสะอาดทั่วไป',
        monthlyIncome: 4500,
        disabilityOrChronicIllness: false,
        singleParentStatus: true
      },
      {
        id: 'mem-2',
        relation: 'คุณยาย',
        age: 69,
        education: 'ไม่ได้เรียนหนังสือ',
        occupation: 'ผู้สูงอายุไม่ได้ทำงาน',
        monthlyIncome: 700, // เบี้ยผู้สูงอายุ
        disabilityOrChronicIllness: true,
        singleParentStatus: false
      },
      {
        id: 'mem-3',
        relation: 'ตัวนักเรียน (ด.ช.ภูมิพัฒน์)',
        age: 10,
        education: 'กำลังศึกษาชั้น ป.4',
        occupation: 'นักเรียน',
        monthlyIncome: 0,
        disabilityOrChronicIllness: false,
        singleParentStatus: false
      }
    ],
    householdCondition: {
      roof: RoofMaterial.ZincOld, // สังกะสีเก่าผุพัง
      wall: WallMaterial.WoodOld, // ไม้ไผ่/ไม้เก่าพุพัง
      toilet: ToiletStatus.NoneOrSharedOld, // สุขาแชร์หรือซอมซ่อมาก
      water: WaterSource.NaturalOrBuy, // ซื้อน้ำถังบริโภค
      electricity: ElectricityStatus.NoneOrShared, // ต่อไฟพ่วงจากเพื่อนบ้าน
      vehicle: VehicleOwnership.MotorcycleOld, // มอเตอร์ไซค์เก่า
      land: LandStatus.None, // ไม่มีที่ดิน
      hasComputer: false,
      hasRefrigerator: true,
      hasWashingMachine: false,
      hasAirConditioner: false
    },
    gps: { lat: 14.1204, lng: 100.6139 },
    photos: {
      frontUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600', // รูปบ้านไม้สังกะสีทรุดโทรม
      insideUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600', // รูปในห้องแคบๆ เก่าๆ
      withStudentUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600' // ผู้ปกครองและนักเรียนยิ้ม
    },
    teacherComment: 'จากการเยี่ยมบ้านพบว่านักเรียนอาศัยอยู่กับมารดาและคุณยายซึ่งเจ็บป่วยเรื้อรัง มารดาทำงานรับจ้างมีรายได้ไม่แน่นอน สภาพบ้านทรุดโทรม หลังคาสังกะสีเก่ามีรูรั่วหลายแห่ง เวลาฝนตกต้องคอยวางกะละมังรองน้ำฝน มีความลำบากเรื่องที่อยู่อาศัยและค่าครองชีพเป็นอย่างยิ่ง มีเกณฑ์ความยากจนเข้าข่ายที่จะได้รับการช่วยเหลือในระดับยากจนพิเศษ (กสศ.) อย่างเร่งด่วน',
    assistanceRequired: ['ทุนการศึกษาทุนปัจจัยพื้นฐาน', 'เครื่องอุปโภคบริโภค/ข้าวสารอาหารแห้ง', 'ซ่อมแซมฝาบ้านและหลังคากันฝน'],
    surveyDate: '2026-05-30',
    evaluatorTeacherName: 'คุณครูขวัญใจ ใจดี',
    evaluatorTeacherPosition: 'ครูประจำชั้นประถมศึกษาปีที่ 4/2',
    villageHeadmanName: 'นายศักดิ์สิทธิ์ ยอดเมือง (ผู้ใหญ่บ้านหมู่ 3)'
  },
  {
    id: 'visit-02',
    studentId: 'std-202',
    studentCode: '69102',
    studentPrefix: 'เด็กหญิง',
    studentName: 'ณิชนันทน์',
    studentLastName: 'แสนดี',
    grade: 'มัธยมศึกษาปีที่ 2/1',
    schoolYear: '2569',
    birthDate: '2012-04-20',
    citizenId: '1-3001-49281-99-1',
    schoolName: 'โรงเรียนสุขเกษมศึกษา',
    distanceToSchool: 3.2,
    travelMethod: 'เดินเท้า',
    travelCostPerDay: 0,
    familyMembers: [
      {
        id: 'mem-3',
        relation: 'บิดา',
        age: 46,
        education: 'ประถมศึกษาปีที่ 6',
        occupation: 'รับจ้างก่อสร้างรายวัน',
        monthlyIncome: 7500,
        disabilityOrChronicIllness: false,
        singleParentStatus: false
      },
      {
        id: 'mem-4',
        relation: 'มารดา',
        age: 41,
        education: 'มัธยมศึกษาปีที่ 3',
        occupation: 'รับจ้างร้านอาหารทั่วไป',
        monthlyIncome: 6000,
        disabilityOrChronicIllness: false,
        singleParentStatus: false
      },
      {
        id: 'mem-5',
        relation: 'น้องชาย',
        age: 7,
        education: 'อนุบาล 3',
        occupation: 'นักเรียน',
        monthlyIncome: 0,
        disabilityOrChronicIllness: false,
        singleParentStatus: false
      },
      {
        id: 'mem-6',
        relation: 'ตัวนักเรียน',
        age: 14,
        education: 'ม.2',
        occupation: 'นักเรียน',
        monthlyIncome: 0,
        disabilityOrChronicIllness: false,
        singleParentStatus: false
      }
    ],
    householdCondition: {
      roof: RoofMaterial.ZincGood, // สังกะสีสภาพดี
      wall: WallMaterial.WoodGood, // ไม้สภาพดี
      toilet: ToiletStatus.OwnGood, // มีสุขาแบบถูกสุขลักษณะในบ้าน
      water: WaterSource.PipedOrArtesian, // น้ำประปาหมู่บ้าน
      electricity: ElectricityStatus.MeterOwn, // มีมิเตอร์ไฟฟ้าส่วนตัว
      vehicle: VehicleOwnership.MotorcycleGoodOrCarOld, // มอเตอร์ไซค์สภาพใช้งานได้
      land: LandStatus.LessEqualOneRai, // ที่ดินไม่เกิน 1 ไร่
      hasComputer: false,
      hasRefrigerator: true,
      hasWashingMachine: false,
      hasAirConditioner: false
    },
    gps: { lat: 14.1287, lng: 100.6185 },
    photos: {
      frontUrl: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&q=80&w=600', // รูปบ้านไม้ไทยร่วมสมัยสภาพดีปานกลาง
      insideUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=600', // ห้องนั่งเล่นสะอาดเรียบร้อย
      withStudentUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600' // รูปครอบครัวรวมตัวกันอบอุ่น
    },
    teacherComment: 'บิดามารดาทำงานเต็มเวลา มีรายได้เฉลี่ยรวม 13,500 บาทต่อเดือน สมาชิกครอบครัวรวม 4 คน รายได้ต่อหัวตกคนละ 3,375 บาทต่อเดือน ซึ่งเกินเกณฑ์ยากจนเล็กน้อย สภาพบ้านมีความแข็งแรงมั่นคงตามอัตภาพ มีสิ่งอำนวยความสะดวกพื้นฐานครบถ้วน มีความสัมพันธ์อันดีในครอบครัว และสนับสนุนการศึกษาของนักเรียนเป็นอย่างดี',
    assistanceRequired: ['อุปกรณ์การเรียนและเครื่องเขียน', 'ชุดพละและชุดกีฬาสโมสรของโรงเรียน'],
    surveyDate: '2026-05-28',
    evaluatorTeacherName: 'คุณครูสนอง ผ่องแผ้ว',
    evaluatorTeacherPosition: 'ครูประจำชั้นมัธยมศึกษาปีที่ 2/1',
    villageHeadmanName: 'นางศิริวรรณ ทองมี (อสม. ประจำชุมชน)'
  },
  {
    id: 'visit-03',
    studentId: 'std-203',
    studentCode: '69103',
    studentPrefix: 'เด็กชาย',
    studentName: 'กรวิชญ์',
    studentLastName: 'มณีวรรณ',
    grade: 'ประถมศึกษาปีที่ 1/1',
    schoolYear: '2569',
    birthDate: '2019-09-02',
    citizenId: '1-5099-02931-10-1',
    schoolName: 'โรงเรียนสุขเกษมศึกษา',
    distanceToSchool: 12.0,
    travelMethod: 'รถรับส่งนักเรียนหมู่บ้าน',
    travelCostPerDay: 40,
    familyMembers: [
      {
        id: 'mem-7',
        relation: 'ปู่',
        age: 72,
        education: 'ไม่ได้การศึกษา',
        occupation: 'ผู้สูงอายุ/เก็บของเก่าขายบางสัปดาห์',
        monthlyIncome: 1300, 
        disabilityOrChronicIllness: true,
        singleParentStatus: false
      },
      {
        id: 'mem-8',
        relation: 'ย่า',
        age: 68,
        education: 'ไม่ได้เรียนหนังสือ',
        occupation: 'ผู้สูงอายุไม่ได้ทำงาน',
        monthlyIncome: 600,
        disabilityOrChronicIllness: true,
        singleParentStatus: false
      },
      {
        id: 'mem-9',
        relation: 'ตัวนักเรียน',
        age: 6,
        education: 'ป.1',
        occupation: 'นักเรียน',
        monthlyIncome: 0,
        disabilityOrChronicIllness: false,
        singleParentStatus: false
      }
    ],
    householdCondition: {
      roof: RoofMaterial.Natural, // หลังคาหญ้าคา/ธรรมชาติผุผังมาก
      wall: WallMaterial.Natural, // ไม้ไผ่ขัดแตะ/ผุพังรอบทิศ
      toilet: ToiletStatus.NoneOrSharedOld, // ไม่มีสุขาในบ้าน ต้องอาศัยญาติฝั่งตรงข้าม
      water: WaterSource.NaturalOrBuy, // ตักน้ำจากหนองประปาธรรมชาติ
      electricity: ElectricityStatus.NoneOrShared, // โคมตะเกียงและต่อพ่วงสายยาวจากคนรู้จักข้างชุมชน
      vehicle: VehicleOwnership.None, // ไม่มีรถมอเตอร์ไซค์ เดินหรือขึ้นรถพ่วงเพื่อนบ้าน
      land: LandStatus.None, // อาศัยที่วัดอยู่ชั่วคราว
      hasComputer: false,
      hasRefrigerator: false,
      hasWashingMachine: false,
      hasAirConditioner: false
    },
    gps: { lat: 14.1102, lng: 100.6052 },
    photos: {
      frontUrl: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&q=80&w=600', // หลังคาใบจากสลับไม้ไผ่
      insideUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600', // ภายในแร้นแค้น ฝาไม้ผุๆ
      withStudentUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600' // คุณปู่กอดหลานหน้าเต็นท์พักไม้ไผ่
    },
    teacherComment: 'นักเรียนหน้าตาซูบผอมและไม่ได้อาศัยอยู่กับคุณพ่อคุณแม่ ปู่และย่าชราภาพมากสุขภาพไม่ดีนัก รายได้มาจากเบี้ยยังชีพชราภาพและเก็บขยะขายเป็นหลัก สภาพที่อยู่อาศัยผุพังสั่นคลอนและไม่มีความมั่นคงปลอดภัย ไม่มีระบบสาธารณูปโภคครอบครองส่วนตัว ควรได้รับการขึ้นทะเบียนเป็นผู้ยากจนพิเศษของโรงเรียนเพื่อรับสวัสดิการ กสศ. สูงสุดรวมถึงความช่วยเหลือจากสังคมภายนอกทันที',
    assistanceRequired: ['ทุนเลี้ยงชีพรายเดือนเด็กยากขัดสน', 'สร้าง/ซ่อมแซมที่อยู่อาศัยให้ปลอดภัยยิ่งขึ้น', 'อาหารเสริมพรีเมี่ยมและนมเพื่อการเจริญเติบโต', 'แพ็คเกจตรวจสุขภาพคุณปู่คุณย่า'],
    surveyDate: '2026-05-29',
    evaluatorTeacherName: 'คุณครูอรอนงค์ รักเรียน',
    evaluatorTeacherPosition: 'ครูประจำชั้นประถมศึกษาปีที่ 1/1',
    villageHeadmanName: 'ผู้ใหญ่สุข สมบูรณ์ (ผู้ใหญ่บ้านหมู่ 1)'
  }
];
