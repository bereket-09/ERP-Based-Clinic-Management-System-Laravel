@extends('layouts.portal')

@section('title', 'My Leave Requests')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">My Work Leave Requests</h4>
            <div class="page-sub">Your submitted leave requests and their status</div>
        </div>
        <a href="{{ url('/request-leave') }}" class="btn btn-primary btn-rounded"><i class="fa fa-plus"></i> New Leave Request</a>
    </div>

    <div class="card table-card">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>From</th>
                        <th>Upto</th>
                        <th>Description</th>
                        <th>Comment</th>
                        <th>Submitted</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @php($hasRows = false)
                    @foreach ($leave as $data)
                        @if ($data->u_id == Auth::user()->id)
                            @php($hasRows = true)
                            <tr wire:key="myleave-{{ $data->id }}">
                                <td>{{ $data->id }}</td>
                                <td>{{ $data->from }}</td>
                                <td>{{ $data->to }}</td>
                                <td>{{ $data->desc }}</td>
                                <td>{{ $data->comment ?: '—' }}</td>
                                <td>{{ $data->created_at }}</td>
                                <td>
                                    @if (in_array($data->status, ['Accepted', 'Approved']))
                                        <span class="status-pill is-completed">{{ $data->status }}</span>
                                    @elseif ($data->status === 'Rejected')
                                        <span class="status-pill is-danger">{{ $data->status }}</span>
                                    @else
                                        <span class="status-pill is-pending">{{ $data->status }}</span>
                                    @endif
                                </td>
                            </tr>
                        @endif
                    @endforeach

                    @unless ($hasRows)
                        <tr>
                            <td colspan="7">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-calendar-o"></i></div>
                                    <h5>No leave requests yet</h5>
                                    <p>Submit a new request to take time off.</p>
                                </div>
                            </td>
                        </tr>
                    @endunless
                </tbody>
            </table>
        </div>
    </div>
@endsection
