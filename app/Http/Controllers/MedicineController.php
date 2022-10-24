<?php

namespace App\Http\Controllers;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Patient;
use App\Models\Departement;
use App\Models\DrugOrder;
use App\Models\DrugOrdered;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Labtest;
use App\Models\Medcine_Name;
use App\Models\Medcine;
use App\Models\Visit;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function add_medicine(Request $request){
        $sum=0;
        // $request->validate([
        //     'name'=>'required',
        //     'desc'=> 'required',
        //     'desc'=> 'required'
        // ]);
        $name=(strtoupper($request->name));
            $data=new Medcine();
            $data->name=$name;
            
            $data->qty=$request->qty;
            $data->price=$request->price;
            $data->reciptNo=$request->reciptNo;
            $data->bno=$request->bno;
            
            $data->expdate=$request->expdate;
            
            $data->manufactor=$request->manu;
            $data->catagory=$request->catagory;
            
            $data->status=$request->status;
            
            
            // dd($data->status);
            $data->save();

         

            $med=Medcine_Name::query()
            ->where('m_name', $name) 
                 ->get(); 
            

            foreach($med as $medcine){
                if($medcine->m_name==$name){
                    $in=Medcine_Name::find($medcine->id);
                    $sum=($in->total + $request->qty);
                    // dd($sum);
                    $in->total=$sum;
                    $in->save();
                    $medcine->total= $sum;
                     
                   return redirect('/view_all_drugs');
                }

            }

            
            // Creates a medicine tag
            $in=new Medcine_Name();
            $in->m_name=$name;
            $sum=$request->qty;
            $in->total= $sum;
            $in->save();
            return redirect('/view_all_drugs');

    }

    public function view_all_drugs(){
        $data=Medcine::all();
        $date=Carbon::now() ;
        return view("pharmacy.actions.view_all_Medicin",compact('data','date'));
            }


 public function view_instock_drugs(){
                $data=Medcine_Name::all();
                
                return view("pharmacy.actions.view_instock_drugs",compact('data'));
                    }
                    public function view_outstock_drugs(){
                        $data=Medcine_Name::all();
                        
                        return view("pharmacy.actions.view_outstock_drugs",compact('data'));}

 public function view_expired_drugs(){
    $data=Medcine::query()
    ->where('expdate','<', Carbon::now()) 
         ->get(); 
    
     
         return view("pharmacy.actions.view_expired_drugs",compact('data'));
          }
                                   
public function edit_medicine($id){     
    $data=Medcine::query()
    ->where('id',$id) 
         ->first(); 
          
         return view("pharmacy.actions.edit-medcine",compact('data'));
          }

 public function edit_medicine_vales(Request $request,$id){     
    $name=(strtoupper($request->name));
    $prev="";
    $diff="";
            $data=Medcine::find($id);
            $data->name=$name;
            $prev= $data->qty;
            $data->qty=$request->qty;
            $data->price=$request->price;
            $data->reciptNo=$request->reciptNo;
            $data->bno=$request->bno;
            
            $data->expdate=$request->expdate;
            
            $data->manufactor=$request->manu;
            $data->catagory=$request->catagory;
            
            $data->status=$request->status;
            
            
            // dd($data->status);
            $data->save();

         

            $med=Medcine_Name::query()
            ->where('m_name', $name) 
                 ->get(); 
            

            foreach($med as $medcine){
                if($medcine->m_name==$name){
                    $in=Medcine_Name::find($medcine->id);
                    $diff=$in->total-$prev;
                    $sum=($diff + $request->qty);
                    // dd($sum);
                    $in->total=$sum;
                    $in->save();
                    $medcine->total= $sum;
                     
                   return redirect('/view_all_drugs');
                }

            }

            
            // Creates a medicine tag
            $in=new Medcine_Name();
            $in->m_name=$name;
            $sum=$request->qty;
            $in->total= $sum;
            $in->save();
            return redirect('/view_all_drugs');


                  
            // return redirect('/view_all_drugs');
                  }

                  
public function delete_Medicine($id){

    $data=Medcine::query()
    ->where('id',$id) 
         ->first(); 

         $in=Medcine_Name::query()
         ->where('m_name',$data->name) 
              ->first(); 
//    dd($in);
         $sum=($in->total-$data->qty);
  
         $in->total=$sum;
         $in->save();
    
    $data->delete();
    return redirect()->back();
}


