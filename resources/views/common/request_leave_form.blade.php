<!DOCTYPE html>
<html lang="en">

@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif

<!-- add-patient24:06-->

@include('head');

<body>

    <div class="main-wrapper">
        @include('navbar');
        {{-- @include('reception.sidebar'); --}}
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
                        <b>
                            <h2 class="page-title">Request Work Leave<span class="text-success"></span> </h2>
                        </b>
                        <hr>
                        <br> <br> <br>
                    </div>
                </div>
                <center>
                    <x-jet-validation-errors class="mb-4" />
                </center>


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
                            <br><br>
                            <form action="/send_leave_request" method="POST" enctype="multipart/form-data">
                                @csrf
                                <input type="hidden" value="{{ Auth::user()->id }}" name="u_id">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <label>From <span class="text-danger">*</span></label>
                                            <div class="cal-icon">
                                                <input type="date" class="form-control datetimepicker" name="from"
                                                    required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <label>Upto <span class="text-danger">*</span></label>
                                            <div class="cal-icon">
                                                <input type="date" class="form-control datetimepicker" name="to"
                                                    required>
                                            </div>
                                        </div>
                                    </div>
                                    {{-- GENDEr --}}

                                    <div class="col-sm-12">
                                        <div class="form-group">
                                            <label>Description why you requeted this work leave <span
                                                    class="text-danger">*</span></label>
                                            <textarea type="text" class="form-control" required name="desc" autocomplete="desc">
                                        </textarea>
                                        </div>
                                    </div>


                                    <div class="col-sm-12">


                                    </div>

                                    <br> <br>


                                    <div class="m-t-20 text-center float-right">
                                        <center>
                                            <input type="submit" class="btn btn-primary submit-btn"
                                                style="background: #16a085;" value="Request Leave">
                                        </center>
                                    </div>

                            </form>
                    </div>
                </div>
            </div>

        </div>
    </div>

</body>


<!-- add-patient24:07-->

</html>
