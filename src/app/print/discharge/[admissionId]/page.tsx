import { notFound } from "next/navigation";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { getBranding } from "@/server/services/settings";
import { getOrIssueForVisit, issueDocument } from "@/server/services/documents";
import { qrDataUrl, verifyUrlFor } from "@/server/services/qr";
import { formatVerifyCode } from "@/server/services/document-signing";
import { DischargeDoc } from "./discharge-doc";

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export const metadata = { title: "Discharge summary" };

export default async function DischargePrint({ params }: { params: Promise<{ admissionId: string }> }) {
  const actor = await requireStaff();
  const { admissionId } = await params;

  const adm = await db.admission.findUnique({
    where: { id: admissionId },
    include: {
      patient: true,
      ward: true,
      bed: true,
      admittedBy: { select: { name: true, title: true, speciality: true } },
      visit: {
        include: {
          doctor: { select: { name: true, title: true, speciality: true } },
          drugOrders: { include: { items: { include: { medication: true } } } },
        },
      },
    },
  });
  if (!adm) notFound();

  const branding = await getBranding();

  // Idempotent signed record (keyed to the visit when present).
  const doc = adm.visitId
    ? await getOrIssueForVisit("ADMISSION_SUMMARY", { visitId: adm.visitId, patientId: adm.patientId }, actor)
    : await issueDocument("ADMISSION_SUMMARY", { patientId: adm.patientId }, actor);

  const verifyUrl = doc.verifyCode ? await verifyUrlFor(doc.verifyCode) : null;
  const seal = doc.verifyCode && verifyUrl
    ? { code: formatVerifyCode(doc.verifyCode), url: verifyUrl, qr: await qrDataUrl(verifyUrl, 160) }
    : null;

  const discharged = adm.dischargedAt ?? new Date();
  const los = Math.max(1, Math.ceil((discharged.getTime() - adm.admittedAt.getTime()) / 86_400_000));
  const doctor = adm.visit?.doctor ?? adm.admittedBy;
  const doctorName = doctor ? `${doctor.title ? doctor.title + " " : ""}${doctor.name}` : null;

  const meds = (adm.visit?.drugOrders ?? []).flatMap((o) => o.items).map((it) => ({
    name: [it.medication.name, it.medication.strength].filter(Boolean).join(" "),
    dose: it.dose,
    frequency: it.frequency,
    duration: it.duration,
  }));

  return (
    <DischargeDoc
      branding={branding}
      docNo={doc.docNo}
      issuedAt={doc.issuedAt.toISOString()}
      seal={seal}
      patient={{
        name: adm.patient.name,
        mrn: adm.patient.mrn,
        studentId: adm.patient.studentId,
        ageSex: [age(adm.patient.birthday), adm.patient.gender].filter(Boolean).join(" / ") || null,
      }}
      admission={{
        admNo: adm.admNo,
        ward: adm.ward?.name ?? null,
        bed: adm.bed?.label ?? null,
        admittedAt: adm.admittedAt.toISOString(),
        dischargedAt: discharged.toISOString(),
        los,
        reason: adm.reason,
        dischargeNotes: adm.dischargeNotes,
        diagnosis: adm.visit?.diagnosis ?? null,
      }}
      meds={meds}
      doctorName={doctorName}
      doctorRole={doctor?.speciality ?? "Attending Physician"}
    />
  );
}
