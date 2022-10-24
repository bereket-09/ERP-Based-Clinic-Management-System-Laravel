<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\LabtestController;
use App\Http\Controllers\MedicineController;
use App\Models\Labtest;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('hompage');
// });
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');

Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');

Route::get('/', [HomeController::class,'homepage']);

Route::middleware(['auth:sanctum', 'verified'])->get('/dashboard', function () {
    return view('homepage');
})->name('dashboard');

Route::middleware(['auth:sanctum', 'verified'])->get('/home', [HomeController::class,'index'])->name('dashboard');;
// Route::get('/dashboard,'[HomeController::class,'index']);
Route::get('/dashboard', [HomeController::class,'index'] );

Route::get('/myprofile', [HomeController::class,'profile'] );
route::get('/profile/{id}',[AdminController::class,'profile']);
route::get('/edit-basic-info/{id}',[AdminController::class,'edit_basic_info']);
route::post('/update_basic_info/{id}',[AdminController::class,'update_basic_info']);


// Employee

Route::get('/employeeList', [AdminController::class,'employees']);
// Route::get('/edit-employee/{id}', [AdminController::class,'edit_employee']); 
Route::get('/add-employee', [AdminController::class,'add_employee']); 
Route::get('/add-employee', [AdminController::class,'add_employee']); 
Route::post('/employeeList', [AdminController::class,'create_employee']); 

// route::post('/edit-employee/{id}',[AdminController::class,'edited_employee']);

route::get('/updateEmployee/{id}',[AdminController::class,'updateEmployee']);
route::post('/updateAemployee/{id}',[AdminController::class,'updateAemployee']);
route::get('/deleteEmployee/{id}',[AdminController::class,'deleteEmployee']);

Route::get('/doctors',[AdminController::class,'doctorsList']);

Route::get('/labratorist',[AdminController::class,'LabratoristList']);
Route::get('/pharmacist',[AdminController::class,'pharmacistList']);





// Route::get('/request-leave',[AdminController::class,'request']);
Route::view('request-leave','common.request_leave_form');
Route::get('/view-departement',[AdminController::class,'viewDepartement']);
Route::get('/add-departement', [AdminController::class,'add_Departement']); 
// ADD DEPT
Route::post('/insert_departement', [AdminController::class,'create_dept']); 



Route::get('/edit-departement/{id}', [AdminController::class,'edit_departement']); 
Route::post('/update_departement/{id}', [AdminController::class,'update_departement']); 
route::get('/delete_departement/{id}',[AdminController::class,'delete_departement']);


//ADD PATENET

Route::get('/search_patient', [PatientController::class,'search_patient']); 
Route::get('/searchPatient', [PatientController::class,'searchPatient']); 

Route::get('/add_patient', [PatientController::class,'add_patient']); 


Route::get('/all_patients', [PatientController::class,'all_patients']); 
route::get('/deletePatient/{id}',[PatientController::class,'deletePatient']);
Route::get('/treat/{id}', [PatientController::class,'treat']);

Route::get('/queued_patients', [PatientController::class,'queued_patients']); 
Route::get('/pending_patients', [PatientController::class,'pending_patients_list']); 

// ADDING visits to already existing patients
Route::post('/insert_new_visit/{id}',[PatientController::class,'insert_new_visit']);

Route::post('/update_treat_info/{id}',[PatientController::class,'treat_patient']);


Route::get('/order_lab_test/{id}', [LabtestController::class,'order_lab_test']); 
Route::get('/order_lab/{id}', [PatientController::class,'order_lab']); 
// Lab Test 
Route::view('add_lab_test','admin.actions.lab_Test.add-test-type');
Route::post('/add_test_type',[LabtestController::class,'add_lab_test']);
Route::get('/view_all_tests',[LabtestController::class,'view_lab_test']);

Route::get('/edit_tests/{id}',[LabtestController::class,'edit_lab_test']);
Route::post('/update_lab_test/{id}',[LabtestController::class,'update_lab_test']);

