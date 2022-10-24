<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use App\Models\User;
use App\Models\Departement;
use App\Models\Edu_info;
use App\Models\WorkLeave;
use App\Models\Items;
use App\Models\Items_total;
use App\Models\ItemAssign;
use App\Models\ItemRequest;
use App\Models\Work_exp;

class AdminController extends Controller
{
    // public function create(array $input)
    // {
    //     Validator::make($input, [
    //         'name' => ['required', 'string', 'max:255'],
    //         'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
    //         'password' => $this->passwordRules(),
    //         'terms' => Jetstream::hasTermsAndPrivacyPolicyFeature() ? ['accepted', 'required'] : '',
    //     ])->validate();

    //     return User::create([
    //         'name' => $input['name'],
    //         'email' => $input['email'],
    //         'password' => Hash::make($input['password']),
     
    //     ]);
    // }
    public function employees(){

        if(Auth::user()){
        $data=user::all();

        if(Auth::user()->role=='4'){

        return view('admin.actions.employeeList',compact('data'));}
        else{
            return redirect()->back();

        }}
        else{
            return redirect('login');
        }
    }


    public function updateEmployee($id){
$data=User::find($id);
if(Auth::user()->role=='4'){
return view("admin.actions.updateEmployee",compact('data'));}
else{  return redirect()->back();

}
    }

    public function add_employee(){
        if(Auth::user()->role=='4'){

        return view('admin.actions.add-employee');
    }

        else{  
            return redirect()->back();
        
        }
    }

    public function create_employee(Request $request){
        $in=new user;
       
        $request->validate([
            'name'=>'required',
            'email'=>'required|email|unique:users',
            'birthday'=>'required|before:today',
            'joinned_at'=>'required|after:yesterday',
            'phone'=> 'required|regex:/(09)[0-9]{8}/',
            'password' => ['required', 
               'min:8',  
               'confirmed']


        ]);



        $in->name=$request->name;
        
        $in->email=$request->email;
        
        $pass=Hash::make($request->password);

        $in->password=$pass;
        
        $in->joinned_at=$request->joinned_at;
        $in->birthday=$request->birthday;
        
        $in->phone=$request->phone;
        $in->region=$request->region;
        
        $in->gender=$request->gender;
        $in->nationality=$request->nationality;
        $in->address=$request->address;
        $in->role=$request->role;
        $in->speciality='General';
        $in->profile_photo_path='images/avatar.png';

        $in->save();

        
        return redirect('/employeeList');
        
        

    }

    public function doctorsList(){
        $role='1';


        $doctors=User::query()
        ->where('role', '1') 
             ->get();

        
        return view('common.doctotsList',compact('doctors'));
    }


    public function LabratoristList(){
        $role='2';
      

        $doctors=User::query()
        ->where('role', '2') 
             ->get();
      
        
        return view('common.LabratoristList',compact('doctors'));
    }

    public function pharmacistList(){
        $role='3';
      
        $doctors=User::query()
        ->where('role', '3') 
             ->get();
      
        
        return view('common.pharmacistList',compact('doctors'));
    }


    public function viewDepartement(){
        $data=departement::all();

        return view('admin.actions.viewDepartement',compact('data'));
    }



    public function add_Departement(){

        if(Auth::user()->role=='4'){
        return view('admin.actions.add-departement'); }

        else{  
            return redirect()->back();
        
        }
}

    public function create_dept(Request $request){

        $request->validate([
            'name'=>'required',
            'desc'=> 'required',
            'desc'=> 'required'
        ]);

            $data=new departement;
            $data->name=$request->name;
            
            $data->desc=$request->desc;
            
            $data->status=$request->status;
            

            $data->save();

            $data=departement::all();

            return redirect('/view-departement');

    }

    // public function edit_employee($id){
    //     $i=$id;
    //     $employee=user::find($i);
    //     return view('admin.actions.edit-employee')->with('employee',$employee);
    // }

    public function updateAemployee(Request $request, $id){
        $in=User::find($id);


        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($in->id)],
            'phone'=> 'required|regex:/(09)[0-9]{9}/',
            'address' => ['required'],
            'birthday'=>['before:today'],
            'joinned_at'=>'required|before:today',
       
