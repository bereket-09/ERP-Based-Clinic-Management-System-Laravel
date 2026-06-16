<div class="sidebar" id="sidebar">
    <div class="sidebar-inner slimscroll">
        <div id="sidebar-menu" class="sidebar-menu">
            <ul>
                <li class="menu-title">Main</li>
                <li class="active">
                    <a href="/home"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a>
                </li>
                <li>
                    <a href="/doctors"><i class="fa fa-user-md"></i> <span>Doctors</span></a>
                </li>
                <li>
                    <a href="all_patients"><i class="fa fa-wheelchair"></i> <span>Patients</span></a>
                </li>
                <li>
                    <a href="/view-departement"><i class="fa fa-hospital-o"></i> <span>Departments</span></a>
                </li>

                <li class="menu-title">Management</li>
                <li class="submenu">
                    <a href="#"><i class="fa fa-users"></i> <span>Employees</span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="{{ url('/employeeList') }}">All Employees</a></li>
                        <li><a href="view-edu-exp">Education</a></li>
                        <li><a href="view-work-exp">Work Experience</a></li>
                        <li><a href="view-leave-request">Leave Requests</a></li>
                    </ul>
                </li>
                <li class="submenu">
                    <a href="/view_all_drugs"><i class="fa fa-medkit"></i> <span>Pharmacy</span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="/add_medicine">Add Medicine</a></li>
                        <li><a href="/view_all_drugs">All Drugs</a></li>
                        <li><a href="/view_instock_drugs">In Stock</a></li>
                        <li><a href="/view_outstock_drugs">Out of Stock</a></li>
                        <li><a href="/view_expired_drugs">Expired Drugs</a></li>
                        <li><a href="/pharmacist">Pharmacists</a></li>
                    </ul>
                </li>
                <li class="submenu">
                    <a href="/view_all_tests"><i class="fa fa-flask"></i> <span>Laboratory</span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="/add_lab_test">Add Test Type</a></li>
                        <li><a href="/view_all_tests">All Test Types</a></li>
                        <li><a href="/labratorist">Labratorists</a></li>
                    </ul>
                </li>
                <li class="submenu">
                    <a href="/view-all-item"><i class="fa fa-cube"></i> <span>Property</span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="/add-new-item">Add Property</a></li>
                        <li><a href="/view-all-item">All Property</a></li>
                        <li><a href="/view-all-recorded-item">Item Records</a></li>
                        <li><a href="/view_all_assined_items">Assigned Items</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>
