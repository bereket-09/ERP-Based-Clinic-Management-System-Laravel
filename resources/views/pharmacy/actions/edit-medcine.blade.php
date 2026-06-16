@extends('layouts.portal')

@section('title', 'Edit Medicine')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Edit Medicine</h4>
            <div class="page-sub">Update the record for <b>{{ $data->name }}</b>.</div>
        </div>
        <a href="/view_all_drugs" class="btn btn-light-soft">
            <i class="fa fa-arrow-left"></i> Back to list
        </a>
    </div>

    @if ($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="row">
        <div class="col-lg-10 mx-auto">
            <div class="card">
                <div class="card-body">
                    <form method="POST" id="submitProductForm" action="/edit-medicine/{{ $data->id }}"
                        enctype="multipart/form-data">
                        @csrf
                        <input type="hidden" name="currnt_date" class="form-control">

                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="form-label">Medicine name</label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror" id="productName" placeholder="Medicine Name"
                                    name="name" autocomplete="off" required value="{{ old('name', $data->name) }}" />
                                @error('name') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Quantity</label>
                                <input type="number" class="form-control @error('qty') is-invalid @enderror" id="quantity" placeholder="Quantity"
                                    name="qty" autocomplete="off" required pattern="^[0-9]+$" min="1"
                                    value="{{ old('qty', $data->qty) }}" />
                                @error('qty') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Total price</label>
                                <input type="number" class="form-control @error('price') is-invalid @enderror" id="rate" placeholder="Price" name="price"
                                    autocomplete="off" required pattern="^[0-9]+$" min="0"
                                    value="{{ old('price', $data->price) }}" />
                                @error('price') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Receipt number</label>
                                <input type="text" class="form-control @error('reciptNo') is-invalid @enderror" id="mrp" placeholder="Receipt Number"
                                    name="reciptNo" autocomplete="off" required pattern="^[0-9]+$" minlength="3"
                                    value="{{ old('reciptNo', $data->reciptNo) }}" />
                                @error('reciptNo') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Batch no</label>
                                <input type="text" class="form-control @error('bno') is-invalid @enderror" placeholder="Batch No" name="bno"
                                    autocomplete="off" required pattern="^[Aa-Zz]+$" value="{{ old('bno', $data->bno) }}" />
                                @error('bno') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Expiry date</label>
                                <input type="date" class="form-control datepicker @error('expdate') is-invalid @enderror" id="datepicker"
                                    placeholder="Expiry Date" name="expdate" autocomplete="off" required
                                    value="{{ old('expdate', $data->expdate) }}" />
                                @error('expdate') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Manufacturer's name</label>
                                <input type="text" class="form-control @error('manu') is-invalid @enderror" placeholder="Manufacturer" name="manu"
                                    autocomplete="off" required pattern="^[Aa-Zz]+$"
                                    value="{{ old('manu', $data->manufactor) }}" />
                                @error('manu') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Category name</label>
                                <select class="form-control" id="category" name="catagory">
                                    <option value="{{ $data->catagory }}">{{ $data->catagory }}</option>
                                    <option value="Tablets">Tablets</option>
                                    <option value="Syrup">Syrup</option>
                                    <option value="Skin Liquid">Skin Liquid</option>
                                    <option value="Pain Killer">Pain Killer</option>
                                    <option value="Suppliment">Suppliment</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Status</label>
                                <select class="form-control" id="status" name="status">
                                    <option value="{{ $data->status }}">{{ $data->status }}</option>
                                    <option value="Available">Available</option>
                                    <option value="Not Available">Not Available</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button type="submit" class="btn btn-primary">
                                <i class="fa fa-check"></i> Save changes
                            </button>
                            <a href="/view_all_drugs" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
