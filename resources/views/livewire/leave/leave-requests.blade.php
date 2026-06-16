<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">Work Leave Requests</h4>
            <div class="page-sub">{{ $leaves->total() }} request{{ $leaves->total() == 1 ? '' : 's' }}</div>
        </div>
        <a href="{{ url('/my-leave-requests') }}" class="btn btn-primary btn-rounded"><i class="fa fa-calendar"></i> My Leave Requests</a>
    </div>

    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by employee, status or reason…" wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="card table-card" wire:loading.class="lw-overlay">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th class="sortable {{ $sortField === 'from' ? 'active' : '' }}" wire:click="sortBy('from')">From <i class="fa fa-sort"></i></th>
                        <th class="sortable {{ $sortField === 'to' ? 'active' : '' }}" wire:click="sortBy('to')">Upto <i class="fa fa-sort"></i></th>
                        <th>Description</th>
                        <th>Comment</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($leaves as $leave)
                        <tr wire:key="leave-{{ $leave->id }}">
                            <td>{{ $leave->id }}</td>
                            <td>{{ optional($users->get($leave->u_id))->name ?: '—' }}</td>
                            <td>{{ $leave->from }}</td>
                            <td>{{ $leave->to }}</td>
                            <td>{{ $leave->desc }}</td>
                            <td>{{ $leave->comment ?: '—' }}</td>
                            <td>{{ $leave->created_at }}</td>
                            <td>
                                @if (in_array($leave->status, ['Accepted', 'Approved']))
                                    <span class="status-pill is-completed">{{ $leave->status }}</span>
                                @elseif ($leave->status === 'Rejected')
                                    <span class="status-pill is-danger">{{ $leave->status }}</span>
                                @elseif ($leave->status === 'Return Requested')
                                    <span class="status-pill is-pending">Return Requested</span>
                                @elseif ($leave->status === 'Returned')
                                    <span class="status-pill is-completed">Returned</span>
                                @else
                                    <span class="status-pill is-pending">{{ $leave->status }}</span>
                                @endif
                            </td>
                            <td>
                                @if ($leave->status === 'Return Requested')
                                    <form action="{{ url('/leave/' . $leave->id . '/approve-return') }}" method="POST" class="d-inline">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-primary"><i class="fa fa-check"></i> Approve return</button>
                                    </form>
                                @else
                                    <a href="/view-each-leave-request/{{ $leave->id }}" class="btn btn-sm btn-outline-primary"><i class="fa fa-pencil"></i> Decide</a>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-calendar-o"></i></div>
                                    <h5>No leave requests</h5>
                                    <p>No staff has submitted a leave request yet.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">{{ $leaves->links() }}</div>
</div>
