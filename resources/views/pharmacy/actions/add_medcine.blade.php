@extends('layouts.portal')

@section('title', 'Add Medicine')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Add Medicine</h4>
            <div class="page-sub">Record a new drug into the pharmacy store.</div>
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
                    <form method="POST" id="submitProductForm" action="/add_medicines" enctype="multipart/form-data">
                        @csrf
                        <input type="hidden" name="currnt_date" class="form-control">

                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="form-label">Medicine name</label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror"
                                    onkeypress="return /[a-z]/i.test(event.key)" id="productName"
                                    placeholder="Medicine Name" name="name" value="{{ old('name') }}" autocomplete="off" required />
                                @error('name') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Quantity</label>
                                <input type="number" class="form-control @error('qty') is-invalid @enderror" id="quantity" placeholder="Quantity"
                                    name="qty" value="{{ old('qty') }}" autocomplete="off" required pattern="^[0-9]+$" min="1" />
                                @error('qty') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Total price</label>
                                <input type="number" class="form-control @error('price') is-invalid @enderror" id="rate" placeholder="Price" name="price"
                                    value="{{ old('price') }}" autocomplete="off" required pattern="^[0-9]+$" min="0" />
                                @error('price') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Receipt number</label>
                                <input type="text" class="form-control @error('reciptNo') is-invalid @enderror" id="mrp" placeholder="Receipt Number"
                                    name="reciptNo" value="{{ old('reciptNo') }}" autocomplete="off" required pattern="^[0-9]+$" minlength="3" />
                                @error('reciptNo') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Batch no</label>
                                <input type="text" class="form-control @error('bno') is-invalid @enderror" placeholder="Batch No" name="bno"
                                    value="{{ old('bno') }}" autocomplete="off" required pattern="^[Aa-Zz]+$" />
                                <div class="input-hint">Letters only.</div>
                                @error('bno') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Expiry date</label>
                                <input type="date" class="form-control datepicker @error('expdate') is-invalid @enderror" id="datepicker"
                                    placeholder="Expiry Date" name="expdate" value="{{ old('expdate') }}" autocomplete="off" required />
                                @error('expdate') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Manufacturer's name</label>
                                <input type="text" class="form-control @error('manu') is-invalid @enderror" placeholder="Manufacturer" name="manu"
                                    value="{{ old('manu') }}" autocomplete="off" required pattern="^[Aa-Zz]+$" />
                                <div class="input-hint">Letters only.</div>
                                @error('manu') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">Category name</label>
                                <select class="form-control" id="category" name="catagory">
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
                                    <option value="Available">Available</option>
                                    <option value="Not Available">Not Available</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button type="submit" class="btn btn-primary">
                                <i class="fa fa-check"></i> Submit
                            </button>
                            <a href="/view_all_drugs" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
