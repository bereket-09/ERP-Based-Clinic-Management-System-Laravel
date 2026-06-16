<div class="sidebar" id="sidebar">
    <div class="sidebar-inner slimscroll">
        <div id="sidebar-menu" class="sidebar-menu">
            <ul>
                <li class="menu-title">Main</li>
                <li class="active">
                    <a href="/home"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a>
                </li>

                <li class="submenu">
                    <a href="/queued_patients" class="subdrop"><i class="fa fa-stethoscope"></i> <span>Patients</span>
                        <span class="menu-arrow"></span></a>
                    <ul style="display: block;">
                        <li><a href="/queued_patients">Queued Patients
                            @if (($navCounts['queued'] ?? 0) > 0)<span class="nav-badge">{{ $navCounts['queued'] }}</span>@endif</a></li>
                        <li><a href="/all_patients">All Patients</a></li>
                    </ul>
                </li>
                <li>
                    <a href="/doctors"><i class="fa fa-user-md"></i> <span>Doctors</span></a>
                </li>
                <li>
                    <a href="/labratorist"><i class="fa fa-user-o"></i> <span>Labratorists</span></a>
                </li>
                <li>
                    <a href="/pharmacist"><i class="fa fa-user-o"></i> <span>Pharmacists</span></a>
                </li>
                <li>
                    <a href="view-departement"><i class="fa fa-calendar"></i> <span>Departement</span></a>
                </li>
            </ul>
        </div>
    </div>
</div>