public function ordered_drugs(Request $request,$id){
    $drugs=Medcine_Name::all();

    $visits=Visit::query()
    ->where('id', $request->id) 
         ->first();

     $in=Visit::find($visits->id);

        $data=new DrugOrder();
        $data->v_id=$visits->id;

        $data->p_id=$visits->p_id;
        
        $data->status='Queued';
        $in->statues='Pending';
       
        $data->save();
    

        $orders=DrugOrder::query()
        ->where('v_id', $request->id) 
             ->first();


             $t='';
            
          for($i=0;$i<count($request->drugName);$i++){
          //     echo $request->drugName[$i];
          if(!($request->drugType[$i]=='')){
               echo  $orders->id;
               echo $request->drugName[$i] ;
             echo  $request->drugType[$i];

             $t=Medcine_Name::query()
             ->where('m_name', $request->drugName[$i]) 
                  ->first();
               //    echo $t->id; 
             $result=new DrugOrdered();
            $result->o_id= $orders->id;
            $result->drug_id=$t->id;
            $result->qty=$request->drugType[$i];
            $result->status="Pending";
    $result->save();
          }

          }
           
            $in->order_drug_id=$orders->id;
                
            $in->save();
            
        return redirect('/queued_patients');    
            }
  
      



public function view_orderd_drugs(){

    $data=DrugOrder::all();
    $patient=Patient::all();
    $doctors=User::query()
    ->where('role', '1') 
         ->get();
    $visits=Visit::all();

    return view("pharmacy.actions.view_ordered_drugs",compact('data','patient','visits','doctors'));

}
          

public function view_ordered_drugs_for_each($id){

    $Result="";$drugs="";
    $visits=Visit::query()
    ->where('id', $id) 
         ->first();

    $Orders=DrugOrder::query()
    ->where('v_id', $visits->id) 
         ->first();   


         

    $patient=Patient::query()
         ->where('id', $visits->p_id) 
              ->first();    
           

    $DrugsOrder=DrugOrder::query()
              ->where('v_id', $visits->id) 
                   ->first();   
                   if( $DrugsOrder){
     $drugs=DrugOrdered::query()
            ->where('o_id', $DrugsOrder->id) 
                        ->get();  }
                
    $drugname=Medcine_Name::all();

    $doctor=User::query()
    ->where('id', $visits->doc_id) 
         ->first();
 return view("pharmacy.actions.view_each_order",compact('patient','visits','DrugsOrder','drugs','drugname','doctor'));

    
}

public function update_drug_orders($id){
$sum=0;

 $DrugsOrder=DrugOrdered::find($id);
 $order=DrugOrder::query()
    ->where('id', $DrugsOrder->o_id) 
         ->first();

        //  dd($order);
$med_Left=Medcine_Name::find($DrugsOrder->drug_id);

$sum=($med_Left->total-$DrugsOrder->qty);

// dd($sum);
$med_Left->total=$sum;
$DrugsOrder->status="Completed";
$DrugsOrder->save();
$med_Left->save();
// return redirect()->action([MedicineController::class,'update_drug_orders'])->withInput($id);

$checks=DrugOrdered::query()
->where('o_id', $DrugsOrder->o_id) 
     ->get();
// dd($checks);
     foreach($checks as $check){
        if($check->status== "Queued"){
            return redirect()->back();
        }
     }
     $visits=Visit::query()
     ->where('id', $order->v_id) 
          ->first();
        $order->status="Completed";
        $visits->statues="Completed";
        $visits->save();
        $order->save();
     return redirect('/view_orderd_drugs');
}

public function view_completed_drug_orders(){
$data=DrugOrder::all();
    $patient=Patient::all();
    $doctors=User::query()
    ->where('role', '1') 
         ->get();
    $visits=Visit::all();

    return view("pharmacy.actions.view_completed_drug_order",compact('data','patient','visits','doctors'));
}



public function confirm_all_drugs(Request $request,$id){
     $sum=0;
     $order=DrugOrder::query()
     ->where('id', $id) 
          ->first();
    $visit=Visit::query()
          ->where('id', $order->v_id) 
               ->first();

     $results=DrugOrdered::query()
     ->where('o_id', $order->id) 
     ->get();

     // dd( $result);






     foreach( $results as  $result){
         
          $result->status="Completed";
     
          $result->save();

          $med_Left=Medcine_Name::find($result->drug_id);

          
$sum=($med_Left->total-$result->qty);


$med_Left->total=$sum;
$med_Left->save();
     }
     $order->status="Completed";
     $visit->statues="Completed";
     $visit->save();
     $order->save();
     return redirect('/view_orderd_drugs');
}}