<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
    <title>Dire Dawa University Clinic Management System </title>

    <!-- font awesome cdn link  -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <!-- custom css file link  -->
    <link rel="stylesheet" href="homepage/css/style.css">

</head>

<body>

    <!-- header section starts  -->

    <header class="header">

        <a href="#" class="logo"> <i class="fas fa-heartbeat"></i> DDU Clinic Center </a>

        <nav class="navbar">
            <a href="#home">home</a>
            <a href="#services">services</a>
            <a href="#about">about</a>
            {{-- <a href="#doctors">doctors</a> --}}
            <a href="#book">book</a>
            {{-- <a href="#review">review</a>
        <a href="#blogs">blogs</a> --}}
            @if (Route::has('login'))

                @auth
                    <a href="{{ url('/dashboard') }}" class="auth">Dashboard</a>
                @else
                    {{-- <a href="{{ route('login') }}" class="btn" >Log in</a> --}}
                    <a href="{{ route('login') }}" class="btn" style="color:#444; font-size: 12px"> LOGIN <span
                            class="fas fa-user"></span> </a>

                    @if (Route::has('register'))
                        {{-- <a href="{{ route('register') }}" class="authh">Register</a> --}}
                        <a href="{{ route('register') }}" class="btn" style="color:#444;font-size: 12px">
                            Register <span class="fas fa-sign-in-alt"></span> </a>
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
            <img src="homepage/image/home-img.gif" alt="" width="100%">
        </div>

        <div class="content">
            <h3>stay safe, stay healthy</h3>
            <p>Dire Dawa University Clinic Center Provides a service for you to protect your self and stay healthy .</p>
            <a href="#about" class="btn"> About us <span class="fas fa-chevron-right"></span> </a>
        </div>

    </section>

    <!-- home section ends -->

    <!-- icons section starts  -->

    <section class="icons-container">

        <div class="icons">
            <i class="fas fa-user-md"></i>
            <h3>8+</h3>
            <p>doctors at work</p>
        </div>

        <div class="icons">
            <i class="fas fa-users"></i>
            <h3>1040+</h3>
            <p>satisfied patients</p>
        </div>

        <div class="icons">
            <i class="fas fa-ambulance"></i>
            <h3>2+</h3>
            <p>Ambulance</p>
        </div>

        <div class="icons">
            <i class="fas fa-hospital"></i>
            <h3>10+</h3>
            <p>available Departements</p>
        </div>

    </section>

    <!-- icons section ends -->

    <!-- services section starts  -->

    <section class="services" id="services">

        <h1 class="heading"> our <span>services</span> </h1>

        <div class="box-container">

            <div class="box">
                <i class="fas fa-notes-medical"></i>
                <h3>free checkups</h3>
                <p>Free OPD checkups of studnets </p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>

            <div class="box">
                <i class="fas fa-ambulance"></i>
                <h3>24/7 ambulance</h3>
                <p>Our Ambulances are ready for 24/7.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>

            <div class="box">
                <i class="fas fa-user-md"></i>
                <h3>expert doctors</h3>
                <p>Our Doctor staffs are highly skilled professionals with many years of working experiance.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>

            <div class="box">
                <i class="fas fa-pills"></i>
                <h3>medicines</h3>
                <p>Along side free check up or clinic provides free medicines for our users.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>

            <div class="box">
                <i class="fas fa-procedures"></i>
                <h3>bed facility</h3>
                <p>Our Clinic also have a bed facility for patinets.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>

            <div class="box">
                <i class="fas fa-heartbeat"></i>
                <h3>total care</h3>
                <p>Our nurses and doctors provide a total care for our patients.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>

        </div>

    </section>

    <!-- services section ends -->

    <!-- about section starts  -->

    <section class="about" id="about">

        <h1 class="heading"> <span>about</span> us </h1>

        <div class="row">

            <div class="image">
                <img src="homepage/image/about-img.gif" alt="">
            </div>

            <div class="content">
                <h3>we take care of your healthy life</h3>
                <p>Our goal is to provide our students with a safe and health enviroment where they can pursue there
                    dreams without any medical obstacles and be there for them when something occures.
                </p>
                {{-- <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Natus vero ipsam laborum porro voluptates
                    voluptatibus a nihil temporibus deserunt vel?</p> --}}
                <a href="login" class="btn"> Lets Start! <span class="fas fa-chevron-right"></span> </a>
            </div>

        </div>

    </section>

    <!-- about section ends -->

    <!-- doctors section starts  -->

    {{-- <section class="doctors" id="doctors">

        <h1 class="heading"> our <span>doctors</span> </h1>

        <div class="box-container">

            <div class="box">
                <img src="homepage/image/doc-1.jpg" alt="">
                <h3>john deo 1</h3>
                <span>expert doctor</span>
                <div class="share">
                    <a href="#" class="fab fa-facebook-f"></a>
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-instagram"></a>
                    <a href="#" class="fab fa-linkedin"></a>
                </div>
            </div>

            <div class="box">
                <img src="homepage/image/doc-2.jpg" alt="">
                <h3>john deo 2</h3>
                <span>expert doctor</span>
                <div class="share">
                    <a href="#" class="fab fa-facebook-f"></a>
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-instagram"></a>
                    <a href="#" class="fab fa-linkedin"></a>
                </div>
            </div>

            <div class="box">
                <img src="homepage/image/doc-3.jpg" alt="">
                <h3>john deo 3</h3>
                <span>expert doctor</span>
                <div class="share">
                    <a href="#" class="fab fa-facebook-f"></a>
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-instagram"></a>
                    <a href="#" class="fab fa-linkedin"></a>
                </div>
            </div>

            <div class="box">
                <img src="homepage/image/doc-4.jpg" alt="">
                <h3>john deo</h3>
                <span>expert doctor</span>
                <div class="share">
                    <a href="#" class="fab fa-facebook-f"></a>
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-instagram"></a>
                    <a href="#" class="fab fa-linkedin"></a>
                </div>
            </div>

            <div class="box">
                <img src="homepage/image/doc-5.jpg" alt="">
                <h3>john deo</h3>
                <span>expert doctor</span>
                <div class="share">
                    <a href="#" class="fab fa-facebook-f"></a>
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-instagram"></a>
                    <a href="#" class="fab fa-linkedin"></a>
                </div>
            </div>

            <div class="box">
                <img src="homepage/image/doc-6.jpg" alt="">
                <h3>john deo</h3>
                <span>expert doctor</span>
                <div class="share">
                    <a href="#" class="fab fa-facebook-f"></a>
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-instagram"></a>
                    <a href="#" class="fab fa-linkedin"></a>
                </div>
            </div>

        </div>

    </section> --}}

    <!-- doctors section ends -->

    <!-- booking section starts   -->

    {{-- <section class="book" id="book">

        <h1 class="heading"> <span>book</span> now </h1>

        <div class="row">

            <div class="image">
                <img src="homepage/image/book-img.gif" alt="" height="500px" width="10px">
            </div>


            <h1>we take care of your healthy life</h1>
        </div>

    </section> --}}

    <!-- booking section ends -->
    {{-- <!-- review section starts  -->

<section class="review" id="review">
    
    <h1 class="heading"> client's <span>review</span> </h1>

    <div class="box-container">

        <div class="box">
            <img src="homepage/image/pic-1.png" alt="">
            <h3>john deo</h3>
            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
            </div>
            <p class="text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam sapiente nihil aperiam? Repellat sequi nisi aliquid perspiciatis libero nobis rem numquam nesciunt alias sapiente minus voluptatem, reiciendis consequuntur optio dolorem!</p>
        </div>

        <div class="box">
            <img src="homepage/image/pic-2.png" alt="">
            <h3>john deo</h3>
            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
            </div>
            <p class="text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam sapiente nihil aperiam? Repellat sequi nisi aliquid perspiciatis libero nobis rem numquam nesciunt alias sapiente minus voluptatem, reiciendis consequuntur optio dolorem!</p>
        </div>

        <div class="box">
            <img src="homepage/image/pic-3.png" alt="">
            <h3>john deo</h3>
            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
            </div>
            <p class="text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam sapiente nihil aperiam? Repellat sequi nisi aliquid perspiciatis libero nobis rem numquam nesciunt alias sapiente minus voluptatem, reiciendis consequuntur optio dolorem!</p>
        </div>

    </div>

</section>

<!-- review section ends --> --}}



    {{-- <!-- blogs section starts  -->

<section class="blogs" id="blogs">

    <h1 class="heading"> our <span>blogs</span> </h1>

    <div class="box-container">

        <div class="box">
            <div class="image">
                <img src="homepage/image/blog-1.jpg" alt="">
            </div>
            <div class="content">
                <div class="icon">
                    <a href="#"> <i class="fas fa-calendar"></i> 1st may, 2021 </a>
                    <a href="#"> <i class="fas fa-user"></i> by admin </a>
                </div>
                <h3>blog title goes here</h3>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident, eius.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>
        </div>

        <div class="box">
            <div class="image">
                <img src="homepage/image/blog-2.jpg" alt="">
            </div>
            <div class="content">
                <div class="icon">
                    <a href="#"> <i class="fas fa-calendar"></i> 1st may, 2021 </a>
                    <a href="#"> <i class="fas fa-user"></i> by admin </a>
                </div>
                <h3>blog title goes here</h3>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident, eius.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>
        </div>

        <div class="box">
            <div class="image">
                <img src="homepage/image/blog-3.jpg" alt="">
            </div>
            <div class="content">
                <div class="icon">
                    <a href="#"> <i class="fas fa-calendar"></i> 1st may, 2021 </a>
                    <a href="#"> <i class="fas fa-user"></i> by admin </a>
                </div>
                <h3>blog title goes here</h3>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident, eius.</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>
        </div>

    </div>

</section>

<!-- blogs section ends --> --}}

    <!-- footer section starts  -->

    <section class="footer">

        <div class="box-container">

            <div class="box">
                <h3>quick links</h3>
                <a href="#"> <i class="fas fa-chevron-right"></i> home </a>
                <a href="#"> <i class="fas fa-chevron-right"></i> services </a>
                <a href="#"> <i class="fas fa-chevron-right"></i> about </a>
                {{-- <a href="#"> <i class="fas fa-chevron-right"></i> doctors </a> --}}
                {{-- <a href="#"> <i class="fas fa-chevron-right"></i> book </a> --}}
                {{-- <a href="#"> <i class="fas fa-chevron-right"></i> review </a> --}}
                {{-- <a href="#"> <i class="fas fa-chevron-right"></i> blogs </a> --}}
            </div>

            <div class="box">
                <h3>our services</h3>
                <a href="#"> <i class="fas fa-chevron-right"></i> dental care </a>
                <a href="#"> <i class="fas fa-chevron-right"></i> message therapy </a>
                <a href="#"> <i class="fas fa-chevron-right"></i> cardioloty </a>
                <a href="#"> <i class="fas fa-chevron-right"></i> diagnosis </a>
                <a href="#"> <i class="fas fa-chevron-right"></i> ambulance service </a>
            </div>

            <div class="box">
                <h3>contact info</h3>
                <a href="#"> <i class="fas fa-phone"></i> +251-915-15-15-15 </a>
                {{-- <a href="#"> <i class="fas fa-phone"></i> +111-222-3333 </a> --}}
                <a href=mailto:DDUClinic@gmail.com?subject="Contact"> <i
                        class="fas fa-envelope"></i>DDUClinic@gmail.com</a>
                {{-- <a href="#"> <i class="fas fa-envelope"></i> anasbhai@gmail.com </a> --}}
                <a
                    href="https://www.google.com/maps/place/Dire-Dawa+University/@9.6207731,41.8392589,17z/data=!3m1!4b1!4m5!3m4!1s0x1630fdfc4d2e6799:0xc16b82af024c9388!8m2!3d9.6207678!4d41.8414476">
                    <i class="fas fa-map-marker-alt"></i> Dire Dawa, Ethiopia </a>
            </div>

            <div class="box">
                <h3>follow us</h3>
                <a href="www.facebook.com/dire.dawa.university"> <i class="fab fa-facebook-f"></i> facebook </a>
                {{-- <a href="#"> <i class="fab fa-twitter"></i> twitter </a> --}}
                {{-- <a href="#"> <i class="fab fa-twitter"></i> twitter </a>
                <a href="#"> <i class="fab fa-instagram"></i> instagram </a>
                <a href="#"> <i class="fab fa-linkedin"></i> linkedin </a>
                <a href="#"> <i class="fab fa-pinterest"></i> pinterest </a> --}}
            </div>

        </div>

        <div class="credit"> created by <span>Computer Science 4th Year Students</span> | all rights reserved
        </div>

    </section>

    <!-- footer section ends -->


















    <!-- custom js file link  -->
    <script src="homepage/js/script.js"></script>

</body>

</html>
