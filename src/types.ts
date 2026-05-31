/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RoofMaterial {
  Natural = 'NATURAL', // หญ้าคา/ใบจาก/วัสดุธรรมชาติ/ผุพัง
  ZincOld = 'ZINC_OLD', // สังกะสีเก่า/ผุพัง
  ZincGood = 'ZINC_GOOD', // สังกะสีสภาพดี/กระเบื้องลอนคู่
  TileConcrete = 'TILE_CONCRETE', // กระเบื้องเซรามิก/คอนกรีต
}

export enum WallMaterial {
  Natural = 'NATURAL', // ไม้ไผ่/ฝายาขาดรุ่งริ่ง/ใบจาก/ไม่มีฝาฝนสาด
  WoodOld = 'WOOD_OLD', // ไม้เก่าผุ/สังกะสีสลับเศษไม้
  WoodGood = 'WOOD_GOOD', // ไม้แผ่นสภาพดี/ไม้ฝาเฌอร่า
  BrickConcrete = 'BRICK_CONCRETE', // อิฐบล็อก/คอนกรีต/ตึกฉาบปูน
}

export enum ToiletStatus {
  NoneOrSharedOld = 'NONE_OR_SHARED_OLD', // ไม่มีสุขาในบ้าน/ห้องน้ำซอมซ่อมาก/ใช้ร่วมกันกับบ้านอื่น
  OwnGood = 'OWN_GOOD', // มีสุขาเป็นของครัวเรือน สภาพสุขอนามัยดี
}

export enum WaterSource {
  NaturalOrBuy = 'NATURAL_OR_BUY', // แหล่งน้ำธรรมชาติ/ห้วยหนองคลองบึง/น้ำฝน/ต้องซื้อน้ำเกือบทั้งหมด
  PipedOrArtesian = 'PIPED_OR_ARTESIAN', // น้ำประปาหมู่บ้าน/ประปาส่วนภูมิภาค/น้ำบาดาลผ่านการกรอง
}

export enum ElectricityStatus {
  NoneOrShared = 'NONE_OR_SHARED', // ไม่มีไฟฟ้า/ต้องพ่วงสายพ่วงจากบ้านอื่น/เทียนไข/แบตเตอรี่รถยนต์
  MeterOwn = 'METER_OWN', // มีหม้อแปลงไฟฟ้าของตนเอง (มีการไฟฟ้านครหลวง/ส่วนภูมิภาค)
}

export enum VehicleOwnership {
  None = 'NONE', // มีเพียงจักรยาน หรือไม่มีเลย
  MotorcycleOld = 'MOTORCYCLE_OLD', // สกู๊ตเตอร์/จักรยานยนต์เก่า
  MotorcycleGoodOrCarOld = 'MOTORCYCLE_GOOD_OR_CAR_OLD', // มอเตอร์ไซค์สภาพดี หรือมีรถยนต์นั่งส่วนบุคคลเก่ามาก
  CarGoodOrTruck = 'CAR_GOOD_OR_TRUCK', // รถยนต์สภาพดี/รถกระบะ/รถตู้/รถเพื่อการเกษตรขนาดใหญ่
}

export enum LandStatus {
  None = 'NONE', // ไม่มีที่ดินทำกิน/เช่า/อาศัยผู้อื่นอยู่
  LessEqualOneRai = 'LESS_EQUAL_ONE_RAI', // มีที่ดินแต่น้อยกว่าหรือเท่ากับ 1 ไร่
  MoreThanOneRai = 'MORE_THAN_ONE_RAI', // มีที่ดินมากกว่า 1 ไร่
}

