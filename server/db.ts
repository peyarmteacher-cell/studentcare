/**
 * Database Initializer & Connection Helper (SaaS-ready MySQL with SQLite Fallback)
 * Supporting: School Admin and Super Admin Workflow
 */

import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Database configurations
const useMySQL = !!(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);

export interface DbProvider {
  type: 'mysql' | 'sqlite';
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ insertId?: string | number; affectedRows: number }>;
}

let dbInstance: DbProvider;

// Helper to convert named SQL queries with (?) bindings interchangeably
function convertSqlForSqlite(sql: string): string {
  // SQLite supports standard ANSI SQL, but we make sure types match
  let converted = sql
    .replace(/LONGTEXT/g, 'TEXT')
    .replace(/DATETIME/g, 'TEXT')
    .replace(/AUTO_INCREMENT/g, 'AUTOINCREMENT')
    .replace(/INT\s+default\s+(\d+)/gi, 'INTEGER DEFAULT $1')
    .replace(/INT/g, 'INTEGER');
  return converted;
}

async function initMySQL(): Promise<DbProvider> {
  const host = process.env.MYSQL_HOST;
  const port = parseInt(process.env.MYSQL_PORT || '3306');
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  console.log(`[Database] Attempting connection to MySQL: ${host}:${port}, User: ${user}`);

  // Create database if not exists using connection without DB specified
  const initConn = await mysql.createConnection({ host, port, user, password });
  await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await initConn.end();

  // Connect to actual database
  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return {
    type: 'mysql',
    query: async <T>(sql: string, params: any[] = []): Promise<T[]> => {
      const [rows] = await pool.query(sql, params);
      return rows as T[];
    },
    execute: async (sql: string, params: any[] = []) => {
      const [result] = await pool.execute(sql, params);
      const res = result as any;
      return {
        insertId: res.insertId,
        affectedRows: res.affectedRows || 0
      };
    }
  };
}

async function initSQLite(): Promise<DbProvider> {
  // Determine application root directory securely to bypass iisnode/Plesk process.cwd() issues
  let appRootDir = __dirname;
  try {
    const parentDir = path.resolve(__dirname, '..');
    if (fs.existsSync(path.join(parentDir, 'package.json')) || fs.existsSync(path.join(parentDir, 'index.html'))) {
      appRootDir = parentDir;
    }
  } catch (e) {
    // Fallback to __dirname
  }

  const dbPath = path.join(appRootDir, 'home_visits.sqlite');
  console.log(`[Database] Using local SQLite fallback database at: ${dbPath}`);

  // Create SQLite Database connection and make sure folders exist
  const db = new sqlite3.Database(dbPath);

  // Helper wrapper for sqlite with Promises
  const query = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      db.all(convertSqlForSqlite(sql), params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  };

  const execute = (sql: string, params: any[] = []): Promise<{ insertId?: string | number; affectedRows: number }> => {
    return new Promise((resolve, reject) => {
      db.run(convertSqlForSqlite(sql), params, function (this: any, err) {
        if (err) reject(err);
        else {
          resolve({
            insertId: this.lastID,
            affectedRows: this.changes
          });
        }
      });
    });
  };

  return {
    type: 'sqlite',
    query,
    execute
  };
}

export async function getDb(): Promise<DbProvider> {
  if (dbInstance) return dbInstance;

  try {
    if (useMySQL) {
      dbInstance = await initMySQL();
      console.log('[Database] Connected successfully to MySQL Client.');
    } else {
      dbInstance = await initSQLite();
      console.log('[Database] SQLite local database mode loaded.');
    }
  } catch (error) {
    console.error('[Database] Failed to initialize specified DB config. Falling back to local SQLite...', error);
    dbInstance = await initSQLite();
  }

  // Auto-initialize base tables schema
  await bootstrapTables(dbInstance);

  return dbInstance;
}

