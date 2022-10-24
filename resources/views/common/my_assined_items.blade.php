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
                        <h4 class="page-title">MY Assined Items List</h4>
                    </div>
                    <div class="col-sm-8 col-9 text-right m-b-20">
                        <a href="{{ url('/submit-request') }}" class="btn btn-primary float-right btn-rounded"><i
                                class="fa fa-plus"></i> New Item Request</a>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="table-responsive">
                            <table class="table table-striped custom-table " name="myTable" id="myTable">
                                {{--  --}}
                                <thead>
                                    <tr>


                                        <th>#</th>
                                        {{-- <th>Name</th> --}}
                                        <th>Item Name</th>
                                        <th>Quantity</th>
                                        {{-- <th style="min-width:200px;">Description</th> --}}
                                        {{-- <th>Stat</th> --}}
                                        {{-- <th>Request Sumbited At</th> --}}
                                        <th>Statues</th>
                                        <th style="min-width:20px;">Actions </th>

                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($assigns as $data)
                                        @if ($data->u_id == Auth::user()->id)
                                            <tr>
                                                <td>
                                                    {{ $data->id }}
                                                </td>
                                                <td>
                                                    @foreach ($items as $item)
                                                        @if ($item->id == $data->i_id)
                                                            {{ $item->item_name }}

                                                </td>
                                                <td>{{ $data->qty }}</td>
                                        @endif
                                    @endforeach
                                    {{-- <td>{{ $data->status }}</td>/ --}}

                                    {{-- <td>{{ $data->comment }}</td> --}}
                                    {{-- <td>{{ $data->created_at }}</td> --}}
                                    <td>
                                        @if ($data->status == 'Very Well')
                                            <span class="custom-badge status-green">

                                                {{ $data->status }}

                                            </span>
                                        @elseif ($data->status == 'Well')
                                            <span class="custom-badge status-green">

                                                {{ $data->status }}

                                            </span>
                                        @elseif($data->status == 'Good')
                                            <span class="custom-badge status-orange">

                                                {{ $data->status }}

                                            </span>
                                        @elseif($data->status == 'BAD')
                                            <span class="custom-badge status-red">

                                                {{ $data->status }}

                                            </span>
                                        @elseif($data->status == 'Damaged')
                                            <span class="custom-badge status-red">

                                                {{ $data->status }}

                                            </span>
                                        @endif
                                    </td>
                                    <td> <a href="/update_assine/{{ $data->id }}"
                                            class="btn btn-outline-primary take-btn">VIEW</a>

                                    </td>

                                    </tr>
                                    @endif
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
