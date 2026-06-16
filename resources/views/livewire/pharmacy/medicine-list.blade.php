<div>
    @php($catalogue = in_array($filter, ['instock', 'outstock']))

    <div class="page-head">
        <div>
            <h4 class="page-title">{{ $title }}</h4>
            <div class="page-sub">{{ $rows->total() }} {{ Str::plural('record', $rows->total()) }}</div>
        </div>
        @if (Auth::user()->role == '3')
            <a href="{{ url('/add_medicine') }}" class="btn btn-primary btn-rounded">
                <i class="fa fa-plus"></i> Add medicine
            </a>
        @endif
    </div>

    {{-- Toolbar: live search --}}
    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control"
                placeholder="{{ $catalogue ? 'Search by drug name…' : 'Search by name, manufacturer, category…' }}"
                wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="table-card" wire:loading.class="lw-overlay">
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th class="sortable {{ $sortField === 'id' ? 'active' : '' }}" wire:click="sortBy('id')">
                            #ID
                            @if ($sortField === 'id')<i class="fa fa-sort-{{ $sortDirection === 'asc' ? 'asc' : 'desc' }}"></i>@endif
                        </th>
                        <th class="sortable {{ $sortField === 'name' ? 'active' : '' }}" wire:click="sortBy('name')">
                            Drug Name
                            @if ($sortField === 'name')<i class="fa fa-sort-{{ $sortDirection === 'asc' ? 'asc' : 'desc' }}"></i>@endif
                        </th>
                        @if ($catalogue)
                            <th class="sortable {{ $sortField === 'total' ? 'active' : '' }}" wire:click="sortBy('total')">
                                Total Available
                                @if ($sortField === 'total')<i class="fa fa-sort-{{ $sortDirection === 'asc' ? 'asc' : 'desc' }}"></i>@endif
                            </th>
                            <th>Status</th>
                        @else
                            <th class="sortable {{ $sortField === 'qty' ? 'active' : '' }}" wire:click="sortBy('qty')">
                                Quantity
                                @if ($sortField === 'qty')<i class="fa fa-sort-{{ $sortDirection === 'asc' ? 'asc' : 'desc' }}"></i>@endif
                            </th>
                            <th class="sortable {{ $sortField === 'price' ? 'active' : '' }}" wire:click="sortBy('price')">
                                Total Price
                                @if ($sortField === 'price')<i class="fa fa-sort-{{ $sortDirection === 'asc' ? 'asc' : 'desc' }}"></i>@endif
                            </th>
                            <th>Receipt No</th>
                            <th>Batch No</th>
                            <th class="sortable {{ $sortField === 'expdate' ? 'active' : '' }}" wire:click="sortBy('expdate')">
                                Expire Date
                                @if ($sortField === 'expdate')<i class="fa fa-sort-{{ $sortDirection === 'asc' ? 'asc' : 'desc' }}"></i>@endif
                            </th>
                            <th>Manufacturer</th>
                            <th>Category</th>
                            <th>Status</th>
                            @if (Auth::user()->role == '3')
                                <th class="text-right">Actions</th>
                            @endif
                        @endif
                    </tr>
                </thead>
                <tbody>
                    @forelse ($rows as $row)
                        @if ($catalogue)
                            <tr wire:key="cat-{{ $row->id }}" class="lw-row" style="--i: {{ $loop->index }}">
                                <td class="num">{{ $row->id }}</td>
                                <td>{{ $row->m_name }}</td>
                                <td class="num">{{ $row->total }}</td>
                                <td>
                                    @if ($row->total > 0)
                                        <span class="status-pill is-completed">Available in stock</span>
                                    @else
                                        <span class="status-pill is-danger">Out of stock</span>
                                    @endif
                                </td>
                            </tr>
                        @else
                            @php($expired = $row->expdate <= $now)
                            <tr wire:key="med-{{ $row->id }}" class="lw-row {{ $expired ? 'row-danger' : '' }}" style="--i: {{ $loop->index }}">
                                <td class="num">{{ $row->id }}</td>
                                <td>{{ $row->name }}</td>
                                <td class="num">{{ $row->qty }}</td>
                                <td class="num">{{ $row->price }}</td>
                                <td class="num">{{ $row->reciptNo }}</td>
                                <td>{{ $row->bno }}</td>
                                <td class="num">{{ $row->expdate }}</td>
                                <td>{{ $row->manufactor }}</td>
                                <td>{{ $row->catagory }}</td>
                                <td>
                                    @if ($expired)
                                        <span class="status-pill is-danger">Already expired</span>
                                    @else
                                        <span class="status-pill is-completed">{{ $row->status }}</span>
                                    @endif
                                </td>
                                @if (Auth::user()->role == '3')
                                    <td class="text-right">
                                        <div class="dropdown dropdown-action">
                                            <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown"
                                                aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                                            <div class="dropdown-menu dropdown-menu-right">
                                                <a class="dropdown-item" href="{{ url('/edit-medicine', $row->id) }}">
                                                    <i class="fa fa-pencil m-r-5"></i> Edit
                                                </a>
                                                <a class="dropdown-item text-danger" href="#"
                                                    onclick="event.preventDefault(); clinicConfirm({title:'Delete {{ addslashes($row->name) }}?', text:'This medicine record will be permanently removed.', component:@this, method:'delete', params:[{{ $row->id }}]})">
                                                    <i class="fa fa-trash-o m-r-5"></i> Delete
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                @endif
                            </tr>
                        @endif
                    @empty
                        <tr>
                            <td colspan="{{ $catalogue ? 4 : (Auth::user()->role == '3' ? 11 : 10) }}">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-medkit"></i></div>
                                    <h5>No medicines found</h5>
                                    <p>{{ $search !== '' ? 'Try a different search term.' : 'Nothing to show here yet.' }}</p>
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
            th.sortable { cursor: pointer; user-select: none; white-space: nowrap; }
            tr.row-danger td { background: rgba(239, 79, 90, .06); }
            .lw-row { animation: fadeIn .3s var(--ease) backwards; animation-delay: calc(var(--i, 0) * .03s); }
            .table td.num { font-variant-numeric: tabular-nums; }
        </style>
    @endpush
</div>
