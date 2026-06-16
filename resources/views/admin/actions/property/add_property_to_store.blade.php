@extends('layouts.portal')

@section('title', 'Add Property to Store')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <h4 class="page-title">Add New Property to Store</h4>
            </div>

            <div class="card">
                <div class="card-body">
                    <form class="row" method="POST" id="submitProductForm" action="/add-item" enctype="multipart/form-data">
                        @csrf
                        <input type="hidden" name="currnt_date" value="{{ now()->toDateString() }}">

                        <div class="form-group col-md-6">
                            <label class="form-label">Item Name</label>
                            <input type="text" class="form-control" id="productName" placeholder="Item Name" name="name" autocomplete="off" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="form-label">Quantity</label>
                            <input type="number" class="form-control" id="quantity" placeholder="Quantity" name="qty" autocomplete="off" required min="1">
                        </div>
                        <div class="form-group col-md-6">
                            <label class="form-label">Total Price</label>
                            <input type="number" class="form-control" id="rate" placeholder="Price" name="price" autocomplete="off" required min="0">
                        </div>
                        <div class="form-group col-md-6">
                            <label class="form-label">Receipt Number</label>
                            <input type="text" class="form-control" id="mrp" placeholder="Receipt Number" name="reciptNo" autocomplete="off" required minlength="3">
                        </div>
                        <div class="form-group col-md-6">
                            <label class="form-label">Manufacturer's Name</label>
                            <input type="text" class="form-control" id="manu" placeholder="Manufacturer" name="manu" autocomplete="off" required>
                        </div>

                        <div class="col-12 d-flex gap-2 mt-3">
                            <button class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Submit</button>
                            <a href="/view-all-item" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
