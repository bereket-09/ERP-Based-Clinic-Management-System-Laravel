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
    <link rel="stylesheet" href="//code.jquery.com/ui/1.13.1/themes/base/jquery-ui.css">
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




            <div class="container-fluid">
                <div class="row page-titles">
                    <div class="col-md-5 align-self-center">

                    </div>

                </div>

                <br><br>
                <br><br>

                <div>
                    <div class="row">
                        <div class="col-lg-10 mx-auto">
                            <div class="card">
                                <div class="card-title">

                                </div>
                                <div id="add-brand-messages"></div>
                                <center>
                                    <h1 class="page-title">Add New Property to Store</h1>
                                </center>
                                <div class="card-body">
                                    <div class="input-states">

                                        <form class="row" method="POST" id="submitProductForm" action="/add-item"
                                            enctype="multipart/form-data">
                                            @csrf
                                            <input type="hidden" name="currnt_date" class="form-control">


                                            <div class="form-group col-md-6">
                                                <label class="ontrol-label">Item Name</label>
                                                <input type="text" class="form-control" id="productName"
                                                    placeholder="Item Name" name="name" autocomplete="off"
                                                    required="" />
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="control-label">Quantity</label>
                                                <input type="number" class="form-control" id="quantity"
                                                    placeholder="Quantity" name="qty" autocomplete="off"
                                                    required="" pattern="^[0-9]+$" min="1" />
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="control-label">Total Price</label>
                                                <input type="number" class="form-control" id="rate"
                                                    placeholder="Price" name="price" autocomplete="off" required=""
                                                    pattern="^[0-9]+$" min="0" />
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="control-label">Recipet Number</label>
                                                <input type="text" class="form-control" id="mrp"
                                                    placeholder="Recipet Number" name="reciptNo" autocomplete="off"
                                                    required="" pattern="^[0-9]+$" minlength="3" />
                                            </div>

                                            <div class="form-group col-md-6">
                                                <label class="control-label">Manufacturer's Name</label>
                                                <input type="text" class="form-control" id="Batch No"
                                                    placeholder="Manufacturer" name="manu" autocomplete="off"
                                                    required="" pattern="^[Aa-Zz]+$" />
                                            </div>


                                    </div>
                                    <div class="col-md-4 mx-auto">
                                        <button class="btn btn-primary submit-btn">Submit</button>
                                    </div>
                                    </form>
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
            <script src="assets/js/app.js"></script>
            <script src="https://code.jquery.com/jquery-3.6.0.js"></script>
            <script src="https://code.jquery.com/ui/1.13.1/jquery-ui.js"></script>
            {{-- <script>
            $(function() {
                $("#datepicker").datepicker();
            });
        </script> --}}
            {{-- <script>
            $(function() {
                $(function() {
                    $("#datepicker").datepicker();
                    $("#format").on("change", function() {
                        $("#datepicker").datepicker("option", "dateFormat", $(this).val());
                    });
                });
            });
        </script> --}}
</body>


<!-- add-department24:07-->

</html>
