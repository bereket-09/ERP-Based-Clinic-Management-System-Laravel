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
