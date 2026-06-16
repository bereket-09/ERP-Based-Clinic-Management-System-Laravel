@extends('layouts.portal')

@section('title', 'My Assigned Items')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">My Assigned Items</h4>
            <div class="page-sub">Equipment and property assigned to you</div>
        </div>
        <a href="{{ url('/submit-request') }}" class="btn btn-primary btn-rounded"><i class="fa fa-plus"></i> New Item Request</a>
    </div>

    <div class="card table-card">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @php($hasRows = false)
                    @foreach ($assigns as $data)
                        @if ($data->u_id == Auth::user()->id)
                            @php($hasRows = true)
                            @php($item = $items->firstWhere('id', $data->i_id))
                            <tr wire:key="myassign-{{ $data->id }}">
                                <td>{{ $data->id }}</td>
                                <td>{{ $item->item_name ?? '—' }}</td>
                                <td>{{ $data->qty }}</td>
                                <td>
                                    @if (in_array($data->status, ['Very Well', 'Well']))
                                        <span class="status-pill is-completed">{{ $data->status }}</span>
                                    @elseif ($data->status === 'Good')
                                        <span class="status-pill is-pending">{{ $data->status }}</span>
                                    @elseif (in_array($data->status, ['BAD', 'Damaged']))
                                        <span class="status-pill is-danger">{{ $data->status }}</span>
                                    @else
                                        <span class="status-pill is-queued">{{ $data->status }}</span>
                                    @endif
                                </td>
                                <td>
                                    <a href="/update_assine/{{ $data->id }}" class="btn btn-sm btn-outline-primary"><i class="fa fa-pencil"></i> Update Status</a>
                                </td>
                            </tr>
                        @endif
                    @endforeach

                    @unless ($hasRows)
                        <tr>
                            <td colspan="5">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-cubes"></i></div>
                                    <h5>No items assigned to you</h5>
                                    <p>Request an item from the store to get started.</p>
                                </div>
                            </td>
                        </tr>
                    @endunless
                </tbody>
            </table>
        </div>
    </div>
@endsection
