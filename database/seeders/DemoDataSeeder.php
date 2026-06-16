<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed realistic clinic domain data: departments, patients, lab tests,
     * pharmacy stock, store items, visits and orders.
     *
     * Idempotent: clears the domain tables (NOT users) and re-inserts.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();
        $ts  = ['created_at' => $now, 'updated_at' => $now];

        // Wipe domain tables so re-running is safe (users are left alone).
        foreach ([
            'visits', 'lab_orders', 'drug_orders', 'patients', 'labtests',
            'medcines', 'medcine__names', 'items', 'items_totals', 'departements',
        ] as $table) {
            DB::table($table)->delete();
        }

        // The doctor account seeded in DatabaseSeeder (role = 1).
        $docId = DB::table('users')->where('role', '1')->value('id') ?? 1;

        // ---- Departments ------------------------------------------------
        $departments = ['General Medicine', 'Pediatrics', 'Laboratory', 'Pharmacy', 'Dental', 'Ophthalmology'];
        foreach ($departments as $d) {
            DB::table('departements')->insert(['name' => $d, 'desc' => $d . ' department', 'status' => 'active'] + $ts);
        }

        // ---- Patients (students) ----------------------------------------
        $patients = [
            ['stud_id' => 'DDU/0101/14', 'mrn' => 'MRN-1001', 'name' => 'Abel Tesfaye',    'gender' => 'Male',   'birthday' => '2001-03-14', 'dept' => 'Computer Science', 'block' => 'B12', 'dorm' => 210, 'year' => 3, 'region' => 'Dire Dawa', 'phone' => '0911000001', 'bloodtype' => 'O+'],
            ['stud_id' => 'DDU/0102/14', 'mrn' => 'MRN-1002', 'name' => 'Hanna Girma',      'gender' => 'Female', 'birthday' => '2002-07-22', 'dept' => 'Nursing',          'block' => 'B07', 'dorm' => 118, 'year' => 2, 'region' => 'Harari',    'phone' => '0911000002', 'bloodtype' => 'A+'],
            ['stud_id' => 'DDU/0103/13', 'mrn' => 'MRN-1003', 'name' => 'Yonas Bekele',     'gender' => 'Male',   'birthday' => '2000-11-09', 'dept' => 'Civil Eng.',       'block' => 'B03', 'dorm' => 305, 'year' => 4, 'region' => 'Oromia',    'phone' => '0911000003', 'bloodtype' => 'B+'],
            ['stud_id' => 'DDU/0104/14', 'mrn' => 'MRN-1004', 'name' => 'Saba Alemu',       'gender' => 'Female', 'birthday' => '2003-01-30', 'dept' => 'Pharmacy',         'block' => 'B09', 'dorm' => 142, 'year' => 1, 'region' => 'Amhara',    'phone' => '0911000004', 'bloodtype' => 'AB+'],
            ['stud_id' => 'DDU/0105/13', 'mrn' => 'MRN-1005', 'name' => 'Mikiyas Tadesse',  'gender' => 'Male',   'birthday' => '2001-05-18', 'dept' => 'Accounting',       'block' => 'B15', 'dorm' => 233, 'year' => 3, 'region' => 'Somali',    'phone' => '0911000005', 'bloodtype' => 'O-'],
            ['stud_id' => 'DDU/0106/14', 'mrn' => 'MRN-1006', 'name' => 'Bethel Solomon',   'gender' => 'Female', 'birthday' => '2002-09-12', 'dept' => 'Law',             'block' => 'B07', 'dorm' => 119, 'year' => 2, 'region' => 'Addis Ababa','phone' => '0911000006', 'bloodtype' => 'A-'],
            ['stud_id' => 'DDU/0107/12', 'mrn' => 'MRN-1007', 'name' => 'Nahom Kebede',     'gender' => 'Male',   'birthday' => '1999-12-02', 'dept' => 'Mechanical Eng.',  'block' => 'B01', 'dorm' => 401, 'year' => 5, 'region' => 'Tigray',    'phone' => '0911000007', 'bloodtype' => 'B-'],
            ['stud_id' => 'DDU/0108/14', 'mrn' => 'MRN-1008', 'name' => 'Eden Mulugeta',    'gender' => 'Female', 'birthday' => '2003-04-25', 'dept' => 'Public Health',    'block' => 'B09', 'dorm' => 145, 'year' => 1, 'region' => 'Dire Dawa', 'phone' => '0911000008', 'bloodtype' => 'O+'],
        ];
        foreach ($patients as $p) {
            DB::table('patients')->insert($p + ['address' => 'DDU Campus', 'nationality' => 'Ethiopian'] + $ts);
        }
        $patientIds = DB::table('patients')->pluck('id')->all();

        // ---- Lab tests catalogue ----------------------------------------
        $labtests = [
            'Complete Blood Count (CBC)', 'Urinalysis', 'Blood Glucose (FBS)', 'Malaria RDT',
            'Stool Examination', 'Liver Function Test', 'Widal Test', 'HIV Screening',
        ];
        foreach ($labtests as $t) {
            DB::table('labtests')->insert(['name' => $t, 'desc' => $t, 'status' => 'active'] + $ts);
        }

        // ---- Pharmacy stock (some expired on purpose) -------------------
        $medcines = [
            ['name' => 'Paracetamol 500mg',  'qty' => 1200, 'price' => 1.50, 'bno' => 'PCM-2401', 'expdate' => '2027-08-31', 'manufactor' => 'EPHARM',     'catagory' => 'Analgesic'],
            ['name' => 'Amoxicillin 500mg',  'qty' => 800,  'price' => 3.20, 'bno' => 'AMX-2312', 'expdate' => '2027-02-28', 'manufactor' => 'Cadila',     'catagory' => 'Antibiotic'],
            ['name' => 'ORS Sachet',         'qty' => 500,  'price' => 2.00, 'bno' => 'ORS-2405', 'expdate' => '2028-01-31', 'manufactor' => 'EPHARM',     'catagory' => 'Rehydration'],
            ['name' => 'Ibuprofen 400mg',    'qty' => 600,  'price' => 2.10, 'bno' => 'IBU-2308', 'expdate' => '2026-12-31', 'manufactor' => 'Julphar',    'catagory' => 'Analgesic'],
            ['name' => 'Metronidazole 250mg','qty' => 450,  'price' => 1.80, 'bno' => 'MET-2210', 'expdate' => '2025-09-30', 'manufactor' => 'Cadila',     'catagory' => 'Antibiotic'], // expired
            ['name' => 'Cetirizine 10mg',    'qty' => 300,  'price' => 1.10, 'bno' => 'CET-2207', 'expdate' => '2024-11-30', 'manufactor' => 'Julphar',    'catagory' => 'Antihistamine'], // expired
            ['name' => 'Artemether/Lumef.',  'qty' => 250,  'price' => 8.50, 'bno' => 'ALU-2403', 'expdate' => '2027-06-30', 'manufactor' => 'Novartis',   'catagory' => 'Antimalarial'],
            ['name' => 'Omeprazole 20mg',    'qty' => 400,  'price' => 2.60, 'bno' => 'OMP-2401', 'expdate' => '2028-03-31', 'manufactor' => 'EPHARM',     'catagory' => 'Antacid'],
        ];
        foreach ($medcines as $i => $m) {
            DB::table('medcines')->insert($m + ['reciptNo' => 'RC-' . (5001 + $i), 'status' => 'available'] + $ts);
        }

        // ---- Distinct medicine names with running totals ----------------
        $medNames = [
            'Paracetamol 500mg' => 1200, 'Amoxicillin 500mg' => 800, 'ORS Sachet' => 500,
            'Ibuprofen 400mg' => 600, 'Artemether/Lumef.' => 250, 'Omeprazole 20mg' => 400,
        ];
        foreach ($medNames as $name => $total) {
            DB::table('medcine__names')->insert(['m_name' => $name, 'total' => $total] + $ts);
        }

        // ---- Store items / assets ---------------------------------------
        $items = [
            ['name' => 'Digital Thermometer', 'manufactor' => 'Omron',     'qty' => 40, 'price' => 120],
            ['name' => 'Blood Pressure Cuff', 'manufactor' => 'Omron',     'qty' => 25, 'price' => 850],
            ['name' => 'Stethoscope',         'manufactor' => '3M Littmann','qty' => 30, 'price' => 1500],
            ['name' => 'Wheelchair',          'manufactor' => 'Karma',     'qty' => 8,  'price' => 9000],
            ['name' => 'Examination Gloves',  'manufactor' => 'Top Glove', 'qty' => 500,'price' => 5],
            ['name' => 'Hospital Bed',        'manufactor' => 'Hill-Rom',  'qty' => 15, 'price' => 22000],
        ];
        foreach ($items as $i => $it) {
            DB::table('items')->insert($it + ['reciptNo' => 'IT-' . (7001 + $i)] + $ts);
        }
        foreach (DB::table('items')->get() as $it) {
            $assigned = (int) round($it->qty * 0.3);
            DB::table('items_totals')->insert(['i_id' => $it->id, 'total' => (int) $it->qty, 'assigned' => $assigned] + $ts);
        }

        // ---- Visits (mix of statuses for the dashboard) -----------------
        $visitRows = [
            ['idx' => 0, 'statues' => 'Completed', 'symptoms' => 'Fever, headache',         'diagnosis' => 'Malaria',          'deasease' => 'Malaria'],
            ['idx' => 1, 'statues' => 'Completed', 'symptoms' => 'Sore throat, cough',       'diagnosis' => 'Tonsillitis',      'deasease' => 'URTI'],
            ['idx' => 2, 'statues' => 'Pending',   'symptoms' => 'Abdominal pain',           'diagnosis' => 'Gastritis',        'deasease' => 'Gastritis'],
            ['idx' => 3, 'statues' => 'Pending',   'symptoms' => 'Diarrhea, dehydration',    'diagnosis' => 'Acute diarrhea',   'deasease' => 'AGE'],
            ['idx' => 4, 'statues' => 'Queued',    'symptoms' => 'Skin rash, itching',       'diagnosis' => null,               'deasease' => null],
            ['idx' => 5, 'statues' => 'Queued',    'symptoms' => 'Eye redness',              'diagnosis' => null,               'deasease' => null],
            ['idx' => 6, 'statues' => 'Queued',    'symptoms' => 'Toothache',                'diagnosis' => null,               'deasease' => null],
        ];
        foreach ($visitRows as $v) {
            $pid = $patientIds[$v['idx']] ?? $patientIds[0];
            DB::table('visits')->insert([
                'p_id' => $pid, 'doc_id' => $docId,
                'symptoms' => $v['symptoms'], 'diagnosis' => $v['diagnosis'],
                'deasease' => $v['deasease'], 'statues' => $v['statues'],
            ] + $ts);
        }
        $visitList = DB::table('visits')->get();

        // ---- Lab orders & drug orders (statuses for queues) -------------
        $labStatuses  = ['Completed', 'Pending', 'Queued', 'Queued', 'Pending'];
        $drugStatuses = ['Completed', 'Completed', 'Pending', 'Queued'];
        foreach ($visitList->take(count($labStatuses))->values() as $i => $v) {
            DB::table('lab_orders')->insert(['v_id' => $v->id, 'p_id' => $v->p_id, 'status' => $labStatuses[$i]] + $ts);
        }
        foreach ($visitList->take(count($drugStatuses))->values() as $i => $v) {
            DB::table('drug_orders')->insert(['v_id' => $v->id, 'p_id' => $v->p_id, 'status' => $drugStatuses[$i]] + $ts);
        }
    }
}
