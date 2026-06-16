<div class="sidebar" id="sidebar">
    <div class="sidebar-inner slimscroll">
        <div id="sidebar-menu" class="sidebar-menu">
            <ul>
                <li class="menu-title">Main</li>
                <li class="active">
                    <a href="/home"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a>
                </li>

                <li class="submenu">
                    <a href="queued_patients" class="subdrop"><i class="fa fa-stethoscope"></i> <span>Patients</span>
                        <span class="menu-arrow"></span></a>
                    <ul style="display: block;">
                        <li><a href="queued_patients">Queued Patients
                            @if (($navCounts['queued'] ?? 0) > 0)<span class="nav-badge">{{ $navCounts['queued'] }}</span>@endif</a></li>
                        <li><a href="pending_patients">Pending Results</a></li>
                        <li><a href="lab_results_ready">Lab Results Ready
                            @if (($navCounts['labReady'] ?? 0) > 0)<span class="nav-badge">{{ $navCounts['labReady'] }}</span>@endif</a></li>
                        <li><a href="completed_visits">Completed Treatment</a></li>
                    </ul>
                </li>

                <li class="menu-title">Staff</li>
                <li>
                    <a href="/doctors"><i class="fa fa-user-md"></i> <span>Doctors</span></a>
                </li>
                <li>
                    <a href="/labratorist"><i class="fa fa-flask"></i> <span>Labratorists</span></a>
                </li>
                <li>
                    <a href="/pharmacist"><i class="fa fa-medkit"></i> <span>Pharmacists</span></a>
                </li>
                <li>
                    <a href="view-departement"><i class="fa fa-hospital-o"></i> <span>Departement</span></a>
                </li>
            </ul>
        </div>
    </div>
</div>
