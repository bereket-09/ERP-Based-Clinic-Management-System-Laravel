<div class="sidebar" id="sidebar">
    <div class="sidebar-inner slimscroll">
        <div id="sidebar-menu" class="sidebar-menu">
            <ul>
                <li class="menu-title">Main</li>
                <li class="active">
                    <a href="/home"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a>
                </li>

                <li class="submenu">
                    <a href="/view_orderd_drugs" class="subdrop"><i class="fa fa-hospital-o"></i> <span>Ordered Medicines</span>
                        <span class="menu-arrow"></span></a>
                    <ul style="display: block;">
                        <li><a href="/view_orderd_drugs">Ordered Drugs
                            @if ((($navCounts['drugNew'] ?? 0) + ($navCounts['drugPending'] ?? 0)) > 0)<span class="nav-badge">{{ ($navCounts['drugNew'] ?? 0) + ($navCounts['drugPending'] ?? 0) }}</span>@endif</a></li>
                        <li><a href="/view_completed_drug_orders">Completed Drug Orders</a></li>
                    </ul>
                </li>

                <li class="submenu">
                    <a href="/view_all_drugs"><i class="fa fa-book"></i> <span>Pharmacy's Store</span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="/add_medicine">Add new Drug</a></li>
                        <li><a href="/view_instock_drugs">In-Stock Drugs</a></li>
                        <li><a href="/view_outstock_drugs">Out-of-Stock Drugs</a></li>
                        <li><a href="/view_expired_drugs">Expiring Drugs</a></li>
                        <li><a href="/view_all_drugs">All Drugs Record</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>
