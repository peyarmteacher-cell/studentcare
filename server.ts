/**
 * Full-Stack Express Server (SaaS HomeVisit System)
 * High-performance API routes with high JSON payload size limit for signatures & photos.
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to support large base64 signatures/images
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  const db = await getDb();

  // ==========================================
  // API Endpoints
  // ==========================================

  // 1. HEALTH CHECK & STATUS REPORT
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      dbType: db.type,
      timestamp: new Date().toISOString()
    });
  });

  // 2. AUTHENTICATION (Multi-School & SaaS registration)
  app.post('/api/auth/register-school', async (req, res) => {
    const { schoolName, schoolArea, directorName, adminName, username, password } = req.body;

    if (!schoolName || !schoolArea || !adminName || !username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
      // Check if username already exists
      const existUser = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (existUser.length > 0) {
        return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ซ้ำในระบบแล้ว กรุณาใช้ชื่ออื่น' });
      }

      const schoolId = 'sch-' + Date.now();
      const schoolCode = 'OBEC-' + Math.floor(100000 + Math.random() * 900000);
      const userId = 'usr-' + Date.now();

      // Insert school in waiting state (Approved = 0)
      await db.execute(
        `INSERT INTO schools (id, name, code, logoUrl, directorName, schoolArea, approved, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
        [schoolId, schoolName, schoolCode, 'https://img2.pic.in.th/logo.jpg.png', directorName, schoolArea, new Date().toISOString()]
      );

      // Insert school administrator (Approved = 1)
      await db.execute(
        `INSERT INTO users (id, schoolId, username, password, fullName, role, approved)
         VALUES (?, ?, ?, ?, ?, 'school_admin', 1)`,
        [userId, schoolId, username, password, adminName]
      );

      res.json({
        success: true,
        message: 'ลงทะเบียนโรงเรียนของท่านสำเร็จแล้ว! กรุณารอ Super Admin ตรวจสอบอนุมัติการใช้งานก่อนล็อกอิน'
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'ไม่สามารถลงทะเบียนได้: ' + err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    try {
      const userList = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
      if (userList.length === 0) {
        return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      }

      const user = userList[0];

      if (user.role === 'super_admin') {
        return res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role
          }
        });
      }

      // Check if user school is approved
      const schoolList = await db.query('SELECT * FROM schools WHERE id = ?', [user.schoolId]);
      if (schoolList.length === 0) {
        return res.status(404).json({ error: 'ไม่พบโรงเรียนของบัญชีนี้' });
      }

      const school = schoolList[0];
      if (school.approved !== 1) {
        return res.status(403).json({ error: 'โรงเรียนของท่านอยู่ระหว่างรอการสุ่มสอบสวนเพื่อเปิดใช้งานจาก Super Admin' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          classroom: user.classroom,
          schoolId: user.schoolId
        },
        school: {
          id: school.id,
          name: school.name,
          code: school.code,
          logoUrl: school.logoUrl,
          directorName: school.directorName,
          schoolArea: school.schoolArea
        }
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'การล็อกอินล้มเหลว: ' + err.message });
    }
  });

  // 3. SUPER ADMIN CONTROLLER (List & Approve Schools)
  app.get('/api/super/schools', async (req, res) => {
    try {
      const list = await db.query('SELECT * FROM schools ORDER BY createdAt DESC');
      res.json({ success: true, schools: list });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/super/schools/:id/approve', async (req, res) => {
    try {
      await db.execute('UPDATE schools SET approved = 1 WHERE id = ?', [req.params.id]);
      res.json({ success: true, message: 'อนุมัติการใช้งานโรงเรียนเรียบร้อยแล้ว' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/super/schools/:id/reject', async (req, res) => {
    try {
      await db.execute('UPDATE schools SET approved = 0 WHERE id = ?', [req.params.id]);
      res.json({ success: true, message: 'ระงับพ้นสิทธิ์การใช้งานโรงเรียนเรียบร้อยแล้ว' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. SCHOOL SETTINGS & TEACHERS MANAGEMENT
  app.get('/api/school/:schoolId/teachers', async (req, res) => {
    try {
      const list = await db.query(
        "SELECT id, fullName, username, classroom FROM users WHERE schoolId = ? AND role = 'teacher' ORDER BY fullName ASC",
        [req.params.schoolId]
      );
      res.json({ success: true, teachers: list });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/school/:schoolId/teachers', async (req, res) => {
    const { fullName, username, password, classroom } = req.body;
    if (!fullName || !username || !password || !classroom) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลครูให้ครบถ้วน' });
    }

    try {
      const exist = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (exist.length > 0) {
        return res.status(400).json({ error: 'บัญชีผู้ใช้นี้มีในระบบแล้ว' });
      }

      const id = 'usr-' + Date.now();
      await db.execute(
        `INSERT INTO users (id, schoolId, username, password, fullName, role, classroom, approved)
         VALUES (?, ?, ?, ?, ?, 'teacher', ?, 1)`,
        [id, req.params.schoolId, username, password, fullName, classroom]
      );

      res.json({ success: true, message: 'เพิ่มคุณครูประจำชั้นเรียบร้อยแล้ว' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/school/:schoolId/teachers/:id', async (req, res) => {
    try {
      await db.execute('DELETE FROM users WHERE id = ? AND schoolId = ?', [req.params.id, req.params.schoolId]);
      res.json({ success: true, message: 'ลบข้อมูลครูประจำชั้นเรียบร้อยแล้ว' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/school/:schoolId/settings', async (req, res) => {
    const { name, directorName, schoolArea, logoUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'จำเป็นต้องมีชื่อโรงเรียน' });

    try {
      await db.execute(
        `UPDATE schools 
         SET name = ?, directorName = ?, schoolArea = ?, logoUrl = ? 
         WHERE id = ?`,
        [name, directorName, schoolArea, logoUrl || 'https://img2.pic.in.th/logo.jpg.png', req.params.schoolId]
      );
      res.json({ success: true, message: 'อัปเดตข้อมูลสัมปทานโรงเรียนสำเร็จ!' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. STUDENTS CRUD (Within School domain)
  app.get('/api/students/:schoolId', async (req, res) => {
    try {
      const list = await db.query(
        'SELECT * FROM students WHERE schoolId = ? ORDER BY classroom ASC, studentCode ASC',
        [req.params.schoolId]
      );
      res.json({ success: true, students: list });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/students/:schoolId', async (req, res) => {
    const student = req.body;
    if (!student.fullName || !student.studentCode || !student.classroom || !student.citizenId) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลหลักให้ครบถ้วน (รหัส, ชื่อ-สกุล, ชั้นเรียน, สัญชาติ/บัตรปชช.)' });
    }

    try {
      const id = student.id || 'std-' + Date.now() + Math.floor(Math.random() * 100);
      await db.execute(
        `INSERT INTO students (id, schoolId, studentCode, prefix, fullName, nickname, gender, birthDate, classroom, room, citizenId, address, village, subdistrict, district, province, zipcode, parentName, parentRelation, parentPhone, parentJob, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ยังไม่เยี่ยม', ?)
         ON DUPLICATE KEY UPDATE 
         studentCode=VALUES(studentCode), prefix=VALUES(prefix), fullName=VALUES(fullName), nickname=VALUES(nickname), gender=VALUES(gender), birthDate=VALUES(birthDate), classroom=VALUES(classroom), room=VALUES(room), citizenId=VALUES(citizenId), address=VALUES(address), village=VALUES(village), subdistrict=VALUES(subdistrict), district=VALUES(district), province=VALUES(province), zipcode=VALUES(zipcode), parentName=VALUES(parentName), parentRelation=VALUES(parentRelation), parentPhone=VALUES(parentPhone), parentJob=VALUES(parentJob)`,
        [
          id, req.params.schoolId, student.studentCode, student.prefix || 'เด็กชาย', student.fullName,
          student.nickname || '', student.gender || 'ชาย', student.birthDate || '', student.classroom,
          student.room || '', student.citizenId, student.address || '', student.village || '',
          student.subdistrict || '', student.district || '', student.province || '', student.zipcode || '',
          student.parentName || '', student.parentRelation || '', student.parentPhone || '', student.parentJob || '',
          new Date().toISOString()
        ]
      );
      res.json({ success: true, message: 'บันทึกข้อมูลส่วนตัวนักเรียนสำเร็จเรียบร้อย' });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/students/:schoolId/batch', async (req, res) => {
    const list = req.body; // Array of students
    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ error: 'ไม่พบรายการข้อมูลที่จะนำเข้า' });
    }

    try {
      console.log(`[Batch Import] Importing ${list.length} students for school ${req.params.schoolId}...`);
      for (const item of list) {
        const id = 'std-' + Date.now() + Math.floor(Math.random() * 100000);
        await db.execute(
          `INSERT INTO students (id, schoolId, studentCode, prefix, fullName, nickname, gender, birthDate, classroom, room, citizenId, address, village, subdistrict, district, province, zipcode, parentName, parentRelation, parentPhone, parentJob, status, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ยังไม่เยี่ยม', ?)`,
          [
            id, req.params.schoolId, item.studentCode || '', item.prefix || 'เด็กชาย', item.fullName || '',
            item.nickname || '', item.gender || 'ชาย', item.birthDate || '', item.classroom || '',
            item.room || '', item.citizenId || '', item.address || '', item.village || '',
            item.subdistrict || '', item.district || '', item.province || '', item.zipcode || '',
            item.parentName || '', item.parentRelation || '', item.parentPhone || '', item.parentJob || '',
            new Date().toISOString()
          ]
        );
      }
      res.json({ success: true, message: `ทำการนำเข้าข้อมูลสำเร็จจำนวน ${list.length} รายการ` });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'ไม่สามารถนำเข้าแบบกลุ่มได้: ' + err.message });
    }
  });

  app.delete('/api/students/:schoolId/:id', async (req, res) => {
    try {
      await db.execute('DELETE FROM students WHERE id = ? AND schoolId = ?', [req.params.id, req.params.schoolId]);
      // Also delete relevant visit records
      const visits = await db.query('SELECT id FROM home_visits WHERE studentId = ?', [req.params.id]);
      for (const v of visits) {
        await db.execute('DELETE FROM home_members WHERE visitId = ?', [v.id]);
      }
      await db.execute('DELETE FROM home_visits WHERE studentId = ?', [req.params.id]);

      res.json({ success: true, message: 'ลบประวัตินักเรียนและแบบเยี่ยมบ้าน นร.01 ออกจากระบบเรียบร้อย' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. DASHBOARD STATISTICS
  app.get('/api/dashboard/:schoolId', async (req, res) => {
    try {
      const studentData = await db.query('SELECT status, classroom FROM students WHERE schoolId = ?', [req.params.schoolId]);
      
      const totalStudents = studentData.length;
      let visited = 0;
      const classMap: { [key: string]: { total: number; visited: number } } = {};

      for (const student of studentData) {
        const className = student.classroom || 'ไม่ระบุชั้น';
        if (!classMap[className]) {
          classMap[className] = { total: 0, visited: 0 };
        }
        classMap[className].total++;
        if (student.status === 'เยี่ยมแล้ว') {
          visited++;
          classMap[className].visited++;
        }
      }

      const unvisited = totalStudents - visited;
      const percent = totalStudents === 0 ? '0.00' : ((visited / totalStudents) * 100).toFixed(2);
      const classLabels = Object.keys(classMap).sort();
      const classVisitedData = classLabels.map(cls => classMap[cls].visited);
      const classTotalData = classLabels.map(cls => classMap[cls].total);

      res.json({
        totalStudents,
        visited,
        unvisited,
        percent,
        classLabels,
        classVisitedData,
        classTotalData
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. HOME VISITS OPERATIONS
  app.get('/api/visits/:schoolId/:studentId', async (req, res) => {
    try {
      const studentList = await db.query('SELECT * FROM students WHERE id = ? AND schoolId = ?', [req.params.studentId, req.params.schoolId]);
      if (studentList.length === 0) {
        return res.status(404).json({ success: false, message: 'ไม่พบประวัตินักเรียนเป้าหมาย' });
      }

      const student = studentList[0];

      const visitList = await db.query(
        'SELECT * FROM home_visits WHERE studentId = ? AND schoolId = ? ORDER BY createdAt DESC LIMIT 1',
        [req.params.studentId, req.params.schoolId]
      );

      if (visitList.length === 0) {
        // Return blank standard structure
        return res.json({
          success: true,
          student,
          visit: null,
          members: []
        });
      }

      const visit = visitList[0];
      const members = await db.query('SELECT * FROM home_members WHERE visitId = ?', [visit.id]);

      res.json({
        success: true,
        student,
        visit,
        members
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/visits/:schoolId', async (req, res) => {
    const { visitData, membersData } = req.body;
    
    if (!visitData || !visitData.studentId) {
      return res.status(400).json({ error: 'ไม่พบชุดข้อมูลเยี่ยมบ้านหลัก' });
    }

    try {
      let visitId = visitData.id;
      let isUpdate = false;

      if (visitId && visitId.startsWith('v-')) {
        isUpdate = true;
      } else {
        visitId = 'v-' + Date.now();
      }

      // Check if student exists
      const studentCheck = await db.query('SELECT id FROM students WHERE id = ? AND schoolId = ?', [visitData.studentId, req.params.schoolId]);
      if (studentCheck.length === 0) {
        return res.status(404).json({ error: 'ไม่พบนักเรียนรายนี้ในฐานข้อมูลโรงเรียนของคุณ' });
      }

      const surveyDate = visitData.visitDate || new Date().toISOString().split('T')[0];

      // Update or Insert basic Visit report
      if (isUpdate) {
        await db.execute(
          `UPDATE home_visits 
           SET visitDate=?, semester=?, schoolYear=?, familyStatus=?, livingWith=?, guardianName=?, guardianRelation=?, guardianCitizenId=?, guardianEducation=?, guardianJob=?, guardianPhone=?, stateWelfare=?, totalMembers=?, houseOwnership=?, monthlyRent=?, floorMaterial=?, wallMaterial=?, roofMaterial=?, hasToilet=?, farmLand=?, waterSource=?, electricity=?, vehicles=?, travelMethod=?, travelDistance=?, travelTime=?, travelCost=?, dailyAllowance=?, homeAddress=?, latitude=?, longitude=?, studentImage=?, outsideImage=?, insideImage=?, signatureStudent=?, signatureParent=?, signatureTeacher=?, signatureGov=?, signatureDirector=?, teacherName=?, directorName=?, govName=?, govPosition=?, note=?
           WHERE id = ? AND schoolId = ?`,
          [
            surveyDate, visitData.semester || '1', visitData.schoolYear || '2569',
            visitData.familyStatus || '', visitData.livingWith || '', visitData.guardianName || '',
            visitData.guardianRelation || '', visitData.guardianCitizenId || '', visitData.guardianEducation || '',
            visitData.guardianJob || '', visitData.guardianPhone || '', visitData.stateWelfare || '',
            parseInt(visitData.totalMembers || '1'), visitData.houseOwnership || '',
            parseInt(visitData.monthlyRent || '0'), visitData.floorMaterial || '',
            visitData.wallMaterial || '', visitData.roofMaterial || '', visitData.hasToilet || '',
            visitData.farmLand || '0', visitData.waterSource || '', visitData.electricity || '',
            visitData.vehicles || '', visitData.travelMethod || '', visitData.travelDistance || '',
            visitData.travelTime || '', visitData.travelCost || '0', visitData.dailyAllowance || '0',
            visitData.homeAddress || '', visitData.latitude || '', visitData.longitude || '',
            visitData.studentImage || '', visitData.outsideImage || '', visitData.insideImage || '',
            visitData.signatureStudent || '', visitData.signatureParent || '', visitData.signatureTeacher || '',
            visitData.signatureGov || '', visitData.signatureDirector || '',
            visitData.teacherName || '', visitData.directorName || '', visitData.govName || '',
            visitData.govPosition || '', visitData.note || '',
            visitId, req.params.schoolId
          ]
        );

        // Delete previous members list
        await db.execute('DELETE FROM home_members WHERE visitId = ?', [visitId]);
      } else {
        await db.execute(
          `INSERT INTO home_visits (id, studentId, schoolId, visitDate, semester, schoolYear, familyStatus, livingWith, guardianName, guardianRelation, guardianCitizenId, guardianEducation, guardianJob, guardianPhone, stateWelfare, totalMembers, houseOwnership, monthlyRent, floorMaterial, wallMaterial, roofMaterial, hasToilet, farmLand, waterSource, electricity, vehicles, travelMethod, travelDistance, travelTime, travelCost, dailyAllowance, homeAddress, latitude, longitude, studentImage, outsideImage, insideImage, signatureStudent, signatureParent, signatureTeacher, signatureGov, signatureDirector, teacherName, directorName, govName, govPosition, note, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            visitId, visitData.studentId, req.params.schoolId, surveyDate, visitData.semester || '1', visitData.schoolYear || '2569',
            visitData.familyStatus || '', visitData.livingWith || '', visitData.guardianName || '',
            visitData.guardianRelation || '', visitData.guardianCitizenId || '', visitData.guardianEducation || '',
            visitData.guardianJob || '', visitData.guardianPhone || '', visitData.stateWelfare || '',
            parseInt(visitData.totalMembers || '1'), visitData.houseOwnership || '',
            parseInt(visitData.monthlyRent || '0'), visitData.floorMaterial || '',
            visitData.wallMaterial || '', visitData.roofMaterial || '', visitData.hasToilet || '',
            visitData.farmLand || '0', visitData.waterSource || '', visitData.electricity || '',
            visitData.vehicles || '', visitData.travelMethod || '', visitData.travelDistance || '',
            visitData.travelTime || '', visitData.travelCost || '0', visitData.dailyAllowance || '0',
            visitData.homeAddress || '', visitData.latitude || '', visitData.longitude || '',
            visitData.studentImage || '', visitData.outsideImage || '', visitData.insideImage || '',
            visitData.signatureStudent || '', visitData.signatureParent || '', visitData.signatureTeacher || '',
            visitData.signatureGov || '', visitData.signatureDirector || '',
            visitData.teacherName || '', visitData.directorName || '', visitData.govName || '',
            visitData.govPosition || '', visitData.note || '',
            new Date().toISOString()
          ]
        );
      }

      // Add fresh family members rows
      if (Array.isArray(membersData) && membersData.length > 0) {
        for (let i = 0; i < membersData.length; i++) {
          const mId = `mem-${Date.now()}-${i}`;
          await db.execute(
            `INSERT INTO home_members (id, visitId, fullName, relation, citizenId, age, totalIncome)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              mId, visitId, membersData[i].fullName || '', membersData[i].relation || '',
              membersData[i].citizenId || '', membersData[i].age || '', membersData[i].totalIncome || '0'
            ]
          );
        }
      }

      // Mark Student Status as "เยี่ยมแล้ว"
      await db.execute("UPDATE students SET status = 'เยี่ยมแล้ว' WHERE id = ? AND schoolId = ?", [visitData.studentId, req.params.schoolId]);

      res.json({
        success: true,
        message: isUpdate ? 'ปรับปรุงการจัดเก็บใบ นร.01 สำเร็จลุล่วง' : 'เก็บบันทึกประวัติเยี่ยมบ้านและลายเซ็นสมบูรณ์แบบ',
        visitId
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'บันทึกไม่สำเร็จ: ' + err.message });
    }
  });

  // ==========================================
  // Vite Integration (Asset Serving & SPA Fallback)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Development Mode] Integrating Vite Dev Server middleware ...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Production Mode] Serving bundled static assets ...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Multi-school HomeVisit Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Startup Error] Database or Server bootstrap crashed:', err);
});
