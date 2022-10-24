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
                        <h4 class="page-title">OUT OF STOCK Medicines List</h4>
                    </div>
                    <div class="col-sm-8 col-9 text-right m-b-20">
                        @if (Auth::user()->role == '3')
                            <a href="{{ url('/add_medicine') }}" class="btn btn-primary float-right btn-rounded"><i
                                    class="fa fa-plus"></i> Add Medicin</a>
                        @endif
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="table-responsive">
                            <table class="table table-striped custom-table " name="myTable" id="myTable">
                                {{--  --}}
                                <thead>
                                    <tr>

                                        <center>
                                            <th>#ID</th>
                                            <th>Drug Name</th>
                                            <th>Total Quantity Avaliable</th>
                                            {{-- <th>Recipt Number</th> --}}
                                            {{-- <th>Batch Number</th> --}}
                                            {{-- <th>Expire Date</th> --}}
                                            {{-- <th>Manufactor</th> --}}
                                            {{-- <th>Total </th> --}}
                                            <th>statues</th>
                                            {{-- <th>Actions </th> --}}
                                        </center>

                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($data as $data)
                                        @if ($data->total <= 0)
                                            <tr>
                                                <td>
                                                    {{ $data->id }}
                                                </td>
                                                <td>{{ $data->m_name }}</td>
                                                <td>
                                                    {{ $data->total }}
                                                </td>
                                                {{-- <td>{{ $data->reciptNo }}</td>
                                            <td>{{ $data->bno }}</td>
                                            <td>{{ $data->expdate }}</td>
                                            <td>{{ $data->manufactor }}</td>
                                            <td>{{ $data->catagory }}</td> --}}
                                                <td>

                                                    <span class="custom-badge status-red">

                                                        OUT OF STOCK

                                                    </span>

                                                </td>
                                                {{-- <td class="text-right">
                                                    <center>
                                                        <div class="dropdown dropdown-action" width="50">
                                                            <a href="#" class="action-icon dropdown-toggle"
                                                                data-toggle="dropdown" aria-expanded="false"> -_- <i
                                                                    class="fa fa-ellipsis-v"></i></a>
                                                            <div class="dropdown-menu dropdown-menu-right">
                                                                <a class="dropdown dropdown-item"
                                                                    href="{{ url('/edit-medicine', $data->id) }}"><i
                                                                        class="fa fa-pencil m-r-5"></i> Edit</a>


                                                                <a href="{{ url('/delete_medicine', $data->id) }}"
                                                                    onclick="return confirm('Are you Sure you want to delete this Medicine --({{ $data->name }})--  ??' )"
                                                                    width="100%" class="dropdown dropdown-item "
                                                                    style="background-color: #f62d51;color:white"><i
                                                                        class="fa fa-trash-o m-r-5"></i>
                                                                    Delete</a>

                                                            </div>

                                                    </center>
                                          
                                          
                                          
                                                
                                                </tr> --}}
                                        @endif
                                    @endforeach

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        {{-- <div id="delete_employee" class="modal fade delete-modal" role="dialog">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center">
                        <img src="assets/img/sent.png" alt="" width="50" height="46">
                        <h3>Are you sure want to delete this Employee?</h3>
                        <div class="m-t-20"> <a href="#" class="btn btn-white" data-dismiss="modal">Close</a>
                            <button type="submit" class="btn btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div> --}}
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
