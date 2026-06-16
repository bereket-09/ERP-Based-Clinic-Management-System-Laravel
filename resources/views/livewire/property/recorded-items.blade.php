<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">All Property Records</h4>
            <div class="page-sub">{{ $items->total() }} recorded entr{{ $items->total() == 1 ? 'y' : 'ies' }}</div>
        </div>
        @if (Auth::user()->role == '4')
            <a href="{{ url('/add-new-item') }}" class="btn btn-primary btn-rounded"><i class="fa fa-plus"></i> Add Property</a>
        @endif
    </div>

    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by name, manufacturer, receipt…" wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="card table-card" wire:loading.class="lw-overlay">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th class="sortable {{ $sortField === 'reciptNo' ? 'active' : '' }}" wire:click="sortBy('reciptNo')">Receipt No <i class="fa fa-sort"></i></th>
                        <th class="sortable {{ $sortField === 'name' ? 'active' : '' }}" wire:click="sortBy('name')">Name <i class="fa fa-sort"></i></th>
                        <th class="sortable {{ $sortField === 'manufactor' ? 'active' : '' }}" wire:click="sortBy('manufactor')">Manufacturer <i class="fa fa-sort"></i></th>
                        <th class="sortable {{ $sortField === 'qty' ? 'active' : '' }}" wire:click="sortBy('qty')">Quantity <i class="fa fa-sort"></i></th>
                        <th class="sortable {{ $sortField === 'price' ? 'active' : '' }}" wire:click="sortBy('price')">Total Price <i class="fa fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($items as $item)
                        <tr wire:key="rec-{{ $item->id }}">
                            <td>{{ $item->id }}</td>
                            <td>{{ $item->reciptNo }}</td>
                            <td>{{ $item->name }}</td>
                            <td>{{ $item->manufactor }}</td>
                            <td>{{ $item->qty }}</td>
                            <td>{{ $item->price }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-file-text-o"></i></div>
                                    <h5>No records found</h5>
                                    <p>Add property to the store or change your search.</p>
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
