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
        @include('admin.sidebar')
        <div class="page-wrapper">
            <div class="content">
                <div class="row">
                    <div class="col-lg-8 offset-lg-2">
                        <br>
                        <center>
                            <h4 class="page-title">Add Education Experiance</h4>
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
                        <form action="/add-edu-exp" method="POST" enctype="multipart/form-data">
                            @csrf
                            {{-- <input type="hidden" name="" value="{{ $user->id }}"> --}}
                            <div class="form-group">
                                <label>Select User</label>
                                <select class="form-control" name="u_id">

                                    @foreach ($users as $user)
                                        <td>
                                            <option value="{{ $user->id }}">{{ $user->name }}</option>
                                        </td>
                                    @endforeach
                                </select>
                            </div>
                            <div class="form-group" name="i_id">
                                <label>Select Education Level</label>
                                <select class="form-control" name="level">
                                    {{--  --}}
                                    <option value="UG">Under Graduate (Bacheler Degree)</option>
                                    <option value="PG">POST Graduate (Masters Degree) </option>
                                    <option value="Phd">Doctorate (Phd) </option>
                                    <option value="TVET">TVET </option>
                                    <option value="Preparatory">Preparatory </option>

                                </select>
                            </div>

                            <div class="form-group">
                                <label>Enter Inisitution Name</label>
                                <input class="form-control" type="text" onkeypress="return /[a-z]/i.test(event.key)"
                                    name="inst" placeholder="Enter Inistitution name" required>
                            </div>
                            <div class="form-group">
                                <label>Enter Field of Study </label>
                                <input class="form-control" onkeypress="return /[a-z]/i.test(event.key)"
                                    type="text"placeholder="Enter field" name="field" required>
                            </div>
                            <div class="form-group">
                                <label>Enter Started Date</label>
                                <input class="form-control datepicker" type="date" name="Started_Date" required>
                            </div>
                            <div class="form-group">
                                <label>Enter Ended Date</label>
                                <input class="form-control datepicker" type="date" name="Ended_Date" required>
                            </div>
                            <div class="m-t-20 text-center">
                                <button class="btn btn-primary submit-btn">Add Information</button>
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
