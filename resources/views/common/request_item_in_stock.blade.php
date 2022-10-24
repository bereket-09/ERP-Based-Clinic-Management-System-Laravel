<!DOCTYPE html>
<html lang="en">

@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif

<!-- add-department24:07-->

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
    <title>DDU Clinic Center</title>
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/select2.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/style.css">
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



        <div class="page-wrapper">
            <div class="content">
                <div class="row">
                    <div class="col-lg-8 offset-lg-2">
                        <br>
                        <center>
                            <h4 class="page-title">Assign Item</h4>
                        </center>
                        <br>
                        <hr>
                        <br>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-8 offset-lg-2">
                        <center>
                            @if ($errors->any())
                                <div class="w-4/8 m-auto text-center">
                                    @foreach ($errors->all() as $error)
                                        <li class="text-red-500 list-box">
                                            {{ $error }}
                                        </li>
                                    @endforeach
                            @endif

                        </center>
                        <form action="/submit_request" method="POST" enctype="multipart/form-data">
                            @csrf
                            {{-- <input type="hidden" name="" value="{{ $user->id }}"> --}}

                            <div class="form-group" name="i_id">
                                <label>Select Item</label>
                                <select class="form-control" name="i_id">
                                    {{--  --}}
                                    {{-- <option value="">
                                    </option> --}}

                                    @foreach ($data as $data)
                                        <td>
                                            <option value="{{ $data->id }}">{{ $data->item_name }}</option>
                                        </td>
                                    @endforeach
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Enter Amount</label>
                                <input class="form-control" type="number" name="qty" min="1"
                                    max="{{ $data->total }}" required>
                            </div>
                            <div class="m-t-20 text-center">
                                <button class="btn btn-primary submit-btn">Request Item</button>
                            </div>
                        </form>
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
    <script src="assets/js/app.js"></script>
</body>


<!-- add-department24:07-->

</html>
