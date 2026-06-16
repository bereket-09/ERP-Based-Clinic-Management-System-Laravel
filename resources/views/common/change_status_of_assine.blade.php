@extends('layouts.portal')

@section('title', 'Update Item Status')

@section('content')
    <div class="row">
        <div class="col-lg-6 offset-lg-3">
            <div class="page-head">
                <h4 class="page-title">Update Item Condition</h4>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="mb-3">
                        <span class="text-muted-2">Current status</span>
                        <div>
                            @if (in_array($assigns->status, ['Very Well', 'Well']))
                                <span class="status-pill is-completed">{{ $assigns->status }}</span>
                            @elseif ($assigns->status === 'Good')
                                <span class="status-pill is-pending">{{ $assigns->status }}</span>
                            @elseif (in_array($assigns->status, ['Bad', 'BAD', 'Damaged']))
                                <span class="status-pill is-danger">{{ $assigns->status }}</span>
                            @else
                                <span class="status-pill is-queued">{{ $assigns->status }}</span>
                            @endif
                        </div>
                    </div>

                    <form action="/update_assine/{{ $assigns->id }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="form-group">
                            <label class="form-label">Set Condition</label>
                            <select class="form-select" name="status" required>
                                <option value="{{ $assigns->status }}">~~~ {{ $assigns->status }} ~~~</option>
                                <option value="Very Well">Very Well</option>
                                <option value="Well">Well</option>
                                <option value="Good">Good</option>
                                <option value="Bad">Bad (Needs Maintenance)</option>
                                <option value="Damaged">Damaged</option>
                            </select>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Update Status</button>
                            <a href="/my_assined_items" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
