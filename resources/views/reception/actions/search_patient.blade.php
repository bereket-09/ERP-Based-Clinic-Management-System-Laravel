@include('head');
@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif

<body>
    <div class="main-wrapper">
        @include('navbar');
        @include('reception.sidebar');
        <div class="page-wrapper">
            <div class="content">

                <div class="col-lg-8 offset-lg-2 ">


                    <center>

                        <form action="/searchPatient" method="get" enctype="multipart/form-data">
                            @csrf

                            <h1 class="page-title" style="margin-top: 100px;margin-bottom: 25px;">ADD PATIENT</h1>

                            <input class="form-control m-t-10" name="stud_id" type="text"
                                placeholder="Enter Students ID number" required>

                            <div class="m-t-50 text-center">

                                <input type="submit" class="btn btn-primary submit-btn" style="background: #16a085;"
                                    value="Search Patient ID">

                                {{-- <x-jet-button class="ml-4">
                                    {{ __('Register') }}
                                </x-jet-button> --}}

                            </div>
                        </form>

                    </center>

                </div>
            </div>

        </div>
    </div>

    @include('scripts')
</body>



</html>
