<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description"
        content="Dire Dawa University Clinic Center — a digital clinic management portal for student and staff healthcare: consultations, laboratory, pharmacy, records and staff administration.">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
    <title>Dire Dawa University Clinic Center | Clinic Management Portal</title>

    <!-- font awesome cdn link  -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <!-- custom css file link  -->
    <link rel="stylesheet" href="homepage/css/style.css">

</head>

<body>

    <!-- header section starts  -->

    <header class="header">

        <a href="#home" class="logo"> <i class="fas fa-heartbeat"></i> DDU Clinic Center </a>

        <nav class="navbar">
            <a href="#home">home</a>
            <a href="#services">services</a>
            <a href="#how">how it works</a>
            <a href="#about">about</a>
            <a href="#contact">contact</a>

            @if (Route::has('login'))
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn auth-btn">
                        Dashboard <span class="fas fa-gauge-high"></span>
                    </a>
                @else
                    <a href="{{ route('login') }}" class="btn auth-btn">
                        Login <span class="fas fa-user"></span>
                    </a>

                    @if (Route::has('register'))
                        <a href="{{ route('register') }}" class="btn auth-btn">
                            Register <span class="fas fa-sign-in-alt"></span>
                        </a>
                    @endif
                @endauth
            @endif
        </nav>

        <div id="menu-btn" class="fas fa-bars"></div>

    </header>

    <!-- header section ends -->

    <!-- home section starts  -->

    <section class="home" id="home">

        <div class="image">
            <img src="homepage/image/home-img.gif" alt="Healthcare illustration" width="100%">
        </div>

        <div class="content">
            <h3>your campus health, managed in one place</h3>
            <p>The Dire Dawa University Clinic Center portal brings consultations, laboratory results, pharmacy
                dispensing and medical records together — so students and staff get faster, safer care without the
                paperwork.</p>
            @if (Route::has('login'))
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn"> Go to dashboard <span class="fas fa-chevron-right"></span> </a>
                @else
                    <a href="{{ route('login') }}" class="btn"> Get started <span class="fas fa-chevron-right"></span> </a>
                @endauth
            @else
                <a href="#about" class="btn"> About us <span class="fas fa-chevron-right"></span> </a>
            @endif
        </div>

    </section>

    <!-- home section ends -->

    <!-- icons / stats section starts  -->

    <section class="icons-container" id="stats">

        <div class="icons">
            <i class="fas fa-hospital"></i>
            <h3>10+</h3>
            <p>clinical departments</p>
        </div>

        <div class="icons">
            <i class="fas fa-user-md"></i>
            <h3>8+</h3>
            <p>doctors &amp; clinicians</p>
        </div>

        <div class="icons">
            <i class="fas fa-notes-medical"></i>
            <h3>100%</h3>
            <p>digital patient records</p>
        </div>

        <div class="icons">
            <i class="fas fa-clock"></i>
            <h3>24/7</h3>
            <p>emergency &amp; ambulance</p>
        </div>

    </section>

    <!-- icons / stats section ends -->

    <!-- services section starts  -->

    <section class="services" id="services">

        <h1 class="heading"> our <span>services</span> </h1>
        <p class="section-intro">Every department in the clinic runs on the same connected portal, so a patient's
            journey flows smoothly from the front desk to consultation, lab, and pharmacy.</p>

        <div class="box-container">

            <div class="box">
                <i class="fas fa-stethoscope"></i>
                <h3>OPD &amp; general consultation</h3>
                <p>Walk-in and scheduled outpatient visits for students and staff. Clinicians review history,
                    examine, diagnose and prescribe — all recorded against the patient's digital file.</p>
            </div>

            <div class="box">
                <i class="fas fa-vials"></i>
                <h3>laboratory</h3>
                <p>Order blood work, microbiology and other diagnostic tests directly from a consultation. Results
                    are captured by test type and returned to the requesting clinician electronically.</p>
            </div>

            <div class="box">
                <i class="fas fa-pills"></i>
                <h3>pharmacy &amp; dispensing</h3>
                <p>Prescriptions reach the pharmacy instantly. Stock is tracked per item so medicines are dispensed
                    accurately and inventory stays up to date.</p>
            </div>

            <div class="box">
                <i class="fas fa-clipboard-list"></i>
                <h3>reception &amp; medical records</h3>
                <p>Register new patients, search existing files and route them to the right department. Every visit,
                    test and prescription is stored in one secure, searchable record.</p>
            </div>

            <div class="box">
                <i class="fas fa-users-cog"></i>
                <h3>staff &amp; HR administration</h3>
                <p>Manage employees, departments, education and work experience, leave requests and roles from a
                    single admin console built for the clinic team.</p>
            </div>

            <div class="box">
                <i class="fas fa-ambulance"></i>
                <h3>emergency &amp; ambulance</h3>
                <p>Round-the-clock emergency response with ambulance dispatch, so urgent campus cases are reached and
                    transported without delay.</p>
            </div>

        </div>

    </section>

    <!-- services section ends -->

    <!-- how it works section starts  -->

    <section class="how" id="how">

        <h1 class="heading"> how it <span>works</span> </h1>
        <p class="section-intro">From first visit to follow-up, the portal guides each patient through four simple
            steps.</p>

        <div class="steps-container">

            <div class="step">
                <div class="step-num"><i class="fas fa-user-plus"></i><span>1</span></div>
                <h3>register</h3>
                <p>Reception creates or opens the patient's record with their details and assigns the visit to a
                    department.</p>
            </div>

            <div class="step">
                <div class="step-num"><i class="fas fa-user-md"></i><span>2</span></div>
                <h3>consult</h3>
                <p>A clinician examines the patient, records findings and decides on tests or treatment.</p>
            </div>

            <div class="step">
                <div class="step-num"><i class="fas fa-flask"></i><span>3</span></div>
                <h3>lab &amp; pharmacy</h3>
                <p>Tests are processed in the lab and prescriptions are dispensed by the pharmacy, all linked to the
                    same visit.</p>
            </div>

            <div class="step">
                <div class="step-num"><i class="fas fa-folder-open"></i><span>4</span></div>
                <h3>records</h3>
                <p>Diagnoses, results and medicines are saved to the patient's history for safe, continuous care.</p>
            </div>

        </div>

    </section>

    <!-- how it works section ends -->

    <!-- about section starts  -->

    <section class="about" id="about">

        <h1 class="heading"> <span>about</span> the clinic </h1>

        <div class="row">

            <div class="image">
                <img src="homepage/image/about-img.gif" alt="Clinic care illustration">
            </div>

            <div class="content">
                <h3>caring for the university community</h3>
                <p>The Dire Dawa University Clinic Center provides accessible, on-campus healthcare for students,
                    teaching staff and administrative employees. Our mission is to keep the university community
                    healthy so everyone can focus on learning, teaching and research without medical worries.</p>
                <p>This portal digitises the clinic end to end — replacing paper files with secure electronic
                    records, connecting departments in real time, and giving staff the tools to deliver faster,
                    more reliable care.</p>
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn"> Open dashboard <span class="fas fa-chevron-right"></span> </a>
                @else
                    @if (Route::has('login'))
                        <a href="{{ route('login') }}" class="btn"> Sign in <span class="fas fa-chevron-right"></span> </a>
                    @endif
                @endauth
            </div>

        </div>

    </section>

    <!-- about section ends -->

    <!-- contact section starts  -->

    <section class="contact" id="contact">

        <h1 class="heading"> get in <span>touch</span> </h1>
        <p class="section-intro">Reach the clinic for appointments, records or general enquiries — or find us on
            campus.</p>

        <div class="contact-row">

            <div class="contact-info">

                <div class="info-box">
                    <i class="fas fa-phone"></i>
                    <div>
                        <h3>call us</h3>
                        <a href="tel:+251915151515">+251-915-15-15-15</a>
                    </div>
                </div>

                <div class="info-box">
                    <i class="fas fa-envelope"></i>
                    <div>
                        <h3>email</h3>
                        <a href="mailto:DDUClinic@gmail.com?subject=Clinic%20Enquiry">DDUClinic@gmail.com</a>
                    </div>
                </div>

                <div class="info-box">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <h3>location</h3>
                        <a target="_blank" rel="noopener"
                            href="https://www.google.com/maps/place/Dire-Dawa+University/@9.6207731,41.8392589,17z/data=!3m1!4b1!4m5!3m4!1s0x1630fdfc4d2e6799:0xc16b82af024c9388!8m2!3d9.6207678!4d41.8414476">
                            Dire Dawa University, Dire Dawa, Ethiopia</a>
                    </div>
                </div>

                <div class="info-box">
                    <i class="fas fa-clock"></i>
                    <div>
                        <h3>hours</h3>
                        <a href="#contact">Mon&ndash;Fri 8:00&ndash;17:00 &middot; Emergency 24/7</a>
                    </div>
                </div>

            </div>

            <div class="contact-map">
                <iframe
                    src="https://www.google.com/maps?q=Dire+Dawa+University&output=embed"
                    width="100%" height="100%" style="border:0;" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade" title="Dire Dawa University location"></iframe>
            </div>

        </div>

    </section>

    <!-- contact section ends -->

    <!-- footer section starts  -->

    <section class="footer">

        <div class="box-container">

            <div class="box">
                <h3>quick links</h3>
                <a href="#home"> <i class="fas fa-chevron-right"></i> home </a>
                <a href="#services"> <i class="fas fa-chevron-right"></i> services </a>
                <a href="#how"> <i class="fas fa-chevron-right"></i> how it works </a>
                <a href="#about"> <i class="fas fa-chevron-right"></i> about </a>
                <a href="#contact"> <i class="fas fa-chevron-right"></i> contact </a>
            </div>

            <div class="box">
                <h3>our services</h3>
                <a href="#services"> <i class="fas fa-chevron-right"></i> OPD consultation </a>
                <a href="#services"> <i class="fas fa-chevron-right"></i> laboratory </a>
                <a href="#services"> <i class="fas fa-chevron-right"></i> pharmacy </a>
                <a href="#services"> <i class="fas fa-chevron-right"></i> medical records </a>
                <a href="#services"> <i class="fas fa-chevron-right"></i> ambulance service </a>
            </div>

            <div class="box">
                <h3>contact info</h3>
                <a href="tel:+251915151515"> <i class="fas fa-phone"></i> +251-915-15-15-15 </a>
                <a href="mailto:DDUClinic@gmail.com?subject=Clinic%20Enquiry"> <i class="fas fa-envelope"></i>
                    DDUClinic@gmail.com </a>
                <a target="_blank" rel="noopener"
                    href="https://www.google.com/maps/place/Dire-Dawa+University/@9.6207731,41.8392589,17z/data=!3m1!4b1!4m5!3m4!1s0x1630fdfc4d2e6799:0xc16b82af024c9388!8m2!3d9.6207678!4d41.8414476">
                    <i class="fas fa-map-marker-alt"></i> Dire Dawa, Ethiopia </a>
            </div>

            <div class="box">
                <h3>portal</h3>
                @if (Route::has('login'))
                    @auth
                        <a href="{{ url('/dashboard') }}"> <i class="fas fa-gauge-high"></i> dashboard </a>
                    @else
                        <a href="{{ route('login') }}"> <i class="fas fa-user"></i> login </a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}"> <i class="fas fa-sign-in-alt"></i> register </a>
                        @endif
                    @endauth
                @endif
                <a target="_blank" rel="noopener" href="https://www.facebook.com/dire.dawa.university">
                    <i class="fab fa-facebook-f"></i> facebook </a>
            </div>

        </div>

        <div class="credit"> &copy; {{ date('Y') }} Dire Dawa University Clinic Center &middot; built by
            <span>Computer Science Students</span> | all rights reserved
        </div>

    </section>

    <!-- footer section ends -->

    <!-- custom js file link  -->
    <script src="homepage/js/script.js"></script>

</body>

</html>
