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

                {{-- <li>
                    <a href="appointments.html"><i class="fa fa-calendar"></i> <span>Appointments</span></a>
                </li> --}}

                {{-- <li>
                    <a href="schedule.html"><i class="fa fa-calendar-check-o"></i> <span>Doctors
                            Schedule</span></a>
                </li> --}}
                <li>
                    <a href="/view-departement"><i class="fa fa-hospital-o"></i> <span>Departments</span></a>
                </li>
                <li class="submenu">
                    <a href=""><i class="fa fa-user"></i> <span> Employees Management</span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="{{ url('/employeeList') }}">Employees List</a></li>
                        <li><a href="view-edu-exp">Education Information List</a></li>
                        <li><a href="view-work-exp">Work Experiance List</a></li>
                        <li><a href="view-leave-request">Leaves</a></li>

                        {{-- <li><a href="holidays.html">Holidays</a></li>
                        <li><a href="attendance.html">Attendance</a></li> --}}
                    </ul>
                </li>
                <li class="submenu">
                    <a href="/view_all_drugs"><i class="fa fa-money"></i> <span> Pharmacy Management </span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">

                        {{-- <li><a href="">Drugs Record</a></li> --}}
                        <li><a href="/view_all_drugs">All Drugs List</a></li>
                        <li><a href="/view_instock_drugs">InStock Drugs</a></li>
                        <li><a href="/view_outstock_drugs">Out of Stock Drugs</a></li>
                        <li><a href="/view_expired_drugs">Exprired Drugs</a></li>
                        <li><a href="/pharmacist">View Pharmacists</a></li>
                        {{-- <li><a href="taxes.html">Taxes</a></li>
                        <li><a href="provident-fund.html">Provident Fund</a></li> --}}
                    </ul>
                </li>
                <li class="submenu">
                    <a href="/view_all_tests"><i class="fa fa-book"></i> <span> Manage Laboratory </span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="/add_lab_test"> Add Lab Test Types </a></li>
                        <li><a href="/view_all_tests"> List All Test Types </a></li>
                        <li><a href="/labratorist"> View Labratorists </a></li>
                    </ul>
                </li>


                </li>


                </li>
                <li class="submenu">
                    <a href="/view-all-item"><i class="fa fa-cube"></i> <span> Property Management </span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="/add-new-item"> Add new Property </a></li>
                        <li><a href="/view-all-item"> List All Property </a></li>
                        <li><a href="/view-all-recorded-item"> List All items Record</a></li>
                        <li><a href="/view_all_assined_items"> List All Assined Items</a></li>
                        {{-- <li><a href="/view_labratoriest"> View Labratorists </a></li> --}}
                    </ul>
                </li>


                </li>

                {{-- <li>
                    <a href="activities.html"><i class="fa fa-bell-o"></i> <span>Activities</span></a>
                </li> --}}


                <!-- <li class="submenu">
                    <a href="#"><i class="fa fa-flag-o"></i> <span> Reports </span> <span
                            class="menu-arrow"></span></a>
                    <ul style="display: none;">
                        <li><a href="expense-reports.html"> Monthly Report </a></li>
                        <li><a href="invoice-reports.html"> Custom Report </a></li>
                    </ul>
                </li> -->



            </ul>
        </div>
    </div>
</div>
