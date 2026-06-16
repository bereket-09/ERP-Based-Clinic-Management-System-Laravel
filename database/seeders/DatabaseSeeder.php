<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * One account per role. role: 0=Receptionist, 1=Doctor,
     * 2=Lab Technician, 3=Pharmacist, 4=Manager/Admin.
     *
     * @return void
     */
    public function run()
    {
        $password = 'password'; // same easy password for every demo account

        $users = [
            ['name' => 'Admin Manager',   'email' => 'admin@clinic.test',     'role' => '4', 'speciality' => 'Management'],
            ['name' => 'Dr. Doctor',      'email' => 'doctor@clinic.test',    'role' => '1', 'speciality' => 'General'],
            ['name' => 'Reception Desk',  'email' => 'reception@clinic.test', 'role' => '0', 'speciality' => 'General'],
            ['name' => 'Lab Technician',  'email' => 'lab@clinic.test',       'role' => '2', 'speciality' => 'Laboratory'],
            ['name' => 'Pharmacist',      'email' => 'pharmacy@clinic.test',  'role' => '3', 'speciality' => 'Pharmacy'],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name'               => $u['name'],
                    'role'               => $u['role'],
                    'password'           => Hash::make($password),
                    'speciality'         => $u['speciality'],
                    'email_verified_at'  => Carbon::now(),
                    'joinned_at'         => Carbon::now()->toDateString(),
                    'gender'             => 'Other',
                    'nationality'        => 'Ethiopian',
                    'phone'              => '0900000000',
                    'profile_photo_path' => 'images/avatar.png',
                ]
            );
        }

        // Realistic clinic domain data (departments, patients, stock, visits...).
        $this->call(DemoDataSeeder::class);
    }
}
