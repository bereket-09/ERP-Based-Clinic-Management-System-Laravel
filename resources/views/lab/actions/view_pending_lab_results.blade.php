<!DOCTYPE html>
<html lang="en">
@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif


<!-- employees23:21-->

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
    <title>DDU Clnic Center</title>
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/dataTables.bootstrap4.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/select2.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap-datetimepicker.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/style.css">
    {{-- <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.11.5/datatables.min.css" /> --}}
    <link rel="stylesheet" type="text/css" href="assets/css/datatables.min.css" />


    <!--[if lt IE 9]>
  <script src="assets/js/html5shiv.min.js"></script>
  <script src="assets/js/respond.min.js"></script>
 <![endif]-->
</head>

<body>
    <div class="main-wrapper">
        @include('navbar')
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

        @if (Auth::user()->role == '0')
            {
            $dd('Auth::user()->role == '0'');
            }
        @endif
        <div class="page-wrapper">
            <div class="content">
                <div class="row">
                    <div class="col-sm-4 col-3">
                        <h4 class="page-title">Pending Lab Tests Results</h4>
                    </div>
                    <div class="col-sm-8 col-9 text-right m-b-20">
                        {{-- <a href="{{ url('/add_test_type') }}" class="btn btn-primary float-right btn-rounded"><i
                                class="fa fa-plus"></i> Add Lab Test</a> --}}
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="table-responsive">
                            <table class="table table-striped custom-table " name="myTable" id="myTable">
                                {{--  --}}
                                <thead>
                                    <tr>


                                        <th>Order ID</th>
                                        <th>Patient Name</th>
                                        <th>Patient MRN</th>
                                        <th>Patient ID</th>
                                        <th>Doctors Name</th>
                                        <th>Status</th>
                                        {{-- <th style="min-width:200px;">Description</th>
                                        <th>statues</th> --}}
                                        <th style="">Actions </th>

                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($data as $data)
                                        <tr>
                                            @foreach ($visits as $visit)
                                                @if ($visit->id == $data->v_id && $data->status == 'Pending')
                                                    <td>
                                                        {{ $data->id }}
                                                    </td>
                                                    <td>
                                                        @foreach ($patient as $patients)
                                                            @if ($patients->id == $visit->p_id)
                                                                {{ $patients->name }}

                                                    </td>
                                                    <td>{{ $patients->mrn }}</td>
                                                    <td>{{ $patients->stud_id }}</td>

                                                    <td>
                                                        @foreach ($doctors as $doctor)
                                                            @if ($visit->doc_id == $doctor->id)
                                                                {{ $doctor->name }}
                                                            @endif
                                                        @endforeach
                                                    </td>
                                                @endif
                                            @endforeach
                                            <td>
                                                @if ($data->status == 'Completed')
                                                    <span class="custom-badge status-green">

                                                        {{ $data->status }}

                                                    </span>
                                                @else
                                                    <span class="custom-badge status-orange">

                                                        {{ $data->status }}

                                                    </span>
                                                @endif
                                            </td>
                                            <td class="">
                                                <a href="/lab_test_results/{{ $data->id }}"
                                                    class="btn btn-outline-primary take-btn">Edit TEST results</a>
                                            </td>
                                    @endif
                                    @endforeach
                                    </tr>
                                    @endforeach

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
    <script src="assets/js/jquery.dataTables.min.js"></script>
    <script src="assets/js/dataTables.bootstrap4.min.js"></script>
    <script src="assets/js/jquery.slimscroll.js"></script>
    <script src="assets/js/select2.min.js"></script>
    <script src="assets/js/moment.min.js"></script>
    <script src="assets/js/bootstrap-datetimepicker.min.js"></script>
    <script src="assets/js/app.js"></script>

    <script type="text/javascript" src="https://cdn.datatables.net/v/dt/dt-1.11.5/datatables.min.js"></script>

</body>


<!-- employees23:22-->

</html>
<script type="text/javascript">
    $(document).ready(function() {
        $('#myTable').DataTable();
    });
</script>
