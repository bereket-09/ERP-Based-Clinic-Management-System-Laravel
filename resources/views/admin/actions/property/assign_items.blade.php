@extends('layouts.portal')

@section('title', 'Assign Item to User')

@section('content')
    <div class="row">
        <div class="col-lg-6 offset-lg-3">
            <div class="page-head">
                <h4 class="page-title">Assign Item to User</h4>
            </div>

            <div class="card">
                <div class="card-body">
                    <form action="/assigned_items" method="POST" enctype="multipart/form-data">
                        @csrf

                        <div class="form-group">
                            <label class="form-label">Select User</label>
                            <select class="form-select select2" name="u_id" required>
                                <option value="">-- Choose employee --</option>
                                @foreach ($users as $user)
                                    <option value="{{ $user->id }}">{{ $user->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Select Item</label>
                            <select class="form-select select2" name="i_id" required>
                                <option value="">-- Choose item --</option>
                                @foreach ($data as $item)
                                    <option value="{{ $item->id }}">{{ $item->item_name }} ({{ $item->total }} in stock)</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Quantity</label>
                            <input class="form-control" type="number" name="qty" min="1" placeholder="Amount to assign" required>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Assign Item</button>
                            <a href="/view_all_assined_items" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        if (window.jQuery) { jQuery('.select2').select2({ width: '100%' }); }
    });
</script>
@endpush