            'password' => ['required', 
               'min:8',  
               'confirmed']


        ]);

        $in->name=$request->name;
        
        $in->email=$request->email;

        $in->joinned_at=$request->joinned_at;
        $in->birthday=$request->birthday;
        
        $in->phone=$request->phone;
        $in->region=$request->region;
        
        $in->gender=$request->gender;
        $in->nationality=$request->nationality;
        $in->address=$request->address;
        $in->role=$request->role;
        $in->speciality=$request->speciality;

        $in->save();

        return redirect('/employeeList');
            }
        
public function deleteEmployee($id){

    $data=user::find($id);
    $data->delete();
    return redirect()->back();
}




public function edit_departement($id){
    $data=Departement::find($id);
    return view("admin.actions.edit-departement",compact('data'));
        }


public function update_departement(Request $request, $id){

$in=Departement::find($id);

            $request->validate([
                'name'=>'required',
                'desc'=> 'required',
                'status'=> 'required'
            ]);
    
            $in->name=$request->name;
    
            $in->desc=$request->desc;
    
            $in->status=$request->status;
                

                $in->save();
    
                $data=departement::all();
    
                return redirect('/view-departement');
    
        }

public function delete_departement($id){

            $data=Departement::find($id);
            $data->delete();
            return redirect()->back();
        }


public function profile($id){
    $data=user::find($id);


    return view("common.profile",compact('data'));

        }

public function edit_basic_info($id){
    $data=User::find($id);

    return view("profile.edit-basic-info",compact('data'));
}

public function update_basic_info(Request $request, $id){
    $in=User::find($id);


        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string','min:10','max:14'],
            'address' => ['required'],
            'birthday'=>['before:today'],
            'joinned_at'=>'required|before:today',
       
            'password' => ['required', 
               'min:8',  
               'confirmed']



        ]);

        $in->name=$request->name;
        
        $in->joinned_at=$request->joinned_at;
        $in->birthday=$request->birthday;
        
        $in->phone=$request->phone;
        $in->region=$request->region;
        
        $in->gender=$request->gender;
        $in->nationality=$request->nationality;
        $in->address=$request->address;

        $in->save();

        return redirect('/myprofile');
}

public function send_leave_request(Request $request){
    
    $request->validate([
        'desc'=>'required',
        'from'=>'required|after:today',
        'to'=>'required|after:from']);


    $in=new WorkLeave;
    $in->u_id=$request->u_id;
    $in->from=$request->from;
    $in->to=$request->to;
    $in->desc=$request->desc;
    $in->status='Pending';
    $in->save();

    return redirect('/home');
    
}

public function view_leave_request(){

$user=User::all();
$work_leave=WorkLeave::all();

return view("admin.actions.view_leave_request",compact('work_leave','user'));
}


public function view_each_leave_request($id){

    $work_leave=WorkLeave::query()
    ->where('id', $id) 
    ->first();
    $user=User::query()
    ->where('id', $work_leave->u_id) 
    ->first();
   
    
    return view("admin.actions.view_each_leave_request",compact('work_leave','user'));
    }

   
    public function  submit_request_result(Request $request,$id){


        
        $in=WorkLeave::find($id);

        $in->comment=$request->comment;
        $in->status=$request->status;
        $in->save();
        return redirect('/view-leave-request');
}

public function  my_leave_requests(){
$leave=WorkLeave::all();

return view('common.my_leave_requests',compact('leave'));
}



public function add_item(Request $request){
    $in=new Items;
    $sum=0;
    $name=(strtoupper($request->name));
    // dd($request->name);
    $in->name=$name;
    $in->manufactor=$request->manu;
    $in->qty=$request->qty;
    $in->price=$request->price;
    $in->reciptNo=$request->reciptNo;
    $in->save();
    

    $item=Items_total::query()
    ->where('item_name',$name)
    ->first();
    
    // $items=Items_total::all();
    // foreach($items as $item){
    //     echo $item;
    // dd($item);
     
    if( $item){

        $sum=($request->qty+$item->total);
        $item->total=$sum;
        $item->save();


        return redirect('/home');
    }
    else{
    $inp=new Items_total;
    $inp->i_id=$in->id;
    $inp->item_name=$name;
    $inp->total=$request->qty;
    $inp->save();
}


    return redirect('/home');
    }
    
    
public function view_all_item(){
    $data=Items_total::all();
    

return view('admin.actions.property.view_all_property',compact('data'));
}





public function view_all_recorded_item(){
    $data=Items::all();
    
return view('admin.actions.property.view_all_records_of_items',compact('data'));
}


