<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\User;
use App\Models\Patient;
use App\Models\Departement;
use App\Models\DrugOrder;
use App\Models\DrugOrdered;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Labtest;
use App\Models\Medcine_Name;
use App\Models\Visit;
use Illuminate\Http\Request;
use PDO;

class PatientController extends Controller
{
    public function search_patient(){
        if(Auth::user()){
        if(Auth::user()->role=='0'){

            return view('reception.actions.search_patient');}
            else{
                return redirect()->back();
    
            }
        }
        else{
            return view('homepage');
    }}

    
    public function searchPatient(Request $request){

       $id=$request->stud_id;
       $visits='';
       $doctors=User::query()
       ->where('role', '1') 
            ->get();

            $patient=Patient::query()
            ->where('stud_id', $id) 
                 ->get();
foreach($patient as $patients){
            
 
         $visits=Visit::query()
                 ->where('p_id', $patients->id) 
                      ->get(); }



             if(!$patient->isEmpty()){
                return view("reception.actions.add_new_visit",compact('visits','patient','doctors','id'));
             }


             else{
                return view("reception.actions.add_patient",compact('id','doctors'));
             }

         

    }

    public function add_patient(Request $request){
        
        $in=new Patient;
        $visit=new Visit;
       
        $request->validate([
            'name'=>'required',
            'birthday'=>'required|before:today',
            'MRN'=> 'required|unique:patients',
        ]);

        $in->name=$request->name;
        $in->stud_id=$request->stud_id;
        $in->mrn=$request->MRN;

        $in->birthday=$request->birthday;

        $in->dept=$request->dept;
        $in->year=$request->year;
        
        $in->block=$request->block;
        $in->dorm=$request->dorm;

        $in->phone=$request->phone;
        $in->region=$request->region;
        
        $in->gender=$request->gender;
        $in->nationality=$request->nationality;
        $in->address=$request->address;

        $in->bloodtype=$request->bloodtype;
        $in->save();

        $patient=Patient::query()
        ->where('stud_id', $request->stud_id) 
             ->first();

       

        $visit->p_id=$patient->id;
        $visit->doc_id=$request->doc_id;
        $visit->statues='Queued';

        $visit->save();

        return redirect('/all_patients');
    }

public function all_patients(){
    $patient=Patient::all();

    return view("common.all_patients",compact('patient'));
}


public function deletePatient($id){

    $patient=Patient::query()
    ->where('id', $id) 
         ->first();
    // dd($patient);
    $patient->delete();
    return redirect()->back();
}

public function queued_patients(){

    $patient=Patient::all();
        //  dd($visit);

    $visit=Visit::all();
        //  dd($visit);
    $doctors=User::query()
        ->where('role', '1') 
             ->get();
   


   if(Auth::user()){

    return view("common.queued_patients",compact('patient','visit','doctors'));}else{
        return redirect('login');
    }
}


public function insert_new_visit(Request $request){
        
    $visit=new Visit;


    $patient=Patient::query()
    ->where('id', $request->id) 
         ->first();

   

    $visit->p_id=$patient->id;
    $visit->doc_id=$request->doc_id;
    $visit->statues='Queued';

    $visit->save();

    return redirect('/all_patients');
}

public function treat_patient(Request $request,$id){
    $in=Visit::find($id);
    // dd($in->id);

    $in->symptoms=$request->symptoms;

    $in->diagnosis=$request->diagnosis;

    $in->deasease=$request->deasease;
    
    $in->statues='Completed';
        // dd($data->status);
        $in->save();



        return redirect('/queued_patients');
}



public function treat(Request $request){
        // 
        $Result="";$drugs="";
    $visits=Visit::query()
    ->where('id', $request->id) 
         ->first();
         

    $patient=Patient::query()
         ->where('id', $visits->p_id) 
              ->first();    
           
   $order=LabOrder::query()
              ->where('v_id', $visits->id) 
                   ->first();  
                //    dd($order);
if( $order){
    $Result=LabResult::query()
            ->where('o_id', $order->id) 
                        ->get();
                        }
    $DrugsOrder=DrugOrder::query()
              ->where('v_id', $visits->id) 
                   ->first();   
                   if( $DrugsOrder){
     $drugs=DrugOrdered::query()
            ->where('o_id', $DrugsOrder->id) 
                        ->get();  }
                        // dd($DrugsOrder); 

    $test=Labtest::all();
    $drugname=Medcine_Name::all();
    // dd( $Result);

            //   dd($patient->id);
 return view("doctor.actions.treat_patient",compact('patient','visits','order','Result','test','DrugsOrder','drugs','drugname'));

    
}

public function pending_patients_list(){

    $patient=Patient::all();
        //  dd($visit);

    $visit=Visit::all();
        //  dd($visit);
    $doctors=User::query()
        ->where('role', '1') 
             ->get();
   
      

    return view("common.pending_patients",compact('patient','visit','doctors'));
}



public function order_lab(Request $request){
    // 
    //
    if($request->submit=='Ordered Lab Test'){
    // dd($request->submit);
    // dd($request->id);
    $in=Visit::find($request->id);
    // dd($in->id);

    $in->symptoms=$request->symptoms;

    $in->diagnosis=$request->diagnosis;

    $in->deasease=$request->deasease;
    
    $in->statues='Pending';
    $in->save();

$visits=Visit::query()
->where('id', $request->id) 
     ->first(); 

    //  dd($visits->p_id);

$patient=Patient::query()
     ->where('id', $visits->p_id) 
          ->first();    

$test=Labtest::all();    

        //   dd($patient->id);
return view("doctor.actions.add_lab_order",compact('patient','visits','test'));}
elseif($request->submit='Ordered Lab Test'){
    // dd($request->submit);
    $in=Visit::find($request->id);
    // dd($in->id);

    $in->symptoms=$request->symptoms;

    $in->diagnosis=$request->diagnosis;

    $in->deasease=$request->deasease;
    
    $in->statues='Completed';
    $in->save();

return redirect('/queued_patients');
}


}


public function order_drug(Request $request){
    // 

    // dd($request);
$visits=Visit::query()
->where('id', $request->id) 
     ->first(); 

    //  dd($visits->p_id);

$patient=Patient::query()
     ->where('id', $visits->p_id) 
          ->first();    

$drugs=Medcine_Name::all();    

        //   dd($patient->id);
return view("doctor.actions.add_drug_order",compact('patient','visits','drugs'));


}

public function completed_visits(){

    $patient=Patient::all();


    $visit=Visit::all();
        //  dd($visit);
    $doctors=User::query()
        ->where('role', '1') 
             ->get();
   
    // $visit=Visit::query()
    //      ->where('p_id', $patient->id) 
    //      ->where('statues', 'Queued') 
    //           ->get();

   

    return view("common.view_completed_visits",compact('patient','visit','doctors'));
}

}
