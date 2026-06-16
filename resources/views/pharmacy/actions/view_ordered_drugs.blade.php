@extends('layouts.portal')

@section('title', 'Ordered Drugs')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Ordered Drugs List</h4>
            <div class="page-sub">Queued drug orders awaiting dispensing.</div>
        </div>
        <a href="/view_completed_drug_orders" class="btn btn-light-soft">
            <i class="fa fa-check"></i> Completed orders
        </a>
    </div>

    @php($hasRows = false)

    <div class="table-card">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Patient Name</th>
                        <th>Patient MRN</th>
                        <th>Patient ID</th>
                        <th>Doctor's Name</th>
                        <th>Status</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data as $order)
                        @foreach ($visits as $visit)
                            @if ($visit->id == $order->v_id && $order->status == 'Queued')
                                @php($hasRows = true)
                                <tr>
                                    <td class="num">{{ $order->id }}</td>
                                    @foreach ($patient as $patients)
                                        @if ($patients->id == $visit->p_id)
                                            <td>{{ $patients->name }}</td>
                                            <td class="num">{{ $patients->mrn }}</td>
                                            <td class="num">{{ $patients->stud_id }}</td>
                                        @endif
                                    @endforeach
                                    <td>
                                        @foreach ($doctors as $doctor)
                                            @if ($visit->doc_id == $doctor->id)
                                                {{ $doctor->name }}
                                            @endif
                                        @endforeach
                                    </td>
                                    <td>
                                        @if ($order->status == 'Completed')
                                            <span class="status-pill is-completed">{{ $order->status }}</span>
                                        @else
                                            <span class="status-pill is-queued">{{ $order->status }}</span>
                                        @endif
                                    </td>
                                    <td class="text-right">
                                        <a href="/view_oreder_for_each/{{ $order->v_id }}"
                                            class="btn btn-outline-primary btn-sm">
                                            <i class="fa fa-eye"></i> View order
                                        </a>
                                    </td>
                                </tr>
                            @endif
                        @endforeach
                    @endforeach

                    @unless ($hasRows)
                        <tr>
                            <td colspan="7">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-shopping-bag"></i></div>
                                    <h5>No queued drug orders</h5>
                                    <p>New orders from doctors will appear here.</p>
                                </div>
                            </td>
                        </tr>
                    @endunless
                </tbody>
            </table>
        </div>
    </div>

    @push('styles')
        <style>
            .table td.num { font-variant-numeric: tabular-nums; }
        </style>
    @endpush
@endsection