public function assign_items(){


$data=Items_total::all();
$users=User::all();


return view('admin.actions.property.assign_items',compact('users','data'));
}

public function assigned_items( Request $request){
    $in=new ItemAssign;
    $in->u_id=$request->u_id;
    $in->i_id=$request->i_id;
    $in->qty=$request->qty;
    $in->status='Very Well';
    $in->save();

    $item=Items_total::query()
    ->where('id',$request->i_id)
    ->first();


    $sum=($item->assigned+$request->qty);
    $item->assigned= $sum;
    $item->total=$item->total-$request->qty;
    $item->Save();
    return redirect('/home');
}
public function view_all_assined_items(){

    $users=User::all();
    $assigns=ItemAssign::all();
    $items=Items_total::all();
    

return view('admin.actions.property.view_assined_items',compact('users','items','assigns'));
}

public function view_my_assined_items(){

    $users=Auth::user()->id;
    $assigns=ItemAssign::query()
    ->where('u_id',$users)
    ->get();

    $items=Items_total::all();
    

return view('common.my_assined_items',compact('users','items','assigns'));
}


public function update_assine($id){
    $assigns=ItemAssign::query()
    ->where('id',$id)
    ->first();

// // dd($assigns->id);
//         $assigns->status=$request->status;
//         $assigns->save();
$user=Auth::user()->id;
return view('common.change_status_of_assine',compact('assigns','user'));
}

public function update_assine_value(Request $request, $id){
    $assigns=ItemAssign::query()
    ->where('id',$id)
    ->first();

// dd($assigns->id);
        $assigns->status=$request->status;
        $assigns->save();
        return redirect('/dashboard'); 
}


public function submit_request( Request $request){
    // dd($request);
    $in=new ItemRequest();
    $in->u_id=Auth::user()->id;
    $in->i_id=$request->i_id;
    $in->qty=$request->qty;
    $in->status='Pending';
    $in->save();

//     $item=Items_total::query()
//     ->where('id',$request->i_id)
//     ->first();
// // dd($item->assigned);
//     // if($item->assigned){

//     $sum=($item->assigned+$request->qty);
//     $item->assigned= $sum;
//     $item->total=$item->total-$request->qty;
//     $item->Save();
    return redirect('/home');

    // 

}

public function item_request(){
    $data=Items_total::all();
       
return view('common.request_item_in_stock',compact('data'));
}



public function add_edu_exp(){


    // $data=Items_total::all();
    $users=User::all();
    
    
    return view('admin.actions.add_edu_experiance',compact('users'));
    }

    
public function add_work_exp(){


    // $data=Items_total::all();
    $users=User::all();
    
    
    return view('admin.actions.add_work_experiance',compact('users'));
    }



    public function add_edu_exper( Request $request){

        $request->validate([
            // 'name'=>'required',
            // 'email'=>'required|email|unique:users',
            'Started_Date'=>'before:today',
            'Ended_Date'=>'after:Started_Date',
            // 'phone'=> 'required|regex:/(09)[0-9]{9}/',


        ]);


        $in=new Edu_info();
        $in->u_id=$request->u_id;
        $in->inst=$request->inst;
        $in->level=$request->level;
        $in->from=$request->Started_Date; 
        $in->to=$request->Ended_Date;
        $in->field=$request->field;

        $in->save();

        return redirect('/home');
    
   
    
    }
    public function add_work_exper( Request $request){
        $request->validate([
            // 'name'=>'required',
            // 'email'=>'required|email|unique:users',
            'started'=>'before:today',
            // 'Ended_Date'=>'after:Started_Date',
            // 'phone'=> 'required|regex:/(09)[0-9]{9}/',


        ]);

        $in=new Work_exp();
        $in->u_id=$request->u_id;
        $in->inst=$request->inst;
        $in->started=$request->started; 
        $in->field=$request->field;

        $in->save();

        return redirect('/home');
    
   
    }
    public function view_edu_exp( Request $request){

        $user=User::all();
        $edu_exp=Edu_info::all();
        // return redirect('/home');
    
   
    
        return view('admin.actions.view_edu_exp',compact('user','edu_exp'));
    }

    public function view_work_exp( Request $request){

        $user=User::all();
        $work_exp=Work_exp::all();
        // return redirect('/home');
    
   
    
        return view('admin.actions.view_work_exp',compact('user','work_exp'));
    }
}