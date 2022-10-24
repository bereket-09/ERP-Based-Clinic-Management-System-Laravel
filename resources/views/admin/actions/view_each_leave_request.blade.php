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


        <div class="page-wrapper">
            <div class="content">
                <div class="row">

                    <div class="col-lg-8 offset-lg-2">
                        <center>
                            <h4 class="page-title"><b>LEAVE REQUEST FROM EMPLOYEE </b><span class="text-success">'
                                    {{ $user->id }} '</span> </h4>

                        </center>

                        <hr>

                        <br>

                        <h3 for="">Name: &nbsp&nbsp<b>{{ $user->name }}</b></h3>
                        <h3 for="">Role: &nbsp&nbsp<b>

                                @if ($user->role == '4')
                                    Manager
                                @elseif ($user->role == '0')
                                    Reception
                                @elseif ($user->role == '1')
                                    Doctor
                                @elseif ($user->role == '2')
                                    Labratoriset
                                @elseif ($user->role == '3')
                                    Pharmacist
                                @endif

                            </b> </h3>
                        <h3 for="">Email: &nbsp&nbsp<b>{{ $user->email }}</b> </h3>
                        <h3 for="">Gender: &nbsp&nbsp<b>{{ $user->gender }}</b></h3>
                        <h3 for="">PHONE Number:&nbsp &nbsp<b>{{ $user->phone }}</b></h3>
                        {{-- <h3 for="">Doctor:&nbsp &nbsp<b>{{ $user->name }}</b></h3> --}}
                        <br>
                        <hr><br>
                        {{-- {{ dd($DrugsOrder->id) }} --}}
                        <center>
                            <h1 class="page-title">From:
                                {{ $work_leave->from }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Upto:
                                {{ $work_leave->to }}</h1>
                        </center>
                        <h1 class="page-title">Description: </h1>
                        <h1>{{ $work_leave->desc }} </h1>
                        <br>
                        <hr>
                        <form action="/submit_request_result/{{ $work_leave->id }}" method="POST"
                            enctype="multipart/form-data">
                            @csrf
                            {{-- <div class="row"> --}}



                            <div class="form-group">
                                <br>
                                <h1 class="page-title">Comment</h1>
                                <textarea cols="30" rows="4" class="form-control" name="comment" type="text">{{ $work_leave->comment }}</textarea>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">Status</label>
                                <select class="form-control" id="status" name="status">
                                    {{-- <option value="">~~SELECT~~</option> --}}
                                    <option value="Accepted">Accept Request</option>
                                    <option value="Rejected">Reject Request</option>
                                </select>
                            </div>
                    </div>
                </div>

                <div class="col-sm-12">
                    <hr><br>
                    <center>
                        <input type="submit" class="btn btn-primary submit-btn" style="background: #16a085;"
                            value="Submit">
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
</script>