//LAB ORDERS
Route::get('/view_lab_order',[LabtestController::class,'view_lab_order']);
Route::get('/lab_test_results/{id}',[LabtestController::class,'lab_test_results']);


// Lab results
Route::post('/save_results/{id}',[LabtestController::class,'save_results']);
Route::get('/view_pending_lab_results',[LabtestController::class,'view_pending_lab_results']);
Route::get('/view_completed_lab_results',[LabtestController::class,'view_completed_lab_results']);

// Medicine Route

Route::view('/add_medicine','pharmacy.actions.add_medcine');
Route::post('/add_medicines',[MedicineController::class,'add_medicine']);
Route::get('/view_all_drugs',[MedicineController::class,'view_all_drugs']);
Route::get('/view_instock_drugs',[MedicineController::class,'view_instock_drugs']);
Route::get('/view_outstock_drugs',[MedicineController::class,'view_outstock_drugs']);
Route::get('/view_expired_drugs',[MedicineController::class,'view_expired_drugs']);
Route::get('/edit-medicine/{id}',[MedicineController::class,'edit_medicine']);
Route::post('/edit-medicine/{id}',[MedicineController::class,'edit_medicine_vales']);
Route::get('/delete_medicine/{id}',[MedicineController::class,'delete_medicine']);

// ORDER DRUGS
Route::get('/order_drug/{id}', [PatientController::class,'order_drug']); 
Route::get('/order-drugs/{id}', [MedicineController::class,'ordered_drugs']); 


Route::get('/view_orderd_drugs',[MedicineController::class,'view_orderd_drugs']);



Route::get('/view_oreder_for_each/{id}', [MedicineController::class,'view_ordered_drugs_for_each']); 


Route::get('/update_drug_orders/{id}', [MedicineController::class,'update_drug_orders']);
Route::POST('/confirm_all/{id}', [MedicineController::class,'confirm_all_drugs']); 
Route::get('/view_completed_drug_orders',[MedicineController::class,'view_completed_drug_orders']);

Route::get('/completed_visits', [PatientController::class,'completed_visits']); 




Route::post('/send_leave_request', [AdminController::class,'send_leave_request']);


Route::get('/view-leave-request', [AdminController::class,'view_leave_request']); 

Route::get('/view-each-leave-request/{id}', [AdminController::class,'view_each_leave_request']); 
Route::get('/my-leave-requests', [AdminController::class,'my_leave_requests']); 

Route::post('/submit_request_result/{id}', [AdminController::class,'submit_request_result']); 

// Property Management


// Route::view('/', 'admin.actions.); 
Route::view('/add-new-item','admin.actions.property.add_property_to_store');
Route::post('/add-item', [AdminController::class,'add_item']); 
Route::get('/view-all-item',[AdminController::class,'view_all_item']);

Route::get('/view-all-recorded-item',[AdminController::class,'view_all_recorded_item']);


Route::get('/assign-item-for-user',[AdminController::class,'assign_items']);
Route::post('/assigned_items', [AdminController::class,'assigned_items']); 



Route::get('/view_all_assined_items',[AdminController::class,'view_all_assined_items']);


Route::get('/my_assined_items',[AdminController::class,'view_my_assined_items']);

Route::get('/update_assine/{id}',[AdminController::class,'update_assine']);
Route::post('/update_assine/{id}',[AdminController::class,'update_assine_value']);
Route::get('/submit-request',[AdminController::class,'item_request']);
Route::post('/submit_request',[AdminController::class,'submit_request']);


// Add edu experiance
Route::get('/add-edu-exp',[AdminController::class,'add_edu_exp']);
Route::get('/add-work-exp',[AdminController::class,'add_work_exp']);


Route::post('/add-edu-exp',[AdminController::class,'add_edu_exper']);
Route::post('/add-work-exp',[AdminController::class,'add_work_exper']);


Route::get('/view-edu-exp',[AdminController::class,'view_edu_exp']);
Route::get('/view-work-exp',[AdminController::class,'view_work_exp']);