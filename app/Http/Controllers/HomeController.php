<?php

namespace App\Http\Controllers;

use App\Models\Edu_info;
// use App\Models\Work_exp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Departement;
use App\Models\DrugOrder;
// use App\Models\Edu_info;
use App\Models\WorkLeave;
use App\Models\Items;
use App\Models\Items_total;
use App\Models\ItemAssign;
use App\Models\ItemRequest;
use App\Models\LabOrder;
use App\Models\Medcine;
use App\Models\Medcine_Name;
use App\Models\Patient;
use App\Models\Visit;
use App\Models\Work_exp;
use Carbon\Carbon;

class HomeController extends Controller
{
    public function index(){
        $users=User::all();

        $doctors=User::query()
        ->where('role','1')
        ->get();

        $patients=Patient::all();
    
        $visits=Visit::all();

        $queueds=Visit::query()
        ->where('statues','Queued')
        ->get();
        $pendings=Visit::query()
        ->where('statues','Pending')
        ->get();
        $Completed=Visit::query()
        ->where('statues','Completed')
        ->get();
        
        $items=Items_total::all();
        $DrugOrders=DrugOrder::all();
        $medicins=Medcine_Name::all();
        $LabQueues=LabOrder::query()
        ->where('status','Queued')
        ->get();
        $LabCompleteds=LabOrder::query()
        ->where('status','Completed')
        ->get();
        $LabPendings=LabOrder::query()
        ->where('status','Pending')
        ->get();
        $expires=Medcine::query()
        ->where('expdate','<', Carbon::now()) 
             ->get(); 




        $user=count($users);
        $doctor=count($doctors);
        $patient=count($patients);
        $visit=count($visits);
        $queued=count($queueds);
        $pending=count($pendings);
        $Completed=count($Completed);
        $Item=count($items);
        $DrugOrder=count($DrugOrders);
        $medicin=count($medicins);
        $LabQueue=count($LabQueues);
        $LabCompleted=count($LabCompleteds);
        $LabPending=count($LabPendings);
        $expire=count($expires);


        
 
        $role=Auth::user();

        if(Auth::id()){

            if(Auth::user()->role=='0'){
            return  view('reception.home',compact('user','doctor','patient','visit','queued','pending','Completed','Item','DrugOrder','medicin','LabQueue','LabCompleted','LabPending','expire'));
        }
        else if(Auth::user()->role=='1'){
            return view('doctor.home',compact('user','doctor','patient','visit','queued','pending','Completed','Item','DrugOrder','medicin','LabQueue','LabCompleted','LabPending','expire'));
        }
        else if(Auth::user()->role=='2'){
            return view('lab.home',compact('user','doctor','patient','visit','queued','pending','Completed','Item','DrugOrder','medicin','LabQueue','LabCompleted','LabPending','expire'));
        }
        else if(Auth::user()->role=='3'){
            return view('pharmacy.home',compact('user','doctor','patient','visit','queued','pending','Completed','Item','DrugOrder','medicin','LabQueue','LabCompleted','LabPending','expire'));
        }
        
        else if(Auth::user()->role=='4'){
            return view('admin.home',compact('user','doctor','patient','visit','queued','pending','Completed','Item','DrugOrder','medicin','LabQueue','LabCompleted','LabPending','expire'));
        }
        
        else{
            return view('homepage',compact('user','doctor','patient','visit','queued','pending','Completed','Item','DrugOrder','medicin','LabQueue','LabCompleted','LabPending','expire'));
        }
    }
    else{
        return redirect()->back();
    }
        
        
    }
    public function homepage(){
        return view('homepage');
    }

    public function profile(){
        

        if(Auth::user()){
            $user=Auth::user()->id;
            $Edu=Edu_info::query()
            ->where('u_id',$user)
            ->get();
            $Work=Work_exp::query()
            ->where('u_id',$user)
            ->get();



        return view('profile.myprofile',compact('user','Edu','Work'));


    }else{
        return redirect('/');
    }
    }
}
