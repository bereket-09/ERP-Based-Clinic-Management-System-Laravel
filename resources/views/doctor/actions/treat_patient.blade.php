<!DOCTYPE html>
<html lang="en">

@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif

@include('head');
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
<link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
<title>Dire Dawa University CLinic Center</title>
<link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="assets/css/dataTables.bootstrap4.min.css">
<link rel="stylesheet" type="text/css" href="assets/css/select2.min.css">
<link rel="stylesheet" type="text/css" href="assets/css/bootstrap-datetimepicker.min.css">
<link rel="stylesheet" type="text/css" href="assets/css/style.css">
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.11.5/datatables.min.css" />
<link rel="stylesheet" type="text/css" href="assets/css/datatables.min.css" />

<base href="/public">

<body>
    <div class="main-wrapper">

        @include('navbar');

        @if (Auth::user()->role == '4')
            {
            @include('admin.sidebar')
            }
        @elseif (Auth::user()->role == '0')
            {
            @include('reception.sidebar')
            }
        @elseif (Auth::user()->role == '1')
            {
            @include('doctor.sidebar')
            }
        @elseif (Auth::user()->role == '2')
            {
            @include('lab.sidebar')
            }
        @elseif (Auth::user()->role == '3')
            {
            @include('pharmacy.sidebar')
            }
        @endif


        <div class="page-wrapper" >
            <div class="content">
                <div class="row" id="printContent">

                    <div class="col-lg-8 offset-lg-2">
                        <center>
                            <h4 class="page-title"><b>Treat Patient with ID number </b><span class="text-success">'
                                    {{ $patient->id }} '</span> </h4>

                        </center>      @if($visits->statues=="Completed")
                        <button type="button" value="Click Here" class="btn btn-primary" onclick="printDivContent()"
                  
                            style="background: #1a0af5;float-right">Print SICK LEAVE</button>
                        @endif
                        <br><br>

                        <hr>
                        <br>

                        <h1 for="">Name: &nbsp&nbsp<b>{{ $patient->name }}</b></h1>
                        <h1 for="">MRN: &nbsp&nbsp<b>{{ $patient->mrn }}</b> </h1>
                        <h1 for="">ID: &nbsp&nbsp<b>{{ $patient->stud_id }}</b> </h1>
                        <h1 for="">Departement: &nbsp&nbsp<b>{{ $patient->dept }}</b></h1>
                        <h1 for="">Year:&nbsp &nbsp<b>{{ $patient->year }}</b></h1>
                        <br>
                        <hr><br>
                        <form action="/order_lab/{{ $visits->id }}" method="get" enctype="multipart/form-data"
                            id="myForm">
                            {{-- /update_treat_info/{{ $visits->id }} --}}
                            @csrf
                            <div class="row">
                                <div class="col-sm-12">
                                    <div class="form-group">
                                        <label>Symptoms <span class="text-danger">*</span></label>
                                        <textarea name="symptoms" id="" cols="50" rows="2">{{ $visits->symptoms }}</textarea>
                                        {{-- <input class="form-control" type="text" name="name" required> --}}
                                        {{-- <input class="form-control" type="hidden" name="stud_id" value=""> --}}
                                    </div>
                                </div>
                                <hr>
                                <div class="col-sm-12">
                                    <div class="form-group">
                                        <label>Diagnosis <span class="text-danger">*</span></label>
                                        <textarea name="diagnosis" id="" cols="50" rows="2">{{ $visits->diagnosis }}</textarea>

                                    </div>
                                </div>
                                <div class="col-sm-12">
                                    <div class="form-group">
                                        <label>Deasease <span class="text-danger">*</span></label>
                                        <textarea name="deasease" id="" cols="50" rows="2">{{ $visits->deasease }}</textarea>

                                    </div>
                                </div>
                                <div class="col-sm-12">
                                    <div class="form-group">
                                        <label style="font-size: 20px">Order Lab Test ? <span
                                                class="text-danger">*</span></label>
                                        @if ($visits->lab_order_id == '')
                                            <span class="text-danger" style="font-size: 20px">No</span>


                                            <input type="submit" class="btn btn-primary submit-btn"
                                                style="background: #1a0af5;margin-right:50px;margin-left: 35px;"
                                                value="Ordered Lab Test" name="submit" style="margin-left: 35pxpx;">



                                            {{-- <a href="/order_lab/{{ $visits->id }}" class="btn btn btn-primary  "
                                                style="margin-left: 55px;"
                                                onclick="document.getElementById('myForm').submit()"> <i
                                                    class="fa fa-plus"></i> Ordered Lab
                                                Test
                                            </a> --}}
                                        @else
                                            <span class="text-success" style="font-size: 20px">Yes</span>
                                            <div>
                                                <table class="table table-striped custom-table">
                                                    <thead>
                                                        <th>Ordered Lab Test Type</th>
                                                        <th>Test Result</th>
                                                        <th>Test Statues</th>
                                                    </thead>
                                                    <tbody>

                                                        @foreach ($Result as $result)
                                                            <tr>
                                                                <td>
                                                                    @foreach ($test as $tests)
                                                                        @if ($tests->id == $result->test_id)
                                                                            <b>{{ $tests->name }}</b>
                                                                        @endif
                                                                    @endforeach
                                                                </td>
                                                                <td><b>{{ $result->Result_of_Test }}</b></td>
                                                                <td><b>{{ $result->status }}</b></td>
                                                            </tr>
                                                        @endforeach

                                                    </tbody>
                                                </table>
                                            </div>

                                        @endif

                                    </div>
                                </div>
                                <div class="col-sm-12">
                                    <div class="form-group">
                                        <label style="font-size: 20px">Ordered Medicine ? <span
                                                class="text-danger">*</span></label>
                                        @if ($visits->order_drug_id == '')
                                            <span class="text-danger" style="font-size: 20px">No</span>

                                            {{-- <input type="submit" class="btn btn btn-primary"
                                                style="background: #1a0af5; margin-right:50px;margin-left: 35px;"
                                                value="Order Drugs" name="submit" style=""> --}}

                                            <a href="/order_drug/{{ $visits->id }}" class="btn btn btn-primary  "
                                                style="margin-left: 55px;"><i class="fa fa-plus"></i> Order
                                                Drug &nbsp&nbsp</a>
                                        @else
                                            <span class="text-success" style="font-size: 20px">Yes</span>
                                            <div>
                                                <table class="table table-striped custom-table">
                                                    <thead>
                                                        <th>Ordered Drugs</th>
                                                        <th>Quantity</th>
                                                        <th>Statues</th>
                                                    </thead>
                                                    <tbody>

                                                        @foreach ($drugs as $drug)
                                                            <tr>
                                                                <td>
                                                                    @foreach ($drugname as $name)
                                                                        @if ($name->id == $drug->drug_id)
                                                                            <b>{{ $name->m_name }}</b>
                                                                        @endif
                                                                    @endforeach
                                                                </td>
                                                                <td><b>{{ $drug->qty }}</b></td>
                                                                <td><b>{{ $drug->status }}</b></td>
                                                            </tr>
                                                        @endforeach

                                                    </tbody>
                                                </table>
                                            </div>

                                        @endif
                                    </div>
                                </div>

                                <div class="col-sm-12">
                                    <hr><br>
                                    <center>
                                        {{-- <input type="submit" class="btn btn-primary submit-btn" --}}
                                        {{-- style="background: #16a085;" value="Complete Treatement"> --}}

                                        <input type="submit" class="btn btn-primary submit-btn"
                                            style="background: #16a085;" value="Completed Treatement" name="submit"
                                            style="margin-left: 35pxpx;">
                                    </center>
                                </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        </tbody>
        </table>
    </div>
    </div>
    </div>
    </div>

    </div>
    <div id="delete_patient" class="modal fade delete-modal" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body text-center">
                    <img src="assets/img/sent.png" alt="" width="50" height="46">
                    <h3>Are you sure want to delete this Patient?</h3>
                    <div class="m-t-20"> <a href="#" class="btn btn-white" data-dismiss="modal">Close</a>
                        <button type="submit" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    </div>
    <div class="sidebar-overlay" data-reff=""></div>
    <script src="assets/js/jquery-3.2.1.min.js"></script>
    <script src="assets/js/popper.min.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery.slimscroll.js"></script>
    <script src="assets/js/select2.min.js"></script>
    <script src="assets/js/jquery.dataTables.min.js"></script>
    <script src="assets/js/dataTables.bootstrap4.min.js"></script>
    <script src="assets/js/moment.min.js"></script>
    <script src="assets/js/bootstrap-datetimepicker.min.js"></script>
    <script src="assets/js/app.js"></script>
</body>


<!-- patients23:19-->

</html>
<script type="text/javascript">
    $(document).ready(function() {
        $('#myTable').DataTable();
    });

    function printDivContent() {
        var divElementContents = document.getElementById("printContent").innerHTML;
        var windows = window.open('', '', 'height=1366, width=768');
        windows.document.write('<html>');
        // windows.document.write('<body > <h1>Div\'s Content Are Printed Below<br>');
        windows.document.write(divElementContents);
        windows.document.write('</body></html>');
        windows.document.close();
        windows.print();
    }
</script>
