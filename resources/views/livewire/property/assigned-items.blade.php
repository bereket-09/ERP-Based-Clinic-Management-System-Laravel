<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">Assigned Items</h4>
            <div class="page-sub">{{ $assigns->total() }} assignment{{ $assigns->total() == 1 ? '' : 's' }}</div>
        </div>
        @if (Auth::user()->role == '4')
            <a href="{{ url('/assign-item-for-user') }}" class="btn btn-primary btn-rounded"><i class="fa fa-plus"></i> Assign Item</a>
        @endif
    </div>

    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by employee, item or status…" wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="card table-card" wire:loading.class="lw-overlay">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Employee</th>
                        <th>Item</th>
                        <th class="sortable {{ $sortField === 'qty' ? 'active' : '' }}" wire:click="sortBy('qty')">Quantity <i class="fa fa-sort"></i></th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($assigns as $assign)
                        <tr wire:key="assign-{{ $assign->id }}">
                            <td>{{ $assign->id }}</td>
                            <td>{{ optional($users->get($assign->u_id))->name ?: '—' }}</td>
                            <td>{{ optional($items->get($assign->i_id))->item_name ?: '—' }}</td>
                            <td>{{ $assign->qty }}</td>
                            <td>
                                @if ($assign->status === 'Very Well')
                                    <span class="status-pill is-completed">{{ $assign->status }}</span>
                                @else
                                    <span class="status-pill is-pending">{{ $assign->status }}</span>
                                @endif
                            </td>
                            <td>
                                <a href="/update_assine/{{ $assign->id }}" class="btn btn-sm btn-outline-primary"><i class="fa fa-eye"></i> View</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-cubes"></i></div>
                                    <h5>No assigned items</h5>
                                    <p>Assign items to staff or change your search.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">{{ $assigns->links() }}</div>
</div>
