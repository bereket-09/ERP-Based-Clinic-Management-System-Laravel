<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">{{ $title }}</h4>
            <div class="page-sub">{{ $rows->total() }} order{{ $rows->total() == 1 ? '' : 's' }} {{ Str::lower($status) }}</div>
        </div>
    </div>

    {{-- Toolbar: live search --}}
    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by patient, MRN, ID or order #…"
                wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="card table-card">
        <div class="table-responsive" wire:loading.class="lw-overlay">
            <table class="table table-striped custom-table mb-0">
                <thead>
                    <tr>
                        <th class="sortable {{ $sortField === 'id' ? 'active' : '' }}" wire:click="sortBy('id')">
                            Order # <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th>Patient Name</th>
                        <th>MRN</th>
                        <th>Patient ID</th>
                        <th>Doctor</th>
                        <th class="sortable {{ $sortField === 'status' ? 'active' : '' }}" wire:click="sortBy('status')">
                            Status <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th class="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($rows as $order)
                        @php($visit = $visits->get($order->v_id))
                        @php($patient = $visit ? $patients->get($visit->p_id) : null)
                        @php($doctor = $visit ? $doctors->get($visit->doc_id) : null)
                        @php($pill = $order->status === 'Completed' ? 'is-completed' : ($order->status === 'Pending' ? 'is-pending' : 'is-queued'))
                        <tr wire:key="order-{{ $order->id }}" class="lw-row" style="--i: {{ $loop->index }}">
                            <td class="num">#{{ $order->id }}</td>
                            <td>{{ $patient->name ?? '—' }}</td>
                            <td class="num">{{ $patient->mrn ?? '—' }}</td>
                            <td class="num">{{ $patient->stud_id ?? '—' }}</td>
                            <td>{{ $doctor->name ?? '—' }}</td>
                            <td><span class="status-pill {{ $pill }}">{{ $order->status }}</span></td>
                            <td class="text-right">
                                <a href="/lab_test_results/{{ $order->id }}" class="btn btn-outline-primary take-btn">
                                    {{ $actionLabel }}
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-flask"></i></div>
                                    <h5>No {{ Str::lower($status) }} lab orders</h5>
                                    <p>{{ $search !== '' ? 'Try a different search term.' : 'Nothing here right now.' }}</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">
        {{ $rows->links() }}
    </div>

    @push('styles')
        <style>
            .lw-row { animation: fadeIn .3s var(--ease) backwards; animation-delay: calc(var(--i, 0) * .035s); }
            .table td.num { font-variant-numeric: tabular-nums; }
        </style>
    @endpush
</div>
