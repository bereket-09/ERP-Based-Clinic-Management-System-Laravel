<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">{{ $title }}</h4>
            <div class="page-sub">{{ $items->total() }} item{{ $items->total() == 1 ? '' : 's' }} in store</div>
        </div>
        @if (Auth::user()->role == '4')
            <a href="{{ url('/add-new-item') }}" class="btn btn-primary btn-rounded"><i class="fa fa-plus"></i> Add Property</a>
        @endif
    </div>

    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by item name…" wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="card table-card" wire:loading.class="lw-overlay">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th class="sortable {{ $sortField === 'item_name' ? 'active' : '' }}" wire:click="sortBy('item_name')">
                            Name <i class="fa fa-sort"></i>
                        </th>
                        <th class="sortable {{ $sortField === 'total' ? 'active' : '' }}" wire:click="sortBy('total')">
                            Unassigned <i class="fa fa-sort"></i>
                        </th>
                        <th class="sortable {{ $sortField === 'assigned' ? 'active' : '' }}" wire:click="sortBy('assigned')">
                            Assigned <i class="fa fa-sort"></i>
                        </th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($items as $item)
                        <tr wire:key="prop-{{ $item->id }}">
                            <td>{{ $item->id }}</td>
                            <td>{{ $item->item_name }}</td>
                            <td>{{ $item->total }}</td>
                            <td>{{ $item->assigned }}</td>
                            <td>{{ $item->assigned + $item->total }}</td>
                            <td>
                                @if ($item->total > 0)
                                    <span class="status-pill is-completed">Available</span>
                                @else
                                    <span class="status-pill is-danger">Out of stock</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-cubes"></i></div>
                                    <h5>No property found</h5>
                                    <p>Add items to the store or change your search.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">{{ $items->links() }}</div>
</div>