export interface FamilyMember {
  id: string;
  relation: string; // เช่น พ่อ, แม่, ปู่, ย่า, พี่สาว, ตัวนักเรียน
  age: number;
  education: string; // ระดับการศึกษา
  occupation: string; // อาชีพหลัก
  monthlyIncome: number; // รายได้เฉลี่ยต่อเดือน (บาท)
  disabilityOrChronicIllness: boolean; // มีความพิการหรือเจ็บป่วยเรื้อรัง
  singleParentStatus: boolean; // พ่อแม่เลี้ยงเดี่ยว (เฉพาะผู้ปกครองหลัก)
}

export interface HouseholdCondition {
  roof: RoofMaterial;
  wall: WallMaterial;
  toilet: ToiletStatus;
  water: WaterSource;
  electricity: ElectricityStatus;
  vehicle: VehicleOwnership;
  land: LandStatus;
  hasComputer: boolean;
  hasRefrigerator: boolean;
  hasWashingMachine: boolean;
  hasAirConditioner: boolean;
}

export interface HousePhotos {
  frontUrl: string; // ภาพถ่ายหน้าบ้าน (เห็นหลังคาและผนังทั้งหมด)
  insideUrl: string; // ภาพถ่ายในบ้าน (เห็นพื้นและหลังคา/การเป็นอยู่)
  withStudentUrl: string; // ภาพถ่ายนักเรียนคู่กับผู้ปกครองหน้าบ้าน
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export enum PovertyStatus {
  Normal = 'NORMAL', // กลุ่มปกติ (รายได้เฉลี่ย > 3,000 บ./เดือน)
  Poor = 'POOR', // กลุ่มยากจน (รายได้เฉลี่ย <= 3,000 บ./เดือน แต่คะแนนสถานะครัวเรือนไม่ถึงเกณฑ์วิกฤต)
  ExtremelyPoor = 'EXTREMELY_POOR', // กลุ่มยากจนพิเศษ (สอดคล้องกับเกณฑ์ กสศ. รายได้เฉลี่ย <= 1,500 บ./เดือน และคะแนนสถานะครัวเรือนสูง)
}

export interface HomeVisitRecord {
  id: string;
  studentId: string;
  studentCode: string; // รหัสนักเรียน
  studentPrefix: 'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว';
  studentName: string;
  studentLastName: string;
  grade: string; // ชั้นเรียน เช่น ป.1/1, ม.3/2
  schoolYear: string; // ปีการศึกษา เช่น 2569
  birthDate: string; // เช่น 2555-08-12
  citizenId: string; // เลขบัตรประชาชน
  schoolName: string;

  // ครัวเรือนและการเดินทาง
  distanceToSchool: number; // ระยะทางไปโรงเรียน (กิโลเมตร)
  travelMethod: string; // วิธีการเดินทาง เช่น เดิน, รถจักรยานยนต์ส่วนตัว, รถเมล์, รถรับส่งนักเรียน
  travelCostPerDay: number; // ค่าเดินทางเฉลี่ยต่อวัน (บาท)

  // สมาชิกในครัวเรือน
  familyMembers: FamilyMember[];

  // สถานะครัวเรือนคัดกรอง (นร.01)
  householdCondition: HouseholdCondition;

  // พิกัด GPS บ้าน
  gps: Coordinate;

  // รูปถ่ายบ้าน
  photos: HousePhotos;

  // ข้อคิดเห็นและข้อมูลประกอบเพิ่มเติม
  teacherComment: string; // ความเห็นครูผู้เยี่ยมบ้าน
  assistanceRequired: string[]; // ความช่วยเหลือที่ต้องการเร่งด่วน เช่น ทุนการศึกษา, เครื่องอุปโภคบริโภค, อุปกรณ์การเรียน, ซ่อมแซมบ้าน
  
  // ผู้ลงนามรับรอง
  surveyDate: string;
  evaluatorTeacherName: string;
  evaluatorTeacherPosition: string;
  villageHeadmanName: string; // ลายมือชื่อพยาน เช่น ผู้ใหญ่บ้าน/กำนัน/อสม./ข้าราชการท้องถิ่น (การรับรอง นร.01)
}
