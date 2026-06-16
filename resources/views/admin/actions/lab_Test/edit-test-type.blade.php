@extends('layouts.portal')

@section('title', 'Edit Lab Test Type')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <div>
                    <h4 class="page-title">Edit lab test type</h4>
                    <div class="page-sub">Update the details for <b>{{ $data->name }}</b>.</div>
                </div>
                <a href="/view_all_tests" class="btn btn-light-soft btn-rounded">
                    <i class="fa fa-arrow-left"></i> Back to list
                </a>
            </div>

            <div class="card">
                <div class="card-body">
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form action="{{ url('/update_lab_test', $data->id) }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="form-group">
                            <label class="form-label">Test name</label>
                            <input class="form-control @error('name') is-invalid @enderror" type="text" name="name"
                                value="{{ old('name', $data->name) }}">
                            @error('name') <div class="field-error">{{ $message }}</div> @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea cols="30" rows="4" class="form-control @error('desc') is-invalid @enderror"
                                name="desc">{{ old('desc', $data->desc) }}</textarea>
                            @error('desc') <div class="field-error">{{ $message }}</div> @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label display-block">Test status</label>
                            @php($status = old('status', $data->status))
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="status" id="product_active"
                                    value="Active" {{ $status === 'Active' ? 'checked' : '' }}>
                                <label class="form-check-label" for="product_active">Active</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="status" id="product_inactive"
                                    value="Inactive" {{ $status === 'Inactive' ? 'checked' : '' }}>
                                <label class="form-check-label" for="product_inactive">Inactive</label>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fa fa-check"></i> Update Test
                            </button>
                            <a href="/view_all_tests" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
