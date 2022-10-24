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
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap4.css" />

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
                    <div class="col-sm-4 col-3">
                        <h1 class="page-title">Completed Treatement</h1>
                    </div>
                    <div class="col-sm-8 col-9 text-right m-b-20">
                        @if (Auth::user()->role == '0')
                            <a href="/search_patient" class="btn btn btn-primary btn-rounded float-right"><i
                                    class="fa fa-plus"></i> Add new Visit</a>
                        @endif
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="table-responsive">
                            <table class="table table-border table-striped custom-table datatable mb-0" name="myTables"
                                id="myTables">
                                {{-- <table name="myTable" id="myTable"> --}}
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>MRN</th>
                                        <th>Full Name</th>
                                        <th>Gender</th>
                                        <th>Departemet</th>
                                        <th>Year</th>
                                        <th>Doctor Name</th>
                                        <th>Statues</th>

                                        <th class="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($visit as $visits)
                                        <tr>
                                            @if (Auth::user()->role == '1')
                                                @if ($visits->statues == 'Completed')
                                                    @foreach ($patient as $patients)
                                                        @if ($patients->id == $visits->p_id && Auth::user()->id == $visits->doc_id)
                                                            <td>{{ $patients->stud_id }}</td>
                                                            <td>{{ $patients->mrn }}</td>
                                                            <td>{{ $patients->name }}</td>
                                                            <td>{{ $patients->gender }}</td>
                                                            <td>{{ $patients->dept }}</td>
                                                            <td>{{ $patients->year }}</td>
                                                            @foreach ($doctors as $doctor)
                                                                @if ($visits->doc_id == $doctor->id)
                                                                    <td>{{ $doctor->name }}</td>
                                                                @endif
                                                            @endforeach


                                                            <td>
                                                                @if ($visits->statues == 'Completed')
                                                                    <span class="custom-badge status-green">
                                                                        {{ $visits->statues }} Results

                                                                    </span>
                                                                @endif
                                                            </td>




                                                            <td class="text-center">
                                                                <a href="/treat/{{ $visits->id }}"
                                                                    class="btn btn-outline-primary take-btn">UPDATE</a>
                                                                {{-- <div class="dropdown dropdown-action" width="50">
                                                                    <a href="#" class="action-icon dropdown-toggle"
                                                                        data-toggle="dropdown" aria-expanded="false"><i
                                                                            class="fa fa-ellipsis-v"></i></a>
                                                                    <div class="dropdown-menu dropdown-menu-right">
                                                                        <a class="dropdown dropdown-item"
                                                                            href="{{ url('/updatePatient', $patients->id) }}"><i
                                                                                class="fa fa-pencil m-r-5"></i> Edit</a> --}}


                                                                {{-- <a href="{{ url('/deletePatient', $patients->id) }}"
                                                            onclick="return confirm('Are you Sure you want to delete this Patient --({{ $patients->name }})--  ??' )"
                                                            width="100%" class="dropdown dropdown-item "
                                                            style="background-color: #f62d51;color:white"><i
                                                                class="fa fa-trash-o m-r-5"></i>
                                                            Delete</a> --}}

                        </div>

                    </div>
                    </td>
                    @endif
                    @endforeach
                    @endif
                @else
                    @if ($visits->statues == 'Completed')
                        @foreach ($patient as $patients)
                            @if ($patients->id == $visits->p_id)
                                <td>{{ $patients->stud_id }}</td>
                                <td>{{ $patients->mrn }}</td>
                                <td>{{ $patients->name }}</td>
                                <td>{{ $patients->gender }}</td>
                                <td>{{ $patients->dept }}</td>
                                <td>{{ $patients->year }}</td>
                                @foreach ($doctors as $doctor)
                                    @if ($visits->doc_id == $doctor->id)
                                        <td>{{ $doctor->name }}</td>
                                    @endif
                                @endforeach


                                <td>
                                    @if ($visits->statues == 'Completed')
                                        <span class="custom-badge status-green">

                                            {{ $visits->statues }} Results

                                        </span>
                                    @endif
                                </td>




                                <td class="text-right">
                                    <div class="dropdown dropdown-action" width="50">
                                        <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown"
                                            aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                                        <div class="dropdown-menu dropdown-menu-right">
                                            <a class="dropdown dropdown-item"
                                                href="{{ url('/updatePatient', $patients->id) }}"><i
                                                    class="fa fa-pencil m-r-5"></i> Edit</a>


                                            {{-- <a href="{{ url('/deletePatient', $patients->id) }}"
                                                            onclick="return confirm('Are you Sure you want to delete this Patient --({{ $patients->name }})--  ??' )"
                                                            width="100%" class="dropdown dropdown-item "
                                                            style="background-color: #f62d51;color:white"><i
                                                                class="fa fa-trash-o m-r-5"></i>
                                                            Delete</a> --}}

                                        </div>

                                    </div>
                                </td>
                            @endif
                        @endforeach
                    @endif
                    @endif
                    </tr>
                    @endforeach
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    {{-- </div> --}}



    </div>
    </div>
    </div>
    </div>

    </div>

    </div>
    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.js"></script>
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
    <script type="text/javascript" src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap4.js"></script>

    <script type="text/javascript">
        $(document).ready(function() {
            $('#myTables').DataTable();
        });
    </script>
</body>

{{-- <script type="text/javascript">
    $(document).ready(function() {
        $('#myTable').DataTable();
    });
</script> --}}

<!-- patients23:19-->

</html>
