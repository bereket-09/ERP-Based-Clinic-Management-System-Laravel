/**
 * Demo seed for the DDU Clinic platform.
 * Clears domain tables and loads a realistic, fully-populated demo dataset:
 * staff for every role, departments, a lab & drug catalog with real batch stock,
 * wards, students, and visits sitting in several points of the clinical flow.
 *
 * Run: npm run db:seed   (or db:reset to wipe + reseed)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHmac, randomBytes } from "node:crypto";
import { addDays, subDays, subYears } from "date-fns";
import { FEATURES } from "../src/lib/features";

const db = new PrismaClient();

const STAFF_PW = "password";
const STUDENT_PW = "student";

async function main() {
  console.log("🌱  Seeding DDU Clinic demo data…");

  // Wipe (FK-safe order) — demo only.
  await db.payment.deleteMany();
  await db.invoiceItem.deleteMany();
  await db.invoice.deleteMany();
  await db.appointment.deleteMany();
  await db.allergy.deleteMany();
  await db.problemListItem.deleteMany();
  await db.immunization.deleteMany();
  await db.attendance.deleteMany();
  await db.shift.deleteMany();
  await db.leaveBalance.deleteMany();
  await db.purchaseOrderItem.deleteMany();
  await db.purchaseOrder.deleteMany();
  await db.stateTransition.deleteMany();
  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.issuedDocument.deleteMany();
  await db.stockMovement.deleteMany();
  await db.labOrderItem.deleteMany();
  await db.labOrder.deleteMany();
  await db.drugOrderItem.deleteMany();
  await db.drugOrder.deleteMany();
  await db.referral.deleteMany();
  await db.admission.deleteMany();
  await db.vitals.deleteMany();
  await db.clinicalNote.deleteMany();
  await db.visit.deleteMany();
  await db.medicationBatch.deleteMany();
  await db.medication.deleteMany();
  await db.supplier.deleteMany();
  await db.labTest.deleteMany();
  await db.bed.deleteMany();
  await db.ward.deleteMany();
  await db.assetAssignment.deleteMany();
  await db.asset.deleteMany();
  await db.stockRequest.deleteMany();
  await db.leaveRequest.deleteMany();
  await db.education.deleteMany();
  await db.workExperience.deleteMany();
  await db.patient.deleteMany();
  await db.user.deleteMany();
  await db.department.deleteMany();

  const staffHash = await bcrypt.hash(STAFF_PW, 10);
  const studentHash = await bcrypt.hash(STUDENT_PW, 10);

  // ── Departments ──────────────────────────────────────────────────────────
  const [general, lab, pharmacyDept, nursing, admin] = await Promise.all([
    db.department.create({ data: { name: "General Practice", kind: "CLINICAL", code: "GP" } }),
    db.department.create({ data: { name: "Laboratory", kind: "CLINICAL", code: "LAB" } }),
    db.department.create({ data: { name: "Pharmacy", kind: "CLINICAL", code: "PHA" } }),
    db.department.create({ data: { name: "Nursing", kind: "CLINICAL", code: "NUR" } }),
    db.department.create({ data: { name: "Administration", kind: "ADMIN", code: "ADM" } }),
  ]);
  const colleges = await Promise.all(
    ["Computing", "Engineering", "Medicine", "Business", "Natural Sciences"].map((name) =>
      db.department.create({ data: { name: `College of ${name}`, kind: "ACADEMIC" } }),
    ),
  );

  // ── Staff (one per role) ─────────────────────────────────────────────────
  const staff = [
    { name: "Dr. Meles Assefa", email: "manager@clinic.test", role: "MANAGER", title: "Dr.", dept: admin.id, spec: "Clinic Head" },
    { name: "Dr. Sara Bekele", email: "doctor@clinic.test", role: "DOCTOR", title: "Dr.", dept: general.id, spec: "General Practitioner" },
    { name: "Aster Girma", email: "lab@clinic.test", role: "LAB_TECH", title: "", dept: lab.id, spec: "Medical Laboratory" },
    { name: "Yonas Tadesse", email: "pharmacy@clinic.test", role: "PHARMACIST", title: "", dept: pharmacyDept.id, spec: "Clinical Pharmacy" },
    { name: "Hanna Mekonnen", email: "reception@clinic.test", role: "RECEPTIONIST", title: "", dept: admin.id, spec: null },
    { name: "Sr. Loza Fikru", email: "nurse@clinic.test", role: "NURSE", title: "Sr.", dept: nursing.id, spec: "Triage & Wards" },
    { name: "Kalkidan Alemu", email: "hr@clinic.test", role: "HR", title: "", dept: admin.id, spec: null },
    { name: "Getachew Bulti", email: "store@clinic.test", role: "STORE_KEEPER", title: "", dept: admin.id, spec: null },
  ] as const;

  const users: Record<string, string> = {};
  for (const s of staff) {
    const u = await db.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash: staffHash,
        role: s.role,
        title: null, // names already carry the honorific
        speciality: s.spec,
        departmentId: s.dept,
        phone: "+2519" + Math.floor(10000000 + Math.random() * 89999999),
        gender: s.name.startsWith("Dr. Sara") || ["Aster", "Hanna", "Sr.", "Kalkidan"].some((n) => s.name.includes(n)) ? "FEMALE" : "MALE",
      },
    });
    users[s.role] = u.id;
  }

  // ── Lab test catalog ─────────────────────────────────────────────────────
  const labTests = await Promise.all(
    [
      { name: "Complete Blood Count (CBC)", category: "Hematology", specimen: "Blood", unit: "10^9/L", refRangeText: "4.0–11.0", price: 120 },
      { name: "Blood Film", category: "Hematology", specimen: "Blood", refRangeText: "No hemoparasites", price: 90 },
      { name: "Urinalysis", category: "Clinical Chemistry", specimen: "Urine", refRangeText: "Normal", price: 70 },
      { name: "Random Blood Sugar (RBS)", category: "Chemistry", specimen: "Blood", unit: "mg/dL", refRangeLow: 70, refRangeHigh: 140, price: 60 },
      { name: "Widal Test", category: "Serology", specimen: "Blood", refRangeText: "Non-reactive", price: 100 },
      { name: "Stool Examination", category: "Parasitology", specimen: "Stool", refRangeText: "No ova/cyst", price: 65 },
      { name: "Liver Function Test", category: "Chemistry", specimen: "Blood", price: 260 },
      { name: "HIV Rapid Test", category: "Serology", specimen: "Blood", refRangeText: "Non-reactive", price: 0 },
    ].map((t) => db.labTest.create({ data: t })),
  );

  // ── Suppliers + medications with batches ─────────────────────────────────
  const [sup1, sup2] = await Promise.all([
    db.supplier.create({ data: { name: "EPSS Dire Dawa Hub", phone: "+251251110000" } }),
    db.supplier.create({ data: { name: "Kefetew Pharma PLC", phone: "+251115570000" } }),
  ]);

  const medSpecs = [
    { name: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic", qty: 1800 },
    { name: "Amoxicillin", strength: "500mg", form: "Capsule", category: "Antibiotic", qty: 950 },
    { name: "Ibuprofen", strength: "400mg", form: "Tablet", category: "NSAID", qty: 700 },
    { name: "Metronidazole", strength: "250mg", form: "Tablet", category: "Antibiotic", qty: 640 },
    { name: "ORS", strength: "", form: "Sachet", category: "Rehydration", qty: 400 },
    { name: "Omeprazole", strength: "20mg", form: "Capsule", category: "PPI", qty: 300 },
    { name: "Cetirizine", strength: "10mg", form: "Tablet", category: "Antihistamine", qty: 260 },
    { name: "Ceftriaxone", strength: "1g", form: "Injection", category: "Antibiotic", qty: 40 },
    { name: "Cough Syrup", strength: "100ml", form: "Syrup", category: "Cough", qty: 8 }, // low stock
    { name: "Artemether/Lumefantrine", strength: "20/120mg", form: "Tablet", category: "Antimalarial", qty: 0 }, // out of stock
  ];

  for (const [i, m] of medSpecs.entries()) {
    const med = await db.medication.create({
      data: {
        name: m.name,
        strength: m.strength || null,
        form: m.form,
        category: m.category,
        unit: m.form === "Syrup" ? "bottle" : m.form === "Injection" ? "vial" : "unit",
        reorderLevel: m.name === "Ceftriaxone" ? 50 : 20,
      },
    });
    if (m.qty > 0) {
      // most meds fine; make "Cough Syrup" expire soon to demo the expiry view
      const expiry = m.name === "Cough Syrup" ? addDays(new Date(), 20) : addDays(new Date(), 180 + i * 15);
      const batch = await db.medicationBatch.create({
        data: {
          medicationId: med.id,
          supplierId: i % 2 === 0 ? sup1.id : sup2.id,
          batchNo: `B${2026}${String(i + 1).padStart(3, "0")}`,
          expiryDate: expiry,
          quantity: m.qty,
          costPrice: 2 + i,
          sellPrice: 4 + i * 1.5,
        },
      });
      await db.stockMovement.create({
        data: { batchId: batch.id, type: "RECEIVE", quantity: m.qty, reason: "Initial stock", byUserId: users.STORE_KEEPER },
      });
    }
  }

  // ── Wards + beds ─────────────────────────────────────────────────────────
  const maleWard = await db.ward.create({ data: { name: "Male Observation Ward", gender: "MALE", capacity: 6 } });
  const femaleWard = await db.ward.create({ data: { name: "Female Observation Ward", gender: "FEMALE", capacity: 6 } });
  for (const w of [maleWard, femaleWard]) {
    await Promise.all(
      Array.from({ length: 6 }).map((_, i) =>
        db.bed.create({ data: { wardId: w.id, label: `${w.gender === "MALE" ? "M" : "F"}-${i + 1}` } }),
      ),
    );
  }

  // ── Students (patients) ──────────────────────────────────────────────────
  const studentSpecs = [
    { sid: "DDU/1001/14", name: "Abel Tesfaye", gender: "MALE", col: 0, year: "3", blood: "O+" },
    { sid: "DDU/1042/13", name: "Meron Haile", gender: "FEMALE", col: 1, year: "4", blood: "A+" },
    { sid: "DDU/1198/15", name: "Nahom Girmay", gender: "MALE", col: 2, year: "2", blood: "B+" },
    { sid: "DDU/1220/14", name: "Bethlehem Assefa", gender: "FEMALE", col: 3, year: "3", blood: "AB+" },
    { sid: "DDU/1305/15", name: "Yohannes Kebede", gender: "MALE", col: 4, year: "1", blood: "O-" },
    { sid: "DDU/1377/13", name: "Selam Tadesse", gender: "FEMALE", col: 0, year: "4", blood: "A-" },
  ] as const;

  const patients = [];
  for (const [i, s] of studentSpecs.entries()) {
    const p = await db.patient.create({
      data: {
        mrn: `MRN-${String(1001 + i)}`,
        studentId: s.sid,
        type: "STUDENT",
        name: s.name,
        gender: s.gender,
        birthday: subYears(new Date(), 19 + (i % 4)),
        phone: "+2519" + Math.floor(10000000 + Math.random() * 89999999),
        bloodType: s.blood,
        departmentId: colleges[s.col].id,
        college: colleges[s.col].name,
        yearOfStudy: s.year,
        block: `B${10 + i}`,
        dorm: `${200 + i}`,
        region: "Dire Dawa",
        nationality: "Ethiopian",
        // enable portal for the first student
        portalEnabled: i === 0,
        portalPasswordHash: i === 0 ? studentHash : null,
      },
    });
    patients.push(p);
  }

  // ── Visits across the clinical flow ──────────────────────────────────────
  let visitSeq = 1;
  const visitNo = () => `V-2026-${String(visitSeq++).padStart(5, "0")}`;
  const doctorId = users.DOCTOR;
  const receptionId = users.RECEPTIONIST;

  // 1) waiting for doctor
  const abelVisit = await db.visit.create({
    data: {
      visitNo: visitNo(), state: "WAITING_FOR_DOCTOR", priority: "ROUTINE",
      patientId: patients[0].id, doctorId, createdById: receptionId,
      chiefComplaint: "Fever and headache for 2 days",
      vitals: { create: { takenById: users.NURSE, temperatureC: 38.4, pulseBpm: 92, systolic: 118, diastolic: 76, spo2: 98, weightKg: 64, heightCm: 173 } },
    },
  });
  // historical vitals so the trends page has a series
  for (let i = 1; i <= 6; i++) {
    await db.vitals.create({
      data: {
        visitId: abelVisit.id,
        takenById: users.NURSE,
        createdAt: subDays(new Date(), i * 9),
        temperatureC: Math.round((36.6 + Math.sin(i) * 0.7) * 10) / 10,
        pulseBpm: 70 + ((i * 3) % 12),
        systolic: 116 + (i % 5),
        diastolic: 74 + (i % 4),
        respRate: 16 + (i % 3),
        spo2: 97 + (i % 2),
        weightKg: Math.round((63 + i * 0.4) * 10) / 10,
        heightCm: 173,
      },
    });
  }

  // 2) in consultation
  await db.visit.create({
    data: {
      visitNo: visitNo(), state: "IN_CONSULTATION", priority: "ROUTINE",
      patientId: patients[1].id, doctorId, createdById: receptionId,
      chiefComplaint: "Sore throat", symptoms: "Odynophagia, mild fever",
    },
  });

  // 3) waiting for lab (with an open lab order)
  const labVisit = await db.visit.create({
    data: {
      visitNo: visitNo(), state: "WAITING_FOR_LAB", priority: "URGENT",
      patientId: patients[2].id, doctorId, createdById: receptionId,
      chiefComplaint: "Abdominal pain, vomiting", symptoms: "Epigastric tenderness", diagnosis: "R/O typhoid",
    },
  });
  await db.labOrder.create({
    data: {
      orderNo: `L-2026-00001`, state: "ORDERED", visitId: labVisit.id, orderedById: doctorId,
      items: { create: [{ testId: labTests[0].id }, { testId: labTests[4].id }, { testId: labTests[5].id }] },
    },
  });

  // 4) waiting for pharmacy (with a drug order)
  const pharmVisit = await db.visit.create({
    data: {
      visitNo: visitNo(), state: "WAITING_FOR_PHARMACY", priority: "ROUTINE",
      patientId: patients[3].id, doctorId, createdById: receptionId,
      chiefComplaint: "Headache", diagnosis: "Tension headache", disease: "Tension-type headache",
    },
  });
  const paracetamol = await db.medication.findFirst({ where: { name: "Paracetamol" } });
  const ibuprofen = await db.medication.findFirst({ where: { name: "Ibuprofen" } });
  await db.drugOrder.create({
    data: {
      orderNo: `D-2026-00001`, state: "ORDERED", visitId: pharmVisit.id, prescribedById: doctorId,
      items: {
        create: [
          { medicationId: paracetamol!.id, dose: "1 tablet", frequency: "TID", duration: "5 days", quantity: 15, instructions: "After meals" },
          { medicationId: ibuprofen!.id, dose: "1 tablet", frequency: "BID", duration: "3 days", quantity: 6 },
        ],
      },
    },
  });

  // 5) a completed visit
  await db.visit.create({
    data: {
      visitNo: visitNo(), state: "COMPLETED", priority: "ROUTINE",
      patientId: patients[4].id, doctorId, createdById: receptionId,
      chiefComplaint: "Follow-up", diagnosis: "Resolved", closedAt: new Date(),
      openedAt: subDays(new Date(), 3),
    },
  });

  // ── A pending leave request + notifications ──────────────────────────────
  await db.leaveRequest.create({
    data: {
      state: "SUBMITTED", type: "ANNUAL", employeeId: users.NURSE,
      startDate: addDays(new Date(), 7), endDate: addDays(new Date(), 12),
      reason: "Family event",
    },
  });

  await db.notification.createMany({
    data: [
      { type: "LAB_ORDER_NEW", title: "New lab order", body: "3 tests ordered for Nahom Girmay", recipientRole: "LAB_TECH", link: "/lab" },
      { type: "DRUG_ORDER_NEW", title: "New prescription", body: "2 items for Bethlehem Assefa", recipientRole: "PHARMACIST", link: "/pharmacy" },
      { type: "LEAVE_SUBMITTED", title: "Leave request", body: "Sr. Loza Fikru requested annual leave", recipientRole: "HR", link: "/hr/leave" },
    ],
  });

  // ── Feature flags: sync the registry into the DB ─────────────────────────
  for (const def of FEATURES) {
    await db.featureFlag.upsert({
      where: { key: def.key },
      create: { key: def.key, name: def.name, description: def.description, category: def.category, enabled: def.defaultEnabled },
      update: {},
    });
  }

  // ── Appointments ─────────────────────────────────────────────────────────
  let apptSeq = 1;
  for (const a of [
    { p: patients[0], when: new Date(), reason: "Follow-up review" },
    { p: patients[1], when: new Date(), reason: "Lab result review" },
    { p: patients[5], when: addDays(new Date(), 1), reason: "General consultation" },
  ]) {
    await db.appointment.create({
      data: { apptNo: `APT-2026-${String(apptSeq++).padStart(5, "0")}`, patientId: a.p.id, providerId: doctorId, scheduledFor: a.when, reason: a.reason },
    });
  }

  // ── Invoice for the completed visit ──────────────────────────────────────
  const completed = await db.visit.findFirst({ where: { state: "COMPLETED" } });
  if (completed) {
    const inv = await db.invoice.create({
      data: {
        invoiceNo: "INV-2026-00001", state: "PAID", patientId: completed.patientId, visitId: completed.id, createdById: receptionId,
        total: 50, paid: 50,
        items: { create: [{ description: "Consultation fee", category: "CONSULTATION", quantity: 1, unitPrice: 50, amount: 50 }] },
      },
    });
    await db.payment.create({ data: { invoiceId: inv.id, amount: 50, method: "CASH", receivedById: receptionId } });
  }

  // ── Clinical compliance for the first student ────────────────────────────
  await db.allergy.create({ data: { patientId: patients[0].id, substance: "Penicillin", reaction: "Skin rash", severity: "MODERATE" } });
  await db.problemListItem.create({ data: { patientId: patients[0].id, problem: "Asthma", icdCode: "J45", status: "ACTIVE" } });
  await db.immunization.create({ data: { patientId: patients[0].id, vaccine: "Hepatitis B", dose: "3rd dose" } });

  // ── Attendance today + leave balances ────────────────────────────────────
  const midnight = new Date(); midnight.setUTCHours(0, 0, 0, 0);
  const year = new Date().getFullYear();
  for (const uid of Object.values(users)) {
    await db.attendance.create({ data: { userId: uid, date: midnight, status: "PRESENT", clockIn: new Date() } });
    await db.leaveBalance.createMany({
      data: [
        { userId: uid, type: "ANNUAL", year, entitled: 20, used: 0 },
        { userId: uid, type: "SICK", year, entitled: 10, used: 0 },
      ],
      skipDuplicates: true,
    });
  }

  // ── Assets, a stock request, and a purchase order ────────────────────────
  for (const a of [
    { tag: "AST-001", name: "Dell Latitude Laptop", category: "IT Equipment", unitPrice: 45000 },
    { tag: "AST-002", name: "Digital BP Monitor", category: "Medical Equipment", unitPrice: 3500 },
    { tag: "AST-003", name: "Wheelchair", category: "Medical Equipment", unitPrice: 8000 },
    { tag: "AST-004", name: "Office Desk", category: "Furniture", unitPrice: 4000 },
  ]) {
    await db.asset.create({ data: a });
  }
  const laptop = await db.asset.findUnique({ where: { tag: "AST-001" } });
  if (laptop) await db.assetAssignment.create({ data: { assetId: laptop.id, userId: users.DOCTOR, quantity: 1, state: "ASSIGNED" } });

  await db.stockRequest.create({ data: { requesterId: users.NURSE, itemName: "Examination gloves (box)", quantity: 20, reason: "Ward supplies running low", state: "SUBMITTED" } });

  await db.purchaseOrder.create({
    data: {
      poNo: "PO-2026-00001", state: "ORDERED", supplierId: sup1.id, total: 12000, note: "Monthly medicine restock",
      items: { create: [
        { itemName: "Paracetamol 500mg (box of 1000)", quantity: 100, unitPrice: 60 },
        { itemName: "Amoxicillin 500mg (box of 500)", quantity: 100, unitPrice: 60 },
      ] },
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  BULK DEMO DATA — volume so every screen is populated at realistic scale
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("   …loading bulk demo data (patients, visits, orders, docs, audit)…");

  const rand = (n: number) => Math.floor(Math.random() * n);
  function pick<T>(a: readonly T[]): T { return a[rand(a.length)]; }
  const chance = (p: number) => Math.random() < p;

  const FIRST_M = ["Abel", "Nahom", "Yohannes", "Dawit", "Bereket", "Kaleb", "Samuel", "Robel", "Naod", "Amanuel", "Henok", "Eyob", "Fitsum", "Biruk", "Yared", "Tewodros", "Nathnael", "Getu", "Habtamu", "Solomon", "Ermias", "Abdi", "Tofik", "Girma", "Mahder"];
  const FIRST_F = ["Meron", "Bethlehem", "Selam", "Hanna", "Rahel", "Eden", "Mahlet", "Kalkidan", "Feven", "Tigist", "Sara", "Hiwot", "Bruktawit", "Meaza", "Aster", "Genet", "Lidiya", "Saron", "Yordanos", "Kidist", "Nardos", "Helen", "Amina", "Firehiwot", "Betelhem"];
  const LAST = ["Tesfaye", "Haile", "Girmay", "Assefa", "Kebede", "Tadesse", "Bekele", "Alemu", "Mekonnen", "Fikru", "Gebre", "Wolde", "Desta", "Abera", "Negash", "Tsegaye", "Lemma", "Getachew", "Hailu", "Molla", "Bulti", "Demissie", "Teshome", "Worku", "Ayele"];
  const BLOOD = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

  // A) ~240 more students (bulk insert, then read back for their ids)
  const N_STUDENTS = 240;
  const patientData = Array.from({ length: N_STUDENTS }, (_, i) => {
    const gender = chance(0.5) ? ("MALE" as const) : ("FEMALE" as const);
    const name = `${gender === "MALE" ? pick(FIRST_M) : pick(FIRST_F)} ${pick(LAST)}`;
    const col = rand(colleges.length);
    return {
      mrn: `MRN-${2000 + i}`,
      studentId: `DDU/${1400 + i}/${13 + rand(3)}`,
      type: "STUDENT" as const,
      source: chance(0.3) ? ("SIMS" as const) : ("MANUAL" as const),
      name,
      gender,
      birthday: subYears(new Date(), 18 + rand(6)),
      phone: "+2519" + Math.floor(10000000 + Math.random() * 89999999),
      bloodType: pick(BLOOD),
      departmentId: colleges[col].id,
      college: colleges[col].name,
      yearOfStudy: String(1 + rand(5)),
      block: `B${5 + rand(30)}`,
      dorm: `${100 + rand(400)}`,
      region: "Dire Dawa",
      nationality: "Ethiopian",
      portalEnabled: i < 5,
      portalPasswordHash: i < 5 ? studentHash : null,
    };
  });
  await db.patient.createMany({ data: patientData });
  const bulkPatients = await db.patient.findMany({ where: { mrn: { startsWith: "MRN-2" } } });
  const allPatients = [...patients, ...bulkPatients];
  const males = allPatients.filter((p) => p.gender === "MALE");
  const females = allPatients.filter((p) => p.gender === "FEMALE");

  // Signed-document helper (mirrors src/server/services/document-signing.ts).
  const DOC_SECRET = process.env.DOCUMENT_SIGNING_SECRET ?? process.env.AUTH_SECRET ?? "ddu-clinic-dev-doc-secret";
  const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const newCode = () => { const b = randomBytes(10); let o = ""; for (let i = 0; i < 10; i++) o += B32[b[i] % B32.length]; return o; };
  type DocRow = { docNo: string; type: string; patientId: string | null; visitId: string | null; fromDate: Date | null; toDate: Date | null; days: number | null; issuedById: string | null; issuedAt: Date; id: string };
  const signDoc = async (doc: DocRow) => {
    const canonical = [doc.docNo, doc.type, doc.patientId ?? "", doc.visitId ?? "", doc.fromDate?.toISOString() ?? "", doc.toDate?.toISOString() ?? "", doc.days ?? "", doc.issuedById ?? "", doc.issuedAt.toISOString()].join("|");
    const signature = createHmac("sha256", DOC_SECRET).update(canonical).digest("hex");
    const verifyCode = newCode();
    await db.issuedDocument.update({ where: { id: doc.id }, data: { verifyCode, signature } });
    return verifyCode;
  };

  const DIAGS = [
    { d: "Acute pharyngitis", disease: "Pharyngitis", icd: "J02.9" },
    { d: "Upper respiratory tract infection", disease: "URTI", icd: "J06.9" },
    { d: "Acute gastroenteritis", disease: "Gastroenteritis", icd: "A09" },
    { d: "Tension headache", disease: "Tension-type headache", icd: "G44.2" },
    { d: "Urinary tract infection", disease: "UTI", icd: "N39.0" },
    { d: "Allergic rhinitis", disease: "Allergic rhinitis", icd: "J30.9" },
    { d: "Typhoid fever", disease: "Enteric fever", icd: "A01.0" },
    { d: "Uncomplicated malaria", disease: "Malaria", icd: "B54" },
    { d: "Peptic ulcer disease", disease: "PUD", icd: "K27" },
    { d: "Myalgia", disease: "Musculoskeletal pain", icd: "M79.1" },
  ];
  const COMPLAINTS = ["Fever", "Headache", "Sore throat", "Abdominal pain", "Cough", "Diarrhea", "Body ache", "Dizziness", "Nausea", "Fatigue", "Ear pain", "Back pain"];

  const activeMeds = (await db.medication.findMany()).filter((m) => m.name !== "Artemether/Lumefantrine");
  let docSeq = 1, labSeq = 2, drugSeq = 2, invSeq = 2;
  const sampleCodes: string[] = [];

  // B) ~80 historical completed visits with orders, results, dispensing, invoices, documents
  for (let i = 0; i < 80; i++) {
    const p = pick(allPatients);
    const opened = subDays(new Date(), 1 + rand(60));
    const dg = pick(DIAGS);
    const visit = await db.visit.create({
      data: {
        visitNo: visitNo(), state: "COMPLETED", priority: chance(0.15) ? "URGENT" : "ROUTINE",
        patientId: p.id, doctorId, createdById: receptionId,
        chiefComplaint: pick(COMPLAINTS), symptoms: "See consultation notes",
        diagnosis: dg.d, disease: dg.disease, icdCode: dg.icd,
        openedAt: opened, closedAt: addDays(opened, chance(0.2) ? 1 : 0),
      },
    });
    await db.vitals.create({
      data: {
        visitId: visit.id, takenById: users.NURSE, createdAt: opened,
        temperatureC: Math.round((36.4 + Math.random() * 2.2) * 10) / 10,
        pulseBpm: 68 + rand(30), systolic: 108 + rand(30), diastolic: 66 + rand(20),
        spo2: 95 + rand(5), respRate: 14 + rand(6),
        weightKg: 50 + rand(40), heightCm: 155 + rand(35),
      },
    });
    if (chance(0.55)) {
      const tests = [pick(labTests), pick(labTests)].filter((t, idx, a) => a.findIndex((x) => x.id === t.id) === idx);
      await db.labOrder.create({
        data: {
          orderNo: `L-2026-${String(labSeq++).padStart(5, "0")}`, state: "COMPLETED", visitId: visit.id, orderedById: doctorId, createdAt: opened,
          items: { create: tests.map((t) => ({ testId: t.id, state: "VERIFIED" as const, resultValue: String(1 + rand(200)), resultFlag: pick(["NORMAL", "NORMAL", "NORMAL", "HIGH", "LOW"] as const), resultedById: users.LAB_TECH, resultedAt: opened })) },
        },
      });
    }
    if (chance(0.65)) {
      const chosen = [pick(activeMeds), pick(activeMeds)].filter((m, idx, a) => a.findIndex((x) => x.id === m.id) === idx);
      await db.drugOrder.create({
        data: {
          orderNo: `D-2026-${String(drugSeq++).padStart(5, "0")}`, state: "DISPENSED", visitId: visit.id, prescribedById: doctorId, createdAt: opened,
          items: { create: chosen.map((m) => ({ medicationId: m.id, dose: "1 " + (m.form === "Syrup" ? "spoon" : "tab"), frequency: pick(["OD", "BID", "TID"]), duration: pick(["3 days", "5 days", "7 days"]), quantity: 5 + rand(20), state: "DISPENSED" as const, dispensedById: users.PHARMACIST, dispensedAt: opened })) },
        },
      });
    }
    const items: Array<{ description: string; category: "CONSULTATION" | "LAB" | "PHARMACY"; quantity: number; unitPrice: number; amount: number }> = [
      { description: "Consultation fee", category: "CONSULTATION", quantity: 1, unitPrice: 50, amount: 50 },
    ];
    if (chance(0.5)) items.push({ description: "Laboratory tests", category: "LAB", quantity: 1, unitPrice: 120, amount: 120 });
    if (chance(0.6)) items.push({ description: "Medications", category: "PHARMACY", quantity: 1, unitPrice: 80, amount: 80 });
    const total = items.reduce((s, it) => s + it.amount, 0);
    const state = chance(0.78) ? "PAID" : chance(0.5) ? "PARTIALLY_PAID" : "ISSUED";
    const paid = state === "PAID" ? total : state === "PARTIALLY_PAID" ? Math.round(total / 2) : 0;
    const inv = await db.invoice.create({
      data: { invoiceNo: `INV-2026-${String(invSeq++).padStart(5, "0")}`, state, patientId: p.id, visitId: visit.id, createdById: receptionId, total, paid, createdAt: opened, items: { create: items } },
    });
    if (paid > 0) await db.payment.create({ data: { invoiceId: inv.id, amount: paid, method: pick(["CASH", "CASH", "MOBILE", "CARD"] as const), receivedById: receptionId, createdAt: opened } });

    if (chance(0.35)) {
      const days = 1 + rand(5);
      const doc = await db.issuedDocument.create({ data: { docNo: `DOC-2026-${String(docSeq++).padStart(5, "0")}`, type: "SICK_LEAVE", visitId: visit.id, patientId: p.id, issuedById: doctorId, fromDate: opened, toDate: addDays(opened, days - 1), days, recommendation: "Rest and hydration", payload: { patient: { name: p.name, mrn: p.mrn }, issuedByName: "Dr. Sara Bekele" }, issuedAt: opened } });
      const code = await signDoc(doc);
      if (sampleCodes.length < 6) sampleCodes.push(`${p.name} (sick leave): ${code}`);
    }
    if (chance(0.4)) {
      const doc = await db.issuedDocument.create({ data: { docNo: `DOC-2026-${String(docSeq++).padStart(5, "0")}`, type: "VISIT_SUMMARY", visitId: visit.id, patientId: p.id, issuedById: doctorId, payload: { patient: { name: p.name, mrn: p.mrn }, issuedByName: "Dr. Sara Bekele" }, issuedAt: opened } });
      await signDoc(doc);
    }
  }

  // C) Deeper live queues (extra patients waiting in each active state)
  for (let i = 0; i < 6; i++) {
    const p = pick(allPatients);
    await db.visit.create({ data: { visitNo: visitNo(), state: "WAITING_FOR_DOCTOR", priority: chance(0.3) ? "URGENT" : "ROUTINE", patientId: p.id, doctorId, createdById: receptionId, chiefComplaint: pick(COMPLAINTS), vitals: { create: { takenById: users.NURSE, temperatureC: 36.8 + Math.random() * 1.8, pulseBpm: 72 + rand(24), systolic: 110 + rand(24), diastolic: 70 + rand(14), spo2: 96 + rand(4), weightKg: 55 + rand(30) } } } });
  }
  for (let i = 0; i < 3; i++) {
    const p = pick(allPatients);
    const v = await db.visit.create({ data: { visitNo: visitNo(), state: "LAB_RESULTS_READY", priority: "ROUTINE", patientId: p.id, doctorId, createdById: receptionId, chiefComplaint: pick(COMPLAINTS), diagnosis: "Awaiting review" } });
    await db.labOrder.create({ data: { orderNo: `L-2026-${String(labSeq++).padStart(5, "0")}`, state: "RESULTS_READY", visitId: v.id, orderedById: doctorId, items: { create: [{ testId: labTests[0].id, state: "RESULTED", resultValue: String(4 + rand(8)), resultFlag: "NORMAL", resultedById: users.LAB_TECH, resultedAt: new Date() }] } } });
  }

  // D) Ward admissions — active (on beds) + discharged (for the discharge summary)
  const allBeds = await db.bed.findMany({ include: { ward: true } });
  const mBeds = allBeds.filter((b) => b.ward.gender === "MALE");
  const fBeds = allBeds.filter((b) => b.ward.gender === "FEMALE");
  let admSeq = 1;
  for (let i = 0; i < 3; i++) {
    const male = i % 2 === 0;
    const bed = (male ? mBeds : fBeds)[i];
    const p = pick(male ? males : females);
    const at = subDays(new Date(), 1 + i);
    const v = await db.visit.create({ data: { visitNo: visitNo(), state: "ADMITTED", priority: "URGENT", patientId: p.id, doctorId, createdById: receptionId, chiefComplaint: "Severe dehydration", diagnosis: "Acute gastroenteritis with dehydration", openedAt: at } });
    await db.admission.create({ data: { admNo: `ADM-2026-${String(admSeq++).padStart(5, "0")}`, state: i === 0 ? "ON_WARD" : "ADMITTED", visitId: v.id, patientId: p.id, wardId: bed.wardId, bedId: bed.id, admittedById: doctorId, reason: "Requires overnight observation and IV fluids", admittedAt: at } });
    await db.bed.update({ where: { id: bed.id }, data: { status: "OCCUPIED" } });
  }
  for (let i = 0; i < 4; i++) {
    const male = chance(0.5);
    const bed = (male ? mBeds : fBeds)[3 + (i % 2)];
    const p = pick(male ? males : females);
    const at = subDays(new Date(), 5 + rand(20));
    const dc = addDays(at, 1 + rand(4));
    const v = await db.visit.create({ data: { visitNo: visitNo(), state: "COMPLETED", priority: "URGENT", patientId: p.id, doctorId, createdById: receptionId, chiefComplaint: "Fever, vomiting", diagnosis: "Enteric fever", disease: "Typhoid", icdCode: "A01.0", openedAt: at, closedAt: dc } });
    await db.admission.create({ data: { admNo: `ADM-2026-${String(admSeq++).padStart(5, "0")}`, state: "DISCHARGED", visitId: v.id, patientId: p.id, wardId: bed.wardId, bedId: bed.id, admittedById: doctorId, reason: "Observation and IV antibiotics for enteric fever", dischargeNotes: "Afebrile for 48 hours. Completed course of IV ceftriaxone and switched to oral. Tolerating diet well. Advised rest, oral hydration, and outpatient follow-up in one week. Discharged in stable, improved condition.", admittedAt: at, dischargedAt: dc } });
  }

  // E) External referrals (various states/urgency)
  const FACILITIES = ["Dilchora Referral Hospital", "Hiwot Fana Specialized Hospital", "Bisidimo General Hospital"];
  let refSeq = 1;
  for (let i = 0; i < 6; i++) {
    const p = pick(allPatients);
    const when = subDays(new Date(), rand(30));
    await db.referral.create({ data: { referralNo: `REF-2026-${String(refSeq++).padStart(5, "0")}`, state: pick(["ISSUED", "ISSUED", "ACKNOWLEDGED", "COMPLETED"] as const), urgency: pick(["ROUTINE", "URGENT", "EMERGENCY"] as const), patientId: p.id, referredById: doctorId, toFacility: pick(FACILITIES), toDepartment: pick(["Internal Medicine", "Surgery", "Radiology", "Orthopedics"]), reason: pick(["Further evaluation of persistent abdominal pain", "CT imaging not available on site", "Specialist orthopedic assessment", "Management of complicated malaria"]), clinicalSummary: "Patient assessed at DDU Student Clinic; vitals and initial labs attached. Referred for higher-level evaluation and management.", issuedAt: when, createdAt: when } });
  }

  // F) More appointments across dates
  for (let i = 0; i < 22; i++) {
    const p = pick(allPatients);
    const past = chance(0.4);
    await db.appointment.create({ data: { apptNo: `APT-2026-${String(apptSeq++).padStart(5, "0")}`, patientId: p.id, providerId: doctorId, createdById: receptionId, scheduledFor: past ? subDays(new Date(), 1 + rand(20)) : addDays(new Date(), rand(21)), reason: pick(["Follow-up review", "Lab result review", "General consultation", "Chronic care follow-up", "Dressing change"]), state: past ? pick(["COMPLETED", "NO_SHOW"] as const) : pick(["SCHEDULED", "CONFIRMED"] as const) } });
  }

  // G) Leave requests across states + used balances
  const staffIds = Object.values(users);
  for (let i = 0; i < 12; i++) {
    const st = pick(["SUBMITTED", "APPROVED", "APPROVED", "REJECTED", "RETURNED", "ACTIVE"] as const);
    const start = subDays(new Date(), 18 - i);
    const days = 2 + rand(6);
    await db.leaveRequest.create({ data: { state: st, type: pick(["ANNUAL", "SICK", "STUDY", "UNPAID"] as const), employeeId: pick(staffIds), approverId: st === "SUBMITTED" ? null : users.HR, startDate: start, endDate: addDays(start, days - 1), reason: pick(["Family event", "Medical appointment", "Personal matters", "Academic exam", "Bereavement in family"]), createdAt: subDays(new Date(), 24 - i) } });
  }
  await db.leaveBalance.updateMany({ where: { type: "ANNUAL", userId: users.NURSE }, data: { used: 6 } });
  await db.leaveBalance.updateMany({ where: { type: "SICK", userId: users.DOCTOR }, data: { used: 3 } });

  // H) Extra medication batches — expired + expiring-soon (populate stock alerts)
  const metro = await db.medication.findFirst({ where: { name: "Metronidazole" } });
  const amox = await db.medication.findFirst({ where: { name: "Amoxicillin" } });
  if (metro) {
    const b = await db.medicationBatch.create({ data: { medicationId: metro.id, supplierId: sup1.id, batchNo: "B2025EXP", expiryDate: subDays(new Date(), 18), quantity: 90, costPrice: 3, sellPrice: 6 } });
    await db.stockMovement.create({ data: { batchId: b.id, type: "RECEIVE", quantity: 90, reason: "Older stock (now expired)", byUserId: users.STORE_KEEPER } });
  }
  if (amox) await db.medicationBatch.create({ data: { medicationId: amox.id, supplierId: sup2.id, batchNo: "B2026SOON", expiryDate: addDays(new Date(), 45), quantity: 200, costPrice: 4, sellPrice: 8 } });

  // I) More store activity
  await db.stockRequest.create({ data: { requesterId: users.PHARMACIST, itemName: "Disposable syringes 5ml (box)", quantity: 10, reason: "Injections stock running low", state: "APPROVED" } });
  await db.stockRequest.create({ data: { requesterId: users.LAB_TECH, itemName: "Vacutainer tubes (pack)", quantity: 15, reason: "Lab consumables", state: "FULFILLED" } });
  await db.purchaseOrder.create({ data: { poNo: "PO-2026-00002", state: "RECEIVED", supplierId: sup2.id, total: 8000, note: "Antibiotics restock", items: { create: [{ itemName: "Ceftriaxone 1g (vials)", quantity: 100, unitPrice: 80 }] } } });
  for (const a of [
    { tag: "AST-005", name: "Autoclave Sterilizer", category: "Medical Equipment", unitPrice: 60000 },
    { tag: "AST-006", name: "Refrigerator (vaccine)", category: "Medical Equipment", unitPrice: 22000 },
    { tag: "AST-007", name: "Office Chairs (set)", category: "Furniture", unitPrice: 6000, quantity: 6 },
  ]) await db.asset.create({ data: a });

  // J) Audit log — populate with realistic activity across staff and time
  const AUDIT: readonly [string, string][] = [
    ["auth.login", "User"], ["auth.logout", "User"], ["patient.register", "Patient"],
    ["visit.transition", "Visit"], ["document.issue", "IssuedDocument"], ["lab.result.submit", "LabOrder"],
    ["drug.dispense", "DrugOrder"], ["invoice.pay", "Invoice"], ["feature.toggle", "FeatureFlag"],
    ["leave.approve", "LeaveRequest"], ["referral.issue", "Referral"], ["asset.assign", "Asset"],
    ["stock.receive", "MedicationBatch"], ["branding.update", "Setting"],
  ];
  await db.auditLog.createMany({
    data: Array.from({ length: 140 }, (_, i) => {
      const [action, entityType] = pick(AUDIT);
      return { actorId: pick(staffIds), action, entityType, entityId: `seed-${i}`, ip: `10.0.${rand(255)}.${rand(255)}`, meta: { source: "demo-seed" }, createdAt: subDays(new Date(), rand(30)) };
    }),
  });

  // K) State transitions — feed the activity timelines
  await db.stateTransition.createMany({
    data: Array.from({ length: 70 }, (_, i) => ({
      entityType: pick(["Visit", "LabOrder", "DrugOrder", "LeaveRequest", "PurchaseOrder", "Admission"]),
      entityId: `seed-${i}`, event: pick(["send_to_doctor", "order_labs", "submit_results", "dispense", "approve", "receive", "discharge"]),
      fromState: pick(["REGISTERED", "ORDERED", "IN_PROGRESS", "SUBMITTED", "ADMITTED"]),
      toState: pick(["WAITING_FOR_DOCTOR", "RESULTS_READY", "DISPENSED", "APPROVED", "DISCHARGED"]),
      actorId: pick(staffIds), createdAt: subDays(new Date(), rand(20)),
    })),
  });

  // L) More notifications (mix of read/unread)
  await db.notification.createMany({
    data: Array.from({ length: 16 }, (_, i) => ({
      type: pick(["LAB_ORDER_NEW", "LAB_RESULTS_READY", "DRUG_ORDER_NEW", "VISIT_COMPLETED", "STOCK_LOW", "LEAVE_DECISION", "GENERIC"] as const),
      title: pick(["New lab order", "Results ready", "New prescription", "Visit completed", "Low stock alert", "Leave decision"]),
      body: `Demo notification #${i + 1}`, recipientId: pick(staffIds), link: "/dashboard",
      readAt: chance(0.5) ? subDays(new Date(), rand(5)) : null, createdAt: subDays(new Date(), rand(7)),
    })),
  });

  console.log(`   Bulk data: ${allPatients.length} patients, ~110 visits, labs+meds, ${admSeq - 1} admissions, ${refSeq - 1} referrals, ${docSeq - 1} signed documents, 140 audit entries.`);
  if (sampleCodes.length) console.log(`   Verifiable document codes (try /verify/<code>):\n     - ${sampleCodes.join("\n     - ")}`);

  console.log("✅  Seed complete.");
  console.log(`   Staff login (password: "${STAFF_PW}"): manager@clinic.test, doctor@clinic.test, lab@clinic.test, pharmacy@clinic.test, reception@clinic.test, nurse@clinic.test, hr@clinic.test, store@clinic.test`);
  console.log(`   Student portal: ${studentSpecs[0].sid} (password: "${STUDENT_PW}")`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
