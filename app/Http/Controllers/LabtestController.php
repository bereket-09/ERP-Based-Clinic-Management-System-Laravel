<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Patient;
use App\Models\Departement;
use App\Models\Visit;
use App\Models\LabResult;
use App\Models\LabOrder;
use App\Models\Labtest;
class LabtestController extends Controller
{
// ADD LAB TEST
    public function add_lab_test(Request $request){

        $request->validate([
            'name'=>'required',
            'desc'=> 'required',
            'desc'=> 'required'
        ]);

            $data=new Labtest;
            $data->name=$request->name;
            
            $data->desc=$request->desc;
            
            $data->status=$request->status;
            
            // dd($data->status);
            $data->save();

            $data=Labtest::all();

            return redirect('/view_all_tests');

    }
    

public function view_lab_test(){
    $data=Labtest::all();
    return view("admin.actions.lab_Test.view_test_type",compact('data'));
        }
    
 public function edit_lab_test($id){
            $data=Labtest::find($id);
            return view("admin.actions.lab_Test.edit-test-type",compact('data'));
                }

public function update_lab_test(Request $request, $id){

$in=Labtest::find($id);

            $request->validate([
                'name'=>'required',
                'desc'=> 'required',
                'status'=> 'required'
            ]);
    
            $in->name=$request->name;
    
            $in->desc=$request->desc;
    
            $in->status=$request->status;
                
                
                $in->save();
    
                $data=Labtest::all();
    
    return redirect('/view_all_tests');
    
        }

public function delete_lab_test($id){

            $data=Labtest::find($id);
            $data->delete();
            return redirect()->back();


        }




public function order_lab_test(Request $request,$id){
    $tests=Labtest::all();

    $visits=Visit::query()
    ->where('id', $request->id) 
         ->first();

     $in=Visit::find($visits->id);



        $data=new LabOrder;
        $data->v_id=$visits->id;

        $data->p_id=$visits->p_id;
        
        $data->status='Queued';
        $in->statues='Pending';
       
        // $in->symptoms=$request->symptoms;

        // $in->diagnosis=$request->diagnosis;
    
        // $in->deasease=$request->deasease;
        // // dd($data->status);
        $data->save();
// dd($data)    ;

        $orders=LabOrder::query()
        ->where('v_id', $request->id) 
             ->first();

          foreach($request->testType as $requests){
            $t=Labtest::query()
            ->where('name', $requests) 
                 ->first();
            $in->lab_order_id=$orders->id;
            $result=new LabResult;
            $result->o_id= $orders->id;
            $result->test_id=$t->id;
            $result->status="Queued";

             $result->save();
             
            
            }
  
            $in->save();
            

        return redirect('/queued_patients');

}


public function view_lab_order(){
    $data=LabOrder::all();
    $patient=Patient::all();
    $doctors=User::query()
    ->where('role', '1') 
         ->get();
    $visits=Visit::all();

    return view("lab.actions.view_lab_order",compact('data','patient','visits','doctors'));
        }


 public function lab_test_results($id){
    $test=Labtest::all();

    $orders=LabOrder::query()
    ->where('id', $id) 
         ->first();
   
    // dd($orders->id);
    $results=LabResult::query()
    ->where('o_id', $id) 
         ->get();
        //  dd($results);
    $visits=Visit::query()
        ->where('id',$orders->v_id ) 
             ->first();

   $patient=Patient::query()
             ->where('id', $visits->p_id) 
                  ->first();
        
            return view("lab.actions.lab_test_results",compact('orders','results','visits','patient','test'));
                }




public function save_results(Request $request,$id){
    // $order=LabOrder::find($id);
    // dd($request->submit);
                if($request->submit=="Save Results"){
                    $i=0;
                
                    $results=LabResult::query()
                    ->where('o_id', $id) 
                         ->get(); 

                    foreach($results as $result){
                        $data=LabResult::find($result->id);
                        $data->Result_of_Test=$request->testResult[$i];
                        $i++;
                        $data->status="Pending";
                        $data->save();
                    }
                    $order=LabOrder::find($id);
                   
                    $order->status="Pending";
                    // dd($order->status);
                    $order->save();


                }
                else if($request->submit=="Submit Test Results to Doctor"){
                    $i=0;
                
                    $results=LabResult::query()
                    ->where('o_id', $id) 
                         ->get(); 

                    foreach($results as $result){
                        $data=LabResult::find($result->id);
                        $data->Result_of_Test=$request->testResult[$i];
                        $i++;
                        $data->status="Completed";
                        $data->save();
                    }    
                    
                    $order=LabOrder::find($id);
                   
                    $order->status="Completed";
                    // dd($order->status);
                    $order->save();

                    $visits=Visit::find($order->v_id);
                   
                    $visits->statues="Lab Result Completed";
                    // dd($order->status);
                    $visits->save();

                }
               

                return redirect('/view_lab_order');

                                }
        
 public function view_pending_lab_results(){
      $data=LabOrder::all();
      $patient=Patient::all();
            $doctors=User::query()
               ->where('role', '1') 
               ->get();
           $visits=Visit::all();
                                
             return view("lab.actions.view_pending_lab_results",compact('data','patient','visits','doctors'));
                                        }


public function view_completed_lab_results(){
    $data=LabOrder::all();
    $patient=Patient::all();
          $doctors=User::query()
             ->where('role', '1') 
             ->get();
         $visits=Visit::all();
                              
           return view("lab.actions.view_completed_lab_tests",compact('data','patient','visits','doctors'));
                                      }
}