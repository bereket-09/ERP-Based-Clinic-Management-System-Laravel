<div class="sidebar" id="sidebar">
    <div class="sidebar-inner slimscroll">
        <div id="sidebar-menu" class="sidebar-menu">
            <ul>
                <li class="menu-title">Main</li>
                <li class="active">
                    <a href="/home"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a>
                </li>

                <li class="submenu">
                    <a href="/view_lab_order" class="subdrop"><i class="fa fa-stethoscope"></i> <span>Lab Tests</span>
                        <span class="menu-arrow"></span></a>
                    <ul style="display: block;">
                        <li><a href="/view_lab_order">Ordered Tests
                            @if (($navCounts['labQueue'] ?? 0) > 0)<span class="nav-badge">{{ $navCounts['labQueue'] }}</span>@endif</a></li>
                        <li><a href="/view_pending_lab_results">Pending Results
                            @if (($navCounts['labPending'] ?? 0) > 0)<span class="nav-badge">{{ $navCounts['labPending'] }}</span>@endif</a></li>
                        <li><a href="/view_completed_lab_results">Completed Tests</a></li>
                    </ul>
                </li>

                <li>
                    <a href="/view_all_tests"><i class="fa fa-flask"></i> <span>Test Types</span></a>
                </li>
            </ul>
        </div>
    </div>
</div>