async function bootstrapTables(db: DbProvider) {
  console.log(`[Database] Bootstrapping schema on ${db.type.toUpperCase()}...`);

  // Table 1: Schools
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schools (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      logoUrl TEXT,
      directorName VARCHAR(255),
      schoolArea VARCHAR(255),
      approved INT DEFAULT 0,
      createdAt VARCHAR(50) NOT NULL
    )
  `);

  // Table 2: Users (Admin / Teacher accounts)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      schoolId VARCHAR(50),
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      fullName VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      classroom VARCHAR(100),
      approved INT DEFAULT 1
    )
  `);

  // Table 3: Students list
  await db.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(50) PRIMARY KEY,
      schoolId VARCHAR(50) NOT NULL,
      studentCode VARCHAR(50) NOT NULL,
      prefix VARCHAR(20) NOT NULL,
      fullName VARCHAR(255) NOT NULL,
      nickname VARCHAR(100),
      gender VARCHAR(20) NOT NULL,
      birthDate VARCHAR(50),
      classroom VARCHAR(100) NOT NULL,
      room VARCHAR(50),
      citizenId VARCHAR(20) NOT NULL,
      address VARCHAR(255),
      village VARCHAR(100),
      subdistrict VARCHAR(100),
      district VARCHAR(100),
      province VARCHAR(100),
      zipcode VARCHAR(20),
      parentName VARCHAR(255),
      parentRelation VARCHAR(100),
      parentPhone VARCHAR(50),
      parentJob VARCHAR(255),
      status VARCHAR(50) DEFAULT 'ยังไม่เยี่ยม',
      createdAt VARCHAR(50) NOT NULL
    )
  `);

  // Table 4: Home Visits (นร.01)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS home_visits (
      id VARCHAR(50) PRIMARY KEY,
      studentId VARCHAR(50) NOT NULL,
      schoolId VARCHAR(50) NOT NULL,
      visitDate VARCHAR(50) NOT NULL,
      semester VARCHAR(20) NOT NULL,
      schoolYear VARCHAR(20) NOT NULL,
      visitStatus VARCHAR(50) DEFAULT 'สมบูรณ์',
      familyStatus VARCHAR(100),
      livingWith VARCHAR(100),
      guardianName VARCHAR(255),
      guardianRelation VARCHAR(100),
      guardianCitizenId VARCHAR(50),
      guardianEducation VARCHAR(100),
      guardianJob VARCHAR(255),
      guardianPhone VARCHAR(50),
      stateWelfare VARCHAR(100),
      totalMembers INT DEFAULT 1,
      houseType VARCHAR(50),
      houseOwnership VARCHAR(100),
      monthlyRent INT DEFAULT 0,
      floorMaterial VARCHAR(100),
      wallMaterial VARCHAR(100),
      roofMaterial VARCHAR(100),
      hasToilet VARCHAR(50),
      farmLand VARCHAR(50),
      waterSource VARCHAR(100),
      electricity VARCHAR(100),
      vehicles VARCHAR(255),
      travelMethod VARCHAR(100),
      travelDistance VARCHAR(50),
      travelTime VARCHAR(100),
      travelCost VARCHAR(50),
      dailyAllowance VARCHAR(50),
      homeAddress TEXT,
      latitude VARCHAR(50),
      longitude VARCHAR(50),
      studentImage LONGTEXT,
      outsideImage LONGTEXT,
      insideImage LONGTEXT,
      signatureStudent LONGTEXT,
      signatureParent LONGTEXT,
      signatureTeacher LONGTEXT,
      signatureGov LONGTEXT,
      signatureDirector LONGTEXT,
      teacherName VARCHAR(255),
      directorName VARCHAR(255),
      govName VARCHAR(255),
      govPosition VARCHAR(255),
      note TEXT,
      createdAt VARCHAR(50) NOT NULL
    )
  `);

  // Table 5: Household Members detail list
  await db.execute(`
    CREATE TABLE IF NOT EXISTS home_members (
      id VARCHAR(50) PRIMARY KEY,
      visitId VARCHAR(50) NOT NULL,
      fullName VARCHAR(255) NOT NULL,
      relation VARCHAR(100) NOT NULL,
      citizenId VARCHAR(50),
      age VARCHAR(50),
      totalIncome VARCHAR(50) DEFAULT '0'
    )
  `);

  // Provision safe defaults
  // 1. Super Admin Account
  const superuser = await db.query("SELECT * FROM users WHERE username = 'superadmin'");
  if (superuser.length === 0) {
    console.log('[Database] Provisioning default Super Admin account (superadmin / password123)...');
    await db.execute(
      `INSERT INTO users (id, schoolId, username, password, fullName, role, approved) 
       VALUES ('usr-super', NULL, 'superadmin', 'password123', 'ผู้ดูแลระบบสูงสุด (Super Admin)', 'super_admin', 1)`
    );
  }

  // 2. Default Approved School
  const defaultSchoolId = 'sch-default';
  const defaultSchool = await db.query("SELECT * FROM schools WHERE id = ?", [defaultSchoolId]);
  if (defaultSchool.length === 0) {
    console.log('[Database] Provisioning default approved school (โรงเรียนสุขเกษมศึกษา)...');
    await db.execute(
      `INSERT INTO schools (id, name, code, logoUrl, directorName, schoolArea, approved, createdAt) 
       VALUES (?, 'โรงเรียนสุขเกษมศึกษา', 'OBEC9001', 'https://img2.pic.in.th/logo.jpg.png', 'ดร.มานะ มั่งคั่ง', 'สพป.ศรีสะเกษ เขต 4', 1, ?)`,
      [defaultSchoolId, new Date().toISOString()]
    );

    // Create a school admin for the default school
    const schoolAdmin = await db.query("SELECT * FROM users WHERE username = 'admin_obec'");
    if (schoolAdmin.length === 0) {
      await db.execute(
        `INSERT INTO users (id, schoolId, username, password, fullName, role, approved) 
         VALUES ('usr-admin-1', ?, 'admin_obec', 'admin123', 'ผู้ดูแลโรงเรียน (School Admin)', 'school_admin', 1)`,
        [defaultSchoolId]
      );
    }

    // Create a sample teacher for the default school
    const teacherUser = await db.query("SELECT * FROM users WHERE username = 'teacher_kwan'");
    if (teacherUser.length === 0) {
      await db.execute(
        `INSERT INTO users (id, schoolId, username, password, fullName, role, classroom, approved) 
         VALUES ('usr-teacher-1', ?, 'teacher_kwan', 'teacher123', 'คุณครูขวัญใจ ใจดี', 'teacher', 'ประถมศึกษาปีที่ 4/2', 1)`,
        [defaultSchoolId]
      );
    }

    // Populate default students for the first school
    const existStudents = await db.query("SELECT * FROM students WHERE schoolId = ?", [defaultSchoolId]);
    if (existStudents.length === 0) {
      console.log('[Database] Provisioning sample students for standard OBEC9001 school...');
      const sampleStudentsList = [
        ['std-201', '69101', 'เด็กชาย', 'ภูมิพัฒน์ ทองสุก', 'เก่ง', 'ชาย', '2016-10-15', 'ประถมศึกษาปีที่ 4/2', '1', '1-1002-34928-11-2', 'สมชาย ทองสุก', 'บิดา', '089-111-2222', 'เกษตรกร'],
        ['std-202', '69102', 'เด็กหญิง', 'ณิชนันทน์ แสนดี', 'ดีดี', 'หญิง', '2012-04-20', 'มัธยมศึกษาปีที่ 2/1', '1', '1-3001-49281-99-1', 'ประยุทธ์ แสนดี', 'บิดา', '086-444-2211', 'ค้าขาย'],
        ['std-203', '69103', 'เด็กชาย', 'กรวิชญ์ มณีวรรณ', 'ข้าวกล้อง', 'ชาย', '2019-09-02', 'ประถมศึกษาปีที่ 1/1', '1', '1-5099-02931-10-1', 'สมศักดิ์ มณีวรรณ', 'ปู่', '081-332-1144', 'เก็บของเก่า']
      ];

      for (const std of sampleStudentsList) {
        await db.execute(
          `INSERT INTO students (id, schoolId, studentCode, prefix, fullName, nickname, gender, birthDate, classroom, room, citizenId, parentName, parentRelation, parentPhone, parentJob, status, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ยังไม่เยี่ยม', ?)`,
          [std[0], defaultSchoolId, std[1], std[2], std[3], std[4], std[5], std[6], std[7], std[8], std[9], std[10], std[11], std[12], std[13], new Date().toISOString()]
        );
      }
    }
  }

  console.log(`[Database] System Database Tables bootstrapped successfully.`);
}
